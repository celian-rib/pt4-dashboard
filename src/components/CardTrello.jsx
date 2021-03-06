import React, { useEffect, useMemo, useState } from 'react';
import '../stylesheets/trelloCard.css';
import ToolTips from './ToolTip';

import trello from '../trello';
import { useGlobal } from 'reactn';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

import { toast } from 'react-toastify';

const dateFormat = {
  weekday: 'long',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
};


const colors = {
  red: '#ed7979',
  blue: '#79b3ed',
  green: '#60ad5a',
  lime: '#51b0a3',
  black: '#223331',
  pink: '#c88cde',
  orange: '#e69b63',
};

function CardTrello(props) {
  const {
    cardData,
    showStats,
    showHourlyCostEstimation,
    addLeadTime,
    addTotalHourlyCost,
    addTotalEstimatedHourlyCost
  } = props;

  const [user] = useGlobal('user');
  const [db] = useGlobal('firebase');

  const [estimatedHourlyCost, setEstimatedHourlyCost] = useState(undefined);
  const [hourlyCost, setHourlyCost] = useState(undefined);
  const [init, setInit] = useState(false);
  const [hardEndDate, setHardEndDate] = useState(undefined);


  useEffect(() => {
    if (cardData == undefined || init == false)
      return;
    if (user == undefined)
      return;
    const cardsRef = collection(db, 'cards');
    setDoc(doc(cardsRef, cardData.id), {
      name: cardData.name,
      isDone: isDone,
      creationDate: creationDate,
      startDate: startDate ?? null,
      doneDate: doneDate ?? null,
      leadtime: leadtime ?? null,
      hourlyCost: hourlyCost ?? null,
      estimatedHourlyCost: estimatedHourlyCost ?? null,
      hardEndDate: cardData.hardEndDate ?? null
    });
    console.log('Updating', cardData.name, cardData.id);
  }, [init, hourlyCost, estimatedHourlyCost]);

  useEffect(() => {
    if (cardData == undefined)
      return;
    const cardsRef = collection(db, 'cards');
    getDoc(doc(cardsRef, cardData.id)).then(fbData => {
      const data = fbData.data();

      if (data == undefined) {
        console.log('Card not in DB', cardData.name);
        setInit(true);
        return;
      }

      setEstimatedHourlyCost(data.estimatedHourlyCost);
      setHourlyCost(data.hourlyCost);

      if (data.hardEndDate) {
        console.log(data.hardEndDate);
        setHardEndDate(new Date(data.hardEndDate));
      }

      if (data.isDone && !init) {
        addTotalEstimatedHourlyCost(parseFloat(data.estimatedHourlyCost ?? 0));
        addTotalHourlyCost(parseFloat(data.hourlyCost ?? 0));
      }

      setInit(true);
    });
  }, [cardData, user]);

  const cardIssue = useMemo(() => {
    const errorStyle = { borderColor: '#ff78a9', borderWidth: 4, borderStyle: 'solid' };
    if (cardData?.idList === trello.DONE_LIST_ID && (estimatedHourlyCost == null || hourlyCost == null))
      return ['Information sur les horaires manquante(s)', errorStyle];
    if (cardData?.idList === trello.IN_PROGRESS_LIST_ID && estimatedHourlyCost == null)
      return ['Estimation du temps de r??alisation manquante', errorStyle];
    if (cardData?.members.length === 0)
      return ['Aucun membre n\'est affect?? ?? cette carte', { borderColor: '#3e8ccc', borderWidth: 4, borderStyle: 'solid' }];
    return [undefined, undefined];
  }, [cardData, estimatedHourlyCost, hourlyCost]);

  const isDone = useMemo(() => {
    return cardData?.actions[0]?.data?.listAfter?.id === trello.DONE_LIST_ID;
  }, [cardData?.actions]);

  const doneDate = useMemo(() => {
    if (!isDone)
      return undefined;
    return new Date(cardData?.actions[0]?.date);
  }, [cardData?.actions, hardEndDate]);

  const creationDate = useMemo(() => {
    return new Date(parseInt(cardData.id.slice(0, 8), 16) * 1000);
  }, [cardData]);

  const startDate = useMemo(() => {
    const action = cardData?.actions.find(a => a.data?.listAfter?.id === trello.IN_PROGRESS_LIST_ID);
    if (action == undefined)
      return undefined;
    return new Date(action.date);
  }, [cardData?.actions]);

  const leadtime = useMemo(() => {
    const diff = doneDate - startDate;
    if (Number.isNaN(diff))
      return undefined;
    return Math.ceil(diff / 36e5);
  }, [doneDate, startDate]);

  const getLeadTimeStr = () => {
    if (leadtime == undefined)
      return;
    if (leadtime < 72)
      return `${leadtime} heures`;
    const days = (leadtime / 24).toFixed(2);
    return `${days} jours`;
  };

  useEffect(() => {
    if (leadtime != undefined)
      addLeadTime(leadtime);
  }, [leadtime]);

  const changeHourlyCost = () => {
    const nbHour = prompt('Entrer nombre d\'heures r??alis??es');
    if (Number.isNaN(nbHour))
      return;
    if (hourlyCost > 0 && cardData?.isDone)
      addTotalHourlyCost(nbHour - hourlyCost); // Add change to total
    setHourlyCost(nbHour);
    toast.success('T??che mise ?? jour !');
  };

  const changeEstimatedHourlyCost = () => {
    const nbHour = prompt('Estimation du temps demand?? par cette t??che');
    if (Number.isNaN(nbHour))
      return;
    if (estimatedHourlyCost > 0 && cardData?.isDone)
      addTotalEstimatedHourlyCost(nbHour - estimatedHourlyCost); // Add change to total
    setEstimatedHourlyCost(nbHour);
    toast.success('T??che mise ?? jour !');
  };

  return (
    <div onClick={() => console.log(cardData)} className="trello-card" style={cardIssue[1]}>
      {cardIssue[0] != undefined && (<ToolTips text={cardIssue[0]} />)}
      <div className='container label-container'>
        {cardData.labels.map((label, index) => (
          <p className='card-label' style={{ backgroundColor: colors[label.color] ?? label.color }} key={index}>{label.name}</p>
        ))}
      </div>
      <div className='main-info-container'>
        <a target="_blank" href={cardData.shortUrl} rel="noreferrer">{cardData.name}</a>
        {showStats != undefined && (
          <div className='card-info-slot'>
            <p><span>Date de d??but : </span>{startDate?.toLocaleString('FR', dateFormat) ?? 'Non connue'}</p>
            <p><span>Date de fin : </span>{doneDate?.toLocaleString('FR', dateFormat) ?? 'Non connue'}</p>
            <p><span>Leadtime : </span>{getLeadTimeStr() ?? '--'}</p>
          </div>
        )}
        {showHourlyCostEstimation != undefined && (
          <div className='card-info-slot'>
            <p onClick={() => user != undefined && changeEstimatedHourlyCost()} style={{ marginTop: 0 }}><span>Temps estim?? : </span>{estimatedHourlyCost ?? '-- '}h
              {user != undefined && (
                <img src={require('../assets/editing.png')} className='edit-button' />
              )}
            </p>
            {showStats && (
              <p onClick={() => user != undefined && changeHourlyCost()} style={{ marginTop: 0 }}><span>Co??t horaire : </span>{hourlyCost ?? '-- '}h
                {user != undefined && (
                  <img src={require('../assets/editing.png')} className='edit-button' />
                )}
              </p>
            )}
          </div>
        )}
      </div>
      <div className='container member-container'>
        {cardData.members.map((m, index) => (
          <p className='member' key={index}>{m.fullName}</p>
        ))}
      </div>
    </div>
  );
}

export default CardTrello;

import { useEffect, useMemo, useState } from 'react';
import '../stylesheets/trelloCard.css';
import ToolTips from './ToolTip';

import trello from '../trello';
import { useGlobal } from 'reactn';
import { collection, doc, setDoc, getDoc } from "firebase/firestore";

import { toast } from 'react-toastify';

const dateFormat = {
  weekday: "long",
  month: "long",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
};

const getColor = (colorName) => {
  switch (colorName) {
    case 'red':
      return '#ed7979'
    case 'blue':
      return '#79b3ed'
    case 'green':
      return '#60ad5a'
    case 'lime':
      return '#51b0a3'
    case 'black':
      return '#223331'
    case 'pink':
      return '#c88cde'
    case 'orange':
      return '#e69b63'
    default:
      return colorName
  }
}

function CardTrello(props) {
  const { cardData, showStats, showTimeInfos, actions = [] } = props;

  const [db] = useGlobal('firebase');
  const [estimatedHourlyCost, setEstimatedHourlyCost] = useState(undefined);
  const [hourlyCost, setHourlyCost] = useState(undefined);
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (cardData == undefined || init == false)
      return;
    const cardsRef = collection(db, "cards");
    setDoc(doc(cardsRef, cardData.id), {
      name: cardData.name,
      isDone: isDone,
      creationDate: creationDate,
      startDate: startDate ?? null,
      doneDate: doneDate ?? null,
      leadtime: leadtime ?? null,
      hourlyCost: hourlyCost ?? null,
      estimatedHourlyCost: estimatedHourlyCost ?? null
    });
  }, [init, hourlyCost, estimatedHourlyCost]);

  useEffect(() => {
    if (cardData == undefined)
      return;
    const cardsRef = collection(db, "cards");
    getDoc(doc(cardsRef, cardData.id)).then(fbData => {
      const data = fbData.data();
      setEstimatedHourlyCost(data.estimatedHourlyCost);
      setHourlyCost(data.hourlyCost);
      setInit(true);
    });
  }, [cardData]);

  const cardIssue = useMemo(() => {
    const errorStyle = { borderColor: '#d45950', borderWidth: 5, borderStyle: "solid" };
    if (cardData?.idList === trello.DONE_LIST_ID && (estimatedHourlyCost == null || hourlyCost == null))
      return ['Information sur les horaires manquante(s)', errorStyle];
    if (cardData?.idList === trello.IN_PROGRESS_LIST_ID && estimatedHourlyCost == null)
      return ['Estimation du temps de réalisation manquante', errorStyle];
    if (cardData?.members.length === 0)
      return ['Aucun membre n\'est affecté à cette carte', { borderColor: '#3e8ccc', borderWidth: 5, borderStyle: "solid" }]
    return [undefined, undefined]
  }, [cardData, estimatedHourlyCost, hourlyCost]);

  const isDone = useMemo(() => {
    return actions[0]?.data?.listAfter?.id === trello.DONE_LIST_ID
  }, [actions]);

  const doneDate = useMemo(() => {
    if (!isDone)
      return undefined;
    return new Date(actions[0]?.date)
  }, [actions])

  const creationDate = useMemo(() => {
    return new Date(parseInt(cardData.id.slice(0, 8), 16) * 1000)
  }, [cardData]);

  const startDate = useMemo(() => {
    const action = actions.find(a => a.data?.listAfter?.id === trello.IN_PROGRESS_LIST_ID);
    if (action == undefined)
      return undefined
    return new Date(action.date);
  }, [actions])

  const openCardInTrello = () => window.open(cardData.shortUrl);

  const leadtime = useMemo(() => {
    const diff = doneDate - startDate;
    if (Number.isNaN(diff))
      return undefined;
    const hours = Math.ceil(diff / 36e5);
    if (hours < 72)
      return `${hours} heures`;
    const days = (diff / (1000 * 60 * 60 * 24)).toFixed(2)
    return `${days} jours`;
  }, [doneDate, startDate]);

  const changeHourlyCost = () => {
    const nbHour = prompt('Entrer nombre d\'heures réalisées');
    if (Number.isNaN(nbHour))
      return;
    setHourlyCost(nbHour);
    toast.success('Tâche mise à jour !');
  }

  const changeEstimatedHourlyCost = () => {
    const nbHour = prompt('Estimation du temps demandé par cette tâche');
    if (Number.isNaN(nbHour))
      return;
    setEstimatedHourlyCost(nbHour);
    toast.success('Tâche mise à jour !');
  }

  return (
    <div className="trello-card" style={cardIssue[1]}>
      {cardIssue[0] != undefined && (<ToolTips text={cardIssue[0]} />)}
      <div className='container label-container'>
        {cardData.labels.map((label, index) => (
          <p className='card-label' style={{ backgroundColor: getColor(label.color) }} key={index}>{label.name}</p>
        ))}
      </div>
      <div className='main-info-container'>
        <a href={cardData.shortUrl}>{cardData.name}</a>
        {showStats != undefined && (
          <div className='card-info-slot'>
            <p><span>Date de début : </span>{startDate?.toLocaleString("FR", dateFormat) ?? 'Non connue'}</p>
            <p><span>Date de fin : </span>{doneDate?.toLocaleString("FR", dateFormat) ?? 'Non connue'}</p>
            <p><span>Leadtime : </span>{leadtime ?? '--'}</p>
          </div>
        )}
        {showTimeInfos != undefined && (
          <div className='card-info-slot'>
            {showStats && (
              <p onClick={changeHourlyCost} style={{ marginTop: 0 }}><span>Coût horaire : </span>{hourlyCost ?? '-- '}h
                <img src={require('../editing.png')} className='edit-button' />
              </p>
            )}
            <p onClick={changeEstimatedHourlyCost} style={{ marginTop: 0 }}><span>Temps estimé : </span>{estimatedHourlyCost ?? '-- '}h
              <img src={require('../editing.png')} className='edit-button' />
            </p>
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

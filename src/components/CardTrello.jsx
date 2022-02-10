import { useEffect, useMemo, useState } from 'react';
import '../stylesheets/trelloCard.css';
import ToolTips from './ToolTip';

import trello from '../trello';

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
  const { cardData, showStats, actions = [] } = props;

  const getIssueStyle = () => {
    if (cardData.members.length === 0)
      return { borderColor: '#3e8ccc', borderWidth: 5, borderStyle: "solid" }
  }

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

  return (
    <div onClick={openCardInTrello} className="trello-card" style={getIssueStyle()}>
      {cardData.members.length === 0 && (<ToolTips text={"Aucun membre n'est affecté à cette carte"} />)}
      <div className='container label-container'>
        {cardData.labels.map((label, index) => (
          <p className='card-label' style={{ backgroundColor: getColor(label.color) }} key={index}>{label.name}</p>
        ))}
      </div>
      <div className='main-info-container'>
        <p>{cardData.name}</p>
        {showStats != undefined && (
          <>
            <div className='card-info-slot'>
              <p><span>Date de début : </span>{startDate?.toLocaleString("FR") ?? 'Non connue'}</p>
              <p><span>Date de fin : </span>{doneDate?.toLocaleString("FR") ?? 'Non connue'}</p>
              <p><span>Leadtime : </span>{leadtime ?? '--'}</p>
            </div>
            <div className='card-info-slot'>
              <p style={{ marginTop: 0 }}><span>Côut horaire : </span>{9}</p>
              <p style={{ marginTop: 0 }}><span>Estimé : </span>{8}h</p>
            </div>
          </>
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

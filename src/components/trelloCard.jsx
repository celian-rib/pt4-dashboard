import { useEffect, useState } from 'react';
import '../stylesheets/trelloCard.css';
import ToolTips from './ToolTip';

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
function TrelloCard(props) {
  const { cardData, leadTime, actions = [] } = props;

  const getIssueStyle = () => {
    if (cardData.members.length === 0)
      return { borderColor: '#3e8ccc', borderWidth: 5, borderStyle: "solid" }
  }

  const isDone = () => actions[0]?.data?.listAfter?.id === '61fa5d8218aebf5547986dc1';

  const getDoneDate = () => {
    if (!isDone())
      return undefined;
    return new Date(actions[0]?.date).toLocaleString()
  }

  const openCardInTrello = () => {
    console.log(cardData);
    window.open(cardData.shortUrl);
  }

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
        {leadTime != undefined && (
          <>
            <p><span>Date de fin : </span>{getDoneDate() ?? 'Non connue'}</p>
            <p><span>Leadtime : </span>{leadTime}h</p>
            <p style={{ marginTop: 0 }}><span>Estimé : </span>{leadTime}h</p>
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

export default TrelloCard;

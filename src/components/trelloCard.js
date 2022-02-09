import { useEffect, useState } from 'react';
import '../stylesheets/trelloCard.css';

function TrelloCard(props) {
  const { cardData, leadTime } = props;

  const getIssueStyle = () => {
    if (cardData.members.length == 0)
      return { borderColor: '#3e8ccc', borderWidth: 5, borderStyle: "solid" }
  }

  return (
    <div className="trello-card" style={getIssueStyle()}>
      <div className='container label-container'>
        {cardData.labels.map((label, index) => (
          <p className='card-label' style={{ backgroundColor: label.color }} key={index}>{label.name}</p>
        ))}
      </div>
      <div className='main-info-container'>
        {leadTime != undefined && (
          <>
            <p><span>Leadtime : </span>{leadTime}h</p>
            <p style={{marginTop: 0}}><span>Estimé : </span>{leadTime}h</p>
          </>
        )}
        <p>{cardData.name}</p>
      </div>
      <div className='container member-container'>
        {cardData.members.map((m, index) => (
          <p className='member' key={index}>{m.fullName}</p>
        ))}
      </div>
    </div >
  );
}

export default TrelloCard;

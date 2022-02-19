import React, { useState } from 'react';
import { useGlobal } from 'reactn';
import '../stylesheets/meetingCard.css';

const dateFormat = {
  weekday: 'long',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
};

function MeetingCard(props) {

  const [user] = useGlobal('user');
  const { meetingData, onSave, onDelete } = props;

  const [showSave, setShowSave] = useState(false);
  const [showDelete, setShowDelete] = useState(meetingData?.content?.length == 0);

  const onChange = (newContent) => {
    setShowSave(newContent != meetingData.content);
    meetingData.content = newContent;
    setShowDelete(newContent.length == 0);
  };

  const save = () => {
    onSave(meetingData);
    setShowSave(false);
  };

  return (
    <div className="meetingCard">
      <p>Réunion du {meetingData.date?.toLocaleString('FR', dateFormat) ?? 'Inconnue'}</p>
      <textarea disabled={user == null} onChange={e => onChange(e.target.value)} name="" defaultValue={meetingData.content}></textarea>
      <div>
        {(showSave && user != null) && (
          <p onClick={save}>Sauvegarder</p>
        )}
        {(showDelete && user != null) && (
          <p onClick={() => onDelete(meetingData)}>Supprimer</p>
        )}
      </div>
    </div >
  );
}

export default MeetingCard;

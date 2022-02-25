import React, { useState } from 'react';
import { useMemo } from 'react';
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
    meetingData.content = newContent;
    setShowDelete(newContent.length == 0);
  };

  const save = () => {
    onSave(meetingData);
    setShowSave(false);
  };

  const contentList = useMemo(() => meetingData.content.split('-').filter(i => i.length > 1), [meetingData.content]);

  return (
    <div className="meetingCard">
      <p>Réunion du {meetingData.date?.toLocaleString('FR', dateFormat) ?? 'Inconnue'}</p>
      {showSave ? (
        <textarea disabled={user == null} onChange={e => onChange(e.target.value)} name="" defaultValue={meetingData.content}></textarea>
      ) : (
        <ul>
          {contentList.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
      {user != null && (
        <div>
          {(showSave) ? (
            <p onClick={save}>Sauvegarder</p>
          ) : (
            <p onClick={() => setShowSave(true)}>Editer</p>
          )}
          {(showDelete) && (
            <p onClick={() => onDelete(meetingData)}>Supprimer</p>
          )}
        </div>
      )}
    </div >
  );
}

export default MeetingCard;

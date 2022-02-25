import React from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useGlobal } from 'reactn';

import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

import '../stylesheets/meetingCard.css';
import MeetingCard from './MeetingCard';
import { useEffect } from 'react';


function Meetings(props) {
  const { weekStart, weekEnd } = props;

  const [user] = useGlobal('user');
  const [db] = useGlobal('firebase');

  const [meetings, setMeetings] = useState([]);

  const addMeeting = async () => {
    // const result = prompt('Informations de la réunion');
    setMeetings(old => [...old, {
      id: new Date().getTime(),
      date: new Date(),
      content: ''
    }]);
  };

  useEffect(() => {
    if (db == null)
      return;
    const cardsRef = collection(db, 'meetings');
    getDocs(cardsRef).then(fbData => {
      const data = fbData.docs
        .map(d => d.data())
        .map(m => ({...m, date: new Date(m.date)}));
      console.log(data);
      setMeetings(data.filter(m => m.date > weekStart && m.date < weekEnd));
    });
  }, [db, weekStart]);

  const saveMeeting = (meeting) => {
    console.log('SAVING ', meeting);
    const cardsRef = collection(db, 'meetings');
    setDoc(doc(cardsRef, `${meeting.id}`), {
      ...meeting,
      date: meeting.date.toISOString()
    });
    toast.success('Réunion sauvegardée');
  };

  const deleteMeeting = (meeting) => {
    console.log('DELETING ', meeting);
    toast.success('Réunion supprimée');
  };

  return (
    <div className="meetings-container">
      {meetings.map((m, index) => (
        <MeetingCard onDelete={deleteMeeting} onSave={saveMeeting} meetingData={m} key={index} />
      ))}
      {user != null && (
        <div onClick={addMeeting} className='meetingCard add-meeting'>
          <p>Ajouter une réunion</p>
        </div>
      )}
    </div >
  );
}

export default Meetings;

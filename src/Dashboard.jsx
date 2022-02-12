import React, { useEffect, useMemo, useState } from 'react';
import { useGlobal } from 'reactn';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { ToastContainer } from 'react-toastify';
import { getAuth } from 'firebase/auth';

import 'react-toastify/dist/ReactToastify.css';
import './stylesheets/App.css';

import TrelloTasks from './components/TrelloTasks';
import TeamMood from './components/TeamMood';
import Password from './components/Password';

const FIRST_WEEK_DATE = new Date('2022-01-31');

const getWeekDates = (curr = new Date()) => {
  const firstday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1));
  const lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 7));
  return [firstday, lastday];
};

const shiftDate = (date = new Date(), shift = 1) => {
  const resultDate = new Date(date);
  resultDate.setDate(date.getDate() + 6 * shift);
  return resultDate;
};

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_ID,
};

function App() {
  const [, setDb] = useGlobal('firebase');
  const [user] = useGlobal('user');
  const [,setAuth] = useGlobal('auth');
  const [isLoading, setisLoading] = useGlobal('isLoading');

  const [weekStart, setWeekStart] = useState(undefined);
  const [weekEnd, setWeekEnd] = useState(undefined);


  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const fbdb = getFirestore(app);
    const auth = getAuth();
    setAuth(auth);
    setDb(fbdb);
    changeWeek(0); // On start change to actual week
  }, []);

  const changeWeek = (step = 0) => {
    setisLoading(true);
    const [start, end] = getWeekDates(step == 0 ? new Date() : shiftDate(weekStart, step));
    setWeekStart(start);
    setWeekEnd(end);
  };

  const weekNumber = useMemo(() => {
    if (weekStart == undefined)
      return 0;
    const diff = (weekStart.getTime() - FIRST_WEEK_DATE.getTime()) / 1000;
    return Math.round(diff / (60 * 60 * 24 * 7)) + 1;
  }, [weekStart]);

  return (
    <div className="App">
      {isLoading !== false && (
        <div className='loading'><h1>Chargement des données...</h1><div></div></div>
      )}
      <div className='week-picker'>
        <p onClick={() => changeWeek(-1)}>Précédente</p>
        <h1>Semaine {weekNumber}</h1>
        <p onClick={() => changeWeek(1)}>Suivante</p>
      </div>
      <h5>Du <span>{weekStart?.toLocaleDateString('FR')}</span> au <span>{weekEnd?.toLocaleDateString('FR')}</span></h5>
      <div className='separator'></div>
      <TeamMood weekStart={weekStart} weekEnd={weekEnd} />
      <div className='separator'></div>
      <TrelloTasks weekStart={weekStart} weekEnd={weekEnd} />
      <ToastContainer
        hideProgressBar
        position='bottom-right'
      />
      {user == undefined && (
        <Password />
      )}
    </div>
  );
}

export default App;

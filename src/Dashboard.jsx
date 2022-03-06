import React, { useEffect, useMemo, useState } from 'react';
import { useGlobal } from 'reactn';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { ToastContainer } from 'react-toastify';
import { getAuth } from 'firebase/auth';

import { GridLoader } from 'react-spinners';

import 'react-toastify/dist/ReactToastify.css';
import './stylesheets/App.css';

import TrelloTasks from './components/TrelloTasks';
import TeamMood from './components/TeamMood';
import Password from './components/Password';

import Meetings from './components/Meetings';

const FIRST_WEEK_DATE = new Date('2022-01-31');

const getWeekDates = (curr = new Date()) => {
  const firstday = new Date(curr.setDate(curr.getDate() - curr.getDay() + (curr.getDay() == 0 ? -6 : 1)));
  const lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 7));
  firstday.setHours(0, 0, 0, 0);
  lastday.setHours(23, 59, 59, 0);
  return [firstday, lastday];
};

const shiftDate = (date = new Date(), shift = 1) => {
  const resultDate = new Date(date);
  resultDate.setHours(0, 0, 0, 0);
  resultDate.setDate(date.getDate() + 7 * shift);
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
  const [, setAuth] = useGlobal('auth');
  const [isLoading, setIsLoading] = useGlobal('isLoading');
  const [loadingStatus] = useGlobal('loadingStatus');

  const [weekStart, setWeekStart] = useState(undefined);
  const [weekEnd, setWeekEnd] = useState(undefined);

  const [countdown, setContdown] = useState('');

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const fbdb = getFirestore(app);
    const auth = getAuth();
    setAuth(auth);
    setDb(fbdb);
    changeWeek(0); // On start change to actual week
  }, []);

  useEffect(() => {
    const end = new Date('2022-04-01');
    const _second = 1000;
    const _minute = _second * 60;
    const _hour = _minute * 60;
    const _day = _hour * 24;
    const updateContdown = () => {
      const now = new Date();
      const distance = end - now;
      if (distance < 0) {
        clearInterval(interval);
        setContdown('Terminé !');
        return;
      }
      const days = Math.floor(distance / _day);
      const hours = Math.floor((distance % _day) / _hour);
      const minutes = Math.floor((distance % _hour) / _minute);

      setContdown(`${days} jours ${hours} heures ${minutes} minutes`);
    };
    const interval = setTimeout(updateContdown, 60000);
    updateContdown();
    return () => clearInterval(interval);
  }, []);

  const changeWeek = (step = 0) => {
    setIsLoading(true);
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
        <div className='loading'>
          <GridLoader color={'#45c3e6'} loading size={20} />
          <p>{loadingStatus}</p>
        </div>
      )}
      <div className='week-picker'>
        <p onClick={() => changeWeek(-1)}>Précédente</p>
        <h1>Semaine {weekNumber}</h1>
        <p onClick={() => changeWeek(1)}>Suivante</p>
      </div>
      <h5>Du <span>{weekStart?.toLocaleDateString('FR')}</span> au <span>{weekEnd?.toLocaleDateString('FR')}</span></h5>
      <h5>Temps restant : {countdown}</h5>
      <div className='separator'></div>
      <TeamMood weekStart={weekStart} weekEnd={weekEnd} />
      <div className='separator'></div>
      <Meetings weekStart={weekStart} weekEnd={weekEnd} />
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

import { useCallback, useState, useEffect, useMemo } from 'react';

import '../stylesheets/mood.css';
import { useGlobal } from 'reactn';
import { collection, doc, setDoc, getDocs } from "firebase/firestore";

import { toast } from 'react-toastify';

const members = ['ruben', 'gael', 'emillien', 'hugo', 'celian'];

const membersDisplayName = {
  ruben: 'Ruben',
  gael: 'Gaël',
  emillien: 'Emillien',
  hugo: 'Hugo',
  celian: 'Célian'
}

const moods = ['⌛', '😔', '😡', '😬', '😐', '🙂', '😀'];

const getMoodId = (name, startDate) => {
  const date = new Date(startDate?.toLocaleDateString('FR'));
  if (Number.isNaN(date.getTime()))
    return undefined;
  return name + '|' + date.getTime();
}

function TeamMood(props) {

  const { weekStart, weekEnd } = props;
  const [db] = useGlobal('firebase');

  const [weekMoods, setWeekMoods] = useState([])

  const moodUpdated = (index, value) => {
    console.log(index, value);
    setWeekMoods(old => {
      old[index] = value
      return old;
    });

    // const cardsRef = collection(db, 'moods');
    // const moodId = getMoodId(index);
    // if (moodId == undefined)
    //   return;
    // setDoc(doc(cardsRef, moodId), {
    //   name: members[index],
    //   mood: value,
    //   moodId
    // });
    // setWeekMoods(old => [...old, {
    //   name: members[index],
    //   mood: value,
    //   moodId
    // }])
    // toast.success('Humeur mise à jour !');
  };

  useEffect(() => {
    getThisWeekMoods();
  }, [db, weekStart]);

  const getThisWeekMoods = async () => {
    if (db == undefined)
      return;
    const result = await getDocs(collection(db, 'moods'))
    const moodsTmp = [...new Array(members.length)].map(() => undefined);
    result.forEach((r, i) => {
      moodsTmp[i] = r.data;
    });
    console.log(moodsTmp);
    setWeekMoods(moodsTmp);
  }

  const borderStyle = (mood) => {
    if (mood === '⌛' || mood == undefined)
      return { borderColor: '#d45950' };
    return {};
  }

  return (
    <div className="team-mood-container">
      {weekMoods.map((moodObj, index) => (
        <div style={borderStyle(moodObj?.mood)} key={index} className='mood-container'>{moodObj?.member}
          <select
            option={moods}
            onChange={(value) => moodUpdated(index, value.target.value)}
            defaultValue={moodObj?.mood}
          >
            {moods?.map((mood, index) => (
              <option key={index} value={mood}>
                {mood}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div >

  );
}

export default TeamMood;

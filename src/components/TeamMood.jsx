import '../stylesheets/mood.css';
import { useGlobal } from 'reactn';
import { collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore";
import { useMemo } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';


const members = ['ruben', 'gael', 'emillien', 'hugo', 'celian'];

const membersDisplayName = {
  ruben: 'Ruben',
  gael: 'Gaël',
  emillien: 'Emillien',
  hugo: 'Hugo',
  celian: 'Célian'
}

const moods = ['⌛', '😔', '😡', '😬', '😐', '🙂', '😀'];

function TeamMood(props) {

  const [db] = useGlobal('firebase');
  const [weekMoods, setWeekMoods] = useState(undefined)

  const { weekStart, weekEnd } = props;

  const getMoodId = (index) => {
    const date = new Date(weekStart.toLocaleDateString('FR'));
    return members[index] + '|' + date.getTime();
  }

  const moodUpdated = (index, value) => {
    const cardsRef = collection(db, 'moods');
    const moodId = getMoodId(index);
    setDoc(doc(cardsRef, moodId), {
      name: members[index],
      mood: value,
      moodId
    });
  };

  useEffect(() => {
    setWeekMoods(undefined);
    getThisWeekMoods();
  }, [db, weekStart]);

  const getThisWeekMoods = async () => {
    if (db == undefined)
      return;
    const result = await getDocs(collection(db, 'moods'))
    const moodsTmp = [];
    result.forEach(r => {
      moodsTmp.push(r.data());
    });
    setWeekMoods(moodsTmp);
  }

  const borderStyle = (index) => {
    const setMood = weekMoods.find(m => m.moodId === getMoodId(index))?.mood;
    if (setMood === '⌛' || setMood == undefined)
      return { borderColor: '#d45950' };
    return {};
  }

  if (weekMoods == undefined)
    return null;

  return (
    <div className="team-mood-container">
      {members.map((member, index) => (
        <div style={borderStyle(index)} key={index} className='mood-container'>{membersDisplayName[member]}
          <select
            option={moods}
            onChange={(value) => moodUpdated(index, value.target.value)}
            defaultValue={weekMoods.find(m => m.moodId === getMoodId(index))?.mood}
          >
            {moods.map((mood, index) => (
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

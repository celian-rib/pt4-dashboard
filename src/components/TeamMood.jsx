import { useCallback, useState, useEffect } from 'react';

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

function TeamMood(props) {

  const [db] = useGlobal('firebase');
  const [weekMoods, setWeekMoods] = useState(undefined)

  const { weekStart, weekEnd } = props;

  const getMoodId = (index) => {
    if (weekStart == undefined)
      return undefined;
    const date = new Date(weekStart.toLocaleDateString('FR'));
    if(Number.isNaN(date.getTime()))
      return undefined;
    return members[index] + '|' + date.getTime();
  }

  const moodUpdated = (index, value) => {
    const cardsRef = collection(db, 'moods');
    const moodId = getMoodId(index);
    if (moodId == undefined)
      return;
    setDoc(doc(cardsRef, moodId), {
      name: members[index],
      mood: value,
      moodId
    });
    setWeekMoods(old => [...old, {
      name: members[index],
      mood: value,
      moodId
    }])
    toast.success('Humeur mise à jour !');
  };

  useEffect(() => {
    getThisWeekMoods();
  }, [db, weekStart]);

  const getThisWeekMoods = async () => {
    setWeekMoods(undefined);
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
    const setMood = weekMoods?.find(m => m.moodId === getMoodId(index))?.mood;
    if (setMood === '⌛' || setMood == undefined)
      return { borderColor: '#d45950' };
    return {};
  }

  if (weekMoods == undefined)
    return null;

  return (
    <div className="team-mood-container">
      {members.map((member, memberIndex) => (
        <div style={borderStyle(memberIndex)} key={memberIndex} className='mood-container'>{membersDisplayName[member]}
          <select
            option={moods}
            onChange={(value) => moodUpdated(memberIndex, value.target.value)}
            defaultValue={weekMoods?.find(m => m.moodId === getMoodId(memberIndex))?.mood}
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

import { useState, useEffect, useMemo } from 'react';

import '../stylesheets/mood.css';
import { useGlobal } from 'reactn';
import { collection, doc, setDoc, getDoc } from "firebase/firestore";

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

  const { weekStart } = props;
  const [db] = useGlobal('firebase');

  const [weekMoods, setWeekMoods] = useState({})

  const weekId = useMemo(() => weekStart?.toLocaleDateString('FR').replaceAll('/', '-') ?? null, [weekStart]);

  const updateMemberMood = (member, value) => setWeekMoods(old => {
    const newData = { ...old };
    newData[member] = value

    const cardsRef = collection(db, 'moods');
    setDoc(doc(cardsRef, weekId), newData);

    toast.success('Humeur mise à jour !');
    return newData;
  });

  useEffect(() => {
    getThisWeekMoods();
  }, [db, weekId]);

  const getThisWeekMoods = async () => {
    if (db == undefined || weekStart == undefined)
      return;

    console.log('REFETCH FOR', weekId);
    const docRef = collection(db, 'moods')
    const moodsResult = await (await getDoc(doc(docRef, weekId))).data();
    if (moodsResult != undefined) {
      setWeekMoods(moodsResult);
      return;
    }

    // Contruct this week object has it does not exists
    const moodsArray = [...new Array(members.length)].map(() => null);
    const obj = {};
    moodsArray.forEach((m, index) => {
      obj[members[index]] = m;
    })
    setWeekMoods(obj);
  }

  useEffect(() => {
    console.log(weekMoods);
  }, [weekMoods]);

  return (
    <div className="team-mood-container">
      {Object.entries(weekMoods).map(([member, mood], index) => (
        <div
          style={(mood === '⌛' || mood == undefined) ? { borderColor: '#d45950' } : {}}
          key={index}
          className='mood-container'
        >
          {membersDisplayName[member]}
          <select
            option={moods}
            onChange={(value) => updateMemberMood(member, value.target.value)}
            key={mood} // Force refresh select https://github.com/ant-design/ant-design/issues/4347
            defaultValue={mood}
          >
            {moods?.map((m, index) => (
              <option key={index} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div >

  );
}

export default TeamMood;

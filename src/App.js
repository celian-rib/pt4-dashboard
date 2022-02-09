import TrelloCard from './components/trelloCard';
import './stylesheets/App.css';
import { useEffect, useState } from 'react';

const weekStart = new Date("2022-02-07");
const weekEnd = new Date("2022-02-11");

function App() {

  const [weekDoneCards, setWeekDoneCards] = useState([]);
  const [weekWaitingCards, setWeekWaitingCards] = useState([]);

  useEffect(() => {
    getThisWeekCards();
  }, []);

  const getMembers = async () => await fetch('https://api.trello.com/1/boards/Osys3HjD/members')
    .then(result => result.json());

  const getAllCards = async () => fetch('https://api.trello.com/1/boards/Osys3HjD/cards')
    .then(result => result.json())

  const getThisWeekCards = async () => {

    const members = await getMembers();
    const cards = await getAllCards();

    const thisWeekCards = cards
      .filter(c => {
        const cardLastActivity = new Date(c.dateLastActivity);
        return weekStart <= cardLastActivity && cardLastActivity <= weekEnd;
      })
      .map(c => ({
        ...c,
        members: c.idMembers.map(idm => members.find(m => m.id === idm))
      }));

    setWeekDoneCards(thisWeekCards.filter(c => c.idList === '61fa5d8218aebf5547986dc1'));
    setWeekWaitingCards(thisWeekCards.filter(c => c.idList === '61faa717a433877241cff9d2'));
  }

  return (
    <div className="App">
      <h1>Tâches de cette semaine</h1>
      <div className='trello-lists-container'>
        <div className='trello-list'>
          <h1>Tâches en cours
            <span> ({weekWaitingCards.length}/{weekDoneCards.length + weekWaitingCards.length})</span>
          </h1>
          {weekWaitingCards.map((card, index) => (
            <TrelloCard members={[]} cardData={card} key={index} />
          ))}
        </div>
        <div className='trello-list'>
          <h1>Tâches terminées
            <span> ({weekDoneCards.length}/{weekDoneCards.length + weekWaitingCards.length})</span>
          </h1>
          {weekDoneCards.map((card, index) => (
            <TrelloCard members={[]} leadTime={Math.round(Math.random() * 3) + 1} cardData={card} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

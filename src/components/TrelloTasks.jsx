import { useEffect, useState } from 'react';

import '../stylesheets/App.css';
import trello from '../trello';
import { useGlobal } from 'reactn';

import CardTrello from './CardTrello';

const TRELLO_BASE_URL = 'https://api.trello.com/1';
const CARDS_URL = `/boards/${trello.TRELLO_BOARD_ID}/cards`;
const MEMBERS_URL = `/boards/${trello.TRELLO_BOARD_ID}/members`;

const chunkArray = (arr, chunkSize) => arr.reduce((resultArray, item, index) => {
  const chunkIndex = Math.floor(index / chunkSize)
  if (!resultArray[chunkIndex])
    resultArray[chunkIndex] = []
  resultArray[chunkIndex].push(item)
  return resultArray
}, [])

const flatDeep = (arr, d = 1) => d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), [])
  : arr.slice();

const getDataBatched = async (endPoints) => {
  const urls = endPoints.join(',');
  const urlsQuery = `${TRELLO_BASE_URL}/batch?urls=${urls}`;
  const batchedResult = await fetch(urlsQuery)
    .then(result => result.json());
  return batchedResult.map(r => r[200]);
}

function TrelloTasks(props) {

  const { weekStart, weekEnd } = props;

  const [, setIsLoading] = useGlobal("isLoading");

  const [weekDoneCards, setWeekDoneCards] = useState([]);
  const [weekWaitingCards, setWeekWaitingCards] = useState([]);
  const [weekInProgressCards, setWeekInProgressCards] = useState([]);
  const [weekActions, setWeekActions] = useState([]);

  const totalCards = () => weekDoneCards.length + weekWaitingCards.length + weekInProgressCards.length;

  // When week end and start are defined we get all trello data for this week
  useEffect(() => {
    if (weekStart == undefined || weekEnd == undefined)
      return;
    getThisWeekData();
  }, [weekStart, weekEnd]);

  const getThisWeekData = async () => {
    setIsLoading(true);
    const [members, cards] = await getDataBatched([MEMBERS_URL, CARDS_URL]);

    const thisWeekCards = cards
      .filter(c => {
        const cardLastActivity = new Date(c.dateLastActivity);
        // Allow waitings card to be displayed in futures weeks
        const canBeLater = weekStart >= new Date() && c.idList === trello.WAITING_LIST_ID;
        return (weekStart <= cardLastActivity && cardLastActivity <= weekEnd) || canBeLater;
      })
      .map(c => ({
        ...c,
        members: c.idMembers.map(idm => members.find(m => m.id === idm))
      }));

    // Batch all actions requests (Chunks of 10 endpoints)
    const chunkedActionsUrls = chunkArray(thisWeekCards.map(c => `/cards/${c.id}/actions`), 10);
    const tmpActions = [];
    for (const actionUrlChunk of chunkedActionsUrls) {
      tmpActions.push(await getDataBatched(actionUrlChunk));
    }

    setWeekActions(flatDeep(tmpActions, Infinity));
    setWeekWaitingCards(thisWeekCards.filter(c => c.idList === trello.WAITING_LIST_ID));
    setWeekInProgressCards(thisWeekCards.filter(c => c.idList === trello.IN_PROGRESS_LIST_ID));
    setWeekDoneCards(thisWeekCards.filter(c => c.idList === trello.DONE_LIST_ID));

    setIsLoading(false);
  }

  const getCardActions = (id) => weekActions.filter(action => action?.data?.card?.id === id);

  return (
    <div className='trello-lists-container'>
      {(weekEnd >= new Date()) && ( // Display waiting/in progress only for current and future weeks
        <>
          <div className='trello-list-slot'>
            <h1>Tâches en attente
              <span> ({weekWaitingCards.length}/{totalCards()})</span>
            </h1>
            <div className='trello-list'>
              {weekWaitingCards.map((card, index) => (
                <CardTrello
                  cardData={card}
                  key={index}
                  actions={getCardActions(card.id)}
                />
              ))}
            </div>
          </div>
          <div className='trello-list-slot'>
            <h1>Tâches en cours
              <span> ({weekInProgressCards.length}/{totalCards()})</span>
            </h1>
            <div className='trello-list'>
              {weekInProgressCards.map((card, index) => (
                <CardTrello
                  cardData={card}
                  showTimeInfos
                  key={index}
                  actions={getCardActions(card.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}
      <div className='trello-list-slot'>
        <h1>Tâches terminées
          <span> ({weekDoneCards.length}/{totalCards()})</span>
        </h1>
        <div className='trello-list'>
          {weekDoneCards.map((card, index) => (
            <CardTrello
              cardData={card}
              showStats
              showTimeInfos
              actions={getCardActions(card.id)}
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrelloTasks;

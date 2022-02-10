import '../stylesheets/mood.css';

const members = ['ruben', 'gael', 'emillien', 'hugo', 'celian']
function TeamMood(props) {
  const { text } = props;

  return (
    <div className="team-mood-container">
      {members.map(m => (
        <div className='mood-container'>{m}
          <select name="emojis">
            <option value="">⌛</option>
            <option value="">😔</option>
            <option value="">😡</option>
            <option value="">😬</option>
            <option value="">😐</option>
            <option value="">🙂</option>
            <option value="">😀</option>
          </select>
        </div>
      ))}
    </div >

  );
}

export default TeamMood;

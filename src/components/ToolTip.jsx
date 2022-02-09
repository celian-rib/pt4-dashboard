import '../stylesheets/tooltip.css';

function ToolTips(props) {
  const { text } = props;

  return (
    <div className="tooltip">
      <p>?</p>
      <span>{text}</span>
    </div >
  );
}

export default ToolTips;

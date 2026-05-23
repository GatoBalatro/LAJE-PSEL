import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import './BalloonNotification.css';

const BalloonNotification = () => {
  const { balloon, setBalloon } = useContext(GameContext);

  if (!balloon) return null;

  return (
    <div className="balloon-tip">
      <div className="balloon-header">
        <strong>{balloon.title}</strong>
        <button className="balloon-close" onClick={() => setBalloon(null)}>×</button>
      </div>
      <div className="balloon-body">
        {balloon.message}
      </div>
      <div className="balloon-stem"></div>
    </div>
  );
};

export default BalloonNotification;
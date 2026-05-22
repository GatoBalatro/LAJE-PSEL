import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import './BrokenGlassEffect.css';

const BrokenGlassEffect = () => {
  const { isGlassBroken, startMinigame } = useContext(GameContext);

  if (!isGlassBroken) return null;

  return (
    <div className="broken-glass-overlay">
      <div className="glass-cracks"></div>
      <div className="loss-message">
        <h2>CONEXÃO INTERROMPIDA</h2>
        <p>O usuário reiniciou o sistema antes da extração.</p>
        <button className="win7-button" onClick={() => window.location.reload()}>Reiniciar Hacker OS</button>
      </div>
    </div>
  );
};

export default BrokenGlassEffect;
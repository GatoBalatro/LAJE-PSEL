import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import './SystemError.css';

const SystemError = () => {
  const { systemError, closeSystemError } = useContext(GameContext);

  if (!systemError) return null;

  return (
    <div className="system-error-overlay">
      <div className="aero-window system-dialog">
        <div className="title-bar">
          <span className="title">{systemError.title || 'Erro de Sistema'}</span>
          <div className="controls">
            <button className="close" onClick={closeSystemError}>×</button>
          </div>
        </div>
        <div className="window-body error-content">
          <div className="error-icon-container">
            <div className={`win7-error-icon severity-${systemError.severity || 'error'}`}>!</div>
          </div>
          <p className="error-message">{systemError.message}</p>
          <button className="win7-button ok-button" onClick={closeSystemError}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default SystemError;
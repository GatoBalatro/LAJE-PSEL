import React, { useContext, useState, useEffect } from 'react';
import { GameContext } from '../context/GameContext';
import './LoginScreen.css';

const MAX_PASSWORD = 8;

const LoginScreen = () => {
  const { login, playSound } = useContext(GameContext);
  const [asterisks, setAsterisks] = useState(0);
  const [isWelcoming, setIsWelcoming] = useState(false);

  const doLogin = () => {
    setIsWelcoming(true);
    playSound('/sounds/win7_startup.mp3');
    setTimeout(() => login(), 2500);
  };

  useEffect(() => {
    if (isWelcoming) return;

    const handleKeyDown = (e) => {
      if (['Control', 'Alt', 'Shift', 'Meta', 'CapsLock', 'Tab', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(e.key)) return;

      if (e.key === 'Backspace') {
        setAsterisks(prev => Math.max(0, prev - 1));
        return;
      }

      setAsterisks(prev => Math.min(prev + 1, MAX_PASSWORD));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWelcoming]);

  useEffect(() => {
    if (asterisks >= MAX_PASSWORD && !isWelcoming) {
      doLogin();
    }
  }, [asterisks]);

  return (
    <div className={`login-screen ${isWelcoming ? 'welcoming' : ''}`}>
      {!isWelcoming ? (
        <div className="login-content">
          <div className="user-avatar-large">
            <img src="/icons/user_icon.png" alt="User" />
          </div>
          <h1 className="user-name">Hacker_Operador</h1>
          <div className="password-container">
            <div className="password-asterisks">
              {Array.from({ length: MAX_PASSWORD }, (_, i) => (
                <span key={i} className={`asterisk-dot ${i < asterisks ? 'filled' : ''}`}>●</span>
              ))}
            </div>
          </div>
          <p className="password-hint">Digite qualquer tecla para inserir a senha</p>
        </div>
      ) : (
        <div className="welcome-content">
          <div className="user-avatar-large welcome-avatar">
            <img src="/icons/user_icon.png" alt="User" />
          </div>
          <h1 className="welcome-text">Bem-vindo</h1>
        </div>
      )}
      <div className="login-footer">
        <div className="win7-logo-text">Bingus 27 Professional</div>
      </div>
    </div>
  );
};

export default LoginScreen;

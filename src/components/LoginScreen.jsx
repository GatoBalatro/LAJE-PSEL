import React, { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';
import './LoginScreen.css';

const LoginScreen = () => {
  const { login, playSound } = useContext(GameContext);
  const [password, setPassword] = useState('');
  const [isWelcoming, setIsWelcoming] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsWelcoming(true);
    
    // O som de startup toca no clique para o navegador permitir
    playSound('/sounds/win7_startup.mp3');

    setTimeout(() => {
      login();
    }, 2500);
  };

  return (
    <div className={`login-screen ${isWelcoming ? 'welcoming' : ''}`}>
      {!isWelcoming ? (
        <div className="login-content">
        <div className="user-avatar-large">
          <img src="/icons/user_icon.png" alt="User" />
        </div>
        <h1 className="user-name">Hacker_Operador</h1>
        <form onSubmit={handleSubmit} className="password-container">
          <input 
            type="password" 
            placeholder="Senha" 
            autoFocus 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-arrow">➔</button>
        </form>
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
        <div className="win7-logo-text">Windows 7 Professional</div>
      </div>
    </div>
  );
};

export default LoginScreen;
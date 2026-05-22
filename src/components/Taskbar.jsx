import React, { useRef, useState, useEffect, useContext } from 'react';
import './Taskbar.css';
import { GameContext } from '../context/GameContext';
import BalloonNotification from './BalloonNotification';

const Taskbar = ({ windows, onToggleMinimize }) => {
  const taskbarRef = useRef(null);
  const [time, setTime] = useState(new Date());
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const { toggleInventory, notificationCount, clearNotifications, showSystemError, playSound } = useContext(GameContext);

  // Aplicativos decorativos que mostram erro ao clicar
  const dummyApps = [
    { id: 'ie', name: 'Internet Explorer', icon: '/icons/ie_icon.png' },
    { id: 'wmp', name: 'Windows Media Player', icon: '/icons/wmp_icon.png' }
  ];

  const handleDummyClick = (appName) => {
    showSystemError("Acesso Negado", `O sistema detectou que você tem coisas mais importantes a fazer do que abrir o ${appName}.`, "warning");
  };

  // Efeito para atualizar o relógio a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000); // Atualiza a cada segundo para precisão, ou 60000 para cada minuto

    return () => clearInterval(timer);
  }, []);

  // Função para tocar o som de clique clássico
  const toggleStartMenu = () => {
    playSound('/sounds/win7_click.mp3', 0.4);
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  // Atualiza a posição do brilho seguindo o mouse
  const handleMouseMove = (e) => {
    if (taskbarRef.current) {
      const rect = taskbarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Definimos variáveis CSS diretamente no DOM para máxima performance
      taskbarRef.current.style.setProperty('--mouse-x', `${x}px`);
      taskbarRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  return (
    <div 
      className="taskbar-aero" 
      ref={taskbarRef}
      onMouseMove={handleMouseMove}
    >
      <div className="start-button-win7" onClick={toggleStartMenu}>
        <div className="logo-orb"></div>
      </div>

      {isStartMenuOpen && (
        <div className="start-menu-aero">
          <div className="start-menu-left">
            <div className="menu-item" onClick={() => { toggleInventory(); setIsStartMenuOpen(false); }}><span>Documentos</span></div>
            <div className="menu-item"><span>Imagens</span></div>
            <div className="menu-item"><span>Música</span></div>
            <div className="separator"></div>
            <div className="menu-item"><span>Todos os Programas</span></div>
          </div>
          <div className="start-menu-right">
            <div className="user-profile">
              <img src="/avatar_user.png" alt="User" />
            </div>
            <div className="menu-item-dark">Painel de Controle</div>
            <div className="menu-item-dark">Dispositivos e Impressoras</div>
            <button className="shutdown-btn">Desligar</button>
          </div>
        </div>
      )}

      <div className="taskbar-items">
        {/* Aplicativos fixos "Dummy" */}
        {dummyApps.map((app) => (
          <div 
            key={app.id} 
            className="taskbar-item"
            onClick={() => handleDummyClick(app.name)}
            title={app.name}
          >
            <img src={app.icon} alt={app.id} className="taskbar-icon" />
          </div>
        ))}

        <div className="separator-v"></div>

        {windows.map((win) => (
          <div 
            key={win.id} 
            className={`taskbar-item ${!win.isMinimized ? 'active' : ''}`}
            onClick={() => onToggleMinimize(win.id)}
            title={win.name}
          >
            <img src="/icons/skype_icon.png" alt="icon" className="taskbar-icon" />
            <div className="hover-glow"></div>
          </div>
        ))}
      </div>
      <div className="system-tray">
        <div 
          className={`action-center-icon ${notificationCount > 0 ? 'has-notifications' : ''}`}
          onClick={clearNotifications}
          title={`${notificationCount} novas mensagens de segurança`}
        >
          <div className="flag-icon"></div>
          {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
        </div>
        <div className="clock-container">
          <div>{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
          <div className="date-tray">{time.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
        </div>
        <BalloonNotification />
      </div>
    </div>
  );
};

export default Taskbar;
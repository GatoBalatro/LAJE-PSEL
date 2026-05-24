import { useState, useEffect, useRef, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import './NPCWindow.css';

const SystemError = () => {
  const { systemError, closeSystemError } = useContext(GameContext);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  // Centraliza a janela automaticamente quando o erro é disparado
  useEffect(() => {
    if (systemError && windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth / 2) - (rect.width / 2),
        y: (window.innerHeight / 2) - (rect.height / 2)
      });

      // Opcional: Som de erro clássico
      const errorAudio = new Audio('/sounds/win_error.mp3');
      errorAudio.volume = 0.4;
      errorAudio.play().catch(() => {});
    }
  }, [systemError]);

  // Lógica de arraste idêntica às janelas de NPCs
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      let nextX = e.clientX - offset.x;
      let nextY = e.clientY - offset.y;
      
      setPosition({ x: nextX, y: nextY });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset]);

  if (!systemError) return null;

  const handleMouseDown = (e) => {
    if (e.target.closest('.controls')) return;
    setIsDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  return (
    <div 
      ref={windowRef}
      className="aero-window system-error-popup"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`, 
        zIndex: 9999, // Sempre no topo de tudo
        position: 'absolute'
      }}
    >
      <div className="title-bar" onMouseDown={handleMouseDown} style={{ background: 'linear-gradient(to bottom, #f2f2f2, #d4d4d4)' }}>
        <span className="title" style={{ color: '#000', textShadow: 'none' }}>{systemError.title || "Erro de Sistema"}</span>
        <div className="controls">
          <button className="close" onClick={closeSystemError} style={{ color: '#000' }}>×</button>
        </div>
      </div>
      
      <div className="window-body" style={{ gap: '15px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '10px 0' }}>
          {/* Ícone clássico de erro do Windows */}
          <img src="/icons/error_icon.png" alt="Error" style={{ width: '40px', height: '40px' }} />
          <p style={{ color: '#000', fontSize: '12px', margin: 0, fontFamily: 'Segoe UI, sans-serif' }}>
            {systemError.message}
          </p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#f0f0f0', margin: '0 -20px -20px -20px', padding: '12px' }}>
          <button className="win7-button" onClick={closeSystemError} style={{ minWidth: '80px', textAlign: 'center' }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemError;
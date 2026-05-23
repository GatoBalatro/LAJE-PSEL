import React, { useState, useEffect, useRef } from 'react';
import nexusData from '../../npcs/nexusTutorial.json';
import './NexusWindow.css';

const NexusWindow = ({ zIndex, onFocus, onClose, onMinimize, isMinimized }) => {
  const [messages, setMessages] = useState([]);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const typingAudioRef = useRef(null);
  
  // Estado de posição para o arrasto
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !windowRef.current) return;
      
      let nextX = e.clientX - offset.x;
      let nextY = e.clientY - offset.y;

      // Efeito Aero Snap
      const SNAP_THRESHOLD = 30;
      const rect = windowRef.current.getBoundingClientRect();

      if (nextX < SNAP_THRESHOLD) nextX = 0;
      if (nextY < SNAP_THRESHOLD) nextY = 0;
      if (window.innerWidth - (nextX + rect.width) < SNAP_THRESHOLD) nextX = window.innerWidth - rect.width;
      if (window.innerHeight - (nextY + rect.height) < SNAP_THRESHOLD) nextY = window.innerHeight - rect.height;

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

  const handleMouseDown = (e) => {
    if (e.target.closest('.controls') || e.target.closest('.window-tabs')) return;
    setIsDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    if (onFocus) onFocus();
  };

  useEffect(() => {
    typingAudioRef.current = new Audio('/sounds/typing.mp3');
    typingAudioRef.current.loop = true;

    // Start first phase
    const startPhase = nexusData.phases[0];
    sendNexusMessages(startPhase.renata);

    return () => {
      if (typingAudioRef.current) {
        typingAudioRef.current.pause();
        typingAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendNexusMessages = async (texts) => {
    for (const text of texts) {
      setIsTyping(true);

      if (typingAudioRef.current) {
        typingAudioRef.current.play().catch(err => console.warn("Áudio aguardando interação:", err));
      }

      await new Promise(r => setTimeout(r, 1400));

      setIsTyping(false);

      if (typingAudioRef.current) {
        typingAudioRef.current.pause();
        typingAudioRef.current.currentTime = 0;
      }

      setMessages(prev => [...prev, { who: 'nexus', text }]);
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const handleChoice = async (choice) => {
    setMessages(prev => [...prev, { who: 'hacker', text: choice.text.replace('> ', '') }]);

    const nextPhase = choice.next !== null ? nexusData.phases[choice.next] : null;
    
    if (!nextPhase) {
      handleEndTutorial();
      return;
    }

    setCurrentPhaseIdx(choice.next);
    const response = nextPhase.responses ? (nextPhase.responses[choice.eff] || Object.values(nextPhase.responses)[0]) : nextPhase.renata;
    const texts = Array.isArray(response) ? response : [response];
    await sendNexusMessages(texts);
  };

  const handleEndTutorial = () => {
    const endText = "Seus próximos passos agora dependem de você. Boa sorte, parceiro.";
    sendNexusMessages([endText]);
  };

  return (
    <div 
      ref={windowRef}
      className={`aero-window nexus-window ${isMinimized ? 'minimized' : ''}`} 
      style={{ zIndex, left: `${position.x}px`, top: `${position.y}px` }} 
      onMouseDown={() => onFocus?.()}
    >
      <div className="title-bar" onMouseDown={handleMouseDown}>
        <span className="title">CONEXÃO SEGURA - {nexusData.name}</span>
        <div className="controls">
          <button className="minimize" onClick={onMinimize}>_</button>
          <button className="close" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="window-content nexus-content">
        <div className="chat-container">
          <div className="chat-window">
            <div className="phase-label">{nexusData.phases[currentPhaseIdx]?.label}</div>
            {messages.map((m, i) => (
              <div key={i} className={`msg msg-${m.who}`}>
                <div className="msg-label">{m.who === 'hacker' ? 'VOCÊ' : 'NEXUS'}</div>
                <div className="msg-bubble">{m.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="msg msg-nexus">
                <div className="msg-label">NEXUS</div>
                <div className="msg-bubble"><span className="typing">digitando...</span></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="choices-area">
            {!isTyping && nexusData.phases[currentPhaseIdx]?.choices.map((c, i) => (
              <button 
                key={i} 
                className={`choice-btn ${c.danger ? 'danger' : ''} ${c.secret ? 'secret' : ''}`}
                onClick={() => handleChoice(c)}
              >
                {c.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexusWindow;
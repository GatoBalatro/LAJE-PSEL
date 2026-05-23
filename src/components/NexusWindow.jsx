import React, { useState, useEffect, useRef } from 'react';
import nexusData from '../../npcs/nexusTutorial.json';
import './NexusWindow.css';

const NexusWindow = ({ zIndex, onFocus, onClose, onMinimize, isMinimized, onComplete }) => {
  const [messages, setMessages] = useState([]);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const typingAudioRef = useRef(null);
  const keyAudioRef = useRef(new Audio('/sounds/key_press.mp3'));
  const hasInitialized = useRef(false);
  const [missionComplete, setMissionComplete] = useState(false);

  const [isPlayerTyping, setIsPlayerTyping] = useState(false);
  const [playerTargetText, setPlayerTargetText] = useState("");
  const [playerCurrentText, setPlayerCurrentText] = useState("");
  const [pendingChoice, setPendingChoice] = useState(null);
  
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !windowRef.current) return;
      
      const rect = windowRef.current.getBoundingClientRect();
      const TASKBAR_HEIGHT = 45; // Altura aproximada da barra de tarefas

      let nextX = e.clientX - offset.x;
      let nextY = e.clientY - offset.y;

      // Limitar bordas (Clamping)
      nextX = Math.max(0, Math.min(nextX, window.innerWidth - rect.width));
      nextY = Math.max(0, Math.min(nextY, window.innerHeight - rect.height - TASKBAR_HEIGHT));

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

  // Timer para fechar a janela automaticamente após o fim da conversa
  useEffect(() => {
    if (missionComplete && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [missionComplete, onClose]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.controls')) return;
    setIsDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    if (onFocus) onFocus();
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    typingAudioRef.current = new Audio('/sounds/typing.mp3');
    typingAudioRef.current.loop = true;
    sendNexusMessages(nexusData.phases[0].renata);
    return () => {
      if (typingAudioRef.current) typingAudioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlayerTyping) return;
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
        if (playerCurrentText.length < playerTargetText.length) {
          const nextChar = playerTargetText[playerCurrentText.length];
          setPlayerCurrentText(prev => prev + nextChar);
          keyAudioRef.current.currentTime = 0;
          keyAudioRef.current.volume = 0.25 + Math.random() * 0.3; // Volume variável entre 0.25 e 0.55
          keyAudioRef.current.play().catch(() => {});
        } else {
          finishPlayerTyping();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerTyping, playerCurrentText, playerTargetText]);

  const processChoice = async (choice) => {
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

  const finishPlayerTyping = async () => {
    setIsPlayerTyping(false);
    const finalMsg = playerTargetText;
    setMessages(prev => [...prev, { who: 'hacker', text: finalMsg }]);
    setPlayerCurrentText("");
    setPlayerTargetText("");
    const choiceToProcess = pendingChoice;
    setPendingChoice(null);
    await processChoice(choiceToProcess);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendNexusMessages = async (texts) => {
    setIsTyping(true);
    for (const text of texts) {
      
      let displayed = "";
      setMessages(prev => [...prev, { who: 'nexus', text: "", isTyping: true }]);
      
      for (let i = 0; i < text.length; i++) {
        displayed += text[i];

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = displayed;
          return updated;
        });
        await new Promise(r => setTimeout(r, 20)); // Nexus: Resposta quase instantânea do sistema
      }

      await new Promise(r => setTimeout(r, 500));
    }
    await new Promise(r => setTimeout(r, 800)); // Delay extra antes de mostrar as escolhas
    setIsTyping(false);
  };

  const handleChoice = (choice) => {
    let hackerText = choice.text;
    if (hackerText.startsWith('root@nexus')) {
      // Mantém comandos root@nexus como estão
    } else if (hackerText.startsWith('> "')) {
      hackerText = hackerText.substring(2); // Remove '> "'
    }
    if (hackerText.endsWith('"')) {
      hackerText = hackerText.slice(0, -1); // Remove trailing '"'
    }
    setPlayerTargetText(hackerText);
    setPendingChoice(choice);
    setIsPlayerTyping(true);
    setPlayerCurrentText("");
  };

  const handleEndTutorial = async () => {
    await sendNexusMessages(["Seus próximos passos agora dependem de você. Boa sorte, parceiro."]);
    setMissionComplete(true);
    if (onComplete) onComplete();
  };

  return (
    <div 
      ref={windowRef}
      className={`terminal-window nexus-window ${isMinimized ? 'minimized' : ''}`} 
      style={{ zIndex, left: `${position.x}px`, top: `${position.y}px` }} 
      onMouseDown={() => onFocus?.()}
    >
      <div className="title-bar" onMouseDown={handleMouseDown}>
        <img src="/icons/skype_icon.png" alt="" className="window-icon" />
        <span className="title">CONEXÃO SEGURA - {nexusData.name}</span>
        <div className="controls">
          <button className="minimize" onClick={onMinimize}>-</button>
          <button className="close" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="window-content nexus-content">
        <div className="chat-container">
          <div className="chat-window">
            <div className="phase-label">{nexusData.phases[currentPhaseIdx]?.label}</div>
            {messages.map((m, i) => (
              <div key={i} className={`msg msg-${m.who}`}>
                <div className="msg-label">{m.who === 'hacker' ? '[RECRUIT@NEXUS]' : '[SYSTEM: NEXUS]'}</div>
                <div className="msg-bubble">{m.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="msg msg-nexus">
                <div className="msg-label">[SYSTEM: NEXUS]</div>
                <div className="msg-bubble"><span className="typing">recebendo dados...</span></div>
              </div>
            )}
            {missionComplete && (
              <div className="msg msg-system" style={{ textAlign: 'center', marginTop: '10px' }}>
                <div className="msg-bubble" style={{ color: '#ff4444', borderColor: '#ff4444', display: 'inline-block', borderLeft: 'none' }}>[CONEXÃO ENCERRADA]</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {!missionComplete && (
            <div className="choices-area">
              {isPlayerTyping ? (
                <div className="player-typing-line">
                  <span>[RECRUIT@NEXUS]: {playerCurrentText}</span>
                  <span className="cursor"></span>
                  {playerCurrentText.length === 0 && (
                    <div style={{fontSize: '10px', marginLeft: 'auto', opacity: 0.6}}>
                      [PRESSIONE QUALQUER TECLA PARA DIGITAR]
                    </div>
                  )}
                </div>
              ) : !isTyping && nexusData.phases[currentPhaseIdx]?.choices.map((c, i) => (
                <button
                  key={i}
                  className="choice-btn"
                  onClick={() => handleChoice(c)}
                >
                  {c.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NexusWindow;
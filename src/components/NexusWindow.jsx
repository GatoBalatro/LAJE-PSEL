// NexusWindow.jsx
import { useState, useEffect, useRef } from 'react';
import nexusData from '../../npcs/nexusTutorial.json';
import './NexusWindow.css';

const NexusWindow = ({ 
  zIndex, onFocus, onClose, onMinimize, isMinimized, onComplete,
  tutorialCompleted, overrideMode, nexusOpenedPostTutorial, setNexusOpenedPostTutorial 
}) => {
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
  
  // Identificador de sessão para abortar loops concorrentes antigos do terminal
  const typingSessionRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !windowRef.current) return;
      
      const rect = windowRef.current.getBoundingClientRect();
      const TASKBAR_HEIGHT = 45;

      let nextX = e.clientX - offset.x;
      let nextY = e.clientY - offset.y;

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
    typingAudioRef.current = new Audio('/sounds/typing.mp3');
    typingAudioRef.current.loop = true;

    if (overrideMode) {
      setMessages([]);
      setMissionComplete(false);
      if (overrideMode === 'carlos_success') {
        sendNexusMessages(["Parabéns pelo sucesso com o Carlos. Conseguimos os dados dele.", "Agora continue para a Renata."]);
      } else if (overrideMode === 'carlos_failed') {
        sendNexusMessages(["Você falhou na missão do Carlos. Ele bloqueou nossos acessos.", "Vá para a Renata imediatamente."]);
      } else if (overrideMode === 'renata_failed') {
        sendNexusMessages(["Um só não é o suficiente! Você falhou em convencer a Renata."]);
      } else if (overrideMode === 'both_success') {
        sendNexusMessages(["Bom trabalho! Ambas as fases foram concluídas com sucesso.", "Redirecionando..."]);
        setTimeout(() => {
  const newWindow = window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
  if (newWindow) {
    newWindow.focus();
  } else {
    // Fallback se o popup for bloqueado
    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }
}, 4000);
      }
      return;
    }

    if (tutorialCompleted) {
      setMessages([]);
      setMissionComplete(false);
      if (!nexusOpenedPostTutorial) {
        sendNexusMessages(["Pegue aqueles arquivos, temos um trabalho para fazer!"]);
        if (setNexusOpenedPostTutorial) setNexusOpenedPostTutorial(true);
      } else {
        sendNexusMessages(["Você está perdendo tempo! Continue a missão."]);
      }
      return;
    }

    if (!hasInitialized.current) {
      hasInitialized.current = true;
      sendNexusMessages(nexusData.phases[0].renata);
    }

    return () => {
      if (typingAudioRef.current) typingAudioRef.current.pause();
    };
  }, [overrideMode, tutorialCompleted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlayerTyping) return;
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
        if (playerCurrentText.length < playerTargetText.length) {
          const nextChar = playerTargetText[playerCurrentText.length];
          setPlayerCurrentText(prev => prev + nextChar);
          keyAudioRef.current.currentTime = 0;
          keyAudioRef.current.volume = 0.25 + Math.random() * 0.3;
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
    typingSessionRef.current += 1;
    const currentSession = typingSessionRef.current;

    for (const text of texts) {
      if (currentSession !== typingSessionRef.current) break;
      
      let displayed = "";
      const msgId = `${Date.now()}-${Math.random()}`;
      
      setMessages(prev => [...prev, { id: msgId, who: 'nexus', text: "", isTyping: true }]);
      
      for (let i = 0; i < text.length; i++) {
        if (currentSession !== typingSessionRef.current) break;
        displayed += text[i];

        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: displayed } : m));
        await new Promise(r => setTimeout(r, 20));
      }

      if (currentSession !== typingSessionRef.current) break;
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isTyping: false } : m));
      await new Promise(r => setTimeout(r, 500));
    }
    
    if (currentSession === typingSessionRef.current) {
      await new Promise(r => setTimeout(r, 800));
      setIsTyping(false);
    }
  };

  const handleChoice = (choice) => {
    let hackerText = choice.text;
    if (hackerText.startsWith('root@nexus')) {
      // Manter
    } else if (hackerText.startsWith('> "')) {
      hackerText = hackerText.substring(2);
    }
    if (hackerText.endsWith('"')) {
      hackerText = hackerText.slice(0, -1);
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
              <div key={m.id || i} className={`msg msg-${m.who}`}>
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

          {!missionComplete && !overrideMode && !tutorialCompleted && (
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
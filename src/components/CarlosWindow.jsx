import React, { useState, useEffect, useRef, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import carlosData from './carlosData.json';
import './CarlosWindow.css';

// Componente para renderizar a árvore de arquivos
const FileTree = ({ data, name, onFileClick, path = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (data.type === 'folder') {
    return (
      <div className="folder">
        <div className="folder-name" onClick={() => setIsOpen(!isOpen)}>
          <span className="folder-icon">{isOpen ? '▼' : '▶'}</span> 📂 <b>{name}</b>
        </div>
        {isOpen && (
          <div className="folder-children">
            {Object.entries(data.children).map(([childName, childData]) => (
              <FileTree 
                key={childName} 
                name={childName} 
                data={childData} 
                onFileClick={onFileClick}
                path={path + '/' + name}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const icons = { useful: '📄', useless: '📃', trap: '⚠️' };
  return (
    <div className={`file ${data.kind}`} onClick={() => onFileClick(name, data)}>
      <span className="file-icon">{icons[data.kind]}</span> {name}
    </div>
  );
};

const CarlosWindow = ({ zIndex, onFocus, onClose, onMinimize, isMinimized }) => {
  const { completeObjective } = useContext(GameContext);
  
  const [activeTab, setActiveTab] = useState('chat');
  const [affinity, setAffinity] = useState(0);
  const [messages, setMessages] = useState([]);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [preview, setPreview] = useState(null);
  const [missionComplete, setMissionComplete] = useState(false);
  
  const chatEndRef = useRef(null);
  const typingAudioRef = useRef(null);
  
  // Estado de posição para o arrasto
  const [position, setPosition] = useState({ x: 150, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  // Gerenciar movimentação da janela
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !windowRef.current) return;
      
      let nextX = e.clientX - offset.x;
      let nextY = e.clientY - offset.y;

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

  // Inicializar chat
  useEffect(() => {
    typingAudioRef.current = new Audio('/sounds/typing.mp3');
    typingAudioRef.current.loop = true;

    const startPhase = carlosData.phases[0];
    sendCarlosMessages(startPhase.carlos);

    return () => {
      if (typingAudioRef.current) {
        typingAudioRef.current.pause();
        typingAudioRef.current = null;
      }
    };
  }, []);

  // Scroll automático
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendCarlosMessages = async (texts) => {
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

      setMessages(prev => [...prev, { who: 'carlos', text }]);
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const setAffinityValue = (delta) => {
    setAffinity(prev => Math.max(0, Math.min(100, prev + delta)));
  };

  const getAffinityStatus = () => {
    if (affinity < 30) return 'Desconfiado. Resistência alta.';
    if (affinity < 60) return 'Abalado. Começando a ceder.';
    if (affinity < 85) return 'Vulnerável. Próximo de cooperar.';
    return 'Cooperativo. Missão viável.';
  };

  const handleChoice = async (choice) => {
    setMessages(prev => [...prev, { who: 'hacker', text: choice.text.replace('> ', '') }]);
    setAffinityValue(choice.delta);

    const nextPhase = carlosData.phases[choice.next];
    
    if (!nextPhase) {
      handleEndGame();
      return;
    }

    setCurrentPhaseIdx(choice.next);
    const response = nextPhase.responses 
      ? (nextPhase.responses[choice.effect] || Object.values(nextPhase.responses)[0])
      : nextPhase.carlos;
    const texts = Array.isArray(response) ? response : [response];
    await sendCarlosMessages(texts);
  };

  const handleEndGame = async () => {
    const endText = 'Ok. Me manda o que precisa. Mas se minha família se machucar, eu falo tudo.';
    await sendCarlosMessages([endText]);
    
    setTimeout(() => {
      setMissionComplete(true);
      if (completeObjective) {
        completeObjective({
          id: 'carlos_mission',
          name: 'Recrutamento de Carlos',
          success: true,
          affinityScore: affinity
        });
      }
    }, 1000);
  };

  return (
    <div 
      ref={windowRef}
      className={`aero-window carlos-window ${isMinimized ? 'minimized' : ''}`} 
      style={{ zIndex, left: `${position.x}px`, top: `${position.y}px` }} 
      onMouseDown={() => onFocus?.()}
    >
      <div className="title-bar" onMouseDown={handleMouseDown}>
        <span className="title">Terminal de Investigação - Carlos Silva</span>
        <div className="controls">
          <button className="minimize" onClick={onMinimize}>_</button>
          <button className="close" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="window-tabs">
        <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>CHAT</button>
        <button className={activeTab === 'files' ? 'active' : ''} onClick={() => setActiveTab('files')}>ARQUIVOS</button>
      </div>

      <div className="window-content">
        {activeTab === 'chat' ? (
          <div className="chat-container">
            <div className="stats-panel">
              <div className="stat">
                <span className="stat-label">Afinidade:</span>
                <div className="bar-bg">
                  <div className="bar-fill carlos-affinity" style={{ width: `${affinity}%` }}></div>
                </div>
                <span className="stat-value">{affinity}%</span>
              </div>
              <div className="status-text">{getAffinityStatus()}</div>
              {affinity >= 85 && (
                <div className="mission-indicator">✓ MISSÃO VIÁVEL</div>
              )}
            </div>

            <div className="chat-window">
              <div className="phase-label">{carlosData.phases[currentPhaseIdx]?.label}</div>
              
              {messages.map((m, i) => (
                <div key={i} className={`msg msg-${m.who}`}>
                  <div className="msg-label">{m.who === 'hacker' ? 'VOCÊ' : 'CARLOS'}</div>
                  <div className="msg-bubble">{m.text}</div>
                </div>
              ))}
              
              {isTyping && (
                <div className="msg msg-carlos">
                  <div className="msg-label">CARLOS</div>
                  <div className="msg-bubble"><span className="typing">digitando...</span></div>
                </div>
              )}
              
              {missionComplete && (
                <div className="final-card">
                  <div className="final-header">MISSÃO CONCLUÍDA</div>
                  <div className="final-body">
                    Carlos concordou.<br/>
                    Afinidade final: {affinity}%<br/><br/>
                    Ele vai abrir o acesso à subestação sul.<br/>
                    O contratante recebe a confirmação.<br/><br/>
                    <i>A cidade não sabe o que está por vir.</i>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {!missionComplete && (
              <div className="choices-area">
                {!isTyping && carlosData.phases[currentPhaseIdx]?.choices.map((c, i) => (
                  <button 
                    key={i} 
                    className={`choice-btn ${c.danger ? 'danger' : ''} ${c.threat ? 'threat' : ''}`}
                    onClick={() => handleChoice(c)}
                  >
                    {c.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="files-container">
            <div className="tree-panel">
              {Object.entries(carlosData.files).map(([name, data]) => (
                <FileTree 
                  key={name} 
                  name={name} 
                  data={data} 
                  onFileClick={(n, d) => setPreview({ name: n, ...d })}
                />
              ))}
            </div>
            <div className={`preview-panel ${preview ? 'open' : ''}`}>
              {preview && (
                <>
                  <div className="preview-header">
                    <span>📄 {preview.name}</span>
                    <button onClick={() => setPreview(null)}>Fechar</button>
                  </div>
                  <div className="preview-body" dangerouslySetInnerHTML={{ __html: preview.preview }} />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarlosWindow;
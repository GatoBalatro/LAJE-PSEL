import React, { useState, useEffect, useRef } from 'react';
import { renataFiles, renataPhases } from './renataMission';
import './RenataWindow.css';

const FileTree = ({ data, name, onFileClick }) => {
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
              <FileTree key={childName} name={childName} data={childData} onFileClick={onFileClick} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const icons = { useful: '📄', secret: '🔵', useless: '📃', trap: '⚠️' };
  return (
    <div className={`file ${data.kind}`} onClick={() => onFileClick(name, data)}>
      <span className="file-icon">{icons[data.kind]}</span> {name}
    </div>
  );
};

const RenataWindow = ({ zIndex, onFocus, onClose, onMinimize, isMinimized }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [affinity, setAffinity] = useState(0);
  const [suspicion, setSuspicion] = useState(0);
  const [messages, setMessages] = useState([]);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [preview, setPreview] = useState(null);
  const chatEndRef = useRef(null);
  const typingAudioRef = useRef(null);
  
  // Estado de posição para o arrasto (Consistência Aero)
  const [position, setPosition] = useState({ x: 120, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const pathToF3 = suspicion >= 60 && affinity >= 40;

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !windowRef.current) return;
      
      let nextX = e.clientX - offset.x;
      let nextY = e.clientY - offset.y;

      // Efeito Aero Snap (Magnetic Edges)
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
    const startPhase = renataPhases[0];
    sendRenataMessages(startPhase.renata);

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

  const sendRenataMessages = async (texts) => {
    for (const text of texts) {
      setIsTyping(true);

      // Toca o som de digitação
      if (typingAudioRef.current) {
        typingAudioRef.current.play().catch(err => console.warn("Reprodução de áudio aguardando interação:", err));
      }

      await new Promise(r => setTimeout(r, 1400));

      setIsTyping(false);

      // Para o som de digitação
      if (typingAudioRef.current) {
        typingAudioRef.current.pause();
        typingAudioRef.current.currentTime = 0; // Reseta para o início
      }

      setMessages(prev => [...prev, { who: 'renata', text }]);
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const handleChoice = async (choice) => {
    setMessages(prev => [...prev, { who: 'hacker', text: choice.text.replace('> ', '') }]);
    setAffinity(prev => Math.max(0, Math.min(100, prev + (choice.da || 0))));
    setSuspicion(prev => Math.max(0, Math.min(100, prev + (choice.ds || 0))));

    const nextPhase = renataPhases[choice.next];
    if (!nextPhase) {
      handleEndGame();
      return;
    }

    setCurrentPhaseIdx(choice.next);
    const response = nextPhase.responses ? (nextPhase.responses[choice.eff] || Object.values(nextPhase.responses)[0]) : nextPhase.renata;
    const texts = Array.isArray(response) ? response : [response];
    await sendRenataMessages(texts);
  };

  const handleEndGame = () => {
    const endText = pathToF3 
      ? "...Vou descobrir quem você é. E quem está por trás disso."
      : "Não vou ajudar. E vou reportar essa invasão.";
    sendRenataMessages([endText]);
  };

  return (
    <div 
      ref={windowRef}
      className={`aero-window renata-window ${isMinimized ? 'minimized' : ''}`} 
      style={{ zIndex, left: `${position.x}px`, top: `${position.y}px` }} 
      onMouseDown={() => onFocus?.()}
    >
      <div className="title-bar" onMouseDown={handleMouseDown}>
        <span className="title">Terminal de Investigação - Renata Sousa</span>
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
                Afinidade: <div className="bar-bg"><div className="bar-fill" style={{ width: `${affinity}%` }}></div></div>
                <span>{affinity}%</span>
              </div>
              <div className="stat">
                Suspeita: <div className="bar-bg"><div className="bar-fill suspicion" style={{ width: `${suspicion}%` }}></div></div>
                <span>{suspicion}%</span>
              </div>
              {pathToF3 && <div className="path-indicator path-f3">→ ROTA: FINAL 3</div>}
            </div>

            <div className="chat-window">
              <div className="phase-label">{renataPhases[currentPhaseIdx]?.label}</div>
              {messages.map((m, i) => (
                <div key={i} className={`msg msg-${m.who}`}>
                  <div className="msg-label">{m.who === 'hacker' ? 'VOCÊ' : 'RENATA'}</div>
                  <div className="msg-bubble">{m.text}</div>
                </div>
              ))}
              {isTyping && (
                <div className="msg msg-renata">
                  <div className="msg-label">RENATA</div>
                  <div className="msg-bubble"><span className="typing">digitando...</span></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="choices-area">
              {!isTyping && renataPhases[currentPhaseIdx]?.choices.map((c, i) => (
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
        ) : (
          <div className="files-container">
            <div className="tree-panel">
              {Object.entries(renataFiles).map(([name, data]) => (
                <FileTree key={name} name={name} data={data} onFileClick={(n, d) => setPreview({ name: n, ...d })} />
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

export default RenataWindow;
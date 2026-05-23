import React, { useState, useEffect, useRef } from 'react';
import { carlosFiles, carlosPhases } from './carlosMission';
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
  const icons = { useful: '📄', useless: '📃', trap: '⚠️' };
  return (
    <div className={`file ${data.kind}`} onClick={() => onFileClick(name, data)}>
      <span className="file-icon">{icons[data.kind]}</span> {name}
    </div>
  );
};

const CarlosWindow = ({ zIndex, onFocus, onClose, onMinimize, isMinimized, onScoreUpdate }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [affinity, setAffinity] = useState(0);
  const [messages, setMessages] = useState([]);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [preview, setPreview] = useState(null);
  const [position, setPosition] = useState({ x: 180, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
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
    sendCarlosMessages(carlosPhases[0].carlos);
  }, []);

  useEffect(() => {
    onScoreUpdate?.(affinity);
  }, [affinity]);

  const sendCarlosMessages = async (texts) => {
    for (const text of texts) {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1200));
      setIsTyping(false);
      setMessages(prev => [...prev, { who: 'carlos', text }]);
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const handleChoice = async (choice) => {
    setMessages(prev => [...prev, { who: 'hacker', text: choice.text.replace('> ', '') }]);
    const newAffinity = Math.max(0, Math.min(100, affinity + (choice.da || 0)));
    setAffinity(newAffinity);

    const nextPhase = carlosPhases[choice.next];
    if (!nextPhase) return;

    setCurrentPhaseIdx(choice.next);
    const response = nextPhase.responses ? (nextPhase.responses[choice.eff] || Object.values(nextPhase.responses)[0]) : nextPhase.carlos;
    await sendCarlosMessages(Array.isArray(response) ? response : [response]);
  };

  return (
    <div 
      ref={windowRef}
      className={`aero-window renata-window ${isMinimized ? 'minimized' : ''}`} 
      style={{ zIndex, left: `${position.x}px`, top: `${position.y}px` }} 
      onMouseDown={() => onFocus?.()}
    >
      <div className="title-bar" onMouseDown={(e) => {
        setIsDragging(true);
        setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
      }}>
        <span className="title">Terminal de Investigação - Carlos Santos</span>
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
                Influência: <div className="bar-bg"><div className="bar-fill" style={{ width: `${affinity}%` }}></div></div>
                <span>{affinity}%</span>
              </div>
            </div>

            <div className="chat-window">
              <div className="phase-label">{carlosPhases[currentPhaseIdx]?.label}</div>
              {messages.map((m, i) => (
                <div key={i} className={`msg msg-${m.who}`}>
                  <div className="msg-label">{m.who === 'hacker' ? 'VOCÊ' : 'CARLOS'}</div>
                  <div className="msg-bubble">{m.text}</div>
                </div>
              ))}
              {isTyping && (
                <div className="msg msg-renata">
                  <div className="msg-label">CARLOS</div>
                  <div className="msg-bubble"><span className="typing">digitando...</span></div>
                </div>
              )}
            </div>

            <div className="choices-area">
              {!isTyping && carlosPhases[currentPhaseIdx]?.choices.map((c, i) => (
                <button key={i} className="choice-btn" onClick={() => handleChoice(c)}>
                  {c.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="files-container">
            <div className="tree-panel">
              {Object.entries(carlosFiles).map(([name, data]) => (
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

export default CarlosWindow;
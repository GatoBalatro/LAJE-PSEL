import { useState, useEffect, useRef, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import renataData from '../../npcs/RenataMission.json';
import { renataFiles } from './renataMission';

import './RenataWindow.css';

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

  const icons = { useful: '📄', secret: '🔵', useless: '📃', trap: '⚠️' };
  return (
    <div className={`file ${data.kind}`} onClick={() => onFileClick(name, data)}>
      <span className="file-icon">{icons[data.kind]}</span> {name}
    </div>
  );
};

const RenataWindow = ({ zIndex, onFocus, onClose, onMinimize, isMinimized }) => {
  const { completeObjective } = useContext(GameContext);
  
  const [activeTab, setActiveTab] = useState('chat');
  const [affinity, setAffinity] = useState(0);
  const [suspicion, setSuspicion] = useState(0);
  const [messages, setMessages] = useState([]);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [preview, setPreview] = useState(null);
  const [missionComplete, setMissionComplete] = useState(false);
  const [missionSuccess, setMissionSuccess] = useState(false);
  
  const chatEndRef = useRef(null);
  const typingAudioRef = useRef(null);
  
  // Estado de posição para o arrasto
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const pathToF3 = suspicion >= 60 && affinity >= 40;

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

    const startPhase = renataData.phases[0];
    sendRenataMessages(startPhase.renata);

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

  // Verificar derrota (suspeita 100%)
  useEffect(() => {
    if (suspicion >= 100 && !missionComplete) {
      handleMissionFail();
    }
  }, [suspicion, missionComplete]);

  const sendRenataMessages = async (texts) => {
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

      setMessages(prev => [...prev, { who: 'renata', text }]);
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const setStatValues = (deltaAffinity, deltaSuspicion) => {
    setAffinity(prev => Math.max(0, Math.min(100, prev + deltaAffinity)));
    setSuspicion(prev => Math.max(0, Math.min(100, prev + deltaSuspicion)));
  };

  const getAffinityStatus = () => {
    if (affinity < 30) return 'Desconfiada. Muita resistência.';
    if (affinity < 60) return 'Abalada. Começando a ceder.';
    if (affinity < 85) return 'Vulnerável. Próxima de cooperar.';
    return 'Cooperativa. Possível acordo.';
  };

  const getSuspicionStatus = () => {
    if (suspicion < 30) return 'Cuidadosa. Monitorando você.';
    if (suspicion < 60) return 'Suspeitosa. Desconfiança crescente.';
    if (suspicion < 85) return 'Muito desconfiada. Pronta para agir.';
    return 'CRÍTICO. Vai te denunciar!';
  };

  const handleChoice = async (choice) => {
    setMessages(prev => [...prev, { who: 'hacker', text: choice.text.replace('> ', '') }]);
    setStatValues(choice.da || 0, choice.ds || 0);

    // Verificar derrota instantânea
    if (suspicion + (choice.ds || 0) >= 100) {
      setTimeout(() => handleMissionFail(), 600);
      return;
    }

    const nextPhase = renataData.phases[choice.next];
    
    if (!nextPhase) {
      handleMissionSuccess();
      return;
    }

    setCurrentPhaseIdx(choice.next);
    const response = nextPhase.responses 
      ? (nextPhase.responses[choice.eff] || Object.values(nextPhase.responses)[0])
      : nextPhase.renata;
    const texts = Array.isArray(response) ? response : [response];
    await sendRenataMessages(texts);
  };

  const handleMissionSuccess = async () => {
    const endText = "...Vou descobrir quem você é. E quem está por trás disso.";
    await sendRenataMessages([endText]);
    
    setTimeout(() => {
      setMissionSuccess(true);
      setMissionComplete(true);
      if (completeObjective) {
        completeObjective({
          id: 'renata_mission',
          name: 'Investigação de Renata',
          success: true,
          affinityScore: affinity,
          suspicionScore: suspicion,
          pathF3: pathToF3
        });
      }
    }, 1500);
  };

  const handleMissionFail = async () => {
    const endText = "Não vou ajudar. E vou reportar essa invasão.";
    await sendRenataMessages([endText]);
    
    setTimeout(() => {
      setMissionSuccess(false);
      setMissionComplete(true);
      if (completeObjective) {
        completeObjective({
          id: 'renata_mission',
          name: 'Investigação de Renata',
          success: false,
          affinityScore: affinity,
          suspicionScore: suspicion
        });
      }
    }, 1500);
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
                <span className="stat-label">Afinidade:</span>
                <div className="bar-bg">
                  <div className="bar-fill renata-affinity" style={{ width: `${affinity}%` }}></div>
                </div>
                <span className="stat-value">{affinity}%</span>
              </div>
              <div className="status-text">{getAffinityStatus()}</div>

              <div className="stat">
                <span className="stat-label">Suspeita:</span>
                <div className="bar-bg">
                  <div className="bar-fill suspicion" style={{ width: `${suspicion}%` }}></div>
                </div>
                <span className="stat-value">{suspicion}%</span>
              </div>
              <div className="status-text suspicion-text">{getSuspicionStatus()}</div>

              {pathToF3 && (
                <div className="path-indicator path-f3">→ ROTA: FINAL 3</div>
              )}
            </div>

            <div className="chat-window">
              <div className="phase-label">{renataData.phases[currentPhaseIdx]?.label}</div>
              
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
              
              {missionComplete && (
                <div className={`final-card ${missionSuccess ? 'success' : 'failure'}`}>
                  <div className="final-header">
                    {missionSuccess ? '✓ MISSÃO CONCLUÍDA' : '✗ MISSÃO FALHOU'}
                  </div>
                  <div className="final-body">
                    {missionSuccess ? (
                      <>
                        Renata concordou.<br/>
                        Afinidade final: {affinity}%<br/>
                        Suspeita final: {suspicion}%<br/>
                        {pathToF3 && <><br/><b>ROTA F3 DESBLOQUEADA</b><br/></>}
                        <br/>
                        <i>Você conseguiu virar ela do seu lado.</i>
                      </>
                    ) : (
                      <>
                        Renata desconfiou.<br/>
                        Afinidade final: {affinity}%<br/>
                        Suspeita final: {suspicion}%<br/><br/>
                        Ela vai te reportar para a segurança.<br/>
                        <i>Operação comprometida.</i>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {!missionComplete && (
              <div className="choices-area">
                {!isTyping && renataData.phases[currentPhaseIdx]?.choices.map((c, i) => (
                  <button 
                    key={i} 
                    className={`choice-btn ${c.danger ? 'danger' : ''} ${c.secret ? 'secret' : ''}`}
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
              {Object.entries(renataData.files || {}).map(([name, data]) => (
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

export default RenataWindow;
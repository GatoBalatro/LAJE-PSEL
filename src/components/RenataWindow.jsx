import { useState, useEffect, useRef } from 'react';
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
  const keyAudioRef = useRef(new Audio('/sounds/key_press.mp3'));
  const hasInitialized = useRef(false);
  const [missionComplete, setMissionComplete] = useState(false);
  const [missionStatus, setMissionStatus] = useState('active'); // 'active' | 'success' | 'failed'

  // Novo estado para rastrear arquivos descobertos pelo jogador
  const [discoveredFiles, setDiscoveredFiles] = useState([]);

  const [isPlayerTyping, setIsPlayerTyping] = useState(false);
  const [playerTargetText, setPlayerTargetText] = useState("");
  const [playerCurrentText, setPlayerCurrentText] = useState("");
  const [pendingChoice, setPendingChoice] = useState(null);
  
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
      const rect = windowRef.current.getBoundingClientRect();
      const TASKBAR_HEIGHT = 45;
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
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    typingAudioRef.current = new Audio('/sounds/typing.mp3');
    typingAudioRef.current.loop = true;
    sendRenataMessages(renataPhases[0].renata);
    return () => {
      if (typingAudioRef.current) {
        typingAudioRef.current.pause();
        typingAudioRef.current = null;
      }
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
          keyAudioRef.current.volume = 0.25 + Math.random() * 0.3;
          keyAudioRef.current.play().catch(() => {});
        } else if (playerCurrentText.length === playerTargetText.length) {
          finishPlayerTyping();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerTyping, playerCurrentText, playerTargetText]);

  const processChoice = async (choice) => {
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

  const finishPlayerTyping = async () => {
    setIsPlayerTyping(false);
    setMessages(prev => [...prev, { who: 'hacker', text: playerTargetText }]);
    setPlayerCurrentText("");
    setPlayerTargetText("");
    const choiceToProcess = pendingChoice;
    setPendingChoice(null);
    await processChoice(choiceToProcess);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendRenataMessages = async (texts) => {
    setIsTyping(true);
    for (const text of texts) {
      let displayed = "";
      setMessages(prev => [...prev, { who: 'renata', text: "", isTyping: true }]);
      for (let i = 0; i < text.length; i++) {
        displayed += text[i];
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = displayed;
          return updated;
        });
        await new Promise(r => setTimeout(r, 65));
      }
      await new Promise(r => setTimeout(r, 300));
    }
    await new Promise(r => setTimeout(r, 800));
    setIsTyping(false);
  };

  const handleChoice = async (choice) => {
    let hackerText = choice.text;
    if (!hackerText.startsWith('root@nexus')) {
      if (hackerText.startsWith('> "')) hackerText = hackerText.substring(2);
      if (hackerText.endsWith('"')) hackerText = hackerText.slice(0, -1);
    }
    setPlayerTargetText(hackerText);
    setPendingChoice(choice);
    setIsPlayerTyping(true);
    setPlayerCurrentText("");
  };

  const handleEndGame = async () => {
    // Validação da regra de negócio de afinidade mínima (65%)
    if (affinity < 65) {
      setMissionStatus('failed');
      await sendRenataMessages([
        "[SISTEMA]: CONEXÃO ENVIADA PARA DISPOSITIVO DE SEGURANÇA.", 
        "[CONEXÃO CORROMPIDA]: Afinidade final insuficiente (" + affinity + "%). O alvo cortou a comunicação."
      ]);
    } else {
      setMissionStatus('success');
      const endText = pathToF3 
        ? "...Vou descobrir quem você é. E quem está por trás disso."
        : "Não vou ajudar. E vou reportar essa invasão.";
      await sendRenataMessages([endText]);
    }
    setMissionComplete(true);
  };

  return (
    <div 
      ref={windowRef}
      className={`terminal-window renata-window ${isMinimized ? 'minimized' : ''}`} 
      style={{ zIndex, left: `${position.x}px`, top: `${position.y}px` }} 
      onMouseDown={() => onFocus?.()}
    >
      <div className="title-bar" onMouseDown={handleMouseDown}>
        <img src="/icons/skype_icon.png" alt="" className="window-icon" />
        <span className="title">Terminal de Investigação - Renata Sousa</span>
        <div className="controls">
          <button className="minimize" onClick={onMinimize}>-</button>
          <button className="close" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="window-tabs" onMouseDown={handleMouseDown}>
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
                  <div className="msg-label">{m.who === 'hacker' ? '[OPERATOR@NEXUS]' : '[REMOTE_USER: RENATA]'}</div>
                  <div className="msg-bubble">{m.text}</div>
                </div>
              ))}
              {isTyping && (
                <div className="msg msg-renata">
                  <div className="msg-label">[REMOTE_USER: RENATA]</div>
                  <div className="msg-bubble"><span className="typing">digitando...</span></div>
                </div>
              )}
              {missionComplete && (
                <div className="msg msg-system" style={{ textAlign: 'center', marginTop: '10px' }}>
                  <div 
                    className="msg-bubble" 
                    style={{ 
                      color: missionStatus === 'success' ? '#00ff00' : '#ff4444', 
                      borderColor: missionStatus === 'success' ? '#00ff00' : '#ff4444', 
                      display: 'inline-block', 
                      borderLeft: 'none' 
                    }}
                  >
                    {missionStatus === 'success' ? '[MISSÃO CONCLUÍDA]' : '[MISSÃO FALHOU - CONEXÃO ENCERRADA]'}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {!missionComplete && (
              <div className="choices-area">
                {isPlayerTyping ? (
                  <div className="player-typing-line">
                    <span>[OPERATOR@NEXUS]: {playerCurrentText}</span>
                    <span className="cursor"></span>
                    {playerCurrentText.length === 0 && (
                      <div style={{fontSize: '10px', marginLeft: 'auto', opacity: 0.6}}>
                        [PRESSIONE QUALQUER TECLA PARA DIGITAR]
                      </div>
                    )}
                  </div>
                ) : !isTyping && renataPhases[currentPhaseIdx]?.choices
                    // Validação de segurança: Filtra diálogos cujos arquivos não foram abertos
                    .filter(c => !c.requiredFile || discoveredFiles.includes(c.requiredFile))
                    .map((c, i) => (
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
        ) : (
          <div className="files-container">
            <div className="tree-panel">
              {Object.entries(renataFiles).map(([name, data]) => (
                <FileTree 
                  key={name} 
                  name={name} 
                  data={data} 
                  onFileClick={(n, d) => {
                    setPreview({ name: n, ...d });
                    // Adiciona o arquivo ao array de descobertas do jogador se já não estiver contido
                    if (!discoveredFiles.includes(n)) {
                      setDiscoveredFiles(prev => [...prev, n]);
                    }
                  }} 
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
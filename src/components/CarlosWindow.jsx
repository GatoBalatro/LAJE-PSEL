import React, { useState, useEffect, useRef, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { carlosFiles, carlosPhases } from './carlosMission';
import './CarlosWindow.css';

const carlosData = { files: carlosFiles, phases: carlosPhases };

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

const CarlosWindow = ({ zIndex, onFocus, onClose, onMinimize, isMinimized, onComplete }) => {
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
  const keyAudioRef = useRef(new Audio('/sounds/key_press.mp3'));
  const hasInitialized = useRef(false);

  // Estados para digitação "Emily is Away"
  const [isPlayerTyping, setIsPlayerTyping] = useState(false);
  const [playerTargetText, setPlayerTargetText] = useState("");
  const [playerCurrentText, setPlayerCurrentText] = useState("");
  const [pendingChoice, setPendingChoice] = useState(null);
  
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
      const rect = windowRef.current.getBoundingClientRect();
      const TASKBAR_HEIGHT = 45;

      // Movimentação fluida com limites
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

  // Inicializar chat
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

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

  // Listener para digitação do jogador
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlayerTyping) return;
      
      // Qualquer tecla (exceto teclas de sistema) avança a digitação
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
        if (playerCurrentText.length < playerTargetText.length) {
          const nextChar = playerTargetText[playerCurrentText.length];
          setPlayerCurrentText(prev => prev + nextChar);

          keyAudioRef.current.currentTime = 0;
          keyAudioRef.current.volume = 0.25 + Math.random() * 0.3; // Volume variável entre 0.25 e 0.55
          keyAudioRef.current.play().catch(() => {});
        } else if (playerCurrentText.length === playerTargetText.length) {
          // Terminou de digitar
          finishPlayerTyping();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerTyping, playerCurrentText, playerTargetText]);

  const processChoice = async (choice) => {
    setAffinityValue(choice.da);

    const nextPhase = carlosData.phases[choice.next];
    
    if (!nextPhase) {
      handleEndGame();
      return;
    }

    setCurrentPhaseIdx(choice.next);
    const response = nextPhase.responses 
      ? (nextPhase.responses[choice.eff] || Object.values(nextPhase.responses)[0])
      : nextPhase.carlos;
    const texts = Array.isArray(response) ? response : [response];
    await sendCarlosMessages(texts);
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

  // Scroll automático
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendCarlosMessages = async (texts) => {
    setIsTyping(true);
    for (const text of texts) {

      // Efeito Typewriter para o NPC (Carlos)
      let displayed = "";
      // Adicionamos um objeto de mensagem vazio que será preenchido caractere por caractere
      setMessages(prev => [...prev, { who: 'carlos', text: "", isTyping: true }]);
      
      for (let i = 0; i < text.length; i++) {
        displayed += text[i];

        setMessages(prev => {
          const updated = [...prev];
          // Atualizamos o texto da última mensagem adicionada ao array
          updated[updated.length - 1].text = displayed;
          return updated;
        });
        await new Promise(r => setTimeout(r, 45)); // Carlos: Digitação humana cadenciada
      }

      await new Promise(r => setTimeout(r, 300));
    }
    await new Promise(r => setTimeout(r, 800)); // Delay extra antes de mostrar as escolhas
    setIsTyping(false);
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
  
  const handleChoice = (choice) => {
    let hackerText = choice.text;
    if (hackerText.startsWith('> "')) {
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
      if (onComplete) onComplete();
    }, 1000);
  };

  return (
    <div 
      ref={windowRef}
      className={`terminal-window carlos-window ${isMinimized ? 'minimized' : ''}`} 
      style={{ zIndex, left: `${position.x}px`, top: `${position.y}px` }} 
      onMouseDown={() => onFocus?.()}
    >
      <div className="title-bar" onMouseDown={handleMouseDown}>
        <img src="/icons/skype_icon.png" alt="" className="window-icon" />
        <span className="title">Terminal de Investigação - Carlos Silva</span>
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
                  <div className="msg-label">{m.who === 'hacker' ? '[OPERATOR@NEXUS]' : '[REMOTE_USER: CARLOS]'}</div>
                  <div className="msg-bubble">{m.text}</div>
                </div>
              ))}
              
              {isTyping && (
                <div className="msg msg-carlos">
                  <div className="msg-label">[REMOTE_USER: CARLOS]</div>
                  <div className="msg-bubble"><span className="typing">digitando...</span></div>
                </div>
              )}
              
              {missionComplete && (
                <div className="msg msg-system" style={{ textAlign: 'center', margin: '10px 0' }}>
                  <div className="msg-bubble" style={{ color: '#ff4444', borderColor: '#ff4444', display: 'inline-block', borderLeft: 'none' }}>[CONEXÃO ENCERRADA]</div>
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
                ) : !isTyping && carlosData.phases[currentPhaseIdx]?.choices.map((c, i) => (
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
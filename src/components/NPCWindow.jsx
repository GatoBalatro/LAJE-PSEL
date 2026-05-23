import { useState, useEffect, useContext, useRef } from 'react';
import './NPCWindow.css'; // Estilização Aero Glass aqui
import { GameContext } from '../context/GameContext'; // Importa o GameContext

const NPCWindow = ({ npcData, onFinish, isMinimized, onMinimize, onFocus, onClose, zIndex }) => {
  console.log("NPCWindow tentando renderizar:", npcData?.name);
  const [currentNode, setCurrentNode] = useState('root');
  // const [minigameCompleted, setMinigameCompleted] = useState(false); // Não é mais necessário aqui
  const { hasEvidence, startMinigame, showSystemError } = useContext(GameContext); // Usa o contexto
  const [isNudging, setIsNudging] = useState(false);

  // Tenta encontrar o diálogo pelo ID (string como 'root') ou pelo índice numérico (das missões JS)
  const dialog = npcData.dialogs[currentNode] || npcData.dialogs[currentNode === 'root' ? 0 : currentNode];

  const [displayedText, setDisplayedText] = useState("");

  // Efeito Typewriter para simular recebimento de dados/terminal
  useEffect(() => {
    if (!dialog) return;

    // Busca o texto: tenta 'text', depois o nome do NPC (ex: 'renata'), ou a primeira resposta disponível
    const nameKey = npcData.name.toLowerCase();
    let rawText = dialog.text || dialog[nameKey];

    // Caso especial para fases que usam o objeto 'responses'
    if (!rawText && dialog.responses) {
      rawText = Object.values(dialog.responses)[0]; 
    }

    // Se for um array de falas (comum nas novas missões), junta com quebras de linha
    const textToType = Array.isArray(rawText) ? rawText.join('\n') : (rawText || "");

    if (!textToType) return;
    
    let index = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      setDisplayedText(textToType.substring(0, index + 1));
      index++;
      if (index >= textToType.length) clearInterval(timer);
    }, 25); // Velocidade da transmissão

    return () => clearInterval(timer);
  }, [dialog?.text]);

  // Estado de posição para o arrasto
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const windowRef = useRef(null);
  const nudgeAudio = useRef(new Audio('/sounds/terminal_alert.mp3'));

  // Efeito para vibrar a janela quando o NPC "manda" uma nova mensagem
  useEffect(() => {
    setIsNudging(true);
    nudgeAudio.current.volume = 0.5;
    nudgeAudio.current.currentTime = 0; // Reinicia o áudio se ele já estiver tocando
    nudgeAudio.current.play().catch(() => {});

    const timer = setTimeout(() => {
      setIsNudging(false);
    }, 400); // Duração da animação

    return () => clearTimeout(timer);
  }, [currentNode]);

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

  const handleOptionClick = (option) => {
    // Verifica se a opção exige uma evidência específica e se o jogador a possui
    if (option.requiredEvidenceId && !hasEvidence(option.requiredEvidenceId)) {
      showSystemError(
        "Acesso Negado",
        "Você não possui o arquivo de evidência necessário para prosseguir com esta ação."
      );
      return;
    }

    // Mecânica de Red Herring: Se a opção for "agressiva" e o jogador não jogou bem, o NPC bloqueia
    const evidenceId = npcData.minigameConfig.targetFile.name + npcData.minigameConfig.targetFile.extension;
    if (option.isHighRisk && !hasEvidence(evidenceId)) {
      setCurrentNode('bloqueio_imediato');
      setTimeout(() => onFinish(false), 3000);
      return;
    }

    if (option.nextNode) {
      setCurrentNode(option.nextNode);
    }

    // Verifica se é um nó terminal (Fim de conversa, vitória ou derrota)
    const nextDialog = npcData.dialogs[option.nextNode];
    if (nextDialog?.isTerminal) {
      setTimeout(() => onFinish(nextDialog.isWinEnd), 2000);
    }
  };

  // Função para simular o início do minigame definido no JSON
  const handleStartMinigame = () => { // Renomeado para evitar conflito com a função do contexto
    console.log(`Iniciando minigame: ${npcData.minigameConfig.targetFile.name}`);
    // Chama a função startMinigame do contexto, que irá configurar e renderizar o MinigameWindow
    startMinigame(npcData.minigameConfig);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.controls')) return; // Não arrasta se clicar nos botões
    setIsDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    if (onFocus) onFocus(); // Traz para a frente ao clicar
  };

  return (
    <div 
      ref={windowRef}
      className={`terminal-window npc-dialog ${isMinimized ? 'minimized' : ''} ${isNudging ? 'nudge' : ''}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`, 
        zIndex: zIndex || 100 
      }}
      onMouseDown={() => onFocus?.()}
    >
      <div className="title-bar" onMouseDown={handleMouseDown}>
        <img src="/icons/skype_icon.png" alt="" className="window-icon" />
        <span className="title">REMOTE_ACCESS_V2.4 // TARGET: {npcData.name.toUpperCase()}</span>
        <div className="controls">
          <button className="minimize" onClick={onMinimize}>-</button>
          <button className="close" onClick={onClose}>×</button>
        </div>
      </div>
      
      <div className="window-body">
        <div className="npc-info">
          <img src={dialog.avatar || npcData.avatar} alt="Avatar" className="avatar-terminal" />
          <div className="terminal-container">
            <p className="terminal-text" style={{ whiteSpace: 'pre-wrap' }}>
              <span className="prompt">{'>_'}</span> {displayedText}
            </p>
          </div>
        </div>

        <div className="options-container">
          {/* Suporta tanto 'options' (JSON) quanto 'choices' (Arquivos de Missão) */}
          {(dialog.options || dialog.choices)?.map((option, index) => (
            <button 
              key={index} 
              className="terminal-button"
              onClick={() => handleOptionClick(option)}
            >
              {option.text}
            </button>
          ))}
          
          {/* Botão extra para simular o hacking/minigame se necessário */}
          {currentNode === 'root' && !hasEvidence(npcData.minigameConfig.targetFile.name + npcData.minigameConfig.targetFile.extension) && (
            <button className="terminal-button highlight" onClick={handleStartMinigame}>
              [Hackear Sistema de Infraestrutura]
            </button>
          )}
        </div>
      </div>
      
      <div className="status-bar">
        <span className="terminal-status">UPLINK: SECURE // ENCRYPTION: AES-256 // NO_LOGS</span>
      </div>
    </div>
  );
};

export default NPCWindow;
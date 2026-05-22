import React, { useState, useEffect, useContext, useRef } from 'react';
import './NPCWindow.css'; // Estilização Aero Glass aqui
import { GameContext } from '../context/GameContext'; // Importa o GameContext

const NPCWindow = ({ npcData, onFinish, isMinimized, onMinimize, onFocus, onClose, zIndex }) => {
  console.log("NPCWindow tentando renderizar:", npcData?.name);
  const [currentNode, setCurrentNode] = useState('root');
  // const [minigameCompleted, setMinigameCompleted] = useState(false); // Não é mais necessário aqui
  const { hasEvidence, startMinigame, showSystemError } = useContext(GameContext); // Usa o contexto
  const [isNudging, setIsNudging] = useState(false);

  // Estado de posição para o arrasto
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const windowRef = useRef(null);

  // Efeito para vibrar a janela quando o NPC "manda" uma nova mensagem
  useEffect(() => {
    setIsNudging(true);
    
    // Opcional: Tocar o som de nudge se você tiver o arquivo
    const audio = new Audio('/sounds/skype_nudge.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});

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

  const dialog = npcData.dialogs[currentNode];

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
      className={`aero-window npc-dialog ${isMinimized ? 'minimized' : ''} ${isNudging ? 'nudge' : ''}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`, 
        zIndex: zIndex || 100 
      }}
      onMouseDown={() => onFocus?.()}
    >
      <div className="title-bar" onMouseDown={handleMouseDown}>
        <span className="title">Skype™ - {npcData.name}</span>
        <div className="controls">
          <button className="minimize" onClick={onMinimize}>_</button>
          <button className="close" onClick={onClose}>×</button>
        </div>
      </div>
      
      <div className="window-body">
        <div className="npc-info">
          <img src={dialog.avatar || npcData.avatar} alt="Avatar" className="avatar-glass" />
          <div className="dialog-bubble">
            <p>{dialog.text}</p>
          </div>
        </div>

        <div className="options-container">
          {dialog.options?.map((option, index) => (
            <button 
              key={index} 
              className="win7-button"
              onClick={() => handleOptionClick(option)}
            >
              {option.text}
            </button>
          ))}
          
          {/* Botão extra para simular o hacking/minigame se necessário */}
          {currentNode === 'root' && !hasEvidence(npcData.minigameConfig.targetFile.name + npcData.minigameConfig.targetFile.extension) && (
            <button className="win7-button highlight" onClick={handleStartMinigame}>
              [Hackear Sistema de Infraestrutura]
            </button>
          )}
        </div>
      </div>
      
      <div className="status-bar">
        <span className="skype-status">● Online | Skype chamando...</span>
      </div>
    </div>
  );
};

export default NPCWindow;
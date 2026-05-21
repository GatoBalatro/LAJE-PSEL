import { useState } from 'react';
import { GameContext } from './GameContext';

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState('idle');
  const [currentConfig, setCurrentConfig] = useState(null);

  const startMinigame = (npcConfig) => {
    setCurrentConfig(npcConfig.minigameConfig);
    setGameState('playing');
  };

  const handleWin = () => setGameState('won');
  const handleLoss = () => setGameState('lost');

  return (
    <GameContext.Provider value={{ gameState, currentConfig, startMinigame, handleWin, handleLoss }}>
      {children}
    </GameContext.Provider>
  );
}
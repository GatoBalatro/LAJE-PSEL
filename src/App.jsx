import { useContext } from 'react';
import { GameContext } from './components/context/GameContext';
import { GameProvider } from './components/context/GameProvider';
import MinigameWindow from './components/MinigameWindow';

// Exemplo do JSON carregado
const mockNpcData = {
  id: "alvo_01",
  minigameConfig: {
    timeLimit: 45,
    totalFiles: 40,
    targetFile: {
      name: "projeto_secreto_energia",
      extension: ".jpg"
    }
  }
};

function GameController() {
  const { gameState, startMinigame } = useContext(GameContext);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {gameState === 'idle' && (
        <button 
          onClick={() => startMinigame(mockNpcData)}
          className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-4 py-2 font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
        >
          Iniciar Minigame (Debug)
        </button>
      )}

      {gameState === 'playing' && <MinigameWindow />}

      {gameState === 'won' && (
        <div className="bg-[#c0c0c0] p-6 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-center">
          <h2 className="text-blue-800 font-bold text-xl mb-4">Sucesso!</h2>
          <p>Arquivo localizado a tempo.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-1 border-2 border-gray-800 bg-gray-300">Reiniciar</button>
        </div>
      )}

      {gameState === 'lost' && (
        <div className="bg-[#c0c0c0] p-6 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-center">
          <h2 className="text-red-800 font-bold text-xl mb-4">Falha de Sistema</h2>
          <p>Tempo esgotado.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-1 border-2 border-gray-800 bg-gray-300">Reiniciar</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameController />
    </GameProvider>
  );
}
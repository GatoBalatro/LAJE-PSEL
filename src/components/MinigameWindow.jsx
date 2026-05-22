import { useEffect, useState, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { generateFileSystem } from '../utils/fileSystem';

export default function MinigameWindow() {
  const { currentMinigameConfig, handleWin, handleLoss } = useContext(GameContext);
  const [files, setFiles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(currentMinigameConfig?.timeLimit || 0);

  useEffect(() => {
    if (currentMinigameConfig) {
      const generatedFiles = generateFileSystem(currentMinigameConfig.totalFiles, currentMinigameConfig.targetFile);
      setFiles(generatedFiles);
    }
  }, [currentMinigameConfig]);

  useEffect(() => {
    let timerId;
    if (timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      handleLoss(); // NPC reiniciou o PC
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timeLeft, handleLoss]);

  const handleFileClick = (isTarget) => {
    if (isTarget) {
      handleWin({ id: currentMinigameConfig.targetFile.name + currentMinigameConfig.targetFile.extension, name: currentMinigameConfig.targetFile.name + currentMinigameConfig.targetFile.extension }); // Passa a evidência coletada
    } else {
      // Clicar em arquivos errados aumenta a suspeita (diminui o tempo)
      setTimeLeft((prev) => Math.max(0, prev - 5));
    }
  };

  return (
    <div className="aero-window minigame-remote-access w-[600px] h-[450px]">
      <div className="title-bar">
        <span>Conexão Remota: {currentMinigameConfig?.targetHost || 'Alvo_Desconhecido'}</span>
        <div className="flex gap-1">
          <button onClick={handleLoss} className="close">X</button>
        </div>
      </div>

      <div className="window-body !bg-[#f0f0f0] flex-1 flex flex-col">
        <h2 className="text-red-600 font-bold text-xl leading-tight">
          ESTABILIDADE DA CONEXÃO: {timeLeft}s
        </h2>
        <p className="text-sm text-gray-700 mb-4">Aviso: O usuário detectou lentidão no sistema.</p>
        <div className="bg-white border border-gray-300 p-2 mb-4 rounded flex items-center gap-2">
          <span className="text-sm font-semibold">Alvo:</span>
          <span className="font-mono text-blue-700">{currentMinigameConfig?.targetFile.name}{currentMinigameConfig?.targetFile.extension}</span>
        </div>

        <div className="flex-1 bg-white border border-gray-400 overflow-y-auto p-4 rounded-sm shadow-inner">
          <div className="grid grid-cols-5 gap-6">
            {files.map((file) => (
              <div 
                key={file.id} 
                onClick={() => handleFileClick(file.isTarget)}
                className="flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-blue-100 border border-transparent hover:border-blue-300 rounded group transition-all"
              >
                <div className="w-10 h-12 bg-blue-50 border border-blue-200 relative mb-2 shadow-sm group-hover:shadow-md">
                  <div className="absolute top-0 right-0 w-3 h-3 bg-white border-b border-l border-blue-200"></div>
                </div>
                <span className="text-[11px] text-gray-800 break-all leading-tight text-center">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
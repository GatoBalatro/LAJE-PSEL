import { useEffect, useState, useContext } from 'react';
import { GameContext } from './context/GameContext';
import { generateFileSystem } from '../utils/fileSystem';

export default function MinigameWindow() {
  const { currentConfig, handleWin, handleLoss } = useContext(GameContext);
const [files, setFiles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(currentConfig?.timeLimit || 0);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleLoss();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, handleLoss]);

  const handleFileClick = (isTarget) => {
    if (isTarget) {
      handleWin();
    } else {
      setTimeLeft((prev) => Math.max(0, prev - 5));
    }
  };

    useEffect(() => {
  let timerId;
  
  if (timeLeft > 0) {
    timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
  } else {
    handleLoss();
  }

  return () => {
    if (timerId) clearInterval(timerId);
  };
}, [timeLeft, handleLoss]);

  return (
    <div className="w-[600px] h-[400px] bg-[#c0c0c0] border-t-2 border-l-2 border-t-white border-l-white border-b-2 border-r-2 border-b-gray-800 border-r-gray-800 flex flex-col shadow-md font-sans">
      <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center font-bold text-sm">
        <span>File Explorer - Procurar Arquivo</span>
        <div className="flex gap-1">
          <button className="bg-[#c0c0c0] text-black px-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 border-2 font-bold">X</button>
        </div>
      </div>

      <div className="border-b border-gray-500 pb-2 mb-2 p-2 bg-[#c0c0c0]">
        <div className="text-red-600 font-bold text-lg mb-1">
          Tempo Restante: 00:{timeLeft.toString().padStart(2, '0')}
        </div>
        <div className="text-sm">
          Encontre: <span className="font-mono font-bold bg-white px-1 border border-gray-400">{currentConfig.targetFile.name}{currentConfig.targetFile.extension}</span>
        </div>
      </div>

      <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-y-auto p-4 m-2">
        <div className="grid grid-cols-5 gap-4">
          {files.map((file) => (
            <div 
              key={file.id} 
              onClick={() => handleFileClick(file.isTarget)}
              className="flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-[#000080] hover:text-white group text-center"
            >
              <div className="w-8 h-10 bg-white border-2 border-gray-800 relative mb-1 group-hover:invert">
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#c0c0c0] border-b-2 border-l-2 border-gray-800"></div>
              </div>
              <span className="text-xs break-all leading-tight">{file.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
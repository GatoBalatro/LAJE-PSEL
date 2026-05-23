import { useState, useEffect, useContext } from "react";
import { GameProvider, GameContext } from "./context/GameContext";

// Componentes
import Taskbar from "./components/Taskbar";
import NPCWindow from "./components/NPCWindow";
import InventoryWindow from "./components/InventoryWindow";
import HackerLog from "./components/HackerLog";
import DesktopIcon from "./components/DesktopIcon";
import LoginScreen from "./components/LoginScreen";
import SystemError from "./components/SystemError";
import BrokenGlassEffect from "./components/BrokenGlassEffect";
import RenataWindow from "./components/RenataWindow";
import NexusWindow from "./components/NexusWindow";
import CarlosWindow from "./components/CarlosWindow";
import "./components/Desktop.css";

// Dados dos NPC
const nexusData = { id: 'nexus', name: 'NEXUS', avatar: 'icons/nexus_icon.png' };
const carlosData = { id: 'carlos', name: 'Carlos Silva', avatar: 'icons/carlos_icon.png' };
const renataData = { id: 'renata', name: 'Renata Sousa', avatar: 'icons/renata_icon.png' };

const DesktopEnvironment = ({ 
  openWindows, handleMinimize, handleFocus, handleClose, handleOpenNPC,
  tutorialCompleted, carlosCompleted, onTutorialComplete, onCarlosComplete
}) => {
  return (
    <div className="desktop">
      {/* Área de Ícones do Desktop */}
      <div className="desktop-icons-container" style={{ position: 'absolute', top: 20, left: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 10 }}>
        {/* Tutorial sempre visível */}
        <DesktopIcon 
          name="NEXUS - Tutorial" 
          iconSrc={nexusData.avatar} 
          onClick={() => handleOpenNPC(nexusData)} 
        />
        
        {/* Libera Carlos após o tutorial */}
        {tutorialCompleted && (
          <DesktopIcon 
            name="Carlos Silva" 
            iconSrc={carlosData.avatar} 
            onClick={() => handleOpenNPC(carlosData)} 
          />
        )}
        
        {/* Libera Renata após fase do Carlos */}
        {carlosCompleted && (
          <DesktopIcon 
            name="Renata Sousa" 
            iconSrc={renataData.avatar} 
            onClick={() => handleOpenNPC(renataData)} 
          />
        )}
      </div>

      {/* Renderiza janelas */}
      {openWindows.map((win) => {
        if (win.type === 'renata') {
          return (
            <RenataWindow 
              key={win.id} zIndex={win.zIndex} isMinimized={win.isMinimized}
              onMinimize={() => handleMinimize(win.id)}
              onFocus={() => handleFocus(win.id)}
              onClose={() => handleClose(win.id)}
            />
          );
        } else if (win.type === 'nexus') {
          return (
            <NexusWindow 
              key={win.id} zIndex={win.zIndex} isMinimized={win.isMinimized}
              onMinimize={() => handleMinimize(win.id)}
              onFocus={() => handleFocus(win.id)}
              onClose={() => handleClose(win.id)}
              onComplete={onTutorialComplete} // <-- Passa a função de conclusão
            />
          );
        } else if (win.type === 'carlos') {
          return (
            <CarlosWindow 
              key={win.id} zIndex={win.zIndex} isMinimized={win.isMinimized}
              onMinimize={() => handleMinimize(win.id)}
              onFocus={() => handleFocus(win.id)}
              onClose={() => handleClose(win.id)}
              onComplete={onCarlosComplete} // <-- Passa a função de conclusão
            />
          );
        } else {
          return (
            <NPCWindow
              key={win.id} npcData={win.npcData} zIndex={win.zIndex} isMinimized={win.isMinimized}
              onMinimize={() => handleMinimize(win.id)}
              onFocus={() => handleFocus(win.id)}
              onClose={() => handleClose(win.id)}
              onFinish={(winState) => alert(winState ? "Você venceu!" : "Você perdeu.")}
            />
          );
        }
      })}

      <InventoryWindow zIndex={200} onFocus={() => {}} />
      <HackerLog />
      <SystemError />
      <BrokenGlassEffect />
      <Taskbar windows={openWindows} onToggleMinimize={handleMinimize} />
    </div>
  );
};

function AppContent() {
  const { isLoggedIn } = useContext(GameContext);
  const [openWindows, setOpenWindows] = useState([]);
  const [highestZIndex, setHighestZIndex] = useState(100);

  // Estados de Progressão
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [carlosCompleted, setCarlosCompleted] = useState(false);

  // Inicializa a ambiência sonora na abertura do jogo
  useEffect(() => {
    const bgMusic = new Audio('/sounds/background_ambient.mp3'); // Certifique-se que o arquivo existe
    bgMusic.loop = true;
    bgMusic.volume = 0.3;

    const handleInitialPlay = () => {
      bgMusic.play().catch(() => {});
      // Remove o listener após o primeiro clique para não disparar novamente
      window.removeEventListener('mousedown', handleInitialPlay);
    };

    window.addEventListener('mousedown', handleInitialPlay);

    return () => {
      bgMusic.pause();
      window.removeEventListener('mousedown', handleInitialPlay);
    };
  }, []);

  const handleFocus = (id) => {
    setOpenWindows((prev) => {
      const newZ = highestZIndex + 1;
      setHighestZIndex(newZ);
      return prev.map((w) => (w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w));
    });
  };

  const handleMinimize = (id) => {
    setOpenWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, isMinimized: !win.isMinimized } : win
      )
    );
  };

  const handleClose = (id) => {
    setOpenWindows((prev) => prev.filter((win) => win.id !== id));
  };

  const handleOpenNPC = (data) => {
    setOpenWindows((prev) => {
      if (prev.some((w) => w.id === data.id)) {
        handleFocus(data.id);
        return prev;
      }
      const newZ = highestZIndex + 1;
      setHighestZIndex(newZ);
      return [...prev, {
        id: data.id,
        npcData: data,
        type: data.id, // Simplificado, já que os IDs batem com os tipos (renata, nexus, carlos)
        zIndex: newZ,
        isMinimized: false,
        name: data.name
      }];
    });
  };

  return isLoggedIn ? (
    <DesktopEnvironment
      openWindows={openWindows}
      handleMinimize={handleMinimize}
      handleFocus={handleFocus}
      handleClose={handleClose}
      handleOpenNPC={handleOpenNPC}
      tutorialCompleted={tutorialCompleted}
      carlosCompleted={carlosCompleted}
      onTutorialComplete={() => setTutorialCompleted(true)}
      onCarlosComplete={() => setCarlosCompleted(true)}
    />
  ) : (
    <LoginScreen />
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
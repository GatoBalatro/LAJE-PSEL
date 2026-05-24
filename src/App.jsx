// App.jsx
import { useState, useEffect, useContext } from "react";
import { GameProvider, GameContext } from "./context/GameContext";

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

const nexusData = { id: 'nexus', name: 'NEXUS', avatar: 'icons/nexus_icon.png' };
const carlosData = { id: 'carlos', name: 'Carlos Silva', avatar: 'icons/carlos_icon.png' };
const renataData = { id: 'renata', name: 'Renata Sousa', avatar: 'icons/renata_icon.png' };

const DesktopEnvironment = ({ 
  openWindows, handleMinimize, handleFocus, handleClose, handleOpenNPC,
  tutorialCompleted, carlosCompleted, onTutorialComplete, onCarlosComplete, onRenataComplete,
  nexusOpenedPostTutorial, setNexusOpenedPostTutorial
}) => {
  return (
    <div className="desktop">
      <div className="desktop-icons-container" style={{ position: 'absolute', top: 20, left: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 10 }}>
        <DesktopIcon 
          name="NEXUS - Iniciar" 
          iconSrc={nexusData.avatar} 
          onClick={() => handleOpenNPC(nexusData)} 
        />
        
        {tutorialCompleted && (
          <DesktopIcon 
            name="Carlos Silva" 
            iconSrc={carlosData.avatar} 
            onClick={() => handleOpenNPC(carlosData)} 
          />
        )}
        
        {carlosCompleted && (
          <DesktopIcon 
            name="Renata Sousa" 
            iconSrc={renataData.avatar} 
            onClick={() => handleOpenNPC(renataData)} 
          />
        )}
      </div>

      {openWindows.map((win) => {
        if (win.type === 'renata') {
          return (
            <RenataWindow 
              key={win.key || win.id} zIndex={win.zIndex} isMinimized={win.isMinimized}
              onMinimize={() => handleMinimize(win.id)}
              onFocus={() => handleFocus(win.id)}
              onClose={() => handleClose(win.id)}
              onComplete={onRenataComplete}
            />
          );
        } else if (win.type === 'nexus') {
          return (
            <NexusWindow 
              key={win.id} zIndex={win.zIndex} isMinimized={win.isMinimized}
              onMinimize={() => handleMinimize(win.id)}
              onFocus={() => handleFocus(win.id)}
              onClose={() => handleClose(win.id)}
              onComplete={onTutorialComplete}
              tutorialCompleted={tutorialCompleted}
              overrideMode={win.overrideMode}
              nexusOpenedPostTutorial={nexusOpenedPostTutorial}
              setNexusOpenedPostTutorial={setNexusOpenedPostTutorial}
            />
          );
        } else if (win.type === 'carlos') {
          return (
            <CarlosWindow 
              key={win.key || win.id} zIndex={win.zIndex} isMinimized={win.isMinimized}
              onMinimize={() => handleMinimize(win.id)}
              onFocus={() => handleFocus(win.id)}
              onClose={() => handleClose(win.id)}
              onComplete={onCarlosComplete}
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

  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [carlosCompleted, setCarlosCompleted] = useState(false);
  const [carlosStatus, setCarlosStatus] = useState(null);
  const [nexusOpenedPostTutorial, setNexusOpenedPostTutorial] = useState(false);

  useEffect(() => {
    const bgMusic = new Audio('/sounds/background_ambient.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;

    const handleInitialPlay = () => {
      bgMusic.play().catch(() => {});
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

  const handleOpenNPC = (data, overrideMode = null) => {
    setOpenWindows((prev) => {
      const windowExists = prev.some((w) => w.id === data.id);
      const newZ = highestZIndex + 1;
      setHighestZIndex(newZ);

      if (windowExists) {
        if (data.id === 'carlos' || data.id === 'renata') {
          return prev.map((w) =>
            w.id === data.id
              ? { ...w, zIndex: newZ, isMinimized: false, key: `${data.id}-${Date.now()}` }
              : w
          );
        }
        return prev.map((w) => 
          w.id === data.id 
            ? { ...w, zIndex: newZ, isMinimized: false, overrideMode: overrideMode || w.overrideMode } 
            : w
        );
      }

      return [...prev, {
        id: data.id,
        npcData: data,
        type: data.id,
        zIndex: newZ,
        isMinimized: false,
        name: data.name,
        overrideMode: overrideMode,
        key: data.id === 'nexus' ? 'nexus-static' : `${data.id}-${Date.now()}`
      }];
    });
  };

  const onTutorialComplete = () => {
    setTutorialCompleted(true);
  };

  const onCarlosComplete = (status) => {
    setCarlosStatus(status);
    setCarlosCompleted(true);
    handleOpenNPC(nexusData, status === 'success' ? 'carlos_success' : 'carlos_failed');
  };

  const onRenataComplete = (status) => {
    const finalMode = (status === 'success' && carlosStatus === 'success') ? 'both_success' : 'renata_failed';
    handleOpenNPC(nexusData, finalMode);
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
      onTutorialComplete={onTutorialComplete}
      onCarlosComplete={onCarlosComplete}
      onRenataComplete={onRenataComplete}
      nexusOpenedPostTutorial={nexusOpenedPostTutorial}
      setNexusOpenedPostTutorial={setNexusOpenedPostTutorial}
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
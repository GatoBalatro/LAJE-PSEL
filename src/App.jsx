import React, { useState, useEffect, useContext } from "react";
import npcData from "../npcs/npctemplate.json";
import { GameProvider, GameContext } from "./context/GameContext"; // Import GameContext aqui

// Componentes
import Taskbar from "./components/Taskbar";
import NPCWindow from "./components/NPCWindow";
import InventoryWindow from "./components/InventoryWindow";
import HackerLog from "./components/HackerLog";
import DesktopIcon from "./components/DesktopIcon"; // Import DesktopIcon
import LoginScreen from "./components/LoginScreen";
import SystemError from "./components/SystemError";
import BrokenGlassEffect from "./components/BrokenGlassEffect";
import "./components/Desktop.css";

const DesktopEnvironment = ({ openWindows, handleMinimize, handleFocus, handleClose, handleOpenNPC }) => {
  // Estado que guarda quais janelas estão na tela
  return (
    <div className="desktop">
      {/* Área de Ícones do Desktop */}
      <div className="desktop-icons-container" style={{ position: 'absolute', top: 20, left: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 10 }}>
        <DesktopIcon 
          name="Diretor de Infra" 
          iconSrc={npcData.avatar} 
          onClick={() => handleOpenNPC(npcData)} 
        />
      </div>

      {/* Renderiza janelas */}
      {openWindows.map((win) => (
        <NPCWindow
          key={win.id}
          npcData={win.npcData}
          zIndex={win.zIndex}
          isMinimized={win.isMinimized}
          onMinimize={() => handleMinimize(win.id)}
          onFocus={() => handleFocus(win.id)}
          onClose={() => handleClose(win.id)}
          onFinish={(winState) => alert(winState ? "Você venceu!" : "Você perdeu.")}
        />
      ))}

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

  useEffect(() => {
    if (isLoggedIn && npcData && openWindows.length === 0) {
      handleOpenNPC(npcData);
    }
  }, [isLoggedIn]);

  const handleOpenNPC = (data) => {
    setOpenWindows((prev) => {
      if (prev.some((w) => w.id === data.id)) {
        return prev;
      }
      const newZ = highestZIndex + 1;
      setHighestZIndex(newZ);
      return [...prev, {
        id: data.id,
        npcData: data,
        zIndex: newZ,
        isMinimized: false,
        name: data.name
      }];
    });
  };

  const handleFocus = (id) => {
    const newZ = highestZIndex + 1;
    setHighestZIndex(newZ);
    setOpenWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, zIndex: newZ, isMinimized: false };
      }
      return w;
    }).sort((a, b) => a.zIndex - b.zIndex));
  };

  const handleClose = (id) => setOpenWindows(prev => prev.filter(w => w.id !== id));
  const handleMinimize = (id) => setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));

  if (!isLoggedIn) return <LoginScreen />;

  return (
    <DesktopEnvironment 
      openWindows={openWindows}
      handleMinimize={handleMinimize}
      handleFocus={handleFocus}
      handleClose={handleClose}
      handleOpenNPC={handleOpenNPC}
    />
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
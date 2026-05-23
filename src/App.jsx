import React, { useState, useEffect, useContext } from "react";
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
import "./components/Desktop.css";

// Dados dos NPCs
const renataData = { 
  id: 'renata', 
  name: 'Renata Sousa', 
  avatar: '/icons/skype_icon.png' 
};

const nexusData = {
  id: 'nexus',
  name: 'NEXUS',
  avatar: '/icons/nexus_icon.png'
};

const DesktopEnvironment = ({ openWindows, handleMinimize, handleFocus, handleClose, handleOpenNPC }) => {
  return (
    <div className="desktop">
      {/* Área de Ícones do Desktop */}
      <div className="desktop-icons-container" style={{ position: 'absolute', top: 20, left: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 10 }}>
        <DesktopIcon 
          name="NEXUS - Tutorial" 
          iconSrc={nexusData.avatar} 
          onClick={() => handleOpenNPC(nexusData)} 
        />
        <DesktopIcon 
          name="Renata Sousa" 
          iconSrc={renataData.avatar} 
          onClick={() => handleOpenNPC(renataData)} 
        />
      </div>

      {/* Renderiza janelas */}
      {openWindows.map((win) => {
        if (win.type === 'renata') {
          return (
            <RenataWindow 
              key={win.id}
              zIndex={win.zIndex}
              isMinimized={win.isMinimized}
              onMinimize={() => handleMinimize(win.id)}
              onFocus={() => handleFocus(win.id)}
              onClose={() => handleClose(win.id)}
            />
          );
        } else if (win.type === 'nexus') {
          return (
            <NexusWindow 
              key={win.id}
              zIndex={win.zIndex}
              isMinimized={win.isMinimized}
              onMinimize={() => handleMinimize(win.id)}
              onFocus={() => handleFocus(win.id)}
              onClose={() => handleClose(win.id)}
            />
          );
        } else {
          return (
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

  // Não abre automaticamente nenhuma janela (permite que o usuário abra o tutorial opcionalmente)
  useEffect(() => {
    // Tutorial é opcional - usuário pode clicar no ícone do NEXUS
  }, [isLoggedIn]);

  const handleOpenNPC = (data) => {
    setOpenWindows((prev) => {
      // Evita abrir a mesma janela duas vezes
      if (prev.some((w) => w.id === data.id)) {
        handleFocus(data.id);
        return prev;
      }
      const newZ = highestZIndex + 1;
      setHighestZIndex(newZ);
      return [...prev, {
        id: data.id,
        npcData: data,
        type: data.id === 'renata' ? 'renata' : data.id === 'nexus' ? 'nexus' : 'standard',
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
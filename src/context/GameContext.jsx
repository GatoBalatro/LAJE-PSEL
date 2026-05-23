import { createContext, useState, useCallback, useRef, useEffect } from 'react';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [currentMinigameConfig, setCurrentMinigameConfig] = useState(null);
  const [systemError, setSystemError] = useState(null); // { title: string, message: string }
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isGlassBroken, setIsGlassBroken] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balloon, setBalloon] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [logs, setLogs] = useState([]);
  
  const balloonTimerRef = useRef(null);

  // Função auxiliar para tocar sons e debugar erros
  const playSound = useCallback((path, volume = 0.5) => {
    const audio = new Audio(path);
    audio.volume = volume;
    audio.play().catch(err => {
      console.warn(`Erro ao tocar som em ${path}: Verifique se o arquivo existe em public${path}`);
    });
  }, []);

  // Efeito de Boas-Vindas (Inicia após o login)
  useEffect(() => {
    if (!isLoggedIn) return;

    setLogs(["[SISTEMA] Kernel carregado com sucesso.", "[REDE] Aguardando conexão..."]);

    const timer = setTimeout(() => {
      addLog("BEM-VINDO, OPERADOR. CONEXÃO CRIPTOGRAFADA ESTABELECIDA.");
      addLog("OBJETIVO: Chantagear Alvos de Alto perfil.");
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  const showBalloon = useCallback((title, message) => {
    if (balloonTimerRef.current) clearTimeout(balloonTimerRef.current);
    
    setBalloon({ title, message });
    
    balloonTimerRef.current = setTimeout(() => {
      setBalloon(null);
      balloonTimerRef.current = null;
    }, 5000);
  }, []);

  const addLog = useCallback((message) => {
    const upperMsg = message.toUpperCase();
    const isImportant = upperMsg.includes("ALERTA") || upperMsg.includes("EVIDÊNCIA") || upperMsg.includes("DETECTADA");
    
    if (isImportant) {
      setNotificationCount(prev => prev + 1);
      playSound('/sounds/win7_ding.mp3');
      showBalloon("Notificação de Segurança", message);
    }

    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, [showBalloon]);

  const addEvidenceToInventory = useCallback((evidence) => {
    setInventory((prevInventory) => {
      if (!prevInventory.some(item => item.id === evidence.id)) {
        addLog(`EVIDÊNCIA DETECTADA: ${evidence.name}`);
        return [...prevInventory, evidence];
      }
      return prevInventory;
    });
  }, [addLog]);

  const hasEvidence = useCallback((evidenceId) => {
    return inventory.some(item => item.id === evidenceId);
  }, [inventory]);

  const handleWin = useCallback((evidenceCollected) => {
    if (evidenceCollected) {
      addEvidenceToInventory(evidenceCollected);
    }
    setCurrentMinigameConfig(null);
  }, [addEvidenceToInventory]);

  const handleLoss = useCallback(() => {
    addLog("ALERTA: Conexão encerrada pelo host remoto.");
    setIsGlassBroken(true);
    setCurrentMinigameConfig(null);
  }, [addLog]);

  const startMinigame = useCallback((config) => {
    addLog(`Iniciando tunelamento para: ${config.targetHost || 'Alvo'}`);
    setIsGlassBroken(false);
    setCurrentMinigameConfig(config);
  }, [addLog]);

  const showSystemError = useCallback((title, message, severity = 'error') => {
    const sounds = {
      info: '/sounds/win7_ding.mp3',
      warning: '/sounds/win7_warning.mp3',
      error: '/sounds/win7_error.mp3'
    };
    
    playSound(sounds[severity] || sounds.error);
    setSystemError({ title, message, severity });
  }, []);

  const closeSystemError = useCallback(() => setSystemError(null), []);

  const login = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const toggleInventory = useCallback(() => {
    setIsInventoryOpen((prev) => {
      if (!prev) {
        playSound('/sounds/win7_folder.mp3');
      }
      return !prev;
    });
  }, []);

  const clearNotifications = useCallback(() => setNotificationCount(0), []);

  return (
    <GameContext.Provider value={{
      inventory,
      addEvidenceToInventory,
      hasEvidence,
      currentMinigameConfig,
      systemError,
      balloon,
      setBalloon,
      isLoggedIn,
      showBalloon,
      isInventoryOpen,
      isGlassBroken,
      logs,
      notificationCount,
      startMinigame,
      handleWin,
      handleLoss,
      showSystemError,
      addLog,
      playSound,
      login,
      clearNotifications,
      closeSystemError,
      toggleInventory,
    }}>
      {children}
    </GameContext.Provider>
  );
};
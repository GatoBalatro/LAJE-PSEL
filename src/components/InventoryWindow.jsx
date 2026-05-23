import { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GameContext } from '../context/GameContext';
import './InventoryWindow.css';

const InventoryWindow = ({ zIndex, onFocus }) => {
  const { inventory, isInventoryOpen, toggleInventory } = useContext(GameContext);

  // Estado de posição para o arrasto
  const [position, setPosition] = useState({ x: 150, y: 150 }); // Posição inicial da janela
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const windowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !windowRef.current) return;
      
      let nextX = e.clientX - offset.x;
      let nextY = e.clientY - offset.y;

      // Aero Snap (Magnetic Edges)
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

  if (!isInventoryOpen) return null;

  const handleMouseDown = (e) => {
    if (e.target.closest('.controls')) return; // Não arrasta se clicar nos botões
    setIsDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    if (onFocus) onFocus(); // Traz para a frente ao clicar
  };

  const getFileIconClass = useCallback((fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'png', 'jpeg'].includes(ext)) return 'icon-image';
    if (ext === 'txt') return 'icon-text';
    return 'icon-generic';
  }, []);

  return (
    <div
      className="aero-window inventory-window"
      style={{ left: `${position.x}px`, top: `${position.y}px`, zIndex: zIndex || 105 }}
      onMouseDown={() => onFocus?.()}
    >
      <div className="title-bar" onMouseDown={handleMouseDown}>
        <span className="title">Meus Documentos</span>
        <div className="controls">
          <button className="minimize" onClick={toggleInventory}>_</button>
          <button className="close" onClick={toggleInventory}>×</button>
        </div>
      </div>
      <div className="window-body inventory-grid">
        {inventory.length === 0 ? (
          <p className="empty-message">Esta pasta está vazia.</p>
        ) : (
          inventory.map(item => (
            <div key={item.id} className="inventory-item">
              <div className={`file-icon-aero ${getFileIconClass(item.name)}`}></div>
              <span className="file-name">{item.name}</span>
            </div>
          ))
        )}
      </div>
      <div className="status-bar">
        <span>{inventory.length} itens</span>
      </div>
    </div>
  );
};

export default InventoryWindow;
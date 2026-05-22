import React from 'react';
import './DesktopIcon.css';

const DesktopIcon = ({ name, iconSrc, onClick }) => {
  return (
    <div className="desktop-icon" onDoubleClick={onClick}>
      <div className="icon-wrapper">
        <img src={iconSrc} alt={name} />
      </div>
      <span className="icon-label">{name}</span>
    </div>
  );
};

export default DesktopIcon;
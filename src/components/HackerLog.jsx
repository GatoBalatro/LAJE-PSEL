import { useContext, useEffect, useRef } from 'react';
import { GameContext } from '../context/GameContext';
import './HackerLog.css';

const HackerLog = () => {
  const { logs } = useContext(GameContext);
  const logEndRef = useRef(null);

  // Auto-scroll para o final do log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="hacker-log-terminal">
      <div className="terminal-header">Hacker Console v1.0.9</div>
      <div className="terminal-body">
        {logs.map((log, index) => (
          <div key={index} className="log-line">
            <span className="prompt">{'>'}</span> {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default HackerLog;
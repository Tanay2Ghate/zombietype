import React from 'react';
import { Timer, Type } from 'lucide-react';

export default function ControlPanel({ mode, setMode, limit, setLimit, isActive }) {
  const timeOptions = [15, 30, 60, 120];
  const wordOptions = [10, 25, 50, 100];

  const handleModeChange = (newMode) => {
    if (isActive) return;
    setMode(newMode);
    setLimit(newMode === 'time' ? 30 : 25);
  };

  const handleLimitChange = (newLimit) => {
    if (isActive) return;
    setLimit(newLimit);
  };

  const options = mode === 'time' ? timeOptions : wordOptions;

  return (
    <div 
      className="config-bar" 
      style={{ 
        opacity: isActive ? 0.3 : 1, 
        pointerEvents: isActive ? 'none' : 'auto',
        transition: 'opacity 0.3s ease'
      }}
    >
      <div className="config-group">
        <span className="config-group-title">
          <Timer size={14} style={{ color: 'var(--accent-cyan)' }} /> mode
        </span>
        <button
          className={`config-btn ${mode === 'time' ? 'active' : ''}`}
          onClick={() => handleModeChange('time')}
          disabled={isActive}
        >
          time
        </button>
        <button
          className={`config-btn ${mode === 'words' ? 'active' : ''}`}
          onClick={() => handleModeChange('words')}
          disabled={isActive}
        >
          words
        </button>
      </div>

      <div className="config-divider"></div>

      <div className="config-group">
        <span className="config-group-title">
          <Type size={14} style={{ color: 'var(--accent-purple)' }} /> amount
        </span>
        {options.map((opt) => (
          <button
            key={opt}
            className={`config-btn ${limit === opt ? 'active' : ''}`}
            onClick={() => handleLimitChange(opt)}
            disabled={isActive}
          >
            {opt}
            {mode === 'time' ? 's' : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

import React from 'react';

export default function MetricsHeader({ mode, timeLeft, totalWords, currentWordIndex, wpm, accuracy }) {
  const displayProgress = () => {
    if (mode === 'time') {
      return `${timeLeft}s`;
    } else {
      return `${currentWordIndex}/${totalWords}`;
    }
  };

  return (
    <div className="metrics-row">
      <div className="metric-card glass-panel">
        <span className="metric-label">{mode === 'time' ? 'time remaining' : 'progress'}</span>
        <span className="metric-value accent">{displayProgress()}</span>
      </div>
      <div className="metric-card glass-panel">
        <span className="metric-label">wpm</span>
        <span className="metric-value">{wpm}</span>
      </div>
      <div className="metric-card glass-panel">
        <span className="metric-label">accuracy</span>
        <span className="metric-value">{accuracy}%</span>
      </div>
    </div>
  );
}

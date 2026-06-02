import React from 'react';
import { RotateCcw, AlertTriangle, Skull, Award } from 'lucide-react';

export default function GameOverScreen({
  score,
  wave,
  zombiesKilled,
  wpm,
  accuracy,
  difficulty,
  highScores,
  onRestart
}) {
  return (
    <div className="gameover-card">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
        <Skull size={52} style={{ color: 'var(--accent-blood)', filter: 'drop-shadow(0 0 8px var(--accent-blood))' }} />
      </div>
      <h1 className="gameover-title">survival failed</h1>
      <div className="gameover-subtitle">you were overrun by the swarm ({difficulty} mode)</div>

      <div className="gameover-stats-grid">
        <div className="gameover-stat-box">
          <div className="gameover-stat-label">score</div>
          <div className="gameover-stat-val highlight">{score}</div>
        </div>
        <div className="gameover-stat-box">
          <div className="gameover-stat-label">wave reached</div>
          <div className="gameover-stat-val">{wave}</div>
        </div>
        <div className="gameover-stat-box">
          <div className="gameover-stat-label">zombies killed</div>
          <div className="gameover-stat-val">{zombiesKilled}</div>
        </div>
        <div className="gameover-stat-box">
          <div className="gameover-stat-label">overall wpm</div>
          <div className="gameover-stat-val">{wpm}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', padding: '0.75rem', borderRadius: '8px', marginBottom: '2.5rem', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>typing accuracy:</span>
        <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{accuracy}%</span>
      </div>

      {highScores && highScores.length > 0 && (
        <div className="high-scores-section" style={{ marginBottom: '2.5rem' }}>
          <div className="high-scores-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Award size={16} style={{ color: 'var(--accent-toxic)' }} /> leaderboards (top scores)
          </div>
          {highScores.slice(0, 5).map((scoreEntry, index) => {
            const isCurrentRun = scoreEntry.score === score && scoreEntry.wave === wave && scoreEntry.timestamp === scoreEntry.currentRunTimestamp;
            
            return (
              <div 
                key={index} 
                className={`high-score-row ${isCurrentRun ? 'highlighted' : ''}`}
              >
                <span>
                  #{index + 1} - Wave {scoreEntry.wave} ({scoreEntry.difficulty})
                  {isCurrentRun && <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', fontStyle: 'italic', fontWeight: 'bold' }}>(this run!)</span>}
                </span>
                <span style={{ fontWeight: '700' }}>{scoreEntry.score} pts</span>
              </div>
            );
          })}
        </div>
      )}

      <button className="btn-primary" onClick={onRestart} style={{ background: 'linear-gradient(135deg, var(--accent-blood), #9b002c)', color: '#fff', boxShadow: '0 4px 15px rgba(255,0,85,0.3)' }}>
        <RotateCcw size={16} /> try again
      </button>
    </div>
  );
}

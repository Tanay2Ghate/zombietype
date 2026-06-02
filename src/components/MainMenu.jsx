import React from 'react';
import { Skull, ShieldAlert, Award } from 'lucide-react';

export default function MainMenu({ difficulty, setDifficulty, highScores, onStartGame }) {
  return (
    <div className="menu-card">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
        <Skull size={48} className="logo-icon" />
      </div>
      <h1 className="menu-title">ZOMBIE TYPE</h1>
      <div className="menu-subtitle">survival typing arcade</div>

      <div className="menu-instructions">
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-bright)', fontWeight: '700', marginBottom: '0.75rem' }}>
          <ShieldAlert size={16} style={{ color: 'var(--accent-toxic)' }} /> SURVIVAL DIRECTIVE:
        </p>
        <p>1. Zombies are marching towards your base barrier. Each zombie has a word above its head.</p>
        <p>2. Type the word to charge and shoot your laser. Eliminating zombies gains score.</p>
        <p>3. Typing the first letter of a word **locks** onto that target. Finish typing the word to unlock.</p>
        <p>4. If a zombie reaches your barrier, your health is depleted. Do not let them breach!</p>
        <p style={{ color: 'var(--accent-boss)', fontWeight: '600' }}>⚠️ Warning: Boss waves spawn giant enemies requiring full sentences!</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
          select difficulty
        </div>
        <div className="difficulty-selection">
          {['easy', 'normal', 'hard'].map((diff) => (
            <button
              key={diff}
              className={`diff-btn ${difficulty === diff ? 'active' : ''}`}
              onClick={() => setDifficulty(diff)}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {highScores && highScores.length > 0 && (
        <div className="high-scores-section" style={{ marginBottom: '2rem' }}>
          <div className="high-scores-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Award size={16} style={{ color: 'var(--accent-laser)' }} /> personal bests
          </div>
          {highScores.slice(0, 3).map((scoreEntry, index) => (
            <div key={index} className="high-score-row">
              <span>#{index + 1} - Wave {scoreEntry.wave} ({scoreEntry.difficulty})</span>
              <span style={{ color: 'var(--accent-toxic)', fontWeight: '700' }}>{scoreEntry.score} pts</span>
            </div>
          ))}
        </div>
      )}

      <button className="btn-start" onClick={onStartGame}>
        start survival 🧟
      </button>
    </div>
  );
}

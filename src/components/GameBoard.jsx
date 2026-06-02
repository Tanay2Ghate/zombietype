import React, { useRef, useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function GameBoard({
  zombies,
  targetedZombieId,
  targetCharIndex,
  laserBeam,
  isDamaged,
  showBossWarning
}) {
  const boardRef = useRef(null);
  const [boardSize, setBoardSize] = useState({ width: 800, height: 480 });

  // Monitor board pixel size for laser coordinate calculation
  useEffect(() => {
    const handleResize = () => {
      if (boardRef.current) {
        setBoardSize({
          width: boardRef.current.clientWidth,
          height: boardRef.current.clientHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute laser lines from base center bottom (width / 2, height) to zombie coordinates
  const renderLaser = () => {
    if (!laserBeam || !laserBeam.active) return null;

    const startX = boardSize.width / 2;
    const startY = boardSize.height;

    // Convert target percentage positions to actual pixels
    const endX = (laserBeam.targetX / 100) * boardSize.width;
    const endY = (laserBeam.targetY / 100) * boardSize.height;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 8
        }}
      >
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="var(--accent-laser)"
          strokeWidth="4"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 8px var(--accent-laser))',
            opacity: 0.85,
            transition: 'opacity 0.1s ease'
          }}
        />
        <circle
          cx={endX}
          cy={endY}
          r="8"
          fill="var(--accent-laser)"
          style={{ filter: 'drop-shadow(0 0 10px var(--accent-laser))' }}
        />
      </svg>
    );
  };

  return (
    <div
      ref={boardRef}
      className={`arena-wrapper ${isDamaged ? 'shake-screen' : ''}`}
    >
      <div className="arena-grid"></div>

      {/* Spooky Damage Red Overlay */}
      {isDamaged && <div className="damage-flash"></div>}

      {/* SVG Lasers Overlay */}
      {renderLaser()}

      {/* Boss warning siren overlay */}
      {showBossWarning && (
        <div className="boss-warning-overlay">
          <div className="boss-warning-text">⚠️ BOSS INCOMING ⚠️</div>
          <div style={{ color: 'var(--accent-blood)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
            type the sentence to eliminate the behemoth!
          </div>
        </div>
      )}

      {/* Active Zombies */}
      {zombies.map((zombie) => {
        const isTargeted = zombie.id === targetedZombieId;
        
        // Character labeling & coloring logic
        const renderWord = () => {
          const letters = [];
          for (let i = 0; i < zombie.word.length; i++) {
            let letterClass = 'char-untyped';

            if (isTargeted) {
              if (i < targetCharIndex) {
                letterClass = 'char-correct';
              } else if (i === targetCharIndex) {
                letterClass = 'char-current';
              }
            }

            letters.push(
              <span key={i} className={letterClass}>
                {zombie.word[i] === ' ' ? '\u00A0' : zombie.word[i]}
              </span>
            );
          }
          return letters;
        };

        // Select sprite representation
        const getSprite = () => {
          switch (zombie.type) {
            case 'runner':
              return '🏃‍♂️';
            case 'tank':
              return '👹';
            case 'boss':
              return '👾';
            default:
              return '🧟';
          }
        };

        return (
          <div
            key={zombie.id}
            className={`zombie ${zombie.type}`}
            style={{
              left: `${zombie.x}%`,
              top: `${zombie.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Spinning crosshair if target-locked */}
            {isTargeted && <div className="crosshair"></div>}

            {/* Word label */}
            <div className={`zombie-tag ${isTargeted ? 'locked' : ''}`}>
              {renderWord()}
            </div>

            {/* Sprite character */}
            <div className="zombie-sprite">
              {getSprite()}
            </div>
            
            {/* Boss health bar */}
            {zombie.type === 'boss' && (
              <div style={{
                width: '120px',
                height: '6px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px',
                marginTop: '0.4rem',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(zombie.health / zombie.maxHealth) * 100}%`,
                  height: '100%',
                  backgroundColor: 'var(--accent-boss)',
                  boxShadow: '0 0 5px var(--accent-boss)',
                  transition: 'width 0.2s ease'
                }} />
              </div>
            )}
          </div>
        );
      })}

      {/* Defense Line barrier at the bottom */}
      <div className={`defense-barrier ${isDamaged ? 'damaged' : ''}`}></div>
    </div>
  );
}

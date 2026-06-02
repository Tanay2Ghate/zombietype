import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Skull } from 'lucide-react';
import MainMenu from './components/MainMenu';
import GameBoard from './components/GameBoard';
import GameOverScreen from './components/GameOverScreen';
import Footer from './components/Footer';
import { generateWords } from './utils/words';
import {
  playShoot,
  playExplosion,
  playHit,
  playBossAlert,
  playGameOver
} from './utils/audio';
import './App.css';

// Vocabulary filters based on difficulty
const EASY_WORDS = [
  "cat", "dog", "run", "fast", "zombie", "base", "wall", "laser", "fire",
  "code", "react", "html", "web", "sky", "dark", "neon", "shot", "dead",
  "kill", "life", "ammo", "gun", "gate", "glow", "pest", "rot", "acid"
];

const NORMAL_WORDS = [
  "survive", "defense", "barrier", "zombies", "lasers", "cyberpunk",
  "radioactive", "computer", "infected", "apocalypse", "monster",
  "radiation", "glitch", "destroy", "tactical", "terminal", "console",
  "keyboard", "outbreak", "containment", "virus", "hazmat", "biohazard"
];

const HARD_WORDS = [
  "apocalypse", "radioactive", "containment", "cybernetics", "nanotechnology",
  "destruction", "biochemical", "infestation", "quarantine", "engineering",
  "annihilation", "electromagnetic", "biosphere", "detonation", "hyperdrive",
  "catastrophe", "pathogen"
];

const BOSS_SENTENCES = [
  "we must defend the barrier at all costs",
  "humanity will survive this infected outbreak",
  "charge the plasma laser to maximum power",
  "the radioactive fallout is spreading fast",
  "system core temperature is rising critical",
  "neutralize the biohazard threat immediately",
  "unleash the orbital defense cannon payload"
];

const getDifficultySettingsByDiff = (diff) => {
  switch (diff) {
    case 'easy':
      return { spawnInterval: 4.2, baseSpeed: 4.5, maxZombies: 6 };
    case 'hard':
      return { spawnInterval: 1.8, baseSpeed: 9.5, maxZombies: 15 };
    default: // normal
      return { spawnInterval: 2.8, baseSpeed: 6.8, maxZombies: 10 };
  }
};

export default function App() {
  // Game Loop Control States
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing' | 'gameover'
  const [difficulty, setDifficulty] = useState('normal'); // 'easy' | 'normal' | 'hard'
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [hp, setHp] = useState(5); // Lives (max 5)
  const [zombiesKilled, setZombiesKilled] = useState(0);
  const [zombies, setZombies] = useState([]);
  
  // Targeting matching states
  const [targetedZombieId, setTargetedZombieId] = useState(null);
  const [targetCharIndex, setTargetCharIndex] = useState(0);

  // FX States
  const [laserBeam, setLaserBeam] = useState({ active: false, targetX: 0, targetY: 0 });
  const [isDamaged, setIsDamaged] = useState(false);
  const [showBossWarning, setShowBossWarning] = useState(false);

  // Statistics trackers
  const [accuracyTracker, setAccuracyTracker] = useState({ correct: 0, total: 0 });
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(100);
  
  // High Scores leaderboard
  const [highScores, setHighScores] = useState([]);

  // Loop & Timer refs
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);
  const spawnTimerRef = useRef(0);
  const zombiesSpawnedInWaveRef = useRef(0);
  const waveInProgressRef = useRef(false);

  // State refs to decouple 60fps frame loop from React render ticks
  const difficultyRef = useRef(difficulty);
  const waveRef = useRef(wave);
  const showBossWarningRef = useRef(showBossWarning);
  const scoreRef = useRef(score);
  const zombiesKilledRef = useRef(zombiesKilled);
  const accuracyTrackerRef = useRef(accuracyTracker);

  // Synchronise state values to refs
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { waveRef.current = wave; }, [wave]);
  useEffect(() => { showBossWarningRef.current = showBossWarning; }, [showBossWarning]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { zombiesKilledRef.current = zombiesKilled; }, [zombiesKilled]);
  useEffect(() => { accuracyTrackerRef.current = accuracyTracker; }, [accuracyTracker]);

  // Fetch local scores on load
  useEffect(() => {
    const scores = localStorage.getItem('zombie_typing_highscores');
    if (scores) {
      setHighScores(JSON.parse(scores));
    }
  }, []);

  // 1. Initializer to start match
  const startGame = () => {
    setScore(0);
    setWave(1);
    setHp(5);
    setZombiesKilled(0);
    setZombies([]);
    setTargetedZombieId(null);
    setTargetCharIndex(0);
    setLaserBeam({ active: false, targetX: 0, targetY: 0 });
    setIsDamaged(false);
    setShowBossWarning(false);
    setAccuracyTracker({ correct: 0, total: 0 });
    
    scoreRef.current = 0;
    waveRef.current = 1;
    zombiesKilledRef.current = 0;
    difficultyRef.current = difficulty;
    showBossWarningRef.current = false;
    accuracyTrackerRef.current = { correct: 0, total: 0 };

    zombiesSpawnedInWaveRef.current = 0;
    spawnTimerRef.current = 0;
    waveInProgressRef.current = true;
    startTimeRef.current = Date.now();
    
    setGameState('playing');
  };

  // Spawn single zombie (stable, reads from difficultyRef)
  const spawnZombie = useCallback((isBoss = false) => {
    const currentDiff = difficultyRef.current;
    
    // Choose word list based on difficulty
    let wordList = [...EASY_WORDS, ...NORMAL_WORDS];
    if (currentDiff === 'easy') wordList = EASY_WORDS;
    else if (currentDiff === 'hard') wordList = [...NORMAL_WORDS, ...HARD_WORDS];

    const randomWord = isBoss 
      ? BOSS_SENTENCES[Math.floor(Math.random() * BOSS_SENTENCES.length)]
      : wordList[Math.floor(Math.random() * wordList.length)];
    
    const settings = getDifficultySettingsByDiff(currentDiff);

    // Determine type
    let type = 'regular';
    if (!isBoss) {
      const rand = Math.random();
      if (rand < 0.2) type = 'runner'; // Fast, short words
      else if (rand < 0.35) type = 'tank'; // Slow, long words
    } else {
      type = 'boss';
    }

    const newZombie = {
      id: Date.now() + Math.random(),
      word: randomWord,
      x: 15 + Math.random() * 70, // Keep boundaries within 15% - 85% width
      y: 0,
      type: type,
      health: type === 'boss' ? 3 : 1, // boss takes 3 completed sentences to die
      maxHealth: 3
    };

    // Runner words should be shorter
    if (type === 'runner') {
      newZombie.word = EASY_WORDS[Math.floor(Math.random() * EASY_WORDS.length)];
    }

    setZombies(prev => [...prev, newZombie]);
  }, []);

  // 3. Trigger Game Over and Save Score (stable, reads from refs)
  const triggerGameOver = useCallback(() => {
    setGameState('gameover');
    playGameOver();

    // Calculate final metrics
    const duration = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 60;
    const durationMinutes = Math.max(duration, 5) / 60;
    
    const currentCorrect = accuracyTrackerRef.current.correct;
    const currentTotal = accuracyTrackerRef.current.total;
    const currentScore = scoreRef.current;
    const currentWave = waveRef.current;
    const currentDiff = difficultyRef.current;

    // 5 chars = 1 word
    const computedWpm = Math.round((currentCorrect / 5) / durationMinutes);
    const computedAcc = currentTotal > 0 
      ? Math.round((currentCorrect / currentTotal) * 100)
      : 100;

    setFinalWpm(Math.max(0, computedWpm));
    setFinalAccuracy(computedAcc);

    // Save and sort high scores in localStorage
    setHighScores(currScores => {
      const newScoreEntry = {
        score: currentScore,
        wave: currentWave,
        difficulty: currentDiff,
        timestamp: Date.now(),
        currentRunTimestamp: Date.now() // token to identify the current run row
      };

      const combined = [...currScores, newScoreEntry];
      // Sort scores descending, capping top 10 rankings
      const sorted = combined
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      // Keep track of the current entry relative in list
      const sortedWithTokens = sorted.map(s => {
        if (s.timestamp === newScoreEntry.timestamp) {
          return { ...s, currentRunTimestamp: newScoreEntry.timestamp };
        }
        return s;
      });

      localStorage.setItem('zombie_typing_highscores', JSON.stringify(sortedWithTokens));
      return sortedWithTokens;
    });
  }, []);

  // 2. MAIN 60fps GAME FRAME LOOP (stable, created once per play)
  useEffect(() => {
    if (gameState !== 'playing') return;

    let lastTime = performance.now();

    const updateGame = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const currentDiff = difficultyRef.current;
      const currentWave = waveRef.current;
      const isBossWarningActive = showBossWarningRef.current;

      const settings = getDifficultySettingsByDiff(currentDiff);
      const maxZombies = settings.maxZombies + currentWave * 2;
      const spawnInterval = Math.max(0.6, settings.spawnInterval - currentWave * 0.3);

      // Zombie spawn scheduler (if wave not fully spawned and not waiting for boss warning)
      if (waveInProgressRef.current && zombiesSpawnedInWaveRef.current < maxZombies && !isBossWarningActive) {
        spawnTimerRef.current += delta;
        if (spawnTimerRef.current >= spawnInterval) {
          spawnZombie(false);
          zombiesSpawnedInWaveRef.current += 1;
          spawnTimerRef.current = 0;
        }
      }

      // Physics update: Move active zombies down the board
      setZombies(prev => {
        let breached = 0;
        const next = prev.map(z => {
          let speedFactor = 1.0;
          if (z.type === 'runner') speedFactor = 1.85;
          if (z.type === 'tank') speedFactor = 0.5;
          if (z.type === 'boss') speedFactor = 0.22;

          // Speed scales up per wave (really fast!)
          const baseSpeed = settings.baseSpeed + currentWave * 1.5;
          const dy = baseSpeed * speedFactor * delta;

          return { ...z, y: z.y + dy };
        });

        // Exclude breached zombies
        const active = next.filter(z => {
          if (z.y >= 96) {
            breached++;
            return false;
          }
          return true;
        });

        if (breached > 0) {
          // Play hit impact sound and flash red
          playHit();
          setIsDamaged(true);
          setTimeout(() => setIsDamaged(false), 300);

          setHp(prevHp => {
            const newHp = Math.max(0, prevHp - breached);
            if (newHp <= 0) {
              triggerGameOver();
            }
            return newHp;
          });

          // Reset lock if target breached
          setTargetedZombieId(currTarget => {
            const stillActive = active.some(z => z.id === currTarget);
            if (!stillActive) {
              setTargetCharIndex(0);
              return null;
            }
            return currTarget;
          });
        }

        // Check if wave is complete and advance wave
        if (zombiesSpawnedInWaveRef.current >= maxZombies && active.length === 0 && waveInProgressRef.current) {
          waveInProgressRef.current = false;
          
          setWave(prevWave => {
            const nextWave = prevWave + 1;
            zombiesSpawnedInWaveRef.current = 0;
            spawnTimerRef.current = 0;

            // Trigger Alert if upcoming wave is a Boss wave (e.g. Wave 3, 6, 9...)
            if (nextWave % 3 === 0) {
              setShowBossWarning(true);
              playBossAlert();
              setTimeout(() => {
                setShowBossWarning(false);
                spawnZombie(true); // Spawn Behemoth Boss
                // Behemoth is the sole spawn, so lock spawns for this wave
                zombiesSpawnedInWaveRef.current = settings.maxZombies + nextWave * 2; 
                waveInProgressRef.current = true;
              }, 2500);
            } else {
              waveInProgressRef.current = true;
            }
            return nextWave;
          });
        }

        return active;
      });

      frameRef.current = requestAnimationFrame(updateGame);
    };

    frameRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, spawnZombie, triggerGameOver]);


  // 4. KEYBOARD INTERCEPT & TARGET ALGORITHM
  const handleKeyPress = useCallback((e) => {
    if (gameState !== 'playing') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === 'Escape' || e.key === 'Tab' || e.key === 'Enter') return;
    
    const typedChar = e.key;

    // SCENARIO A: User has an active target lock-on
    if (targetedZombieId !== null) {
      const targetZombie = zombies.find(z => z.id === targetedZombieId);
      
      if (targetZombie) {
        const expectedChar = targetZombie.word[targetCharIndex];

        if (typedChar === expectedChar) {
          // Correct keypress match!
          const nextCharIdx = targetCharIndex + 1;

          // Audio laser sweep & coordinate calculation for line draw
          playShoot();
          setLaserBeam({ active: true, targetX: targetZombie.x, targetY: targetZombie.y });
          setTimeout(() => setLaserBeam({ active: false, targetX: 0, targetY: 0 }), 100);

          // Accumulate statistics
          setAccuracyTracker(curr => ({ correct: curr.correct + 1, total: curr.total + 1 }));

          // Check if the current word/sentence is completed
          if (nextCharIdx >= targetZombie.word.length) {
            const nextHealth = targetZombie.health - 1;
            
            if (nextHealth <= 0) {
              // Eliminate Zombie!
              playExplosion();
              setZombies(prev => prev.filter(z => z.id !== targetedZombieId));
              setZombiesKilled(prev => prev + 1);

              // Increment scores
              let award = 10;
              if (targetZombie.type === 'runner') award = 20;
              if (targetZombie.type === 'tank') award = 35;
              if (targetZombie.type === 'boss') award = 200;
              setScore(prev => prev + award);

              // Break target lock
              setTargetCharIndex(0);
              setTargetedZombieId(null);
            } else {
              // Boss/Tank still has health segments left. Generate next sentence phase!
              playExplosion(); // minor explosion
              const nextSentence = BOSS_SENTENCES[Math.floor(Math.random() * BOSS_SENTENCES.length)];
              setZombies(prev => prev.map(z => {
                if (z.id === targetedZombieId) {
                  return { ...z, health: nextHealth, word: nextSentence };
                }
                return z;
              }));
              setTargetCharIndex(0); // restart typing target index for next sentence segment
            }
          } else {
            // Advance target char index in active word
            setTargetCharIndex(nextCharIdx);
          }
        } else {
          // Incorrect keypress on locked target
          setAccuracyTracker(curr => ({ ...curr, total: curr.total + 1 }));
        }
      } else {
        // Target vanished or was removed, release lock
        setTargetCharIndex(0);
        setTargetedZombieId(null);
      }

    } else {
      // SCENARIO B: User does not have a lock-on. Locate starting letters.
      // Select matching zombies, prioritising the lowest (closest to wall)
      const matches = zombies
        .filter(z => z.word[0] === typedChar)
        .sort((a, b) => b.y - a.y);

      if (matches.length > 0) {
        const selectedZombie = matches[0];
        
        playShoot();
        setLaserBeam({ active: true, targetX: selectedZombie.x, targetY: selectedZombie.y });
        setTimeout(() => setLaserBeam({ active: false, targetX: 0, targetY: 0 }), 100);

        setAccuracyTracker(curr => ({ correct: curr.correct + 1, total: curr.total + 1 }));

        // Edge case: word length of 1
        if (selectedZombie.word.length === 1) {
          playExplosion();
          setZombies(prev => prev.filter(z => z.id !== selectedZombie.id));
          setScore(prev => prev + 10);
          setZombiesKilled(prev => prev + 1);
          setTargetCharIndex(0);
          setTargetedZombieId(null);
        } else {
          // Normal lock-on trigger
          setTargetedZombieId(selectedZombie.id);
          setTargetCharIndex(1); // lock target and set active typed letter index to 1
        }
      } else {
        // Incorrect keypress (missed completely)
        setAccuracyTracker(curr => ({ ...curr, total: curr.total + 1 }));
      }
    }
  }, [gameState, zombies, targetedZombieId, targetCharIndex]);

  // Hook up event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const initTest = useCallback(() => {
    setZombies([]);
    setTargetedZombieId(null);
    setTargetCharIndex(0);
  }, []);

  const handleRestart = useCallback(() => {
    setGameState('menu');
    initTest();
  }, [initTest]);

  // Escape key to exit/reset match to menu
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleRestart();
      }
    };
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [handleRestart]);

  return (
    <>
      <div>
        <header>
          <div className="logo-container">
            <Skull size={32} className="logo-icon" />
            <span className="logo-text">zombietype</span>
          </div>
        </header>

        <main>
          {gameState === 'menu' && (
            <MainMenu
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              highScores={highScores}
              onStartGame={startGame}
            />
          )}

          {gameState === 'playing' && (
            <>
              {/* HUD Bar Display */}
              <div className="hud-bar">
                <div className="hud-item">
                  <span className="hud-label">health</span>
                  <span className="hud-value critical">
                    {Array.from({ length: hp }).map((_, i) => (
                      <span key={i} className="heart">❤️</span>
                    ))}
                    {hp === 0 && <span style={{ fontSize: '0.8rem' }}>DEFEATED</span>}
                  </span>
                </div>
                <div className="hud-item">
                  <span className="hud-label">wave</span>
                  <span className="hud-value highlight">{wave}</span>
                </div>
                <div className="hud-item">
                  <span className="hud-label">score</span>
                  <span className="hud-value highlight">{score}</span>
                </div>
                <div className="hud-item">
                  <span className="hud-label">kills</span>
                  <span className="hud-value">{zombiesKilled}</span>
                </div>
              </div>

              {/* Game board arena */}
              <GameBoard
                zombies={zombies}
                targetedZombieId={targetedZombieId}
                targetCharIndex={targetCharIndex}
                laserBeam={laserBeam}
                isDamaged={isDamaged}
                showBossWarning={showBossWarning}
              />
            </>
          )}

          {gameState === 'gameover' && (
            <GameOverScreen
              score={score}
              wave={wave}
              zombiesKilled={zombiesKilled}
              wpm={finalWpm}
              accuracy={finalAccuracy}
              difficulty={difficulty}
              highScores={highScores}
              onRestart={handleRestart}
            />
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}

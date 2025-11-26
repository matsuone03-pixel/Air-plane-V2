import React, { useState, useCallback } from 'react';
import GameEngine from './components/GameEngine';
import { DifficultyLevel, GameState } from './types';
import { DIFFICULTIES } from './constants';

// --- Inline SVG Icons (Replacing lucide-react for stability) ---
const IconWrapper: React.FC<{ children: React.ReactNode, size?: number, color?: string }> = ({ children, size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Shield = ({ size, color }: { size?: number, color?: string }) => (
  <IconWrapper size={size} color={color}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconWrapper>
);
const Target = ({ size, color }: { size?: number, color?: string }) => (
  <IconWrapper size={size} color={color}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></IconWrapper>
);
const Zap = ({ size, color }: { size?: number, color?: string }) => (
  <IconWrapper size={size} color={color}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></IconWrapper>
);
const Play = ({ size, fill }: { size?: number, fill?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill={fill || "none"} stroke={fill ? "none" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const RotateCcw = ({ size }: { size?: number }) => (
  <IconWrapper size={size}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></IconWrapper>
);
const MenuIcon = ({ size }: { size?: number }) => (
  <IconWrapper size={size}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></IconWrapper>
);
const ChevronRight = ({ size, color }: { size?: number, color?: string }) => (
  <IconWrapper size={size} color={color}><polyline points="9 18 15 12 9 6"/></IconWrapper>
);
const Skull = ({ size, color }: { size?: number, color?: string }) => (
  <IconWrapper size={size} color={color}><path d="M12 2c-3.87 0-7 3.13-7 7 0 2.25 1.07 4.25 2.74 5.57.85 1.57.9 3.25.9 4.43h6.72c0-1.18.05-2.86.9-4.43A7.002 7.002 0 0 0 19 9c0-3.87-3.13-7-7-7z"/><path d="M15 14a2 2 0 1 0-2 2"/></IconWrapper>
);

// --- Main App Component ---
function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('NORMAL');

  const handleGameOver = useCallback((finalScore: number) => {
    setGameState('gameover');
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
  }, [highScore]);

  // Throttled score update to prevent React render thrashing
  const handleScoreUpdate = useCallback((currentScore: number) => {
    setScore(currentScore);
  }, []);

  const startGame = () => setGameState('playing');
  const goToMenu = () => setGameState('menu');

  // Helper for dynamic theme colors
  const getThemeColorHex = () => {
    switch(difficulty) {
      case 'EASY': return '#3b82f6'; // Blue
      case 'NORMAL': return '#3b82f6'; // Blue
      case 'HARD': return '#9333ea'; // Purple
      case 'IMPOSSIBLE': return '#ef4444'; // Red
      default: return '#3b82f6';
    }
  };

  const getSubTitleText = () => {
    switch(difficulty) {
      case 'EASY': return 'Operational Readiness: Green';
      case 'NORMAL': return 'Operational Readiness: Standard';
      case 'HARD': return 'Warning: High Hostility';
      case 'IMPOSSIBLE': return 'DANGER: EXTREME HAZARD';
      default: return 'Operational Readiness: Green';
    }
  };

  const getDifficultyBtnStyle = (level: DifficultyLevel) => {
    const isSelected = difficulty === level;
    if (!isSelected) return {};
    
    let borderColor = '#3b82f6';
    let bgColor = '#eff6ff';

    if (level === 'HARD') {
      borderColor = '#9333ea';
      bgColor = '#faf5ff';
    } else if (level === 'IMPOSSIBLE') {
      borderColor = '#ef4444';
      bgColor = '#fef2f2';
    }

    return {
      borderColor: borderColor,
      backgroundColor: bgColor
    };
  };

  const getStartBtnStyle = () => {
    if (difficulty === 'IMPOSSIBLE') return { backgroundColor: '#ef4444' };
    if (difficulty === 'HARD') return { backgroundColor: '#9333ea' };
    return { backgroundColor: '#0f172a' };
  };

  return (
    <div className="full-screen" style={{ fontFamily: 'sans-serif' }}>
      {/* Game Layer */}
      <div className="full-screen z-0">
        <GameEngine 
          gameState={gameState} 
          difficulty={difficulty}
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
        />
      </div>

      {/* HUD (Head-up Display) */}
      {gameState === 'playing' && (
        <div className="hud-container z-10 pointer-events-none">
          <div className="hud-panel">
            <span className="text-label">Mission Score</span>
            <div className="text-score">
              {score.toLocaleString()}
            </div>
          </div>
          <div className="hud-badge">
             <span className="text-label" style={{ marginBottom: 0 }}>{DIFFICULTIES[difficulty].label}</span>
          </div>
        </div>
      )}

      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="full-screen z-20 menu-overlay">
          <div className="menu-content">
            <div className="icon-circle">
              <Target size={32} color={getThemeColorHex()} />
            </div>
            <h1 className="title-text" style={{ color: getThemeColorHex() }}>
              NEON TACTICAL
            </h1>
            <p className="subtitle-text">
              {getSubTitleText()}
            </p>

            {/* Difficulty Select */}
            <div className="difficulty-list">
              <p className="text-label" style={{ textAlign: 'center', color: '#94a3b8' }}>Select Difficulty</p>
              {(Object.keys(DIFFICULTIES) as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`difficulty-btn ${difficulty === level ? 'selected' : ''}`}
                  style={getDifficultyBtnStyle(level)}
                >
                  <div className="diff-content">
                    {level === 'EASY' && <Shield size={20} color={difficulty === level ? '#3b82f6' : '#94a3b8'} />}
                    {level === 'NORMAL' && <Target size={20} color={difficulty === level ? '#3b82f6' : '#94a3b8'} />}
                    {level === 'HARD' && <Zap size={20} color={difficulty === level ? '#9333ea' : '#94a3b8'} />}
                    {level === 'IMPOSSIBLE' && <Skull size={20} color={difficulty === level ? '#ef4444' : '#94a3b8'} />}
                    <div className="diff-text-group">
                      <div className="diff-name">
                        {DIFFICULTIES[level].label}
                      </div>
                      <div className="diff-desc">
                        {level === 'EASY' && 'Recruit'}
                        {level === 'NORMAL' && 'Veteran'}
                        {level === 'HARD' && 'Elite'}
                        {level === 'IMPOSSIBLE' && 'Legend'}
                      </div>
                    </div>
                  </div>
                  {difficulty === level && <ChevronRight size={20} color={getThemeColorHex()} />}
                </button>
              ))}
            </div>

            <button
              onClick={startGame}
              className="btn-primary"
              style={getStartBtnStyle()}
            >
              <span>ENGAGE</span>
              <Play size={20} fill="currentColor" />
            </button>
            
            {highScore > 0 && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>
                HIGH SCORE: <span style={{ color: '#1e293b' }}>{highScore.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="full-screen z-30 menu-overlay">
          <div className="menu-content">
            <h2 className="gameover-title">MIA</h2>
            <p className="subtitle-text" style={{ marginBottom: '2rem' }}>Mission Failed</p>
            
            <div className="gameover-card">
              <div className="text-label">Final Score</div>
              <div className="text-score" style={{ fontSize: '2.5rem' }}>
                {score.toLocaleString()}
              </div>
              
              <div className="score-row">
                 <span className="text-label" style={{ marginBottom: 0 }}>Best</span>
                 <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#475569' }}>{Math.max(score, highScore).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <button
                onClick={startGame}
                className="btn-primary"
              >
                <RotateCcw size={20} />
                <span>RETRY MISSION</span>
              </button>
              
              <button
                onClick={goToMenu}
                className="btn-secondary"
              >
                <MenuIcon size={16} />
                <span>RETURN TO BASE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
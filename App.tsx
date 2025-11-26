import React, { useState, useCallback } from 'react';
import GameEngine from './components/GameEngine';
import { DifficultyLevel, GameState } from './types';
import { Shield, Target, Zap, Play, RotateCcw, Menu as MenuIcon, ChevronRight, Skull } from 'lucide-react';
import { DIFFICULTIES } from './constants';

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
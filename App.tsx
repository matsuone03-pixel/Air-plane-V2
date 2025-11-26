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

  // Helper for dynamic title coloring
  const getThemeColor = () => {
    switch(difficulty) {
      case 'EASY': return 'text-blue-500';
      case 'NORMAL': return 'text-blue-600';
      case 'HARD': return 'text-purple-600';
      case 'IMPOSSIBLE': return 'text-red-600';
      default: return 'text-blue-600';
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

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-slate-800">
      {/* Game Layer */}
      <div className="absolute inset-0 z-0">
        <GameEngine 
          gameState={gameState} 
          difficulty={difficulty}
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
        />
      </div>

      {/* HUD (Head-up Display) - Only visible when playing */}
      {gameState === 'playing' && (
        <div className="absolute top-0 left-0 w-full p-4 z-10 pointer-events-none flex justify-between items-start">
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Mission Score</div>
            <div className="text-3xl font-black text-slate-800 tabular-nums leading-none">
              {score.toLocaleString()}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
             <span className="text-xs font-bold text-slate-500 tracking-widest">{DIFFICULTIES[difficulty].label}</span>
          </div>
        </div>
      )}

      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-fade-in transition-colors duration-500">
          <div className="max-w-md w-full px-6 flex flex-col items-center">
            <div className="mb-2 p-3 bg-slate-100 rounded-full">
              <Target className={`w-8 h-8 ${getThemeColor()}`} />
            </div>
            <h1 className={`text-4xl font-black mb-2 tracking-tight text-center transition-colors duration-300 ${getThemeColor()}`}>
              NEON TACTICAL
            </h1>
            <p className="text-slate-500 mb-8 tracking-widest text-sm font-medium uppercase transition-all duration-300">
              {getSubTitleText()}
            </p>

            {/* Difficulty Select */}
            <div className="w-full mb-8 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Select Difficulty</p>
              {(Object.keys(DIFFICULTIES) as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                    difficulty === level 
                      ? 'border-current bg-opacity-10 shadow-md transform scale-102' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                  style={{
                    borderColor: difficulty === level ? (level === 'IMPOSSIBLE' ? '#ef4444' : level === 'HARD' ? '#9333ea' : '#3b82f6') : '',
                    backgroundColor: difficulty === level ? (level === 'IMPOSSIBLE' ? '#fef2f2' : level === 'HARD' ? '#faf5ff' : '#eff6ff') : ''
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {level === 'EASY' && <Shield className={`w-5 h-5 ${difficulty === level ? 'text-blue-600' : 'text-slate-400'}`} />}
                    {level === 'NORMAL' && <Target className={`w-5 h-5 ${difficulty === level ? 'text-blue-600' : 'text-slate-400'}`} />}
                    {level === 'HARD' && <Zap className={`w-5 h-5 ${difficulty === level ? 'text-purple-600' : 'text-slate-400'}`} />}
                    {level === 'IMPOSSIBLE' && <Skull className={`w-5 h-5 ${difficulty === level ? 'text-red-600' : 'text-slate-400'}`} />}
                    <div className="text-left">
                      <div className={`font-bold text-sm ${difficulty === level ? 'text-slate-900' : 'text-slate-600'}`}>
                        {DIFFICULTIES[level].label}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {level === 'EASY' && 'Recruit'}
                        {level === 'NORMAL' && 'Veteran'}
                        {level === 'HARD' && 'Elite'}
                        {level === 'IMPOSSIBLE' && 'Legend'}
                      </div>
                    </div>
                  </div>
                  {difficulty === level && <ChevronRight className={`w-5 h-5 ${getThemeColor()}`} />}
                </button>
              ))}
            </div>

            <button
              onClick={startGame}
              className={`group relative w-full py-4 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 flex items-center justify-center space-x-2 ${
                difficulty === 'IMPOSSIBLE' ? 'bg-red-600 hover:bg-red-700' : 
                difficulty === 'HARD' ? 'bg-purple-600 hover:bg-purple-700' : 
                'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              <span>ENGAGE</span>
              <Play className="w-5 h-5 fill-current" />
            </button>
            
            {highScore > 0 && (
              <div className="mt-6 text-sm font-medium text-slate-400">
                HIGH SCORE: <span className="text-slate-800">{highScore.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md animate-fade-in">
          <div className="text-center">
            <h2 className="text-5xl font-black text-red-500 mb-2 tracking-tighter">MIA</h2>
            <p className="text-slate-500 text-lg font-medium tracking-widest uppercase mb-8">Mission Failed</p>
            
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-8 min-w-[280px]">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Final Score</div>
              <div className="text-4xl font-black text-slate-800 tabular-nums">
                {score.toLocaleString()}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-xs text-slate-400 font-bold uppercase">Best</span>
                 <span className="text-lg font-bold text-slate-600">{Math.max(score, highScore).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg shadow-lg hover:bg-slate-800 hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>RETRY MISSION</span>
              </button>
              
              <button
                onClick={goToMenu}
                className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors flex items-center justify-center space-x-2"
              >
                <MenuIcon className="w-4 h-4" />
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
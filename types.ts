
export type GameState = 'menu' | 'playing' | 'gameover';

export type DifficultyLevel = 'EASY' | 'NORMAL' | 'HARD' | 'IMPOSSIBLE';

export interface DifficultyConfig {
  label: string;
  spawnRateBase: number; // Higher is slower
  bulletSpeedMult: number;
  enemyHpMult: number;
  scoreMultiplier: number;
  playerShotInterval: number; // Frames between shots (Lower is faster)
}

export interface GameObject {
  x: number;
  y: number;
}

export interface Player extends GameObject {
  size: number;
  hitSize: number;
}

export interface Bullet extends GameObject {
  vx: number;
  vy: number;
  color: string;
}

export interface Enemy extends GameObject {
  type: 'triangle' | 'square' | 'circle' | 'pentagon';
  hp: number;
  maxHp: number;
  color: string;
  size: number;
  speed: number;
  hasShot: boolean;
  scoreValue: number;
}

export interface Particle extends GameObject {
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

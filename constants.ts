
import { DifficultyConfig, DifficultyLevel } from "./types";

export const DIFFICULTIES: Record<DifficultyLevel, DifficultyConfig> = {
  EASY: {
    label: "RECRUIT",
    spawnRateBase: 80, // Slower start to allow scaling
    bulletSpeedMult: 0.7,
    enemyHpMult: 1.0, // Unified HP
    scoreMultiplier: 0.5,
    playerShotInterval: 14, // Starts slow, gets faster
  },
  NORMAL: {
    label: "VETERAN",
    spawnRateBase: 65,
    bulletSpeedMult: 0.9,
    enemyHpMult: 1.0, // Unified HP
    scoreMultiplier: 1.0,
    playerShotInterval: 10, // Increased speed (was 12)
  },
  HARD: {
    label: "ELITE",
    spawnRateBase: 50,
    bulletSpeedMult: 1.2,
    enemyHpMult: 1.0, // Unified HP
    scoreMultiplier: 2.0,
    playerShotInterval: 8, // Adjusted to be faster than Normal
  },
  IMPOSSIBLE: {
    label: "LEGEND",
    spawnRateBase: 40,
    bulletSpeedMult: 1.4,
    enemyHpMult: 1.0, // Unified HP
    scoreMultiplier: 5.0,
    playerShotInterval: 6, // Fastest
  }
};

export const COLORS = {
  player: '#3b82f6', // blue-500
  playerCore: '#ef4444', // red-500
  bullet: '#1e293b', // slate-800
  
  enemyTriangle: '#eab308', // yellow-500
  enemySquare: '#f97316', // orange-500
  enemyCircle: '#ef4444', // red-500
  enemyPentagon: '#d946ef', // fuchsia-500
};

export const PLAYER_SIZE = 12;
export const PLAYER_HIT_SIZE = 6;
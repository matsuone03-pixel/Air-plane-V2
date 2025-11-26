import React, { useEffect, useRef } from 'react';
import { Bullet, Enemy, Particle, Player, DifficultyLevel } from '../types';
import { DIFFICULTIES, COLORS, PLAYER_SIZE, PLAYER_HIT_SIZE } from '../constants';

interface GameEngineProps {
  gameState: 'menu' | 'playing' | 'gameover';
  difficulty: DifficultyLevel;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ gameState, difficulty, onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game State Refs (Mutable to avoid re-renders)
  const scoreRef = useRef(0);
  const frameCountRef = useRef(0);
  const playerRef = useRef<Player>({ x: 0, y: 0, size: PLAYER_SIZE, hitSize: PLAYER_HIT_SIZE });
  const targetRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  
  const pBulletsRef = useRef<GameObject[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const eBulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize Game
  const resetGame = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    scoreRef.current = 0;
    frameCountRef.current = 0;
    pBulletsRef.current = [];
    enemiesRef.current = [];
    eBulletsRef.current = [];
    particlesRef.current = [];
    
    playerRef.current = { 
      x: canvas.width / 2, 
      y: canvas.height - 100, 
      size: PLAYER_SIZE, 
      hitSize: PLAYER_HIT_SIZE 
    };
    targetRef.current = { x: playerRef.current.x, y: playerRef.current.y };
    onScoreUpdate(0);
  };

  // Helper: Create explosion particles
  const createParticles = (x: number, y: number, color: string, count: number, speedMult = 1) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 * speedMult;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
        size: Math.random() * 3 + 2
      });
    }
  };

  // Helper: Fire Enemy Bullet
  const fireEnemyBullet = (x: number, y: number, angle: number, speed: number, color: string) => {
    eBulletsRef.current.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // If menu, center player
      if (gameState === 'menu') {
        playerRef.current.x = canvas.width / 2;
        playerRef.current.y = canvas.height - 100;
        targetRef.current = { x: canvas.width / 2, y: canvas.height - 100 };
      }
    };
    window.addEventListener('resize', resize);
    resize();

    // Input Handling
    const handleInput = (clientX: number, clientY: number, isTouch: boolean) => {
      if (gameState !== 'playing') return;
      targetRef.current.x = clientX;
      // On mobile, offset Y so finger doesn't cover ship
      targetRef.current.y = isTouch ? clientY - 70 : clientY;
    };

    const onMouseMove = (e: MouseEvent) => handleInput(e.clientX, e.clientY, false);
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleInput(e.touches[0].clientX, e.touches[0].clientY, true);
    };
    const onTouchStart = (e: TouchEvent) => {
      // e.preventDefault(); // allow click events for buttons
      handleInput(e.touches[0].clientX, e.touches[0].clientY, true);
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });

    // Main Loop
    const loop = () => {
      if (!ctx || !canvas) return;

      // Clear Screen
      ctx.fillStyle = '#f8fafc'; // slate-50
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameState === 'playing') {
        const diffConfig = DIFFICULTIES[difficulty];

        // --- UPDATE ---
        frameCountRef.current++;

        // Calculate Scaling Tier (Every 500 score)
        const scalingTier = Math.floor(scoreRef.current / 500);

        // Move Player (Smooth Lerp)
        const p = playerRef.current;
        const t = targetRef.current;
        p.x += (t.x - p.x) * 0.15;
        p.y += (t.y - p.y) * 0.15;

        // Clamp Player
        p.x = Math.max(p.size, Math.min(canvas.width - p.size, p.x));
        p.y = Math.max(p.size, Math.min(canvas.height - p.size, p.y));

        // Player Shoot
        // Dynamic Fire Rate: Reduces interval by 1 frame every 500 points
        // Cap minimum interval at 4 frames (super fast)
        const currentShotInterval = Math.max(4, diffConfig.playerShotInterval - scalingTier);
        
        if (frameCountRef.current % currentShotInterval === 0) {
          pBulletsRef.current.push({ x: p.x, y: p.y - 20 });
        }

        // Spawn Enemies
        // Dynamic Spawn Rate: Reduces interval by 4 frames every 500 points
        // Cap minimum spawn interval at 10 frames
        const spawnReduction = scalingTier * 4;
        const currentSpawnRate = Math.max(10, diffConfig.spawnRateBase - spawnReduction);
        
        if (frameCountRef.current % currentSpawnRate === 0) {
            const rand = Math.random();
            let type: Enemy['type'] = 'triangle'; // Default
            
            // Logic for enemy selection based on difficulty
            if (difficulty === 'EASY') {
                // EASY: Yellow (Triangle) & Orange (Square) only
                if (rand < 0.6) type = 'triangle';
                else type = 'square';
            } 
            else if (difficulty === 'NORMAL') {
                // NORMAL: All types available
                if (rand < 0.15) type = 'pentagon';
                else if (rand < 0.50) type = 'triangle';
                else if (rand < 0.90) type = 'square';
                else type = 'circle';
            } 
            else if (difficulty === 'HARD') {
                // HARD: All types available
                if (rand < 0.20) type = 'pentagon';
                else if (rand < 0.50) type = 'triangle';
                else if (rand < 0.85) type = 'square';
                else type = 'circle';
            } 
            else if (difficulty === 'IMPOSSIBLE') {
                // IMPOSSIBLE: Pink (Pentagon) & Red (Circle) only
                if (rand < 0.4) type = 'pentagon';
                else type = 'circle';
            }

            let hp, color, speed, scoreVal;
            const size = 18;

            // Unified HP Logic: Yellow=1, Orange=5, Pink=6, Red=6
            // Updated Score: Yellow=30, Orange=50, Pink=100, Red=150
            switch(type) {
                case 'triangle':
                    hp = 1; 
                    color = COLORS.enemyTriangle;
                    speed = (canvas.height / 180) + Math.random();
                    scoreVal = 30;
                    break;
                case 'square':
                    hp = 5;
                    color = COLORS.enemySquare;
                    speed = (canvas.height / 400) + Math.random();
                    scoreVal = 50;
                    break;
                case 'pentagon':
                    hp = 6;
                    color = COLORS.enemyPentagon;
                    speed = (canvas.height / 300) + Math.random();
                    scoreVal = 100; // Updated from 150
                    break;
                case 'circle':
                    hp = 6;
                    color = COLORS.enemyCircle;
                    speed = canvas.height / 250;
                    scoreVal = 200; // Updated from 150
                    break;
            }

            enemiesRef.current.push({
                x: Math.random() * (canvas.width - 40) + 20,
                y: -40,
                type, hp, maxHp: hp, color, size, speed, hasShot: false, scoreValue: scoreVal
            });
        }

        // Update Player Bullets
        for (let i = pBulletsRef.current.length - 1; i >= 0; i--) {
            const b = pBulletsRef.current[i];
            b.y -= 20; // Fast bullets
            if (b.y < -20) pBulletsRef.current.splice(i, 1);
        }

        // Update Enemies
        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
            const e = enemiesRef.current[i];
            e.y += e.speed;

            // Enemy Attack Logic
            if (e.y > 0 && e.y < canvas.height) {
                // Triangle & Square: Aimed Shot
                if ((e.type === 'triangle' || e.type === 'square') && !e.hasShot) {
                    const triggerY = e.type === 'triangle' ? canvas.height * 0.2 : canvas.height * 0.3;
                    if (e.y > triggerY) {
                        const angle = Math.atan2(p.y - e.y, p.x - e.x);
                        fireEnemyBullet(e.x, e.y, angle, 6 * diffConfig.bulletSpeedMult, e.color);
                        e.hasShot = true;
                    }
                }
                // Circle: Rapid Fire
                if (e.type === 'circle' && frameCountRef.current % 40 === 0) {
                    const angle = Math.atan2(p.y - e.y, p.x - e.x);
                    fireEnemyBullet(e.x, e.y, angle, 7 * diffConfig.bulletSpeedMult, e.color);
                }
                // Pentagon: All-Direction Spread
                if (e.type === 'pentagon' && !e.hasShot) {
                    if (e.y > canvas.height * 0.25) {
                        e.hasShot = true;
                        const bulletCount = 12;
                        for (let k = 0; k < bulletCount; k++) {
                            const angle = (Math.PI * 2 / bulletCount) * k;
                            // Adding a small twist based on time
                            const offset = (Date.now() / 1000); 
                            fireEnemyBullet(e.x, e.y, angle + offset, 4 * diffConfig.bulletSpeedMult, e.color);
                        }
                        // Slow down after shooting
                        e.speed *= 0.5;
                    }
                }
            }

            // Collision: Enemy vs Player
            const dist = Math.hypot(p.x - e.x, p.y - e.y);
            if (dist < p.hitSize + e.size) {
                createParticles(p.x, p.y, COLORS.player, 50, 2);
                onGameOver(Math.floor(scoreRef.current));
                return; // Stop update loop for this frame
            }

            // Collision: Player Bullet vs Enemy
            for (let j = pBulletsRef.current.length - 1; j >= 0; j--) {
                const b = pBulletsRef.current[j];
                if (Math.abs(b.x - e.x) < e.size + 10 && Math.abs(b.y - e.y) < e.size + 10) {
                    createParticles(e.x, e.y, e.color, 3); // Hit effect
                    pBulletsRef.current.splice(j, 1);
                    e.hp--;
                    if (e.hp <= 0) {
                        createParticles(e.x, e.y, e.color, 15, 1.5); // Explosion
                        scoreRef.current += e.scoreValue * diffConfig.scoreMultiplier;
                        onScoreUpdate(Math.floor(scoreRef.current));
                        enemiesRef.current.splice(i, 1);
                        break;
                    }
                }
            }

            if (e.y > canvas.height + 50) enemiesRef.current.splice(i, 1);
        }

        // Update Enemy Bullets
        for (let i = eBulletsRef.current.length - 1; i >= 0; i--) {
            const b = eBulletsRef.current[i];
            b.x += b.vx;
            b.y += b.vy;

            const dist = Math.hypot(p.x - b.x, p.y - b.y);
            if (dist < p.hitSize + 4) {
                createParticles(p.x, p.y, COLORS.player, 50, 2);
                onGameOver(Math.floor(scoreRef.current));
                return;
            }

            if (b.x < -50 || b.x > canvas.width + 50 || b.y > canvas.height + 50 || b.y < -50) {
                eBulletsRef.current.splice(i, 1);
            }
        }

        // Update Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const pt = particlesRef.current[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.life -= 0.04;
            if (pt.life <= 0) particlesRef.current.splice(i, 1);
        }
      } // End Playing State

      // --- DRAWING ---

      // Draw Player
      const p = playerRef.current;
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.arc(p.x, p.y + 20, p.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Ship
      ctx.fillStyle = COLORS.player;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.size * 1.5);
      ctx.lineTo(p.x - p.size, p.y + p.size);
      ctx.lineTo(p.x, p.y + p.size * 0.5);
      ctx.lineTo(p.x + p.size, p.y + p.size);
      ctx.closePath();
      ctx.fill();
      
      // Core
      ctx.fillStyle = COLORS.playerCore;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw Player Bullets
      ctx.fillStyle = '#1e293b';
      pBulletsRef.current.forEach(b => {
          ctx.fillRect(b.x - 2, b.y, 4, 15);
      });

      // Draw Enemies
      enemiesRef.current.forEach(e => {
          ctx.fillStyle = e.color;
          if (e.type === 'triangle') {
              ctx.beginPath();
              ctx.moveTo(e.x, e.y + e.size);
              ctx.lineTo(e.x - e.size, e.y - e.size);
              ctx.lineTo(e.x + e.size, e.y - e.size);
              ctx.fill();
          } else if (e.type === 'square') {
              ctx.fillRect(e.x - e.size, e.y - e.size, e.size * 2, e.size * 2);
          } else if (e.type === 'pentagon') {
              // Draw Pentagon for the new enemy
              ctx.beginPath();
              for (let k = 0; k < 5; k++) {
                  const angle = (Math.PI * 2 * k) / 5 - Math.PI / 2;
                  const px = e.x + Math.cos(angle) * e.size;
                  const py = e.y + Math.sin(angle) * e.size;
                  if (k === 0) ctx.moveTo(px, py);
                  else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.fill();
              // Inner glowing core
              ctx.fillStyle = '#fdf4ff'; // light pink
              ctx.beginPath();
              ctx.arc(e.x, e.y, e.size / 2, 0, Math.PI*2);
              ctx.fill();
          } else {
              // Circle
              ctx.beginPath();
              ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#fff';
              ctx.fillRect(e.x - 2, e.y - 8, 4, 16);
              ctx.fillRect(e.x - 8, e.y - 2, 16, 4);
          }
      });

      // Draw Enemy Bullets
      eBulletsRef.current.forEach(b => {
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
          ctx.fill();
      });

      // Draw Particles
      particlesRef.current.forEach(pt => {
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = pt.life;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
      });

      requestRef.current = requestAnimationFrame(loop);
    };

    // Start Loop
    requestRef.current = requestAnimationFrame(loop);

    return () => {
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchstart', onTouchStart);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, difficulty, onGameOver, onScoreUpdate]);

  // Effect to reset game when entering playing state
  useEffect(() => {
    if (gameState === 'playing') {
        resetGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', background: '#fff' }} />;
};

interface GameObject { x: number, y: number }

export default GameEngine;
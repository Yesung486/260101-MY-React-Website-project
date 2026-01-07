import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, Player, Enemy, Projectile, Particle, EnemyType, Item, PlayerUpgrades } from '../types';
import { soundManager } from '../utils/audio';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setScore: (score: number) => void;
  setFragments: (frags: number) => void;
  setHp: (hp: number) => void;
  setMaxHp: (maxHp: number) => void;
  setBossHp: (hp: number | null) => void;
  isPaused: boolean;
  upgrades: PlayerUpgrades;
  currentFragments: number; // Added for sync
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Evolution Breakpoints
const EVOLUTION_REQ = [0, 10, 25, 50, 80]; 

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  setScore, 
  setFragments, 
  setHp,
  setMaxHp,
  setBossHp,
  isPaused,
  upgrades,
  currentFragments
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game Entities Refs
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100,
    width: 32, height: 48,
    dx: 0, dy: 0,
    color: '#00f0ff',
    hp: 3, maxHp: 3,
    level: 1, score: 0, fragments: 0, iframe: 0, shieldActive: false
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const itemsRef = useRef<Item[]>([]); // Core Fragments
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const frameCount = useRef(0);
  const starsRef = useRef<{x: number, y: number, size: number, speed: number, layer: number}[]>([]);
  const bossSpawnedRef = useRef(false);

  // Sync prop fragments with internal ref for upgrades
  useEffect(() => {
     if (playerRef.current && isPaused) {
         playerRef.current.fragments = currentFragments;
     }
  }, [currentFragments, isPaused]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current[e.key] = true;
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current[e.key] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Initialize Parallax Stars
    if (starsRef.current.length === 0) {
      for(let i=0; i<40; i++) {
        starsRef.current.push({
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 1 + 0.2,
          layer: Math.random() > 0.8 ? 2 : 1 // 1=far, 2=close
        });
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Helper: Create Explosion
  const createExplosion = (x: number, y: number, color: string, count: number = 15) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x, y, width: 0, height: 0,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        color: color,
        life: 1.0, maxLife: 1.0, alpha: 1, size: Math.random() * 4 + 2
      });
    }
  };

  const spawnItem = (x: number, y: number) => {
    // 30% chance to drop Core Fragment
    if (Math.random() < 0.3) {
      itemsRef.current.push({
        x, y, dx: (Math.random() - 0.5) * 2, dy: (Math.random() - 0.5) * 2,
        width: 12, height: 12, color: '#aaddff', magnetized: false, value: 1
      });
    }
  };

  const createEnemy = (x: number, y: number, type: EnemyType): Enemy => {
    let hp = 1, w = 30, h = 30, color = '#ff5555';
    
    switch(type) {
      case EnemyType.DRONE: 
        hp = 1; w = 30; h = 30; color = '#aa4444'; break;
      case EnemyType.INTERCEPTOR: 
        hp = 5; w = 40; h = 40; color = '#ffaa00'; break;
      case EnemyType.DESTROYER: 
        hp = 40; w = 80; h = 80; color = '#cc22cc'; break;
      case EnemyType.MONARCH: 
        hp = 200; w = 150; h = 120; color = '#ffffff'; break;
    }

    return {
      x, y, dx: 0, dy: 0, width: w, height: h, color, type, hp, maxHp: hp, shootTimer: 0
    };
  };

  const resetGame = () => {
    playerRef.current = {
      x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100,
      width: 32, height: 48,
      dx: 0, dy: 0,
      color: '#00f0ff',
      hp: 3, maxHp: 3,
      level: 1, score: 0, fragments: 0, iframe: 0, shieldActive: false
    };
    enemiesRef.current = [];
    projectilesRef.current = [];
    itemsRef.current = [];
    bossSpawnedRef.current = false;
    frameCount.current = 0;
    
    setScore(0);
    setFragments(0);
    setHp(3);
    setMaxHp(3);
    setBossHp(null);
  };

  // --- Main Update Loop ---
  const update = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    if (isPaused) return; 

    frameCount.current++;
    const player = playerRef.current;

    // 1. Player Physics (Inertia)
    const acceleration = 0.5; // Acceleration force
    const friction = 0.90;    // Friction (0.9 implies drift)
    
    // Input -> Acceleration
    if (keysPressed.current['ArrowUp'] || keysPressed.current['w'] || keysPressed.current['ㅈ']) player.dy -= acceleration;
    if (keysPressed.current['ArrowDown'] || keysPressed.current['s'] || keysPressed.current['ㄴ']) player.dy += acceleration;
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || keysPressed.current['ㅁ']) player.dx -= acceleration;
    if (keysPressed.current['ArrowRight'] || keysPressed.current['d'] || keysPressed.current['ㅇ']) player.dx += acceleration;

    // Velocity Clamping & Friction
    player.dx *= friction;
    player.dy *= friction;
    
    // Apply Velocity
    player.x += player.dx;
    player.y += player.dy;

    // Boundary Constraint (Player) - STRICT
    player.x = Math.max(player.width/2, Math.min(CANVAS_WIDTH - player.width/2, player.x));
    player.y = Math.max(player.height/2, Math.min(CANVAS_HEIGHT - player.height/2, player.y));

    // Shield Logic (Gamma Lvl 3)
    if (player.iframe > 0) player.iframe--;

    // 2. Player Shooting & Evolution
    // Determine Level based on Fragments
    let newLevel = 1;
    if (player.fragments >= EVOLUTION_REQ[4]) newLevel = 5;
    else if (player.fragments >= EVOLUTION_REQ[3]) newLevel = 4;
    else if (player.fragments >= EVOLUTION_REQ[2]) newLevel = 3;
    else if (player.fragments >= EVOLUTION_REQ[1]) newLevel = 2;
    
    if (newLevel !== player.level) {
      const leveledUp = newLevel > player.level;
      player.level = newLevel;
      if (leveledUp) soundManager.playPowerUp(); 
      player.width = 32 + (newLevel * 4);
      player.height = 48 + (newLevel * 2);
    }

    // --- UPGRADE: FIRE RATE ---
    const fireInterval = Math.max(3, 8 - upgrades.fireRate);

    if (frameCount.current % fireInterval === 0) { // Fire Rate
       soundManager.playShoot(player.level);
       
       // ADJUSTED: Slower Bullet Speed for Level 1 feel
       const bSpeed = 8 + (player.level * 1.5); // Starts at 8, gets faster with levels
       
       const pX = player.x;
       const pY = player.y - player.height/2;

       // --- UPGRADE: DAMAGE ---
       const dmgMult = 1 + (upgrades.damage * 0.25); // +25% per level

       // Level 1: Epsilon (Single)
       if (player.level === 1) {
          projectilesRef.current.push({ x: pX, y: pY, dx: 0, dy: -bSpeed, width: 4, height: 12, color: '#ffff00', damage: 1 * dmgMult, isEnemy: false });
       }
       // Level 2: Delta (Double + Speed)
       else if (player.level === 2) {
          projectilesRef.current.push({ x: pX - 8, y: pY, dx: 0, dy: -bSpeed, width: 5, height: 15, color: '#aaff00', damage: 1.2 * dmgMult, isEnemy: false });
          projectilesRef.current.push({ x: pX + 8, y: pY, dx: 0, dy: -bSpeed, width: 5, height: 15, color: '#aaff00', damage: 1.2 * dmgMult, isEnemy: false });
       }
       // Level 3: Gamma (Spread)
       else if (player.level === 3) {
          projectilesRef.current.push({ x: pX, y: pY, dx: 0, dy: -bSpeed, width: 6, height: 18, color: '#00ffff', damage: 1.5 * dmgMult, isEnemy: false });
          projectilesRef.current.push({ x: pX, y: pY, dx: -3, dy: -bSpeed * 0.9, width: 5, height: 12, color: '#00ffff', damage: 1 * dmgMult, isEnemy: false });
          projectilesRef.current.push({ x: pX, y: pY, dx: 3, dy: -bSpeed * 0.9, width: 5, height: 12, color: '#00ffff', damage: 1 * dmgMult, isEnemy: false });
       }
       // Level 4: Beta (Homing)
       else if (player.level === 4) {
          projectilesRef.current.push({ x: pX - 10, y: pY, dx: 0, dy: -bSpeed, width: 8, height: 20, color: '#ff00ff', damage: 2 * dmgMult, isEnemy: false });
          projectilesRef.current.push({ x: pX + 10, y: pY, dx: 0, dy: -bSpeed, width: 8, height: 20, color: '#ff00ff', damage: 2 * dmgMult, isEnemy: false });
          // Missiles
          if (frameCount.current % (fireInterval * 2) === 0) {
             projectilesRef.current.push({ x: pX, y: pY, dx: -5, dy: -5, width: 8, height: 8, color: '#ffaaaa', damage: 3 * dmgMult, isEnemy: false, homing: true });
             projectilesRef.current.push({ x: pX, y: pY, dx: 5, dy: -5, width: 8, height: 8, color: '#ffaaaa', damage: 3 * dmgMult, isEnemy: false, homing: true });
          }
       }
       // Level 5: Origin Alpha (Laser)
       else if (player.level === 5) {
          // Massive center beam
          projectilesRef.current.push({ x: pX, y: pY, dx: 0, dy: -25, width: 60, height: 100, color: '#ffd700', damage: 5 * dmgMult, isEnemy: false, isLaser: true });
       }
    }

    // 3. Enemy Spawning Logic
    // Boss Spawn
    if (player.score >= 7000 && !bossSpawnedRef.current) {
      bossSpawnedRef.current = true;
      enemiesRef.current = []; // Clear other enemies
      enemiesRef.current.push(createEnemy(CANVAS_WIDTH/2, -150, EnemyType.MONARCH));
    }

    if (!bossSpawnedRef.current) {
      const spawnRate = Math.max(30, 100 - player.score / 100);
      if (frameCount.current % Math.floor(spawnRate) === 0) {
        const x = Math.random() * (CANVAS_WIDTH - 60) + 30;
        
        // Destroyer (Mid Boss) Check
        if (player.score >= 3000 && Math.random() < 0.05 && !enemiesRef.current.some(e=>e.type === EnemyType.DESTROYER)) {
           enemiesRef.current.push(createEnemy(x, -50, EnemyType.DESTROYER));
        }
        // Interceptor Check
        else if (player.score >= 1000 && Math.random() < 0.4) {
           enemiesRef.current.push(createEnemy(x, -40, EnemyType.INTERCEPTOR));
        }
        // Drone
        else {
           enemiesRef.current.push(createEnemy(x, -30, EnemyType.DRONE));
        }
      }
    }

    // 4. Update Enemies
    let bossCurrentHp: number | null = null;
    enemiesRef.current.forEach(e => {
       if (e.type === EnemyType.MONARCH) {
         bossCurrentHp = e.hp;
         if (e.y < 150) e.y += 0.5; // Enter animation
         e.x = (CANVAS_WIDTH/2) + Math.sin(frameCount.current * 0.01) * 200; // Hover
         
         // Boss Patterns
         if (frameCount.current % 120 === 0) { // Big Laser (Line style)
             const angle = Math.atan2(player.y - e.y, player.x - e.x);
             for(let i= -2; i<=2; i++) {
                // Thinner, longer red beams
                projectilesRef.current.push({ x: e.x, y: e.y + 50, dx: Math.cos(angle + i*0.2)*4, dy: Math.sin(angle + i*0.2)*4, width: 6, height: 40, color: '#ff0000', damage: 1, isEnemy: true});
             }
         } else if (frameCount.current % 20 === 0) { // Bullet Hell (Needle style)
             // Thin needles
             projectilesRef.current.push({ x: e.x - 60, y: e.y + 20, dx: 0, dy: 5, width: 3, height: 20, color: '#ffaaaa', damage: 1, isEnemy: true});
             projectilesRef.current.push({ x: e.x + 60, y: e.y + 20, dx: 0, dy: 5, width: 3, height: 20, color: '#ffaaaa', damage: 1, isEnemy: true});
         }
       } 
       else if (e.type === EnemyType.DESTROYER) {
         e.y += 0.5;
         // Shoot 8-way (Beams)
         if (frameCount.current % 90 === 0) {
            for(let i=0; i<8; i++) {
              const angle = i * (Math.PI/4);
              projectilesRef.current.push({ x: e.x, y: e.y, dx: Math.cos(angle)*3, dy: Math.sin(angle)*3, width: 4, height: 20, color: '#ff00ff', damage: 1, isEnemy: true });
            }
         }
       }
       else if (e.type === EnemyType.INTERCEPTOR) {
         // Follow player X loosely
         e.y += 2.5;
         if (e.x < player.x) e.x += 1;
         if (e.x > player.x) e.x -= 1;
         
         if (frameCount.current % 120 === 0) {
            // Orange beam
            projectilesRef.current.push({ x: e.x, y: e.y+20, dx: 0, dy: 6, width: 4, height: 20, color: '#ff8800', damage: 1, isEnemy: true});
         }
       }
       else { // DRONE
         e.y += 3; // Fast fall
         if (frameCount.current % 180 === 0) {
            // Small needle
            projectilesRef.current.push({ x: e.x, y: e.y+15, dx: 0, dy: 5, width: 3, height: 15, color: '#ffaaaa', damage: 1, isEnemy: true});
         }
       }
       
       // Boundary Constraint (Enemy) - X Axis Only (Don't let them fly out sideways)
       e.x = Math.max(e.width/2, Math.min(CANVAS_WIDTH - e.width/2, e.x));
    });
    setBossHp(bossCurrentHp);

    // Remove Off-screen Enemies
    enemiesRef.current = enemiesRef.current.filter(e => e.y < CANVAS_HEIGHT + 100 && e.hp > 0);

    // 5. Items (Magnet Logic)
    itemsRef.current.forEach(item => {
       const dist = Math.hypot(player.x - item.x, player.y - item.y);
       if (dist < 100) item.magnetized = true;

       if (item.magnetized) {
          item.x += (player.x - item.x) * 0.15;
          item.y += (player.y - item.y) * 0.15;
       } else {
          item.y += 1; // Drift down
          item.x += Math.sin(frameCount.current * 0.05);
       }
       
       // Collection
       if (dist < player.width) {
          player.fragments += item.value;
          setFragments(player.fragments); // This updates Parent State
          soundManager.playPowerUp(); // Use powerup sound for collection
          item.value = 0; // Mark for deletion
       }
    });
    itemsRef.current = itemsRef.current.filter(i => i.value > 0 && i.y < CANVAS_HEIGHT);

    // 6. Projectiles Update
    projectilesRef.current.forEach(p => {
       if (p.homing) {
         // Find closest enemy
         if (!p.target || (p.target as Enemy).hp <= 0) {
            let closest = 9999;
            enemiesRef.current.forEach(e => {
               const d = Math.hypot(e.x - p.x, e.y - p.y);
               if (d < closest) { closest = d; p.target = e; }
            });
         }
         if (p.target) {
            // --- UPGRADE: HOMING ---
            const turnSpeed = 1 + (upgrades.homing * 0.2); // +20% turn speed per level
            
            const angle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
            p.dx += Math.cos(angle) * turnSpeed;
            p.dy += Math.sin(angle) * turnSpeed;
            // Clamp velocity
            const speed = Math.hypot(p.dx, p.dy);
            if (speed > 10) { p.dx=(p.dx/speed)*10; p.dy=(p.dy/speed)*10; }
         }
       }
       p.x += p.dx;
       p.y += p.dy;
    });
    projectilesRef.current = projectilesRef.current.filter(p => p.x > -50 && p.x < CANVAS_WIDTH + 50 && p.y > -50 && p.y < CANVAS_HEIGHT + 50);

    // 7. Collision Detection
    
    // Player vs Enemy (Body Collision) - ADDED
    enemiesRef.current.forEach(e => {
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        // Collision circle approximation
        if (dist < (player.width/2 + e.width/2) * 0.8 && player.iframe === 0) {
            player.hp -= 1; 
            player.iframe = 90; // 1.5s invulnerability
            setHp(player.hp);
            createExplosion(player.x, player.y, '#ff0000', 20);
            
            // Damage enemy slightly to prevent infinite sticking, or kill small ones
            e.hp -= 10; 
            if (e.hp <= 0) {
               createExplosion(e.x, e.y, e.color, 10);
               soundManager.playExplosion();
            }
        }
    });

    // Enemy Bullets vs Player
    projectilesRef.current.filter(p => p.isEnemy).forEach(p => {
       const dist = Math.hypot(p.x - player.x, p.y - player.y);
       if (dist < player.width/2 + p.width/2 && player.iframe === 0) {
          player.hp -= p.damage;
          player.iframe = 90; // 1.5s invulnerability
          setHp(player.hp);
          createExplosion(player.x, player.y, '#ff0000', 10);
          p.x = -999;
       }
    });

    // Player Bullets vs Enemies
    projectilesRef.current.filter(p => !p.isEnemy).forEach(p => {
       enemiesRef.current.forEach(e => {
          const dist = Math.hypot(p.x - e.x, p.y - e.y);
          if (dist < e.width/2 + p.width/2) {
             e.hp -= p.damage;
             if (!p.isLaser) p.x = -999; // Laser penetrates
             createExplosion(e.x + (Math.random()*20-10), e.y, '#ffffff', 2);
             
             if (e.hp <= 0) {
                createExplosion(e.x, e.y, e.color, 20);
                soundManager.playExplosion();
                spawnItem(e.x, e.y); // Chance to drop core
                if (e.type === EnemyType.DESTROYER) {
                   // Drop 5 cores guaranteed
                   for(let i=0; i<5; i++) itemsRef.current.push({ x: e.x, y: e.y, dx: Math.random()*4-2, dy: Math.random()*4-2, width: 12, height: 12, color: '#aaddff', magnetized: false, value: 1 });
                }

                // Score
                const sMap = { [EnemyType.DRONE]: 100, [EnemyType.INTERCEPTOR]: 250, [EnemyType.DESTROYER]: 1500, [EnemyType.MONARCH]: 10000 };
                player.score += sMap[e.type];
                setScore(player.score);

                // Victory Check
                if (e.type === EnemyType.MONARCH) {
                   setGameState(GameState.VICTORY);
                }
             }
          }
       });
    });

    // Game Over Check
    if (player.hp <= 0) {
       setGameState(GameState.GAME_OVER);
    }

    // Particles Update
    particlesRef.current.forEach(p => {
       p.x += p.dx; p.y += p.dy; p.life -= 0.02; p.alpha = p.life / p.maxLife;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

  }, [gameState, setGameState, setScore, setFragments, setHp, setMaxHp, setBossHp, isPaused, upgrades, currentFragments]);


  // --- Rendering Loop ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Parallax Stars
    starsRef.current.forEach(s => {
       ctx.fillStyle = `rgba(255, 255, 255, ${s.layer === 1 ? 0.3 : 0.8})`;
       ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI*2); ctx.fill();
       if (!isPaused) {
           s.y += s.speed * (s.layer === 1 ? 2 : 4);
           if (s.y > CANVAS_HEIGHT) s.y = 0;
       }
    });

    const player = playerRef.current;

    // Draw Items
    itemsRef.current.forEach(i => {
       ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff';
       ctx.fillStyle = '#ccffff';
       ctx.beginPath(); ctx.arc(i.x, i.y, 6, 0, Math.PI*2); ctx.fill();
       ctx.shadowBlur = 0;
    });

    // Draw Player
    if (gameState !== GameState.GAME_OVER && (player.iframe % 10 < 5)) {
       ctx.save();
       ctx.translate(player.x, player.y);
       
       let shipColor = '#00f0ff';
       if (player.level >= 3) shipColor = '#00ffaa';
       if (player.level >= 5) shipColor = '#ffd700';

       ctx.shadowBlur = 15; ctx.shadowColor = shipColor;
       ctx.fillStyle = shipColor;

       ctx.beginPath();
       ctx.moveTo(0, -player.height/2);
       ctx.lineTo(player.width/2, player.height/2);
       ctx.lineTo(0, player.height/2 - 10);
       ctx.lineTo(-player.width/2, player.height/2);
       ctx.closePath();
       ctx.fill();

       if (player.level >= 3) {
          ctx.strokeStyle = shipColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-player.width/2, 0); ctx.lineTo(-player.width, 20);
          ctx.moveTo(player.width/2, 0); ctx.lineTo(player.width, 20);
          ctx.stroke();
       }
       ctx.restore();
    }

    // Draw Enemies
    enemiesRef.current.forEach(e => {
       ctx.save();
       ctx.translate(e.x, e.y);
       ctx.shadowBlur = 10; ctx.shadowColor = e.color;
       ctx.fillStyle = e.color;
       
       if (e.type === EnemyType.MONARCH) {
          ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(60, 0); ctx.lineTo(40, 60); ctx.lineTo(-40, 60); ctx.lineTo(-60, 0); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill();
       } else if (e.type === EnemyType.DESTROYER) {
          ctx.fillRect(-30, -30, 60, 60);
       } else {
          ctx.beginPath(); ctx.moveTo(0, e.height/2); ctx.lineTo(e.width/2, -e.height/2); ctx.lineTo(-e.width/2, -e.height/2); ctx.closePath(); ctx.fill();
       }
       ctx.restore();
    });

    // Draw Projectiles
    projectilesRef.current.forEach(p => {
       ctx.save();
       ctx.translate(p.x, p.y);
       
       // ROTATION LOGIC: Rotate towards velocity vector
       // Math.atan2(dy, dx) gives angle from X-axis. 
       // Subtract PI/2 because we draw lines vertically by default (height along Y).
       const angle = Math.atan2(p.dy, p.dx);
       ctx.rotate(angle - Math.PI / 2);

       ctx.shadowBlur = p.isEnemy ? 15 : 10; 
       ctx.shadowColor = p.color;
       ctx.fillStyle = p.color;

       if (p.isLaser) {
          // Lasers are just drawn
          ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
       } else {
          // Draw Line/Beam Style with Core
          ctx.beginPath();
          ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
          
          // Brighter Core for Neon Effect
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.7;
          ctx.fillRect(-p.width/4, -p.height/4, p.width/2, p.height/2);
          ctx.globalAlpha = 1.0;
       }
       ctx.restore();
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
       ctx.globalAlpha = p.alpha;
       ctx.fillStyle = p.color;
       ctx.fillRect(p.x, p.y, p.size, p.size);
       ctx.globalAlpha = 1;
    });

    requestRef.current = requestAnimationFrame(draw);
  }, [gameState, isPaused]);

  // Start Loop
  useEffect(() => {
     if (gameState === GameState.START) resetGame();
     const interval = setInterval(update, 1000 / 60);
     requestRef.current = requestAnimationFrame(draw);
     return () => { clearInterval(interval); if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState, update, draw]);


  return (
    <canvas 
      ref={canvasRef} 
      width={CANVAS_WIDTH} 
      height={CANVAS_HEIGHT} 
      className="border-2 border-cyan-500 rounded-lg shadow-[0_0_50px_rgba(0,255,255,0.3)] bg-black"
    />
  );
};
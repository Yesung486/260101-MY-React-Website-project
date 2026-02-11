import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SnakeEntity, FoodItem, Point, GameState } from '../types';
import { WORLD_SIZE, INITIAL_BOT_COUNT, FOOD_COUNT, NEON_COLORS, PLAYER_COLOR, KEY_CODES, INITIAL_PLAYER_SIZE } from '../constants';
import { audioService } from '../services/audioService';

interface GameEngineProps {
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  gameState: 'MENU' | 'PLAYING' | 'GAMEOVER';
}

const GameEngine: React.FC<GameEngineProps> = ({ onScoreUpdate, onGameOver, gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game State Refs (for performance, we avoid React state for the loop)
  const playerRef = useRef<SnakeEntity | null>(null);
  const botsRef = useRef<SnakeEntity[]>([]);
  const foodRef = useRef<FoodItem[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseRef = useRef<{ x: number; y: number; isDown: boolean; active: boolean }>({ 
    x: 0, 
    y: 0, 
    isDown: false, 
    active: false 
  });
  const cameraRef = useRef<Point>({ x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 });
  
  // Helper: Generate Random Point
  const randomPoint = (): Point => ({
    x: Math.random() * WORLD_SIZE,
    y: Math.random() * WORLD_SIZE
  });

  // Helper: Create Food
  const createFood = (count: number, center?: Point, spread: number = WORLD_SIZE): FoodItem[] => {
    const newFood: FoodItem[] = [];
    for (let i = 0; i < count; i++) {
      let x, y;
      if (center) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * spread;
        x = center.x + Math.cos(angle) * dist;
        y = center.y + Math.sin(angle) * dist;
      } else {
        x = Math.random() * WORLD_SIZE;
        y = Math.random() * WORLD_SIZE;
      }
      
      // Keep in bounds
      x = Math.max(0, Math.min(WORLD_SIZE, x));
      y = Math.max(0, Math.min(WORLD_SIZE, y));

      const colorIdx = Math.floor(Math.random() * NEON_COLORS.length);
      newFood.push({
        id: Math.random().toString(36).substr(2, 9),
        x,
        y,
        radius: 4 + Math.random() * 4,
        color: NEON_COLORS[colorIdx].main,
        value: 1
      });
    }
    return newFood;
  };

  // Helper: Create Snake
  const createSnake = (isPlayer: boolean): SnakeEntity => {
    const startPos = randomPoint();
    const colorPair = isPlayer ? PLAYER_COLOR : NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    const initialLength = isPlayer ? INITIAL_PLAYER_SIZE : 10 + Math.random() * 40;
    
    // Initialize trail
    const trail: Point[] = [];
    for (let i = 0; i < initialLength; i++) {
      trail.push({ x: startPos.x, y: startPos.y });
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      isPlayer,
      x: startPos.x,
      y: startPos.y,
      angle: Math.random() * Math.PI * 2,
      speed: 3,
      baseSpeed: 3,
      turnSpeed: 0.08,
      radius: 10,
      length: initialLength,
      trail,
      color: colorPair.main,
      glowColor: colorPair.glow,
      score: 0,
      isDead: false,
      isBoosting: false,
      name: isPlayer ? "YOU" : `Bot-${Math.floor(Math.random() * 1000)}`
    };
  };

  // Initialization
  const initGame = useCallback(() => {
    playerRef.current = createSnake(true);
    botsRef.current = Array.from({ length: INITIAL_BOT_COUNT }).map(() => createSnake(false));
    foodRef.current = createFood(FOOD_COUNT);
    cameraRef.current = { x: playerRef.current.x, y: playerRef.current.y };
    // Reset mouse active state
    mouseRef.current.active = false;
  }, []);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDown = true;
      mouseRef.current.active = true;
    };
    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent context menu for right click
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Core Game Loop
  const update = () => {
    if (gameState !== 'PLAYING' || !playerRef.current) return;

    const player = playerRef.current;
    const allSnakes = [player, ...botsRef.current];

    // --- 1. Update Player Movement ---
    if (!player.isDead) {
      // Input Logic: Hybrid (Mouse vs Keyboard)
      let turningSpeed = player.turnSpeed;
      
      // Keyboard override: if keys are pressed, disable mouse steering
      if (keysRef.current[KEY_CODES.LEFT]) {
          player.angle -= turningSpeed;
          mouseRef.current.active = false; 
      } else if (keysRef.current[KEY_CODES.RIGHT]) {
          player.angle += turningSpeed;
          mouseRef.current.active = false;
      } else if (mouseRef.current.active) {
          // Mouse Steering Logic
          // Player is visually at the center of the screen
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          
          // Calculate angle from center to mouse
          const targetAngle = Math.atan2(
              mouseRef.current.y - centerY,
              mouseRef.current.x - centerX
          );
          
          // Smooth turn towards target (similar to bots)
          const diff = targetAngle - player.angle;
          // Normalize angle difference to -PI to PI
          let delta = Math.atan2(Math.sin(diff), Math.cos(diff));
          
          player.angle += Math.sign(delta) * Math.min(Math.abs(delta), turningSpeed);
      }
      
      // Boost Logic (Space OR Mouse Click)
      const isBoostPressed = (keysRef.current[KEY_CODES.SPACE] || mouseRef.current.isDown);
      
      if (isBoostPressed && player.length > 10) {
        player.isBoosting = true;
        player.speed = player.baseSpeed * 1.8;
        // Lose mass (poop)
        if (Math.random() < 0.2) {
            player.length -= 0.5;
            // Spawn food behind
            const poopAngle = player.angle + Math.PI;
            const poopX = player.x + Math.cos(poopAngle) * player.radius * 2;
            const poopY = player.y + Math.sin(poopAngle) * player.radius * 2;
            foodRef.current.push({
                id: Math.random().toString(),
                x: poopX,
                y: poopY,
                radius: 5,
                color: '#ffaa00', // Poop color? Or just glowing energy
                value: 2
            });
            audioService.playBoostSound();
        }
      } else {
        player.isBoosting = false;
        player.speed = player.baseSpeed;
      }

      // Move Head
      player.x += Math.cos(player.angle) * player.speed;
      player.y += Math.sin(player.angle) * player.speed;

      // Update Body (Trail)
      // We push the new head position to the front
      // But only if it's far enough from the last point to make it smooth but efficient
      const lastPoint = player.trail[0];
      const dist = Math.hypot(player.x - lastPoint.x, player.y - lastPoint.y);
      if (dist > 5) { // Resolution of snake body
          player.trail.unshift({ x: player.x, y: player.y });
          // Trim tail
          while (player.trail.length > player.length) {
              player.trail.pop();
          }
      }
    }

    // --- 2. Update Bots ---
    botsRef.current.forEach(bot => {
        if (bot.isDead) return;

        // Simple AI: Move towards food within range
        let targetAngle = bot.angle;
        let nearestFood: FoodItem | null = null;
        let minDist = 300;

        // Find food
        for (const f of foodRef.current) {
            const d = Math.hypot(f.x - bot.x, f.y - bot.y);
            if (d < minDist) {
                minDist = d;
                nearestFood = f;
            }
        }

        if (nearestFood) {
            targetAngle = Math.atan2(nearestFood.y - bot.y, nearestFood.x - bot.x);
        } else {
            // Wander
             if (Math.random() < 0.05) {
                 targetAngle += (Math.random() - 0.5);
             }
        }

        // Avoid walls
        if (bot.x < 100) targetAngle = 0;
        if (bot.x > WORLD_SIZE - 100) targetAngle = Math.PI;
        if (bot.y < 100) targetAngle = Math.PI / 2;
        if (bot.y > WORLD_SIZE - 100) targetAngle = -Math.PI / 2;

        // Smooth turn towards target
        const diff = targetAngle - bot.angle;
        // Normalize angle difference
        let delta = Math.atan2(Math.sin(diff), Math.cos(diff));
        
        bot.angle += Math.sign(delta) * Math.min(Math.abs(delta), bot.turnSpeed);
        
        // Move
        bot.x += Math.cos(bot.angle) * bot.speed;
        bot.y += Math.sin(bot.angle) * bot.speed;

        // Trail logic
        const lastP = bot.trail[0];
        const d = Math.hypot(bot.x - lastP.x, bot.y - lastP.y);
        if (d > 5) {
            bot.trail.unshift({ x: bot.x, y: bot.y });
            while (bot.trail.length > bot.length) {
                bot.trail.pop();
            }
        }
    });

    // --- 3. Collision Detection ---
    
    // Check Walls
    if (player.x < 0 || player.x > WORLD_SIZE || player.y < 0 || player.y > WORLD_SIZE) {
        player.isDead = true;
    }

    // Check Entity Collisions (Head to Body)
    allSnakes.forEach(snakeA => {
        if (snakeA.isDead) return;
        
        allSnakes.forEach(snakeB => {
            if (snakeA === snakeB) return; // Don't check self
            if (snakeB.isDead) return;

            // Check if SnakeA's head hits SnakeB's body
            // Optimization: check bounding box first or distance to head
            for (let i = 0; i < snakeB.trail.length; i += 2) { // Check every other point for performance
                const seg = snakeB.trail[i];
                const dist = Math.hypot(snakeA.x - seg.x, snakeA.y - seg.y);
                
                if (dist < snakeA.radius + snakeB.radius - 2) {
                    snakeA.isDead = true;
                    
                    // Drop food where snake died
                    const droppedFood = createFood(Math.floor(snakeA.length / 2), {x: snakeA.x, y: snakeA.y}, 100);
                    foodRef.current.push(...droppedFood);
                    audioService.playDieSound();
                    
                    if (!snakeA.isPlayer) {
                        // Respawn bot elsewhere
                        setTimeout(() => {
                            botsRef.current = botsRef.current.filter(b => b !== snakeA);
                            botsRef.current.push(createSnake(false));
                        }, 2000);
                    }
                    break;
                }
            }
        });
    });

    // --- 4. Eating Food ---
    allSnakes.forEach(snake => {
        if (snake.isDead) return;
        
        // Filter food in place to remove eaten ones
        for (let i = foodRef.current.length - 1; i >= 0; i--) {
            const f = foodRef.current[i];
            const dist = Math.hypot(snake.x - f.x, snake.y - f.y);
            
            // Suction effect if close
            if (dist < snake.radius * 4) {
                f.x += (snake.x - f.x) * 0.1;
                f.y += (snake.y - f.y) * 0.1;
            }

            if (dist < snake.radius + f.radius) {
                // Eat
                snake.length += f.value;
                snake.score += Math.floor(f.value * 10);
                if (snake.isPlayer) {
                    onScoreUpdate(snake.score);
                    audioService.playEatSound();
                }
                foodRef.current.splice(i, 1);
            }
        }
    });

    // Replenish Food randomly
    if (foodRef.current.length < FOOD_COUNT) {
        foodRef.current.push(...createFood(5));
    }

    // --- 5. Game Over Logic ---
    if (player.isDead) {
        onGameOver(player.score);
        return; // Stop updating
    }

    // --- 6. Camera Follow ---
    // Smooth lerp camera to player
    cameraRef.current.x += (player.x - cameraRef.current.x) * 0.1;
    cameraRef.current.y += (player.y - cameraRef.current.y) * 0.1;

  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Clear Screen (Dark Void)
    ctx.fillStyle = '#0f172a'; // Tailwind slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Camera Transform
    const camX = cameraRef.current.x - canvas.width / 2;
    const camY = cameraRef.current.y - canvas.height / 2;

    ctx.save();
    ctx.translate(-camX, -camY);

    // Draw Grid (Hexagon or simple lines)
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.lineWidth = 2;
    const gridSize = 100;
    
    // Optimize grid drawing: only draw visible area
    const startX = Math.floor(camX / gridSize) * gridSize;
    const startY = Math.floor(camY / gridSize) * gridSize;
    const endX = startX + canvas.width + gridSize;
    const endY = startY + canvas.height + gridSize;

    ctx.beginPath();
    for (let x = startX; x < endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
    }
    for (let y = startY; y < endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Draw World Borders
    ctx.strokeStyle = '#ef4444'; // Red boundary
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE);

    // Draw Food
    foodRef.current.forEach(f => {
        // Culling
        if (f.x < camX - 50 || f.x > camX + canvas.width + 50 || 
            f.y < camY - 50 || f.y > camY + canvas.height + 50) return;

        ctx.shadowBlur = 10;
        ctx.shadowColor = f.color;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    });

    // Draw Snakes
    const allSnakes = [playerRef.current, ...botsRef.current].filter(s => s !== null);
    
    // Sort to draw player last (on top)
    allSnakes.sort((a, b) => (a?.isPlayer ? 1 : -1));

    allSnakes.forEach(snake => {
        if (!snake || snake.isDead) return;

        // Culling optimization based on head position (rough)
        if (snake.x < camX - 500 || snake.x > camX + canvas.width + 500 ||
            snake.y < camY - 500 || snake.y > camY + canvas.height + 500) {
            // Still might need to draw if body is long, but skip for now
        }

        ctx.shadowBlur = 20;
        ctx.shadowColor = snake.glowColor;
        ctx.fillStyle = snake.color;
        
        // Draw Body (Iterate backwards to draw tail first)
        // Slither style: series of circles
        for (let i = snake.trail.length - 1; i >= 0; i--) {
            const p = snake.trail[i];
            
            // Scale size slightly based on index for tapering tail? (Optional)
            const size = snake.radius; 
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Head (Slightly larger)
        ctx.fillStyle = '#fff'; // Eyes base
        ctx.beginPath();
        ctx.arc(snake.x, snake.y, snake.radius, 0, Math.PI * 2);
        ctx.fillStyle = snake.color;
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        const eyeOffset = snake.radius * 0.6;
        const eyeX1 = snake.x + Math.cos(snake.angle - 0.5) * eyeOffset;
        const eyeY1 = snake.y + Math.sin(snake.angle - 0.5) * eyeOffset;
        const eyeX2 = snake.x + Math.cos(snake.angle + 0.5) * eyeOffset;
        const eyeY2 = snake.y + Math.sin(snake.angle + 0.5) * eyeOffset;
        
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, snake.radius * 0.4, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, snake.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(eyeX1 + Math.cos(snake.angle)*2, eyeY1+ Math.sin(snake.angle)*2, snake.radius * 0.2, 0, Math.PI * 2);
        ctx.arc(eyeX2 + Math.cos(snake.angle)*2, eyeY2+ Math.sin(snake.angle)*2, snake.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Name Tag
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(snake.name, snake.x, snake.y - snake.radius - 10);

    });

    ctx.restore();
  };

  const tick = () => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      initGame();
      requestRef.current = requestAnimationFrame(tick);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, initGame]);

  return (
    <canvas 
        ref={canvasRef} 
        className="block fixed top-0 left-0 w-full h-full"
    />
  );
};

export default GameEngine;
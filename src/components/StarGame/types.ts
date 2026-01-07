export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export interface Entity extends Position, Velocity {
  width: number;
  height: number;
  color: string;
}

export interface Particle extends Entity {
  life: number;
  maxLife: number;
  alpha: number;
  size: number;
}

export interface Item extends Entity {
  magnetized: boolean;
  value: number;
}

export interface Projectile extends Entity {
  damage: number;
  isEnemy: boolean;
  homing?: boolean;
  target?: Player | Enemy | null; // Unified target type
  isLaser?: boolean; // For final form
}

export enum EnemyType {
  DRONE = 'DRONE',
  INTERCEPTOR = 'INTERCEPTOR',
  DESTROYER = 'DESTROYER', // Mid Boss
  MONARCH = 'MONARCH'      // Final Boss
}

export interface Enemy extends Entity {
  type: EnemyType;
  hp: number;
  maxHp: number;
  phase?: number;
  shootTimer: number;
}

export interface PlayerUpgrades {
  fireRate: number; // Level 0-5
  damage: number;   // Level 0-inf
  homing: number;   // Level 0-5
}

export interface Player extends Entity {
  hp: number;
  maxHp: number;
  level: number; // 1: Epsilon, 2: Delta, 3: Gamma, 4: Beta, 5: Origin Alpha
  fragments: number; // Experience/Currency
  score: number;
  iframe: number;
  shieldActive: boolean;
}
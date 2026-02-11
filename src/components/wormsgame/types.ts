export interface Point {
  x: number;
  y: number;
}

export interface SnakeEntity {
  id: string;
  isPlayer: boolean;
  x: number;
  y: number;
  angle: number; // in radians
  speed: number;
  baseSpeed: number;
  turnSpeed: number;
  radius: number;
  length: number; // Target length
  trail: Point[]; // Body segments
  color: string;
  glowColor: string;
  score: number;
  isDead: boolean;
  isBoosting: boolean;
  name: string;
}

export interface FoodItem {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  value: number; // How much length it adds
}

export interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  highScore: number;
}

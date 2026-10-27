export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type RotationState = 0 | 1 | 2 | 3; // 0: 0deg, 1: 90deg, 2: 180deg, 3: 270deg

export interface Piece {
  type: TetrominoType;
  shape: number[][];
  color: string;
  x: number;
  y: number;
  rotation: RotationState;
}

export type Matrix = (string | null)[][]; // 20 rows x 10 cols

export type GameMode = 'marathon' | 'sprint' | 'ultra';

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export type ThemeId = 'cyberpunk' | 'classic' | 'gameboy' | 'dark-slate';

export type ControlsLayout = 'buttons' | 'gestures' | 'hybrid';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  ghostPiece: boolean;
  das: number; // Delayed Auto Shift (ms, e.g. 130)
  arr: number; // Auto Repeat Rate (ms, e.g. 35)
  theme: ThemeId;
  controlsLayout: ControlsLayout;
}

export interface GameStats {
  score: number;
  highScore: number;
  level: number;
  lines: number;
  singles: number;
  doubles: number;
  triples: number;
  tetrises: number;
  tSpins: number;
  maxCombo: number;
  currentCombo: number;
  backToBack: boolean;
  piecesPlaced: number;
  startTime: number;
  elapsedTime: number; // ms
}

export interface FloatingNotification {
  id: string;
  text: string;
  subtext?: string;
  type: 'tetris' | 'tspin' | 'combo' | 'levelup' | 'info';
  timestamp: number;
}

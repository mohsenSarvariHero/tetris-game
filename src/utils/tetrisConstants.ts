import { TetrominoType, RotationState, ThemeId, GameSettings } from '../types/tetris';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Standard Tetromino shapes in state 0
export const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

// Theme Color Palettes
export interface ThemePalette {
  name: string;
  pieces: Record<TetrominoType, { fill: string; border: string; glow: string }>;
  ghost: string;
  gridLine: string;
  boardBg: string;
}

export const THEMES: Record<ThemeId, ThemePalette> = {
  cyberpunk: {
    name: 'Cyberpunk Neon',
    pieces: {
      I: { fill: '#06b6d4', border: '#67e8f9', glow: 'rgba(6, 182, 212, 0.5)' }, // Cyan
      J: { fill: '#3b82f6', border: '#93c5fd', glow: 'rgba(59, 130, 246, 0.5)' }, // Blue
      L: { fill: '#f97316', border: '#fdba74', glow: 'rgba(249, 115, 22, 0.5)' }, // Orange
      O: { fill: '#eab308', border: '#fef08a', glow: 'rgba(234, 179, 8, 0.5)' },  // Yellow
      S: { fill: '#10b981', border: '#6ee7b7', glow: 'rgba(16, 185, 129, 0.5)' }, // Green
      T: { fill: '#a855f7', border: '#d8b4fe', glow: 'rgba(168, 85, 247, 0.5)' }, // Purple
      Z: { fill: '#ef4444', border: '#fca5a5', glow: 'rgba(239, 68, 68, 0.5)' },  // Red
    },
    ghost: 'rgba(255, 255, 255, 0.15)',
    gridLine: 'rgba(255, 255, 255, 0.05)',
    boardBg: '#090d16',
  },
  classic: {
    name: 'Arcade Retro',
    pieces: {
      I: { fill: '#00f0f0', border: '#ffffff', glow: 'rgba(0, 240, 240, 0.4)' },
      J: { fill: '#0000f0', border: '#ffffff', glow: 'rgba(0, 0, 240, 0.4)' },
      L: { fill: '#f0a000', border: '#ffffff', glow: 'rgba(240, 160, 0, 0.4)' },
      O: { fill: '#f0f000', border: '#ffffff', glow: 'rgba(240, 240, 0, 0.4)' },
      S: { fill: '#00f000', border: '#ffffff', glow: 'rgba(0, 240, 0, 0.4)' },
      T: { fill: '#a000f0', border: '#ffffff', glow: 'rgba(160, 0, 240, 0.4)' },
      Z: { fill: '#f00000', border: '#ffffff', glow: 'rgba(240, 0, 0, 0.4)' },
    },
    ghost: 'rgba(255, 255, 255, 0.12)',
    gridLine: 'rgba(255, 255, 255, 0.06)',
    boardBg: '#05070e',
  },
  gameboy: {
    name: 'Game Boy DMG',
    pieces: {
      I: { fill: '#306230', border: '#8bac0f', glow: 'transparent' },
      J: { fill: '#306230', border: '#8bac0f', glow: 'transparent' },
      L: { fill: '#306230', border: '#8bac0f', glow: 'transparent' },
      O: { fill: '#306230', border: '#8bac0f', glow: 'transparent' },
      S: { fill: '#306230', border: '#8bac0f', glow: 'transparent' },
      T: { fill: '#306230', border: '#8bac0f', glow: 'transparent' },
      Z: { fill: '#306230', border: '#8bac0f', glow: 'transparent' },
    },
    ghost: 'rgba(139, 172, 15, 0.25)',
    gridLine: 'rgba(48, 98, 48, 0.18)',
    boardBg: '#9bbc0f',
  },
  'dark-slate': {
    name: 'Minimal Dark',
    pieces: {
      I: { fill: '#38bdf8', border: '#7dd3fc', glow: 'rgba(56, 189, 248, 0.3)' },
      J: { fill: '#60a5fa', border: '#93c5fd', glow: 'rgba(96, 165, 250, 0.3)' },
      L: { fill: '#fb923c', border: '#fdba74', glow: 'rgba(251, 146, 60, 0.3)' },
      O: { fill: '#facc15', border: '#fde047', glow: 'rgba(250, 204, 21, 0.3)' },
      S: { fill: '#34d399', border: '#6ee7b7', glow: 'rgba(52, 211, 153, 0.3)' },
      T: { fill: '#c084fc', border: '#d8b4fe', glow: 'rgba(192, 132, 252, 0.3)' },
      Z: { fill: '#f87171', border: '#fca5a5', glow: 'rgba(248, 113, 113, 0.3)' },
    },
    ghost: 'rgba(255, 255, 255, 0.14)',
    gridLine: 'rgba(255, 255, 255, 0.04)',
    boardBg: '#0f172a',
  },
};

// Standard SRS Wall Kick Offsets
// Wall kick data for J, L, S, T, Z pieces: [x, y] where y is positive upward in SRS math (we invert y in matrix)
export const SRS_KICKS_JLSTZ: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

// Wall kick data for I piece
export const SRS_KICKS_I: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

// Line clear scores by level
export const LINE_SCORES = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  T_SPIN_MINI: 100,
  T_SPIN_SINGLE: 800,
  T_SPIN_DOUBLE: 1200,
  T_SPIN_TRIPLE: 1600,
  B2B_TETRIS: 1200,
  SOFT_DROP_PER_ROW: 1,
  HARD_DROP_PER_ROW: 2,
};

// Calculate drop interval based on level (ms)
export function getDropInterval(level: number): number {
  // Guideline speed curve approximation
  const speedCurve = [
    1000, 793, 618, 473, 355, 262, 190, 135, 94, 64, 43, 28, 18, 11, 7,
  ];
  return speedCurve[Math.min(level - 1, speedCurve.length - 1)];
}

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: false,
  hapticsEnabled: true,
  ghostPiece: true,
  das: 130, // Delay before auto-repeat kicks in
  arr: 35,  // Auto-repeat rate in ms
  theme: 'cyberpunk',
  controlsLayout: 'buttons',
};

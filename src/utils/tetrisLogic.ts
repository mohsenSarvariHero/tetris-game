import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  SRS_KICKS_I,
  SRS_KICKS_JLSTZ,
  TETROMINO_SHAPES,
} from './tetrisConstants';
import { Matrix, Piece, RotationState, TetrominoType } from '../types/tetris';

export function createEmptyMatrix(): Matrix {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

// 7-Bag Randomizer
export function generateBag(): TetrominoType[] {
  const bag: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function createPiece(type: TetrominoType): Piece {
  const shape = TETROMINO_SHAPES[type];
  const pieceWidth = shape[0].length;
  // Spawn horizontally centered, slightly above or at row 0
  const x = Math.floor((BOARD_WIDTH - pieceWidth) / 2);
  const y = type === 'I' ? -1 : 0;

  return {
    type,
    shape: shape.map((row) => [...row]),
    color: type,
    x,
    y,
    rotation: 0,
  };
}

export function checkCollision(
  piece: Piece,
  matrix: Matrix,
  offsetX: number = 0,
  offsetY: number = 0,
  customShape?: number[][]
): boolean {
  const shape = customShape || piece.shape;
  const targetX = piece.x + offsetX;
  const targetY = piece.y + offsetY;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const boardX = targetX + c;
        const boardY = targetY + r;

        // Check horizontal boundaries
        if (boardX < 0 || boardX >= BOARD_WIDTH) {
          return true;
        }

        // Check floor
        if (boardY >= BOARD_HEIGHT) {
          return true;
        }

        // Check locked pieces in board (boardY < 0 is above ceiling, which is valid for spawning)
        if (boardY >= 0 && matrix[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }

  return false;
}

// Rotate matrix 90 degrees clockwise (1) or counter-clockwise (-1)
export function rotateShape(shape: number[][], dir: 1 | -1): number[][] {
  const size = shape.length;
  const result: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (dir === 1) {
        // Clockwise: new col = size - 1 - r, new row = c
        result[c][size - 1 - r] = shape[r][c];
      } else {
        // Counter-Clockwise: new col = r, new row = size - 1 - c
        result[size - 1 - c][r] = shape[r][c];
      }
    }
  }

  return result;
}

// Compute SRS Wall Kicks
export function tryRotateWithSRS(
  piece: Piece,
  matrix: Matrix,
  dir: 1 | -1
): { newPiece: Piece } | null {
  if (piece.type === 'O') {
    return { newPiece: { ...piece } }; // O piece doesn't need rotation kicks
  }

  const currentRotation = piece.rotation;
  const nextRotation = ((currentRotation + dir + 4) % 4) as RotationState;
  const transitionKey = `${currentRotation}->${nextRotation}`;

  const newShape = rotateShape(piece.shape, dir);
  const kicks = piece.type === 'I' ? SRS_KICKS_I[transitionKey] : SRS_KICKS_JLSTZ[transitionKey];

  if (!kicks) {
    if (!checkCollision(piece, matrix, 0, 0, newShape)) {
      return {
        newPiece: {
          ...piece,
          shape: newShape,
          rotation: nextRotation,
        },
      };
    }
    return null;
  }

  for (const [kickX, kickY] of kicks) {
    // In standard SRS kick tables, positive Y is UP.
    // In our matrix, row 0 is TOP, so moving UP is -kickY
    const testOffsetX = kickX;
    const testOffsetY = -kickY;

    if (!checkCollision(piece, matrix, testOffsetX, testOffsetY, newShape)) {
      return {
        newPiece: {
          ...piece,
          shape: newShape,
          x: piece.x + testOffsetX,
          y: piece.y + testOffsetY,
          rotation: nextRotation,
        },
      };
    }
  }

  return null;
}

// Compute Ghost piece position (Y coordinate where piece lands)
export function getGhostY(piece: Piece, matrix: Matrix): number {
  let ghostY = piece.y;
  while (!checkCollision(piece, matrix, 0, ghostY - piece.y + 1)) {
    ghostY++;
  }
  return ghostY;
}

// Check lines to clear
export function checkFullLines(matrix: Matrix): number[] {
  const fullRows: number[] = [];
  for (let r = 0; r < BOARD_HEIGHT; r++) {
    if (matrix[r].every((cell) => cell !== null)) {
      fullRows.push(r);
    }
  }
  return fullRows;
}

// Remove cleared lines and shift matrix down
export function removeLinesFromMatrix(matrix: Matrix, fullRows: number[]): Matrix {
  if (fullRows.length === 0) return matrix;

  const newMatrix = matrix.filter((_, idx) => !fullRows.includes(idx));
  const emptyRows = Array.from({ length: fullRows.length }, () => Array(BOARD_WIDTH).fill(null));

  return [...emptyRows, ...newMatrix];
}

// Detect T-Spin (3-corner rule)
export function checkTSpin(
  piece: Piece,
  matrix: Matrix,
  lastActionWasRotate: boolean
): { isTSpin: boolean; isMini: boolean } {
  if (piece.type !== 'T' || !lastActionWasRotate) {
    return { isTSpin: false, isMini: false };
  }

  // 4 corners of T piece 3x3 bounding box
  const corners = [
    { x: piece.x, y: piece.y },         // Top-left
    { x: piece.x + 2, y: piece.y },     // Top-right
    { x: piece.x, y: piece.y + 2 },     // Bottom-left
    { x: piece.x + 2, y: piece.y + 2 }, // Bottom-right
  ];

  let occupiedCorners = 0;
  for (const corner of corners) {
    if (
      corner.x < 0 ||
      corner.x >= BOARD_WIDTH ||
      corner.y >= BOARD_HEIGHT ||
      (corner.y >= 0 && matrix[corner.y][corner.x] !== null)
    ) {
      occupiedCorners++;
    }
  }

  if (occupiedCorners >= 3) {
    // Check if the two front corners facing the T-pointing direction are occupied
    return { isTSpin: true, isMini: occupiedCorners === 3 };
  }

  return { isTSpin: false, isMini: false };
}

// Format milliseconds as mm:ss.cc
export function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const cc = String(hundredths).padStart(2, '0');

  return `${mm}:${ss}.${cc}`;
}

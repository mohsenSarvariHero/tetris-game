import React, { useRef, useMemo } from 'react';
import { Matrix, Piece, ThemeId, FloatingNotification, ControlsLayout } from '../types/tetris';
import { BOARD_HEIGHT, BOARD_WIDTH, THEMES } from '../utils/tetrisConstants';
import { getGhostY } from '../utils/tetrisLogic';

interface GameBoardProps {
  matrix: Matrix;
  currentPiece: Piece | null;
  clearingLines: number[];
  theme: ThemeId;
  ghostPieceEnabled: boolean;
  screenShake: boolean;
  notifications: FloatingNotification[];
  controlsLayout: ControlsLayout;
  onMove: (dx: number) => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onHold: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  matrix,
  currentPiece,
  clearingLines,
  theme,
  ghostPieceEnabled,
  screenShake,
  notifications,
  controlsLayout,
  onMove,
  onRotate,
  onSoftDrop,
  onHardDrop,
  onHold,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastMoveXRef = useRef<number>(0);

  const themePalette = THEMES[theme];

  // Calculate ghost piece Y
  const ghostY = useMemo(() => {
    if (!currentPiece || !ghostPieceEnabled) return null;
    return getGhostY(currentPiece, matrix);
  }, [currentPiece, matrix, ghostPieceEnabled]);

  // Touch gesture handling on the game board (for Gestures / Hybrid control mode)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (controlsLayout === 'buttons') return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    lastMoveXRef.current = touch.clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (controlsLayout === 'buttons' || !touchStartRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - lastMoveXRef.current;
    const cellThreshold = 26; // Drag 26px to move 1 column

    if (Math.abs(deltaX) >= cellThreshold) {
      const steps = Math.floor(Math.abs(deltaX) / cellThreshold);
      const dir = deltaX > 0 ? 1 : -1;
      for (let i = 0; i < steps; i++) {
        onMove(dir);
      }
      lastMoveXRef.current = touch.clientX;
    }

    const deltaY = touch.clientY - touchStartRef.current.y;
    if (deltaY > 50) {
      onSoftDrop();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (controlsLayout === 'buttons' || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const totalDeltaX = touch.clientX - touchStartRef.current.x;
    const totalDeltaY = touch.clientY - touchStartRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;

    // Quick tap = Rotate
    if (Math.abs(totalDeltaX) < 14 && Math.abs(totalDeltaY) < 14 && duration < 250) {
      onRotate();
    }
    // Fast swipe down = Hard Drop
    else if (totalDeltaY > 60 && Math.abs(totalDeltaX) < 40 && duration < 250) {
      onHardDrop();
    }
    // Swipe up = Hold
    else if (totalDeltaY < -40 && Math.abs(totalDeltaX) < 40 && duration < 300) {
      onHold();
    }

    touchStartRef.current = null;
  };

  // Build display cells combining matrix, ghost, and active falling piece
  const displayGrid = useMemo(() => {
    // 1. Start with board matrix
    const grid: {
      type: string | null;
      isGhost: boolean;
      isClearing: boolean;
    }[][] = Array.from({ length: BOARD_HEIGHT }, (_, r) =>
      Array.from({ length: BOARD_WIDTH }, (_, c) => ({
        type: matrix[r][c],
        isGhost: false,
        isClearing: clearingLines.includes(r),
      }))
    );

    // 2. Overlay ghost piece
    if (currentPiece && ghostY !== null && ghostY !== currentPiece.y) {
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c] !== 0) {
            const boardY = ghostY + r;
            const boardX = currentPiece.x + c;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              if (grid[boardY][boardX].type === null) {
                grid[boardY][boardX] = {
                  type: currentPiece.type,
                  isGhost: true,
                  isClearing: false,
                };
              }
            }
          }
        }
      }
    }

    // 3. Overlay active current piece
    if (currentPiece) {
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c] !== 0) {
            const boardY = currentPiece.y + r;
            const boardX = currentPiece.x + c;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              grid[boardY][boardX] = {
                type: currentPiece.type,
                isGhost: false,
                isClearing: false,
              };
            }
          }
        }
      }
    }

    return grid;
  }, [matrix, currentPiece, ghostY, clearingLines]);

  return (
    <div className="relative flex items-center justify-center w-full max-w-[340px] sm:max-w-[360px] mx-auto select-none">
      {/* Board Container with Bevel & Arcade Frame */}
      <div
        ref={boardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`game-touch-surface relative w-full aspect-[1/2] rounded-xl overflow-hidden border-2 transition-transform duration-75 shadow-2xl ${
          screenShake ? 'translate-y-1 scale-[0.99] rotate-[0.5deg]' : ''
        }`}
        style={{
          backgroundColor: themePalette.boardBg,
          borderColor: theme === 'gameboy' ? '#306230' : 'rgba(255, 255, 255, 0.12)',
          boxShadow:
            theme === 'gameboy'
              ? 'inset 0 2px 6px rgba(0,0,0,0.4)'
              : '0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 0 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Subtle grid background lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${themePalette.gridLine} 1px, transparent 1px),
              linear-gradient(to bottom, ${themePalette.gridLine} 1px, transparent 1px)
            `,
            backgroundSize: `calc(100% / ${BOARD_WIDTH}) calc(100% / ${BOARD_HEIGHT})`,
          }}
        />

        {/* 10x20 Grid Display */}
        <div className="grid grid-cols-10 grid-rows-20 w-full h-full p-0.5">
          {displayGrid.flatMap((row, r) =>
            row.map((cell, c) => {
              if (cell.isClearing) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className="w-full h-full bg-white animate-pulse rounded-[2px]"
                  />
                );
              }

              if (cell.type) {
                const pieceConfig = themePalette.pieces[cell.type as keyof typeof themePalette.pieces];

                if (cell.isGhost) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      className="w-full h-full p-[1px]"
                    >
                      <div
                        className="w-full h-full rounded-[3px] border border-dashed transition-all opacity-40"
                        style={{
                          borderColor: pieceConfig?.border || '#ffffff',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }}
                      />
                    </div>
                  );
                }

                // Solid or Active Piece Cell
                return (
                  <div key={`${r}-${c}`} className="w-full h-full p-[1px]">
                    <div
                      className="w-full h-full rounded-[3px] relative overflow-hidden transition-all"
                      style={{
                        backgroundColor: pieceConfig?.fill || '#ffffff',
                        boxShadow:
                          theme === 'gameboy'
                            ? 'none'
                            : `inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.4), 0 0 6px ${pieceConfig?.glow || 'transparent'}`,
                        border: `1px solid ${pieceConfig?.border || 'rgba(255,255,255,0.3)'}`,
                      }}
                    >
                      {/* Gloss highlight edge */}
                      {theme !== 'gameboy' && (
                        <div className="absolute top-0 left-0 right-0 h-[25%] bg-white/25 rounded-t-[2px]" />
                      )}
                    </div>
                  </div>
                );
              }

              // Empty cell
              return <div key={`${r}-${c}`} className="w-full h-full" />;
            })
          )}
        </div>

        {/* Floating Notification Popups (TETRIS!, T-SPIN!, LEVEL UP) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-2 overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`px-4 py-1.5 rounded-lg font-bold tracking-wider text-center shadow-xl backdrop-blur-md transform animate-bounce ${
                notif.type === 'tetris'
                  ? 'bg-gradient-to-r from-amber-500/90 to-cyan-500/90 text-white text-base sm:text-lg border border-amber-300/40'
                  : notif.type === 'tspin'
                  ? 'bg-purple-600/90 text-white text-sm sm:text-base border border-purple-300/30'
                  : notif.type === 'levelup'
                  ? 'bg-emerald-600/90 text-white text-sm sm:text-base border border-emerald-300/30'
                  : 'bg-slate-800/90 text-cyan-300 text-xs sm:text-sm border border-slate-700'
              }`}
            >
              <div className="leading-tight">{notif.text}</div>
              {notif.subtext && (
                <div className="text-[10px] tracking-normal opacity-90 font-mono-numbers">
                  {notif.subtext}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

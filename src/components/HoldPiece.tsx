import React from 'react';
import { TetrominoType, ThemeId } from '../types/tetris';
import { TETROMINO_SHAPES, THEMES } from '../utils/tetrisConstants';

interface HoldPieceProps {
  pieceType: TetrominoType | null;
  canHold: boolean;
  theme: ThemeId;
  onHoldClick?: () => void;
}

export const HoldPiece: React.FC<HoldPieceProps> = ({
  pieceType,
  canHold,
  theme,
  onHoldClick,
}) => {
  const themePalette = THEMES[theme];
  const shape = pieceType ? TETROMINO_SHAPES[pieceType] : null;
  const pieceConfig = pieceType ? themePalette.pieces[pieceType] : null;

  return (
    <div
      onClick={canHold ? onHoldClick : undefined}
      className={`flex flex-col items-center justify-between p-2 rounded-xl border transition-all ${
        canHold && onHoldClick ? 'cursor-pointer active:scale-95' : ''
      }`}
      style={{
        backgroundColor: theme === 'gameboy' ? '#8bac0f' : 'rgba(15, 23, 42, 0.65)',
        borderColor: theme === 'gameboy' ? '#306230' : 'rgba(255, 255, 255, 0.08)',
        opacity: canHold ? 1 : 0.45,
      }}
      title="Hold piece (Tap or press C)"
    >
      <div className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1">
        Hold
      </div>

      <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
        {shape && pieceConfig ? (
          <div
            className="grid gap-0.5"
            style={{
              gridTemplateColumns: `repeat(${shape[0].length}, minmax(0, 1fr))`,
            }}
          >
            {shape.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px]"
                  style={{
                    backgroundColor: cell ? pieceConfig.fill : 'transparent',
                    border: cell ? `1px solid ${pieceConfig.border}` : 'none',
                  }}
                />
              ))
            )}
          </div>
        ) : (
          <div className="text-slate-600 text-xs font-mono">-</div>
        )}
      </div>

      <div className="text-[9px] text-slate-500 font-mono-numbers">
        {canHold ? 'READY' : 'USED'}
      </div>
    </div>
  );
};

import React from 'react';
import { TetrominoType, ThemeId } from '../types/tetris';
import { TETROMINO_SHAPES, THEMES } from '../utils/tetrisConstants';

interface NextQueueProps {
  queue: TetrominoType[];
  theme: ThemeId;
}

export const NextQueue: React.FC<NextQueueProps> = ({ queue, theme }) => {
  const themePalette = THEMES[theme];
  const previewPieces = queue.slice(0, 3);

  return (
    <div
      className="flex flex-col items-center p-2 rounded-xl border"
      style={{
        backgroundColor: theme === 'gameboy' ? '#8bac0f' : 'rgba(15, 23, 42, 0.65)',
        borderColor: theme === 'gameboy' ? '#306230' : 'rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1">
        Next
      </div>

      <div className="flex flex-col items-center gap-2">
        {previewPieces.map((type, idx) => {
          const shape = TETROMINO_SHAPES[type];
          const pieceConfig = themePalette.pieces[type];

          return (
            <div
              key={`${type}-${idx}`}
              className="w-12 h-10 sm:w-14 sm:h-11 flex items-center justify-center"
            >
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
                        backgroundColor: cell ? pieceConfig?.fill : 'transparent',
                        border: cell ? `1px solid ${pieceConfig?.border}` : 'none',
                        opacity: idx === 0 ? 1 : 0.65 - idx * 0.15,
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

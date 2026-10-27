import React from 'react';
import { GameMode, GameStats, ThemeId } from '../types/tetris';
import { formatTimer } from '../utils/tetrisLogic';

interface ScoreBoardProps {
  stats: GameStats;
  mode: GameMode;
  theme: ThemeId;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ stats, mode, theme }) => {
  const isSprint = mode === 'sprint';
  const isUltra = mode === 'ultra';

  // In Ultra, show countdown remaining from 120s
  const ultraRemainingMs = Math.max(0, 120000 - stats.elapsedTime);

  return (
    <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs">
      {/* Score & High Score */}
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          Score
        </span>
        <span className="text-lg sm:text-xl font-bold font-mono-numbers text-slate-100 leading-tight">
          {stats.score.toLocaleString()}
        </span>
        <span className="text-[10px] text-slate-500 font-mono-numbers">
          Best: {stats.highScore.toLocaleString()}
        </span>
      </div>

      {/* Middle: Mode Timer or Level */}
      <div className="flex flex-col items-center">
        {isUltra ? (
          <>
            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
              Time Left
            </span>
            <span className="text-base sm:text-lg font-bold font-mono-numbers text-amber-300">
              {formatTimer(ultraRemainingMs)}
            </span>
          </>
        ) : isSprint ? (
          <>
            <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">
              Timer
            </span>
            <span className="text-base sm:text-lg font-bold font-mono-numbers text-cyan-300">
              {formatTimer(stats.elapsedTime)}
            </span>
          </>
        ) : (
          <>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Level
            </span>
            <span className="text-base sm:text-lg font-bold font-mono-numbers text-cyan-400">
              {stats.level}
            </span>
          </>
        )}
      </div>

      {/* Right: Lines */}
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          {isSprint ? 'Lines Left' : 'Lines'}
        </span>
        <span className="text-base sm:text-lg font-bold font-mono-numbers text-slate-200">
          {isSprint ? Math.max(0, 40 - stats.lines) : stats.lines}
        </span>
        {stats.currentCombo > 1 && (
          <span className="text-[10px] text-amber-400 font-bold animate-pulse font-mono-numbers">
            {stats.currentCombo}x Combo
          </span>
        )}
      </div>
    </div>
  );
};

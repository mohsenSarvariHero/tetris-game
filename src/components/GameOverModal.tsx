import React from 'react';
import { GameMode, GameStats, GameStatus } from '../types/tetris';
import { RotateCcw, Trophy, Award, Zap, Clock } from 'lucide-react';
import { formatTimer } from '../utils/tetrisLogic';

interface GameOverModalProps {
  status: GameStatus;
  mode: GameMode;
  stats: GameStats;
  onPlayAgain: () => void;
  onOpenModeSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  mode,
  stats,
  onPlayAgain,
  onOpenModeSelect,
}) => {
  const isVictory = status === 'VICTORY';
  const isNewRecord = stats.score > 0 && stats.score >= stats.highScore;

  // Compute Pieces Per Minute (PPM)
  const elapsedMinutes = Math.max(0.1, stats.elapsedTime / 60000);
  const ppm = Math.round(stats.piecesPlaced / elapsedMinutes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Title & Badge */}
        <div className="flex flex-col items-center text-center gap-1">
          {isVictory ? (
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
              <Trophy className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1">
              <Award className="w-6 h-6" />
            </div>
          )}

          <h2 className="text-2xl font-black tracking-tight text-slate-100">
            {isVictory ? 'Victory!' : 'Game Over'}
          </h2>

          <p className="text-xs text-slate-400">
            {mode === 'sprint' && isVictory
              ? 'You completed the 40 lines sprint!'
              : mode === 'ultra'
              ? 'Time is up! Great performance.'
              : 'Well played! Ready for another run?'}
          </p>
        </div>

        {/* Score & Record Box */}
        <div className="w-full bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
            Final Score
          </span>
          <span className="text-3xl font-black font-mono-numbers text-cyan-400">
            {stats.score.toLocaleString()}
          </span>

          {isNewRecord && (
            <span className="text-xs text-amber-400 font-bold tracking-wide mt-1 animate-pulse">
              ★ NEW HIGH SCORE! ★
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-tight flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Time
            </span>
            <span className="font-bold text-slate-200 font-mono-numbers text-sm mt-0.5">
              {formatTimer(stats.elapsedTime)}
            </span>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-tight flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              PPM
            </span>
            <span className="font-bold text-slate-200 font-mono-numbers text-sm mt-0.5">
              {ppm} <span className="text-[10px] font-normal text-slate-400">pcs/min</span>
            </span>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-tight">
              Lines Cleared
            </span>
            <span className="font-bold text-slate-200 font-mono-numbers text-sm mt-0.5">
              {stats.lines}
            </span>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-tight">
              Tetrises
            </span>
            <span className="font-bold text-slate-200 font-mono-numbers text-sm mt-0.5">
              {stats.tetrises}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 mt-1">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-lg shadow-cyan-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            type="button"
            onClick={onOpenModeSelect}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center transition-colors"
          >
            Change Mode
          </button>
        </div>
      </div>
    </div>
  );
};

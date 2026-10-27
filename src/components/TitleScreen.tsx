import React from 'react';
import { GameMode } from '../types/tetris';
import { Play, Sparkles, Keyboard, Touchpad } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface TitleScreenProps {
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStartGame: () => void;
  highScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  mode,
  onSelectMode,
  onStartGame,
  highScore,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center max-w-sm mx-auto z-10 w-full">
      {/* Brand & Retro Title */}
      <div className="relative mb-6">
        <div className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-br from-cyan-300 via-sky-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-md">
          TETRIS
        </div>
        <div className="text-xs uppercase tracking-widest text-cyan-400/80 font-bold mt-1">
          Touch Arcade Edition
        </div>
      </div>

      {/* High Score Banner */}
      {highScore > 0 && (
        <div className="mb-6 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Best Score:</span>
          <span className="font-mono-numbers font-bold text-white">
            {highScore.toLocaleString()}
          </span>
        </div>
      )}

      {/* Mode Selector Segmented Tabs */}
      <div className="w-full bg-slate-900/80 p-1 rounded-xl border border-slate-800 mb-6 flex">
        {(['marathon', 'sprint', 'ultra'] as GameMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onSelectMode(m)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
              mode === m
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Big Start Button */}
      <button
        type="button"
        onClick={onStartGame}
        className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-98 transition-all mb-3 cursor-pointer"
      >
        <Play className="w-5 h-5 fill-slate-950" />
        <span>START GAME</span>
      </button>

      {/* In-App PWA Install Banner */}
      <div className="w-full max-w-xs mb-5">
        <PWAInstallButton variant="prominent" />
      </div>

      {/* Controls Quick Hints */}
      <div className="w-full bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 text-[11px] text-slate-400 flex flex-col gap-2">
        <div className="flex items-center justify-center gap-1 text-slate-300 font-semibold">
          <Touchpad className="w-3.5 h-3.5 text-cyan-400" />
          <span>Mobile Touch & Haptics</span>
        </div>
        <div className="text-slate-300 text-[11px] leading-relaxed">
          👉 <strong>Touch anywhere on screen:</strong> Slide to steer · Tap right/left to rotate · Drag down to drop · Flick down for hard drop · Swipe up to hold!
        </div>

        <div className="hidden sm:flex items-center justify-center gap-1 text-slate-400 text-[10px] pt-1 border-t border-slate-800/60">
          <Keyboard className="w-3.5 h-3.5 text-slate-400" />
          <span>Desktop: Arrow Keys / WASD · Space to Drop · C to Hold</span>
        </div>
      </div>
    </div>
  );
};

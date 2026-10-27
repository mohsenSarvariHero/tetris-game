import React from 'react';
import { GameMode, GameStatus } from '../types/tetris';
import { Volume2, VolumeX, Pause, Play, Settings as SettingsIcon } from 'lucide-react';

interface HeaderBarProps {
  mode: GameMode;
  status: GameStatus;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onOpenSettings: () => void;
  onOpenModeSelect: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  mode,
  status,
  soundEnabled,
  onToggleSound,
  onTogglePause,
  onOpenSettings,
  onOpenModeSelect,
}) => {
  const modeLabels: Record<GameMode, string> = {
    marathon: 'Marathon',
    sprint: 'Sprint 40L',
    ultra: 'Ultra 2M',
  };

  return (
    <header className="flex items-center justify-between gap-4 px-4 py-2 border-b border-white/5 bg-slate-950/60 backdrop-blur-md shrink-0 w-full z-20">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent whitespace-nowrap">
          Tetris Touch
        </span>
      </div>

      {/* Zone 2: Mode trigger link */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenModeSelect}
          className="text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors whitespace-nowrap px-2 py-1 rounded-md hover:bg-white/5 flex items-center gap-1.5"
          title="Change game mode"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>{modeLabels[mode]}</span>
        </button>
      </div>

      {/* Zone 3: Primary quick controls */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleSound}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
          aria-label={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          title={soundEnabled ? 'Mute' : 'Unmute'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
          aria-label="Settings"
          title="Game Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {status === 'PLAYING' || status === 'PAUSED' ? (
          <button
            type="button"
            onClick={onTogglePause}
            className="px-2.5 py-1 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg flex items-center gap-1 transition-all active:scale-95"
            aria-label={status === 'PLAYING' ? 'Pause' : 'Resume'}
          >
            {status === 'PLAYING' ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span className="hidden sm:inline">Resume</span>
              </>
            )}
          </button>
        ) : null}
      </div>
    </header>
  );
};

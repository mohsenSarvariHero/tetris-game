import React from 'react';
import { GameMode } from '../types/tetris';
import { X, Flame, Zap, Timer } from 'lucide-react';

interface ModeSelectModalProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onClose: () => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  currentMode,
  onSelectMode,
  onClose,
}) => {
  const modes: {
    id: GameMode;
    name: string;
    description: string;
    icon: React.ReactNode;
    tag: string;
  }[] = [
    {
      id: 'marathon',
      name: 'Marathon',
      description: 'Classic endless Tetris. Levels advance every 10 lines as speed escalates.',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      tag: 'Endless',
    },
    {
      id: 'sprint',
      name: 'Sprint 40L',
      description: 'Clear 40 lines as fast as humanly possible. Test your piece placement speed.',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      tag: '40 Lines',
    },
    {
      id: 'ultra',
      name: 'Ultra 2M',
      description: 'Score maximum points within a tight 120-second countdown.',
      icon: <Timer className="w-5 h-5 text-purple-400" />,
      tag: '120 Seconds',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100">Select Game Mode</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modes List */}
        <div className="flex flex-col gap-2.5">
          {modes.map((m) => {
            const isSelected = currentMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onSelectMode(m.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/15'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-800/80 mt-0.5 shrink-0">
                  {m.icon}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">{m.name}</span>
                    <span className="text-[10px] text-cyan-400/90 font-mono-numbers">
                      · {m.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    {m.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

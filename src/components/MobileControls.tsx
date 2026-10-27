import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCw,
  RotateCcw,
  ChevronsDown,
  Package,
} from 'lucide-react';
import { ThemeId } from '../types/tetris';

interface MobileControlsProps {
  theme: ThemeId;
  onStartMoveLeft: () => void;
  onStopMoveLeft: () => void;
  onStartMoveRight: () => void;
  onStopMoveRight: () => void;
  onStartSoftDrop: () => void;
  onStopSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCw: () => void;
  onRotateCcw: () => void;
  onHold: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  theme,
  onStartMoveLeft,
  onStopMoveLeft,
  onStartMoveRight,
  onStopMoveRight,
  onStartSoftDrop,
  onStopSoftDrop,
  onHardDrop,
  onRotateCw,
  onRotateCcw,
  onHold,
}) => {
  const isGameboy = theme === 'gameboy';

  return (
    <div className="w-full max-w-lg mx-auto px-3 py-1 select-none game-touch-surface">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Thumb Cluster: D-Pad / Directional Controls */}
        <div className="flex flex-col items-center">
          {/* Top row: Hard Drop */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onHardDrop();
            }}
            className={`w-14 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all active:scale-95 shadow-md ${
              isGameboy
                ? 'bg-[#306230] text-[#9bbc0f] border border-[#0f380f] active:bg-[#0f380f]'
                : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 active:bg-cyan-500/40'
            }`}
            aria-label="Hard Drop"
          >
            <ChevronsDown className="w-5 h-5" />
            <span className="text-[9px] uppercase tracking-tighter -mt-0.5 font-bold">Hard</span>
          </button>

          {/* Middle & Bottom row: Left, Down, Right */}
          <div className="flex items-center gap-2 mt-1.5">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onStartMoveLeft();
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                onStopMoveLeft();
              }}
              onPointerLeave={(e) => {
                e.preventDefault();
                onStopMoveLeft();
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                onStopMoveLeft();
              }}
              className={`w-13 h-13 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-md ${
                isGameboy
                  ? 'bg-[#306230] text-[#9bbc0f] border border-[#0f380f] active:bg-[#0f380f]'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:bg-slate-700/80 active:bg-cyan-500/20 active:border-cyan-500/50'
              }`}
              aria-label="Move Left"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onStartSoftDrop();
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                onStopSoftDrop();
              }}
              onPointerLeave={(e) => {
                e.preventDefault();
                onStopSoftDrop();
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                onStopSoftDrop();
              }}
              className={`w-13 h-13 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-md ${
                isGameboy
                  ? 'bg-[#306230] text-[#9bbc0f] border border-[#0f380f] active:bg-[#0f380f]'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:bg-slate-700/80 active:bg-cyan-500/20 active:border-cyan-500/50'
              }`}
              aria-label="Soft Drop"
            >
              <ArrowDown className="w-6 h-6" />
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onStartMoveRight();
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                onStopMoveRight();
              }}
              onPointerLeave={(e) => {
                e.preventDefault();
                onStopMoveRight();
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                onStopMoveRight();
              }}
              className={`w-13 h-13 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-md ${
                isGameboy
                  ? 'bg-[#306230] text-[#9bbc0f] border border-[#0f380f] active:bg-[#0f380f]'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:bg-slate-700/80 active:bg-cyan-500/20 active:border-cyan-500/50'
              }`}
              aria-label="Move Right"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Center Accent Divider / Hold Button */}
        <div className="flex flex-col items-center justify-center pt-2">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onHold();
            }}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-md ${
              isGameboy
                ? 'bg-[#8bac0f] text-[#306230] border border-[#306230]'
                : 'bg-slate-800/60 border border-slate-700/60 text-amber-400 hover:bg-slate-700/60 active:bg-amber-500/20 active:border-amber-500/50'
            }`}
            aria-label="Hold Piece"
          >
            <Package className="w-5 h-5" />
            <span className="text-[8px] uppercase tracking-wider font-bold">Hold</span>
          </button>
        </div>

        {/* Right Thumb Cluster: Rotations */}
        <div className="flex flex-col items-center gap-2">
          {/* Rotate CW (Primary Action - Big Hitbox) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onRotateCcw();
              }}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-md ${
                isGameboy
                  ? 'bg-[#306230] text-[#9bbc0f] border border-[#0f380f]'
                  : 'bg-slate-800/80 border border-slate-700/80 text-purple-300 hover:bg-slate-700/80 active:bg-purple-500/25 active:border-purple-500/50'
              }`}
              aria-label="Rotate Counter-Clockwise"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="text-[8px] font-bold">⟲ CCW</span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onRotateCw();
              }}
              className={`w-16 h-14 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-lg ${
                isGameboy
                  ? 'bg-[#306230] text-[#9bbc0f] border-2 border-[#0f380f] active:bg-[#0f380f]'
                  : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/40 text-purple-200 hover:border-purple-400 active:bg-purple-500/40'
              }`}
              aria-label="Rotate Clockwise"
            >
              <RotateCw className="w-6 h-6 text-purple-300" />
              <span className="text-[10px] font-bold uppercase tracking-tight text-white mt-0.5">Rotate</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono-numbers text-center">
            TAP / SWIPE READY
          </div>
        </div>
      </div>
    </div>
  );
};

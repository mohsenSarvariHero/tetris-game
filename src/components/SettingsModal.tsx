import React from 'react';
import { GameSettings, ThemeId, ControlsLayout } from '../types/tetris';
import { X, Volume2, Music, Vibrate, Eye, Smartphone, Palette } from 'lucide-react';
import { THEMES } from '../utils/tetrisConstants';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const themeKeys = Object.keys(THEMES) as ThemeId[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100">Game Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Themes Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            Visual Theme
          </label>
          <div className="grid grid-cols-2 gap-2">
            {themeKeys.map((themeId) => {
              const themeData = THEMES[themeId];
              const isSelected = settings.theme === themeId;
              return (
                <button
                  key={themeId}
                  type="button"
                  onClick={() => onUpdateSettings({ theme: themeId })}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold">{themeData.name}</div>
                  <div className="flex gap-1 mt-1.5">
                    {['I', 'T', 'O', 'S'].map((p) => (
                      <span
                        key={p}
                        className="w-2.5 h-2.5 rounded-[1px]"
                        style={{
                          backgroundColor:
                            themeData.pieces[p as keyof typeof themeData.pieces].fill,
                        }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls Layout */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            Mobile Control Mode
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'buttons', label: 'Buttons' },
              { id: 'gestures', label: 'Gestures' },
              { id: 'hybrid', label: 'Hybrid' },
            ].map((layout) => (
              <button
                key={layout.id}
                type="button"
                onClick={() =>
                  onUpdateSettings({ controlsLayout: layout.id as ControlsLayout })
                }
                className={`py-2 px-1 text-center rounded-lg text-xs font-medium border transition-colors ${
                  settings.controlsLayout === layout.id
                    ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800/70'
                }`}
              >
                {layout.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-2 pt-1 border-t border-slate-800">
          {/* Sound FX */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-slate-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              Sound Effects
            </span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Music */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-slate-300 flex items-center gap-2">
              <Music className="w-4 h-4 text-indigo-400" />
              Retro Chiptune Music
            </span>
            <input
              type="checkbox"
              checked={settings.musicEnabled}
              onChange={(e) => onUpdateSettings({ musicEnabled: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Haptics */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-slate-300 flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-amber-400" />
              Vibration / Haptics
            </span>
            <input
              type="checkbox"
              checked={settings.hapticsEnabled}
              onChange={(e) => onUpdateSettings({ hapticsEnabled: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Ghost Piece */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              Ghost Piece Landing Shadow
            </span>
            <input
              type="checkbox"
              checked={settings.ghostPiece}
              onChange={(e) => onUpdateSettings({ ghostPiece: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* DAS & ARR Tuning */}
        <div className="flex flex-col gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-slate-400">
              <span>Auto-Shift Delay (DAS)</span>
              <span className="font-mono-numbers text-slate-200">{settings.das}ms</span>
            </div>
            <input
              type="range"
              min="80"
              max="240"
              step="10"
              value={settings.das}
              onChange={(e) => onUpdateSettings({ das: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-slate-400">
              <span>Repeat Rate (ARR)</span>
              <span className="font-mono-numbers text-slate-200">{settings.arr}ms</span>
            </div>
            <input
              type="range"
              min="20"
              max="60"
              step="5"
              value={settings.arr}
              onChange={(e) => onUpdateSettings({ arr: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* PWA Install Option */}
        <div className="pt-2 border-t border-slate-800">
          <PWAInstallButton variant="prominent" />
        </div>

        {/* Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};

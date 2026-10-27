import React, { useState } from 'react';
import { useTetris } from './hooks/useTetris';
import { GameBoard } from './components/GameBoard';
import { HoldPiece } from './components/HoldPiece';
import { NextQueue } from './components/NextQueue';
import { MobileControls } from './components/MobileControls';
import { HeaderBar } from './components/HeaderBar';
import { ScoreBoard } from './components/ScoreBoard';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { ModeSelectModal } from './components/ModeSelectModal';
import { TitleScreen } from './components/TitleScreen';
import { GameMode } from './types/tetris';

export default function App() {
  const {
    matrix,
    currentPiece,
    heldPieceType,
    canHold,
    nextQueue,
    clearingLines,
    stats,
    status,
    mode,
    settings,
    notifications,
    screenShake,
    actions,
  } = useTetris();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModeSelectOpen, setIsModeSelectOpen] = useState(false);

  const handleSelectMode = (newMode: GameMode) => {
    actions.setMode(newMode);
    actions.startGame(newMode);
  };

  return (
    <div className="arcade-bg w-full h-[100dvh] flex flex-col items-center justify-between overflow-hidden select-none text-slate-100 font-sans">
      {/* Top Header Bar */}
      <HeaderBar
        mode={mode}
        status={status}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => actions.updateSettings({ soundEnabled: !settings.soundEnabled })}
        onTogglePause={actions.togglePause}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenModeSelect={() => setIsModeSelectOpen(true)}
      />

      {/* Main Playfield or Title Screen */}
      {status === 'IDLE' ? (
        <TitleScreen
          mode={mode}
          onSelectMode={(m) => actions.setMode(m)}
          onStartGame={() => actions.startGame(mode)}
          highScore={stats.highScore}
        />
      ) : (
        <main className="flex-1 w-full max-w-4xl flex flex-col justify-between items-center px-2 py-1 min-h-0">
          {/* Top Score Banner */}
          <div className="w-full max-w-sm shrink-0">
            <ScoreBoard stats={stats} mode={mode} theme={settings.theme} />
          </div>

          {/* Central Arena: Hold Piece (Left) | Game Board (Center) | Next Queue (Right) */}
          <div className="flex-1 w-full flex items-center justify-center gap-2 sm:gap-4 min-h-0 my-auto">
            {/* Left Side: Hold Piece & Desktop Key Hints */}
            <div className="flex flex-col items-center justify-start gap-2 shrink-0 w-14 sm:w-20">
              <HoldPiece
                pieceType={heldPieceType}
                canHold={canHold}
                theme={settings.theme}
                onHoldClick={actions.holdPiece}
              />

              <div className="hidden lg:flex flex-col gap-1 p-2 bg-slate-900/40 rounded-xl border border-slate-800/60 text-[10px] text-slate-400 w-full text-center">
                <span className="font-semibold text-slate-300">Keys</span>
                <span>← → Move</span>
                <span>↑ Rotate</span>
                <span>↓ Soft Drop</span>
                <span>Space Drop</span>
                <span>C Hold</span>
              </div>
            </div>

            {/* Center: Game Board Viewport */}
            <div className="flex-1 flex items-center justify-center max-w-[280px] sm:max-w-[340px] h-full max-h-[62vh] min-h-[300px]">
              <GameBoard
                matrix={matrix}
                currentPiece={currentPiece}
                clearingLines={clearingLines}
                theme={settings.theme}
                ghostPieceEnabled={settings.ghostPiece}
                screenShake={screenShake}
                notifications={notifications}
                controlsLayout={settings.controlsLayout}
                onMove={actions.moveHorizontal}
                onRotate={() => actions.rotate(1)}
                onSoftDrop={actions.dropStep}
                onHardDrop={actions.hardDrop}
                onHold={actions.holdPiece}
              />
            </div>

            {/* Right Side: Next Pieces Queue & Stats */}
            <div className="flex flex-col items-center justify-start gap-2 shrink-0 w-14 sm:w-20">
              <NextQueue queue={nextQueue} theme={settings.theme} />

              <div className="hidden lg:flex flex-col gap-1 p-2 bg-slate-900/40 rounded-xl border border-slate-800/60 text-[10px] text-slate-400 w-full text-center">
                <span className="font-semibold text-slate-300">Stats</span>
                <span className="font-mono-numbers">Tetris: {stats.tetrises}</span>
                <span className="font-mono-numbers">Lines: {stats.lines}</span>
                <span className="font-mono-numbers">Combo: {stats.maxCombo}x</span>
              </div>
            </div>
          </div>

          {/* Bottom Mobile Ergonomic Controller Pad */}
          {settings.controlsLayout !== 'gestures' && (
            <div className="w-full shrink-0 pb-safe pt-1">
              <MobileControls
                theme={settings.theme}
                onStartMoveLeft={() => actions.startContinuousMove(-1)}
                onStopMoveLeft={actions.stopContinuousMove}
                onStartMoveRight={() => actions.startContinuousMove(1)}
                onStopMoveRight={actions.stopContinuousMove}
                onStartSoftDrop={actions.startSoftDrop}
                onStopSoftDrop={actions.stopSoftDrop}
                onHardDrop={actions.hardDrop}
                onRotateCw={() => actions.rotate(1)}
                onRotateCcw={() => actions.rotate(-1)}
                onHold={actions.holdPiece}
              />
            </div>
          )}
        </main>
      )}

      {/* Paused Overlay */}
      {status === 'PAUSED' && (
        <PauseModal
          onResume={actions.togglePause}
          onRestart={() => actions.startGame(mode)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenModeSelect={() => setIsModeSelectOpen(true)}
        />
      )}

      {/* Game Over / Victory Overlay */}
      {(status === 'GAME_OVER' || status === 'VICTORY') && (
        <GameOverModal
          status={status}
          mode={mode}
          stats={stats}
          onPlayAgain={() => actions.startGame(mode)}
          onOpenModeSelect={() => setIsModeSelectOpen(true)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={actions.updateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Mode Select Modal */}
      {isModeSelectOpen && (
        <ModeSelectModal
          currentMode={mode}
          onSelectMode={handleSelectMode}
          onClose={() => setIsModeSelectOpen(false)}
        />
      )}
    </div>
  );
}

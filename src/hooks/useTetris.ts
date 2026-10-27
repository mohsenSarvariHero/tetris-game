import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameMode,
  GameSettings,
  GameStats,
  GameStatus,
  Matrix,
  Piece,
  TetrominoType,
  FloatingNotification,
} from '../types/tetris';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DEFAULT_SETTINGS,
  LINE_SCORES,
  getDropInterval,
} from '../utils/tetrisConstants';
import {
  checkCollision,
  checkFullLines,
  checkTSpin,
  createEmptyMatrix,
  createPiece,
  formatTimer,
  generateBag,
  getGhostY,
  removeLinesFromMatrix,
  tryRotateWithSRS,
} from '../utils/tetrisLogic';
import { soundEngine, triggerHaptic } from '../utils/audio';
import confetti from 'canvas-confetti';

const STORAGE_KEY_HIGH_SCORE = 'tetris_touch_high_score_v1';
const STORAGE_KEY_SETTINGS = 'tetris_touch_settings_v1';

export function useTetris() {
  // Settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.controlsLayout === 'buttons') parsed.controlsLayout = 'hybrid';
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Game Status & Mode
  const [mode, setMode] = useState<GameMode>('marathon');
  const [status, setStatus] = useState<GameStatus>('IDLE');

  // Board State
  const [matrix, setMatrix] = useState<Matrix>(createEmptyMatrix);
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [heldPieceType, setHeldPieceType] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [clearingLines, setClearingLines] = useState<number[]>([]);

  // Visual effects
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<GameStats>(() => {
    let savedHigh = 0;
    try {
      savedHigh = parseInt(localStorage.getItem(STORAGE_KEY_HIGH_SCORE) || '0', 10);
    } catch {}
    return {
      score: 0,
      highScore: savedHigh,
      level: 1,
      lines: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      tetrises: 0,
      tSpins: 0,
      maxCombo: 0,
      currentCombo: 0,
      backToBack: false,
      piecesPlaced: 0,
      startTime: 0,
      elapsedTime: 0,
    };
  });

  // Mutable references for high-performance animation frames & inputs
  const bagRef = useRef<TetrominoType[]>([]);
  const matrixRef = useRef<Matrix>(matrix);
  matrixRef.current = matrix;

  const currentPieceRef = useRef<Piece | null>(currentPiece);
  currentPieceRef.current = currentPiece;

  const statsRef = useRef<GameStats>(stats);
  statsRef.current = stats;

  const statusRef = useRef<GameStatus>(status);
  statusRef.current = status;

  const settingsRef = useRef<GameSettings>(settings);
  settingsRef.current = settings;

  const lastMoveWasRotate = useRef<boolean>(false);
  const lockTimerRef = useRef<number | null>(null);
  const lockResetsCount = useRef<number>(0);
  const isSoftDropping = useRef<boolean>(false);

  // Sound Engine sync
  useEffect(() => {
    soundEngine.setMuted(!settings.soundEnabled);
    if (settings.musicEnabled && status === 'PLAYING') {
      soundEngine.startMusic();
    } else {
      soundEngine.stopMusic();
    }
  }, [settings.soundEnabled, settings.musicEnabled, status]);

  // Persist settings
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Pop notification helper
  const addNotification = useCallback((text: string, type: FloatingNotification['type'], subtext?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications((prev) => [...prev.slice(-3), { id, text, subtext, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 1800);
  }, []);

  // Get next tetromino from 7-bag
  const getNextFromBag = useCallback((): TetrominoType => {
    if (bagRef.current.length < 5) {
      bagRef.current = [...bagRef.current, ...generateBag()];
    }
    const next = bagRef.current.shift()!;
    setNextQueue([...bagRef.current.slice(0, 4)]);
    return next;
  }, []);

  // Trigger brief screen shake
  const triggerShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 200);
  }, []);

  // Spawn piece
  const spawnPiece = useCallback(
    (type?: TetrominoType) => {
      const pieceType = type || getNextFromBag();
      const newPiece = createPiece(pieceType);

      // Check immediate game over (collision at spawn)
      if (checkCollision(newPiece, matrixRef.current)) {
        setStatus('GAME_OVER');
        soundEngine.playGameOver();
        triggerHaptic('heavy', settingsRef.current.hapticsEnabled);
        return false;
      }

      setCurrentPiece(newPiece);
      setCanHold(true);
      lastMoveWasRotate.current = false;
      lockResetsCount.current = 0;
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
      return true;
    },
    [getNextFromBag]
  );

  // Lock piece into board matrix
  const lockPiece = useCallback(
    (pieceToLock: Piece) => {
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }

      const newMatrix = matrixRef.current.map((row) => [...row]);
      for (let r = 0; r < pieceToLock.shape.length; r++) {
        for (let c = 0; c < pieceToLock.shape[r].length; c++) {
          if (pieceToLock.shape[r][c] !== 0) {
            const boardY = pieceToLock.y + r;
            const boardX = pieceToLock.x + c;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              newMatrix[boardY][boardX] = pieceToLock.type;
            }
          }
        }
      }

      // Check T-Spin before clearing lines
      const { isTSpin, isMini } = checkTSpin(pieceToLock, matrixRef.current, lastMoveWasRotate.current);

      // Check full lines
      const fullRows = checkFullLines(newMatrix);
      const linesCleared = fullRows.length;

      // Update statistics
      setStats((prev) => {
        let addedScore = 0;
        let isTetris = linesCleared === 4;
        let isB2B = prev.backToBack && (isTetris || isTSpin);
        let newCombo = linesCleared > 0 ? prev.currentCombo + 1 : 0;
        let comboBonus = linesCleared > 0 && newCombo > 1 ? 50 * (newCombo - 1) * prev.level : 0;

        if (isTSpin) {
          if (linesCleared === 0) addedScore = isMini ? 100 * prev.level : 400 * prev.level;
          else if (linesCleared === 1) addedScore = (isMini ? 200 : 800) * prev.level;
          else if (linesCleared === 2) addedScore = 1200 * prev.level;
          else if (linesCleared === 3) addedScore = 1600 * prev.level;
          if (isB2B) addedScore = Math.floor(addedScore * 1.5);
        } else {
          switch (linesCleared) {
            case 1:
              addedScore = LINE_SCORES.SINGLE * prev.level;
              break;
            case 2:
              addedScore = LINE_SCORES.DOUBLE * prev.level;
              break;
            case 3:
              addedScore = LINE_SCORES.TRIPLE * prev.level;
              break;
            case 4:
              addedScore = (isB2B ? LINE_SCORES.B2B_TETRIS : LINE_SCORES.TETRIS) * prev.level;
              break;
          }
        }

        const newScore = prev.score + addedScore + comboBonus;
        const newLines = prev.lines + linesCleared;
        const newLevel = mode === 'marathon' ? Math.floor(newLines / 10) + 1 : prev.level;

        // Sound & Haptic triggers
        if (linesCleared > 0) {
          soundEngine.playLineClear(linesCleared, isTetris);
          triggerHaptic(isTetris ? 'heavy' : 'medium', settingsRef.current.hapticsEnabled);
        } else {
          soundEngine.playSoftDrop();
          triggerHaptic('light', settingsRef.current.hapticsEnabled);
        }

        // Celebrations & Notifications
        if (isTetris) {
          triggerShake();
          addNotification(isB2B ? 'BACK-TO-BACK TETRIS!' : 'TETRIS!', 'tetris', `+${addedScore}`);
          try {
            confetti({
              particleCount: 45,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#06b6d4', '#3b82f6', '#f97316', '#eab308'],
            });
          } catch {}
        } else if (isTSpin) {
          triggerShake();
          addNotification(isMini ? 'T-SPIN MINI' : 'T-SPIN!', 'tspin', `+${addedScore}`);
        } else if (newCombo > 2) {
          addNotification(`COMBO x${newCombo}`, 'combo', `+${comboBonus}`);
        }

        if (newLevel > prev.level) {
          soundEngine.playLevelUp();
          triggerHaptic('success', settingsRef.current.hapticsEnabled);
          addNotification(`LEVEL ${newLevel}`, 'levelup', 'SPEED UP!');
        }

        // High score persistence
        const updatedHigh = Math.max(newScore, prev.highScore);
        if (updatedHigh > prev.highScore) {
          try {
            localStorage.setItem(STORAGE_KEY_HIGH_SCORE, updatedHigh.toString());
          } catch {}
        }

        return {
          ...prev,
          score: newScore,
          highScore: updatedHigh,
          level: newLevel,
          lines: newLines,
          singles: prev.singles + (linesCleared === 1 ? 1 : 0),
          doubles: prev.doubles + (linesCleared === 2 ? 1 : 0),
          triples: prev.triples + (linesCleared === 3 ? 1 : 0),
          tetrises: prev.tetrises + (linesCleared === 4 ? 1 : 0),
          tSpins: prev.tSpins + (isTSpin ? 1 : 0),
          maxCombo: Math.max(prev.maxCombo, newCombo),
          currentCombo: newCombo,
          backToBack: linesCleared === 4 || (isTSpin && linesCleared > 0),
          piecesPlaced: prev.piecesPlaced + 1,
        };
      });

      // Handle Sprint (40 lines) victory condition
      if (mode === 'sprint' && statsRef.current.lines + linesCleared >= 40) {
        setMatrix(newMatrix);
        setCurrentPiece(null);
        setStatus('VICTORY');
        soundEngine.playLevelUp();
        triggerHaptic('success', settingsRef.current.hapticsEnabled);
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } catch {}
        return;
      }

      // If lines cleared, trigger flash animation before dropping
      if (linesCleared > 0) {
        setMatrix(newMatrix);
        setClearingLines(fullRows);
        setCurrentPiece(null);

        setTimeout(() => {
          setClearingLines([]);
          const collapsed = removeLinesFromMatrix(newMatrix, fullRows);
          setMatrix(collapsed);
          spawnPiece();
        }, 140);
      } else {
        setMatrix(newMatrix);
        spawnPiece();
      }
    },
    [mode, spawnPiece, triggerShake, addNotification]
  );

  // Move piece horizontally (dx = -1 or +1)
  const moveHorizontal = useCallback((dx: number): boolean => {
    if (statusRef.current !== 'PLAYING' || !currentPieceRef.current) return false;

    const piece = currentPieceRef.current;
    if (!checkCollision(piece, matrixRef.current, dx, 0)) {
      setCurrentPiece({ ...piece, x: piece.x + dx });
      lastMoveWasRotate.current = false;
      soundEngine.playMove();
      triggerHaptic('light', settingsRef.current.hapticsEnabled);

      // Lock delay reset if sliding on floor
      if (checkCollision(piece, matrixRef.current, 0, 1)) {
        if (lockResetsCount.current < 15) {
          lockResetsCount.current++;
          if (lockTimerRef.current) {
            clearTimeout(lockTimerRef.current);
            lockTimerRef.current = null;
          }
        }
      }
      return true;
    }
    return false;
  }, []);

  // Rotate piece (dir = 1 for CW, -1 for CCW)
  const rotate = useCallback((dir: 1 | -1 = 1): boolean => {
    if (statusRef.current !== 'PLAYING' || !currentPieceRef.current) return false;

    const piece = currentPieceRef.current;
    const rotated = tryRotateWithSRS(piece, matrixRef.current, dir);

    if (rotated) {
      setCurrentPiece(rotated.newPiece);
      lastMoveWasRotate.current = true;
      soundEngine.playRotate();
      triggerHaptic('light', settingsRef.current.hapticsEnabled);

      // Lock delay reset if rotating on floor
      if (checkCollision(rotated.newPiece, matrixRef.current, 0, 1)) {
        if (lockResetsCount.current < 15) {
          lockResetsCount.current++;
          if (lockTimerRef.current) {
            clearTimeout(lockTimerRef.current);
            lockTimerRef.current = null;
          }
        }
      }
      return true;
    }
    return false;
  }, []);

  // Soft drop step (1 row down)
  const dropStep = useCallback((): boolean => {
    if (statusRef.current !== 'PLAYING' || !currentPieceRef.current) return false;

    const piece = currentPieceRef.current;
    if (!checkCollision(piece, matrixRef.current, 0, 1)) {
      setCurrentPiece({ ...piece, y: piece.y + 1 });
      lastMoveWasRotate.current = false;

      if (isSoftDropping.current) {
        setStats((prev) => ({ ...prev, score: prev.score + LINE_SCORES.SOFT_DROP_PER_ROW }));
      }
      return true;
    } else {
      // Reached floor: trigger lock delay or immediate lock
      if (!lockTimerRef.current) {
        lockTimerRef.current = window.setTimeout(() => {
          if (currentPieceRef.current) {
            lockPiece(currentPieceRef.current);
          }
        }, 500);
      }
      return false;
    }
  }, [lockPiece]);

  // Hard drop (instantly slams piece to bottom and locks)
  const hardDrop = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || !currentPieceRef.current) return;

    const piece = currentPieceRef.current;
    const ghostY = getGhostY(piece, matrixRef.current);
    const dropDistance = ghostY - piece.y;

    const droppedPiece = { ...piece, y: ghostY };
    setCurrentPiece(droppedPiece);

    setStats((prev) => ({
      ...prev,
      score: prev.score + dropDistance * LINE_SCORES.HARD_DROP_PER_ROW,
    }));

    soundEngine.playHardDrop();
    triggerHaptic('heavy', settingsRef.current.hapticsEnabled);
    triggerShake();

    lockPiece(droppedPiece);
  }, [lockPiece, triggerShake]);

  // Hold current piece
  const holdPiece = useCallback(() => {
    if (statusRef.current !== 'PLAYING' || !currentPieceRef.current || !canHold) return;

    soundEngine.playHold();
    triggerHaptic('medium', settingsRef.current.hapticsEnabled);

    const currentType = currentPieceRef.current.type;
    setCanHold(false);

    if (heldPieceType === null) {
      setHeldPieceType(currentType);
      spawnPiece();
    } else {
      const prevHeld = heldPieceType;
      setHeldPieceType(currentType);
      spawnPiece(prevHeld);
    }
  }, [canHold, heldPieceType, spawnPiece]);

  // Start new game
  const startGame = useCallback(
    (newMode: GameMode = mode) => {
      setMode(newMode);
      bagRef.current = [...generateBag(), ...generateBag()];
      const firstPieceType = bagRef.current.shift()!;
      setNextQueue([...bagRef.current.slice(0, 4)]);

      setMatrix(createEmptyMatrix());
      setHeldPieceType(null);
      setCanHold(true);
      setClearingLines([]);
      setNotifications([]);

      const initialPiece = createPiece(firstPieceType);
      setCurrentPiece(initialPiece);

      setStats((prev) => ({
        score: 0,
        highScore: prev.highScore,
        level: 1,
        lines: 0,
        singles: 0,
        doubles: 0,
        triples: 0,
        tetrises: 0,
        tSpins: 0,
        maxCombo: 0,
        currentCombo: 0,
        backToBack: false,
        piecesPlaced: 0,
        startTime: Date.now(),
        elapsedTime: 0,
      }));

      setStatus('PLAYING');
      if (settingsRef.current.musicEnabled) {
        soundEngine.startMusic();
      }
    },
    [mode]
  );

  // Pause / Resume game
  const togglePause = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'PLAYING') {
        soundEngine.stopMusic();
        return 'PAUSED';
      } else if (prev === 'PAUSED') {
        if (settingsRef.current.musicEnabled) soundEngine.startMusic();
        return 'PLAYING';
      }
      return prev;
    });
  }, []);

  // Continuous Auto-Repeat (DAS & ARR) for mobile buttons and keyboard
  const dasTimeoutRef = useRef<number | null>(null);
  const arrIntervalRef = useRef<number | null>(null);

  const startContinuousMove = useCallback(
    (dx: number) => {
      moveHorizontal(dx);

      if (dasTimeoutRef.current) clearTimeout(dasTimeoutRef.current);
      if (arrIntervalRef.current) clearInterval(arrIntervalRef.current);

      dasTimeoutRef.current = window.setTimeout(() => {
        arrIntervalRef.current = window.setInterval(() => {
          moveHorizontal(dx);
        }, settingsRef.current.arr);
      }, settingsRef.current.das);
    },
    [moveHorizontal]
  );

  const stopContinuousMove = useCallback(() => {
    if (dasTimeoutRef.current) {
      clearTimeout(dasTimeoutRef.current);
      dasTimeoutRef.current = null;
    }
    if (arrIntervalRef.current) {
      clearInterval(arrIntervalRef.current);
      arrIntervalRef.current = null;
    }
  }, []);

  // Continuous Soft Drop
  const softDropIntervalRef = useRef<number | null>(null);
  const startSoftDrop = useCallback(() => {
    isSoftDropping.current = true;
    dropStep();
    if (softDropIntervalRef.current) clearInterval(softDropIntervalRef.current);
    softDropIntervalRef.current = window.setInterval(() => {
      dropStep();
    }, 45);
  }, [dropStep]);

  const stopSoftDrop = useCallback(() => {
    isSoftDropping.current = false;
    if (softDropIntervalRef.current) {
      clearInterval(softDropIntervalRef.current);
      softDropIntervalRef.current = null;
    }
  }, []);

  // Main game tick loop using requestAnimationFrame + accumulator
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let dropAccumulator = 0;

    const loop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (statusRef.current === 'PLAYING') {
        // Track elapsed time
        setStats((prev) => {
          const now = Date.now();
          const elapsed = now - prev.startTime;

          // Check Ultra mode 2-minute timer limit
          if (mode === 'ultra' && elapsed >= 120000) {
            setStatus('GAME_OVER');
            soundEngine.playGameOver();
            triggerHaptic('heavy', settingsRef.current.hapticsEnabled);
          }

          return { ...prev, elapsedTime: elapsed };
        });

        // Drop tick
        if (!isSoftDropping.current) {
          dropAccumulator += deltaTime;
          const interval = getDropInterval(statsRef.current.level);

          if (dropAccumulator >= interval) {
            dropStep();
            dropAccumulator = 0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dropStep, mode]);

  // Keyboard navigation support for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (statusRef.current === 'IDLE' && (e.code === 'Space' || e.code === 'Enter')) {
        startGame();
        return;
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
        return;
      }

      if (statusRef.current !== 'PLAYING') return;

      if (e.repeat && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
        return; // Handled by continuous move or default
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          startContinuousMove(-1);
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          startContinuousMove(1);
          break;
        case 'ArrowUp':
        case 'KeyX':
        case 'KeyW':
          e.preventDefault();
          rotate(1);
          break;
        case 'KeyZ':
        case 'ControlLeft':
        case 'ControlRight':
          e.preventDefault();
          rotate(-1);
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          startSoftDrop();
          break;
        case 'Space':
          e.preventDefault();
          hardDrop();
          break;
        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight':
          e.preventDefault();
          holdPiece();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') {
        stopContinuousMove();
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        stopSoftDrop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startGame, togglePause, startContinuousMove, stopContinuousMove, rotate, startSoftDrop, stopSoftDrop, hardDrop, holdPiece]);

  return {
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
    actions: {
      startGame,
      togglePause,
      moveHorizontal,
      startContinuousMove,
      stopContinuousMove,
      rotate,
      dropStep,
      startSoftDrop,
      stopSoftDrop,
      hardDrop,
      holdPiece,
      updateSettings,
      setMode,
    },
  };
}

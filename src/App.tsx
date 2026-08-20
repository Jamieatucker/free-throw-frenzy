import React, { useState, useCallback, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import Shop from './components/Shop';
import MainMenu from './components/MainMenu';
import PauseMenu from './components/PauseMenu';
import ErrorBoundary from './components/ErrorBoundary';
import { GameState, BackgroundId, Difficulty } from './types/game';
import { getSavedCoins, getActiveBackground } from './utils/shopData';
import { isSfxMuted, isMusicMuted, setSfxMuted, setMusicMuted } from './utils/audioSettings';
import { setPaused } from './engine/gameState';
import { startMusic, stopMusic, setMusicPlayingMuted } from './engine/music';
import './styles/index.css';

type Screen = 'menu' | 'game';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [hudState, setHudState] = useState<GameState | null>(null);
  const [key, setKey] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [totalCoins, setTotalCoins] = useState(getSavedCoins);
  const [sfxMuted, setSfxMutedUi] = useState(isSfxMuted);
  const [musicMuted, setMusicMutedUi] = useState(isMusicMuted);
  const gameStateRef = useRef<GameState | null>(null);

  const handleStart = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setHudState(null);
    setShopOpen(false);
    setKey((k) => k + 1);
    setScreen('game');
  }, []);

  const onStateChange = useCallback((s: GameState) => {
    gameStateRef.current = s;
    setHudState({
      ...s,
      ball: { ...s.ball, pos: { ...s.ball.pos }, vel: { ...s.ball.vel } },
      hoop: { ...s.hoop },
      player: { ...s.player },
      camera: { ...s.camera },
    });
    if (s.phase === 'gameover') {
      setTotalCoins(getSavedCoins());
    }
  }, []);

  const onRestart = useCallback(() => {
    setTotalCoins(getSavedCoins());
    setKey((k) => k + 1);
    setHudState(null);
  }, []);

  const handleMainMenu = useCallback(() => {
    if (gameStateRef.current) setPaused(gameStateRef.current, false);
    stopMusic();
    setHudState(null);
    setShopOpen(false);
    setScreen('menu');
  }, []);

  const handleOpenShop = useCallback(() => {
    setTotalCoins(getSavedCoins());
    setShopOpen(true);
  }, []);

  const handleBackgroundChange = useCallback((bg: BackgroundId) => {
    if (gameStateRef.current) {
      gameStateRef.current.activeBackground = bg;
    }
    if (screen === 'game') {
      startMusic(bg).catch(() => {});
    }
  }, [screen]);

  const handlePause = useCallback(() => {
    if (!gameStateRef.current) return;
    setPaused(gameStateRef.current, true);
  }, []);

  const handleResume = useCallback(() => {
    if (!gameStateRef.current) return;
    setPaused(gameStateRef.current, false);
  }, []);

  const handleToggleSfx = useCallback(() => {
    const next = !isSfxMuted();
    setSfxMuted(next);
    setSfxMutedUi(next);
  }, []);

  const handleToggleMusic = useCallback(() => {
    const next = !isMusicMuted();
    setMusicMuted(next);
    setMusicMutedUi(next);
    setMusicPlayingMuted(next);
  }, []);

  useEffect(() => {
    if (screen !== 'game') {
      stopMusic();
      return;
    }
    const bg = gameStateRef.current?.activeBackground ?? getActiveBackground();
    startMusic(bg).catch(() => {});
    setMusicPlayingMuted(isMusicMuted());
    return () => stopMusic();
  }, [screen, key]);

  if (screen === 'menu') {
    return (
      <ErrorBoundary>
        <MainMenu onStart={handleStart} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-white mb-4 tracking-wider">
          Free Throw Frenzy
        </h1>
        <div className="relative">
          <GameCanvas key={key} difficulty={difficulty} onStateChange={onStateChange} />
          <HUD
            state={hudState}
            onRestart={onRestart}
            onOpenShop={handleOpenShop}
            onMainMenu={handleMainMenu}
            onPause={handlePause}
          />
          {hudState?.paused && (
            <PauseMenu
              difficulty={difficulty}
              sfxMuted={sfxMuted}
              musicMuted={musicMuted}
              onResume={handleResume}
              onToggleSfx={handleToggleSfx}
              onToggleMusic={handleToggleMusic}
              onMainMenu={handleMainMenu}
            />
          )}
          {shopOpen && (
            <Shop
              coins={totalCoins}
              onClose={() => setShopOpen(false)}
              onCoinsChange={(c) => setTotalCoins(c)}
              onBackgroundChange={handleBackgroundChange}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;

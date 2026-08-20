import React, { useState, useCallback, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import Shop from './components/Shop';
import MainMenu from './components/MainMenu';
import ErrorBoundary from './components/ErrorBoundary';
import { GameState, BackgroundId, Difficulty } from './types/game';
import { getSavedCoins } from './utils/shopData';
import './styles/index.css';

type Screen = 'menu' | 'game';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [hudState, setHudState] = useState<GameState | null>(null);
  const [key, setKey] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [totalCoins, setTotalCoins] = useState(getSavedCoins);
  const gameStateRef = useRef<GameState | null>(null);

  const handleStart = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setHudState(null);
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
  }, []);

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
          />
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

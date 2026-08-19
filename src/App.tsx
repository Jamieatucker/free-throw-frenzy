import React, { useState, useCallback, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import Shop from './components/Shop';
import ErrorBoundary from './components/ErrorBoundary';
import { GameState, BackgroundId } from './types/game';
import { saveHighScore } from './engine/gameState';
import { saveCoins, getSavedCoins } from './utils/shopData';
import './styles/index.css';

const App: React.FC = () => {
  const [hudState, setHudState] = useState<GameState | null>(null);
  const [key, setKey] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [totalCoins, setTotalCoins] = useState(getSavedCoins);
  const gameStateRef = useRef<GameState | null>(null);

  const onStateChange = useCallback((s: GameState) => {
    gameStateRef.current = s;
    setHudState({
      ...s,
      ball: { ...s.ball, pos: { ...s.ball.pos }, vel: { ...s.ball.vel } },
      hoop: { ...s.hoop },
      player: { ...s.player },
    });
    if (s.phase === 'gameover') {
      saveHighScore(s.score);
      const newTotal = getSavedCoins() + s.currency;
      saveCoins(newTotal);
      setTotalCoins(newTotal);
    }
  }, []);

  const onRestart = useCallback(() => {
    setKey((k) => k + 1);
    setHudState(null);
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-white mb-4 tracking-wider">
          Free Throw Frenzy
        </h1>
        <div className="relative">
          <GameCanvas key={key} onStateChange={onStateChange} />
          <HUD state={hudState} onRestart={onRestart} onOpenShop={handleOpenShop} />
        </div>
      </div>
      {shopOpen && (
        <Shop
          coins={totalCoins}
          onClose={() => setShopOpen(false)}
          onCoinsChange={(c) => setTotalCoins(c)}
          onBackgroundChange={handleBackgroundChange}
        />
      )}
    </ErrorBoundary>
  );
};

export default App;

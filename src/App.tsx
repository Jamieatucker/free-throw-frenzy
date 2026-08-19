import React, { useState, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import ErrorBoundary from './components/ErrorBoundary';
import { GameState } from './types/game';
import { saveHighScore } from './engine/gameState';
import './styles/index.css';

const App: React.FC = () => {
  const [hudState, setHudState] = useState<GameState | null>(null);
  const [key, setKey] = useState(0);

  const onStateChange = useCallback((s: GameState) => {
    setHudState({
      ...s,
      ball: { ...s.ball, pos: { ...s.ball.pos }, vel: { ...s.ball.vel } },
      hoop: { ...s.hoop },
      player: { ...s.player },
    });
    if (s.phase === 'gameover') {
      saveHighScore(s.score);
    }
  }, []);

  const onRestart = useCallback(() => {
    setKey((k) => k + 1);
    setHudState(null);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-white mb-4 tracking-wider">
          Free Throw Frenzy
        </h1>
        <div className="relative">
          <GameCanvas key={key} onStateChange={onStateChange} />
          <HUD state={hudState} onRestart={onRestart} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;

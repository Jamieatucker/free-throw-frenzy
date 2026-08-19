import React from 'react';
import { GameState } from '../types/game';

interface Props {
  state: GameState | null;
  onRestart: () => void;
}

const HUD: React.FC<Props> = ({ state, onRestart }) => {
  if (!state) return null;

  const timerColor =
    state.shotTimer <= 3 ? 'text-red-400' : state.shotTimer <= 5 ? 'text-yellow-300' : 'text-white';

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">
      {/* Top bar */}
      <div className="flex justify-between items-start px-4 pt-3">
        <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="text-white text-sm font-mono">SCORE</div>
          <div className="text-3xl font-bold text-green-400">{state.score}</div>
        </div>

        <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm text-center">
          <div className="text-white text-sm font-mono">STREAK</div>
          <div className={`text-2xl font-bold ${state.streak >= 5 ? 'text-orange-400 animate-pulse' : 'text-white'}`}>
            {state.streak} 🔥
          </div>
          <div className="text-yellow-300 text-xs font-mono">{state.multiplier}× MULTI</div>
        </div>

        <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm text-center">
          <div className="text-white text-sm font-mono">COINS</div>
          <div className="text-xl font-bold text-yellow-400">{state.currency}</div>
        </div>

        <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm text-right">
          <div className="text-white text-sm font-mono">TIMER</div>
          <div className={`text-3xl font-bold ${timerColor}`}>{Math.ceil(state.shotTimer)}</div>
        </div>
      </div>

      {/* Game Over overlay */}
      {state.phase === 'gameover' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-black/80 rounded-2xl px-10 py-8 text-center backdrop-blur pointer-events-auto">
            <div className="text-4xl font-bold text-red-500 mb-2">GAME OVER</div>
            <div className="text-white text-lg mb-1">Final Score: {state.score}</div>
            <div className="text-yellow-400 mb-4">Coins earned: {state.currency}</div>
            <button
              onClick={onRestart}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {state.phase === 'idle' && state.score === 0 && state.feedbackTimer <= 0 && (
        <div className="flex-1 flex items-end justify-center pb-8">
          <div className="bg-black/50 rounded-lg px-6 py-3 backdrop-blur-sm text-center">
            <div className="text-white text-sm">
              Hold <span className="font-bold text-cyan-300">SPACE</span> to charge, release to shoot!
            </div>
            <div className="text-gray-400 text-xs mt-1">On mobile: tap and hold the screen</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HUD;

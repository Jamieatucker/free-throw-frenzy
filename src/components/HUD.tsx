import React from 'react';
import { GameState } from '../types/game';
import { getHighScore } from '../engine/gameState';
import { DIFFICULTY_CONFIGS } from '../utils/difficultyData';

interface Props {
  state: GameState | null;
  onRestart: () => void;
  onOpenShop: () => void;
  onMainMenu: () => void;
}

const HUD: React.FC<Props> = ({ state, onRestart, onOpenShop, onMainMenu }) => {
  if (!state) return null;

  const timerColor =
    state.shotTimer <= 3 ? 'text-red-400' : state.shotTimer <= 5 ? 'text-yellow-300' : 'text-white';

  const dc = DIFFICULTY_CONFIGS[state.difficulty];

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">
      {/* Top HUD row */}
      <div className="flex justify-between items-start px-4 pt-3">
        <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="text-white text-sm font-mono">SCORE</div>
          <div className="text-3xl font-bold text-green-400">{state.score}</div>
        </div>

        <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm text-center">
          <div className="text-white text-sm font-mono">STREAK</div>
          <div className={`text-2xl font-bold ${state.streak >= 5 ? 'text-orange-400 animate-pulse' : 'text-white'}`}>
            {state.streak}
          </div>
          <div className="text-yellow-300 text-xs font-mono">{state.multiplier}x MULTI</div>
        </div>

        {/* Difficulty badge */}
        <div
          className="rounded-lg px-3 py-2 backdrop-blur-sm text-center border"
          style={{ background: dc.color + '22', borderColor: dc.color + '88' }}
        >
          <div className="text-xs font-mono" style={{ color: dc.color }}>DIFFICULTY</div>
          <div className="text-sm font-bold" style={{ color: dc.color }}>{dc.label.toUpperCase()}</div>
        </div>

        <div
          className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm text-center pointer-events-auto cursor-pointer hover:bg-black/70 transition-colors"
          onClick={onOpenShop}
          title="Open Shop"
        >
          <div className="text-white text-sm font-mono">COINS</div>
          <div className="text-xl font-bold text-yellow-400">{state.currency}</div>
          <div className="text-gray-400 text-xs">TAP TO SHOP</div>
        </div>

        <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm text-right">
          <div className="text-white text-sm font-mono">TIMER</div>
          <div className={`text-3xl font-bold ${timerColor}`}>{Math.ceil(Math.max(0, state.shotTimer))}</div>
        </div>
      </div>

      {/* Game over overlay */}
      {state.phase === 'gameover' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-black/85 rounded-2xl px-10 py-8 text-center backdrop-blur pointer-events-auto">
            <div className="text-4xl font-bold text-red-500 mb-2">GAME OVER</div>
            <div
              className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
              style={{ background: dc.color, color: '#000' }}
            >
              {dc.label.toUpperCase()} MODE
            </div>
            <div className="text-white text-lg mb-1">Final Score: <span className="font-bold text-green-400">{state.score}</span></div>
            <div className="text-yellow-400 mb-1">Coins earned: {state.currency}</div>
            <div className="text-gray-400 text-sm mb-6">High Score: {Math.max(state.score, getHighScore())}</div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={onRestart}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-7 rounded-lg text-base transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={onOpenShop}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-5 rounded-lg text-base transition-colors"
              >
                Shop
              </button>
              <button
                onClick={onMainMenu}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-5 rounded-lg text-base transition-colors"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First shot hint */}
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

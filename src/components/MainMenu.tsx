import React, { useState } from 'react';
import { Difficulty } from '../types/game';
import { DIFFICULTY_CONFIGS, DIFFICULTIES } from '../utils/difficultyData';
import { getHighScore } from '../engine/gameState';
import { getSavedCoins } from '../utils/shopData';

interface Props {
  onStart: (difficulty: Difficulty) => void;
}

const DIFFICULTY_ICONS: Record<Difficulty, string> = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
};

const DIFFICULTY_DETAILS: Record<Difficulty, { rimLabel: string; distLabel: string; windLabel: string; speedLabel: string }> = {
  easy: { rimLabel: 'Wide', distLabel: 'Close', windLabel: 'Calm', speedLabel: 'Slow' },
  medium: { rimLabel: 'Standard', distLabel: 'Far', windLabel: 'Moderate', speedLabel: 'Normal' },
  hard: { rimLabel: 'Narrow', distLabel: 'Very Far', windLabel: 'Gusty', speedLabel: 'Fast' },
};

const MainMenu: React.FC<Props> = ({ onStart }) => {
  const [selected, setSelected] = useState<Difficulty>('medium');
  const highScore = getHighScore();
  const coins = getSavedCoins();

  const dc = DIFFICULTY_CONFIGS[selected];
  const details = DIFFICULTY_DETAILS[selected];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 select-none">
      {/* Title */}
      <div className="mb-8 text-center">
        <div className="text-5xl font-black tracking-widest text-white drop-shadow-lg" style={{ textShadow: '0 0 30px #ef6c00, 0 2px 0 #000' }}>
          FREE THROW
        </div>
        <div className="text-5xl font-black tracking-widest" style={{ color: '#ef6c00', textShadow: '0 0 30px #ff9800aa, 0 2px 0 #000' }}>
          FRENZY
        </div>
        <div className="mt-3 text-gray-400 text-sm tracking-widest uppercase">Basketball Simulator</div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl px-5 py-2 text-center border border-gray-700">
          <div className="text-gray-400 text-xs font-mono">HIGH SCORE</div>
          <div className="text-green-400 font-bold text-xl">{highScore}</div>
        </div>
        <div className="bg-gray-800 rounded-xl px-5 py-2 text-center border border-gray-700">
          <div className="text-gray-400 text-xs font-mono">COINS</div>
          <div className="text-yellow-400 font-bold text-xl">{coins}</div>
        </div>
      </div>

      {/* Difficulty heading */}
      <div className="text-gray-400 text-xs font-mono tracking-widest mb-4 uppercase">Select Difficulty</div>

      {/* Difficulty cards */}
      <div className="flex gap-4 mb-8 flex-wrap justify-center">
        {DIFFICULTIES.map((diff) => {
          const cfg = DIFFICULTY_CONFIGS[diff];
          const isSelected = selected === diff;
          return (
            <button
              key={diff}
              onClick={() => setSelected(diff)}
              className={`
                relative w-44 p-4 rounded-2xl border-2 text-left transition-all duration-200 focus:outline-none
                ${isSelected
                  ? 'border-current shadow-lg scale-105'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-500 hover:scale-102'
                }
              `}
              style={isSelected ? {
                borderColor: cfg.color,
                background: `linear-gradient(135deg, ${cfg.color}18 0%, #111827 100%)`,
                boxShadow: `0 0 20px ${cfg.color}44`,
              } : {}}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{DIFFICULTY_ICONS[diff]}</span>
                <span className="font-bold text-white text-base">{cfg.label}</span>
              </div>
              <p className="text-gray-400 text-xs leading-tight mb-3">{cfg.description}</p>
              <div className="space-y-1">
                <Stat label="Rim" value={DIFFICULTY_DETAILS[diff].rimLabel} color={cfg.color} />
                <Stat label="Distance" value={DIFFICULTY_DETAILS[diff].distLabel} color={cfg.color} />
                <Stat label="Wind" value={DIFFICULTY_DETAILS[diff].windLabel} color={cfg.color} />
                <Stat label="Meter Speed" value={DIFFICULTY_DETAILS[diff].speedLabel} color={cfg.color} />
              </div>
              {isSelected && (
                <div
                  className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: cfg.color, color: '#000' }}
                >
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected summary */}
      <div
        className="mb-8 px-6 py-3 rounded-xl border text-sm text-center max-w-xs"
        style={{ borderColor: dc.color + '88', background: dc.color + '12', color: dc.color }}
      >
        <span className="font-bold">{dc.label}</span>
        {' — '}
        {details.rimLabel} rim · {details.distLabel} · {details.windLabel} wind
      </div>

      {/* Play button */}
      <button
        onClick={() => onStart(selected)}
        className="px-14 py-4 rounded-2xl font-black text-xl text-black tracking-widest uppercase transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${dc.color}, ${dc.color}cc)`,
          boxShadow: `0 0 32px ${dc.color}88`,
        }}
      >
        Play
      </button>

      {/* Controls reminder */}
      <div className="mt-8 text-center text-gray-600 text-xs leading-6">
        <div>Hold <kbd className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono text-xs">Space</kbd> to charge · Release to shoot</div>
        <div>Mobile: tap &amp; hold the screen</div>
      </div>
    </div>
  );
};

interface StatProps {
  label: string;
  value: string;
  color: string;
}

const Stat: React.FC<StatProps> = ({ label, value, color }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-500 text-xs">{label}</span>
    <span className="text-xs font-semibold" style={{ color }}>{value}</span>
  </div>
);

export default MainMenu;

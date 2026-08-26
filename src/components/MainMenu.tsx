import React, { useState } from 'react';
import { Difficulty } from '../types/game';
import { DIFFICULTY_CONFIGS, DIFFICULTIES } from '../utils/difficultyData';
import { getHighScore } from '../engine/gameState';
import { getSavedCoins } from '../utils/shopData';

interface Props {
  onStart: (difficulty: Difficulty) => void;
}

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
    <div className="crt-main-menu w-full h-full flex flex-col items-center justify-center px-2 py-1.5 sm:px-4 sm:py-2 select-none overflow-hidden">
      <div className="mb-1.5 sm:mb-2 text-center shrink-0">
        <div
          className="text-2xl sm:text-3xl font-black tracking-widest text-amber-100 leading-none"
          style={{ textShadow: '0 0 18px #ef6c0066, 0 2px 0 #000' }}
        >
          FREE THROW
        </div>
        <div
          className="text-2xl sm:text-3xl font-black tracking-widest text-amber-500 leading-none"
          style={{ textShadow: '0 0 18px #ff980066, 0 2px 0 #000' }}
        >
          FRENZY
        </div>
        <div className="mt-1 text-emerald-200/50 text-[9px] sm:text-[10px] tracking-[0.25em] uppercase">
          Live on Channel 3
        </div>
      </div>

      <div className="flex gap-3 mb-1.5 sm:mb-2 shrink-0">
        <div className="bg-black/40 rounded px-3 py-0.5 text-center border border-white/10">
          <div className="text-gray-500 text-[9px] font-mono">HIGH SCORE</div>
          <div className="text-green-400 font-bold text-sm sm:text-base leading-tight">{highScore}</div>
        </div>
        <div className="bg-black/40 rounded px-3 py-0.5 text-center border border-white/10">
          <div className="text-gray-500 text-[9px] font-mono">COINS</div>
          <div className="text-yellow-400 font-bold text-sm sm:text-base leading-tight">{coins}</div>
        </div>
      </div>

      <div className="text-gray-500 text-[9px] font-mono tracking-widest mb-1 uppercase shrink-0">Select Difficulty</div>

      <div className="flex gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap justify-center shrink-0">
        {DIFFICULTIES.map((diff) => {
          const cfg = DIFFICULTY_CONFIGS[diff];
          const isSelected = selected === diff;
          return (
            <button
              key={diff}
              type="button"
              onClick={() => setSelected(diff)}
              className={`relative w-[7.25rem] sm:w-36 p-2 rounded-md border-2 text-left transition-all duration-150 focus:outline-none ${
                isSelected ? 'scale-[1.02]' : 'border-gray-700 bg-black/50 hover:border-gray-500'
              }`}
              style={
                isSelected
                  ? {
                      borderColor: cfg.color,
                      background: `linear-gradient(135deg, ${cfg.color}22 0%, #0a0a0c 100%)`,
                      boxShadow: `0 0 12px ${cfg.color}33`,
                    }
                  : undefined
              }
            >
              <div className="font-bold text-white text-xs sm:text-sm mb-0.5">{cfg.label}</div>
              <p className="text-gray-400 text-[9px] leading-tight mb-1 line-clamp-2">{cfg.description}</p>
              <div className="space-y-0">
                <Stat label="Rim" value={DIFFICULTY_DETAILS[diff].rimLabel} color={cfg.color} />
                <Stat label="Distance" value={DIFFICULTY_DETAILS[diff].distLabel} color={cfg.color} />
                <Stat label="Wind" value={DIFFICULTY_DETAILS[diff].windLabel} color={cfg.color} />
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="mb-1.5 px-3 py-1 rounded border text-[10px] sm:text-xs text-center max-w-xs shrink-0"
        style={{ borderColor: dc.color + '66', background: dc.color + '14', color: dc.color }}
      >
        <span className="font-bold">{dc.label}</span>
        {' — '}
        {details.rimLabel} rim · {details.distLabel} · {details.windLabel} wind
      </div>

      <button
        type="button"
        onClick={() => onStart(selected)}
        className="px-8 py-2 rounded-md font-black text-sm sm:text-base text-black tracking-widest uppercase transition-transform hover:scale-105 active:scale-95 shrink-0"
        style={{
          background: `linear-gradient(135deg, ${dc.color}, ${dc.color}cc)`,
          boxShadow: `0 0 20px ${dc.color}55`,
        }}
      >
        Play
      </button>

      <div className="mt-1.5 text-center text-gray-600 text-[9px] leading-4 shrink-0">
        <div>
          Hold <kbd className="bg-black/60 text-gray-300 px-1 py-0.5 rounded font-mono text-[9px]">Space</kbd> to
          charge · Release to shoot
        </div>
        <div>Mobile: hold the screen</div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-500 text-[9px]">{label}</span>
    <span className="text-[9px] font-semibold" style={{ color }}>
      {value}
    </span>
  </div>
);

export default MainMenu;

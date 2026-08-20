import React from 'react';
import { Difficulty } from '../types/game';
import { DIFFICULTY_CONFIGS } from '../utils/difficultyData';

interface Props {
  difficulty: Difficulty;
  sfxMuted: boolean;
  musicMuted: boolean;
  onResume: () => void;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onMainMenu: () => void;
}

const PauseMenu: React.FC<Props> = ({
  difficulty,
  sfxMuted,
  musicMuted,
  onResume,
  onToggleSfx,
  onToggleMusic,
  onMainMenu,
}) => {
  const dc = DIFFICULTY_CONFIGS[difficulty];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onResume} />
      <div className="relative w-80 max-w-[90%] rounded-2xl border border-white/10 bg-gray-900/90 px-6 py-7 text-center shadow-2xl">
        <div className="text-3xl font-black tracking-widest text-white mb-1">PAUSED</div>
        <div
          className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-6"
          style={{ background: dc.color, color: '#000' }}
        >
          {dc.label.toUpperCase()} MODE
        </div>

        <button
          onClick={onResume}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg mb-3 transition-colors"
        >
          Resume
        </button>

        <button
          onClick={onToggleSfx}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg mb-3 transition-colors"
        >
          Sound Effects: {sfxMuted ? 'Off' : 'On'}
        </button>

        <button
          onClick={onToggleMusic}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg mb-3 transition-colors"
        >
          Music: {musicMuted ? 'Off' : 'On'}
        </button>

        <button
          onClick={onMainMenu}
          className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 rounded-lg transition-colors"
        >
          Main Menu
        </button>
        <div className="text-gray-400 text-xs mt-3">Change difficulty from the main menu</div>
      </div>
    </div>
  );
};

export default PauseMenu;

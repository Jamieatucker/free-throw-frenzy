import React, { useState } from 'react';
import { BackgroundId } from '../types/game';
import {
  SHOP_ITEMS,
  getUnlockedBackgrounds,
  getActiveBackground,
  setActiveBackground,
  purchaseBackground,
} from '../utils/shopData';

interface Props {
  coins: number;
  onClose: () => void;
  onCoinsChange: (newCoins: number) => void;
  onBackgroundChange: (bg: BackgroundId) => void;
}

const Shop: React.FC<Props> = ({ coins, onClose, onCoinsChange, onBackgroundChange }) => {
  const [unlocked, setUnlocked] = useState(getUnlockedBackgrounds);
  const [active, setActive] = useState(getActiveBackground);
  const [message, setMessage] = useState('');

  const handleBuy = (id: BackgroundId) => {
    const result = purchaseBackground(id, coins);
    if (result.success) {
      onCoinsChange(result.remainingCoins);
      setUnlocked(getUnlockedBackgrounds());
      setActive(id);
      setActiveBackground(id);
      onBackgroundChange(id);
      setMessage(`Unlocked & equipped!`);
    } else {
      setMessage('Not enough coins!');
    }
    setTimeout(() => setMessage(''), 2000);
  };

  const handleEquip = (id: BackgroundId) => {
    setActive(id);
    setActiveBackground(id);
    onBackgroundChange(id);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Shop</h2>
          <div className="flex items-center gap-4">
            <span className="text-yellow-400 font-bold">{coins} coins</span>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
          </div>
        </div>

        {message && (
          <div className="bg-blue-500/20 text-blue-300 rounded-lg px-3 py-2 mb-3 text-sm text-center">{message}</div>
        )}

        <div className="space-y-3">
          {/* Default stadium */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${active === 'stadium' ? 'bg-green-900/30 border border-green-500' : 'bg-gray-700'}`}>
            <div>
              <div className="text-white font-semibold">Pro Stadium</div>
              <div className="text-gray-400 text-xs">Default arena with crowd & lights</div>
            </div>
            {active === 'stadium' ? (
              <span className="text-green-400 text-sm font-bold">EQUIPPED</span>
            ) : (
              <button onClick={() => handleEquip('stadium')} className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg">Equip</button>
            )}
          </div>

          {SHOP_ITEMS.map((item) => {
            const owned = unlocked.includes(item.id);
            const isActive = active === item.id;
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg ${isActive ? 'bg-green-900/30 border border-green-500' : 'bg-gray-700'}`}
              >
                <div>
                  <div className="text-white font-semibold">{item.name}</div>
                  <div className="text-gray-400 text-xs">{item.description}</div>
                </div>
                <div className="flex-shrink-0 ml-3">
                  {isActive ? (
                    <span className="text-green-400 text-sm font-bold">EQUIPPED</span>
                  ) : owned ? (
                    <button onClick={() => handleEquip(item.id)} className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg">Equip</button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item.id)}
                      className={`text-sm px-4 py-1.5 rounded-lg font-bold ${coins >= item.price ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                    >
                      {item.price} coins
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Shop;

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
      setMessage('Unlocked & equipped!');
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
    <div className="absolute inset-0 z-50 flex justify-end pointer-events-none">
      {/* Backdrop — click to close */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={onClose} />

      {/* Side panel */}
      <div className="relative w-72 h-full bg-gray-900/95 backdrop-blur-md border-l border-gray-700 pointer-events-auto overflow-y-auto">
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md px-4 py-3 border-b border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold text-white">Shop</h2>
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 font-bold text-sm">{coins} coins</span>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
          </div>
        </div>

        {message && (
          <div className="mx-3 mt-3 bg-blue-500/20 text-blue-300 rounded-lg px-3 py-2 text-xs text-center">{message}</div>
        )}

        <div className="p-3 space-y-2">
          <ShopRow name="Pro Stadium" desc="Default arena" isActive={active === 'stadium'} owned onEquip={() => handleEquip('stadium')} />

          {SHOP_ITEMS.map((item) => {
            const owned = unlocked.includes(item.id);
            const isActive = active === item.id;
            return (
              <ShopRow
                key={item.id}
                name={item.name}
                desc={item.description}
                isActive={isActive}
                owned={owned}
                price={item.price}
                canAfford={coins >= item.price}
                onEquip={() => handleEquip(item.id)}
                onBuy={() => handleBuy(item.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface ShopRowProps {
  name: string;
  desc: string;
  isActive: boolean;
  owned: boolean;
  price?: number;
  canAfford?: boolean;
  onEquip: () => void;
  onBuy?: () => void;
}

const ShopRow: React.FC<ShopRowProps> = ({ name, desc, isActive, owned, price, canAfford, onEquip, onBuy }) => (
  <div className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${isActive ? 'bg-green-900/40 border border-green-600' : 'bg-gray-800/80'}`}>
    <div className="min-w-0 mr-2">
      <div className="text-white font-semibold truncate">{name}</div>
      <div className="text-gray-400 text-xs truncate">{desc}</div>
    </div>
    <div className="flex-shrink-0">
      {isActive ? (
        <span className="text-green-400 text-xs font-bold">ON</span>
      ) : owned ? (
        <button onClick={onEquip} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded">Equip</button>
      ) : (
        <button
          onClick={onBuy}
          className={`text-xs px-3 py-1 rounded font-bold ${canAfford ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
        >
          {price}
        </button>
      )}
    </div>
  </div>
);

export default Shop;

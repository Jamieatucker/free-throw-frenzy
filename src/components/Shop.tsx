import React, { useState } from 'react';
import { BackgroundId, JerseyId } from '../types/game';
import {
  SHOP_ITEMS,
  getUnlockedBackgrounds,
  getActiveBackground,
  setActiveBackground,
  purchaseBackground,
} from '../utils/shopData';
import {
  JERSEY_ITEMS,
  getUnlockedJerseys,
  getActiveJersey,
  setActiveJersey,
  purchaseJersey,
} from '../utils/jerseyData';

interface Props {
  coins: number;
  onClose: () => void;
  onCoinsChange: (newCoins: number) => void;
  onBackgroundChange: (bg: BackgroundId) => void;
  onJerseyChange?: (id: JerseyId) => void;
}

type Tab = 'courts' | 'jerseys';

const Shop: React.FC<Props> = ({
  coins,
  onClose,
  onCoinsChange,
  onBackgroundChange,
  onJerseyChange,
}) => {
  const [tab, setTab] = useState<Tab>('courts');
  const [unlocked, setUnlocked] = useState(getUnlockedBackgrounds);
  const [active, setActive] = useState(getActiveBackground);
  const [unlockedJerseys, setUnlockedJerseys] = useState(getUnlockedJerseys);
  const [activeJersey, setActiveJerseyState] = useState(getActiveJersey);
  const [message, setMessage] = useState('');

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleBuyBg = (id: BackgroundId) => {
    const result = purchaseBackground(id, coins);
    if (result.success) {
      onCoinsChange(result.remainingCoins);
      setUnlocked(getUnlockedBackgrounds());
      setActive(id);
      setActiveBackground(id);
      onBackgroundChange(id);
      flash('Unlocked & equipped!');
    } else {
      flash('Not enough coins!');
    }
  };

  const handleEquipBg = (id: BackgroundId) => {
    setActive(id);
    setActiveBackground(id);
    onBackgroundChange(id);
  };

  const handleBuyJersey = (id: JerseyId) => {
    const result = purchaseJersey(id, coins);
    if (result.success) {
      onCoinsChange(result.remainingCoins);
      setUnlockedJerseys(getUnlockedJerseys());
      setActiveJerseyState(id);
      onJerseyChange?.(id);
      flash('Jersey unlocked!');
    } else {
      flash('Not enough coins!');
    }
  };

  const handleEquipJersey = (id: JerseyId) => {
    setActiveJerseyState(id);
    setActiveJersey(id);
    onJerseyChange?.(id);
  };

  return (
    <div className="absolute inset-0 z-50 flex justify-end pointer-events-none">
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={onClose} />

      <div className="relative w-72 h-full bg-gray-900/95 backdrop-blur-md border-l border-gray-700 pointer-events-auto overflow-y-auto">
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md px-4 py-3 border-b border-gray-700 z-10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-white">Shop</h2>
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-bold text-sm">{coins} coins</span>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">
                &times;
              </button>
            </div>
          </div>
          <div className="flex gap-1">
            <TabBtn active={tab === 'courts'} onClick={() => setTab('courts')} label="Courts" />
            <TabBtn active={tab === 'jerseys'} onClick={() => setTab('jerseys')} label="Jerseys" />
          </div>
        </div>

        {message && (
          <div className="mx-3 mt-3 bg-blue-500/20 text-blue-300 rounded-lg px-3 py-2 text-xs text-center">
            {message}
          </div>
        )}

        <div className="p-3 space-y-2">
          {tab === 'courts' && (
            <>
              <ShopRow
                name="Pro Stadium"
                desc="Default arena"
                isActive={active === 'stadium'}
                owned
                onEquip={() => handleEquipBg('stadium')}
              />
              {SHOP_ITEMS.map((item) => {
                const owned = unlocked.includes(item.id);
                return (
                  <ShopRow
                    key={item.id}
                    name={item.name}
                    desc={item.description}
                    isActive={active === item.id}
                    owned={owned}
                    price={item.price}
                    canAfford={coins >= item.price}
                    onEquip={() => handleEquipBg(item.id)}
                    onBuy={() => handleBuyBg(item.id)}
                  />
                );
              })}
            </>
          )}

          {tab === 'jerseys' &&
            JERSEY_ITEMS.map((item) => {
              const owned = unlockedJerseys.includes(item.id);
              return (
                <ShopRow
                  key={item.id}
                  name={item.name}
                  desc="Team colors"
                  swatch={item.primary}
                  swatch2={item.secondary}
                  isActive={activeJersey === item.id}
                  owned={owned}
                  price={item.price}
                  canAfford={coins >= item.price}
                  onEquip={() => handleEquipJersey(item.id)}
                  onBuy={() => handleBuyJersey(item.id)}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({
  active,
  onClick,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 text-xs font-bold py-1.5 rounded ${
      active ? 'bg-amber-600 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
    }`}
  >
    {label}
  </button>
);

interface ShopRowProps {
  name: string;
  desc: string;
  isActive: boolean;
  owned: boolean;
  price?: number;
  canAfford?: boolean;
  swatch?: string;
  swatch2?: string;
  onEquip: () => void;
  onBuy?: () => void;
}

const ShopRow: React.FC<ShopRowProps> = ({
  name,
  desc,
  isActive,
  owned,
  price,
  canAfford,
  swatch,
  swatch2,
  onEquip,
  onBuy,
}) => (
  <div
    className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${
      isActive ? 'bg-green-900/40 border border-green-600' : 'bg-gray-800/80'
    }`}
  >
    <div className="min-w-0 mr-2 flex items-center gap-2">
      {swatch && (
        <span className="flex-shrink-0 w-5 h-5 rounded overflow-hidden border border-white/20 flex">
          <span className="w-1/2 h-full" style={{ background: swatch }} />
          <span className="w-1/2 h-full" style={{ background: swatch2 || swatch }} />
        </span>
      )}
      <div className="min-w-0">
        <div className="text-white font-semibold truncate text-xs">{name}</div>
        <div className="text-gray-400 text-[10px] truncate">{desc}</div>
      </div>
    </div>
    <div className="flex-shrink-0">
      {isActive ? (
        <span className="text-green-400 text-xs font-bold">ON</span>
      ) : owned ? (
        <button type="button" onClick={onEquip} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded">
          Equip
        </button>
      ) : (
        <button
          type="button"
          onClick={onBuy}
          className={`text-xs px-3 py-1 rounded font-bold ${
            canAfford || price === 0
              ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {price === 0 ? 'Free' : price}
        </button>
      )}
    </div>
  </div>
);

export default Shop;

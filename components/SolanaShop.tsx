import { ShoppingBag, Star } from 'lucide-react';
import React from 'react';

interface SolanaShopProps {
    tokens: number;
    onPurchase: (cost: number, itemName: string) => void;
}

const ITEMS = [
    { name: 'Magic Snack', icon: '🍎', cost: 10, description: 'Makes your pet super happy!', effect: '+20 XP' },
    { name: 'Energy Drink', icon: '🧃', cost: 15, description: 'Gives your pet extra energy!', effect: '+30 XP' },
    { name: 'Comfy Pillow', icon: 'pill', cost: 25, description: 'Help your pet rest better.', effect: '+50 XP' },
    { name: 'Star Toy', icon: '⭐', cost: 50, description: 'A rare star from the Solana galaxy.', effect: 'Level Up!' },
];

const SolanaShop: React.FC<SolanaShopProps> = ({ tokens, onPurchase }) => {
    return (
        <div className="p-6 h-full bg-slate-50 overflow-y-auto pb-24">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mascot Shop</h2>
                    <p className="text-slate-500 font-medium">Use your HealtoCoins!</p>
                </div>
                <div className="bg-yellow-100 border-2 border-yellow-200 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
                    <Star className="text-yellow-600" size={20} fill="currentColor" />
                    <span className="font-black text-yellow-700">{tokens}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {ITEMS.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => tokens >= item.cost && onPurchase(item.cost, item.name)}
                        className={`bg-white p-4 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${tokens >= item.cost
                                ? 'border-slate-100 hover:border-indigo-300 hover:shadow-xl active:scale-95'
                                : 'opacity-60 border-slate-100 grayscale cursor-not-allowed'
                            }`}
                    >
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                            {item.icon === 'pill' ? '💊' : item.icon}
                        </div>
                        <div className="flex-1 text-left">
                            <h4 className="font-black text-slate-700 text-lg leading-tight">{item.name}</h4>
                            <p className="text-slate-400 text-xs font-bold leading-tight mt-1">{item.description}</p>
                            <span className="inline-block mt-2 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">{item.effect}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-1 rounded-full font-black text-xs shadow-md">
                                <Star size={12} fill="currentColor" />
                                {item.cost}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-black mb-1">Earn more Coins?</h3>
                    <p className="text-indigo-100 text-sm font-medium mb-4 opacity-80">Complete your daily health goals to earn HealtoCoins on Solana!</p>
                    <div className="flex gap-2">
                        <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">Solana Devnet</div>
                        <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">Verified Rewards</div>
                    </div>
                </div>
                <ShoppingBag className="absolute -bottom-4 -right-4 opacity-10" size={120} />
            </div>
        </div>
    );
};

export default SolanaShop;

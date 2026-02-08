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
        <div className="p-4 h-full bg-slate-50 overflow-y-auto pb-24">
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Shop</h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wide">Spend HealtoCoins</p>
                </div>
                <div className="bg-yellow-100 border-2 border-yellow-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <Star className="text-yellow-600" size={16} fill="currentColor" />
                    <span className="font-black text-yellow-700 text-sm">{tokens}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-2">
                {ITEMS.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => tokens >= item.cost && onPurchase(item.cost, item.name)}
                        className={`bg-white p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${tokens >= item.cost
                            ? 'border-slate-100 hover:border-indigo-300 hover:shadow-lg active:scale-95'
                            : 'opacity-60 border-slate-100 grayscale cursor-not-allowed'
                            }`}
                    >
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                            {item.icon === 'pill' ? '💊' : item.icon}
                        </div>
                        <div className="flex-1 text-left">
                            <h4 className="font-black text-slate-700 text-base leading-none">{item.name}</h4>
                            <p className="text-slate-400 text-[10px] font-bold leading-tight mt-1">{item.description}</p>
                            <span className="inline-block mt-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">{item.effect}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 bg-yellow-400 text-white px-2 py-0.5 rounded-full font-black text-[10px] shadow-sm">
                                <Star size={10} fill="currentColor" />
                                {item.cost}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-4 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-black mb-0.5 leading-none">Earn more?</h3>
                    <p className="text-indigo-100 text-[11px] font-medium opacity-80 leading-tight">Complete health goals to earn more coins on Solana!</p>
                    <div className="mt-3 flex items-center gap-2">
                        <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter backdrop-blur-sm border border-white/10">Solana Devnet</span>
                        <a
                            href="https://explorer.solana.com/?cluster=devnet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[8px] font-black uppercase tracking-tighter underline underline-offset-2 opacity-60 hover:opacity-100"
                        >
                            View Explorer
                        </a>
                    </div>
                </div>
                <ShoppingBag className="absolute -bottom-2 -right-2 opacity-10" size={60} />
            </div>
        </div>
    );
};

export default SolanaShop;

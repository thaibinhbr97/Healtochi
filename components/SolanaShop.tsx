import { RefreshCw, ShoppingBag, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { SHOP_ITEMS } from '../constants';
import { API_BASE_URL } from '../utils/api';

interface SolanaShopProps {
    tokens: number;
    onPurchase: (cost: number, itemName: string) => void;
    onBalanceChange?: (balance: number) => void;
}

const USER_ADDRESS = "8zAH3PTdK1tpF4RtHwnx9SXuinfygKcs8XbBJccojFGS";

const SolanaShop: React.FC<SolanaShopProps> = ({ tokens, onPurchase, onBalanceChange }) => {
    const [onChainBalance, setOnChainBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchBalance = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/balance/${USER_ADDRESS}`);
            const data = await res.json();
            if (data.status === 'success') {
                // Convert from smallest unit (6 decimals) to display value
                const balance = data.balance / 1_000_000;
                setOnChainBalance(balance);
                onBalanceChange?.(balance);
            }
        } catch (err) {
            console.error("Failed to fetch on-chain balance:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    return (
        <div className="p-4 h-full bg-slate-50 overflow-y-auto pb-24">
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Shop</h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wide">Spend $HLT Tokens</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                    <span className="font-black text-white text-sm">{tokens}</span>
                    <span className="font-black text-white/70 text-[9px]">$HLT</span>
                </div>
            </header>

            {/* On-Chain Balance Card */}
            <div className="bg-white rounded-2xl p-4 mb-4 border-2 border-indigo-100 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                            <Wallet size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">On-Chain Balance</p>
                            <p className="text-xl font-black text-slate-800">
                                {isLoading ? '...' : onChainBalance !== null ? onChainBalance.toLocaleString() : '0'}
                                <span className="text-sm text-indigo-500 ml-1">$HLT</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchBalance}
                        disabled={isLoading}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={`text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <a
                    href={`https://solscan.io/account/${USER_ADDRESS}#tokenAccounts?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-[9px] font-bold text-indigo-500 hover:text-indigo-700 truncate"
                >
                    🔗 {USER_ADDRESS.slice(0, 8)}...{USER_ADDRESS.slice(-8)}
                </a>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {SHOP_ITEMS.map((item) => (
                    <button
                        key={item.name}
                        onClick={async () => {
                            // Convert item cost to token units (6 decimals)
                            const amountInUnits = item.cost * 1_000_000;

                            // First, validate against on-chain balance
                            try {
                                const res = await fetch(`${API_BASE_URL}/api/spend`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        user_address: USER_ADDRESS,
                                        amount: amountInUnits,
                                        item_name: item.name
                                    })
                                });
                                const data = await res.json();

                                if (data.status === 'success') {
                                    // On-chain validation passed, proceed with local purchase
                                    onPurchase(item.cost, item.name);
                                    // Refresh balance
                                    setTimeout(() => fetchBalance(), 500);
                                } else {
                                    console.error("Spend failed:", data.message);
                                    alert("Insufficient $HLT balance on-chain!");
                                }
                            } catch (err) {
                                console.error("Failed to spend:", err);
                            }
                        }}
                        disabled={onChainBalance !== null && onChainBalance < item.cost}
                        className={`bg-white p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${onChainBalance !== null && onChainBalance >= item.cost
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
                            <div className="flex items-center gap-1 bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-2 py-0.5 rounded-full font-black text-[10px] shadow-sm">
                                {item.cost} $HLT
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-4 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-black mb-0.5 leading-none">Earn $HLT!</h3>
                    <p className="text-indigo-100 text-[11px] font-medium opacity-80 leading-tight">Complete health goals to earn real tokens on Solana!</p>
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

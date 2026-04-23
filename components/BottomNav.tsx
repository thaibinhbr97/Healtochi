import { BarChart2, CheckSquare, Home, Shield, ShoppingBag } from 'lucide-react';
import React from 'react';
import { Tab } from '../types';

interface BottomNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    onParentModeClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onParentModeClick }) => {
    return (
        <nav className="bg-white border-t border-slate-100 p-4 pb-6 flex justify-around items-center absolute bottom-0 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <button
                onClick={() => onTabChange(Tab.HOME)}
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.HOME ? 'text-indigo-600' : 'text-slate-400'}`}
            >
                <Home size={24} strokeWidth={activeTab === Tab.HOME ? 3 : 2} />
                <span className="text-[10px] font-bold">Home</span>
            </button>

            <button
                onClick={() => onTabChange(Tab.TASKS)}
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.TASKS ? 'text-indigo-600' : 'text-slate-400'}`}
            >
                <CheckSquare size={24} strokeWidth={activeTab === Tab.TASKS ? 3 : 2} />
                <span className="text-[10px] font-bold">Goals</span>
            </button>

            <button
                onClick={onParentModeClick}
                className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 shadow-md transform -translate-y-4 border-4 border-white hover:scale-105 transition-transform"
            >
                <Shield size={28} />
            </button>

            <button
                onClick={() => onTabChange(Tab.SHOP)}
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.SHOP ? 'text-indigo-600' : 'text-slate-400'}`}
            >
                <ShoppingBag size={24} strokeWidth={activeTab === Tab.SHOP ? 3 : 2} />
                <span className="text-[10px] font-bold">Shop</span>
            </button>

            <button
                onClick={() => onTabChange('STATS' as any)}
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'STATS' as any ? 'text-indigo-600' : 'text-slate-400'}`}
            >
                <BarChart2 size={24} strokeWidth={activeTab === 'STATS' as any ? 3 : 2} />
                <span className="text-[10px] font-bold">Journey</span>
            </button>
        </nav>
    );
};

export default BottomNav;

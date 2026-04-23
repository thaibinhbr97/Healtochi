import React from 'react';
import cheerDolphin from '../cheer_gif/cheer_dolphin.gif';

interface CelebrationOverlayProps {
    show: boolean;
    taskName: string;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ show, taskName }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-md"></div>
            <div className="bg-white rounded-[3rem] p-8 flex flex-col items-center gap-6 shadow-2xl relative z-10 border-4 border-yellow-400">
                <div className="absolute -top-12 -right-6 animate-bounce">
                    <span className="text-6xl">✨</span>
                </div>
                <div className="absolute -top-12 -left-6 animate-bounce delay-150">
                    <span className="text-6xl">🌟</span>
                </div>

                <div className="text-center">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Amazing Job!</h2>
                    <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest mt-1">Goal Completed</p>
                </div>

                <div className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-sky-100 to-indigo-100 border-4 border-white shadow-xl relative z-10 flex items-center justify-center">
                    <img
                        src={cheerDolphin}
                        alt="Cheering Dolphin"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl w-full text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 font-bold text-xs uppercase mb-1">You finished:</p>
                    <p className="text-slate-800 font-black text-xl">{taskName}</p>
                </div>

                <div className="flex items-center gap-2 text-yellow-500 font-black text-2xl animate-pulse">
                    <span>+10</span>
                    <span className="text-sm uppercase tracking-tighter">Bonus Points</span>
                </div>
            </div>
        </div>
    );
};

interface PurchaseSuccessOverlayProps {
    show: boolean;
    item: { name: string, icon: string } | null;
    petName: string;
    happinessXP: number;
}

export const PurchaseSuccessOverlay: React.FC<PurchaseSuccessOverlayProps> = ({
    show, item, petName, happinessXP
}) => {
    if (!show || !item) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-md"></div>
            <div className="bg-white rounded-[3rem] p-8 flex flex-col items-center gap-6 shadow-2xl relative z-10 border-4 border-emerald-400">
                <div className="absolute -top-12 -right-6 animate-bounce">
                    <span className="text-6xl">🍭</span>
                </div>
                <div className="absolute -top-12 -left-6 animate-bounce delay-150">
                    <span className="text-6xl">💖</span>
                </div>

                <div className="text-center">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Yummy!</h2>
                    <p className="text-emerald-600 font-bold uppercase text-xs tracking-widest mt-1">Purchase Successful</p>
                </div>

                <div className="w-40 h-40 rounded-full bg-emerald-50 flex items-center justify-center text-7xl shadow-inner border-4 border-white">
                    {item.icon === 'pill' ? '💊' : item.icon}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl w-full text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 font-bold text-xs uppercase mb-1">{petName} received:</p>
                    <p className="text-slate-800 font-black text-xl">{item.name}</p>
                </div>

                <div className="flex items-center gap-2 text-emerald-500 font-black text-2xl animate-pulse">
                    <span>+{happinessXP}</span>
                    <span className="text-sm uppercase tracking-tighter">Happiness XP</span>
                </div>
            </div>
        </div>
    );
};

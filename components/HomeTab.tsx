import { Clock, Mic } from 'lucide-react';
import React from 'react';
import { PetState, Task } from '../types';
import PetDisplay from './PetDisplay';

interface HomeTabProps {
    pet: PetState;
    tasks: Task[];
    isTalking: boolean;
    onHealthAction: (type: 'water' | 'food') => Promise<void>;
    onLogMood: (mood: any) => Promise<void>;
    onVoiceClick: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({
    pet, tasks, isTalking, onHealthAction, onLogMood, onVoiceClick
}) => {
    const fourHours = 4 * 60 * 60 * 1000;
    const elapsed = Date.now() - pet.lastMoodCheckinTime;
    const remaining = fourHours - elapsed;
    const isMoodLocked = remaining > 0;

    return (
        <div className="flex flex-col h-full bg-white relative">
            <header className="px-6 pt-6 pb-2 flex justify-between items-center bg-white z-10">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 leading-tight">Hi Emma!</h1>
                    <p className="text-slate-400 font-medium text-sm">How's your healing today?</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="bg-indigo-600 text-white px-3 py-1 rounded-full font-black text-xs shadow-lg shadow-indigo-100">
                        LVL {pet.level}
                    </div>
                    <div className="text-[10px] font-black text-indigo-300 uppercase mt-1 tracking-tighter">{pet.tokens} TOKENS</div>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center -mt-8">
                <PetDisplay
                    pet={pet}
                    isTalking={isTalking}
                    tasks={tasks}
                    onHealthAction={onHealthAction}
                />
            </div>

            <div className="px-6 pb-28 space-y-4">
                {/* Mood Section */}
                <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100/50 backdrop-blur-sm relative overflow-hidden">
                    <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-widest mb-3 text-center">Daily Check-in</h3>
                    <div className="flex justify-between px-2 relative">
                        {['happy', 'neutral', 'tired', 'sad', 'anxious'].map((m) => (
                            <button
                                key={m}
                                onClick={() => !isMoodLocked && onLogMood(m as any)}
                                disabled={isMoodLocked}
                                className={`flex flex-col items-center scale-90 transition-all ${isMoodLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                            >
                                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl border border-slate-100">
                                    {m === 'happy' ? '😄' : m === 'neutral' ? '😐' : m === 'tired' ? '🥱' : m === 'sad' ? '😢' : '😰'}
                                </div>
                                <span className="text-[10px] uppercase font-black text-slate-400 mt-2 tracking-tighter">{m}</span>
                            </button>
                        ))}

                        {isMoodLocked && (
                            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                <div className="bg-slate-800/90 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-slate-600">
                                    <Clock size={10} className="animate-pulse" />
                                    <span>Next Check-in in {Math.floor(remaining / 3600000)}h {Math.floor((remaining % 3600000) / 60000)}m</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main CTA - Talk to Finny */}
                <button
                    onClick={onVoiceClick}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] p-5 flex items-center justify-between shadow-2xl shadow-indigo-200 transition-all active:scale-95 group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Mic size={24} className="text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest leading-none mb-1">Voice Chat</p>
                            <p className="font-black text-xl italic tracking-tight">Talk to {pet.name}</p>
                        </div>
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                        Go →
                    </div>
                </button>
            </div>
        </div>
    );
};

export default HomeTab;

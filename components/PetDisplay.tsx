import React, { useEffect, useState } from 'react';
import happyDolphin from '../assets/happy_dolphin.png';
import { PetState, Task } from '../types';

interface PetDisplayProps {
    pet: PetState;
    isTalking?: boolean;
    tasks: Task[];
}

const PetDisplay: React.FC<PetDisplayProps> = ({ pet, isTalking, tasks }) => {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const pendingTasks = tasks.filter(t => !t.completed);

    useEffect(() => {
        if (pendingTasks.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentTaskIndex((prev) => (prev + 1) % pendingTasks.length);
        }, 3000); // Rotate every 3 seconds

        return () => clearInterval(interval);
    }, [pendingTasks.length]);

    const task = pendingTasks[currentTaskIndex];

    return (
        <div className="flex flex-col items-center justify-center py-2 relative">
            {/* Fluffy Thinking Cloud Reminder */}
            {task && (
                <div className="absolute top-4 right-8 z-20 animate-[float_4s_ease-in-out_infinite]">
                    <div className="relative">
                        {/* Main Cloud Body */}
                        <div className="bg-white rounded-[2rem] p-4 shadow-xl border-4 border-indigo-50 relative flex items-center gap-3 min-w-[160px] max-w-[200px] z-10 transition-all duration-500">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 animate-bounce">
                                <span className="text-2xl">{task.icon}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Thinking about...</p>
                                <p className="text-slate-700 font-bold text-xs leading-tight">
                                    {task.title}
                                </p>
                            </div>
                        </div>

                        {/* Cloud Body is now cleaner without extra blobs */}

                        {/* Thinking Bubbles (the pointers) */}
                        <div className="absolute -bottom-3 left-8 w-5 h-5 bg-white rounded-full border-4 border-indigo-50"></div>
                        <div className="absolute -bottom-6 left-12 w-3 h-3 bg-white rounded-full border-4 border-indigo-50"></div>
                    </div>
                </div>
            )}

            <div className="relative">
                {/* Background Aura */}
                <div className="absolute inset-0 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>

                {/* The Happy Dolphin Mascot - Bigger Size */}
                <img
                    src={happyDolphin}
                    alt="Happy Dolphin"
                    className={`w-80 h-80 relative z-10 object-contain transition-all duration-500 
                        ${isTalking ? 'animate-bounce scale-110 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'animate-[wiggle_3s_ease-in-out_infinite]'}`}
                />
            </div>

            <div className="mt-0 text-center">
                <h2 className="text-3xl font-bold text-slate-700 leading-none">{pet.name}</h2>
                <p className="text-slate-500 font-medium">Lvl {pet.level}</p>

                {/* XP Bar */}
                <div className="w-48 h-4 bg-slate-200 rounded-full mt-2 overflow-hidden border border-slate-300">
                    <div
                        className="h-full bg-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${(pet.xp / pet.xpToNextLevel) * 100}%` }}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1">{pet.xp} / {pet.xpToNextLevel} XP</p>
            </div>

            <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>
        </div>
    );
};

export default PetDisplay;

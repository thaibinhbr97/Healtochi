import React, { useEffect, useState } from 'react';
import wholeBodyDolphin from '../assets/dolphin_wholebody.png';
import happyDolphin from '../assets/happy_dolphin.png';
import sadDolphin from '../assets/sad_dolphin.png';
import tiredDolphin from '../assets/tired_dolphin.png';
import { PetState, Task } from '../types';

interface PetDisplayProps {
    pet: PetState;
    isTalking?: boolean;
    tasks: Task[];
    onHealthAction?: (type: 'water' | 'food') => void;
}

const PetDisplay: React.FC<PetDisplayProps> = ({ pet, isTalking, tasks, onHealthAction }) => {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [eatingCooldown, setEatingCooldown] = useState<string | null>(null);
    const [waterCooldown, setWaterCooldown] = useState<string | null>(null);
    const [isHungry, setIsHungry] = useState(false);
    const [isThirsty, setIsThirsty] = useState(false);
    const [isCelebrating, setIsCelebrating] = useState(false);
    const pendingTasks = tasks.filter(t => !t.completed);

    // Track XP/Level for Celebration using refs to avoid re-triggering effects
    const prevXPRef = React.useRef(pet.xp);
    const prevLevelRef = React.useRef(pet.level);

    useEffect(() => {
        if (pet.xp > prevXPRef.current || pet.level > prevLevelRef.current) {
            setIsCelebrating(true);
            const timer = setTimeout(() => setIsCelebrating(false), 2000);

            // Sync refs
            prevXPRef.current = pet.xp;
            prevLevelRef.current = pet.level;

            return () => clearTimeout(timer);
        }

        // Ensure refs are synced even if no celebration triggered
        prevXPRef.current = pet.xp;
        prevLevelRef.current = pet.level;
    }, [pet.xp, pet.level]);

    useEffect(() => {
        const updateCooldowns = () => {
            const now = Date.now();

            // Eating Cooldown (4 Hours)
            const fourHours = 4 * 60 * 60 * 1000;
            const eatElapsed = now - (pet.lastEatenTime || 0);
            if (eatElapsed < fourHours) {
                const remaining = fourHours - eatElapsed;
                const h = Math.floor(remaining / 3600000);
                const m = Math.floor((remaining % 3600000) / 60000);
                const s = Math.floor((remaining % 60000) / 1000);
                setEatingCooldown(`${h}h ${m}m ${s}s`);
                setIsHungry(false);
            } else {
                setEatingCooldown(null);
                setIsHungry(true);
            }

            // Water Cooldown (1 Hour)
            const oneHour = 1 * 60 * 60 * 1000;
            const waterElapsed = now - (pet.lastWaterTime || 0);
            if (waterElapsed < oneHour) {
                const remaining = oneHour - waterElapsed;
                const m = Math.floor(remaining / 60000);
                const s = Math.floor((remaining % 60000) / 1000);
                setWaterCooldown(`${m}m ${s}s`);
                setIsThirsty(false);
            } else {
                setWaterCooldown(null);
                setIsThirsty(true);
            }
        };

        updateCooldowns();
        const interval = setInterval(updateCooldowns, 1000);
        return () => clearInterval(interval);
    }, [pet.lastEatenTime, pet.lastWaterTime]);

    useEffect(() => {
        if (pendingTasks.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentTaskIndex((prev) => (prev + 1) % pendingTasks.length);
        }, 3000); // Rotate every 3 seconds

        return () => clearInterval(interval);
    }, [pendingTasks.length]);

    const task = pendingTasks[currentTaskIndex];

    // Determine dolphin appearance
    const dolphinImg = pet.health <= 30 ? sadDolphin : pet.health <= 70 ? tiredDolphin : happyDolphin;
    const auraColor = pet.health <= 30 ? 'bg-red-400' : (isHungry || isThirsty) ? 'bg-orange-300' : 'bg-yellow-200';

    return (
        <div className="flex flex-col items-center justify-center py-2 relative w-full">
            {/* Health Actions - Sidebar style */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
                <button
                    onClick={() => !waterCooldown && onHealthAction?.('water')}
                    disabled={!!waterCooldown}
                    className={`group relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${pet.waterCount >= 3 || waterCooldown ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-sky-100 hover:border-sky-400 shadow-sm hover:shadow-md'}`}
                >
                    <span className={`text-2xl mb-1 transition-transform ${waterCooldown ? 'grayscale' : 'group-hover:scale-125'}`}>💧</span>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= pet.waterCount ? 'bg-sky-400' : 'bg-slate-200'}`} />
                        ))}
                    </div>
                    {waterCooldown ? (
                        <div className="absolute -top-3 -right-2 bg-slate-800 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-slate-600 flex flex-col items-center">
                            <span>FULL</span>
                            <span className="text-[6px] opacity-70 leading-none">{waterCooldown}</span>
                        </div>
                    ) : (
                        <div className="absolute -top-3 -right-2 flex flex-col items-center">
                            {isThirsty && <span className="animate-bounce bg-sky-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm mb-1">THIRSTY!</span>}
                            <span className="bg-sky-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">DRINK</span>
                        </div>
                    )}
                </button>

                <button
                    onClick={() => !eatingCooldown && onHealthAction?.('food')}
                    disabled={!!eatingCooldown}
                    className={`group relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${pet.foodCount >= 3 || eatingCooldown ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-orange-100 hover:border-orange-400 shadow-sm hover:shadow-md'}`}
                >
                    <span className={`text-2xl mb-1 transition-transform ${eatingCooldown ? 'grayscale' : 'group-hover:scale-125'}`}>🍎</span>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= pet.foodCount ? 'bg-orange-400' : 'bg-slate-200'}`} />
                        ))}
                    </div>
                    {eatingCooldown ? (
                        <div className="absolute -top-3 -right-2 bg-slate-800 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-slate-600 flex flex-col items-center">
                            <span>FULL</span>
                            <span className="text-[6px] opacity-70 leading-none">{eatingCooldown}</span>
                        </div>
                    ) : (
                        <div className="absolute -top-3 -right-2 flex flex-col items-center">
                            {isHungry && <span className="animate-bounce bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm mb-1">HUNGRY!</span>}
                            <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">EAT</span>
                        </div>
                    )}
                </button>
            </div>

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

                        {/* Thinking Bubbles (the pointers) */}
                        <div className="absolute -bottom-3 left-8 w-5 h-5 bg-white rounded-full border-4 border-indigo-50"></div>
                        <div className="absolute -bottom-6 left-12 w-3 h-3 bg-white rounded-full border-4 border-indigo-50"></div>
                    </div>
                </div>
            )}

            <div className="relative">
                {/* Background Aura */}
                <div className={`absolute inset-0 ${auraColor} rounded-full blur-3xl opacity-30 animate-pulse transition-colors duration-1000`}></div>

                {/* The Dolphin Mascot */}
                <img
                    src={isCelebrating ? wholeBodyDolphin : dolphinImg}
                    alt="Dolphin"
                    className={`w-80 h-80 relative z-10 object-contain transition-all duration-500 
                        ${isCelebrating ? 'animate-[dancing_0.6s_ease-in-out_infinite]' :
                            isTalking ? 'animate-bounce scale-110 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' :
                                'animate-[wiggle_3s_ease-in-out_infinite]'}`}
                />
            </div>

            <div className="mt-0 text-center w-full max-w-[280px]">
                <div className="flex justify-between items-end mb-1">
                    <h2 className="text-3xl font-black text-slate-700 leading-none">{pet.name}</h2>
                    <p className="text-indigo-500 font-black text-xs uppercase tracking-widest">Lvl {pet.level}</p>
                </div>

                {/* Health Bar */}
                <div className="relative w-full h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-inner mb-2">
                    <div
                        className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pet.health}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter drop-shadow-sm">Health: {Math.round(pet.health)}%</span>
                    </div>
                </div>

                {/* XP Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${(pet.xp / pet.xpToNextLevel) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth</p>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{pet.xp} / {pet.xpToNextLevel} XP</p>
                </div>
            </div>

            <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes dancing {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-40px) rotate(10deg) scale(1.1); }
          50% { transform: translateY(0) rotate(0deg) scale(1); }
          75% { transform: translateY(-40px) rotate(-10deg) scale(1.1); }
        }
      `}</style>
        </div>
    );
};

export default PetDisplay;

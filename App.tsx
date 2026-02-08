import { BarChart2, CheckSquare, Clock, Cloud, Home, Mic, Plus, ShoppingBag } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import cheerDolphin from './assets/cheer_dolphin.gif';
import BreathingExercise from './components/BreathingExercise';
import PetDisplay from './components/PetDisplay';
import SolanaShop from './components/SolanaShop';
import Stats from './components/Stats';
import VoiceInterface from './components/VoiceInterface';
import { INITIAL_TASKS } from './constants';
import { MoodLog, PetState, Tab, Task } from './types';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
    const [isTalking, setIsTalking] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationTaskName, setCelebrationTaskName] = useState('');

    // Pet State
    const [pet, setPet] = useState<PetState>({
        name: "Finny",
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        mood: 'happy',
        health: 50,
        waterCount: 0,
        foodCount: 0,
        lastEatenTime: 0,
        lastMoodCheckinTime: 0,
        lastWaterTime: 0,
        tokens: 45 // Initial tokens
    });

    // Initialize cooldowns on first load if they're 0 to prevent immediate decay/lock
    useEffect(() => {
        if (pet.lastEatenTime === 0 || pet.lastWaterTime === 0) {
            setPet(prev => ({
                ...prev,
                lastEatenTime: prev.lastEatenTime === 0 ? Date.now() : prev.lastEatenTime,
                lastWaterTime: prev.lastWaterTime === 0 ? Date.now() : prev.lastWaterTime
            }));
        }
    }, []);

    // Health Decay Logic
    useEffect(() => {
        const checkHunger = () => {
            const fourHours = 4 * 60 * 60 * 1000;
            const now = Date.now();

            if (now - pet.lastEatenTime > fourHours) {
                setPet(prev => ({
                    ...prev,
                    health: Math.max(0, prev.health - 2) // Gradually lose 2% health
                }));
            }
        };

        const interval = setInterval(checkHunger, 5 * 60 * 1000); // Check every 5 minutes
        return () => clearInterval(interval);
    }, [pet.lastEatenTime]);

    // Fetch tasks from MongoDB on mount
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/tasks');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setTasks(data);
                    }
                }
            } catch (err) {
                console.error("Failed to load tasks from DB:", err);
            }
        };
        fetchTasks();
    }, []);

    // Task Handler
    const toggleTask = (taskId: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                const newStatus = !t.completed;
                // Award XP if completing
                if (newStatus) {
                    addXP(t.points);
                    setCelebrationTaskName(t.title);
                    setShowCelebration(true);
                    setTimeout(() => setShowCelebration(false), 3000);
                }
                return { ...t, completed: newStatus };
            }
            return t;
        }));
    };

    const addXP = (amount: number) => {
        setPet(prev => {
            let newXp = prev.xp + amount;
            let newLevel = prev.level;
            let newNext = prev.xpToNextLevel;

            if (newXp >= prev.xpToNextLevel) {
                newXp = newXp - prev.xpToNextLevel;
                newLevel += 1;
                newNext = Math.floor(newNext * 1.2);
            }

            return {
                ...prev,
                level: newLevel,
                xp: newXp,
                xpToNextLevel: newNext
            };
        });
    };

    const logMood = async (mood: MoodLog['mood']) => {
        const fourHours = 4 * 60 * 60 * 1000;
        const now = Date.now();
        const canCheckin = now - pet.lastMoodCheckinTime >= fourHours;

        const newLog = { date: new Date().toISOString(), mood };
        setMoodLogs(prev => [...prev, newLog]);

        if (canCheckin) {
            addXP(15);
            setPet(prev => ({ ...prev, lastMoodCheckinTime: now }));
        }

        // PERSIST TO MONGODB
        try {
            await fetch('http://127.0.0.1:8000/api/mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mood: mood,
                    timestamp: newLog.date
                })
            });
        } catch (err) {
            console.error("Failed to save mood to MongoDB:", err);
        }
    };

    const handleHealthAction = (type: 'water' | 'food') => {
        setPet(prev => {
            const isWater = type === 'water';
            const currentCount = isWater ? prev.waterCount : prev.foodCount;

            if (currentCount >= 3) return prev;

            // Check 4-hour cooldown for food
            if (!isWater) {
                const fourHours = 4 * 60 * 60 * 1000;
                const now = Date.now();
                if (now - prev.lastEatenTime < fourHours) {
                    return prev;
                }
            }

            const newCount = currentCount + 1;
            const healthBoost = 15; // Each action boosts health

            return {
                ...prev,
                health: Math.min(100, prev.health + healthBoost),
                waterCount: isWater ? newCount : prev.waterCount,
                foodCount: !isWater ? newCount : prev.foodCount,
                lastEatenTime: !isWater ? Date.now() : prev.lastEatenTime,
                lastWaterTime: isWater ? Date.now() : prev.lastWaterTime
            };
        });
    };

    // Render Content based on Tab
    const renderContent = () => {
        switch (activeTab) {
            case Tab.HOME:
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
                                onHealthAction={handleHealthAction}
                            />
                        </div>

                        <div className="px-6 pb-28 space-y-4">
                            {/* Mood Section - Compact */}
                            <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100/50 backdrop-blur-sm relative overflow-hidden">
                                <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-widest mb-3 text-center">Daily Check-in</h3>

                                {(() => {
                                    const fourHours = 4 * 60 * 60 * 1000;
                                    const elapsed = Date.now() - pet.lastMoodCheckinTime;
                                    const remaining = fourHours - elapsed;
                                    const isLocked = remaining > 0;

                                    return (
                                        <div className="flex justify-between px-2 relative">
                                            {['happy', 'neutral', 'tired', 'sad', 'anxious'].map((m) => (
                                                <button
                                                    key={m}
                                                    onClick={() => !isLocked && logMood(m as any)}
                                                    disabled={isLocked}
                                                    className={`flex flex-col items-center scale-90 transition-all ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                                                >
                                                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl border border-slate-100">
                                                        {m === 'happy' ? '😄' : m === 'neutral' ? '😐' : m === 'tired' ? '🥱' : m === 'sad' ? '😢' : '😰'}
                                                    </div>
                                                    <span className="text-[10px] uppercase font-black text-slate-400 mt-2 tracking-tighter">{m}</span>
                                                </button>
                                            ))}

                                            {isLocked && (
                                                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                                    <div className="bg-slate-800/90 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-slate-600">
                                                        <Clock size={10} className="animate-pulse" />
                                                        <span>Next Check-in in {Math.floor(remaining / 3600000)}h {Math.floor((remaining % 3600000) / 60000)}m</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Main CTA - Talk to Finny */}
                            <button
                                onClick={() => setShowVoiceModal(true)}
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
            case Tab.TASKS:
                return (
                    <div className="p-6 h-full overflow-y-auto pb-24">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Self Care Menu</h2>
                        <div className="space-y-3">
                            {tasks.map(task => (
                                <div key={task.id} className="bg-white p-4 rounded-xl flex items-center gap-4 border border-slate-100 shadow-sm transition-transform active:scale-[0.99]">
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-400 border-green-400' : 'border-slate-300'}`}
                                    >
                                        {task.completed && <CheckSquare size={16} className="text-white" />}
                                    </button>
                                    <div className="flex-1">
                                        <span className={`block text-lg font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</span>
                                        <span className="text-xs text-slate-400 font-bold">+{task.points} XP</span>
                                    </div>
                                    <span className="text-2xl">{task.icon}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={async () => {
                                const title = prompt("What's your new health goal?");
                                if (!title) return;

                                const newTask = {
                                    title,
                                    points: 10,
                                    icon: '✨',
                                    completed: false
                                };

                                try {
                                    const response = await fetch('http://127.0.0.1:8000/api/tasks', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(newTask)
                                    });
                                    if (response.ok) {
                                        const result = await response.json();
                                        setTasks(prev => [...prev, { ...newTask, id: result.id }]);
                                    }
                                } catch (err) {
                                    console.error("Failed to add task to DB:", err);
                                    // Fallback for demo
                                    setTasks(prev => [...prev, { ...newTask, id: Math.random().toString() }]);
                                }
                            }}
                            className="mt-6 w-full py-3 border-2 border-dashed border-slate-300 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50"
                        >
                            <Plus size={20} /> Add Custom Goal
                        </button>
                    </div>
                );
            case Tab.BREATHE:
                return <BreathingExercise />;
            case Tab.SHOP:
                return <SolanaShop tokens={pet.tokens} onPurchase={(cost, name) => {
                    setPet(prev => ({ ...prev, tokens: prev.tokens - cost }));
                    addXP(cost * 2);
                    alert(`You bought ${name}! Your pet is happy!`);
                }} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 max-w-md mx-auto shadow-2xl overflow-hidden relative">

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden">
                {renderContent()}
            </main>

            {/* Stats Overlay (Tabless for now, integrated into stats view if needed) */}
            {activeTab === 'STATS' as any && <Stats moodLogs={moodLogs} totalXP={pet.xp + (pet.level * 100)} />}


            {/* Bottom Navigation */}
            <nav className="bg-white border-t border-slate-100 p-4 pb-6 flex justify-around items-center absolute bottom-0 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => setActiveTab(Tab.HOME)}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.HOME ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                    <Home size={24} strokeWidth={activeTab === Tab.HOME ? 3 : 2} />
                    <span className="text-[10px] font-bold">Home</span>
                </button>

                <button
                    onClick={() => setActiveTab(Tab.TASKS)}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.TASKS ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                    <CheckSquare size={24} strokeWidth={activeTab === Tab.TASKS ? 3 : 2} />
                    <span className="text-[10px] font-bold">Goals</span>
                </button>


                <button
                    onClick={() => setActiveTab(Tab.BREATHE)}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.BREATHE ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                    <Cloud size={24} strokeWidth={activeTab === Tab.BREATHE ? 3 : 2} />
                    <span className="text-[10px] font-bold">Breathe</span>
                </button>

                <button
                    onClick={() => setActiveTab(Tab.SHOP)}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.SHOP ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                    <ShoppingBag size={24} strokeWidth={activeTab === Tab.SHOP ? 3 : 2} />
                    <span className="text-[10px] font-bold">Shop</span>
                </button>

                <button
                    onClick={() => setActiveTab('STATS' as any)}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'STATS' as any ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                    <BarChart2 size={24} strokeWidth={activeTab === 'STATS' as any ? 3 : 2} />
                    <span className="text-[10px] font-bold">Journey</span>
                </button>
            </nav>

            {/* Voice Modal Overlay */}
            {showVoiceModal && (
                <VoiceInterface
                    onTalkingStateChange={setIsTalking}
                    onClose={() => setShowVoiceModal(false)}
                />
            )}
            {/* Task Celebration Overlay */}
            {showCelebration && (
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

                        <div className="w-48 h-48 bg-sky-50 rounded-full flex items-center justify-center relative overflow-hidden border-4 border-sky-100">
                            <img
                                src={cheerDolphin}
                                alt="Cheering Dolphin"
                                className="w-40 h-40 object-contain drop-shadow-xl"
                            />
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl w-full text-center border-2 border-dashed border-slate-200">
                            <p className="text-slate-500 font-bold text-xs uppercase mb-1">You finished:</p>
                            <p className="text-slate-800 font-black text-xl">{celebrationTaskName}</p>
                        </div>

                        <div className="flex items-center gap-2 text-yellow-500 font-black text-2xl animate-pulse">
                            <span>+10</span>
                            <span className="text-sm uppercase tracking-tighter">Bonus Points</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;

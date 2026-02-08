import { BarChart2, CheckSquare, Cloud, Home, Mic, Plus, ShoppingBag } from 'lucide-react';
import React, { useState } from 'react';
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

    // Pet State
    const [pet, setPet] = useState<PetState>({
        name: "Finny",
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        mood: 'happy',
        tokens: 45 // Initial tokens
    });

    // Task Handler
    const toggleTask = (taskId: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                const newStatus = !t.completed;
                // Award XP if completing
                if (newStatus) {
                    addXP(t.points);
                } else {
                    // Optional: Remove XP if unchecking? Let's keep it positive only for kids
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
                // Confetti effect could go here
            }

            return {
                ...prev,
                level: newLevel,
                xp: newXp,
                xpToNextLevel: newNext
            };
        });
    };

    const logMood = (mood: MoodLog['mood']) => {
        setMoodLogs(prev => [...prev, { date: new Date().toISOString(), mood }]);
        addXP(15);
    };

    // Render Content based on Tab
    const renderContent = () => {
        switch (activeTab) {
            case Tab.HOME:
                return (
                    <div className="flex flex-col h-full overflow-y-auto pb-24">
                        <header className="p-6 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Good Morning!</h1>
                                <p className="text-slate-500">Ready for a healing day?</p>
                            </div>
                            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold text-sm">
                                {pet.level} Lvl
                            </div>
                        </header>

                        <PetDisplay
                            pet={pet}
                            isTalking={isTalking}
                            tasks={tasks}
                        />

                        <div className="px-6 mt-4">
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-700 mb-3">How are you feeling?</h3>
                                <div className="flex justify-between">
                                    {['happy', 'neutral', 'tired', 'sad', 'anxious'].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => logMood(m as any)}
                                            className="flex flex-col items-center gap-1 group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-slate-50 hover:bg-yellow-100 flex items-center justify-center text-xl transition-colors">
                                                {m === 'happy' ? '😄' : m === 'neutral' ? '😐' : m === 'tired' ? '🥱' : m === 'sad' ? '😢' : '😰'}
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-yellow-600">{m}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 mt-6">
                            <button
                                onClick={() => setShowVoiceModal(true)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 transition-transform active:scale-95"
                            >
                                <Mic size={24} />
                                <span className="font-bold text-lg">Talk to {pet.name}</span>
                            </button>
                        </div>

                        <div className="px-6 mt-6 pb-4">
                            <div className="flex justify-between items-end mb-2">
                                <h3 className="font-bold text-slate-700">Today's Goals</h3>
                                <button onClick={() => setActiveTab(Tab.TASKS)} className="text-indigo-500 text-sm font-semibold">See all</button>
                            </div>
                            <div className="space-y-3">
                                {tasks.slice(0, 3).map(task => (
                                    <div key={task.id} className="bg-white p-3 rounded-xl flex items-center gap-3 border border-slate-100 shadow-sm">
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-400 border-green-400' : 'border-slate-300'}`}
                                        >
                                            {task.completed && <CheckSquare size={14} className="text-white" />}
                                        </button>
                                        <span className={`flex-1 font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</span>
                                        <span className="text-xl">{task.icon}</span>
                                    </div>
                                ))}
                            </div>
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
                        <button className="mt-6 w-full py-3 border-2 border-dashed border-slate-300 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50">
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

                {/* Floating Action Button for Voice */}
                <div className="relative -top-8">
                    <button
                        onClick={() => setShowVoiceModal(true)}
                        className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200 border-4 border-slate-50 transform hover:scale-105 transition-transform"
                    >
                        <Mic size={28} />
                    </button>
                </div>

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
        </div>
    );
};

export default App;

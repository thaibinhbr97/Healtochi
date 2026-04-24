import { Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AddGoalModal from './components/AddGoalModal';
import BottomNav from './components/BottomNav';
import ChatHistory from './components/ChatHistory';
import GoalsTab from './components/GoalsTab';
import HomeTab from './components/HomeTab';
import { CelebrationOverlay, PurchaseSuccessOverlay } from './components/Overlays';
import SolanaShop from './components/SolanaShop';
import Stats from './components/Stats';
import VoiceInterface from './components/VoiceInterface';
import { INITIAL_TASKS, SHOP_ITEMS } from './constants';
import './index.css';
import { MoodLog, PetState, Tab, Task } from './types';
import { API_BASE_URL } from './utils/api';
import { AUDIO_SOURCES, playSound } from './utils/audio';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [showAddGoalModal, setShowAddGoalModal] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
    const [isTalking, setIsTalking] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationTaskName, setCelebrationTaskName] = useState('');
    const [isParentMode, setIsParentMode] = useState(false);
    const [solanaTx, setSolanaTx] = useState<string | null>(null);
    const [isRewarding, setIsRewarding] = useState(false);
    const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
    const [purchasedItem, setPurchasedItem] = useState<{ name: string, icon: string } | null>(null);

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

    // Health Decay Logic
    useEffect(() => {
        const checkHunger = () => {
            const fourHours = 4 * 60 * 60 * 1000;
            const now = Date.now();
            if (pet.lastEatenTime > 0 && (now - pet.lastEatenTime > fourHours)) {
                setPet(prev => ({
                    ...prev,
                    health: Math.max(0, prev.health - 2)
                }));
            }
        };
        const interval = setInterval(checkHunger, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [pet.lastEatenTime]);

    // Fetch tasks on mount
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/tasks`);
                if (response.ok) {
                    const data = await response.json();
                    if (data?.length > 0) setTasks(data);
                }
            } catch (err) {
                console.error("Failed to load tasks:", err);
            }
        };
        fetchTasks();
    }, []);

    // Task Handler
    const toggleTask = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const newStatus = !task.completed;
        const now = new Date().toISOString();

        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                if (newStatus) {
                    addXP(t.points);
                    setCelebrationTaskName(t.title);
                    setShowCelebration(true);
                    playSound(AUDIO_SOURCES.CELEBRATION, 3000);
                    setTimeout(() => setShowCelebration(false), 3000);
                }
                return { ...t, completed: newStatus, completedAt: newStatus ? now : undefined };
            }
            return t;
        }));

        try {
            await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: newStatus, completedAt: newStatus ? now : null })
            });
            if (newStatus) triggerSolanaReward();
        } catch (err) {
            console.error("Failed to update task:", err);
        }
    };

    const triggerSolanaReward = async () => {
        setIsRewarding(true);
        setSolanaTx(null);
        try {
            const userAddress = "8zAH3PTdK1tpF4RtHwnx9SXuinfygKcs8XbBJccojFGS";
            const response = await fetch(`${API_BASE_URL}/api/reward`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_address: userAddress, amount: 1000000 })
            });
            const data = await response.json();
            if (data.status === 'success') {
                setSolanaTx(data.signature);
                setTimeout(() => setSolanaTx(null), 10000);
            }
        } catch (err) {
            console.error("Solana reward failed:", err);
        } finally {
            setIsRewarding(false);
        }
    };

    const addXP = (amount: number) => {
        setPet(prev => {
            let newXp = prev.xp + amount;
            let newLevel = prev.level;
            let newNext = prev.xpToNextLevel;
            if (newXp >= prev.xpToNextLevel) {
                newXp -= prev.xpToNextLevel;
                newLevel += 1;
                newNext = Math.floor(newNext * 1.2);
            }
            return { ...prev, level: newLevel, xp: newXp, xpToNextLevel: newNext };
        });
    };

    const logMood = async (mood: MoodLog['mood']) => {
        playSound(AUDIO_SOURCES.CHECKIN, 1000);
        const fourHours = 4 * 60 * 60 * 1000;
        const now = Date.now();
        const canCheckin = now - pet.lastMoodCheckinTime >= fourHours;
        const newLog = { date: new Date().toISOString(), mood };
        setMoodLogs(prev => [...prev, newLog]);
        if (canCheckin) {
            addXP(15);
            setPet(prev => ({ ...prev, lastMoodCheckinTime: now }));
        }
        try {
            await fetch(`${API_BASE_URL}/api/mood`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood, timestamp: newLog.date })
            });
        } catch (err) {
            console.error("Failed to save mood:", err);
        }
    };

    const handleHealthAction = async (type: 'water' | 'food') => {
        const isWater = type === 'water';
        const now = Date.now();
        if (isWater) {
            if (pet.waterCount >= 3 || (pet.lastWaterTime > 0 && now - pet.lastWaterTime < (1 * 60 * 60 * 1000))) return;
            playSound(AUDIO_SOURCES.DRINKING, 1000);
        } else {
            if (pet.foodCount >= 3 || (pet.lastEatenTime > 0 && now - pet.lastEatenTime < (4 * 60 * 60 * 1000))) return;
            playSound(AUDIO_SOURCES.EATING, 1000);
        }
        setPet(prev => ({
            ...prev,
            health: Math.min(100, prev.health + 15),
            waterCount: isWater ? prev.waterCount + 1 : prev.waterCount,
            foodCount: !isWater ? prev.foodCount + 1 : prev.foodCount,
            lastEatenTime: !isWater ? now : prev.lastEatenTime,
            lastWaterTime: isWater ? now : prev.lastWaterTime
        }));
        try {
            await fetch(`${API_BASE_URL}/api/health`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: type, timestamp: new Date().toISOString() })
            });
        } catch (err) {
            console.error("Failed to log health action:", err);
        }
    };

    const handleCreateGoal = async () => {
        if (!newGoalTitle.trim()) return;
        const newTask = { title: newGoalTitle, points: 10, icon: '✨', completed: false };
        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });
            if (response.ok) {
                const result = await response.json();
                setTasks(prev => [...prev, { ...newTask, id: result.id }]);
            }
        } catch (err) {
            setTasks(prev => [...prev, { ...newTask, id: Math.random().toString() }]);
        }
        setNewGoalTitle('');
        setShowAddGoalModal(false);
    };

    const renderContent = () => {
        if (isParentMode) return <ChatHistory onBack={() => setIsParentMode(false)} />;
        switch (activeTab) {
            case Tab.HOME:
                return <HomeTab pet={pet} tasks={tasks} isTalking={isTalking} onHealthAction={handleHealthAction} onLogMood={logMood} onVoiceClick={() => setShowVoiceModal(true)} />;
            case Tab.TASKS:
                return <GoalsTab tasks={tasks} onToggleTask={toggleTask} onAddCustomGoal={() => setShowAddGoalModal(true)} />;
            case Tab.SHOP:
                return <SolanaShop tokens={pet.tokens} onPurchase={(cost, name) => {
                    const item = SHOP_ITEMS.find(i => i.name === name) || { icon: '🎁' };
                    setPet(prev => ({ ...prev, tokens: prev.tokens - cost }));
                    addXP(cost * 2);
                    setPurchasedItem({ name, icon: item.icon });
                    setShowPurchaseSuccess(true);
                    playSound(AUDIO_SOURCES.CELEBRATION, 3000);
                    setTimeout(() => setShowPurchaseSuccess(false), 4000);
                }} />;
            case 'STATS' as any:
                return <Stats moodLogs={moodLogs} totalXP={pet.xp + (pet.level * 100)} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white max-w-md mx-auto shadow-2xl relative overflow-hidden">
            <main className="flex-1 overflow-hidden relative">
                {renderContent()}
                {solanaTx && (
                    <div className="absolute top-20 left-4 right-4 z-[70] bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-white/10 animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center"><Shield size={16} className="text-white" /></div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Solana Transaction Sent!</p>
                                <a href={`https://explorer.solana.com/tx/${solanaTx}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold underline decoration-indigo-500 underline-offset-2 hover:text-indigo-200">View on Solscan →</a>
                            </div>
                            <button onClick={() => setSolanaTx(null)} className="text-slate-400 hover:text-white"><Shield size={14} /></button>
                        </div>
                    </div>
                )}
            </main>

            {!isParentMode && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onParentModeClick={() => setIsParentMode(true)} />}

            {showVoiceModal && <VoiceInterface onTalkingStateChange={setIsTalking} onClose={() => setShowVoiceModal(false)} tasks={tasks} />}

            <AddGoalModal isOpen={showAddGoalModal} onClose={() => setShowAddGoalModal(false)} onConfirm={handleCreateGoal} newGoalTitle={newGoalTitle} onTitleChange={setNewGoalTitle} />

            <CelebrationOverlay show={showCelebration} taskName={celebrationTaskName} />

            <PurchaseSuccessOverlay show={showPurchaseSuccess} item={purchasedItem} petName={pet.name} happinessXP={Math.floor(pet.xpToNextLevel / 10)} />
        </div>
    );
};

export default App;

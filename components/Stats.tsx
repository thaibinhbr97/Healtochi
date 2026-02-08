import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { HealthStats, MoodLog } from '../types';

interface StatsProps {
    moodLogs: MoodLog[];
    totalXP: number;
}

const Stats: React.FC<StatsProps> = ({ moodLogs, totalXP }) => {
    const [weeklyStats, setWeeklyStats] = useState<HealthStats[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/health/stats');
                if (response.ok) {
                    const data = await response.json();
                    setWeeklyStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch health stats:", err);
            }
        };
        fetchStats();
    }, []);

    const todayDate = new Date().toISOString().split('T')[0];
    const todayStats = weeklyStats.find(s => s.date === todayDate) || { water: 0, food: 0, tasks: 0 };

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden gap-4 pb-24">
            {/* Header + Total Growth */}
            <div className="flex items-center justify-between shrink-0">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Your Journey</h2>
                <div className="bg-yellow-100/50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-yellow-100">
                    <span className="text-sm">✨</span>
                    <span className="font-black text-yellow-600 text-sm">{totalXP} XP</span>
                </div>
            </div>

            {/* Daily Breakdown - Compact Row */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="bg-green-50 p-3 rounded-2xl border border-green-100 flex flex-col items-center justify-center gap-1">
                    <span className="text-xl">✨</span>
                    <div className="text-center">
                        <div className="text-xl font-black text-green-600 leading-none">{todayStats.tasks || 0}</div>
                        <div className="text-[9px] font-bold text-green-400 uppercase tracking-wide">Goals</div>
                    </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 flex flex-col items-center justify-center gap-1">
                    <span className="text-xl">💧</span>
                    <div className="text-center">
                        <div className="text-xl font-black text-blue-600 leading-none">{todayStats.water}</div>
                        <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wide">Water</div>
                    </div>
                </div>
                <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex flex-col items-center justify-center gap-1">
                    <span className="text-xl">🍎</span>
                    <div className="text-center">
                        <div className="text-xl font-black text-red-600 leading-none">{todayStats.food}</div>
                        <div className="text-[9px] font-bold text-red-400 uppercase tracking-wide">Meals</div>
                    </div>
                </div>
            </div>

            {/* Weekly Report - Fills Remaining Space */}
            <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex-1 min-h-0 flex flex-col">
                <h3 className="text-sm font-black text-slate-700 mb-2 shrink-0 flex items-center justify-between">
                    Weekly Activity <span className="text-[10px] font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">Last 7 Days</span>
                </h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 9, fill: '#94a3b8' }}
                                tickFormatter={(val) => val.slice(5)}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                hide={false}
                                tick={{ fontSize: 9, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Bar dataKey="water" name="Water" fill="#60A5FA" radius={[3, 3, 0, 0]} stackId="a" barSize={8} />
                            <Bar dataKey="food" name="Meals" fill="#F87171" radius={[3, 3, 0, 0]} stackId="a" barSize={8} />
                            <Bar dataKey="tasks" name="Goals" fill="#4ADE80" radius={[3, 3, 0, 0]} stackId="a" barSize={8} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Stats;

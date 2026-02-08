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

    // Calculate today's stats from the fetched weekly data (last entry is today/yesterday depending on timezone, but usually last)
    // For simplicity, we'll just grab the last entry if it matches today, or default to 0
    const todayDate = new Date().toISOString().split('T')[0];
    const todayStats = weeklyStats.find(s => s.date === todayDate) || { water: 0, food: 0, tasks: 0 };

    return (
        <div className="p-4 h-full overflow-y-auto pb-24">
            <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Your Journey</h2>

            {/* Total Growth Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-6 border border-slate-100 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Growth</h3>
                    <div className="flex items-baseline gap-1">
                        <p className="text-4xl font-black text-slate-800">{totalXP}</p>
                        <span className="text-sm font-bold text-yellow-500">XP</span>
                    </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-2xl relative z-10">
                    ✨
                </div>
            </div>

            {/* Weekly Health Report */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-6 border border-slate-100">
                <h3 className="text-lg font-black text-slate-700 mb-6 flex items-center gap-2">
                    Weekly Report <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Last 7 Days</span>
                </h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyStats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                tickFormatter={(val) => val.slice(5)} // Show MM-DD
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                hide={false}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Bar dataKey="water" name="Water" fill="#60A5FA" radius={[4, 4, 0, 0]} stackId="a" barSize={12} />
                            <Bar dataKey="food" name="Meals" fill="#F87171" radius={[4, 4, 0, 0]} stackId="a" barSize={12} />
                            <Bar dataKey="tasks" name="Goals" fill="#4ADE80" radius={[4, 4, 0, 0]} stackId="a" barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Daily Breakdown */}
            <h3 className="text-lg font-black text-slate-700 mb-4 px-2">Today's Habits</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="col-span-2 bg-green-50 p-5 rounded-[1.5rem] border border-green-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl border border-green-100">✨</div>
                        <div>
                            <div className="text-2xl font-black text-green-600 leading-none">{todayStats.tasks || 0}</div>
                            <div className="text-xs font-bold text-green-400 uppercase tracking-wide">Goals Done</div>
                        </div>
                    </div>
                    <div className="h-full flex items-center">
                        <div className="w-20 h-2 bg-green-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (todayStats.tasks || 0) * 20)}%` }}></div>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 p-5 rounded-[1.5rem] border border-blue-100 flex flex-col gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl border border-blue-100">💧</div>
                    <div>
                        <div className="text-3xl font-black text-blue-600">{todayStats.water}</div>
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wide">Water</div>
                    </div>
                </div>
                <div className="bg-red-50 p-5 rounded-[1.5rem] border border-red-100 flex flex-col gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl border border-red-100">🍎</div>
                    <div>
                        <div className="text-3xl font-black text-red-600">{todayStats.food}</div>
                        <div className="text-xs font-bold text-red-400 uppercase tracking-wide">Meals</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MoodLog } from '../types';

interface StatsProps {
    moodLogs: MoodLog[];
    totalXP: number;
}

const Stats: React.FC<StatsProps> = ({ moodLogs, totalXP }) => {
  // Process mood data for chart
  const moodMap = { 'happy': 5, 'neutral': 3, 'tired': 2, 'anxious': 1, 'sad': 1 };
  
  const data = moodLogs.map((log, index) => ({
    name: `Day ${index + 1}`,
    score: moodMap[log.mood] || 3,
    mood: log.mood
  }));

  const getBarColor = (mood: string) => {
    switch(mood) {
        case 'happy': return '#4ADE80';
        case 'neutral': return '#94A3B8';
        case 'tired': return '#FCD34D';
        case 'anxious': return '#F87171';
        case 'sad': return '#60A5FA';
        default: return '#CBD5E1';
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto pb-20">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Journey</h2>
      
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Total Growth</h3>
        <div className="flex items-center gap-3">
             <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">✨</span>
             </div>
             <div>
                 <p className="text-3xl font-bold text-yellow-600">{totalXP} XP</p>
                 <p className="text-xs text-slate-400">Keep completing tasks!</p>
             </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-64">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Mood History</h3>
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis hide />
                <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.mood)} />
                    ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No mood data yet. Check in!
            </div>
        )}
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-xl">
             <div className="text-green-500 font-bold mb-1">Happy</div>
             <div className="h-2 bg-green-200 rounded-full w-full">
                <div className="h-full bg-green-500 rounded-full" style={{width: '60%'}}></div>
             </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl">
             <div className="text-blue-500 font-bold mb-1">Rest</div>
             <div className="h-2 bg-blue-200 rounded-full w-full">
                <div className="h-full bg-blue-500 rounded-full" style={{width: '80%'}}></div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
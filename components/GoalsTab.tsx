import { CheckSquare, Plus } from 'lucide-react';
import React from 'react';
import { Task } from '../types';

interface GoalsTabProps {
    tasks: Task[];
    onToggleTask: (taskId: string) => Promise<void>;
    onAddCustomGoal: () => void;
}

const GoalsTab: React.FC<GoalsTabProps> = ({ tasks, onToggleTask, onAddCustomGoal }) => {
    return (
        <div className="p-6 h-full overflow-y-auto pb-24">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Self Care Menu</h2>
            <div className="space-y-3">
                {tasks.filter(t => !t.completed).map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-xl flex items-center gap-4 border border-slate-100 shadow-sm transition-transform active:scale-[0.99]">
                        <button
                            onClick={() => onToggleTask(task.id!)}
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
                onClick={onAddCustomGoal}
                className="mt-6 w-full py-3 border-2 border-dashed border-slate-300 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
                <Plus size={20} /> Add Custom Goal
            </button>
        </div>
    );
};

export default GoalsTab;

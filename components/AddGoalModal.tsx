import React from 'react';

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    newGoalTitle: string;
    onTitleChange: (title: string) => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({
    isOpen, onClose, onConfirm, newGoalTitle, onTitleChange
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-xs rounded-[2rem] p-6 shadow-2xl relative z-10 flex flex-col gap-4">
                <div className="text-center">
                    <h3 className="text-xl font-black text-slate-800">New Goal</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">What do you want to achieve?</p>
                </div>

                <input
                    autoFocus
                    type="text"
                    value={newGoalTitle}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="e.g., Read 10 pages"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 font-bold text-slate-700 placeholder:text-slate-300 focus:border-indigo-400 outline-none text-center"
                    onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
                />

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-95"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddGoalModal;

import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { ChatLog } from '../types';

interface ChatHistoryProps {
    onBack: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onBack }) => {
    const [logs, setLogs] = useState<ChatLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/parent/chat-history');
                if (response.ok) {
                    const data = await response.json();
                    setLogs(data);
                }
            } catch (err) {
                console.error("Failed to fetch chat logs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            <header className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 border-b border-slate-100 shadow-sm">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Parent Mode</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Chat History</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-medium">
                        No conversations recorded yet.
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="space-y-2">
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-slate-300 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
                                    {formatDate(log.timestamp)}
                                </span>
                            </div>

                            {/* User Bubble */}
                            <div className="flex justify-end">
                                <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] shadow-sm">
                                    <p className="text-sm font-medium">{log.user_text}</p>
                                </div>
                            </div>

                            {/* AI Bubble */}
                            <div className="flex justify-start">
                                <div className="bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] shadow-sm">
                                    <p className="text-sm font-medium">{log.ai_text}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatHistory;

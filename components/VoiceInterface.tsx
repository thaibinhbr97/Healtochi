import { Loader2, Mic, MicOff, XCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { INITIAL_TASKS } from '../constants';
import { Task } from '../types';

interface VoiceInterfaceProps {
    onTalkingStateChange: (isTalking: boolean) => void;
    onClose: () => void;
    tasks: Task[];
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onTalkingStateChange, onClose, tasks }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [responseLabel, setResponseLabel] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [thinkingTaskIndex, setThinkingTaskIndex] = useState(0);

    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Cycle through health tasks while AI is thinking
    useEffect(() => {
        let interval: any;
        if (isProcessing) {
            interval = setInterval(() => {
                setThinkingTaskIndex((prev) => (prev + 1) % INITIAL_TASKS.length);
            }, 1200);
        } else {
            setThinkingTaskIndex(0);
        }
        return () => clearInterval(interval);
    }, [isProcessing]);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const text = event.results[event.results.length - 1][0].transcript;
                setTranscription(text);
                handleTalk(text);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
                setError(`Mic Error: ${event.error}`);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            // Auto-start listening after a tiny delay for smooth UI transition
            setTimeout(() => {
                try {
                    recognitionRef.current?.start();
                    setIsListening(true);
                } catch (e) {
                    console.error("Auto-start mic failed:", e);
                }
            }, 500);
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (audioSourceRef.current) audioSourceRef.current.stop();
        };
    }, []);

    const handleTalk = async (text: string) => {
        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/talk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    tasks: tasks
                })
            });

            if (!response.ok) throw new Error('Failed to talk to mascot');

            // Get response text from header
            const rawAiText = response.headers.get('X-Response-Text');
            if (rawAiText) {
                const aiText = decodeURIComponent(rawAiText);
                setResponseLabel(aiText);
                // Play audio
                const audioData = await response.arrayBuffer();
                playAudio(audioData);
            } else {
                // Fallback to JSON if no audio header
                const data = await response.json();
                setResponseLabel(data.text);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const playAudio = async (data: ArrayBuffer) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const context = audioContextRef.current;
        const buffer = await context.decodeAudioData(data);

        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }

        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);

        source.onended = () => {
            onTalkingStateChange(false);
        };

        onTalkingStateChange(true);
        source.start(0);
        audioSourceRef.current = source;
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscription('');
            setResponseLabel('');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative flex flex-col items-center gap-6 border-4 border-indigo-100">

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"
                >
                    <XCircle size={36} />
                </button>

                <div className="text-center mt-2">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Mascot Chat</h3>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">ElevenLabs Character Voice</p>
                </div>

                {/* Visualizer Circle */}
                <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 relative ${isListening ? 'bg-indigo-50 scale-110 shadow-inner' : 'bg-slate-50'}`}>
                    {isListening && (
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-400 animate-ping opacity-20"></div>
                    )}

                    <button
                        onClick={toggleListening}
                        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isListening ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white hover:scale-105'}`}
                    >
                        {isListening ? <MicOff size={48} /> : <Mic size={48} />}
                    </button>
                </div>

                <div className="w-full space-y-4">
                    {transcription && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
                            <p className="text-sm font-bold text-slate-400 uppercase text-[10px] mb-1">You said</p>
                            <p className="text-slate-700 font-medium">"{transcription}"</p>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="bg-indigo-50 p-5 rounded-3xl border-2 border-dashed border-indigo-200 animate-pulse transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                                    <span className="text-2xl animate-bounce">{INITIAL_TASKS[thinkingTaskIndex].icon}</span>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Checking health goals...</p>
                                    <p className="text-slate-700 font-black text-base truncate transition-all duration-500">
                                        {INITIAL_TASKS[thinkingTaskIndex].title}
                                    </p>
                                </div>
                                <Loader2 className="animate-spin text-indigo-500" size={24} />
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 mt-4 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-1000 ease-in-out"
                                    style={{ width: `${((thinkingTaskIndex + 1) / INITIAL_TASKS.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {responseLabel && (
                        <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg relative overflow-hidden text-center">
                            <p className="text-sm font-bold text-indigo-200 uppercase text-[10px] mb-1">Finny says</p>
                            <p className="text-white font-bold text-lg leading-tight">"{responseLabel}"</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 p-4 rounded-2xl w-full border border-red-100">
                        <p className="text-sm text-red-500 font-bold text-center">{error}</p>
                    </div>
                )}

                <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
                    Gemini Flash &bull; ElevenLabs &bull; Web Speech
                </div>
            </div>
        </div>
    );
};

export default VoiceInterface;

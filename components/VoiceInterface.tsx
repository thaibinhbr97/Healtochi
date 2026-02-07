import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Volume2, Loader2, XCircle } from 'lucide-react';
import { GEMINI_MODEL_AUDIO, SYSTEM_INSTRUCTION } from '../constants';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';

interface VoiceInterfaceProps {
  onTalkingStateChange: (isTalking: boolean) => void;
  onClose: () => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onTalkingStateChange, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  
  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Playback Refs
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Client Ref
  const sessionRef = useRef<any>(null);

  const stopAudioProcessing = useCallback(() => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    
    // Stop playback
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    if (sessionRef.current) {
      // Trying to close session if method exists, though library handles close on disconnect usually
      try {
          // sessionRef.current.close(); 
      } catch (e) {}
      sessionRef.current = null;
    }

    onTalkingStateChange(false);
  }, [onTalkingStateChange]);

  const startSession = async () => {
    setError(null);
    setIsActive(true);
    
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found");

      const ai = new GoogleGenAI({ apiKey });

      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: GEMINI_MODEL_AUDIO,
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Connected");
            if (!inputAudioContextRef.current || !streamRef.current) return;

            const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            sourceNodeRef.current = source;
            
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                 session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && outputAudioContextRef.current) {
                onTalkingStateChange(true);
                const ctx = outputAudioContextRef.current;
                
                // Ensure nextStartTime is valid
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    ctx,
                    24000,
                    1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                
                source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                    if (sourcesRef.current.size === 0) {
                        onTalkingStateChange(false);
                    }
                });
                
                source.start(nextStartTimeRef.current);
                sourcesRef.current.add(source);
                nextStartTimeRef.current += audioBuffer.duration;
             }

             // Handle Transcription (if any)
             if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
                 setTranscription(message.serverContent.modelTurn.parts[0].text);
             }

             // Handle Interruption
             if (message.serverContent?.interrupted) {
                 sourcesRef.current.forEach(s => s.stop());
                 sourcesRef.current.clear();
                 nextStartTimeRef.current = 0;
                 onTalkingStateChange(false);
             }
          },
          onclose: () => {
            console.log("Gemini Live Closed");
            setIsActive(false);
          },
          onerror: (err) => {
            console.error("Gemini Live Error", err);
            setError("Connection error. Please try again.");
            setIsActive(false);
            stopAudioProcessing();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' }} // Using a gentle voice
          }
        }
      });
      
      // Store session logic if needed later, but relying on callbacks mostly
      sessionRef.current = sessionPromise;

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start voice chat");
      setIsActive(false);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopAudioProcessing();
    };
  }, [stopAudioProcessing]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative flex flex-col items-center gap-6">
        
        <button 
            onClick={() => { stopAudioProcessing(); onClose(); }}
            className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
        >
            <XCircle size={32} />
        </button>

        <div className="text-center mt-4">
            <h3 className="text-2xl font-bold text-slate-800">Voice Chat</h3>
            <p className="text-slate-500">Say "Hello" to Healtogochi!</p>
        </div>

        {/* Visualizer Circle */}
        <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-indigo-50 border-4 border-indigo-200' : 'bg-slate-100'}`}>
            {isActive ? (
                <div className="relative w-full h-full flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-indigo-400 opacity-20 animate-ping"></span>
                    <Volume2 size={64} className="text-indigo-600 z-10 animate-pulse" />
                </div>
            ) : (
                <MicOff size={48} className="text-slate-400" />
            )}
        </div>

        {transcription && (
            <div className="bg-indigo-50 p-3 rounded-lg w-full text-center">
                <p className="text-sm text-indigo-700 italic">"{transcription}"</p>
            </div>
        )}

        {error && (
             <div className="bg-red-50 p-3 rounded-lg w-full text-center">
                <p className="text-sm text-red-500">{error}</p>
            </div>
        )}

        <div className="w-full">
            {!isActive ? (
                <button 
                    onClick={startSession}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <Mic size={24} />
                    Start Talking
                </button>
            ) : (
                 <button 
                    onClick={() => { stopAudioProcessing(); setIsActive(false); }}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <MicOff size={24} />
                    End Chat
                </button>
            )}
        </div>
        
        <div className="text-xs text-slate-400 text-center">
            Powered by Gemini Live API &bull; Audio Output enabled
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
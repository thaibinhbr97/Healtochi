import React from 'react';
import { PetState } from '../types';

interface PetDisplayProps {
  pet: PetState;
  isTalking?: boolean;
}

const PetDisplay: React.FC<PetDisplayProps> = ({ pet, isTalking }) => {
  // Using a cute generated placeholder or SVG
  // Simulating animation based on talking state
  
  return (
    <div className="flex flex-col items-center justify-center py-6 relative">
      <div className="relative">
        {/* Background Aura */}
        <div className="absolute inset-0 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        
        {/* The Pet SVG */}
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className={`relative z-10 transition-transform duration-500 ${isTalking ? 'animate-bounce' : 'animate-[wiggle_3s_ease-in-out_infinite]'}`}
        >
          {/* Body */}
          <circle cx="100" cy="100" r="80" fill="#4ADE80" className="drop-shadow-lg" />
          <circle cx="100" cy="100" r="70" fill="#86EFAC" />
          
          {/* Eyes */}
          <ellipse cx="70" cy="90" rx="10" ry="15" fill="#1E293B" />
          <ellipse cx="130" cy="90" rx="10" ry="15" fill="#1E293B" />
          
          {/* Eye Shine */}
          <circle cx="73" cy="85" r="4" fill="white" />
          <circle cx="133" cy="85" r="4" fill="white" />

          {/* Cheeks */}
          <circle cx="60" cy="110" r="10" fill="#F472B6" opacity="0.6" />
          <circle cx="140" cy="110" r="10" fill="#F472B6" opacity="0.6" />

          {/* Mouth */}
          {isTalking ? (
             <circle cx="100" cy="120" r="10" fill="#1E293B" className="animate-ping" />
          ) : (
             <path d="M 80 120 Q 100 135 120 120" stroke="#1E293B" strokeWidth="5" fill="none" strokeLinecap="round" />
          )}

          {/* Leaf on head */}
          <path d="M 100 20 Q 80 5 100 40" stroke="#15803d" strokeWidth="6" fill="none" />
          <path d="M 100 20 Q 120 5 100 40" stroke="#15803d" strokeWidth="6" fill="none" />
        </svg>
      </div>

      <div className="mt-4 text-center">
        <h2 className="text-3xl font-bold text-slate-700">{pet.name}</h2>
        <p className="text-slate-500 font-medium">Lvl {pet.level}</p>
        
        {/* XP Bar */}
        <div className="w-48 h-4 bg-slate-200 rounded-full mt-2 overflow-hidden border border-slate-300">
          <div 
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${(pet.xp / pet.xpToNextLevel) * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">{pet.xp} / {pet.xpToNextLevel} XP</p>
      </div>
      
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );
};

export default PetDisplay;
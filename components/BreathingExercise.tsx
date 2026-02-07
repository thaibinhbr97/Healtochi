import React, { useState, useEffect } from 'react';

const BreathingExercise: React.FC = () => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const cycle = async () => {
      // Inhale (4s)
      setPhase('Inhale');
      setScale(1.5);
      await new Promise(r => setTimeout(r, 4000));
      
      // Hold (4s)
      setPhase('Hold');
      await new Promise(r => setTimeout(r, 4000));
      
      // Exhale (4s)
      setPhase('Exhale');
      setScale(1);
      await new Promise(r => setTimeout(r, 4000));
    };

    const interval = setInterval(() => {
        cycle();
    }, 12000); // 4+4+4 = 12s cycle

    cycle(); // Start immediately

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h2 className="text-2xl font-bold text-slate-700 mb-8">Relax & Breathe</h2>
      
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Outer Ring */}
        <div 
            className="absolute inset-0 rounded-full bg-blue-100 border-4 border-blue-200 transition-all duration-[4000ms] ease-in-out"
            style={{ transform: `scale(${scale})` }}
        ></div>
        
        {/* Inner Text */}
        <div className="z-10 text-center">
            <p className="text-3xl font-bold text-blue-600 tracking-wider">{phase}</p>
        </div>
      </div>
      
      <p className="mt-12 text-slate-500 text-center max-w-xs">
        Follow the circle. Breathe in when it grows, hold, and breathe out when it shrinks.
      </p>
    </div>
  );
};

export default BreathingExercise;
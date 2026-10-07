import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, Building, Zap, Droplets, Trash2, Brain } from 'lucide-react';

interface GeneratingDashboardScreenProps {
  institutionName: string;
  onComplete: () => void;
}

const STEPS = [
  { label: 'Registering facility zones & baseline loads...', icon: Building },
  { label: 'Computing expected energy & water consumption models...', icon: Zap },
  { label: 'Calibrating dustbin filling velocities & overflow risks...', icon: Trash2 },
  { label: 'Initializing AI anomaly detector & facility benchmarks...', icon: Brain },
  { label: 'Synthesizing customized institutional intelligence dashboard...', icon: Sparkles },
];

export const GeneratingDashboardScreen: React.FC<GeneratingDashboardScreenProps> = ({
  institutionName,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return prev;
        }
      });
    }, 650);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030714] via-[#07132a] to-[#02050f] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-teal-500/20 border border-blue-500/40 flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 animate-pulse">
          <Sparkles className="w-8 h-8 text-blue-400" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Generating Your Institution Intelligence Dashboard…
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Tailoring predictive resource analytics for <span className="text-blue-400 font-semibold">{institutionName}</span>
          </p>
        </div>

        {/* Step-by-step progress */}
        <div className="bg-[#08142a]/90 border border-blue-900/40 rounded-2xl p-5 space-y-3.5 text-left shadow-2xl shadow-blue-950/40">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const Icon = step.icon;

            return (
              <div
                key={idx}
                className={`flex items-center space-x-3 text-xs transition-all duration-200 ${
                  isCompleted
                    ? 'text-slate-200'
                    : isCurrent
                    ? 'text-blue-400 font-medium'
                    : 'text-slate-500'
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-blue-900 bg-[#060e22]" />
                  )}
                </div>
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#050b1a] h-1.5 rounded-full overflow-hidden border border-blue-900/30">
          <div
            className="bg-blue-400 h-full transition-all duration-500 ease-out shadow-sm shadow-blue-400/50"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

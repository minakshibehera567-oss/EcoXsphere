import React from 'react';
import { Institution } from '../types/institution';
import { Award, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

interface AIFacilityScoreProps {
  institution: Institution;
}

export const AIFacilityScore: React.FC<AIFacilityScoreProps> = ({ institution }) => {
  const { sustainabilityScore } = institution;
  const breakdown = sustainabilityScore.breakdown;

  // Find max and min score areas
  const entries = Object.entries(breakdown);
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return (
    <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-6 space-y-6 shadow-xl shadow-blue-950/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">AI Facility Sustainability Score</h3>
          </div>
          <p className="text-xs text-slate-400">
            Multi-dimensional index weighted across resource conservation, efficiency baselines, and environmental compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto bg-[#050f24] px-4 py-2 rounded-xl border border-blue-900/50">
          <div className="text-right">
            <span className="text-[10px] text-blue-300 uppercase tracking-wider block font-semibold">Campus Score</span>
            <span className="text-2xl font-black text-blue-400 font-mono">
              {sustainabilityScore.overall}
              <span className="text-xs font-normal text-slate-500">/100</span>
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map(([label, score]) => {
          const isHigh = score >= 80;
          const isMid = score >= 70 && score < 80;

          return (
            <div
              key={label}
              className="p-4 bg-[#050f24] border border-blue-900/40 rounded-xl space-y-2 hover:border-blue-700/60 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{label}</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    isHigh ? 'text-emerald-400' : isMid ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {score}/100
                </span>
              </div>

              <div className="w-full bg-[#03091c] h-2 rounded-full overflow-hidden border border-blue-900/30">
                <div
                  className={`h-full transition-all duration-500 ${
                    isHigh ? 'bg-emerald-500' : isMid ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>{isHigh ? 'Leader tier' : isMid ? 'Target range' : 'Improvement area'}</span>
                <span>{score >= 75 ? '+3% vs avg' : '-5% vs avg'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Explanation Callout */}
      <div className="p-4 bg-[#0a1a3d]/80 border border-blue-500/30 rounded-xl flex items-start space-x-3 text-xs sm:text-sm shadow-md shadow-blue-950/30">
        <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-300 block mb-0.5">AI Index Assessment</span>
          <p className="text-slate-300 leading-relaxed">
            {strongest && weakest
              ? `“Your strongest area is ${strongest[0].toLowerCase()} (${strongest[1]}/100). Your biggest improvement opportunity is ${weakest[0].toLowerCase()} (${weakest[1]}/100).” ${sustainabilityScore.explanation}`
              : sustainabilityScore.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};

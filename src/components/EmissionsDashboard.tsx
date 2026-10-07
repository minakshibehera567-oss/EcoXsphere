import React from 'react';
import { Institution, EmissionsAnalytics } from '../types/institution';
import {
  CloudRain,
  Sparkles,
  Leaf,
  Target,
  Award,
  TrendingDown,
  Factory,
  Zap,
  Car,
  CheckCircle2,
} from 'lucide-react';

interface EmissionsDashboardProps {
  institution: Institution;
}

export const EmissionsDashboard: React.FC<EmissionsDashboardProps> = ({ institution }) => {
  const emis: EmissionsAnalytics = institution.emissionsAnalytics || {
    scope1DieselGasTonnes: 5.5,
    scope2GridTonnes: 36.9,
    scope3CommuteWasteTonnes: 10.3,
    totalTonnesCO2e: 52.7,
    baselineYearTonnes: 67.5,
    reductionVsBaselinePercent: 22,
    carbonOffsetCreditsTonnes: 14.5,
    netZeroTargetYear: 2035,
    intensityPerCapitaKg: 12,
    aiInsight: 'Campus has reduced carbon emissions by 22% compared to historical baseline through rooftop solar PV arrays and LED smart scheduling.',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#071530]/80 border border-blue-900/40 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Carbon Footprint & Net-Zero Emissions Intelligence</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 border border-teal-500/30 text-teal-300">
                  GHG Protocol Accounting
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking of Scope 1 (Direct Fuel), Scope 2 (Grid Power), and Scope 3 (Commuter/Waste) greenhouse gas emissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Reduction vs Baseline</span>
              <span className="text-xl font-black text-emerald-400 font-mono flex items-center justify-end gap-1">
                <TrendingDown className="w-4 h-4" /> -{emis.reductionVsBaselinePercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Total Monthly Carbon</span>
          <div className="text-3xl font-black text-white font-mono my-2">
            {emis.totalTonnesCO2e} <span className="text-xs text-slate-400 font-sans">Tonnes CO2e</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">Down from {emis.baselineYearTonnes} T</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Target Net-Zero Year</span>
          <div className="text-3xl font-black text-teal-400 font-mono my-2">{emis.netZeroTargetYear}</div>
          <span className="text-[11px] text-slate-400">On-track trajectory</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Carbon Credits Earned</span>
          <div className="text-3xl font-black text-emerald-400 font-mono my-2">{emis.carbonOffsetCreditsTonnes} T</div>
          <span className="text-[11px] text-emerald-300 font-semibold">Verified rooftop solar</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Carbon Intensity</span>
          <div className="text-3xl font-black text-sky-400 font-mono my-2">
            {emis.intensityPerCapitaKg} <span className="text-xs text-slate-400 font-sans">kg/person</span>
          </div>
          <span className="text-[11px] text-slate-400">Monthly per capita load</span>
        </div>
      </div>

      {/* AI Insight Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/80 via-[#071b40] to-[#040e25] border border-teal-500/30 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-teal-400" />
        </div>
        <div className="flex-1 text-xs">
          <span className="font-bold text-teal-300 uppercase tracking-wider text-[10px]">AI Carbon & Decarbonization Strategy</span>
          <p className="text-slate-200 mt-1 leading-relaxed">{emis.aiInsight}</p>
        </div>
      </div>

      {/* Scope 1, 2, 3 Breakdown */}
      <div className="bg-[#071530]/80 border border-blue-900/40 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Greenhouse Gas Scope 1, 2, 3 Emissions Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scope 1 */}
          <div className="p-4 rounded-xl bg-[#051026] border border-blue-900/40">
            <div className="flex items-center gap-2 mb-2 text-rose-300">
              <Factory className="w-4 h-4" />
              <h4 className="font-bold text-xs uppercase tracking-wider">Scope 1: Direct Combustion</h4>
            </div>
            <div className="text-2xl font-black text-white font-mono my-1">{emis.scope1DieselGasTonnes} T</div>
            <p className="text-[11px] text-slate-400">
              Diesel generator testing, campus fleet refueling, and kitchen heating boilers.
            </p>
          </div>

          {/* Scope 2 */}
          <div className="p-4 rounded-xl bg-[#051026] border border-blue-900/40">
            <div className="flex items-center gap-2 mb-2 text-amber-300">
              <Zap className="w-4 h-4" />
              <h4 className="font-bold text-xs uppercase tracking-wider">Scope 2: Purchased Electricity</h4>
            </div>
            <div className="text-2xl font-black text-white font-mono my-1">{emis.scope2GridTonnes} T</div>
            <p className="text-[11px] text-slate-400">
              Commercial utility grid electricity draw adjusted for regional grid carbon factor.
            </p>
          </div>

          {/* Scope 3 */}
          <div className="p-4 rounded-xl bg-[#051026] border border-blue-900/40">
            <div className="flex items-center gap-2 mb-2 text-sky-300">
              <Car className="w-4 h-4" />
              <h4 className="font-bold text-xs uppercase tracking-wider">Scope 3: Indirect Value Chain</h4>
            </div>
            <div className="text-2xl font-black text-white font-mono my-1">{emis.scope3CommuteWasteTonnes} T</div>
            <p className="text-[11px] text-slate-400">
              Occupant daily commuting transit, municipal waste hauling, and water delivery pumping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

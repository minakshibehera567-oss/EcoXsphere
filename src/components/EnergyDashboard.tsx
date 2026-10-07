import React from 'react';
import { Institution } from '../types/institution';
import { Zap, TrendingDown, TrendingUp, Sparkles, Building, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';

interface EnergyDashboardProps {
  institution: Institution;
  onOpenWhatIf?: () => void;
}

export const EnergyDashboard: React.FC<EnergyDashboardProps> = ({ institution, onOpenWhatIf }) => {
  const { energyAnalytics, metrics, buildings } = institution;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Energy */}
        <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-5 shadow-xl shadow-blue-950/40">
          <div className="flex items-center justify-between text-xs text-blue-200/70 mb-2">
            <span>Total Monthly Energy</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {energyAnalytics.totalMonthlyKWh.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">kWh/mo</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>Expected: <strong className="text-blue-200">{energyAnalytics.expectedMonthlyKWh.toLocaleString()} kWh</strong></span>
          </div>
        </div>

        {/* Energy Saved */}
        <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-5 shadow-xl shadow-blue-950/40">
          <div className="flex items-center justify-between text-xs text-blue-200/70 mb-2">
            <span>Energy Conserved</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {energyAnalytics.savedKWh.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">kWh</span>
          </div>
          <div className="text-xs text-emerald-400/90 mt-2 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>{energyAnalytics.savedPercent}% below baseline</span>
          </div>
        </div>

        {/* Highest Consumption Building */}
        <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-5 shadow-xl shadow-blue-950/40">
          <div className="flex items-center justify-between text-xs text-blue-200/70 mb-2">
            <span>Highest Consumption Zone</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white truncate" title={energyAnalytics.highestConsumptionBuilding}>
            {energyAnalytics.highestConsumptionBuilding}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Primary target for setback schedules
          </div>
        </div>

        {/* Highest Saving Building */}
        <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-5 shadow-xl shadow-blue-950/40">
          <div className="flex items-center justify-between text-xs text-blue-200/70 mb-2">
            <span>Highest Saving Building</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400 truncate" title={energyAnalytics.highestSavingBuilding}>
            {energyAnalytics.highestSavingBuilding}
          </div>
          <div className="text-xs text-emerald-400/80 mt-2">
            Exemplary load management
          </div>
        </div>
      </div>

      {/* AI Energy Observation Box */}
      <div className="p-4 bg-[#0a1a3d]/80 border border-blue-500/30 rounded-xl flex items-start space-x-3 shadow-md shadow-blue-950/30">
        <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <span className="font-semibold text-emerald-300 block mb-0.5">AI Energy Intelligence</span>
          <p className="text-slate-300 leading-relaxed">{energyAnalytics.aiInsight}</p>
        </div>
      </div>

      {/* "Where is energy being conserved?" breakdown */}
      <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-6 shadow-xl shadow-blue-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Where is Energy Being Conserved?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Building-level breakdown comparing actual monthly power vs engineered baseline
            </p>
          </div>

          {onOpenWhatIf && (
            <button
              onClick={onOpenWhatIf}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 self-start sm:self-auto px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg transition-colors"
            >
              <span>Simulate 10% AC Reduction</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Breakdown List */}
        <div className="space-y-4">
          {energyAnalytics.buildingBreakdown.map((item) => {
            const isSaving = item.savedKWh >= 0;
            const percentageDelta = item.expectedKWh > 0 ? Math.round((Math.abs(item.savedKWh) / item.expectedKWh) * 100) : 0;
            const progressWidth = Math.min(100, Math.round((item.actualKWh / (item.expectedKWh || 1)) * 100));

            const building = buildings.find((b) => b.id === item.buildingId);

            return (
              <div
                key={item.buildingId}
                className="p-4 bg-[#050f24] border border-blue-900/40 rounded-xl hover:border-blue-700/60 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-white text-sm">{item.buildingName}</span>
                    {building?.type && <span className="text-xs text-slate-400">({building.type})</span>}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Actual: </span>
                      <span className="font-bold text-white font-mono">{item.actualKWh.toLocaleString()} kWh</span>
                    </div>

                    <div>
                      <span className="text-slate-400">Baseline: </span>
                      <span className="text-slate-300 font-mono">{item.expectedKWh.toLocaleString()} kWh</span>
                    </div>

                    <div
                      className={`font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1 ${
                        isSaving
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      }`}
                    >
                      {isSaving ? `+${item.savedKWh.toLocaleString()} kWh saved` : `-${Math.abs(item.savedKWh).toLocaleString()} kWh excess`}
                    </div>
                  </div>
                </div>

                {/* Progress bar comparison */}
                <div className="space-y-1">
                  <div className="w-full bg-[#03091c] h-2 rounded-full overflow-hidden flex border border-blue-900/30">
                    <div
                      className={`h-full transition-all duration-500 ${isSaving ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Current utilization: {progressWidth}% of capacity baseline</span>
                    <span>{isSaving ? `${percentageDelta}% efficiency gain` : `${percentageDelta}% load overshoot`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom AI Highlight */}
        <div className="mt-6 pt-4 border-t border-blue-900/30 flex items-center justify-between text-xs text-blue-300/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Highest Saver: <strong>{energyAnalytics.highestSavingBuilding}</strong> achieved peak conservation this month.</span>
          </div>
          <span className="text-[11px] text-slate-400">Baseline model: Normalized thermal floor area</span>
        </div>
      </div>
    </div>
  );
};

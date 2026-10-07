import React from 'react';
import { Institution } from '../types/institution';
import { X, Scale, Sparkles, Building2, TrendingDown, Droplets, Trash2, Award } from 'lucide-react';

interface InstitutionComparisonModalProps {
  institutions: Institution[];
  currentInstitutionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectInstitution: (id: string) => void;
}

export const InstitutionComparisonModal: React.FC<InstitutionComparisonModalProps> = ({
  institutions,
  currentInstitutionId,
  isOpen,
  onClose,
  onSelectInstitution,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#01040e]/85 backdrop-blur-md">
      <div className="bg-[#081635] border border-blue-900/60 rounded-2xl w-full max-w-4xl h-[85vh] max-h-[750px] flex flex-col shadow-2xl shadow-blue-950/70 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#050f24] border-b border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cross-Facility Benchmark Comparison</h3>
              <p className="text-xs text-slate-400">
                Normalized efficiency, conservation rates, and sustainability indices across registered campuses
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice on Normalized metrics */}
        <div className="px-6 py-2.5 bg-[#030a1c] border-b border-blue-900/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Comparisons are normalized by physical footprint (sq ft) and occupancy (students/staff).</span>
          </div>
          <span className="text-slate-500 text-[11px]">Normalized / Estimated Metrics</span>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Side-by-side Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutions.map((inst) => {
              const isCurrent = inst.id === currentInstitutionId;
              const perCapitaEnergy = Math.round(
                inst.energyAnalytics.totalMonthlyKWh / (inst.metrics.occupancyCount || 1)
              );
              const perCapitaWater = Math.round(
                inst.waterAnalytics.totalDailyLiters / (inst.metrics.occupancyCount || 1)
              );

              return (
                <div
                  key={inst.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">{inst.icon}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm truncate max-w-[170px]">
                          {inst.name}
                        </h4>
                        <span className="text-xs text-slate-400">{inst.location.city}, {inst.location.state}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        {inst.sustainabilityScore.overall}
                        <span className="text-xs text-slate-500 font-normal">/100</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <strong className="text-white">{inst.type}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Buildings:</span>
                      <strong className="text-white">{inst.buildings.length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Occupancy:</span>
                      <strong className="text-white">{inst.metrics.occupancyCount.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Energy Per Capita:</span>
                      <strong className="text-emerald-400 font-mono">{perCapitaEnergy} kWh/person</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Water Per Capita:</span>
                      <strong className="text-sky-400 font-mono">{perCapitaWater} L/person/day</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Energy Saving %:</span>
                      <strong className="text-emerald-400 font-mono">{inst.energyAnalytics.savedPercent}% saved</strong>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => {
                        onSelectInstitution(inst.id);
                        onClose();
                      }}
                      className="mt-4 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Switch to This Dashboard
                    </button>
                  )}

                  {isCurrent && (
                    <div className="mt-4 text-center py-1 text-xs text-emerald-400 font-medium">
                      ✓ Currently Active View
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Benchmark Comparison Table */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Detailed Efficiency Benchmark Matrix
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Institution</th>
                    <th className="py-2.5 px-4 font-semibold">Sustainability Score</th>
                    <th className="py-2.5 px-4 font-semibold">Energy Efficiency</th>
                    <th className="py-2.5 px-4 font-semibold">Water Efficiency</th>
                    <th className="py-2.5 px-4 font-semibold">Waste Telemetry</th>
                    <th className="py-2.5 px-4 font-semibold">Campus Footprint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {institutions.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                        <span>{i.icon}</span>
                        <span>{i.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {i.sustainabilityScore.overall}/100
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {i.energyAnalytics.savedPercent}% saved ({i.energyAnalytics.totalMonthlyKWh.toLocaleString()} kWh)
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {i.waterAnalytics.totalDailyLiters.toLocaleString()} L/day
                      </td>
                      <td className="py-3 px-4">
                        {i.wasteAnalytics.totalBins} bins ({i.wasteAnalytics.criticalCount} critical)
                      </td>
                      <td className="py-3 px-4">
                        {i.metrics.campusArea} · {i.buildings.length} blocks
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

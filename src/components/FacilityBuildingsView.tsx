import React, { useState } from 'react';
import { Institution, Building } from '../types/institution';
import { Building2, Layers, Users, Zap, Droplets, Info, Search, Cpu } from 'lucide-react';

interface FacilityBuildingsViewProps {
  institution: Institution;
}

export const FacilityBuildingsView: React.FC<FacilityBuildingsViewProps> = ({ institution }) => {
  const [search, setSearch] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(institution.buildings[0]?.id || '');

  const filtered = institution.buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.type.toLowerCase().includes(search.toLowerCase()) ||
      b.majorEquipment.toLowerCase().includes(search.toLowerCase())
  );

  const selectedBuilding = institution.buildings.find((b) => b.id === selectedBuildingId) || institution.buildings[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/40 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Facility Buildings & Zones</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Granular breakdown of physical blocks, occupants, and sub-metered loads for <span className="text-slate-200">{institution.name}</span>.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search buildings or equipment..."
            className="pl-9 pr-3 py-1.5 bg-[#050f24] border border-blue-900/50 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Buildings Cards Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filtered.map((b) => {
            const isSelected = b.id === selectedBuilding?.id;

            return (
              <div
                key={b.id}
                onClick={() => setSelectedBuildingId(b.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#0a1e46] border-blue-500 shadow-lg ring-1 ring-blue-500/40'
                    : 'bg-[#081635] border-blue-900/40 hover:border-blue-700/60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#050f24] border border-blue-900/50 flex items-center justify-center text-blue-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{b.name}</h4>
                      <span className="text-xs text-slate-400">{b.type}</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-blue-300 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {b.monthlyElectricityKWh.toLocaleString()} kWh/mo
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-blue-900/30 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>{b.floors} Floors ({b.areaSqFt.toLocaleString()} sqft)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>{b.occupancy} Occupants</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    <span>{b.dailyWaterLiters.toLocaleString()} L/day</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Building Detail Inspector (5 cols) */}
        {selectedBuilding && (
          <div className="lg:col-span-5 bg-[#081635] border border-blue-900/40 rounded-2xl p-5 space-y-4 self-start shadow-xl shadow-blue-950/40">
            <div className="border-b border-blue-900/40 pb-3">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                Zone Deep Dive Inspector
              </span>
              <h3 className="text-lg font-bold text-white">{selectedBuilding.name}</h3>
              <span className="text-xs text-slate-400">{selectedBuilding.type}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 bg-[#050f24] border border-blue-900/30 rounded-lg">
                <span className="text-slate-400">Floor Footprint:</span>
                <strong className="text-white font-mono">{selectedBuilding.areaSqFt.toLocaleString()} sq ft</strong>
              </div>

              <div className="flex justify-between p-2.5 bg-[#050f24] border border-blue-900/30 rounded-lg">
                <span className="text-slate-400">Floors Count:</span>
                <strong className="text-white font-mono">{selectedBuilding.floors} floors</strong>
              </div>

              <div className="flex justify-between p-2.5 bg-[#050f24] border border-blue-900/30 rounded-lg">
                <span className="text-slate-400">Occupancy Capacity:</span>
                <strong className="text-white font-mono">{selectedBuilding.occupancy} people</strong>
              </div>

              <div className="p-3 bg-[#050f24] border border-blue-900/30 rounded-lg space-y-1">
                <span className="text-slate-400 block text-[11px]">Major Installed Equipment:</span>
                <div className="text-slate-200 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>{selectedBuilding.majorEquipment}</span>
                </div>
              </div>

              <div className="p-3 bg-[#050f24] border border-blue-900/30 rounded-lg space-y-1">
                <span className="text-slate-400 block text-[11px]">Operational Intelligence Notes:</span>
                <p className="text-slate-300 italic">
                  {selectedBuilding.notes || 'Routine academic and administrative operations within tolerance.'}
                </p>
              </div>

              {/* Energy vs Water Quick Snapshot */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 bg-blue-950/30 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-1 text-[11px] text-blue-300 mb-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Power Usage</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white">
                    {selectedBuilding.monthlyElectricityKWh.toLocaleString()} kWh
                  </div>
                  <span className="text-[10px] text-slate-400">Baseline: {selectedBuilding.expectedElectricityKWh.toLocaleString()}</span>
                </div>

                <div className="p-2.5 bg-sky-950/30 border border-sky-500/30 rounded-lg">
                  <div className="flex items-center gap-1 text-[11px] text-sky-300 mb-1">
                    <Droplets className="w-3 h-3 text-sky-400" />
                    <span>Water Draw</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white">
                    {selectedBuilding.dailyWaterLiters.toLocaleString()} L/day
                  </div>
                  <span className="text-[10px] text-slate-400">Baseline: {selectedBuilding.expectedWaterLiters.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Institution, Building, ResourceType, DataSourceType, DataSourceConfig } from '../types/institution';
import { RESOURCE_MODULES, DATA_SOURCE_LABELS } from '../data/initialInstitutions';
import { X, Save, Plus, Trash2, Building2, Sliders, Zap, Droplets, Trash, Shield, Sparkles } from 'lucide-react';

interface InstitutionProfileModalProps {
  institution: Institution;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Institution) => void;
}

export const InstitutionProfileModal: React.FC<InstitutionProfileModalProps> = ({
  institution,
  isOpen,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'buildings' | 'modules' | 'sources'>('info');

  const [name, setName] = useState(institution.name);
  const [city, setCity] = useState(institution.location.city);
  const [state, setState] = useState(institution.location.state);
  const [campusArea, setCampusArea] = useState(institution.metrics.campusArea);
  const [occupancy, setOccupancy] = useState(institution.metrics.occupancyCount);
  const [dustbins, setDustbins] = useState(institution.metrics.dustbinsCount);
  const [avgElectricity, setAvgElectricity] = useState(institution.metrics.avgMonthlyElectricityKWh);
  const [avgWater, setAvgWater] = useState(institution.metrics.avgDailyWaterLiters);
  const [acUnits, setAcUnits] = useState(institution.metrics.acUnitsCount);

  const [buildings, setBuildings] = useState<Building[]>(institution.buildings);
  const [monitoredResources, setMonitoredResources] = useState<ResourceType[]>(institution.monitoredResources);
  const [dataSources, setDataSources] = useState<Partial<Record<ResourceType, DataSourceConfig>>>(institution.dataSources);

  if (!isOpen) return null;

  const handleAddBuilding = () => {
    const nextIdx = buildings.length + 1;
    const newB: Building = {
      id: `b-${Date.now()}`,
      name: `Wing ${String.fromCharCode(64 + nextIdx)}`,
      type: 'Multi-purpose Unit',
      areaSqFt: 22000,
      floors: 3,
      occupancy: 250,
      majorEquipment: 'Split ACs, Lighting Grid',
      monthlyElectricityKWh: 4000,
      dailyWaterLiters: 5000,
      expectedElectricityKWh: 4500,
      expectedWaterLiters: 5500,
      notes: '',
    };
    setBuildings([...buildings, newB]);
  };

  const handleUpdateBuilding = (id: string, field: keyof Building, value: any) => {
    setBuildings(buildings.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const [profileError, setProfileError] = useState<string | null>(null);

  const handleDeleteBuilding = (id: string) => {
    if (buildings.length <= 1) {
      setProfileError('Institution must retain at least 1 building.');
      return;
    }
    setProfileError(null);
    setBuildings(buildings.filter((b) => b.id !== id));
  };

  const toggleResource = (res: ResourceType) => {
    setMonitoredResources((prev) =>
      prev.includes(res) ? prev.filter((r) => r !== res) : [...prev, res]
    );
  };

  const handleSave = () => {
    const updated: Institution = {
      ...institution,
      name,
      location: {
        ...institution.location,
        city,
        state,
      },
      metrics: {
        ...institution.metrics,
        campusArea,
        occupancyCount: occupancy,
        dustbinsCount: dustbins,
        avgMonthlyElectricityKWh: avgElectricity,
        avgDailyWaterLiters: avgWater,
        acUnitsCount: acUnits,
        buildingsCount: buildings.length,
      },
      buildings,
      monitoredResources,
      dataSources,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#01040e]/85 backdrop-blur-md">
      <div className="bg-[#081635] border border-blue-900/60 rounded-2xl w-full max-w-3xl h-[85vh] max-h-[750px] flex flex-col shadow-2xl shadow-blue-950/70 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#050f24] border-b border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#091a3e] border border-blue-900/50 flex items-center justify-center text-lg">
              {institution.icon}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Institution Profile & Parameters</h3>
              <p className="text-xs text-slate-400">
                Updating profile recalculates AI benchmarks and anomaly baselines
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

        {/* Tab Bar */}
        <div className="px-6 bg-[#030a1c] border-b border-blue-900/40 flex items-center space-x-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-400 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            General & Scale
          </button>
          <button
            onClick={() => setActiveTab('buildings')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'buildings'
                ? 'border-blue-400 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Buildings & Zones ({buildings.length})
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'modules'
                ? 'border-blue-400 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Modules ({monitoredResources.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {profileError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center justify-between">
              <span>{profileError}</span>
              <button
                type="button"
                onClick={() => setProfileError(null)}
                className="text-rose-400 font-bold hover:underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Institution Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Campus Area</label>
                  <input
                    type="text"
                    value={campusArea}
                    onChange={(e) => setCampusArea(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Students / Employees</label>
                  <input
                    type="number"
                    value={occupancy}
                    onChange={(e) => setOccupancy(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Registered Dustbins</label>
                  <input
                    type="number"
                    value={dustbins}
                    onChange={(e) => setDustbins(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Monthly Power Baseline (kWh)</label>
                  <input
                    type="number"
                    value={avgElectricity}
                    onChange={(e) => setAvgElectricity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Daily Water Baseline (L/day)</label>
                  <input
                    type="number"
                    value={avgWater}
                    onChange={(e) => setAvgWater(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'buildings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Granular building and wing inventory</span>
                <button
                  type="button"
                  onClick={handleAddBuilding}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add Building
                </button>
              </div>

              <div className="space-y-3">
                {buildings.map((b) => (
                  <div key={b.id} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={b.name}
                        onChange={(e) => handleUpdateBuilding(b.id, 'name', e.target.value)}
                        className="text-sm font-bold text-white bg-transparent border-b border-dashed border-slate-700 focus:outline-none focus:border-emerald-500 px-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteBuilding(b.id)}
                        className="p-1 text-slate-500 hover:text-red-400"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Actual kWh</span>
                        <input
                          type="number"
                          value={b.monthlyElectricityKWh}
                          onChange={(e) => handleUpdateBuilding(b.id, 'monthlyElectricityKWh', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Expected kWh</span>
                        <input
                          type="number"
                          value={b.expectedElectricityKWh}
                          onChange={(e) => handleUpdateBuilding(b.id, 'expectedElectricityKWh', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Water L/day</span>
                        <input
                          type="number"
                          value={b.dailyWaterLiters}
                          onChange={(e) => handleUpdateBuilding(b.id, 'dailyWaterLiters', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Occupancy</span>
                        <input
                          type="number"
                          value={b.occupancy}
                          onChange={(e) => handleUpdateBuilding(b.id, 'occupancy', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'modules' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Turn modules on or off. The dashboard only mounts components for active modules.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {RESOURCE_MODULES.map((m) => {
                  const isChecked = monitoredResources.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleResource(m.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-slate-800/90 border-emerald-500 text-white font-medium'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-xs">{m.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="accent-emerald-500 rounded"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save & Recalculate Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

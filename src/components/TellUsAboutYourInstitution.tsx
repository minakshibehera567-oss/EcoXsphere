import React, { useState } from 'react';
import { InstitutionTypeDefinition } from '../data/initialInstitutions';
import { ArrowLeft, ArrowRight, Sparkles, Building, MapPin, Zap, Droplets, Trash2, Shield, Info } from 'lucide-react';

export interface InstitutionFormState {
  name: string;
  type: string;
  icon: string;
  city: string;
  state: string;
  country: string;
  buildingsCount: number;
  occupancyCount: number;
  campusArea: string;
  floorsCount: number;
  classroomsCount: number;
  laboratoriesCount: number;
  hostelsCount: number;
  parkingAreasCount: number;
  vehiclesCount: number;
  dustbinsCount: number;
  waterTanksCount: number;
  avgDailyWaterLiters: number;
  avgMonthlyElectricityKWh: number;
  acUnitsCount: number;
  fansCount: number;
  lightsCount: number;
  majorMachinesCount: number;
  notes: string;
}

interface TellUsAboutYourInstitutionProps {
  typeDef: InstitutionTypeDefinition;
  onBack: () => void;
  onSubmit: (formData: InstitutionFormState) => void;
  onBackToDashboard?: () => void;
}

export const TellUsAboutYourInstitution: React.FC<TellUsAboutYourInstitutionProps> = ({
  typeDef,
  onBack,
  onSubmit,
  onBackToDashboard,
}) => {
  const [formData, setFormData] = useState<InstitutionFormState>({
    name: typeDef.type === 'College / University' ? 'ABC Engineering College' : `${typeDef.badge} Center`,
    type: typeDef.type,
    icon: typeDef.icon,
    city: typeDef.type === 'College / University' ? 'Bhubaneswar' : 'Bangalore',
    state: typeDef.type === 'College / University' ? 'Odisha' : 'Karnataka',
    country: 'India',
    buildingsCount: typeDef.suggestedMetrics.buildingsCount,
    occupancyCount: typeDef.suggestedMetrics.occupancyCount,
    campusArea: typeDef.suggestedMetrics.campusArea,
    floorsCount: 4,
    classroomsCount: typeDef.type.includes('School') || typeDef.type.includes('College') ? 48 : 12,
    laboratoriesCount: typeDef.type.includes('College') || typeDef.type.includes('Hospital') ? 16 : 4,
    hostelsCount: typeDef.type.includes('College') ? 4 : 1,
    parkingAreasCount: 3,
    vehiclesCount: 420,
    dustbinsCount: typeDef.suggestedMetrics.dustbinsCount,
    waterTanksCount: typeDef.suggestedMetrics.waterTanksCount,
    avgDailyWaterLiters: typeDef.suggestedMetrics.avgDailyWaterLiters,
    avgMonthlyElectricityKWh: typeDef.suggestedMetrics.avgMonthlyElectricityKWh,
    acUnitsCount: typeDef.suggestedMetrics.acUnitsCount,
    fansCount: 480,
    lightsCount: 1250,
    majorMachinesCount: 22,
    notes: 'Campus with academic blocks, resident hostels, central laboratory, library, and dining facilities.',
  });

  const handleChange = (field: keyof InstitutionFormState, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fillSampleDefaults = () => {
    setFormData((prev) => ({
      ...prev,
      name: 'ABC Engineering College',
      city: 'Bhubaneswar',
      state: 'Odisha',
      country: 'India',
      buildingsCount: 8,
      occupancyCount: 4500,
      campusArea: '25 acres',
      floorsCount: 4,
      classroomsCount: 48,
      laboratoriesCount: 16,
      hostelsCount: 4,
      parkingAreasCount: 3,
      vehiclesCount: 420,
      dustbinsCount: 40,
      waterTanksCount: 6,
      avgDailyWaterLiters: 120000,
      avgMonthlyElectricityKWh: 45000,
      acUnitsCount: 160,
      fansCount: 480,
      lightsCount: 1250,
      majorMachinesCount: 22,
      notes: 'Premier technical campus with resident student hostels, advanced computational and chemical engineering labs, and rooftop solar study.',
    }));
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Please enter an institution name before proceeding.');
      return;
    }
    setErrorMessage(null);
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020718] via-[#071738] to-[#020512] text-slate-100 flex flex-col">
      {/* Onboarding Header */}
      <header className="border-b border-blue-900/40 bg-[#06122d]/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="flex items-center gap-1 text-xs font-semibold text-blue-300 hover:text-white px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg transition-colors ml-1"
              >
                <span>Dashboard</span>
              </button>
            )}
          </div>
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Step 1 of 4</span>
            <h2 className="text-sm font-bold text-white">Institution Profile</h2>
          </div>
          <button
            type="button"
            onClick={fillSampleDefaults}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md transition-colors"
            title="Populate with the ABC Engineering College sample data"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Use ABC College Sample</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{typeDef.icon}</span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{typeDef.type}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Tell Us About Your Institution
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enter your institution's details. These numbers will train the baseline energy, water, and waste analytics for your dashboard. Optional fields can be estimated or skipped.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 font-bold hover:underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: General Info */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Building className="w-4 h-4 text-emerald-400" />
              General Institution Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Institution Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. ABC Engineering College, Apex Metro Hospital..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Institution Type</label>
                <input
                  type="text"
                  disabled
                  value={formData.type}
                  className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Campus Area</label>
                <input
                  type="text"
                  value={formData.campusArea}
                  onChange={(e) => handleChange('campusArea', e.target.value)}
                  placeholder="e.g. 25 acres, 120,000 sq m"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. Bhubaneswar"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">State & Country</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="Country"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Scale & Population */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Scale & Population Metrics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Number of Buildings</label>
                <input
                  type="number"
                  min="1"
                  value={formData.buildingsCount}
                  onChange={(e) => handleChange('buildingsCount', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Students / Employees</label>
                <input
                  type="number"
                  min="10"
                  value={formData.occupancyCount}
                  onChange={(e) => handleChange('occupancyCount', parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Typical Floors/Building</label>
                <input
                  type="number"
                  min="1"
                  value={formData.floorsCount}
                  onChange={(e) => handleChange('floorsCount', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Classrooms / Offices</label>
                <input
                  type="number"
                  min="0"
                  value={formData.classroomsCount}
                  onChange={(e) => handleChange('classroomsCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Laboratories / Units</label>
                <input
                  type="number"
                  min="0"
                  value={formData.laboratoriesCount}
                  onChange={(e) => handleChange('laboratoriesCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hostels / Residencies</label>
                <input
                  type="number"
                  min="0"
                  value={formData.hostelsCount}
                  onChange={(e) => handleChange('hostelsCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Parking Areas</label>
                <input
                  type="number"
                  min="0"
                  value={formData.parkingAreasCount}
                  onChange={(e) => handleChange('parkingAreasCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Campus Vehicles</label>
                <input
                  type="number"
                  min="0"
                  value={formData.vehiclesCount}
                  onChange={(e) => handleChange('vehiclesCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Baseline Resource Usage */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Resource Baselines & Equipment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Monthly Electricity (kWh)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    value={formData.avgMonthlyElectricityKWh}
                    onChange={(e) => handleChange('avgMonthlyElectricityKWh', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-500">kWh</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Daily Water (Liters/day)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    value={formData.avgDailyWaterLiters}
                    onChange={(e) => handleChange('avgDailyWaterLiters', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-500">L/day</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Number of Dustbins
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.dustbinsCount}
                  onChange={(e) => handleChange('dustbinsCount', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Water Tanks (Overhead/Sump)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.waterTanksCount}
                  onChange={(e) => handleChange('waterTanksCount', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Number of AC Units</label>
                <input
                  type="number"
                  min="0"
                  value={formData.acUnitsCount}
                  onChange={(e) => handleChange('acUnitsCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ceiling / Wall Fans</label>
                <input
                  type="number"
                  min="0"
                  value={formData.fansCount}
                  onChange={(e) => handleChange('fansCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Total Lights/Fixtures</label>
                <input
                  type="number"
                  min="0"
                  value={formData.lightsCount}
                  onChange={(e) => handleChange('lightsCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Major Equipment Count</label>
                <input
                  type="number"
                  min="0"
                  value={formData.majorMachinesCount}
                  onChange={(e) => handleChange('majorMachinesCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Other Relevant Details / Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Mention any micro-grids, solar panels, diesel generators, special laboratory constraints, or shifts..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold rounded-lg shadow-lg shadow-emerald-500/20 transition-all hover:translate-x-0.5"
            >
              <span>Next: Configure Facility & Buildings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

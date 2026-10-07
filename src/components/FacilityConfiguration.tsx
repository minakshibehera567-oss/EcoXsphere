import React, { useState } from 'react';
import { Building } from '../types/institution';
import { InstitutionFormState } from './TellUsAboutYourInstitution';
import { ArrowLeft, ArrowRight, Plus, Trash2, Building2, Zap, Droplets, Users, Layers, Sparkles } from 'lucide-react';

interface FacilityConfigurationProps {
  institutionInfo: InstitutionFormState;
  onBack: () => void;
  onSubmit: (buildings: Building[]) => void;
}

export const FacilityConfiguration: React.FC<FacilityConfigurationProps> = ({
  institutionInfo,
  onBack,
  onSubmit,
}) => {
  // Generate initial buildings based on institution name/type or default to college structure
  const [buildings, setBuildings] = useState<Building[]>(() => {
    if (institutionInfo.name.includes('College') || institutionInfo.type.includes('College') || institutionInfo.type.includes('University')) {
      return [
        {
          id: 'b-1',
          name: 'Block A',
          type: 'Academic (Engineering)',
          areaSqFt: 38000,
          floors: 4,
          occupancy: 950,
          majorEquipment: '35 Split ACs, 2 Server Racks, Projectors',
          monthlyElectricityKWh: 8200,
          dailyWaterLiters: 15000,
          expectedElectricityKWh: 9000,
          expectedWaterLiters: 16500,
          notes: 'Smart classroom schedules active.',
        },
        {
          id: 'b-2',
          name: 'Block B',
          type: 'Academic & Admin',
          areaSqFt: 36000,
          floors: 4,
          occupancy: 820,
          majorEquipment: '45 Central VRF Units, Auditorium Sound System',
          monthlyElectricityKWh: 11800,
          dailyWaterLiters: 12000,
          expectedElectricityKWh: 9200,
          expectedWaterLiters: 13000,
          notes: 'Extended chiller hours in summer.',
        },
        {
          id: 'b-3',
          name: 'Block C',
          type: 'Academic (Sciences)',
          areaSqFt: 32000,
          floors: 3,
          occupancy: 700,
          majorEquipment: '25 AC Units, Drafting Monitors',
          monthlyElectricityKWh: 6800,
          dailyWaterLiters: 11000,
          expectedElectricityKWh: 8000,
          expectedWaterLiters: 12500,
          notes: 'Daylight harvesting corridors.',
        },
        {
          id: 'b-4',
          name: 'Library',
          type: 'Library & Digital Archives',
          areaSqFt: 22000,
          floors: 3,
          occupancy: 380,
          majorEquipment: '15 High-Efficiency Inverters',
          monthlyElectricityKWh: 4300,
          dailyWaterLiters: 4500,
          expectedElectricityKWh: 5000,
          expectedWaterLiters: 5200,
          notes: 'Motion sensors installed.',
        },
        {
          id: 'b-5',
          name: 'Laboratory',
          type: 'Research & Wet Labs',
          areaSqFt: 28000,
          floors: 3,
          occupancy: 420,
          majorEquipment: 'Autoclaves, Fume Hoods, Centrifuges, 4 Chillers',
          monthlyElectricityKWh: 7900,
          dailyWaterLiters: 20000,
          expectedElectricityKWh: 7600,
          expectedWaterLiters: 14000,
          notes: 'High water draw during continuous rinsing cycles.',
        },
        {
          id: 'b-6',
          name: 'Hostel',
          type: 'Residential (Student Hostel)',
          areaSqFt: 55000,
          floors: 5,
          occupancy: 1200,
          majorEquipment: 'Solar Water Heaters, Geysers, 240 Ceiling Fans',
          monthlyElectricityKWh: 5200,
          dailyWaterLiters: 50000,
          expectedElectricityKWh: 7000,
          expectedWaterLiters: 51000,
          notes: 'Solar water heaters save substantial grid energy.',
        },
        {
          id: 'b-7',
          name: 'Canteen',
          type: 'Dining & Food Court',
          areaSqFt: 14000,
          floors: 2,
          occupancy: 600,
          majorEquipment: 'Commercial Cold Storage, Dishwashers',
          monthlyElectricityKWh: 3800,
          dailyWaterLiters: 7500,
          expectedElectricityKWh: 4000,
          expectedWaterLiters: 7800,
          notes: 'Lunch peak waste generation.',
        },
        {
          id: 'b-8',
          name: 'Parking',
          type: 'Parking & Security Hub',
          areaSqFt: 24000,
          floors: 1,
          occupancy: 50,
          majorEquipment: 'Solar Canopy Inverters, High Mast LEDs',
          monthlyElectricityKWh: 800,
          dailyWaterLiters: 0,
          expectedElectricityKWh: 1000,
          expectedWaterLiters: 0,
          notes: 'EV charging points installed.',
        },
      ];
    }

    // Generic defaults for other facility types
    return [
      {
        id: 'b-1',
        name: 'Main Complex / Wing A',
        type: 'Administrative & Operations',
        areaSqFt: 35000,
        floors: 4,
        occupancy: 450,
        majorEquipment: 'Central HVAC, Lighting, Elevators',
        monthlyElectricityKWh: Math.round(institutionInfo.avgMonthlyElectricityKWh * 0.4),
        dailyWaterLiters: Math.round(institutionInfo.avgDailyWaterLiters * 0.35),
        expectedElectricityKWh: Math.round(institutionInfo.avgMonthlyElectricityKWh * 0.42),
        expectedWaterLiters: Math.round(institutionInfo.avgDailyWaterLiters * 0.38),
        notes: 'Primary operations center.',
      },
      {
        id: 'b-2',
        name: 'Operational Block B',
        type: 'Core Facilities',
        areaSqFt: 28000,
        floors: 3,
        occupancy: 320,
        majorEquipment: 'Secondary Chillers, IT Infrastructure',
        monthlyElectricityKWh: Math.round(institutionInfo.avgMonthlyElectricityKWh * 0.35),
        dailyWaterLiters: Math.round(institutionInfo.avgDailyWaterLiters * 0.3),
        expectedElectricityKWh: Math.round(institutionInfo.avgMonthlyElectricityKWh * 0.32),
        expectedWaterLiters: Math.round(institutionInfo.avgDailyWaterLiters * 0.28),
        notes: 'Moderate baseline.',
      },
      {
        id: 'b-3',
        name: 'Utility & Services Hub',
        type: 'Utilities & Logistics',
        areaSqFt: 18000,
        floors: 2,
        occupancy: 120,
        majorEquipment: 'Pumps, Transformers, Compressors',
        monthlyElectricityKWh: Math.round(institutionInfo.avgMonthlyElectricityKWh * 0.25),
        dailyWaterLiters: Math.round(institutionInfo.avgDailyWaterLiters * 0.35),
        expectedElectricityKWh: Math.round(institutionInfo.avgMonthlyElectricityKWh * 0.26),
        expectedWaterLiters: Math.round(institutionInfo.avgDailyWaterLiters * 0.34),
        notes: 'Pumping and auxiliary operations.',
      },
    ];
  });

  const handleUpdateBuilding = (id: string, field: keyof Building, value: any) => {
    setBuildings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleAddBuilding = () => {
    const nextIdx = buildings.length + 1;
    const newB: Building = {
      id: `b-${Date.now()}`,
      name: `Block ${String.fromCharCode(64 + nextIdx)}`,
      type: 'Multi-purpose Zone',
      areaSqFt: 25000,
      floors: 3,
      occupancy: 300,
      majorEquipment: 'Split ACs, Lighting Grid',
      monthlyElectricityKWh: 4500,
      dailyWaterLiters: 6000,
      expectedElectricityKWh: 5000,
      expectedWaterLiters: 6500,
      notes: '',
    };
    setBuildings((prev) => [...prev, newB]);
  };

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDeleteBuilding = (id: string) => {
    if (buildings.length <= 1) {
      setValidationError('Your institution must have at least one building or zone.');
      return;
    }
    setValidationError(null);
    setBuildings((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (buildings.length === 0) {
      setValidationError('Please configure at least one building.');
      return;
    }
    setValidationError(null);
    onSubmit(buildings);
  };

  const totalCalculatedEnergy = buildings.reduce((acc, b) => acc + (b.monthlyElectricityKWh || 0), 0);
  const totalCalculatedWater = buildings.reduce((acc, b) => acc + (b.dailyWaterLiters || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020718] via-[#071738] to-[#020512] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-blue-900/40 bg-[#06122d]/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Institution Details
          </button>
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Step 2 of 4</span>
            <h2 className="text-sm font-bold text-white">Configure Facility Zones</h2>
          </div>
          <div className="text-xs text-slate-400">
            {buildings.length} Zones Configured
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              {institutionInfo.name} ({institutionInfo.type})
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Configure Your Facility
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Define the individual blocks, zones, and wings. Granular building data enables accurate AI anomaly detection and saving opportunities.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddBuilding}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Add Building / Zone
          </button>
        </div>

        {/* Real-time sum indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block">Total Zones</span>
            <span className="text-base font-bold text-white">{buildings.length}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Total Footprint</span>
            <span className="text-base font-bold text-white">
              {buildings.reduce((acc, b) => acc + (b.areaSqFt || 0), 0).toLocaleString()} sq ft
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Summed Energy</span>
            <span className="text-base font-bold text-emerald-400">
              {totalCalculatedEnergy.toLocaleString()} kWh/mo
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Summed Water</span>
            <span className="text-base font-bold text-sky-400">
              {totalCalculatedWater.toLocaleString()} L/day
            </span>
          </div>
        </div>

        {validationError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center justify-between">
            <span>{validationError}</span>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-rose-400 font-bold hover:underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Building Cards Form List */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {buildings.map((building, index) => (
              <div
                key={building.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-700">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={building.name}
                      onChange={(e) => handleUpdateBuilding(building.id, 'name', e.target.value)}
                      placeholder="e.g. Block A, Library, Hostel..."
                      className="text-base font-bold text-white bg-transparent border-b border-dashed border-slate-700 focus:border-emerald-500 focus:outline-none px-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={building.type}
                      onChange={(e) => handleUpdateBuilding(building.id, 'type', e.target.value)}
                      placeholder="Zone type (e.g. Academic, Lab, Hostel)"
                      className="text-xs bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteBuilding(building.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Remove building"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Area (sq ft)</label>
                    <input
                      type="number"
                      min="500"
                      value={building.areaSqFt}
                      onChange={(e) => handleUpdateBuilding(building.id, 'areaSqFt', parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Floors</label>
                    <input
                      type="number"
                      min="1"
                      value={building.floors}
                      onChange={(e) => handleUpdateBuilding(building.id, 'floors', parseInt(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Occupancy</label>
                    <input
                      type="number"
                      min="0"
                      value={building.occupancy}
                      onChange={(e) => handleUpdateBuilding(building.id, 'occupancy', parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Monthly Power (kWh)</label>
                    <input
                      type="number"
                      min="0"
                      value={building.monthlyElectricityKWh}
                      onChange={(e) => handleUpdateBuilding(building.id, 'monthlyElectricityKWh', parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-emerald-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Expected (Baseline)</label>
                    <input
                      type="number"
                      min="0"
                      value={building.expectedElectricityKWh}
                      onChange={(e) => handleUpdateBuilding(building.id, 'expectedElectricityKWh', parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Daily Water (L/day)</label>
                    <input
                      type="number"
                      min="0"
                      value={building.dailyWaterLiters}
                      onChange={(e) => handleUpdateBuilding(building.id, 'dailyWaterLiters', parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-sky-400 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Major Equipment / Loads</label>
                    <input
                      type="text"
                      value={building.majorEquipment}
                      onChange={(e) => handleUpdateBuilding(building.id, 'majorEquipment', e.target.value)}
                      placeholder="e.g. 35 Split ACs, Fume Hoods, Geysers..."
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Operational Notes / Special Conditions</label>
                    <input
                      type="text"
                      value={building.notes || ''}
                      onChange={(e) => handleUpdateBuilding(building.id, 'notes', e.target.value)}
                      placeholder="e.g. Higher summer load, rooftop solar planned..."
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              Back
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold rounded-lg shadow-lg shadow-emerald-500/20 transition-all hover:translate-x-0.5"
            >
              <span>Next: Resource Monitoring Selection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

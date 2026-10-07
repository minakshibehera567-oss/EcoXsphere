import React, { useState } from 'react';
import { ResourceType } from '../types/institution';
import { RESOURCE_MODULES } from '../data/initialInstitutions';
import { ArrowLeft, ArrowRight, Check, Zap, Droplets, Trash2, Wind, Car, Cpu, Compass, CloudRain, Sun, ShieldAlert, Sparkles } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5 text-amber-400" />,
  Droplets: <Droplets className="w-5 h-5 text-sky-400" />,
  Trash2: <Trash2 className="w-5 h-5 text-emerald-400" />,
  Wind: <Wind className="w-5 h-5 text-teal-400" />,
  Car: <Car className="w-5 h-5 text-indigo-400" />,
  Cpu: <Cpu className="w-5 h-5 text-purple-400" />,
  Compass: <Compass className="w-5 h-5 text-rose-400" />,
  CloudRain: <CloudRain className="w-5 h-5 text-cyan-400" />,
  Sun: <Sun className="w-5 h-5 text-yellow-400" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-red-400" />,
};

interface ResourceConfigurationProps {
  institutionName: string;
  onBack: () => void;
  onSubmit: (selectedResources: ResourceType[]) => void;
}

export const ResourceConfiguration: React.FC<ResourceConfigurationProps> = ({
  institutionName,
  onBack,
  onSubmit,
}) => {
  // Default selected resources matching typical college benchmark: Electricity, Water, Waste, Air Quality, Parking
  const [selected, setSelected] = useState<ResourceType[]>([
    'electricity',
    'water',
    'waste',
    'airQuality',
    'parking',
  ]);

  const toggleResource = (id: ResourceType) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(RESOURCE_MODULES.map((m) => m.id));
  };

  const selectCoreOnly = () => {
    setSelected(['electricity', 'water', 'waste', 'airQuality', 'parking']);
  };

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      setValidationError('Please select at least one resource module to monitor.');
      return;
    }
    setValidationError(null);
    onSubmit(selected);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020718] via-[#071738] to-[#020512] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-blue-900/40 bg-[#06122d]/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Facility Zones
          </button>
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Step 3 of 4</span>
            <h2 className="text-sm font-bold text-white">Select Resource Modules</h2>
          </div>
          <div className="text-xs text-slate-400">
            {selected.length} / {RESOURCE_MODULES.length} Selected
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              {institutionName}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Which Resources Do You Want to Monitor?
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Your generated dashboard will customize its intelligence engine and visual views exclusively around the modules you activate.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={selectCoreOnly}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            >
              Recommended Core (5)
            </button>
            <button
              type="button"
              onClick={selectAll}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            >
              Select All (10)
            </button>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {RESOURCE_MODULES.map((module) => {
              const isChecked = selected.includes(module.id);
              return (
                <div
                  key={module.id}
                  onClick={() => toggleResource(module.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex items-start space-x-3.5 ${
                    isChecked
                      ? 'bg-slate-900 border-emerald-500/60 shadow-md shadow-emerald-950/20'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-slate-800/80">
                          {ICON_MAP[module.icon] || <Zap className="w-4 h-4 text-emerald-400" />}
                        </span>
                        <h3 className="font-semibold text-white text-sm">{module.label}</h3>
                      </div>
                      <span className="text-xs text-slate-500">{module.unit}</span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>
              );
            })}
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
              <span>Next: Connect Data Sources</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

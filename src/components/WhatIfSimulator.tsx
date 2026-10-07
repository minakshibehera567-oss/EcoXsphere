import React, { useState } from 'react';
import { Institution, WhatIfSimulationInput, WhatIfSimulationResult } from '../types/institution';
import { runSimulation } from '../services/api';
import { runWhatIfSimulation } from '../services/syntheticEngine';
import { Sparkles, Sliders, Zap, Droplets, TrendingDown, IndianRupee, ShieldCheck, Leaf, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';

interface WhatIfSimulatorProps {
  institution: Institution;
  onApplyPlan?: (result: WhatIfSimulationResult) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ institution, onApplyPlan }) => {
  const [inputs, setInputs] = useState<WhatIfSimulationInput>({
    acReductionPercent: 10,
    solarCapacityKW: 0,
    greywaterRecyclingPercent: 0,
    smartBinRouteOptimization: true,
    ledRetrofitPercent: 20,
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<WhatIfSimulationResult>(() =>
    runWhatIfSimulation(institution, {
      acReductionPercent: 10,
      solarCapacityKW: 0,
      greywaterRecyclingPercent: 0,
      smartBinRouteOptimization: true,
      ledRetrofitPercent: 20,
    })
  );

  const handleInputChange = (field: keyof WhatIfSimulationInput, value: any) => {
    const updated = { ...inputs, [field]: value };
    setInputs(updated);
    // Instant local calculation
    setResult(runWhatIfSimulation(institution, updated));
  };

  const handleTriggerDeepSim = async () => {
    setIsSimulating(true);
    try {
      const res = await runSimulation(institution, inputs);
      setResult(res);
    } catch (e) {
      setResult(runWhatIfSimulation(institution, inputs));
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePreset = (type: 'mild' | 'moderate' | 'aggressive') => {
    let next: WhatIfSimulationInput;
    if (type === 'mild') {
      next = {
        acReductionPercent: 5,
        solarCapacityKW: 25,
        greywaterRecyclingPercent: 15,
        smartBinRouteOptimization: true,
        ledRetrofitPercent: 30,
      };
    } else if (type === 'moderate') {
      next = {
        acReductionPercent: 10,
        solarCapacityKW: 50,
        greywaterRecyclingPercent: 35,
        smartBinRouteOptimization: true,
        ledRetrofitPercent: 60,
      };
    } else {
      next = {
        acReductionPercent: 20,
        solarCapacityKW: 120,
        greywaterRecyclingPercent: 50,
        smartBinRouteOptimization: true,
        ledRetrofitPercent: 100,
      };
    }
    setInputs(next);
    setResult(runWhatIfSimulation(institution, next));
  };

  return (
    <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-6 space-y-6 shadow-xl shadow-blue-950/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Institutional What-If Simulation</h3>
          </div>
          <p className="text-xs text-slate-400">
            Model facility schedule changes, rooftop solar additions, and greywater recycling calibrated specifically for <strong className="text-slate-200">{institution.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-500 hidden sm:inline">Presets:</span>
          <button
            onClick={() => handlePreset('mild')}
            className="px-2.5 py-1 bg-[#050f24] hover:bg-[#0c1f46] text-slate-300 border border-blue-900/40 rounded-lg transition-colors"
          >
            Light Setback
          </button>
          <button
            onClick={() => handlePreset('moderate')}
            className="px-2.5 py-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 rounded-lg transition-colors font-medium"
          >
            Recommended Plan
          </button>
          <button
            onClick={() => handlePreset('aggressive')}
            className="px-2.5 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-lg transition-colors font-medium"
          >
            Aggressive Net-Zero
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-[#050f24] border border-blue-900/40 p-5 rounded-xl">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            Simulation Levers
          </h4>

          {/* Slider 1: AC reduction */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Reduce AC Schedule & Temperature</span>
              <span className="font-mono text-emerald-400 font-bold">{inputs.acReductionPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={inputs.acReductionPercent}
              onChange={(e) => handleInputChange('acReductionPercent', parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (As-is)</span>
              <span>10% (Prompt Default)</span>
              <span>40% (Aggressive)</span>
            </div>
          </div>

          {/* Slider 2: Rooftop Solar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Rooftop Solar PV Installation</span>
              <span className="font-mono text-amber-400 font-bold">{inputs.solarCapacityKW} kW</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={inputs.solarCapacityKW}
              onChange={(e) => handleInputChange('solarCapacityKW', parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 kW</span>
              <span>50 kW (Block A roof)</span>
              <span>200 kW (All blocks)</span>
            </div>
          </div>

          {/* Slider 3: Greywater Recycling */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Hostel Greywater Recycling</span>
              <span className="font-mono text-sky-400 font-bold">{inputs.greywaterRecyclingPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={inputs.greywaterRecyclingPercent}
              onChange={(e) => handleInputChange('greywaterRecyclingPercent', parseInt(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (None)</span>
              <span>30% (Flush reuse)</span>
              <span>60% (STP + Irrigation)</span>
            </div>
          </div>

          {/* Slider 4: LED Retrofit */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">High-Efficiency LED Lighting Retrofit</span>
              <span className="font-mono text-teal-400 font-bold">{inputs.ledRetrofitPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={inputs.ledRetrofitPercent}
              onChange={(e) => handleInputChange('ledRetrofitPercent', parseInt(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Toggle: Smart Bin Route Optimization */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-300 font-medium block">Smart Bin Route Optimization</span>
              <span className="text-slate-500 text-[11px]">Dynamic janitorial alerts prevent 65% overflow</span>
            </div>
            <input
              type="checkbox"
              checked={inputs.smartBinRouteOptimization}
              onChange={(e) => handleInputChange('smartBinRouteOptimization', e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleTriggerDeepSim}
              disabled={isSimulating}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {isSimulating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isSimulating ? 'Consulting Gemini Model...' : 'Run Deep AI Commentary'}</span>
            </button>
          </div>
        </div>

        {/* Results Visual Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Metric Savings Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Monthly Power Saved
              </span>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {result.monthlyEnergySavedKWh.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">kWh</span>
              </div>
              <span className="text-xs text-emerald-400/90 font-medium">
                {result.energySavingPercent}% load reduction
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Estimated Utility Cost Saving
              </span>
              <div className="text-xl font-bold text-amber-400 font-mono">
                ₹{result.monthlyCostSavingINR.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
              </div>
              <span className="text-xs text-slate-400">
                ~₹{(result.monthlyCostSavingINR * 12).toLocaleString()}/year
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Carbon Reduction
              </span>
              <div className="text-xl font-bold text-teal-400 font-mono">
                {result.carbonReductionTons}
                <span className="text-xs font-normal text-slate-400 ml-1">Tons CO₂e</span>
              </div>
              <span className="text-xs text-slate-400">
                Scope 2 offset
              </span>
            </div>
          </div>

          {/* Visual Before vs After Energy Comparison */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-3">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Visual Before vs After Comparison
            </h5>

            {/* Current Energy */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Monthly Consumption</span>
                <span className="font-mono text-slate-200 font-bold">{result.currentMonthlyEnergyKWh.toLocaleString()} kWh</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full w-full" />
              </div>
            </div>

            {/* Simulated Energy */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium">Estimated New Consumption</span>
                <span className="font-mono text-emerald-400 font-bold">{result.simulatedMonthlyEnergyKWh.toLocaleString()} kWh</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (result.simulatedMonthlyEnergyKWh / (result.currentMonthlyEnergyKWh || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Sustainability Score Delta */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
              <span className="text-slate-300">Projected Sustainability Score Impact:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono">{institution.sustainabilityScore.overall}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  {result.simulatedSustainabilityScore}/100
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 rounded">
                  +{result.scoreDelta} pts
                </span>
              </div>
            </div>
          </div>

          {/* AI Assessment Box */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs">
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              AI Engineering Projection
            </span>
            <p className="text-slate-300 leading-relaxed">
              {result.aiAssessment}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

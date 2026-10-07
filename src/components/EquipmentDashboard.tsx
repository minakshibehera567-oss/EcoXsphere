import React, { useState } from 'react';
import { Institution, EquipmentAnalytics, EquipmentItem } from '../types/institution';
import {
  Cpu,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Wrench,
  Flame,
  Zap,
  Gauge,
  Thermometer,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface EquipmentDashboardProps {
  institution: Institution;
}

export const EquipmentDashboard: React.FC<EquipmentDashboardProps> = ({ institution }) => {
  const [dispatchedIds, setDispatchedIds] = useState<string[]>([]);

  const equip: EquipmentAnalytics = institution.equipmentAnalytics || {
    totalCount: 6,
    healthyCount: 5,
    warningCount: 1,
    criticalCount: 0,
    overallHealthScore: 89,
    uptimePercent: 99.4,
    preventiveAlertsCount: 1,
    items: [
      {
        id: 'eq-chiller-1',
        name: 'HVAC Central Water-Cooled Chiller #1',
        category: 'chiller',
        location: 'Central Utility Plant Basement',
        healthScore: 94,
        status: 'healthy',
        runHoursTotal: 4820,
        vibrationMmSec: 1.8,
        tempC: 44.2,
        loadPercent: 78,
        nextMaintenanceDue: 'In 45 days',
      },
      {
        id: 'eq-chiller-2',
        name: 'HVAC Variable Speed Chiller #2',
        category: 'chiller',
        location: 'Block B Plant Room',
        healthScore: 78,
        status: 'warning',
        runHoursTotal: 6240,
        vibrationMmSec: 4.6,
        tempC: 56.8,
        loadPercent: 88,
        nextMaintenanceDue: 'In 6 days',
        aiAnomaly: 'Bearing vibration frequency spike detected in compressor shaft (4.6 mm/s vs 2.5 mm/s baseline).',
      },
      {
        id: 'eq-dg-1',
        name: 'Standby Diesel Generator Set (1000 kVA)',
        category: 'generator',
        location: 'Substation Yard',
        healthScore: 98,
        status: 'healthy',
        runHoursTotal: 310,
        vibrationMmSec: 1.2,
        tempC: 28.0,
        loadPercent: 0,
        nextMaintenanceDue: 'In 90 days',
      },
      {
        id: 'eq-pump-main',
        name: 'Main Hydro-Pneumatic Domestic Water Pump',
        category: 'pump',
        location: 'Pumping Station',
        healthScore: 89,
        status: 'healthy',
        runHoursTotal: 3410,
        vibrationMmSec: 2.1,
        tempC: 38.5,
        loadPercent: 65,
        nextMaintenanceDue: 'In 28 days',
      },
      {
        id: 'eq-trans-1',
        name: '11kV / 415V Step-Down Oil Transformer',
        category: 'transformer',
        location: 'Main Substation',
        healthScore: 92,
        status: 'healthy',
        runHoursTotal: 14200,
        vibrationMmSec: 0.9,
        tempC: 52.0,
        loadPercent: 72,
        nextMaintenanceDue: 'In 60 days',
      },
      {
        id: 'eq-lift-1',
        name: 'Academic Tower High-Speed Elevator #1',
        category: 'elevator',
        location: 'Block A Core',
        healthScore: 86,
        status: 'healthy',
        runHoursTotal: 5120,
        vibrationMmSec: 1.4,
        tempC: 32.1,
        loadPercent: 55,
        nextMaintenanceDue: 'In 18 days',
      },
    ],
    aiInsight: 'Chiller #2 in Block B exhibits elevated shaft vibration (4.6 mm/s). Preventive bearing lubrication scheduled to prevent unplanned shutdown.',
  };

  const handleDispatch = (id: string) => {
    setDispatchedIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#071530]/80 border border-blue-900/40 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Equipment & Predictive Maintenance Telemetry</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  Modbus & Vibration FFT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Vibration analysis, thermal imaging anomalies, chiller load profiling, and automated preventive maintenance dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Fleet Health Score</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{equip.overallHealthScore}/100</span>
            </div>
            <div className="text-right border-l border-blue-900/50 pl-3">
              <span className="text-[11px] text-slate-400 block">Fleet Uptime</span>
              <span className="text-xl font-black text-sky-400 font-mono">{equip.uptimePercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Total Machines</span>
          <div className="text-3xl font-black text-white font-mono my-2">{equip.totalCount}</div>
          <span className="text-[11px] text-slate-400">Critical infrastructure</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Optimal Condition</span>
          <div className="text-3xl font-black text-emerald-400 font-mono my-2">{equip.healthyCount}</div>
          <span className="text-[11px] text-emerald-300 font-semibold">Operating in green band</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Advisory / Warning</span>
          <div className="text-3xl font-black text-amber-400 font-mono my-2">{equip.warningCount}</div>
          <span className="text-[11px] text-amber-300 font-semibold">Service due soon</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Critical Downtime Risk</span>
          <div className="text-3xl font-black text-rose-400 font-mono my-2">{equip.criticalCount}</div>
          <span className="text-[11px] text-slate-400">Zero active downtime</span>
        </div>
      </div>

      {/* AI Anomaly Alert Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#181d3d] to-[#040e25] border border-amber-500/30 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 text-xs">
          <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">AI Predictive Maintenance Advisory</span>
          <p className="text-slate-200 mt-1 leading-relaxed">{equip.aiInsight}</p>
        </div>
      </div>

      {/* Equipment List Grid */}
      <div className="bg-[#071530]/80 border border-blue-900/40 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Critical Machinery Telemetry Matrix</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equip.items.map((item) => {
            const isDispatched = dispatchedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl bg-[#051026] border transition-all ${
                  item.status === 'warning'
                    ? 'border-amber-500/50 bg-amber-950/10'
                    : 'border-blue-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">{item.name}</h4>
                    <span className="text-[10px] text-slate-400">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === 'healthy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      Score: {item.healthScore}/100
                    </span>
                  </div>
                </div>

                {item.aiAnomaly && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-amber-900/20 border border-amber-500/30 text-[11px] text-amber-200">
                    <div className="flex items-center gap-1 font-semibold text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>Predictive Anomaly Detected:</span>
                    </div>
                    <p className="mt-0.5 text-slate-300">{item.aiAnomaly}</p>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 my-3 text-center bg-[#071738] p-2.5 rounded-lg border border-blue-900/30 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Vibration</span>
                    <span
                      className={`font-mono font-bold ${
                        item.vibrationMmSec > 3.0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.vibrationMmSec} mm/s
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Temp</span>
                    <span className="font-mono font-bold text-slate-200">{item.tempC}°C</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Load</span>
                    <span className="font-mono font-bold text-sky-300">{item.loadPercent}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Hours</span>
                    <span className="font-mono font-bold text-slate-200">{item.runHoursTotal}h</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 text-[11px]">
                    Maintenance: <strong className="text-slate-200">{item.nextMaintenanceDue}</strong>
                  </span>

                  {item.status === 'warning' && (
                    <button
                      onClick={() => handleDispatch(item.id)}
                      disabled={isDispatched}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        isDispatched
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                      }`}
                    >
                      <Wrench className="w-3 h-3" />
                      <span>{isDispatched ? 'Crew Dispatched' : 'Dispatch Maintenance'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

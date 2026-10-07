import React, { useState } from 'react';
import { Institution, SafetyAnalytics } from '../types/institution';
import {
  ShieldAlert,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Camera,
  DoorOpen,
  Users,
  Activity,
  Bell,
  Volume2,
} from 'lucide-react';

interface SafetyDashboardProps {
  institution: Institution;
}

export const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ institution }) => {
  const [testDrillActive, setTestDrillActive] = useState(false);

  const safe: SafetyAnalytics = institution.safetyAnalytics || {
    complianceScore: 96,
    fireHydrantsTotal: 28,
    fireHydrantsNormalCount: 28,
    avgWaterPressurePsi: 64.2,
    emergencyExitsClearPercent: 100,
    musterPointHeadcount: 0,
    cctvCoveragePercent: 98.4,
    activeSensorsCount: 84,
    gasDetectorStatus: 'All Clear',
    recentIncidents: [
      {
        id: 'inc-1',
        title: 'Routine Fire Suppression Pressure Test Completed',
        location: 'Block A & B Hydrant Ring',
        severity: 'low',
        time: 'Today 09:15 AM',
        status: 'resolved',
      },
      {
        id: 'inc-2',
        title: 'Emergency Exit Corridor Clearance Verified',
        location: 'Central Library Ground Floor',
        severity: 'low',
        time: 'Yesterday 04:30 PM',
        status: 'resolved',
      },
    ],
    aiInsight: 'All 28 fire hydrants maintain optimal hydraulic head (64.2 PSI). All emergency exits are 100% unobstructed with zero active hazardous warnings.',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#071530]/80 border border-blue-900/40 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Facility Safety, Fire Suppression & Emergency Readiness</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  NFPA & OSHA Standards
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Fire ring line pressure telemetry, emergency exit egress clearance, muster point headcounts, and hazardous gas monitoring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTestDrillActive(!testDrillActive)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
                testDrillActive
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30'
                  : 'bg-[#0a1e45] text-slate-300 hover:text-white border-blue-800/60 hover:bg-[#102d64]'
              }`}
            >
              <Bell className="w-4 h-4 text-rose-400" />
              <span>{testDrillActive ? 'Test Drill Alarm Active' : 'Run Simulated Evacuation Drill'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Safety Audit Score</span>
          <div className="text-3xl font-black text-emerald-400 font-mono my-2">{safe.complianceScore}/100</div>
          <span className="text-[11px] text-emerald-300 font-semibold">Tier-1 Regulatory Grade</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Hydrant Pressure</span>
          <div className="text-3xl font-black text-sky-400 font-mono my-2">
            {safe.avgWaterPressurePsi} <span className="text-xs text-slate-400 font-sans">PSI</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">
            {safe.fireHydrantsNormalCount}/{safe.fireHydrantsTotal} Hydrants Ready
          </span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Exit Corridors Clear</span>
          <div className="text-3xl font-black text-emerald-400 font-mono my-2">{safe.emergencyExitsClearPercent}%</div>
          <span className="text-[11px] text-emerald-300 font-semibold">All paths unobstructed</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">CCTV Stream AI Health</span>
          <div className="text-3xl font-black text-indigo-400 font-mono my-2">{safe.cctvCoveragePercent}%</div>
          <span className="text-[11px] text-slate-400">{safe.activeSensorsCount} IoT detectors online</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 col-span-2 sm:col-span-1">
          <span className="text-slate-400 text-xs">Air Toxics / Gas Sensors</span>
          <div className="text-2xl font-black text-emerald-400 font-mono my-2">{safe.gasDetectorStatus}</div>
          <span className="text-[11px] text-emerald-300 font-semibold">Zero hazardous vapor</span>
        </div>
      </div>

      {/* AI Safety Insight */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#0a1f42] to-[#040e25] border border-emerald-500/30 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 text-xs">
          <span className="font-bold text-emerald-300 uppercase tracking-wider text-[10px]">AI Safety & Emergency Audit</span>
          <p className="text-slate-200 mt-1 leading-relaxed">{safe.aiInsight}</p>
        </div>
      </div>

      {/* Safety Incident & Audit Log */}
      <div className="bg-[#071530]/80 border border-blue-900/40 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Facility Safety Verification Log</h3>

        <div className="space-y-2.5">
          {safe.recentIncidents.map((inc) => (
            <div
              key={inc.id}
              className="p-3.5 rounded-xl bg-[#051026] border border-blue-900/40 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">{inc.title}</h4>
                  <span className="text-[11px] text-slate-400">{inc.location}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-emerald-400 font-semibold uppercase">{inc.status}</span>
                <span className="text-[10px] text-slate-500 block font-mono">{inc.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

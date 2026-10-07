import React from 'react';
import { Institution, TrafficAnalytics } from '../types/institution';
import {
  Compass,
  Sparkles,
  Car,
  Bus,
  Gauge,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface TrafficDashboardProps {
  institution: Institution;
}

export const TrafficDashboard: React.FC<TrafficDashboardProps> = ({ institution }) => {
  const traf: TrafficAnalytics = institution.trafficAnalytics || {
    vehiclesPerHour: 142,
    internalTransitBusesActive: 4,
    avgSpeedKmH: 18.5,
    speedLimitKmH: 25,
    congestionIndex: 'low',
    peakGateQueueMins: 3.2,
    bottleneckLocation: 'South Gate Roundabout during morning class change (09:45 AM)',
    pedestrianPeakHour: '12:45 PM - 01:30 PM (Canteen corridor)',
    dailyVehicleFootfall: 920,
    aiInsight: 'Internal vehicle flow is smooth with zero speed-limit violations. Automated gate boom-barriers maintain under 3.5 minutes queue time.',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#071530]/80 border border-blue-900/40 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Campus Traffic, Transit & Internal Mobility</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  Radar Speed & Barrier Vision
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking of internal arterial vehicle speeds, shuttle loops, pedestrian crowd densities, and gate queue throughput.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#051126] border border-blue-900/50 px-3.5 py-2 rounded-xl">
            <Car className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-xs font-bold text-white block">Congestion: {traf.congestionIndex.toUpperCase()}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Free Flow Arterials</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Vehicle Flow Rate</span>
          <div className="text-3xl font-black text-white font-mono my-2">{traf.vehiclesPerHour} <span className="text-xs text-slate-400 font-sans">veh/hr</span></div>
          <span className="text-[11px] text-slate-400">Daily: {traf.dailyVehicleFootfall}</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Campus Transit Shuttles</span>
          <div className="text-3xl font-black text-cyan-400 font-mono my-2">{traf.internalTransitBusesActive} <span className="text-xs text-slate-400 font-sans">Active</span></div>
          <span className="text-[11px] text-emerald-400 font-semibold">100% on scheduled loops</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Average Speed</span>
          <div className="text-3xl font-black text-emerald-400 font-mono my-2">{traf.avgSpeedKmH} <span className="text-xs text-slate-400 font-sans">km/h</span></div>
          <span className="text-[11px] text-slate-400">Limit: {traf.speedLimitKmH} km/h</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Gate Queue Time</span>
          <div className="text-3xl font-black text-sky-400 font-mono my-2">{traf.peakGateQueueMins} <span className="text-xs text-slate-400 font-sans">mins</span></div>
          <span className="text-[11px] text-emerald-400 font-semibold">Under target &lt; 5 mins</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 col-span-2 sm:col-span-1">
          <span className="text-slate-400 text-xs">Speed Violations</span>
          <div className="text-3xl font-black text-emerald-400 font-mono my-2">0</div>
          <span className="text-[11px] text-emerald-300 font-semibold">100% Compliance</span>
        </div>
      </div>

      {/* AI Traffic Insight */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-[#0a1e42] to-[#040e25] border border-cyan-500/30 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 text-xs">
          <span className="font-bold text-cyan-300 uppercase tracking-wider text-[10px]">AI Traffic & Mobility Pattern Analysis</span>
          <p className="text-slate-200 mt-1 leading-relaxed">{traf.aiInsight}</p>
        </div>
      </div>

      {/* Bottlenecks and Pedestrian Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#051026] border border-blue-900/40">
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="font-bold text-xs uppercase tracking-wider">Identified Vehicular Bottleneck</h4>
          </div>
          <p className="text-xs text-white font-medium">{traf.bottleneckLocation}</p>
          <span className="text-[11px] text-slate-400 mt-2 block">
            AI Automated traffic signal offsets active to clear queues within 90 seconds.
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#051026] border border-blue-900/40">
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <Users className="w-4 h-4" />
            <h4 className="font-bold text-xs uppercase tracking-wider">Peak Pedestrian Footfall Corridor</h4>
          </div>
          <p className="text-xs text-white font-medium">{traf.pedestrianPeakHour}</p>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Pedestrian crossing safety beacons flash during shift changes and lecture transitions.
          </span>
        </div>
      </div>
    </div>
  );
};

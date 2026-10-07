import React, { useState } from 'react';
import { Institution, WaterTank } from '../types/institution';
import {
  Droplets,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Building,
  Info,
  Bell,
  Volume2,
  VolumeX,
  Power,
  RotateCw,
  Send,
  ShieldAlert,
  ArrowDownCircle,
  Siren,
  ShieldCheck,
  Radio,
  Map,
} from 'lucide-react';

interface WaterDashboardProps {
  institution: Institution;
  onUpdateTanks?: (updatedTanks: WaterTank[]) => void;
  onOpenEstateMap?: () => void;
}

export const WaterDashboard: React.FC<WaterDashboardProps> = ({
  institution,
  onUpdateTanks,
  onOpenEstateMap,
}) => {
  const { waterAnalytics, metrics } = institution;
  const [tanks, setTanks] = useState<WaterTank[]>(waterAnalytics.tanks || []);
  const [audioAlertEnabled, setAudioAlertEnabled] = useState(true);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [autoCutoffEnabled, setAutoCutoffEnabled] = useState(true);
  const [alertLogs, setAlertLogs] = useState<Array<{ id: string; time: string; message: string; type: 'alert' | 'success' | 'action' }>>([
    {
      id: 'log-init',
      time: '10:00 AM',
      message: 'Ultrasonic float telemetry online across all campus overhead tanks.',
      type: 'success',
    },
  ]);

  // Play alert beep using Web AudioContext when audio is active
  const playAlertSound = (freq = 880) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.setValueAtTime(freq * 1.5, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn('AudioContext alert unavailable:', e);
    }
  };

  const handleToggleSound = () => {
    const next = !audioAlertEnabled;
    setAudioAlertEnabled(next);
    if (next) {
      playAlertSound(750);
      setActionToast('Audio alert siren enabled. System will emit acoustic warning pulse on full tank events.');
      setTimeout(() => setActionToast(null), 3000);
    }
  };

  // Critical tank full alerts (95%+ or marked full_alert / overflow_risk)
  const fullTanks = tanks.filter(
    (t) => t.status === 'full_alert' || t.status === 'overflow_risk' || t.fillPercent >= 95
  );

  const addLog = (message: string, type: 'alert' | 'success' | 'action') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAlertLogs((prev) => [{ id: `log-${Date.now()}`, time, message, type }, ...prev.slice(0, 9)]);
  };

  // Emergency auto-cutoff pump handler
  const handleCutoffPump = (tankId: string) => {
    const target = tanks.find((t) => t.id === tankId);
    const updated = tanks.map((t) => {
      if (t.id === tankId) {
        return {
          ...t,
          pumpStatus: 'AUTO_CUTOFF' as const,
          inflowRateLitersPerMin: 0,
          status: 'full_alert' as const,
          lastAutoShutoff: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return t;
    });

    setTanks(updated);
    if (onUpdateTanks) onUpdateTanks(updated);

    addLog(`Automated Cutoff: Inflow pump stopped for ${target?.name || 'Water Tank'}. Inflow at 0 L/min.`, 'action');
    setActionToast(`Automated Cutoff Engaged: Inflow pump for ${target?.name} stopped. Inflow rate dropped to 0 L/min.`);
    setTimeout(() => setActionToast(null), 4000);
  };

  // Emergency drain or valve divert
  const handleDrainWater = (tankId: string) => {
    const target = tanks.find((t) => t.id === tankId);
    const updated = tanks.map((t) => {
      if (t.id === tankId) {
        const newLevel = Math.max(0, t.currentLevelLiters - 3000);
        const newFill = Math.round((newLevel / t.capacityLiters) * 100);
        return {
          ...t,
          currentLevelLiters: newLevel,
          fillPercent: newFill,
          pumpStatus: 'OFF' as const,
          inflowRateLitersPerMin: 0,
          status: newFill >= 95 ? ('full_alert' as const) : ('normal' as const),
        };
      }
      return t;
    });

    setTanks(updated);
    if (onUpdateTanks) onUpdateTanks(updated);

    addLog(`Sluice Divert: 3,000 Liters diverted from ${target?.name || 'Water Tank'} to underground emergency sump.`, 'action');
    setActionToast(`Secondary drain valve opened for ${target?.name}. 3,000 Liters diverted to central sump.`);
    setTimeout(() => setActionToast(null), 4000);
  };

  // Toggle pump manually
  const handleTogglePump = (tankId: string) => {
    const updated = tanks.map((t) => {
      if (t.id === tankId) {
        const nextState = t.pumpStatus === 'ON' ? ('OFF' as const) : ('ON' as const);
        const inflow = nextState === 'ON' ? 120 : 0;
        const isOverflow = t.fillPercent >= 95 && nextState === 'ON';
        return {
          ...t,
          pumpStatus: nextState,
          inflowRateLitersPerMin: inflow,
          status: isOverflow
            ? ('overflow_risk' as const)
            : t.fillPercent >= 95
            ? ('full_alert' as const)
            : nextState === 'ON'
            ? ('filling' as const)
            : ('normal' as const),
        };
      }
      return t;
    });

    setTanks(updated);
    if (onUpdateTanks) onUpdateTanks(updated);
  };

  // Test Simulation Trigger: Sets Tank 1 to 99% full with pump ON to trigger full alert system
  const handleTriggerTestAlert = () => {
    if (tanks.length === 0) return;
    const targetId = tanks[0].id;
    const updated = tanks.map((t, idx) => {
      if (idx === 0) {
        return {
          ...t,
          currentLevelLiters: Math.round(t.capacityLiters * 0.99),
          fillPercent: 99,
          pumpStatus: 'ON' as const,
          inflowRateLitersPerMin: 140,
          status: 'overflow_risk' as const,
          timeToFullMinutes: 2,
        };
      }
      return t;
    });

    setTanks(updated);
    if (onUpdateTanks) onUpdateTanks(updated);

    if (audioAlertEnabled) {
      playAlertSound(960);
      setTimeout(() => playAlertSound(1100), 160);
    }

    addLog(`TEST SIMULATION TRIGGERED: ${updated[0].name} set to 99% capacity with pump active! Full Alert initiated.`, 'alert');
    setActionToast(`🚨 SIMULATED ALERT: ${updated[0].name} reached 99% capacity! Overflow alarm & auto-cutoff triggered.`);
    setTimeout(() => setActionToast(null), 4000);
  };

  // Reset tanks to nominal safe capacities
  const handleResetTanks = () => {
    const updated = tanks.map((t, idx) => ({
      ...t,
      currentLevelLiters: Math.round(t.capacityLiters * (0.60 + idx * 0.05)),
      fillPercent: Math.round(60 + idx * 5),
      pumpStatus: 'OFF' as const,
      inflowRateLitersPerMin: 0,
      status: 'normal' as const,
    }));

    setTanks(updated);
    if (onUpdateTanks) onUpdateTanks(updated);

    addLog('All water tanks reset to normal storage capacity (60%-75% safe fill).', 'success');
    setActionToast('All water tanks reset to normal baseline storage levels.');
    setTimeout(() => setActionToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionToast && (
        <div className="p-3 bg-blue-500 text-slate-950 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xl shadow-blue-950/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionToast}</span>
          </div>
          <button
            onClick={() => setActionToast(null)}
            className="text-slate-900 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* CRITICAL WATER TANK FULL ALERT BANNER */}
      {fullTanks.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-rose-950/80 via-rose-900/60 to-[#0c183a] border-2 border-rose-500/80 rounded-2xl shadow-2xl shadow-rose-950/60 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-500/25 border border-rose-500 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5 animate-pulse">
                <Siren className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-300 bg-rose-500/30 px-2.5 py-0.5 rounded-full border border-rose-400/40">
                    🚨 CRITICAL WATER TANK FULL ALERT
                  </span>
                  <span className="text-xs text-rose-200 font-medium">
                    {fullTanks.length} Tank{fullTanks.length > 1 ? 's' : ''} at Critical Capacity (≥95%)
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  {fullTanks[0].name} has reached {fullTanks[0].fillPercent}% capacity!
                </h3>
                <p className="text-xs text-rose-100/90 mt-1 max-w-2xl leading-relaxed">
                  Location: <strong className="text-white">{fullTanks[0].location}</strong>. Stored Volume:{' '}
                  <strong className="text-white font-mono">{fullTanks[0].currentLevelLiters.toLocaleString()} / {fullTanks[0].capacityLiters.toLocaleString()} Liters</strong>.
                  {fullTanks[0].pumpStatus === 'ON' ? (
                    <span className="text-rose-200 font-semibold block mt-0.5">
                      ⚠️ Inflow pump is currently RUNNING ({fullTanks[0].inflowRateLitersPerMin} L/min). Water overflow and spillage estimated in ~{fullTanks[0].timeToFullMinutes || 2} minutes! Automated cutoff advised immediately.
                    </span>
                  ) : (
                    <span className="text-amber-200 font-semibold block mt-0.5">
                      ✓ Inflow pump has been stopped. Tank is at maximum storage limit.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Emergency Controls */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              {fullTanks[0].pumpStatus === 'ON' && (
                <button
                  onClick={() => handleCutoffPump(fullTanks[0].id)}
                  className="px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-rose-500/40 flex items-center gap-1.5 transition-transform hover:scale-105"
                >
                  <Power className="w-4 h-4 stroke-[2.5]" />
                  <span>Cut Off Inflow Pump Now</span>
                </button>
              )}

              <button
                onClick={() => handleDrainWater(fullTanks[0].id)}
                className="px-3.5 py-2.5 bg-[#0a1d42] hover:bg-[#102d64] text-sky-200 border border-sky-500/40 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                title="Divert 3,000L to central sump"
              >
                <ArrowDownCircle className="w-4 h-4 text-sky-400" />
                <span>Divert to Sump (3,000L)</span>
              </button>

              <button
                onClick={handleToggleSound}
                className="p-2.5 bg-[#0a1d42] hover:bg-[#102d64] text-slate-200 border border-blue-900/50 rounded-xl transition-colors"
                title={audioAlertEnabled ? 'Mute Alert Siren' : 'Enable Acoustic Siren'}
              >
                {audioAlertEnabled ? (
                  <Volume2 className="w-4 h-4 text-rose-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Water */}
        <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-5 shadow-lg shadow-blue-950/40">
          <div className="flex items-center justify-between text-xs text-blue-200/70 mb-2">
            <span>Total Daily Water</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {waterAnalytics.totalDailyLiters.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">L/day</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Expected: <strong className="text-blue-200">{waterAnalytics.expectedDailyLiters.toLocaleString()} L/day</strong>
          </div>
        </div>

        {/* Tanks in Full Alert */}
        <div
          className={`border rounded-2xl p-5 shadow-lg ${
            fullTanks.length > 0
              ? 'bg-rose-950/40 border-rose-500/70 shadow-rose-950/40 animate-pulse'
              : 'bg-[#081635] border-blue-900/40 shadow-blue-950/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-blue-200/70 mb-2">
            <span>Water Tank Alerts</span>
            <Bell className={`w-4 h-4 ${fullTanks.length > 0 ? 'text-rose-400 animate-bounce' : 'text-blue-300'}`} />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold font-mono ${
              fullTanks.length > 0 ? 'text-rose-400' : 'text-blue-400'
            }`}
          >
            {fullTanks.length}
            <span className="text-xs font-normal text-slate-400 ml-1">tank{fullTanks.length === 1 ? '' : 's'} full</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {fullTanks.length > 0 ? '🚨 Overflow alert active' : '🟢 All tanks within safe limits'}
          </div>
        </div>

        {/* High Consumption Zone */}
        <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-5 shadow-lg shadow-blue-950/40">
          <div className="flex items-center justify-between text-xs text-blue-200/70 mb-2">
            <span>Highest Consumption Zone</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white truncate" title={waterAnalytics.highConsumptionZone}>
            {waterAnalytics.highConsumptionZone}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Hostel & Chemical Lab zones
          </div>
        </div>

        {/* Abnormal Usage Status */}
        <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-5 shadow-lg shadow-blue-950/40">
          <div className="flex items-center justify-between text-xs text-blue-200/70 mb-2">
            <span>Draw Diagnostics</span>
            {waterAnalytics.abnormalUsage ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div
            className={`text-lg sm:text-xl font-bold ${
              waterAnalytics.abnormalUsage ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {waterAnalytics.abnormalUsage ? 'Abnormal Flow Detected' : 'Normal Flow Profile'}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {waterAnalytics.abnormalUsage ? 'Review laboratory rinse lines' : 'All zones within envelope'}
          </div>
        </div>
      </div>

      {/* AI Water Diagnostics Insight Box */}
      <div className="p-4 bg-[#0a1a3d]/80 border border-blue-500/30 rounded-xl flex items-start space-x-3 shadow-md shadow-blue-950/30">
        <Sparkles className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <span className="font-semibold text-sky-300 block mb-0.5">AI Water Diagnostics & Tank Telemetry</span>
          <p className="text-slate-300 leading-relaxed">{waterAnalytics.aiInsight}</p>
          <div className="mt-2 text-[11px] text-blue-300/70 flex items-center gap-1.5">
            <Info className="w-3 h-3 text-sky-400" />
            <span>Telemetry reports volumetric draw and overhead tank fill sensors. Physical audit recommended prior to declaring pipe failure.</span>
          </div>
        </div>
      </div>

      {/* LIVE WATER TANK ALERT & LEVEL MONITORING SECTION */}
      <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-6 space-y-6 shadow-xl shadow-blue-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/40 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                Live Water Tank Level & Automated Overflow Alert System
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Ultrasonic float sensors monitoring {tanks.length} campus overhead tanks and ground sumps with automated pump shutoff.
            </p>
          </div>

          {/* Interactive Alert System Testing Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTriggerTestAlert}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              title="Simulate Tank 1 reaching 99% full with pump ON to test the alert system"
            >
              <Siren className="w-3.5 h-3.5 text-rose-400" />
              <span>⚡ Test Tank Full Alert</span>
            </button>

            {onOpenEstateMap && (
              <button
                onClick={onOpenEstateMap}
                className="px-3 py-1.5 bg-[#091a3e] hover:bg-[#102d64] border border-blue-800/50 text-blue-300 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                title="View physical tanks on Campus Estate Map"
              >
                <Map className="w-3.5 h-3.5 text-blue-400" />
                <span>View on Estate Map</span>
              </button>
            )}

            <button
              onClick={handleResetTanks}
              className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-200 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              title="Reset all tanks to safe capacity"
            >
              <RotateCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Reset Tanks</span>
            </button>

            <button
              onClick={handleToggleSound}
              className={`px-3 py-1.5 border text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                audioAlertEnabled
                  ? 'bg-blue-500/20 border-blue-400/40 text-blue-200'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
              title="Toggle audio alarm pulse"
            >
              {audioAlertEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Siren On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Siren Muted</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security & Automation Status Bar */}
        <div className="p-3 bg-[#050f24] border border-blue-900/50 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Automatic Safety Shutoff: <strong className="text-emerald-400">Armed (≥95% Threshold)</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Radio className="w-4 h-4 text-blue-400" />
            <span>Ultrasonic Float Telemetry: <strong className="text-blue-300">Active (Continuous Poll)</strong></span>
          </div>
          <div className="text-slate-400">
            Total Stored: <strong className="text-white font-mono">{tanks.reduce((acc, t) => acc + t.currentLevelLiters, 0).toLocaleString()}</strong> / {tanks.reduce((acc, t) => acc + t.capacityLiters, 0).toLocaleString()} L
          </div>
        </div>

        {/* Tanks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tanks.map((tank) => {
            const isFull = tank.fillPercent >= 95;
            const isCriticalOverflow = tank.status === 'overflow_risk' || (isFull && tank.pumpStatus === 'ON');
            const isPumpOn = tank.pumpStatus === 'ON';
            const isAutoCutoff = tank.pumpStatus === 'AUTO_CUTOFF';

            return (
              <div
                key={tank.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCriticalOverflow
                    ? 'bg-gradient-to-b from-rose-950/50 to-[#0c183a] border-rose-500 shadow-xl shadow-rose-950/50 ring-2 ring-rose-500/60'
                    : isFull
                    ? 'bg-gradient-to-b from-amber-950/40 to-[#0a1738] border-amber-500/50 shadow-md'
                    : 'bg-[#06122d]/90 border-blue-900/40 hover:border-blue-700/60'
                }`}
              >
                {/* Tank Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm truncate max-w-[170px]" title={tank.name}>
                        {tank.name}
                      </h4>
                    </div>
                    <span className="text-[11px] text-blue-200/70 block truncate" title={tank.location}>
                      {tank.location}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isCriticalOverflow
                        ? 'text-rose-300 bg-rose-500/30 border border-rose-500/50 animate-pulse'
                        : isFull
                        ? 'text-amber-300 bg-amber-500/30 border border-amber-500/50'
                        : isPumpOn
                        ? 'text-sky-300 bg-sky-500/20 border border-sky-500/30'
                        : 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30'
                    }`}
                  >
                    {isCriticalOverflow
                      ? '🚨 Full / Overflow'
                      : isFull
                      ? '⚠️ Full Alert'
                      : isPumpOn
                      ? '💧 Filling'
                      : '🟢 Steady'}
                  </span>
                </div>

                {/* Cylinder Water Gauge Visualization */}
                <div className="my-4 bg-[#03091c] border border-blue-900/50 rounded-xl p-3 flex items-center gap-4">
                  {/* Gauge bar */}
                  <div className="w-12 h-24 bg-[#010512] rounded-lg border border-blue-900/60 p-1 flex flex-col justify-end relative overflow-hidden flex-shrink-0">
                    <div
                      className={`w-full rounded-md transition-all duration-700 ${
                        isCriticalOverflow
                          ? 'bg-gradient-to-t from-rose-600 to-rose-400 animate-pulse'
                          : isFull
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                          : 'bg-gradient-to-t from-sky-600 to-sky-400'
                      }`}
                      style={{ height: `${tank.fillPercent}%` }}
                    />
                    {/* Water Level Mark Lines */}
                    <div className="absolute top-1/4 left-0 right-0 border-b border-dashed border-white/20 pointer-events-none" />
                    <div className="absolute top-2/4 left-0 right-0 border-b border-dashed border-white/20 pointer-events-none" />
                    <div className="absolute top-3/4 left-0 right-0 border-b border-dashed border-white/20 pointer-events-none" />
                  </div>

                  {/* Numbers */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Level</span>
                      <span
                        className={`text-xl font-black font-mono ${
                          isCriticalOverflow
                            ? 'text-rose-400'
                            : isFull
                            ? 'text-amber-400'
                            : 'text-sky-400'
                        }`}
                      >
                        {tank.fillPercent}%
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-200">
                      {tank.currentLevelLiters.toLocaleString()}
                      <span className="text-slate-500 font-sans text-[11px]"> / {tank.capacityLiters.toLocaleString()} L</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">Inflow:</span>
                      <strong className={isPumpOn ? 'text-sky-400 font-mono' : 'text-slate-500 font-mono'}>
                        {tank.inflowRateLitersPerMin} L/min
                      </strong>
                    </div>

                    {isCriticalOverflow && (
                      <div className="text-[10px] text-rose-300 font-semibold bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                        Overflow risk in ~{tank.timeToFullMinutes || 2}m
                      </div>
                    )}
                  </div>
                </div>

                {/* Pump Status & Emergency Controls */}
                <div className="pt-3 border-t border-blue-900/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400">Pump:</span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        isPumpOn
                          ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                          : isAutoCutoff
                          ? 'text-cyan-400 bg-cyan-500/15 border border-cyan-500/30'
                          : 'text-slate-400 bg-slate-800 border border-slate-700'
                      }`}
                    >
                      {isPumpOn ? 'RUNNING' : isAutoCutoff ? 'AUTO-CUTOFF' : 'STOPPED'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPumpOn ? (
                      <button
                        onClick={() => handleCutoffPump(tank.id)}
                        className="px-2.5 py-1 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-rose-950/50"
                        title="Cut off pump immediately"
                      >
                        <Power className="w-3 h-3 stroke-[2.5]" />
                        <span>Cut Off</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleTogglePump(tank.id)}
                        className="px-2.5 py-1 bg-[#0c1f46] hover:bg-[#122e66] text-slate-200 border border-blue-800/40 text-xs rounded-lg transition-colors flex items-center gap-1"
                        title="Start pump"
                      >
                        <RotateCw className="w-3 h-3 text-emerald-400" />
                        <span>Start</span>
                      </button>
                    )}

                    {isFull && (
                      <button
                        onClick={() => handleDrainWater(tank.id)}
                        className="p-1 bg-[#0c1f46] hover:bg-[#122e66] text-sky-400 border border-sky-500/30 rounded-lg"
                        title="Divert 3,000L to central sump to avoid overflow"
                      >
                        <ArrowDownCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Alert & Event Incident Log */}
        <div className="p-4 bg-[#050f24] border border-blue-900/50 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Water Tank Telemetry & Safety Event Log
            </span>
            <span className="text-slate-400 text-[11px]">Real-Time Event Stream</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {alertLogs.map((log) => (
              <div
                key={log.id}
                className={`text-xs p-2 rounded-lg flex items-center justify-between gap-2 ${
                  log.type === 'alert'
                    ? 'bg-rose-950/40 border border-rose-500/40 text-rose-200'
                    : log.type === 'action'
                    ? 'bg-blue-950/40 border border-blue-500/30 text-blue-200'
                    : 'bg-[#081736] border border-blue-900/30 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">{log.time}</span>
                  <span className="truncate">{log.message}</span>
                </div>
                <span className="text-[10px] uppercase font-bold flex-shrink-0">
                  {log.type === 'alert' ? '🚨 ALERT' : log.type === 'action' ? '⚡ ACTION' : '✓ OK'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone Water Breakdown */}
      <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-6 shadow-xl shadow-blue-950/40">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Zone & Building Water Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daily draw vs configured baseline for all physical zones
          </p>
        </div>

        <div className="space-y-4">
          {waterAnalytics.zoneBreakdown.map((zone) => {
            const isElevated = zone.status === 'elevated';
            const percentOfTotal = Math.round(
              (zone.actualLiters / (waterAnalytics.totalDailyLiters || 1)) * 100
            );

            return (
              <div
                key={zone.buildingId}
                className={`p-4 rounded-xl border transition-colors ${
                  isElevated
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-[#06122d]/80 border-blue-900/40 hover:border-blue-700/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-white text-sm">{zone.buildingName}</span>
                    {isElevated && (
                      <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
                        Elevated Draw
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-bold text-sky-400 font-mono">
                        {zone.actualLiters.toLocaleString()} L/day
                      </span>
                      <span className="text-xs text-slate-500 block">
                        Baseline: {zone.expectedLiters.toLocaleString()} L/day ({percentOfTotal}% of total)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Relative progress bar */}
                <div className="w-full bg-[#03091c] h-2 rounded-full overflow-hidden flex border border-blue-900/30">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isElevated ? 'bg-amber-500' : 'bg-sky-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((zone.actualLiters / (zone.expectedLiters || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

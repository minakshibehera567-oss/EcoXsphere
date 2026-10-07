import React, { useState, useMemo } from 'react';
import { Institution, WasteBin, WasteType } from '../types/institution';
import {
  Trash2,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Filter,
  MapPin,
  Send,
  CalendarCheck,
  BellRing,
  TrendingUp,
  RefreshCw,
  Search,
  Building,
  Info,
  ShieldAlert,
  Flame,
  Layers,
  Check,
} from 'lucide-react';

interface WasteDashboardProps {
  institution: Institution;
  onUpdateBins?: (updatedBins: WasteBin[]) => void;
}

// Color and status helpers matching exact user prompt requirements
export function getFillCategory(fillPercent: number): {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderCol: string;
  barBg: string;
  category: 'normal' | 'filling' | 'almost_full' | 'full';
} {
  if (fillPercent >= 95) {
    return {
      label: '🔴 FULL',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      badgeText: 'text-rose-400',
      borderCol: 'border-rose-500/60 bg-rose-950/20',
      barBg: 'bg-rose-500',
      category: 'full',
    };
  }
  if (fillPercent >= 80) {
    return {
      label: '🟠 Almost Full',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      badgeText: 'text-orange-400',
      borderCol: 'border-orange-500/40 bg-orange-950/15',
      barBg: 'bg-orange-500',
      category: 'almost_full',
    };
  }
  if (fillPercent >= 50) {
    return {
      label: '🟡 Filling',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      badgeText: 'text-amber-400',
      borderCol: 'border-amber-500/30 bg-amber-950/10',
      barBg: 'bg-amber-500',
      category: 'filling',
    };
  }
  return {
    label: '🟢 Normal',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    badgeText: 'text-emerald-400',
    borderCol: 'border-blue-900/40 bg-[#05112a]',
    barBg: 'bg-emerald-500',
    category: 'normal',
  };
}

export const WasteDashboard: React.FC<WasteDashboardProps> = ({ institution, onUpdateBins }) => {
  const { wasteAnalytics, metrics, name: institutionName, type: institutionType } = institution;
  const [bins, setBins] = useState<WasteBin[]>(() => {
    // Ensure all bins have valid fields
    return wasteAnalytics.bins.map((b, idx) => {
      const bld = b.building || institution.buildings[idx % Math.max(1, institution.buildings.length)]?.name || 'Block A';
      const area = b.area || (idx === 0 ? 'Ground Floor' : 'Central Foyer');
      const wType: WasteType = b.wasteType || (idx % 2 === 0 ? 'Dry / Recyclable' : 'Organic / Wet');
      return {
        ...b,
        id: b.id.startsWith('Dustbin') ? b.id : (b.id.startsWith('B-') ? b.id : (idx === 0 ? 'B-204' : `B-${100 + idx * 4}`)),
        name: b.name.startsWith('Dustbin #') ? b.name : `Dustbin #${b.id.startsWith('B-') ? b.id : (idx === 0 ? 'B-204' : `B-${100 + idx * 4}`)}`,
        building: bld,
        area: area,
        location: b.location || `${bld}, ${area}`,
        wasteType: wType,
        fillPercent: b.fillPercent,
        fillRatePerHour: b.fillRatePerHour || 6,
        predictedOverflowHours: b.predictedOverflowHours || 2,
        collectionStatus: b.collectionStatus || (b.fillPercent >= 95 ? 'Pending' : 'Normal'),
        lastUpdated: b.lastUpdated || '2 mins ago',
        priority: b.priority || (b.fillPercent >= 95 ? 'High' : b.fillPercent >= 80 ? 'High' : 'Low'),
      };
    });
  });

  const [filterCategory, setFilterCategory] = useState<'all' | 'full' | 'almost_full' | 'filling' | 'normal'>('all');
  const [selectedWasteType, setSelectedWasteType] = useState<string>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);

  // Sync state upward
  const triggerBinsUpdate = (updated: WasteBin[]) => {
    setBins(updated);
    if (onUpdateBins) {
      onUpdateBins(updated);
    }
  };

  // Status counts based on the exact thresholds:
  // 0–49% → 🟢 Normal
  // 50–79% → 🟡 Filling
  // 80–94% → 🟠 Almost Full
  // 95–100% → 🔴 FULL
  const fullBins = useMemo(() => bins.filter((b) => b.fillPercent >= 95), [bins]);
  const almostFullBins = useMemo(() => bins.filter((b) => b.fillPercent >= 80 && b.fillPercent < 95), [bins]);
  const fillingBins = useMemo(() => bins.filter((b) => b.fillPercent >= 50 && b.fillPercent < 80), [bins]);
  const normalBins = useMemo(() => bins.filter((b) => b.fillPercent < 50), [bins]);

  // Unique buildings
  const uniqueBuildings = useMemo(() => {
    const set = new Set<string>();
    bins.forEach((b) => {
      if (b.building) set.add(b.building);
    });
    return Array.from(set);
  }, [bins]);

  // Filtered dustbins
  const filteredBins = useMemo(() => {
    return bins.filter((bin) => {
      // Category filter
      if (filterCategory === 'full' && bin.fillPercent < 95) return false;
      if (filterCategory === 'almost_full' && (bin.fillPercent < 80 || bin.fillPercent >= 95)) return false;
      if (filterCategory === 'filling' && (bin.fillPercent < 50 || bin.fillPercent >= 80)) return false;
      if (filterCategory === 'normal' && bin.fillPercent >= 50) return false;

      // Waste type filter
      if (selectedWasteType !== 'all' && bin.wasteType !== selectedWasteType) return false;

      // Building filter
      if (selectedBuilding !== 'all' && bin.building !== selectedBuilding) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchId = bin.id.toLowerCase().includes(query);
        const matchName = bin.name.toLowerCase().includes(query);
        const matchLoc = bin.location.toLowerCase().includes(query);
        const matchBld = (bin.building || '').toLowerCase().includes(query);
        const matchArea = (bin.area || '').toLowerCase().includes(query);
        const matchType = (bin.wasteType || '').toLowerCase().includes(query);
        if (!matchId && !matchName && !matchLoc && !matchBld && !matchArea && !matchType) return false;
      }

      return true;
    });
  }, [bins, filterCategory, selectedWasteType, selectedBuilding, searchQuery]);

  // Handler: Mark as Collected
  const handleMarkAsCollected = (binId: string) => {
    const updated = bins.map((b) => {
      if (b.id === binId) {
        const clearedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...b,
          fillPercent: 0,
          status: 'normal' as const,
          fillCategory: 'normal' as const,
          collectionStatus: 'Collected' as const,
          clearedAt: `Today at ${clearedTime}`,
          lastUpdated: 'Just now',
          predictedOverflowHours: 24,
          priority: 'Low' as const,
        };
      }
      return b;
    });
    triggerBinsUpdate(updated);

    const clearedBin = bins.find((b) => b.id === binId);
    setDispatchToast(`✅ ${clearedBin?.name || binId} (${clearedBin?.location}) marked as Collected! Fill level reset to 0%.`);
    setTimeout(() => setDispatchToast(null), 4000);
  };

  // Handler: Schedule Collection
  const handleScheduleCollection = (binId: string) => {
    const updated = bins.map((b) => {
      if (b.id === binId) {
        return {
          ...b,
          collectionStatus: 'Scheduled' as const,
          scheduledAt: 'Crew #2 En Route (ETA 8 mins)',
          lastUpdated: 'Just now',
        };
      }
      return b;
    });
    triggerBinsUpdate(updated);

    const targetBin = bins.find((b) => b.id === binId);
    setDispatchToast(`📋 Waste collection scheduled for ${targetBin?.name || binId}. Custodial dispatch notified.`);
    setTimeout(() => setDispatchToast(null), 4000);
  };

  // Handler: Clear all full bins
  const handleCollectAllFull = () => {
    const updated = bins.map((b) => {
      if (b.fillPercent >= 90) {
        const clearedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...b,
          fillPercent: 0,
          status: 'normal' as const,
          fillCategory: 'normal' as const,
          collectionStatus: 'Collected' as const,
          clearedAt: `Today at ${clearedTime}`,
          lastUpdated: 'Just now',
          predictedOverflowHours: 24,
          priority: 'Low' as const,
        };
      }
      return b;
    });
    triggerBinsUpdate(updated);
    setDispatchToast(`✅ All ${fullBins.length} full dustbins cleared and logged in sanitary audit.`);
    setTimeout(() => setDispatchToast(null), 4000);
  };

  // Simulator helper: Trigger 97% Full on canonical Dustbin #B-204
  const handleSimulateBin204Full = () => {
    const updated = bins.map((b, idx) => {
      if (b.id === 'B-204' || idx === 0) {
        return {
          ...b,
          id: 'B-204',
          name: 'Dustbin #B-204',
          building: 'Block A',
          area: 'Ground Floor',
          location: 'Block A, Ground Floor',
          fillPercent: 97,
          status: 'critical' as const,
          fillCategory: 'full' as const,
          collectionStatus: 'Pending' as const,
          priority: 'High' as const,
          predictedOverflowHours: 0.3,
          lastUpdated: 'Just now',
        };
      }
      return b;
    });
    triggerBinsUpdate(updated);
    setDispatchToast(`🚨 Simulation active: Dustbin #B-204 (Block A, Ground Floor) reached 97% full capacity!`);
    setTimeout(() => setDispatchToast(null), 4500);
  };

  // Simulator helper: Increase all fills by +10%
  const handleIncrementFill = () => {
    const updated = bins.map((b) => {
      const nextFill = Math.min(100, b.fillPercent + 10);
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      let priority: 'High' | 'Medium' | 'Low' = 'Low';
      if (nextFill >= 95) {
        status = 'critical';
        priority = 'High';
      } else if (nextFill >= 80) {
        status = 'warning';
        priority = 'High';
      } else if (nextFill >= 50) {
        status = 'warning';
        priority = 'Medium';
      }
      return {
        ...b,
        fillPercent: nextFill,
        status,
        lastUpdated: 'Just now',
        collectionStatus: nextFill >= 95 ? ('Pending' as const) : b.collectionStatus,
        priority,
      };
    });
    triggerBinsUpdate(updated);
    setDispatchToast(`Simulated +10% waste accumulation campus-wide.`);
    setTimeout(() => setDispatchToast(null), 3000);
  };

  // Primary full bin for high priority alert
  const primaryAlertBin = fullBins[0] || (almostFullBins.length > 0 && almostFullBins[0].fillPercent >= 90 ? almostFullBins[0] : null);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {dispatchToast && (
        <div className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-xl shadow-blue-950/50 border border-blue-400/40 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span>{dispatchToast}</span>
          </div>
          <button onClick={() => setDispatchToast(null)} className="text-blue-100 hover:text-white font-bold ml-3 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Module Title & Simulated Sensor Header */}
      <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-5 shadow-xl shadow-blue-950/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400 flex-shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">Smart Waste Management</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {institutionType} • {institutionName}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  Demo / Simulated Sensor Data
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time optical & ultrasonic fill telemetry with AI overflow prediction, automated collection notifications, and custodial routing.
              </p>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
            <button
              onClick={handleSimulateBin204Full}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:scale-105"
              title="Test the 97% Full Alert trigger on Dustbin #B-204"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulate Bin #B-204 Full (97%)</span>
            </button>

            <button
              onClick={handleIncrementFill}
              className="px-3 py-1.5 bg-[#0a1e45] hover:bg-blue-600/30 text-blue-200 border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>+10% Fill Rate</span>
            </button>

            {fullBins.length > 0 && (
              <button
                onClick={handleCollectAllFull}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-transform hover:scale-105 flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mark All Full as Collected ({fullBins.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          IN-APP NOTIFICATION: DUSTBIN FULL ALERT (Requested explicitly in prompt)
          ========================================================================= */}
      {primaryAlertBin && (
        <div
          className={`p-5 rounded-2xl border-2 transition-all shadow-2xl relative overflow-hidden ${
            primaryAlertBin.fillPercent >= 95
              ? 'bg-gradient-to-r from-rose-950 via-rose-900/80 to-[#0b1b3d] border-rose-500/80'
              : 'bg-gradient-to-r from-orange-950/90 via-amber-900/60 to-[#0b1b3d] border-orange-500/80'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 animate-bounce ${
                  primaryAlertBin.fillPercent >= 95
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50'
                    : 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/40'
                }`}
              >
                <BellRing className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-black/40 text-rose-300 border border-rose-400/40">
                    🔔 NEW ALERT
                  </span>
                  <span className="font-extrabold text-white text-base">
                    {primaryAlertBin.fillPercent >= 95 ? '🚨 Dustbin Full — Collection Required' : '⚠️ Dustbin Almost Full'}
                  </span>
                  <span className="text-xs font-mono font-black text-rose-300 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40">
                    {primaryAlertBin.fillPercent}% Fill
                  </span>
                </div>

                <div className="text-xs text-slate-200 mt-1 space-y-0.5">
                  <p>
                    <strong className="text-white font-mono">{primaryAlertBin.name}</strong> ({primaryAlertBin.location}) has reached{' '}
                    <span className="font-bold text-rose-300">{primaryAlertBin.fillPercent}% capacity</span>.
                  </p>
                  <p className="text-rose-200/90 font-medium">
                    Recommended Action:{' '}
                    <span className="text-white font-semibold">“Schedule waste collection immediately.”</span>
                  </p>
                  {primaryAlertBin.collectionStatus === 'Scheduled' && (
                    <div className="text-emerald-300 font-semibold flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{primaryAlertBin.scheduledAt || 'Janitorial crew scheduled.'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Action Buttons */}
            <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
              {primaryAlertBin.collectionStatus !== 'Scheduled' && (
                <button
                  type="button"
                  onClick={() => handleScheduleCollection(primaryAlertBin.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-transform hover:scale-105 flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>[Schedule Collection]</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleMarkAsCollected(primaryAlertBin.id)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-transform hover:scale-105 flex items-center gap-1.5 shadow-lg shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>[Mark as Collected]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards: Exact Fill Level Logic */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Bins */}
        <div className="bg-[#081635] border border-blue-900/50 rounded-2xl p-4 shadow-lg shadow-blue-950/40">
          <div className="flex items-center justify-between text-xs text-blue-200/70 mb-1">
            <span>Total Registered</span>
            <Trash2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {bins.length}
            <span className="text-xs font-normal text-slate-400 ml-1">bins</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {institution.metrics.campusArea || 'Campus-wide'} telemetry
          </div>
        </div>

        {/* 🔴 FULL (95-100%) */}
        <div
          onClick={() => setFilterCategory(filterCategory === 'full' ? 'all' : 'full')}
          className={`border rounded-2xl p-4 shadow-lg cursor-pointer transition-all ${
            fullBins.length > 0
              ? 'bg-rose-950/30 border-rose-500/60 hover:bg-rose-950/40'
              : 'bg-[#081635] border-blue-900/50 hover:border-blue-700/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-rose-300 font-bold">🔴 FULL (95–100%)</span>
            {fullBins.length > 0 && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {fullBins.length}
            <span className="text-xs font-normal text-slate-400 ml-1">bins</span>
          </div>
          <div className="text-[11px] text-rose-300 font-semibold mt-1">
            Collection Required
          </div>
        </div>

        {/* 🟠 Almost Full (80-94%) */}
        <div
          onClick={() => setFilterCategory(filterCategory === 'almost_full' ? 'all' : 'almost_full')}
          className="bg-[#081635] border border-orange-500/40 hover:bg-orange-950/20 rounded-2xl p-4 shadow-lg cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-orange-300 font-bold">🟠 Almost Full (80–94%)</span>
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">
            {almostFullBins.length}
            <span className="text-xs font-normal text-slate-400 ml-1">bins</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Overflow risk &lt; 3h
          </div>
        </div>

        {/* 🟡 Filling (50-79%) */}
        <div
          onClick={() => setFilterCategory(filterCategory === 'filling' ? 'all' : 'filling')}
          className="bg-[#081635] border border-amber-500/30 hover:bg-amber-950/20 rounded-2xl p-4 shadow-lg cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-amber-300 font-bold">🟡 Filling (50–79%)</span>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {fillingBins.length}
            <span className="text-xs font-normal text-slate-400 ml-1">bins</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Routine accumulation
          </div>
        </div>

        {/* 🟢 Normal (0-49%) */}
        <div
          onClick={() => setFilterCategory(filterCategory === 'normal' ? 'all' : 'normal')}
          className="bg-[#081635] border border-emerald-500/30 hover:bg-emerald-950/20 rounded-2xl p-4 shadow-lg cursor-pointer transition-all col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-emerald-300 font-bold">🟢 Normal (0–49%)</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {normalBins.length}
            <span className="text-xs font-normal text-slate-400 ml-1">bins</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            Normal Operating Level
          </div>
        </div>
      </div>

      {/* AI WASTE PREDICTION PANEL (Requested in prompt) */}
      <div className="p-5 bg-gradient-to-r from-indigo-950/80 via-[#071638] to-[#040e25] border border-indigo-500/40 rounded-2xl shadow-xl shadow-blue-950/40">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>AI Waste Velocity Modeling & Overflow Prediction</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-indigo-500/20 border border-indigo-400/30 text-indigo-200">
                  Demo / Simulated Sensor Data
                </span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {wasteAnalytics.aiInsight ||
                'High waste influx observed in cafeteria courtyard and academic foyer. Predictive algorithm estimates 2 bins will overflow before next shift change.'}
            </p>

            {/* Prediction Examples Showcase */}
            <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Canonical example 1: B-204 */}
              <div className="p-3 bg-[#030b1c]/80 rounded-xl border border-indigo-900/50 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-white">Dustbin #B-204</span>
                  <span className="text-rose-400 font-bold">Priority: High</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-1">Location: Block A, Ground Floor</div>
                <div className="mt-2 text-[11px] text-slate-300 font-medium bg-rose-500/10 p-2 rounded border border-rose-500/20">
                  “Dustbin #B-204 is expected to reach full capacity in approximately {bins[0]?.predictedOverflowHours || 0.5} hours.”
                </div>
                <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-indigo-950">
                  <span className="text-slate-400">Current fill: <strong className="text-rose-400 font-mono">{bins[0]?.fillPercent || 96}%</strong></span>
                  <span className="text-slate-400">Fill rate: <strong className="text-slate-200">{bins[0]?.fillRatePerHour || 8}%/hr</strong></span>
                </div>
              </div>

              {/* Canonical example 2: B-108 */}
              <div className="p-3 bg-[#030b1c]/80 rounded-xl border border-indigo-900/50 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-white">Dustbin #B-108</span>
                  <span className="text-orange-400 font-bold">Priority: High</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-1">Location: Cafeteria Courtyard</div>
                <div className="mt-2 text-[11px] text-slate-300 font-medium bg-orange-500/10 p-2 rounded border border-orange-500/20">
                  “Dustbin #B-108 is expected to reach full capacity in approximately 2 hours.”
                </div>
                <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-indigo-950">
                  <span className="text-slate-400">Current fill: <strong className="text-orange-400 font-mono">{bins[1]?.fillPercent || 82}%</strong></span>
                  <span className="text-slate-400">Estimated fill time: <strong className="text-slate-200">2 hours</strong></span>
                </div>
              </div>

              {/* Optimization Action */}
              <div className="p-3 bg-[#030b1c]/80 rounded-xl border border-indigo-900/50 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300">Custodial Route Optimizer</span>
                    <span className="text-emerald-400 font-bold text-[10px]">35% Less Transit</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Prioritizes <strong>Block A Ground Floor</strong> &rarr; <strong>Cafeteria Courtyard</strong> to eliminate overflow risks before 1:00 PM peak.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCollectAllFull}
                  className="mt-3 w-full py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3 h-3 text-indigo-400" />
                  <span>Dispatch Optimized Route</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dustbins Interactive Telemetry Table & Controls */}
      <div className="bg-[#081635] border border-blue-900/50 rounded-2xl p-6 shadow-xl shadow-blue-950/40">
        {/* Controls Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Live Dustbins Telemetry according to {institutionType}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {bins.length} Active Sensors
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status, fill levels, waste classification, and remote custodial clearing.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, building, area..."
                className="pl-8 pr-3 py-1.5 bg-[#051026] border border-blue-900/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-48 sm:w-56"
              />
            </div>

            {/* Building Filter */}
            {uniqueBuildings.length > 1 && (
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="px-2.5 py-1.5 bg-[#051026] border border-blue-900/50 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Buildings</option>
                {uniqueBuildings.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            )}

            {/* Waste Type Filter */}
            <select
              value={selectedWasteType}
              onChange={(e) => setSelectedWasteType(e.target.value)}
              className="px-2.5 py-1.5 bg-[#051026] border border-blue-900/50 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Waste Types</option>
              <option value="Organic / Wet">Organic / Wet</option>
              <option value="Dry / Recyclable">Dry / Recyclable</option>
              <option value="Biomedical / Hazardous">Biomedical / Hazardous</option>
              <option value="General Solid">General Solid</option>
              <option value="E-Waste">E-Waste</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap mb-5 text-xs bg-[#050f24] p-1.5 rounded-xl border border-blue-900/40">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              filterCategory === 'all' ? 'bg-[#0e2452] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Bins ({bins.length})
          </button>
          <button
            onClick={() => setFilterCategory('full')}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              filterCategory === 'full' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            🔴 FULL (95–100%) ({fullBins.length})
          </button>
          <button
            onClick={() => setFilterCategory('almost_full')}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              filterCategory === 'almost_full' ? 'bg-orange-500/25 text-orange-300 border border-orange-500/40' : 'text-slate-400 hover:text-orange-400'
            }`}
          >
            🟠 Almost Full (80–94%) ({almostFullBins.length})
          </button>
          <button
            onClick={() => setFilterCategory('filling')}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              filterCategory === 'filling' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            🟡 Filling (50–79%) ({fillingBins.length})
          </button>
          <button
            onClick={() => setFilterCategory('normal')}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              filterCategory === 'normal' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            🟢 Normal (0–49%) ({normalBins.length})
          </button>
        </div>

        {/* Bins Grid */}
        {filteredBins.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs bg-[#050f24] rounded-xl border border-blue-900/30">
            No dustbins match the current filter or search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBins.map((bin) => {
              const style = getFillCategory(bin.fillPercent);
              const isFull = bin.fillPercent >= 95;
              const isAlmostFull = bin.fillPercent >= 80 && bin.fillPercent < 95;

              return (
                <div
                  key={bin.id}
                  className={`p-4 rounded-xl border transition-all ${style.borderCol} hover:shadow-lg`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-white text-sm font-mono">{bin.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${style.badgeBg}`}>
                          {style.label}
                        </span>
                        {bin.collectionStatus && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              bin.collectionStatus === 'Collected'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : bin.collectionStatus === 'Scheduled'
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                : isFull
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {bin.collectionStatus === 'Pending' && isFull ? 'Collection Required' : bin.collectionStatus}
                          </span>
                        )}
                      </div>

                      {/* Location details */}
                      <div className="flex items-center gap-1.5 text-xs text-blue-200/80 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-200">{bin.location}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Block: <strong className="text-slate-300">{bin.building || 'Main'}</strong></span>
                        <span>•</span>
                        <span>Area: <strong className="text-slate-300">{bin.area || 'Foyer'}</strong></span>
                      </div>
                    </div>

                    {/* Fill Level Metric */}
                    <div className="text-right">
                      <div className={`text-2xl font-black font-mono ${style.badgeText}`}>
                        {bin.fillPercent}%
                      </div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Fill Level</span>
                    </div>
                  </div>

                  {/* Waste Type Tag */}
                  <div className="flex items-center gap-2 text-[11px] mb-2.5">
                    <span className="text-slate-400">Waste Type:</span>
                    <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-200 border border-blue-800/40 font-medium">
                      {bin.wasteType || 'General Solid'}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Updated:</span>
                    <span className="text-slate-300 font-mono">{bin.lastUpdated || 'Just now'}</span>
                  </div>

                  {/* Progress Meter with exact logic */}
                  <div className="w-full bg-[#03091c] h-2.5 rounded-full overflow-hidden flex my-2 border border-blue-900/40">
                    <div
                      className={`h-full transition-all duration-500 ${style.barBg} ${isFull ? 'animate-pulse' : ''}`}
                      style={{ width: `${bin.fillPercent}%` }}
                    />
                  </div>

                  {/* AI Prediction & Rate info */}
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-blue-900/30 flex-wrap gap-2">
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span>
                        Rate: <strong className="text-slate-200 font-mono">{bin.fillRatePerHour}%/hr</strong>
                      </span>
                      <span className={`flex items-center gap-1 ${isFull ? 'text-rose-300 font-bold' : isAlmostFull ? 'text-orange-300' : 'text-slate-300'}`}>
                        <Clock className="w-3 h-3" />
                        <span>
                          {isFull
                            ? 'Overflow Imminent!'
                            : `Full in ~${bin.predictedOverflowHours}h`}
                        </span>
                      </span>
                      {bin.clearedAt && (
                        <span className="text-emerald-400 text-[10px]">
                          ✓ Cleared: {bin.clearedAt}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      {bin.collectionStatus !== 'Scheduled' && isFull && (
                        <button
                          type="button"
                          onClick={() => handleScheduleCollection(bin.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-200 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <CalendarCheck className="w-3 h-3" />
                          <span>Schedule</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleMarkAsCollected(bin.id)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-transform hover:scale-105 flex items-center gap-1 shadow-sm ${
                          isFull
                            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                            : 'bg-blue-500/10 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Mark as Collected</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

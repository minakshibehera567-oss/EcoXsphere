import React, { useState, useMemo } from 'react';
import { Institution, Building, WaterTank, WasteBin } from '../types/institution';
import {
  Compass,
  Layers,
  Zap,
  Droplets,
  Trash2,
  Car,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Building2,
  Sparkles,
  Siren,
  Power,
  ArrowDownCircle,
  Search,
  Info,
  Flame,
  Sun,
  Navigation,
  CheckCircle2,
  SlidersHorizontal,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface EstateMapProps {
  institution: Institution;
  onOpenWhatIf?: () => void;
  onOpenChatWithQuery?: (query: string) => void;
  onUpdateTanks?: (updatedTanks: WaterTank[]) => void;
  onUpdateBins?: (updatedBins: WasteBin[]) => void;
}

type LayerMode = 'all' | 'energy' | 'water' | 'waste' | 'parking';
type ViewStyle = 'blueprint' | 'satellite' | 'heatmap';

interface PlacedBuilding {
  building: Building;
  x: number;
  y: number;
  w: number;
  h: number;
  tank?: WaterTank;
  bins: WasteBin[];
  hasSolar: boolean;
  solarKW: number;
}

export const EstateMap: React.FC<EstateMapProps> = ({
  institution,
  onOpenWhatIf,
  onOpenChatWithQuery,
  onUpdateTanks,
  onUpdateBins,
}) => {
  const [activeLayer, setActiveLayer] = useState<LayerMode>('all');
  const [viewStyle, setViewStyle] = useState<ViewStyle>('blueprint');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(institution.buildings[0]?.id || null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const { buildings, waterAnalytics, wasteAnalytics, energyAnalytics, metrics, location } = institution;
  const tanks = waterAnalytics?.tanks || [];
  const bins = wasteAnalytics?.bins || [];

  // Determine critical tank alert
  const fullTanks = tanks.filter(
    (t) => t.status === 'full_alert' || t.status === 'overflow_risk' || t.fillPercent >= 95
  );

  // Map coordinate layout calculation for up to 12 buildings in a masterplan campus grid
  const placedBuildings: PlacedBuilding[] = useMemo(() => {
    // Realistic campus campus coordinate slots
    const slots = [
      { x: 130, y: 120, w: 160, h: 100 }, // NW zone (Academic Block A)
      { x: 330, y: 120, w: 180, h: 100 }, // North Central (Block B)
      { x: 550, y: 120, w: 160, h: 100 }, // NE zone (Advanced Labs)
      { x: 750, y: 140, w: 150, h: 130 }, // Far East (Research Wing / Special)
      { x: 340, y: 260, w: 160, h: 110 }, // Central Quad (Library / Center)
      { x: 130, y: 260, w: 160, h: 100 }, // West Quad (Block C)
      { x: 550, y: 260, w: 160, h: 100 }, // East Quad (Canteen / Student Center)
      { x: 130, y: 400, w: 170, h: 120 }, // SW zone (Hostel Complex)
      { x: 340, y: 410, w: 170, h: 110 }, // South Central (Hostel 2 / Quarters)
      { x: 550, y: 410, w: 160, h: 110 }, // SE zone (Sports Pavilion / Auditorium)
      { x: 750, y: 320, w: 150, h: 120 }, // Far SE (Utility Block / Substation)
      { x: 750, y: 470, w: 150, h: 90 },  // Logistics Gate facility
    ];

    return buildings.map((b, idx) => {
      const slot = slots[idx % slots.length];
      // Match building with corresponding tank by name/location heuristic
      const matchedTank = tanks.find(
        (t) =>
          t.name.toLowerCase().includes(b.name.toLowerCase()) ||
          t.location.toLowerCase().includes(b.name.toLowerCase()) ||
          (b.name.toLowerCase().includes('hostel') && t.name.toLowerCase().includes('hostel')) ||
          (b.name.toLowerCase().includes('lab') && t.name.toLowerCase().includes('lab'))
      ) || (idx === 0 ? tanks[0] : idx === 1 ? tanks[1] : undefined);

      // Match building with corresponding bins
      const matchedBins = bins.filter(
        (bin) =>
          bin.name.toLowerCase().includes(b.name.toLowerCase()) ||
          bin.location.toLowerCase().includes(b.name.toLowerCase())
      );

      // Has solar if high savings or index % 2 === 0
      const hasSolar = idx % 2 === 0 || b.name.toLowerCase().includes('block a') || b.name.toLowerCase().includes('hostel');
      const solarKW = hasSolar ? 25 + idx * 10 : 0;

      return {
        building: b,
        x: slot.x,
        y: slot.y,
        w: slot.w,
        h: slot.h,
        tank: matchedTank,
        bins: matchedBins.length > 0 ? matchedBins : bins.slice(idx * 2, idx * 2 + 2),
        hasSolar,
        solarKW,
      };
    });
  }, [buildings, tanks, bins]);

  // Selected asset
  const selectedPlaced = placedBuildings.find((p) => p.building.id === selectedAssetId) || placedBuildings[0];

  // Emergency pump cutoff from map
  const handleCutoffTankFromMap = (tankId: string) => {
    if (!onUpdateTanks) return;
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
    onUpdateTanks(updated);
    setActionNotice(`Map Safety Command: Inflow pump for ${target?.name} stopped. Inflow rate 0 L/min.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Emergency sump divert from map
  const handleDrainTankFromMap = (tankId: string) => {
    if (!onUpdateTanks) return;
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
    onUpdateTanks(updated);
    setActionNotice(`Map Sluice Command: Diverted 3,000L from ${target?.name} to underground central sump.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Clear bin from map
  const handleClearBinFromMap = (binId: string) => {
    if (!onUpdateBins) return;
    const target = bins.find((b) => b.id === binId);
    const updated = bins.map((b) => {
      if (b.id === binId) {
        return {
          ...b,
          fillPercent: 5,
          fillRatePerHour: 3,
          predictedOverflowHours: 24,
          status: 'normal' as const,
          clearedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return b;
    });
    onUpdateBins(updated);
    setActionNotice(`Janitorial Dispatch: Bin cleared at ${target?.location}. Sensor level reset.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {actionNotice && (
        <div className="p-3 bg-blue-500 text-slate-950 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xl shadow-blue-950/40">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Emergency Spotlight Bar if any Water Tank is Full */}
      {fullTanks.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-rose-950 via-rose-900/80 to-[#081635] border-2 border-rose-500/80 rounded-2xl shadow-xl shadow-rose-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/30 border border-rose-400 flex items-center justify-center text-rose-300 animate-pulse flex-shrink-0">
              <Siren className="w-5 h-5 text-rose-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-500/30 px-2 py-0.5 rounded border border-rose-400/40">
                  🚨 Active Telemetry Siren
                </span>
                <span className="text-xs font-bold text-white">
                  {fullTanks[0].name} ({fullTanks[0].location}) is at {fullTanks[0].fillPercent}% Capacity!
                </span>
              </div>
              <p className="text-[11px] text-rose-200 mt-0.5">
                Rooftop tank is highlighted in flashing red on the estate map. Inflow pump status: <strong className="text-white">{fullTanks[0].pumpStatus}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => {
                const targetBuilding = placedBuildings.find(
                  (p) => p.tank?.id === fullTanks[0].id || p.building.name.toLowerCase().includes(fullTanks[0].location.toLowerCase())
                );
                if (targetBuilding) setSelectedAssetId(targetBuilding.building.id);
                setActiveLayer('water');
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
            >
              <span>Spotlight on Map</span>
              <Navigation className="w-3.5 h-3.5" />
            </button>

            {fullTanks[0].pumpStatus === 'ON' && (
              <button
                onClick={() => handleCutoffTankFromMap(fullTanks[0].id)}
                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs rounded-lg transition-transform hover:scale-105 flex items-center gap-1 shadow-md shadow-rose-950/60"
              >
                <Power className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Cut Off Pump</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Estate Map Control Header */}
      <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-5 shadow-xl shadow-blue-950/40 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-blue-900/40 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Campus Estate & Masterplan Spatial Map
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Interactive 2D architectural estate layout showing {buildings.length} physical blocks, {tanks.length} overhead water tanks, and {bins.length} IoT dustbins across {metrics.campusArea}.
            </p>
          </div>

          {/* Map Layer Segmented Controls */}
          <div className="flex items-center bg-[#050f24] p-1 rounded-xl border border-blue-900/50 text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveLayer('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeLayer === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Assets</span>
            </button>

            <button
              onClick={() => setActiveLayer('energy')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeLayer === 'energy'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Energy & Solar</span>
            </button>

            <button
              onClick={() => setActiveLayer('water')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeLayer === 'water'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Water & Tanks</span>
              {fullTanks.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveLayer('waste')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeLayer === 'waste'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Waste & Bins</span>
            </button>

            <button
              onClick={() => setActiveLayer('parking')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeLayer === 'parking'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-purple-400" />
              <span>Parking & Transit</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Search, View Style, and Zoom */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search building, tank or zone..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#050f24] border border-blue-900/50 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            {/* View style toggle */}
            <div className="flex items-center gap-1 bg-[#050f24] p-1 rounded-lg border border-blue-900/50 text-xs">
              <span className="text-[11px] text-slate-400 px-1 font-medium">Style:</span>
              <button
                onClick={() => setViewStyle('blueprint')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewStyle === 'blueprint' ? 'bg-[#0b1f46] text-blue-300 font-semibold' : 'text-slate-400'
                }`}
              >
                Blueprint
              </button>
              <button
                onClick={() => setViewStyle('satellite')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewStyle === 'satellite' ? 'bg-[#0b1f46] text-blue-300 font-semibold' : 'text-slate-400'
                }`}
              >
                Satellite Night
              </button>
              <button
                onClick={() => setViewStyle('heatmap')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewStyle === 'heatmap' ? 'bg-[#0b1f46] text-amber-300 font-semibold' : 'text-slate-400'
                }`}
              >
                Load Heatmap
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-[#050f24] p-1 rounded-lg border border-blue-900/50">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.15))}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors ml-0.5"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ESTATE MAP CANVAS & ASSET INSPECTOR SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map Visual (8 cols) */}
        <div className="lg:col-span-8 bg-[#040c1e] border border-blue-900/50 rounded-2xl p-3 sm:p-5 relative overflow-hidden shadow-2xl shadow-blue-950/60 min-h-[560px] flex flex-col justify-between">
          {/* Subtle Grid Background Pattern */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
              viewStyle === 'blueprint'
                ? 'opacity-25 bg-[radial-gradient(#1e40af_1px,transparent_1px)] [background-size:24px_24px]'
                : viewStyle === 'satellite'
                ? 'opacity-35 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:32px_32px]'
                : 'opacity-20'
            }`}
          />

          {/* Compass & Technical HUD Corner Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#020718]/85 border border-blue-900/60 px-3 py-1.5 rounded-xl text-[11px] backdrop-blur-md">
            <Compass className="w-4 h-4 text-blue-400 animate-spin-slow" />
            <div className="flex flex-col">
              <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                {location.city}, {location.state}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                20.2961° N · 85.8245° E · {metrics.campusArea}
              </span>
            </div>
          </div>

          {/* Active Layer Legend Indicator */}
          <div className="absolute top-4 right-4 z-10 bg-[#020718]/85 border border-blue-900/60 px-2.5 py-1 rounded-lg text-[10px] text-blue-200/90 font-medium backdrop-blur-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Layer: <strong className="text-white capitalize">{activeLayer}</strong></span>
          </div>

          {/* Zoomable SVG Canvas Container */}
          <div className="w-full flex-1 flex items-center justify-center overflow-auto py-2">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.25s ease-out',
              }}
              className="w-full max-w-[960px]"
            >
              <svg
                viewBox="0 0 980 620"
                className="w-full h-auto drop-shadow-2xl select-none"
              >
                <defs>
                  {/* Blueprint linear gradients */}
                  <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0b1736" />
                    <stop offset="100%" stopColor="#071026" />
                  </linearGradient>

                  <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#061f2d" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#04121a" stopOpacity="0.2" />
                  </linearGradient>

                  <linearGradient id="buildingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d2454" />
                    <stop offset="100%" stopColor="#071533" />
                  </linearGradient>

                  <linearGradient id="selectedBuildingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#123880" />
                    <stop offset="100%" stopColor="#0a204d" />
                  </linearGradient>

                  <linearGradient id="solarPattern" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>

                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* 1. CAMPUS PERIMETER / BOUNDARY WALL */}
                <rect
                  x="20"
                  y="20"
                  width="940"
                  height="580"
                  rx="30"
                  fill="#03081a"
                  stroke="#1d3d78"
                  strokeWidth="2.5"
                  strokeDasharray={viewStyle === 'blueprint' ? '6 3' : 'none'}
                />

                {/* Green Quadrangles & Lawns */}
                <rect x="70" y="70" width="840" height="480" rx="20" fill="url(#grassGrad)" stroke="#0e2a4a" strokeWidth="1" />

                {/* 2. CAMPUS ARTERIAL ROADS & BOULEVARDS */}
                {/* Horizontal central road */}
                <path
                  d="M 20 240 L 960 240"
                  stroke="url(#roadGrad)"
                  strokeWidth="28"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 240 L 960 240"
                  stroke="#1e3a6b"
                  strokeWidth="1.5"
                  strokeDasharray="10 8"
                />

                {/* Vertical boulevard 1 */}
                <path
                  d="M 310 20 L 310 600"
                  stroke="url(#roadGrad)"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                <path
                  d="M 310 20 L 310 600"
                  stroke="#1e3a6b"
                  strokeWidth="1.5"
                  strokeDasharray="10 8"
                />

                {/* Vertical boulevard 2 */}
                <path
                  d="M 725 20 L 725 600"
                  stroke="url(#roadGrad)"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                <path
                  d="M 725 20 L 725 600"
                  stroke="#1e3a6b"
                  strokeWidth="1.5"
                  strokeDasharray="10 8"
                />

                {/* Central Roundabout & Plaza */}
                <circle cx="515" cy="240" r="46" fill="#06122d" stroke="#2563eb" strokeWidth="2" />
                <circle cx="515" cy="240" r="30" fill="#081c44" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" />
                <circle cx="515" cy="240" r="14" fill="#0284c7" opacity="0.6" />
                <text x="515" y="244" fill="#bae6fd" fontSize="9" fontWeight="bold" textAnchor="middle">
                  QUAD PLAZA
                </text>

                {/* Main Campus Gates */}
                {/* West Main Entrance Gate */}
                <rect x="15" y="222" width="10" height="36" rx="2" fill="#3b82f6" />
                <text x="35" y="215" fill="#60a5fa" fontSize="9" fontWeight="bold">
                  MAIN GATE (WEST)
                </text>

                {/* East Logistics Gate */}
                <rect x="955" y="222" width="10" height="36" rx="2" fill="#3b82f6" />
                <text x="860" y="215" fill="#60a5fa" fontSize="9" fontWeight="bold">
                  LOGISTICS GATE
                </text>

                {/* North Academic Gate */}
                <rect x="292" y="15" width="36" height="10" rx="2" fill="#3b82f6" />
                <text x="290" y="40" fill="#60a5fa" fontSize="8" fontWeight="bold">
                  NORTH GATE
                </text>

                {/* 3. PARKING LOTS & TRANSIT BAYS */}
                <g opacity={activeLayer === 'all' || activeLayer === 'parking' ? '1' : '0.25'}>
                  {/* West Visitor Parking */}
                  <rect x="50" y="80" width="60" height="120" rx="6" fill="#091838" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="80" y="145" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">
                    PARKING P1
                  </text>
                  <text x="80" y="160" fill="#64748b" fontSize="8" textAnchor="middle">
                    {Math.round(metrics.vehiclesCount * 0.4)} bays
                  </text>

                  {/* South Student & Staff Parking */}
                  <rect x="50" y="420" width="60" height="130" rx="6" fill="#091838" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="80" y="485" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">
                    PARKING P2
                  </text>
                  <text x="80" y="500" fill="#64748b" fontSize="8" textAnchor="middle">
                    {Math.round(metrics.vehiclesCount * 0.6)} bays
                  </text>
                </g>

                {/* 4. UNDERGROUND CENTRAL WATER SUMP (at East Utility Zone) */}
                <g opacity={activeLayer === 'all' || activeLayer === 'water' ? '1' : '0.2'}>
                  <rect x="740" y="460" width="170" height="100" rx="10" fill="#071836" stroke="#0284c7" strokeWidth="1.5" />
                  <circle cx="825" cy="510" r="28" fill="#0369a1" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="825" y="505" fill="#e0f2fe" fontSize="10" fontWeight="bold" textAnchor="middle">
                    CENTRAL SUMP
                  </text>
                  <text x="825" y="520" fill="#7dd3fc" fontSize="8" textAnchor="middle">
                    120,000 L Reserve · STP
                  </text>
                </g>

                {/* 5. BUILDINGS & INFRASTRUCTURE NODES */}
                {placedBuildings.map((item) => {
                  const isSelected = item.building.id === selectedPlaced?.building.id;
                  const isMatchSearch =
                    !searchQuery ||
                    item.building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.building.type.toLowerCase().includes(searchQuery.toLowerCase());

                  // Building Energy & Saving status
                  const isSavingEnergy = item.building.monthlyElectricityKWh <= item.building.expectedElectricityKWh;
                  const tank = item.tank;
                  const isTankFull = tank && (tank.fillPercent >= 95 || tank.status === 'full_alert' || tank.status === 'overflow_risk');
                  const isTankRunning = tank && tank.pumpStatus === 'ON';

                  // Heatmap color
                  const heatmapFill =
                    viewStyle === 'heatmap'
                      ? item.building.monthlyElectricityKWh > item.building.expectedElectricityKWh * 1.1
                        ? '#7f1d1d'
                        : isSavingEnergy
                        ? '#064e3b'
                        : '#78350f'
                      : isSelected
                      ? 'url(#selectedBuildingGrad)'
                      : 'url(#buildingGrad)';

                  return (
                    <g
                      key={item.building.id}
                      onClick={() => setSelectedAssetId(item.building.id)}
                      className="cursor-pointer transition-all duration-200"
                      opacity={isMatchSearch ? '1' : '0.2'}
                    >
                      {/* Drop shadow / 3D base offset */}
                      <rect
                        x={item.x + 4}
                        y={item.y + 6}
                        width={item.w}
                        height={item.h}
                        rx="12"
                        fill="#020612"
                        opacity="0.8"
                      />

                      {/* Main Building Footprint */}
                      <rect
                        x={item.x}
                        y={item.y}
                        width={item.w}
                        height={item.h}
                        rx="12"
                        fill={heatmapFill}
                        stroke={
                          isSelected
                            ? '#38bdf8'
                            : isTankFull && (activeLayer === 'all' || activeLayer === 'water')
                            ? '#f43f5e'
                            : '#1d4ed8'
                        }
                        strokeWidth={isSelected ? '2.5' : isTankFull ? '2' : '1.5'}
                      />

                      {/* Rooftop Solar Array Texture if active */}
                      {(activeLayer === 'all' || activeLayer === 'energy') && item.hasSolar && (
                        <g>
                          <rect
                            x={item.x + 8}
                            y={item.y + 8}
                            width={item.w - 16}
                            height={22}
                            rx="4"
                            fill="url(#solarPattern)"
                            stroke="#38bdf8"
                            strokeWidth="0.75"
                          />
                          <text
                            x={item.x + item.w / 2}
                            y={item.y + 22}
                            fill="#f0f9ff"
                            fontSize="8"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            ☀️ SOLAR PV {item.solarKW} kW
                          </text>
                        </g>
                      )}

                      {/* Building Name & Info Labels */}
                      <text
                        x={item.x + 12}
                        y={item.y + (item.hasSolar && (activeLayer === 'all' || activeLayer === 'energy') ? 44 : 26)}
                        fill="#ffffff"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {item.building.name}
                      </text>

                      <text
                        x={item.x + 12}
                        y={item.y + (item.hasSolar && (activeLayer === 'all' || activeLayer === 'energy') ? 58 : 42)}
                        fill="#94a3b8"
                        fontSize="9"
                      >
                        {item.building.floors} Fl · {item.building.occupancy} Occ
                      </text>

                      {/* Metrics Pill Badge inside Building */}
                      <g>
                        <rect
                          x={item.x + 10}
                          y={item.y + item.h - 26}
                          width={item.w - 20}
                          height="18"
                          rx="4"
                          fill="#05122a"
                          stroke="#1e3a6b"
                          strokeWidth="0.8"
                        />
                        <text
                          x={item.x + 16}
                          y={item.y + item.h - 14}
                          fill={isSavingEnergy ? '#34d399' : '#fbbf24'}
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          ⚡ {item.building.monthlyElectricityKWh.toLocaleString()} kWh
                        </text>
                        <text
                          x={item.x + item.w - 16}
                          y={item.y + item.h - 14}
                          fill="#38bdf8"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="end"
                        >
                          💧 {item.building.dailyWaterLiters.toLocaleString()} L
                        </text>
                      </g>

                      {/* 6. OVERHEAD WATER TANK PIN ON ROOF (Visible in All or Water mode) */}
                      {(activeLayer === 'all' || activeLayer === 'water') && tank && (
                        <g transform={`translate(${item.x + item.w - 24}, ${item.y + 6})`}>
                          {/* Flashing radar ripple if tank is full or overflowing */}
                          {isTankFull && (
                            <circle cx="12" cy="12" r="18" fill="#f43f5e" fillOpacity="0.3" className="animate-ping" />
                          )}

                          <circle
                            cx="12"
                            cy="12"
                            r="11"
                            fill={isTankFull ? '#e11d48' : '#0369a1'}
                            stroke={isTankFull ? '#fda4af' : '#7dd3fc'}
                            strokeWidth="1.5"
                          />
                          <text
                            x="12"
                            y="15.5"
                            fill="#ffffff"
                            fontSize="8"
                            fontWeight="black"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {tank.fillPercent}%
                          </text>

                          {/* Pump Active Indicator */}
                          {isTankRunning && (
                            <circle cx="21" cy="4" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" className="animate-pulse" />
                          )}
                        </g>
                      )}

                      {/* 7. DUSTBIN MARKERS AROUND BUILDING (Visible in All or Waste mode) */}
                      {(activeLayer === 'all' || activeLayer === 'waste') && item.bins.length > 0 && (
                        <g transform={`translate(${item.x + 8}, ${item.y + item.h + 6})`}>
                          {item.bins.slice(0, 2).map((bin, bIdx) => {
                            const isCrit = bin.status === 'critical';
                            const isWarn = bin.status === 'warning';
                            const binFill = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';

                            return (
                              <g key={bin.id} transform={`translate(${bIdx * 24}, 0)`}>
                                {isCrit && (
                                  <circle cx="6" cy="6" r="10" fill="#ef4444" fillOpacity="0.35" className="animate-ping" />
                                )}
                                <rect
                                  x="0"
                                  y="0"
                                  width="14"
                                  height="14"
                                  rx="3"
                                  fill="#0b1736"
                                  stroke={binFill}
                                  strokeWidth="1.5"
                                />
                                <circle cx="7" cy="7" r="3.5" fill={binFill} />
                              </g>
                            );
                          })}
                        </g>
                      )}

                      {/* Highlight Selection Target Ring */}
                      {isSelected && (
                        <rect
                          x={item.x - 4}
                          y={item.y - 4}
                          width={item.w + 8}
                          height={item.h + 8}
                          rx="16"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-spin-slow"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Map Footer Toolbar / Status Line */}
          <div className="pt-3 border-t border-blue-900/40 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-4 text-[11px] flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 border border-blue-300" />
                <span>Facility Block</span>
              </span>

              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border border-sky-300" />
                <span>Overhead Water Tank (Level %)</span>
              </span>

              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>🚨 Tank Overflow Alert (≥95%)</span>
              </span>

              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                <span>IoT Dustbin (🟢/🟡/🔴)</span>
              </span>

              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
                <span>Solar PV Rooftop</span>
              </span>
            </div>

            <div className="text-[11px] font-mono text-blue-300/80">
              Interactive Masterplan · Click any zone to inspect
            </div>
          </div>
        </div>

        {/* ASSET INSPECTOR DRAWER (4 cols) */}
        <div className="lg:col-span-4 bg-[#081635] border border-blue-900/40 rounded-2xl p-5 shadow-xl shadow-blue-950/40 space-y-5 self-start">
          {selectedPlaced ? (
            <>
              {/* Asset Header */}
              <div className="border-b border-blue-900/40 pb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    Zone Inspector
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedPlaced.building.id}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#050f24] border border-blue-900/50 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {selectedPlaced.building.name}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {selectedPlaced.building.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Specifications */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-[#050f24] border border-blue-900/30 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">Floors</span>
                  <strong className="text-white font-mono text-sm">{selectedPlaced.building.floors}</strong>
                </div>

                <div className="p-2.5 bg-[#050f24] border border-blue-900/30 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">Area</span>
                  <strong className="text-white font-mono text-sm">
                    {Math.round(selectedPlaced.building.areaSqFt / 1000)}k sqft
                  </strong>
                </div>

                <div className="p-2.5 bg-[#050f24] border border-blue-900/30 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">Occupants</span>
                  <strong className="text-white font-mono text-sm">{selectedPlaced.building.occupancy}</strong>
                </div>
              </div>

              {/* Live Energy & Water Readout */}
              <div className="space-y-3">
                <div className="p-3 bg-[#050f24] border border-blue-900/40 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-blue-200">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold">Monthly Power Load</span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      {selectedPlaced.building.monthlyElectricityKWh.toLocaleString()} kWh
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Baseline target: {selectedPlaced.building.expectedElectricityKWh.toLocaleString()} kWh</span>
                    <span className={selectedPlaced.building.monthlyElectricityKWh <= selectedPlaced.building.expectedElectricityKWh ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                      {selectedPlaced.building.monthlyElectricityKWh <= selectedPlaced.building.expectedElectricityKWh
                        ? `Conserving ${selectedPlaced.building.expectedElectricityKWh - selectedPlaced.building.monthlyElectricityKWh} kWh`
                        : `Over by ${selectedPlaced.building.monthlyElectricityKWh - selectedPlaced.building.expectedElectricityKWh} kWh`}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#050f24] border border-blue-900/40 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-sky-200">
                      <Droplets className="w-4 h-4 text-sky-400" />
                      <span className="font-semibold">Daily Water Draw</span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      {selectedPlaced.building.dailyWaterLiters.toLocaleString()} L/day
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Baseline: {selectedPlaced.building.expectedWaterLiters.toLocaleString()} L/day</span>
                    <span className="text-slate-300 font-mono">
                      ~{Math.round(selectedPlaced.building.dailyWaterLiters / (selectedPlaced.building.occupancy || 1))} L/person
                    </span>
                  </div>
                </div>
              </div>

              {/* OVERHEAD TANK SECTION & EMERGENCY ACTIONS */}
              {selectedPlaced.tank && (
                <div className={`p-4 rounded-xl border space-y-3 ${
                  selectedPlaced.tank.fillPercent >= 95
                    ? 'bg-rose-950/30 border-rose-500 shadow-md ring-1 ring-rose-500/50'
                    : 'bg-[#050f24] border-blue-900/40'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-sky-400" />
                        <span className="font-bold text-white text-xs">{selectedPlaced.tank.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{selectedPlaced.tank.location}</span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      selectedPlaced.tank.fillPercent >= 95
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : 'bg-sky-500/20 text-sky-300'
                    }`}>
                      {selectedPlaced.tank.fillPercent}% FULL
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="font-mono text-white">
                      {selectedPlaced.tank.currentLevelLiters.toLocaleString()} / {selectedPlaced.tank.capacityLiters.toLocaleString()} L
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Inflow Pump:</span>
                    <span className={selectedPlaced.tank.pumpStatus === 'ON' ? 'text-sky-400 font-bold' : 'text-slate-400'}>
                      {selectedPlaced.tank.pumpStatus === 'ON' ? `RUNNING (${selectedPlaced.tank.inflowRateLitersPerMin} L/min)` : 'OFF / CUTOFF'}
                    </span>
                  </div>

                  {/* Quick tank controls from the map drawer */}
                  <div className="pt-1 flex items-center gap-2">
                    {selectedPlaced.tank.pumpStatus === 'ON' ? (
                      <button
                        onClick={() => handleCutoffTankFromMap(selectedPlaced.tank!.id)}
                        className="flex-1 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 shadow-md shadow-rose-950/60"
                      >
                        <Power className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Cut Off Pump</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        ✓ Inflow pump stopped (Auto-cutoff active)
                      </span>
                    )}

                    <button
                      onClick={() => handleDrainTankFromMap(selectedPlaced.tank!.id)}
                      className="px-2.5 py-1.5 bg-[#0a1d42] hover:bg-[#102d64] text-sky-200 border border-sky-400/40 text-xs rounded-lg transition-colors flex items-center gap-1"
                      title="Divert 3,000L to central sump"
                    >
                      <ArrowDownCircle className="w-3.5 h-3.5 text-sky-400" />
                      <span>Divert</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ATTACHED DUSTBINS AROUND ZONE */}
              {selectedPlaced.bins.length > 0 && (
                <div className="p-3 bg-[#050f24] border border-blue-900/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
                      Attached IoT Dustbins ({selectedPlaced.bins.length})
                    </span>
                    <span className="text-[10px] text-slate-400">Ultrasonic Float</span>
                  </div>

                  <div className="space-y-1.5">
                    {selectedPlaced.bins.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#081736] text-xs border border-blue-900/30"
                      >
                        <div>
                          <span className="font-medium text-white block text-[11px]">{b.name}</span>
                          <span className="text-[10px] text-slate-400">
                            ~{b.predictedOverflowHours}h until full ({b.fillRatePerHour}%/hr)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${
                            b.status === 'critical' ? 'text-rose-400' : b.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {b.fillPercent}%
                          </span>
                          <button
                            onClick={() => handleClearBinFromMap(b.id)}
                            className="px-2 py-0.5 text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Query Button on Building */}
              {onOpenChatWithQuery && (
                <button
                  onClick={() =>
                    onOpenChatWithQuery(
                      `Analyze energy and water performance for ${selectedPlaced.building.name} (${selectedPlaced.building.monthlyElectricityKWh} kWh/mo, ${selectedPlaced.building.dailyWaterLiters} L/day). What are the main recommendations?`
                    )
                  }
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI to Diagnose {selectedPlaced.building.name}</span>
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select any building on the map to view live telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

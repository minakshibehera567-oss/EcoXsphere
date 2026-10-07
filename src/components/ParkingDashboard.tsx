import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Institution, ParkingAnalytics, SmartParkingZone, MonitoredVehicle, ParkingViolationIncident, VehicleType } from '../types/institution';
import {
  Car,
  Zap,
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Compass,
  ArrowRight,
  Maximize2,
  Volume2,
  VolumeX,
  Radio,
  Video,
  Eye,
  AlertOctagon,
  ShieldAlert,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
  Check,
  Siren,
  Bell,
  Send,
  Sliders,
} from 'lucide-react';

interface ParkingDashboardProps {
  institution: Institution;
}

export const ParkingDashboard: React.FC<ParkingDashboardProps> = ({ institution }) => {
  const [reservedEvSlot, setReservedEvSlot] = useState(false);
  const parking: ParkingAnalytics = institution.parkingAnalytics || {
    totalSlots: 500,
    occupiedSlots: 369,
    utilizationPercent: 74,
    evChargingTotal: 24,
    evChargingOccupied: 18,
    twoWheelerTotal: 320,
    twoWheelerOccupied: 245,
    fourWheelerTotal: 140,
    fourWheelerOccupied: 102,
    handicapTotal: 16,
    handicapOccupied: 4,
    gateFlowRatePerMin: 14,
    peakHours: '09:00 AM - 10:45 AM & 04:30 PM - 06:00 PM',
    congestionRisk: 'moderate',
    zones: [
      { zoneName: 'North Executive & Faculty Bay', totalSlots: 80, occupiedSlots: 68, utilizationPercent: 85, type: 'Standard' },
      { zoneName: 'Green Mobility EV Charging Hub', totalSlots: 24, occupiedSlots: 18, utilizationPercent: 75, type: 'EV Charging' },
      { zoneName: 'South Multi-Tier Two-Wheeler Lot', totalSlots: 320, occupiedSlots: 245, utilizationPercent: 76, type: 'Two-Wheeler' },
      { zoneName: 'Visitor & Logistics Gate Bay', totalSlots: 60, occupiedSlots: 34, utilizationPercent: 57, type: 'Standard' },
      { zoneName: 'Accessible & Emergency Response Bay', totalSlots: 16, occupiedSlots: 4, utilizationPercent: 25, type: 'Handicapped' },
    ],
    aiInsight: 'EV Charging station utilization is at 75% (18/24 bays). Peak inflow recorded at North Gate. Predicted turnover will open 32 bays before 1:00 PM.',
  };

  const availableSlots = Math.max(0, parking.totalSlots - parking.occupiedSlots);

  // =========================================================================
  // SMART PARKING ZONES: AUTHORIZED & NO-PARKING ZONES
  // =========================================================================
  const [zones, setZones] = useState<SmartParkingZone[]>([
    // 🟢 Authorized Parking Zones
    {
      zoneId: 'Z-AUTH-1',
      zoneName: 'Faculty & Executive Bay (Zone A)',
      category: 'authorized',
      description: 'Designated for authorized faculty, staff, and campus administration.',
      totalSlots: 80,
      occupiedSlots: 68,
      isRestricted: false,
    },
    {
      zoneId: 'Z-AUTH-2',
      zoneName: 'Green Mobility EV Fast Charging Hub',
      category: 'authorized',
      description: 'Dedicated bays equipped with Type-2 AC & CCS2 DC fast chargers.',
      totalSlots: 24,
      occupiedSlots: 18,
      isRestricted: false,
    },
    {
      zoneId: 'Z-AUTH-3',
      zoneName: 'Visitor & Logistics Registration Lot',
      category: 'authorized',
      description: 'Temporary visitor passes with automatic RFID verification.',
      totalSlots: 60,
      occupiedSlots: 34,
      isRestricted: false,
    },
    {
      zoneId: 'Z-AUTH-4',
      zoneName: 'Two-Wheeler & Student Motor Lot',
      category: 'authorized',
      description: 'Multi-aisle demarcated bay for motorbikes, scooters, and cycles.',
      totalSlots: 320,
      occupiedSlots: 245,
      isRestricted: false,
    },

    // 🔴 No Parking Zones (Strict Zero-Vehicle Tolerance)
    {
      zoneId: 'Z-NP-1',
      zoneName: 'Emergency Fire Hydrant Lane & Life Safety Access',
      category: 'no_parking',
      description: 'Primary high-clearance access route for municipal fire tenders and emergency response.',
      totalSlots: 0,
      occupiedSlots: 1, // Currently 1 violation
      isRestricted: true,
      restrictionReason: 'Fire Code Section 14.2 — Strict Zero Parking Tolerance. Subject to immediate tow.',
    },
    {
      zoneId: 'Z-NP-2',
      zoneName: 'Ambulance Bay & Emergency Trauma Entrance',
      category: 'no_parking',
      description: 'Direct medical patient transfer corridor. Unobstructed transit required 24/7.',
      totalSlots: 0,
      occupiedSlots: 0,
      isRestricted: true,
      restrictionReason: 'Medical Emergency Zone — Obstruction constitutes critical health hazard.',
    },
    {
      zoneId: 'Z-NP-3',
      zoneName: 'Main Perimeter Gate Ingress Transit Clearance',
      category: 'no_parking',
      description: 'Vehicle thoroughfare connecting public ring road to campus barriers. Zero stopping.',
      totalSlots: 0,
      occupiedSlots: 0,
      isRestricted: true,
      restrictionReason: 'Traffic Flow Bottleneck Prevention — Strictly no waiting or unattended parking.',
    },
    {
      zoneId: 'Z-NP-4',
      zoneName: 'Central Pedestrian Plaza & Walkway',
      category: 'no_parking',
      description: 'Pedestrian-only quad connecting lecture theatres and library.',
      totalSlots: 0,
      occupiedSlots: 0,
      isRestricted: true,
      restrictionReason: 'Zero Motor Vehicle Zone — Heavy student and faculty walking footfall.',
    },
  ]);

  // =========================================================================
  // REAL-TIME MONITORED VEHICLES
  // =========================================================================
  const [vehicles, setVehicles] = useState<MonitoredVehicle[]>([
    // Active Wrong Parking Violation (Matching prompt demonstration)
    {
      vehicleId: 'DL-01-AB-1234',
      vehicleType: 'Sedan',
      zoneId: 'Z-NP-1',
      zoneName: 'Emergency Fire Hydrant Lane & Life Safety Access',
      zoneCategory: 'no_parking',
      entryTime: '10:14 AM',
      parkedDurationMins: 18,
      isViolation: true,
      violationReason: 'Parked in Emergency Fire Hydrant Lane. Severe obstruction of fire suppression lines.',
      sirenActive: false,
      securityDispatched: false,
      resolved: false,
    },
    // Authorized Vehicles
    {
      vehicleId: 'OD-02-XY-9081',
      vehicleType: 'SUV',
      zoneId: 'Z-AUTH-1',
      zoneName: 'Faculty & Executive Bay (Zone A)',
      zoneCategory: 'authorized',
      entryTime: '08:45 AM',
      parkedDurationMins: 110,
      isViolation: false,
    },
    {
      vehicleId: 'MH-12-CD-5678',
      vehicleType: 'Sedan',
      zoneId: 'Z-AUTH-2',
      zoneName: 'Green Mobility EV Fast Charging Hub',
      zoneCategory: 'authorized',
      entryTime: '09:30 AM',
      parkedDurationMins: 65,
      isViolation: false,
    },
    {
      vehicleId: 'KA-03-EF-2468',
      vehicleType: 'Motorcycle',
      zoneId: 'Z-AUTH-4',
      zoneName: 'Two-Wheeler & Student Motor Lot',
      zoneCategory: 'authorized',
      entryTime: '09:15 AM',
      parkedDurationMins: 80,
      isViolation: false,
    },
    {
      vehicleId: 'WB-04-GH-1122',
      vehicleType: 'Delivery Van',
      zoneId: 'Z-AUTH-3',
      zoneName: 'Visitor & Logistics Registration Lot',
      zoneCategory: 'authorized',
      entryTime: '10:05 AM',
      parkedDurationMins: 27,
      isViolation: false,
    },
  ]);

  // =========================================================================
  // INCIDENT LOG / HISTORY
  // =========================================================================
  const [incidentLog, setIncidentLog] = useState<ParkingViolationIncident[]>([
    {
      incidentId: 'INC-7412',
      timestamp: 'Today at 08:35 AM',
      vehiclePlate: 'HR-26-DK-9900',
      vehicleType: 'SUV',
      zoneName: 'Ambulance Bay & Emergency Trauma Entrance',
      violationReason: 'Blocking Emergency Ambulance ramp',
      status: 'Resolved (Relocated)',
      sirenSounded: true,
      resolvedAt: '08:42 AM (Relocated to Visitor Lot)',
    },
    {
      incidentId: 'INC-7390',
      timestamp: 'Yesterday at 04:15 PM',
      vehiclePlate: 'UP-16-AZ-4521',
      vehicleType: 'Delivery Van',
      zoneName: 'Main Perimeter Gate Ingress Transit Clearance',
      violationReason: 'Unattended parcel unloading in ingress traffic lane',
      status: 'Resolved (Relocated)',
      sirenSounded: false,
      resolvedAt: '04:22 PM (Moved to Loading Bay)',
    },
  ]);

  // Toast notification
  const [alertToast, setAlertToast] = useState<string | null>(null);

  // Active CCTV Camera Stream Selector
  const [selectedCamera, setSelectedCamera] = useState<'CAM-01' | 'CAM-02' | 'CAM-03' | 'CAM-04'>('CAM-01');

  // Siren Audio State
  const [isSirenSounding, setIsSirenSounding] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillator1Ref = useRef<OscillatorNode | null>(null);
  const oscillator2Ref = useRef<OscillatorNode | null>(null);
  const intervalRef = useRef<any>(null);

  // Active Wrong Parking Violations
  const activeViolations = useMemo(() => {
    return vehicles.filter((v) => v.isViolation && !v.resolved);
  }, [vehicles]);

  const primaryViolation = activeViolations[0] || null;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopSirenAudio();
    };
  }, []);

  // Web Audio API Siren Generator
  const startSirenAudio = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        setIsSirenSounding(true);
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtxClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create dual tone oscillators
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Set volume comfortably low
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      let highTone = false;
      osc1.frequency.setValueAtTime(650, ctx.currentTime);
      osc2.frequency.setValueAtTime(800, ctx.currentTime);

      osc1.start();
      osc2.start();

      oscillator1Ref.current = osc1;
      oscillator2Ref.current = osc2;
      setIsSirenSounding(true);

      // Alternating frequency modulation (emergency wail)
      intervalRef.current = setInterval(() => {
        if (!audioContextRef.current) return;
        const now = audioContextRef.current.currentTime;
        if (highTone) {
          osc1.frequency.setTargetAtTime(650, now, 0.08);
          osc2.frequency.setTargetAtTime(800, now, 0.08);
        } else {
          osc1.frequency.setTargetAtTime(950, now, 0.08);
          osc2.frequency.setTargetAtTime(1150, now, 0.08);
        }
        highTone = !highTone;
      }, 350);
    } catch (err) {
      console.warn('AudioContext not allowed or failed', err);
      setIsSirenSounding(true);
    }
  };

  const stopSirenAudio = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (oscillator1Ref.current) {
      try {
        oscillator1Ref.current.stop();
        oscillator1Ref.current.disconnect();
      } catch (e) {}
      oscillator1Ref.current = null;
    }
    if (oscillator2Ref.current) {
      try {
        oscillator2Ref.current.stop();
        oscillator2Ref.current.disconnect();
      } catch (e) {}
      oscillator2Ref.current = null;
    }
    setIsSirenSounding(false);
  };

  const toggleSiren = () => {
    if (isSirenSounding) {
      stopSirenAudio();
      setAlertToast('🔇 Acoustic warning siren muted.');
    } else {
      startSirenAudio();
      setAlertToast('🔊 Warning Siren & Optical Beacon ACTIVATED on Fire Lane!');
    }
    setTimeout(() => setAlertToast(null), 3500);
  };

  // Dispatch Security Team
  const handleDispatchSecurity = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.vehicleId === vehicleId ? { ...v, securityDispatched: true } : v))
    );
    setAlertToast(`📢 Campus Patrol Unit #4 dispatched to vehicle ${vehicleId}. Estimated arrival: 2 mins.`);
    setTimeout(() => setAlertToast(null), 4500);
  };

  // Resolve Violation (Relocate vehicle)
  const handleResolveViolation = (vehicleId: string) => {
    stopSirenAudio();

    const target = vehicles.find((v) => v.vehicleId === vehicleId);
    if (!target) return;

    const resolveTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update vehicle to resolved and move it to Authorized Visitor Bay
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.vehicleId === vehicleId) {
          return {
            ...v,
            zoneId: 'Z-AUTH-3',
            zoneName: 'Visitor & Logistics Registration Lot',
            zoneCategory: 'authorized',
            isViolation: false,
            sirenActive: false,
            securityDispatched: false,
            resolved: true,
            resolvedAt: `Resolved at ${resolveTime} (Relocated to Visitor Lot)`,
          };
        }
        return v;
      })
    );

    // Update zone counts
    setZones((prev) =>
      prev.map((z) => {
        if (z.zoneId === target.zoneId) {
          return { ...z, occupiedSlots: Math.max(0, z.occupiedSlots - 1) };
        }
        if (z.zoneId === 'Z-AUTH-3') {
          return { ...z, occupiedSlots: z.occupiedSlots + 1 };
        }
        return z;
      })
    );

    // Add to incident history
    setIncidentLog((prev) => [
      {
        incidentId: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: `Today at ${resolveTime}`,
        vehiclePlate: vehicleId,
        vehicleType: target.vehicleType,
        zoneName: target.zoneName,
        violationReason: target.violationReason || 'Unauthorized parking in prohibited zone',
        status: 'Resolved (Relocated)',
        sirenSounded: isSirenSounding,
        resolvedAt: `${resolveTime} (Vehicle relocated to Visitor Bay)`,
      },
      ...prev,
    ]);

    setAlertToast(`✅ Violation Resolved! Vehicle ${vehicleId} successfully relocated out of No-Parking Zone.`);
    setTimeout(() => setAlertToast(null), 4500);
  };

  // Simulator: Trigger Unauthorized Vehicle Arrival in No-Parking Zone
  const handleSimulateViolation = () => {
    const randomPlates = ['MH-04-AB-9876', 'KA-01-ZZ-5544', 'OD-05-MM-3210', 'DL-09-PQ-8877'];
    const chosenPlate = randomPlates[Math.floor(Math.random() * randomPlates.length)];
    const chosenZone = zones.find((z) => z.zoneId === 'Z-NP-1') || zones[4];

    const newVehicle: MonitoredVehicle = {
      vehicleId: chosenPlate,
      vehicleType: 'SUV',
      zoneId: chosenZone.zoneId,
      zoneName: chosenZone.zoneName,
      zoneCategory: 'no_parking',
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      parkedDurationMins: 1,
      isViolation: true,
      violationReason: 'Vehicle intrusion detected in No-Parking Fire Suppression Route.',
      sirenActive: false,
      securityDispatched: false,
      resolved: false,
    };

    setVehicles((prev) => [newVehicle, ...prev.filter((v) => v.vehicleId !== chosenPlate)]);
    setZones((prev) =>
      prev.map((z) => (z.zoneId === chosenZone.zoneId ? { ...z, occupiedSlots: z.occupiedSlots + 1 } : z))
    );

    // Start siren automatically for realism
    startSirenAudio();
    setAlertToast(`🚨 AI VISION TRIGGER: Vehicle ${chosenPlate} detected in ${chosenZone.zoneName}! Traffic Alert initiated.`);
    setTimeout(() => setAlertToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {alertToast && (
        <div className="p-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-xl shadow-blue-950/50 border border-indigo-400/40 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span>{alertToast}</span>
          </div>
          <button onClick={() => setAlertToast(null)} className="text-blue-100 hover:text-white font-bold ml-3 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner with Demo Mode Indicator */}
      <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-5 backdrop-blur-sm shadow-xl shadow-blue-950/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">Smart Parking & Traffic Monitoring</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                  AI Vision & CCTV Telemetry
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  Demo / Simulated Sensor Data
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Automated bay occupancy tracking, barrier gate flow velocity, unauthorized no-parking zone detection, and security deterrents.
              </p>
            </div>
          </div>

          {/* Interactive Simulation & EV Control */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
            <button
              onClick={handleSimulateViolation}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 shadow-sm hover:scale-105"
              title="Simulate the complete flow: Vehicle Location -> Zone Detection -> Wrong Parking -> Traffic Alert -> Siren -> Resolve"
            >
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>⚡ Simulate Vehicle in No-Parking Zone</span>
            </button>

            <button
              onClick={() => setReservedEvSlot(!reservedEvSlot)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
                reservedEvSlot
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-[#0a1e45] text-slate-300 hover:text-white border-blue-800/60 hover:bg-[#102d64]'
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>{reservedEvSlot ? 'Priority EV Slot Reserved (Bay #07)' : 'Reserve Priority EV Slot'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FEATURE 2: WRONG PARKING DETECTION ALERT BANNER & CONTROLS
          Vehicle Location → Zone Detection → Wrong Parking → Traffic Alert → Siren → Resolve
          ========================================================================= */}
      {primaryViolation && (
        <div
          className={`p-5 rounded-2xl border-2 transition-all shadow-2xl relative overflow-hidden ${
            isSirenSounding
              ? 'bg-gradient-to-r from-rose-950 via-rose-900 to-[#100720] border-rose-500 ring-4 ring-rose-500/20 animate-pulse'
              : 'bg-gradient-to-r from-rose-950/90 via-red-950/70 to-[#071530] border-rose-500/80'
          }`}
        >
          {/* Visual Siren Strobe Beacon Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isSirenSounding
                    ? 'bg-rose-500 text-white animate-bounce shadow-xl shadow-rose-500/50'
                    : 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                }`}
              >
                <Siren className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-black/50 text-rose-300 border border-rose-400/50">
                    🚨 WRONG PARKING DETECTED
                  </span>
                  <span className="text-sm font-extrabold text-white">
                    Vehicle <span className="font-mono text-yellow-300 underline font-black">{primaryViolation.vehicleId}</span> ({primaryViolation.vehicleType})
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-400/40 font-mono">
                    Parked for {primaryViolation.parkedDurationMins} mins
                  </span>
                </div>

                <div className="text-xs text-rose-100 mt-1.5 space-y-0.5">
                  <p>
                    <strong>Zone Violation:</strong>{' '}
                    <span className="font-bold text-white underline">{primaryViolation.zoneName}</span> (🔴 No Parking Zone)
                  </p>
                  <p className="text-rose-200/90">
                    <strong>Recommended Action:</strong>{' '}
                    <span className="text-white font-semibold">“Alert Security / Tow Vehicle / Sound Warning Siren”</span>
                  </p>
                  {primaryViolation.securityDispatched && (
                    <p className="text-emerald-300 font-bold flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Security squad dispatched to vehicle location.</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Workflow Buttons: Siren -> Dispatch Security -> Resolve */}
            <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
              {/* Button 1: Sound Warning Siren (Web Audio API) */}
              <button
                type="button"
                onClick={toggleSiren}
                className={`px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-lg ${
                  isSirenSounding
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/30 ring-2 ring-white animate-pulse'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                }`}
              >
                {isSirenSounding ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>[ 🔇 Stop Warning Siren ]</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 animate-bounce" />
                    <span>[ 🔊 Sound Warning Siren / Buzzer ]</span>
                  </>
                )}
              </button>

              {/* Button 2: Dispatch Security */}
              {!primaryViolation.securityDispatched && (
                <button
                  type="button"
                  onClick={() => handleDispatchSecurity(primaryViolation.vehicleId)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-transform hover:scale-105 flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <Radio className="w-4 h-4" />
                  <span>[ 📢 Dispatch Security ]</span>
                </button>
              )}

              {/* Button 3: Resolve / Vehicle Relocated */}
              <button
                type="button"
                onClick={() => handleResolveViolation(primaryViolation.vehicleId)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-transform hover:scale-105 flex items-center gap-1.5 shadow-lg shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>[ 🚗 Relocate / Resolve Violation ]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 shadow-lg shadow-blue-950/40">
          <span className="text-slate-400 text-xs">Total Capacity</span>
          <div className="text-3xl font-black text-white font-mono my-1.5">{parking.totalSlots}</div>
          <span className="text-[11px] text-slate-400">Marked vehicle bays</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 shadow-lg shadow-blue-950/40">
          <span className="text-slate-400 text-xs">Occupied Now</span>
          <div className="text-3xl font-black text-sky-400 font-mono my-1.5">{parking.occupiedSlots}</div>
          <span className="text-[11px] text-sky-300 font-semibold">{parking.utilizationPercent}% occupancy</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 shadow-lg shadow-blue-950/40">
          <span className="text-slate-400 text-xs">Available Slots</span>
          <div className="text-3xl font-black text-emerald-400 font-mono my-1.5">{availableSlots}</div>
          <span className="text-[11px] text-emerald-300 font-semibold">Immediate parking ready</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 shadow-lg shadow-blue-950/40">
          <span className="text-slate-400 text-xs">EV Fast Chargers</span>
          <div className="text-3xl font-black text-emerald-300 font-mono my-1.5">
            {parking.evChargingOccupied} <span className="text-xs text-slate-400 font-sans">/ {parking.evChargingTotal}</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">
            {parking.evChargingTotal - parking.evChargingOccupied} ports free
          </span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 shadow-lg shadow-blue-950/40">
          <span className="text-slate-400 text-xs">Gate Flow Velocity</span>
          <div className="text-3xl font-black text-indigo-300 font-mono my-1.5">
            {parking.gateFlowRatePerMin} <span className="text-xs text-slate-400 font-sans">v/m</span>
          </div>
          <span className="text-[11px] text-indigo-400 font-semibold">Under 3 min queue</span>
        </div>

        {/* Wrong Parking Active Violations KPI */}
        <div
          className={`border rounded-2xl p-4 shadow-lg transition-all ${
            activeViolations.length > 0
              ? 'bg-rose-950/30 border-rose-500/60 shadow-rose-950/50'
              : 'bg-[#071530]/90 border-blue-900/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-rose-300 font-bold">Wrong Parking</span>
            {activeViolations.length > 0 && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />}
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono my-1.5">
            {activeViolations.length}
            <span className="text-xs font-normal text-slate-400 ml-1">violations</span>
          </div>
          <span className="text-[11px] text-rose-300 font-semibold">
            {activeViolations.length > 0 ? 'Action Required' : 'All Zones Clear'}
          </span>
        </div>
      </div>

      {/* =========================================================================
          SIMULATED AI VISION & CCTV CAMERA STREAM CANVAS
          ========================================================================= */}
      <div className="bg-[#06122d] border border-blue-900/50 rounded-2xl p-5 shadow-xl shadow-blue-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Simulated AI Vision & Live CCTV Surveillance Feed
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>LIVE 30 FPS</span>
            </span>
          </div>

          {/* Camera Feed Selector */}
          <div className="flex items-center bg-[#03091c] p-1 rounded-xl border border-blue-900/40 text-xs">
            <button
              onClick={() => setSelectedCamera('CAM-01')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedCamera === 'CAM-01' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cam 01: Fire Lane (NP-1)
            </button>
            <button
              onClick={() => setSelectedCamera('CAM-02')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedCamera === 'CAM-02' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cam 02: Ambulance Bay
            </button>
            <button
              onClick={() => setSelectedCamera('CAM-03')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedCamera === 'CAM-03' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cam 03: Main Gate
            </button>
            <button
              onClick={() => setSelectedCamera('CAM-04')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedCamera === 'CAM-04' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cam 04: Pedestrian Quad
            </button>
          </div>
        </div>

        {/* Simulated CCTV Monitor Viewport */}
        <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-[#020713] via-[#040f28] to-[#010510] rounded-xl border border-blue-900/60 overflow-hidden flex items-center justify-center p-4">
          {/* Scanlines Effect & Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
          <div className="absolute inset-0 border border-blue-500/10 pointer-events-none" />

          {/* OSD Overlay: Top Left */}
          <div className="absolute top-3 left-4 text-xs font-mono text-emerald-400 bg-black/60 px-2.5 py-1 rounded border border-emerald-500/30">
            <div>AI OPTICAL RECOGNITION // FEED: {selectedCamera}</div>
            <div className="text-[10px] text-slate-300">
              LOCATION: {selectedCamera === 'CAM-01' ? 'Block A Fire Hydrant Corridor' : selectedCamera === 'CAM-02' ? 'Trauma ER Ramp' : selectedCamera === 'CAM-03' ? 'Perimeter Gate 1' : 'Central Quad'}
            </div>
          </div>

          {/* OSD Overlay: Top Right */}
          <div className="absolute top-3 right-4 text-xs font-mono text-slate-300 bg-black/60 px-2.5 py-1 rounded border border-blue-900/50 text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold text-rose-400">REC</span>
              <span>1080p 60Hz</span>
            </div>
            <div className="text-[10px] text-slate-400">FPS: 29.97 | BITRATE: 6.4 Mbps</div>
          </div>

          {/* If Camera 01 (Fire Lane) & has violation: Show AI Bounding Box */}
          {selectedCamera === 'CAM-01' && primaryViolation ? (
            <div className="relative z-10 w-full max-w-md p-4 rounded-xl border-2 border-rose-500 bg-rose-950/40 backdrop-blur-sm animate-pulse text-center shadow-2xl shadow-rose-950">
              <div className="absolute -top-3 left-3 bg-rose-600 text-white font-mono font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <span>AI VISION DETECT: 98.7% CONFIDENCE</span>
              </div>
              <div className="text-lg font-black text-white font-mono tracking-widest mt-1">
                [ VEHICLE: {primaryViolation.vehicleId} ]
              </div>
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wide mt-1">
                🚨 VIOLATION: NO-PARKING ZONE INTRUSION DETECTED
              </div>
              <div className="text-[11px] text-slate-300 mt-1 font-mono">
                COORDINATES: X: 482 Y: 219 | ZONE: FIRE_LANE_ACCESS_NP1
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={toggleSiren}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-transform hover:scale-105"
                >
                  {isSirenSounding ? 'Mute Siren' : 'Sound Siren'}
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveViolation(primaryViolation.vehicleId)}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-transform hover:scale-105"
                >
                  Resolve Violation
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10 text-center p-6 bg-black/40 rounded-xl border border-blue-900/30">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <div className="text-sm font-bold text-white">Zone Clear & Monitored</div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI Vision camera scanning zone perimeter. No unauthorized vehicle obstruction detected.
              </p>
              <button
                type="button"
                onClick={handleSimulateViolation}
                className="mt-3 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 rounded-lg text-xs font-semibold transition-colors"
              >
                Simulate Vehicle Arrival on Camera
              </button>
            </div>
          )}

          {/* OSD Overlay: Bottom Corner */}
          <div className="absolute bottom-2.5 left-4 text-[10px] font-mono text-slate-400">
            AUTO-BARRIER LOOPS: ONLINE | OCR ENGINE: TESSERACT-EDGE-v4.1
          </div>
        </div>
      </div>

      {/* =========================================================================
          PARKING ZONES: 🟢 AUTHORIZED VS 🔴 NO-PARKING ZONES
          ========================================================================= */}
      <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-5 shadow-xl shadow-blue-950/40">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Demarcated Parking Zones & Enforcement Status
            </h3>
            <p className="text-xs text-slate-400">
              🟢 Authorized Parking Bays & 🔴 Restricted No-Parking Zones
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-[#051026] px-3 py-1 rounded-lg border border-blue-900/40">
            Total Monitored Zones: {zones.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zones.map((zone) => {
            const isNoParking = zone.category === 'no_parking';
            const hasViolation = isNoParking && zone.occupiedSlots > 0;

            return (
              <div
                key={zone.zoneId}
                className={`p-4 rounded-xl border transition-all ${
                  hasViolation
                    ? 'bg-rose-950/25 border-rose-500/60 shadow-lg shadow-rose-950/50'
                    : isNoParking
                    ? 'bg-[#060e22] border-rose-900/40'
                    : 'bg-[#051026] border-blue-900/40 hover:border-blue-700/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{zone.zoneName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                          isNoParking
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {isNoParking ? '🔴 No Parking Zone' : '🟢 Authorized Parking'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{zone.description}</p>
                    {zone.restrictionReason && (
                      <p className="text-[11px] text-rose-300/90 font-medium mt-1">
                        ⚠️ Rule: {zone.restrictionReason}
                      </p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    {isNoParking ? (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded font-mono ${
                          hasViolation
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {hasViolation ? '🚨 VIOLATION' : '✓ CLEAR'}
                      </span>
                    ) : (
                      <div className="font-mono text-slate-300 text-xs">
                        <span className="text-white font-bold text-sm">{zone.occupiedSlots}</span> / {zone.totalSlots} bays
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar for authorized zones */}
                {!isNoParking && (
                  <div className="w-full bg-[#0a1838] h-2 rounded-full overflow-hidden border border-blue-900/40 mt-3">
                    <div
                      className="h-full bg-blue-500 transition-all rounded-full"
                      style={{ width: `${Math.round((zone.occupiedSlots / zone.totalSlots) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          REAL-TIME MONITORED VEHICLES TABLE
          ========================================================================= */}
      <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-5 shadow-xl shadow-blue-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Real-Time Monitored Vehicles & Zone Association
            </h3>
            <p className="text-xs text-slate-400">
              Live automated license plate recognition (ALPR) barrier tracking
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-[#051026] px-3 py-1 rounded-lg border border-blue-900/40">
            {vehicles.length} Vehicles Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-blue-900/50 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Vehicle Plate</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Zone Detected</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/60 font-mono">
              {vehicles.map((v) => (
                <tr key={v.vehicleId} className={v.isViolation ? 'bg-rose-950/20' : 'hover:bg-blue-950/20'}>
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <span>{v.vehicleId}</span>
                    {v.isViolation && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{v.vehicleType}</td>
                  <td className="py-3 px-3 text-slate-200 font-sans">{v.zoneName}</td>
                  <td className="py-3 px-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.zoneCategory === 'no_parking'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {v.zoneCategory === 'no_parking' ? 'No Parking' : 'Authorized'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{v.parkedDurationMins}m</td>
                  <td className="py-3 px-3 font-sans">
                    {v.isViolation ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white animate-pulse">
                        🚨 WRONG PARKING
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300">
                        🟢 Valid
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    {v.isViolation ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={toggleSiren}
                          className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-[11px]"
                        >
                          {isSirenSounding ? 'Mute' : 'Siren'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveViolation(v.vehicleId)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-[11px]"
                        >
                          Resolve
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">In Compliance</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          INCIDENT LOGGING & RESOLUTION HISTORY
          ========================================================================= */}
      <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-5 shadow-xl shadow-blue-950/40">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white tracking-tight">
            Enforcement Incident Log & Audit Trail
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {incidentLog.length} Incidents Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-blue-900/50 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2 px-3">Incident ID</th>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Vehicle Plate</th>
                <th className="py-2 px-3">Location / Zone</th>
                <th className="py-2 px-3">Violation Reason</th>
                <th className="py-2 px-3">Siren Sounded</th>
                <th className="py-2 px-3 text-right">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/60 font-mono text-slate-300">
              {incidentLog.map((inc) => (
                <tr key={inc.incidentId} className="hover:bg-blue-950/20">
                  <td className="py-2.5 px-3 font-bold text-indigo-300">{inc.incidentId}</td>
                  <td className="py-2.5 px-3">{inc.timestamp}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{inc.vehiclePlate}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-200">{inc.zoneName}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">{inc.violationReason}</td>
                  <td className="py-2.5 px-3 font-sans">
                    {inc.sirenSounded ? (
                      <span className="text-rose-400 font-semibold">🔊 Yes (Audible Siren)</span>
                    ) : (
                      <span className="text-slate-400">No (Silent Dispatch)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans text-emerald-400 font-semibold">
                    {inc.resolvedAt || inc.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

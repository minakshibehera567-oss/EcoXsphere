import React, { useState } from 'react';
import { Institution, AirQualityAnalytics } from '../types/institution';
import {
  Wind,
  Sparkles,
  Thermometer,
  Droplets,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Fan,
  Gauge,
} from 'lucide-react';

interface AirQualityDashboardProps {
  institution: Institution;
}

export const AirQualityDashboard: React.FC<AirQualityDashboardProps> = ({ institution }) => {
  const [ventilationBoost, setVentilationBoost] = useState(false);
  const air: AirQualityAnalytics = institution.airQualityAnalytics || {
    aqi: 64,
    aqiLabel: 'Moderate',
    pm25: 19,
    pm10: 44,
    co2: 495,
    vocPpb: 115,
    o3Ppb: 28,
    tempC: 28.5,
    humidity: 56,
    noiseLevelDba: 48,
    status: 'Satisfactory (Indoor Ventilation Clean)',
    zones: [
      { zoneId: 'z-outdoor', zoneName: 'Campus Quad & Main Gate', aqi: 68, pm25: 22, pm10: 48, co2: 415, tempC: 29.2, humidity: 58, status: 'Moderate' },
      { zoneId: 'z-acad', zoneName: 'Academic Lecture Theatres', aqi: 45, pm25: 12, pm10: 28, co2: 560, tempC: 24.1, humidity: 52, status: 'Good' },
      { zoneId: 'z-lab', zoneName: 'Advanced Laboratories', aqi: 52, pm25: 14, pm10: 32, co2: 480, tempC: 22.5, humidity: 48, status: 'Good' },
      { zoneId: 'z-dining', zoneName: 'Cafeteria & Dining Hall', aqi: 75, pm25: 26, pm10: 55, co2: 640, tempC: 26.8, humidity: 65, status: 'Moderate' },
      { zoneId: 'z-library', zoneName: 'Central Library Silent Floors', aqi: 38, pm25: 9, pm10: 20, co2: 440, tempC: 23.5, humidity: 50, status: 'Good' },
    ],
    aiInsight: 'Indoor CO2 levels remain well below ASHRAE threshold (800 ppm). Increased fresh air intake recommended for Canteen zone between 12:30 PM - 2:00 PM.',
  };

  const aqiColor =
    air.aqi <= 50
      ? 'from-emerald-500 to-teal-400 text-emerald-300 border-emerald-500/30'
      : air.aqi <= 100
      ? 'from-amber-500 to-yellow-400 text-amber-300 border-amber-500/30'
      : 'from-rose-500 to-red-400 text-rose-300 border-rose-500/30';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#071530]/80 border border-blue-900/40 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Air Quality & Environment Intelligence</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 border border-sky-500/30 text-sky-300">
                  Live LoRaWAN Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-sensor monitoring for particulate matter, indoor CO2, volatile organic compounds (VOC), and ambient thermal comfort.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVentilationBoost(!ventilationBoost)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
                ventilationBoost
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-[#0a1e45] text-slate-300 hover:text-white border-blue-800/60 hover:bg-[#102d64]'
              }`}
            >
              <Fan className={`w-4 h-4 ${ventilationBoost ? 'animate-spin' : ''}`} />
              <span>{ventilationBoost ? 'AHU Fresh Air Boost Active (100%)' : 'Auto AHU Eco Ventilation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Overall AQI */}
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Campus AQI</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-white font-mono">{air.aqi}</div>
            <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border mt-1 ${aqiColor}`}>
              {air.aqiLabel}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">National Ambient Standard: &lt;100</span>
        </div>

        {/* PM2.5 */}
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>PM2.5 Dust</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-white font-mono">{air.pm25} <span className="text-xs text-slate-400 font-sans">µg/m³</span></div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Safe Limit (&lt;30)
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Fine inhalable particles</span>
        </div>

        {/* PM10 */}
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>PM10 Coarse</span>
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-white font-mono">{air.pm10} <span className="text-xs text-slate-400 font-sans">µg/m³</span></div>
            <span className="text-[11px] text-sky-400 font-semibold mt-1 inline-block">Normal Range</span>
          </div>
          <span className="text-[10px] text-slate-400">Suspended dust</span>
        </div>

        {/* CO2 Indoor */}
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CO2 Concentration</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-white font-mono">{air.co2} <span className="text-xs text-slate-400 font-sans">ppm</span></div>
            <span className="text-[11px] text-teal-300 font-semibold mt-1 inline-block">Fresh (&lt;600 ppm)</span>
          </div>
          <span className="text-[10px] text-slate-400">Drowsiness threshold: 1000</span>
        </div>

        {/* Temp & Humidity */}
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ambient Comfort</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-mono">{air.tempC}°C</div>
            <span className="text-xs text-slate-300 font-mono mt-0.5 block">{air.humidity}% Humidity</span>
          </div>
          <span className="text-[10px] text-emerald-400">ASHRAE 55 Comfort Band</span>
        </div>

        {/* Sound & VOC */}
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Noise Level</span>
            <Volume2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-white font-mono">{air.noiseLevelDba} <span className="text-xs text-slate-400 font-sans">dBA</span></div>
            <span className="text-[11px] text-indigo-300 font-semibold mt-1 inline-block">VOC: {air.vocPpb} ppb</span>
          </div>
          <span className="text-[10px] text-slate-400">Acoustic quiet zone</span>
        </div>
      </div>

      {/* AI Air Recommendation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/80 via-[#071b40] to-[#040e25] border border-sky-500/30 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex-1 text-xs">
          <span className="font-bold text-sky-300 uppercase tracking-wider text-[10px]">AI Air Environmental Assessment</span>
          <p className="text-slate-200 mt-1 leading-relaxed">{air.aiInsight}</p>
        </div>
      </div>

      {/* Multi-Zone Sensor Grid */}
      <div className="bg-[#071530]/80 border border-blue-900/40 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>Campus Multi-Zone Air Quality Telemetry</span>
          <span className="text-xs font-normal text-slate-400">{air.zones.length} active IoT nodes</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {air.zones.map((zone) => (
            <div
              key={zone.zoneId}
              className="p-3.5 rounded-xl bg-[#051026] border border-blue-900/40 flex flex-col justify-between hover:border-blue-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-white text-xs">{zone.zoneName}</h4>
                  <span className="text-[10px] text-slate-400">Sensor ID: {zone.zoneId}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    zone.status === 'Good'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {zone.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 my-3 text-center bg-[#071738] p-2 rounded-lg border border-blue-900/30">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">AQI</span>
                  <span className="font-mono font-bold text-xs text-white">{zone.aqi}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">PM2.5</span>
                  <span className="font-mono font-bold text-xs text-sky-300">{zone.pm25}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">CO2</span>
                  <span className="font-mono font-bold text-xs text-teal-300">{zone.co2}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Temp</span>
                  <span className="font-mono font-bold text-xs text-amber-300">{zone.tempC}°</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Humidity: {zone.humidity}%</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Online
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

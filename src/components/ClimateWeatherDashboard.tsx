import React from 'react';
import { Institution, ClimateWeatherAnalytics } from '../types/institution';
import {
  Sun,
  Sparkles,
  CloudSun,
  CloudRain,
  Wind,
  Compass,
  Zap,
  Thermometer,
  ShieldAlert,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface ClimateWeatherDashboardProps {
  institution: Institution;
}

export const ClimateWeatherDashboard: React.FC<ClimateWeatherDashboardProps> = ({ institution }) => {
  const clim: ClimateWeatherAnalytics = institution.climateWeatherAnalytics || {
    ambientTempC: 31.4,
    feelsLikeTempC: 34.2,
    condition: 'Partly Cloudy',
    humidityPercent: 58,
    windSpeedKmH: 14.2,
    windDirection: 'SSE',
    solarRadiationWattsM2: 740,
    uvIndex: 7.8,
    rainfallMm: 0,
    heatIslandIndexC: 1.8,
    coolingDegreeDays: 12.4,
    forecastSummary: 'Expect warm conditions through 4:00 PM with solar PV output peaking at 92% efficiency. Isolated thunderstorm chance in the evening.',
    aiInsight: 'Current solar irradiance (740 W/m²) provides optimal generation across campus rooftop solar arrays, reducing midday grid import by 34%.',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#071530]/80 border border-blue-900/40 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Local Climate & Weather Station Telemetry</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  On-Site Pyranometer & Anemometer
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Microclimate weather data, solar radiation for photovoltaic yield, urban heat island metrics, and cooling load forecasts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#051126] border border-blue-900/50 px-3.5 py-2 rounded-xl">
            <CloudSun className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-white block">{clim.condition}</span>
              <span className="text-[10px] text-slate-400 font-mono">Feels like {clim.feelsLikeTempC}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Ambient Temperature</span>
          <div className="text-3xl font-black text-amber-400 font-mono my-2">{clim.ambientTempC}°C</div>
          <span className="text-[11px] text-slate-400">High: 33°C · Low: 24°C</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Solar Radiation</span>
          <div className="text-3xl font-black text-amber-300 font-mono my-2">
            {clim.solarRadiationWattsM2} <span className="text-xs text-slate-400 font-sans">W/m²</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">Peak PV Generation</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Relative Humidity</span>
          <div className="text-3xl font-black text-sky-400 font-mono my-2">{clim.humidityPercent}%</div>
          <span className="text-[11px] text-slate-400">Wet bulb: 24.2°C</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Wind Velocity</span>
          <div className="text-3xl font-black text-sky-300 font-mono my-2">{clim.windSpeedKmH} <span className="text-xs text-slate-400 font-sans">km/h</span></div>
          <span className="text-[11px] text-slate-400 font-mono">Direction: {clim.windDirection}</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">UV Index</span>
          <div className="text-3xl font-black text-orange-400 font-mono my-2">{clim.uvIndex}</div>
          <span className="text-[11px] text-orange-300 font-semibold">High Exposure</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-4">
          <span className="text-slate-400 text-xs">Urban Heat Island</span>
          <div className="text-3xl font-black text-rose-300 font-mono my-2">+{clim.heatIslandIndexC}°C</div>
          <span className="text-[11px] text-slate-400">vs Rural baseline</span>
        </div>
      </div>

      {/* AI Climate Insight */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#181d3d] to-[#040e25] border border-amber-500/30 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 text-xs">
          <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">AI Weather & Solar PV Intelligence</span>
          <p className="text-slate-200 mt-1 leading-relaxed">{clim.aiInsight}</p>
          <p className="text-slate-300/80 mt-1 italic">{clim.forecastSummary}</p>
        </div>
      </div>
    </div>
  );
};

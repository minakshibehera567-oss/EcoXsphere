import React, { useState } from 'react';
import { ResourceType, DataSourceType, DataSourceConfig } from '../types/institution';
import { RESOURCE_MODULES } from '../data/initialInstitutions';
import { ArrowLeft, ArrowRight, Database, Upload, Radio, Sparkles, CheckCircle2, FileText } from 'lucide-react';

interface DataSourceSelectionProps {
  institutionName: string;
  selectedResources: ResourceType[];
  onBack: () => void;
  onSubmit: (configs: Record<ResourceType, DataSourceConfig>) => void;
}

interface SourceOption {
  type: DataSourceType;
  label: string;
  isSynthetic: boolean;
  badge?: string;
  description: string;
}

const MODULE_OPTIONS: Record<ResourceType, SourceOption[]> = {
  electricity: [
    {
      type: 'synthetic_sample',
      label: 'Synthetic / Sample Data',
      isSynthetic: true,
      badge: 'Recommended for Prototype',
      description: 'Generates realistic sub-station and building level power curves calibrated to your floor area.',
    },
    {
      type: 'smart_meter',
      label: 'Smart Meter (Modbus / IoT Gateway)',
      isSynthetic: false,
      description: 'Connect direct TCP/IP Modbus or Schneider/ABB digital energy meters.',
    },
    {
      type: 'upload_csv',
      label: 'Upload CSV Dataset',
      isSynthetic: false,
      description: 'Import hourly or 15-minute interval energy meter consumption exports.',
    },
    {
      type: 'api',
      label: 'Cloud REST API / Webhook',
      isSynthetic: false,
      description: 'Push power telemetry via JSON API endpoints.',
    },
  ],
  water: [
    {
      type: 'synthetic_sample',
      label: 'Synthetic / Sample Data',
      isSynthetic: true,
      badge: 'Recommended for Prototype',
      description: 'Simulates bulk flow meters, borewell sumps, and wet-lab usage anomalies.',
    },
    {
      type: 'flow_meter',
      label: 'Electromagnetic / Pulse Flow Meter',
      isSynthetic: false,
      description: 'Direct pulse or RS485 flow sensor telemetry on primary supply loops.',
    },
    {
      type: 'upload_csv',
      label: 'Upload CSV Dataset',
      isSynthetic: false,
      description: 'Import bulk water meter consumption sheets.',
    },
    {
      type: 'api',
      label: 'Water Utility Cloud API',
      isSynthetic: false,
      description: 'Integration with municipal or on-premise SCADA water systems.',
    },
  ],
  waste: [
    {
      type: 'synthetic_sample',
      label: 'Synthetic / Sample Data',
      isSynthetic: true,
      badge: 'Recommended for Prototype',
      description: 'Simulates fill level velocity across all your registered dustbins with overflow countdown.',
    },
    {
      type: 'ultrasonic_sensor',
      label: 'Ultrasonic Bin Level Sensor Array',
      isSynthetic: false,
      description: 'IoT optical/ultrasonic fill telemetry on dustbins.',
    },
    {
      type: 'manual_entry',
      label: 'Janitorial Manual Entry Log',
      isSynthetic: false,
      description: 'Mobile rounds inspection logging by housekeeping staff.',
    },
    {
      type: 'upload_csv',
      label: 'Upload CSV Dataset',
      isSynthetic: false,
      description: 'Batch upload daily waste clearance records.',
    },
  ],
  airQuality: [
    {
      type: 'synthetic_sample',
      label: 'Synthetic / Sample Data',
      isSynthetic: true,
      badge: 'Recommended for Prototype',
      description: 'Simulates indoor CO2 and outdoor AQI particle metrics.',
    },
    {
      type: 'environmental_sensor',
      label: 'Environmental Sensor (LoRaWAN / Zigbee)',
      isSynthetic: false,
      description: 'Indoor air monitoring hardware measuring PM2.5, CO2, and humidity.',
    },
    {
      type: 'api',
      label: 'OpenWeather / CPCB Air Quality API',
      isSynthetic: false,
      description: 'Sync local atmospheric monitor coordinates via public API.',
    },
    {
      type: 'upload_csv',
      label: 'Upload CSV Dataset',
      isSynthetic: false,
      description: 'Import air quality monitoring records.',
    },
  ],
  parking: [
    {
      type: 'synthetic_sample',
      label: 'Synthetic / Sample Data',
      isSynthetic: true,
      badge: 'Recommended for Prototype',
      description: 'Generates occupancy patterns calibrated to your campus vehicle count.',
    },
    {
      type: 'iot_camera',
      label: 'AI Vision Camera Counting',
      isSynthetic: false,
      description: 'Video feed ingress/egress counting at boom barriers.',
    },
    {
      type: 'api',
      label: 'Parking Management API',
      isSynthetic: false,
      description: 'RFID boom barrier system integration.',
    },
  ],
  equipment: [
    {
      type: 'synthetic_sample',
      label: 'Synthetic / Sample Data',
      isSynthetic: true,
      badge: 'Recommended for Prototype',
      description: 'Calculates run hours and maintenance health for chillers and DG sets.',
    },
    {
      type: 'smart_meter',
      label: 'Equipment Current Transducer (CT)',
      isSynthetic: false,
      description: 'Individual motor and chiller CT sensors.',
    },
    {
      type: 'manual_entry',
      label: 'Technician Logbook',
      isSynthetic: false,
      description: 'Daily maintenance engineer checklist entries.',
    },
  ],
  traffic: [
    {
      type: 'synthetic_sample',
      label: 'Synthetic / Sample Data',
      isSynthetic: true,
      badge: 'Recommended for Prototype',
      description: 'Generates peak morning and evening campus vehicle throughput.',
    },
    {
      type: 'iot_camera',
      label: 'Gate ANPR Camera',
      isSynthetic: false,
      description: 'Automatic number plate recognition at perimeter gates.',
    },
  ],
  emissions: [
    {
      type: 'synthetic_sample',
      label: 'Synthetic / Sample Data',
      isSynthetic: true,
      badge: 'Recommended for Prototype',
      description: 'Calculates Scope 1 & 2 carbon footprint from electricity and fuel.',
    },
    {
      type: 'upload_csv',
      label: 'Upload Fuel & Utility Bills CSV',
      isSynthetic: false,
      description: 'Import diesel fuel logs and utility receipts.',
    },
  ],
  climate: [
    {
      type: 'synthetic_sample',
      label: 'Synthetic / Sample Data',
      isSynthetic: true,
      badge: 'Recommended for Prototype',
      description: 'Generates rooftop solar irradiance and microclimate readings.',
    },
    {
      type: 'environmental_sensor',
      label: 'Campus Weather Station',
      isSynthetic: false,
      description: 'Pyranometer, anemometer, and ambient temperature sensors.',
    },
  ],
  safety: [
    {
      type: 'synthetic_sample',
      label: 'Synthetic / Sample Data',
      isSynthetic: true,
      badge: 'Recommended for Prototype',
      description: 'Generates fire riser pressure and safety muster simulations.',
    },
    {
      type: 'manual_entry',
      label: 'Safety Audit Checklist',
      isSynthetic: false,
      description: 'Safety warden inspection logs.',
    },
  ],
};

export const DataSourceSelection: React.FC<DataSourceSelectionProps> = ({
  institutionName,
  selectedResources,
  onBack,
  onSubmit,
}) => {
  // Default all to synthetic_sample as requested in specification
  const [selections, setSelections] = useState<Record<ResourceType, DataSourceType>>(() => {
    const initial: Record<string, DataSourceType> = {};
    selectedResources.forEach((r) => {
      initial[r] = 'synthetic_sample';
    });
    return initial as Record<ResourceType, DataSourceType>;
  });

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  const handleSourceChange = (resource: ResourceType, type: DataSourceType) => {
    setSelections((prev) => ({
      ...prev,
      [resource]: type,
    }));
  };

  const handleSimulateCsvUpload = (resource: ResourceType, file: File) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [resource]: file.name,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalConfigs: Record<string, DataSourceConfig> = {};
    selectedResources.forEach((resKey) => {
      const type = selections[resKey] || 'synthetic_sample';
      const isSynthetic = type === 'synthetic_sample';
      const label = isSynthetic
        ? 'Demo / Simulated Data'
        : type === 'upload_csv'
        ? `Uploaded CSV (${uploadedFiles[resKey] || 'records.csv'})`
        : 'Live Telemetry';

      finalConfigs[resKey] = {
        type,
        label,
        isSynthetic,
        lastSync: 'Just now',
        csvFileName: uploadedFiles[resKey],
      };
    });

    onSubmit(finalConfigs as Record<ResourceType, DataSourceConfig>);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020718] via-[#071738] to-[#020512] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-blue-900/40 bg-[#06122d]/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </button>
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Step 4 of 4</span>
            <h2 className="text-sm font-bold text-white">Select Data Sources</h2>
          </div>
          <div className="text-xs text-slate-400">
            {selectedResources.length} Streams
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="mb-6">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            {institutionName}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Will Data Be Provided?
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Select the ingestion method for each active monitoring module. For quick testing, <strong className="text-slate-200">Synthetic / Sample Data</strong> is enabled by default and will be clearly identified as <strong className="text-emerald-400">Demo / Simulated Data</strong>.
          </p>
        </div>

        {/* Notice on simulated data */}
        <div className="mb-6 p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-start space-x-3 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-400 block mb-0.5">Clear Attribution Transparency</span>
            Simulated streams are explicitly labeled on all dashboards as <span className="font-semibold text-white">Demo / Simulated Data</span> so you never confuse simulated baselines with certified physical telemetry.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {selectedResources.map((resKey) => {
            const moduleInfo = RESOURCE_MODULES.find((m) => m.id === resKey);
            const options = MODULE_OPTIONS[resKey] || [
              {
                type: 'synthetic_sample',
                label: 'Synthetic / Sample Data',
                isSynthetic: true,
                description: 'Generated dynamic facility simulation.',
              },
            ];

            const currentChoice = selections[resKey] || 'synthetic_sample';

            return (
              <div
                key={resKey}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="font-semibold text-white text-base">
                      {moduleInfo?.label || resKey} Data Source
                    </h3>
                    <p className="text-xs text-slate-400">{moduleInfo?.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    Unit: {moduleInfo?.unit}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {options.map((opt) => {
                    const isSelected = currentChoice === opt.type;
                    return (
                      <div
                        key={opt.type}
                        onClick={() => handleSourceChange(resKey, opt.type)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-800/90 border-emerald-500/80 shadow-md'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-emerald-400 bg-emerald-500'
                                  : 'border-slate-600'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                            </div>
                            <span className="font-medium text-xs text-slate-100">{opt.label}</span>
                          </div>

                          {opt.badge && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              {opt.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 mt-1 pl-6 leading-relaxed">
                          {opt.description}
                        </p>

                        {/* Interactive file upload if user selects CSV */}
                        {opt.type === 'upload_csv' && isSelected && (
                          <div className="mt-3 pl-6">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 rounded cursor-pointer">
                              <Upload className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{uploadedFiles[resKey] ? uploadedFiles[resKey] : 'Browse CSV...'}</span>
                              <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleSimulateCsvUpload(resKey, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                            {uploadedFiles[resKey] && (
                              <span className="text-[11px] text-emerald-400 ml-2">✓ Loaded</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              Back
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-sm font-bold rounded-lg shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Personalized Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

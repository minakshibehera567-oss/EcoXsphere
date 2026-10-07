import React, { useState, useEffect } from 'react';
import { Institution, InstitutionType, ResourceType, DataSourceConfig, Building, AIInsightItem, WhatIfSimulationResult, WasteBin, WaterTank } from './types/institution';
import { INITIAL_INSTITUTIONS, InstitutionTypeDefinition, INSTITUTION_TYPES } from './data/initialInstitutions';
import { calculateInstitutionAnalytics } from './services/syntheticEngine';
import {
  fetchInstitutions,
  saveInstitution,
  updateInstitution,
  requestDeepAIAnalysis,
} from './services/api';

// Components
import { SelectInstitutionScreen } from './components/SelectInstitutionScreen';
import { TellUsAboutYourInstitution, InstitutionFormState } from './components/TellUsAboutYourInstitution';
import { FacilityConfiguration } from './components/FacilityConfiguration';
import { ResourceConfiguration } from './components/ResourceConfiguration';
import { DataSourceSelection } from './components/DataSourceSelection';
import { GeneratingDashboardScreen } from './components/GeneratingDashboardScreen';
import { PersonalizedHeader } from './components/PersonalizedHeader';
import { EnergyDashboard } from './components/EnergyDashboard';
import { WaterDashboard } from './components/WaterDashboard';
import { WasteDashboard } from './components/WasteDashboard';
import { AIFacilityIntelligence } from './components/AIFacilityIntelligence';
import { AIFacilityScore } from './components/AIFacilityScore';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { AskAIChatModal } from './components/AskAIChatModal';
import { InstitutionProfileModal } from './components/InstitutionProfileModal';
import { InstitutionComparisonModal } from './components/InstitutionComparisonModal';
import { FacilityBuildingsView } from './components/FacilityBuildingsView';
import { EstateMap } from './components/EstateMap';
import { AirQualityDashboard } from './components/AirQualityDashboard';
import { ParkingDashboard } from './components/ParkingDashboard';
import { EquipmentDashboard } from './components/EquipmentDashboard';
import { TrafficDashboard } from './components/TrafficDashboard';
import { EmissionsDashboard } from './components/EmissionsDashboard';
import { ClimateWeatherDashboard } from './components/ClimateWeatherDashboard';
import { SafetyDashboard } from './components/SafetyDashboard';
import { SmartDeviceControlDashboard } from './components/SmartDeviceControlDashboard';

import {
  LayoutDashboard,
  Map,
  Zap,
  Droplets,
  Trash2,
  Sparkles,
  Sliders,
  Building2,
  Bot,
  Scale,
  Settings,
  Wind,
  Car,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Siren,
  Power,
  ArrowDownCircle,
  Volume2,
  Bell,
  X,
  Cpu,
  Compass,
  Leaf,
  Sun,
  Flame,
  Activity,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';

type ScreenState =
  | 'select_type'
  | 'onboarding_details'
  | 'onboarding_facility'
  | 'onboarding_resources'
  | 'onboarding_datasources'
  | 'generating'
  | 'dashboard';

export default function App() {
  const [institutions, setInstitutions] = useState<Institution[]>(INITIAL_INSTITUTIONS);
  const [currentInstitutionId, setCurrentInstitutionId] = useState<string>(INITIAL_INSTITUTIONS[0].id);

  // App screen navigation
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('select_type');

  // Active navigation tab inside the personalized dashboard
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'estate_map'
    | 'smart_devices'
    | 'energy'
    | 'water'
    | 'waste'
    | 'air_quality'
    | 'parking'
    | 'equipment'
    | 'traffic'
    | 'emissions'
    | 'climate'
    | 'safety'
    | 'ai_insights'
    | 'what_if'
    | 'buildings'
  >('overview');

  // Modals
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [isAiRefreshing, setIsAiRefreshing] = useState(false);
  const [tankAlertDismissed, setTankAlertDismissed] = useState(false);
  const [wasteAlertDismissed, setWasteAlertDismissed] = useState(false);

  // Temporary onboarding state
  const [selectedTypeDef, setSelectedTypeDef] = useState<InstitutionTypeDefinition>(INSTITUTION_TYPES[0]);
  const [onboardingInfo, setOnboardingInfo] = useState<InstitutionFormState | null>(null);
  const [onboardingBuildings, setOnboardingBuildings] = useState<Building[]>([]);
  const [onboardingResources, setOnboardingResources] = useState<ResourceType[]>([]);

  // Load from backend API on initial mount
  useEffect(() => {
    async function loadData() {
      try {
        const remoteInstitutions = await fetchInstitutions();
        if (remoteInstitutions && remoteInstitutions.length > 0) {
          setInstitutions(remoteInstitutions);
        }
      } catch (err) {
        console.warn('Using initial seed institutions:', err);
      }
    }
    loadData();
  }, []);

  const currentInstitution =
    institutions.find((i) => i.id === currentInstitutionId) || institutions[0];

  // 1. User selects an institution type from First Screen
  const handleSelectType = (typeDef: InstitutionTypeDefinition) => {
    setSelectedTypeDef(typeDef);
    setCurrentScreen('onboarding_details');
  };

  // User selects an existing configured institution from First Screen
  const handleSelectExisting = (inst: Institution) => {
    setCurrentInstitutionId(inst.id);
    setCurrentScreen('dashboard');
  };

  // 2. User completes Step 1: Tell Us About Your Institution
  const handleDetailsSubmit = (formData: InstitutionFormState) => {
    setOnboardingInfo(formData);
    setCurrentScreen('onboarding_facility');
  };

  // 3. User completes Step 2: Configure Your Facility
  const handleFacilitySubmit = (buildings: Building[]) => {
    setOnboardingBuildings(buildings);
    setCurrentScreen('onboarding_resources');
  };

  // 4. User completes Step 3: Resource Configuration
  const handleResourcesSubmit = (resources: ResourceType[]) => {
    setOnboardingResources(resources);
    setCurrentScreen('onboarding_datasources');
  };

  // 5. User completes Step 4: Data Source Selection
  const handleDataSourcesSubmit = async (dataSources: Record<ResourceType, DataSourceConfig>) => {
    if (!onboardingInfo) return;

    // Synthesize institution model
    const newInstitutionRaw: Omit<
      Institution,
      | 'status'
      | 'overallSummary'
      | 'sustainabilityScore'
      | 'energyAnalytics'
      | 'waterAnalytics'
      | 'wasteAnalytics'
      | 'airQualityAnalytics'
      | 'parkingAnalytics'
      | 'aiInsights'
      | 'createdAt'
      | 'updatedAt'
    > & { id: string } = {
      id: `inst-${Date.now()}`,
      name: onboardingInfo.name,
      type: onboardingInfo.type as InstitutionType,
      icon: onboardingInfo.icon,
      location: {
        city: onboardingInfo.city,
        state: onboardingInfo.state,
        country: onboardingInfo.country,
      },
      metrics: {
        buildingsCount: onboardingBuildings.length,
        occupancyCount: onboardingInfo.occupancyCount,
        campusArea: onboardingInfo.campusArea,
        floorsCount: onboardingInfo.floorsCount,
        classroomsCount: onboardingInfo.classroomsCount,
        laboratoriesCount: onboardingInfo.laboratoriesCount,
        hostelsCount: onboardingInfo.hostelsCount,
        parkingAreasCount: onboardingInfo.parkingAreasCount,
        vehiclesCount: onboardingInfo.vehiclesCount,
        dustbinsCount: onboardingInfo.dustbinsCount,
        waterTanksCount: onboardingInfo.waterTanksCount,
        avgDailyWaterLiters: onboardingInfo.avgDailyWaterLiters,
        avgMonthlyElectricityKWh: onboardingInfo.avgMonthlyElectricityKWh,
        acUnitsCount: onboardingInfo.acUnitsCount,
        fansCount: onboardingInfo.fansCount,
        lightsCount: onboardingInfo.lightsCount,
        majorMachinesCount: onboardingInfo.majorMachinesCount,
        notes: onboardingInfo.notes,
      },
      buildings: onboardingBuildings,
      monitoredResources: onboardingResources,
      dataSources,
    };

    const enriched = calculateInstitutionAnalytics(newInstitutionRaw);

    // Save to local state and backend
    setInstitutions((prev) => [enriched, ...prev]);
    setCurrentInstitutionId(enriched.id);

    // Transition to Generating Screen
    setCurrentScreen('generating');

    // Trigger async Gemini analysis in background or save
    saveInstitution(enriched).catch(console.error);
    requestDeepAIAnalysis(enriched)
      .then((aiEnriched) => {
        setInstitutions((prev) =>
          prev.map((item) => (item.id === aiEnriched.id ? aiEnriched : item))
        );
      })
      .catch(console.error);
  };

  // 6. Generating completed -> Switch to Personalized Dashboard
  const handleGeneratingComplete = () => {
    setCurrentScreen('dashboard');
  };

  // Re-run deep AI facility analysis with Gemini
  const handleRefreshAI = async () => {
    setIsAiRefreshing(true);
    try {
      const refreshed = await requestDeepAIAnalysis(currentInstitution);
      setInstitutions((prev) =>
        prev.map((i) => (i.id === refreshed.id ? refreshed : i))
      );
      updateInstitution(refreshed.id, refreshed).catch(console.error);
    } catch (e) {
      console.error('Refresh AI failed:', e);
    } finally {
      setIsAiRefreshing(false);
    }
  };

  // Update profile from Modal
  const handleSaveProfile = (updated: Institution) => {
    const recalculated = calculateInstitutionAnalytics(updated);
    setInstitutions((prev) =>
      prev.map((i) => (i.id === recalculated.id ? recalculated : i))
    );
    updateInstitution(recalculated.id, recalculated).catch(console.error);
  };

  // Update bins from Waste tab
  const handleUpdateBins = (updatedBins: WasteBin[]) => {
    const critCount = updatedBins.filter((b) => b.status === 'critical').length;
    const warnCount = updatedBins.filter((b) => b.status === 'warning').length;
    const normCount = updatedBins.filter((b) => b.status === 'normal').length;

    const updatedInst: Institution = {
      ...currentInstitution,
      wasteAnalytics: {
        ...currentInstitution.wasteAnalytics,
        bins: updatedBins,
        criticalCount: critCount,
        nearlyFullCount: warnCount,
        normalCount: normCount,
      },
    };

    setInstitutions((prev) =>
      prev.map((i) => (i.id === updatedInst.id ? updatedInst : i))
    );
    updateInstitution(updatedInst.id, updatedInst).catch(console.error);
  };

  // Update water tanks from Water tab (e.g. pump cutoff, valve divert)
  const handleUpdateTanks = (updatedTanks: WaterTank[]) => {
    const fullCount = updatedTanks.filter(
      (t) => t.status === 'full_alert' || t.status === 'overflow_risk' || t.fillPercent >= 95
    ).length;
    const activePumps = updatedTanks.filter((t) => t.pumpStatus === 'ON').length;

    const updatedInst: Institution = {
      ...currentInstitution,
      waterAnalytics: {
        ...currentInstitution.waterAnalytics,
        tanks: updatedTanks,
        totalTanks: updatedTanks.length,
        fullTankAlertCount: fullCount,
        activePumpCount: activePumps,
      },
    };

    setInstitutions((prev) =>
      prev.map((i) => (i.id === updatedInst.id ? updatedInst : i))
    );
    updateInstitution(updatedInst.id, updatedInst).catch(console.error);
  };

  // Global Cutoff and Divert actions for the top Alert Banner
  const handleGlobalCutoffPump = (tankId: string) => {
    const currentTanks = currentInstitution.waterAnalytics?.tanks || [];
    const updated = currentTanks.map((t) => {
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
    handleUpdateTanks(updated);
  };

  const handleGlobalDrainWater = (tankId: string) => {
    const currentTanks = currentInstitution.waterAnalytics?.tanks || [];
    const updated = currentTanks.map((t) => {
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
    handleUpdateTanks(updated);
  };

  const handleGlobalScheduleBin = (binId: string) => {
    const currentBins = currentInstitution.wasteAnalytics?.bins || [];
    const updated = currentBins.map((b) => {
      if (b.id === binId) {
        return {
          ...b,
          collectionStatus: 'Scheduled' as const,
          scheduledAt: 'Janitorial Crew Dispatched (ETA 8 mins)',
          lastUpdated: 'Just now',
        };
      }
      return b;
    });
    handleUpdateBins(updated);
  };

  const handleGlobalMarkBinCollected = (binId: string) => {
    const currentBins = currentInstitution.wasteAnalytics?.bins || [];
    const clearedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = currentBins.map((b) => {
      if (b.id === binId) {
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
    handleUpdateBins(updated);
  };

  // ----------------- SCREEN ROUTING ----------------- //

  if (currentScreen === 'select_type') {
    return (
      <SelectInstitutionScreen
        onSelectType={handleSelectType}
        onBackToDashboard={institutions.length > 0 ? () => setCurrentScreen('dashboard') : undefined}
      />
    );
  }

  if (currentScreen === 'onboarding_details') {
    return (
      <TellUsAboutYourInstitution
        typeDef={selectedTypeDef}
        onBack={() => setCurrentScreen('select_type')}
        onSubmit={handleDetailsSubmit}
        onBackToDashboard={institutions.length > 0 ? () => setCurrentScreen('dashboard') : undefined}
      />
    );
  }

  if (currentScreen === 'onboarding_facility' && onboardingInfo) {
    return (
      <FacilityConfiguration
        institutionInfo={onboardingInfo}
        onBack={() => setCurrentScreen('onboarding_details')}
        onSubmit={handleFacilitySubmit}
      />
    );
  }

  if (currentScreen === 'onboarding_resources' && onboardingInfo) {
    return (
      <ResourceConfiguration
        institutionName={onboardingInfo.name}
        onBack={() => setCurrentScreen('onboarding_facility')}
        onSubmit={handleResourcesSubmit}
      />
    );
  }

  if (currentScreen === 'onboarding_datasources' && onboardingInfo) {
    return (
      <DataSourceSelection
        institutionName={onboardingInfo.name}
        selectedResources={onboardingResources}
        onBack={() => setCurrentScreen('onboarding_resources')}
        onSubmit={handleDataSourcesSubmit}
      />
    );
  }

  if (currentScreen === 'generating') {
    return (
      <GeneratingDashboardScreen
        institutionName={currentInstitution.name}
        onComplete={handleGeneratingComplete}
      />
    );
  }

  // ----------------- MAIN PERSONALIZED DASHBOARD ----------------- //

  const hasElectricity = currentInstitution.monitoredResources.includes('electricity');
  const hasWater = currentInstitution.monitoredResources.includes('water');
  const hasWaste = currentInstitution.monitoredResources.includes('waste');

  const tanks = currentInstitution.waterAnalytics?.tanks || [];
  const fullTanks = tanks.filter(
    (t) => t.status === 'full_alert' || t.status === 'overflow_risk' || t.fillPercent >= 95
  );

  const dustbins = currentInstitution.wasteAnalytics?.bins || [];
  const fullDustbins = dustbins.filter((b) => b.fillPercent >= 95);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020718] via-[#071738] to-[#020512] text-slate-100 flex flex-col font-sans">
      {/* 7. Personalized Dashboard Header */}
      <PersonalizedHeader
        institution={currentInstitution}
        institutionsList={institutions}
        onSwitchInstitution={(id) => setCurrentInstitutionId(id)}
        onNewInstitution={() => setCurrentScreen('select_type')}
        onBackToFront={() => setCurrentScreen('select_type')}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenCompare={() => setCompareOpen(true)}
        onOpenChat={() => setChatOpen(true)}
        onOpenEstateMap={() => setActiveTab('estate_map')}
        onRefreshAI={handleRefreshAI}
        isAiRefreshing={isAiRefreshing}
      />

      {/* GLOBAL WATER TANK FULL ALERT BANNER */}
      {fullTanks.length > 0 && !tankAlertDismissed && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900/90 to-[#0c183a] border-b-2 border-rose-500 py-3 px-4 sm:px-6 shadow-2xl relative z-30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/30 border border-rose-400 flex items-center justify-center text-rose-300 flex-shrink-0 animate-pulse">
                <Siren className="w-5 h-5 text-rose-300 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-rose-300 tracking-wider uppercase text-[10px] bg-rose-500/30 px-2 py-0.5 rounded border border-rose-400/40">
                    🚨 CRITICAL WATER TANK ALERT
                  </span>
                  <span className="font-bold text-white">
                    {fullTanks[0].name} ({fullTanks[0].location}) at {fullTanks[0].fillPercent}% Capacity!
                  </span>
                </div>
                <p className="text-rose-100/90 text-[11px] mt-0.5">
                  Stored: <strong className="text-white font-mono">{fullTanks[0].currentLevelLiters.toLocaleString()} / {fullTanks[0].capacityLiters.toLocaleString()} L</strong>.
                  {fullTanks[0].pumpStatus === 'ON' ? (
                    <span className="text-amber-200 font-semibold ml-1">
                      ⚠️ Inflow pump is RUNNING ({fullTanks[0].inflowRateLitersPerMin} L/min). Imminent overflow risk!
                    </span>
                  ) : (
                    <span className="text-emerald-200 font-semibold ml-1">
                      ✓ Inflow pump stopped; tank at maximum limit.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              {fullTanks[0].pumpStatus === 'ON' && (
                <button
                  onClick={() => handleGlobalCutoffPump(fullTanks[0].id)}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black rounded-lg transition-transform hover:scale-105 flex items-center gap-1 shadow-md shadow-rose-950/60"
                >
                  <Power className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Cut Off Pump</span>
                </button>
              )}

              <button
                onClick={() => handleGlobalDrainWater(fullTanks[0].id)}
                className="px-3 py-1.5 bg-[#0a1d42] hover:bg-[#102d64] text-sky-200 border border-sky-400/40 font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                <ArrowDownCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>Divert to Sump (3,000L)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('water');
                  setTankAlertDismissed(false);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1 transition-colors shadow-sm"
              >
                <span>View Tank Telemetry</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => setTankAlertDismissed(true)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-rose-800/40 transition-colors ml-1"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL SMART DUSTBIN FULL ALERT BANNER */}
      {fullDustbins.length > 0 && !wasteAlertDismissed && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900/90 to-[#0c183a] border-b-2 border-rose-500 py-3 px-4 sm:px-6 shadow-2xl relative z-30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/30 border border-rose-400 flex items-center justify-center text-rose-300 flex-shrink-0 animate-bounce">
                <Bell className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-rose-300 tracking-wider uppercase text-[10px] bg-rose-500/30 px-2 py-0.5 rounded border border-rose-400/40">
                    🔔 NEW ALERT
                  </span>
                  <span className="font-bold text-white">
                    🚨 Dustbin Full — Collection Required: {fullDustbins[0].name} ({fullDustbins[0].location}) at {fullDustbins[0].fillPercent}% Capacity!
                  </span>
                </div>
                <p className="text-rose-100/90 text-[11px] mt-0.5">
                  Recommended Action: <strong className="text-white">“Schedule waste collection immediately.”</strong>
                  {fullDustbins[0].collectionStatus === 'Scheduled' && (
                    <span className="text-emerald-300 font-semibold ml-2">✓ Custodial crew dispatched</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              {fullDustbins[0].collectionStatus !== 'Scheduled' && (
                <button
                  onClick={() => handleGlobalScheduleBin(fullDustbins[0].id)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-transform hover:scale-105 flex items-center gap-1 shadow-sm"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>[Schedule Collection]</span>
                </button>
              )}

              <button
                onClick={() => handleGlobalMarkBinCollected(fullDustbins[0].id)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg transition-transform hover:scale-105 flex items-center gap-1 shadow-md shadow-emerald-950/60"
              >
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>[Mark as Collected]</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('waste');
                  setWasteAlertDismissed(false);
                }}
                className="px-3 py-1.5 bg-[#0a1d42] hover:bg-[#102d64] text-sky-200 border border-sky-400/40 font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                <span>View Waste Management</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => setWasteAlertDismissed(true)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-rose-800/40 transition-colors ml-1"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Header / Segmented Tabs */}
      <div className="bg-[#06122d]/90 border-b border-blue-900/40 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setCurrentScreen('select_type')}
              className="px-2.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap text-blue-300 hover:text-white bg-blue-900/30 hover:bg-blue-800/60 border border-blue-500/30 mr-1"
              title="Return to Front screen (Select your Institution Type)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Front Screen</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('estate_map')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'estate_map'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Estate Map</span>
              {fullTanks.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('smart_devices')}
              className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'smart_devices'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-amber-300 hover:text-white hover:bg-amber-500/10 border border-amber-500/30'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Smart Device Control</span>
            </button>

            {hasElectricity && (
              <button
                onClick={() => setActiveTab('energy')}
                className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'energy'
                    ? 'bg-blue-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Energy Intelligence</span>
              </button>
            )}

            {hasWater && (
              <button
                onClick={() => {
                  setActiveTab('water');
                  setTankAlertDismissed(false);
                }}
                className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'water'
                    ? 'bg-blue-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Water Intelligence</span>
                {fullTanks.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse flex items-center gap-1 shadow-sm shadow-rose-500/50">
                    <Siren className="w-3 h-3" />
                    <span>{fullTanks.length} FULL</span>
                  </span>
                )}
              </button>
            )}

            {hasWaste && (
              <button
                onClick={() => {
                  setActiveTab('waste');
                  setWasteAlertDismissed(false);
                }}
                className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'waste'
                    ? 'bg-blue-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Smart Waste ({currentInstitution.metrics.dustbinsCount || dustbins.length})</span>
                {fullDustbins.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse flex items-center gap-1 shadow-sm shadow-rose-500/50">
                    <Bell className="w-3 h-3" />
                    <span>{fullDustbins.length} FULL</span>
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('air_quality')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'air_quality'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              <span>Air & Environment</span>
            </button>

            <button
              onClick={() => setActiveTab('parking')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'parking'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-indigo-400" />
              <span>Smart Parking & Traffic</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse flex items-center gap-1 shadow-sm shadow-rose-500/50">
                <Siren className="w-3 h-3" />
                <span>1 VIOLATION</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'equipment'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Equipment</span>
              {currentInstitution.equipmentAnalytics && currentInstitution.equipmentAnalytics.warningCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('traffic')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'traffic'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Traffic & Transit</span>
            </button>

            <button
              onClick={() => setActiveTab('emissions')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'emissions'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-teal-400" />
              <span>Emissions & Net-Zero</span>
            </button>

            <button
              onClick={() => setActiveTab('climate')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'climate'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Climate & Solar</span>
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'safety'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safety & Readiness</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_insights')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'ai_insights'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Intelligence ({currentInstitution.aiInsights.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('what_if')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'what_if'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>What-If Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('buildings')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'buildings'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Facility Blocks ({currentInstitution.buildings.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabbed Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* BACK TO DASHBOARD NAVIGATION BAR (When on any sub-tab) */}
        {activeTab !== 'overview' && (
          <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
            <button
              onClick={() => setActiveTab('overview')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#091e48] hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 rounded-xl text-xs font-bold transition-all hover:scale-105 shadow-md shadow-blue-950/60 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-blue-300 group-hover:text-white" />
              <span>← Back to Dashboard Overview</span>
            </button>
            <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
              <span className="text-slate-500">Currently viewing:</span>
              <span className="font-bold text-white px-2 py-0.5 rounded bg-blue-950 border border-blue-800/40 uppercase tracking-wider text-[11px]">
                {activeTab.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Sustainability Score Section */}
            <AIFacilityScore institution={currentInstitution} />

            {/* AI Insights Highlight Carousel/Grid */}
            <AIFacilityIntelligence
              institution={currentInstitution}
              onActionClick={(insight) => {
                if (insight.module === 'electricity') setActiveTab('energy');
                else if (insight.module === 'water') setActiveTab('water');
                else if (insight.module === 'waste') setActiveTab('waste');
                else setChatOpen(true);
              }}
            />

            {/* Energy & Water Snapshot Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hasElectricity && (
                <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-6 shadow-xl shadow-blue-950/40">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <h3 className="font-bold text-white text-base">Energy Consumption Snapshot</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('energy')}
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Explore Energy</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-2 border-b border-blue-900/30">
                      <span className="text-slate-400">Total Monthly Draw:</span>
                      <span className="font-bold text-white font-mono">
                        {currentInstitution.energyAnalytics.totalMonthlyKWh.toLocaleString()} kWh
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-900/30">
                      <span className="text-slate-400">Conserved below baseline:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {currentInstitution.energyAnalytics.savedKWh.toLocaleString()} kWh ({currentInstitution.energyAnalytics.savedPercent}%)
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Top Saving Building:</span>
                      <span className="font-semibold text-emerald-400">
                        {currentInstitution.energyAnalytics.highestSavingBuilding}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {hasWater && (
                <div className="bg-[#081635] border border-blue-900/40 rounded-2xl p-6 shadow-xl shadow-blue-950/40">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-sky-400" />
                      <h3 className="font-bold text-white text-base">Water Utilization Snapshot</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('water')}
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Explore Water</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-2 border-b border-blue-900/30">
                      <span className="text-slate-400">Daily Water Consumption:</span>
                      <span className="font-bold text-white font-mono">
                        {currentInstitution.waterAnalytics.totalDailyLiters.toLocaleString()} L/day
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-900/30">
                      <span className="text-slate-400">High Consumption Zone:</span>
                      <span className="font-bold text-sky-400 font-mono">
                        {currentInstitution.waterAnalytics.highConsumptionZone}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Flow Diagnostics:</span>
                      <span className={currentInstitution.waterAnalytics.abnormalUsage ? 'font-semibold text-amber-400' : 'font-semibold text-emerald-400'}>
                        {currentInstitution.waterAnalytics.abnormalUsage ? '⚠️ Elevated draw' : '🟢 Normal pattern'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DOMAIN INTELLIGENCE SNAPSHOT TILES (Air, Parking, Equipment, Traffic, Emissions, Climate, Safety) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>Real-Time Facility Telemetry Matrix</span>
                </h3>
                <span className="text-xs text-slate-400">All 7 active IoT infrastructure domains</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Air Quality */}
                <div
                  onClick={() => setActiveTab('air_quality')}
                  className="bg-[#081635] hover:bg-[#0c204c] border border-blue-900/40 hover:border-sky-500/50 rounded-2xl p-4.5 cursor-pointer transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Air Quality</span>
                    <Wind className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline gap-2 my-1">
                    <span className="text-2xl font-black text-white font-mono">{currentInstitution.airQualityAnalytics?.aqi || 64}</span>
                    <span className="text-[11px] text-sky-300 font-semibold">{currentInstitution.airQualityAnalytics?.aqiLabel || 'Moderate'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    PM2.5: {currentInstitution.airQualityAnalytics?.pm25 || 19} µg/m³ · CO2: {currentInstitution.airQualityAnalytics?.co2 || 495} ppm
                  </p>
                  <span className="text-[10px] text-sky-400 mt-2 block font-medium group-hover:underline">View live sensors →</span>
                </div>

                {/* Parking */}
                <div
                  onClick={() => setActiveTab('parking')}
                  className="bg-[#081635] hover:bg-[#0c204c] border border-blue-900/40 hover:border-indigo-500/50 rounded-2xl p-4.5 cursor-pointer transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Smart Parking</span>
                    <Car className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline gap-2 my-1">
                    <span className="text-2xl font-black text-white font-mono">{currentInstitution.parkingAnalytics?.occupiedSlots || 369}</span>
                    <span className="text-[11px] text-slate-400">/ {currentInstitution.parkingAnalytics?.totalSlots || 500} bays</span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1 line-clamp-1">
                    {currentInstitution.parkingAnalytics?.evChargingOccupied || 18}/{currentInstitution.parkingAnalytics?.evChargingTotal || 24} EV ports in use
                  </p>
                  <span className="text-[10px] text-indigo-400 mt-2 block font-medium group-hover:underline">Explore bays & gates →</span>
                </div>

                {/* Equipment */}
                <div
                  onClick={() => setActiveTab('equipment')}
                  className="bg-[#081635] hover:bg-[#0c204c] border border-blue-900/40 hover:border-amber-500/50 rounded-2xl p-4.5 cursor-pointer transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Machinery Health</span>
                    <Cpu className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline gap-2 my-1">
                    <span className="text-2xl font-black text-emerald-400 font-mono">{currentInstitution.equipmentAnalytics?.overallHealthScore || 89}/100</span>
                    <span className="text-[11px] text-slate-400 font-mono">{currentInstitution.equipmentAnalytics?.uptimePercent || 99.4}% up</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {currentInstitution.equipmentAnalytics?.healthyCount || 5} optimal · {currentInstitution.equipmentAnalytics?.warningCount || 1} advisory
                  </p>
                  <span className="text-[10px] text-amber-400 mt-2 block font-medium group-hover:underline">Check vibration telemetry →</span>
                </div>

                {/* Safety & Compliance */}
                <div
                  onClick={() => setActiveTab('safety')}
                  className="bg-[#081635] hover:bg-[#0c204c] border border-blue-900/40 hover:border-emerald-500/50 rounded-2xl p-4.5 cursor-pointer transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Safety & Readiness</span>
                    <ShieldAlert className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline gap-2 my-1">
                    <span className="text-2xl font-black text-emerald-400 font-mono">{currentInstitution.safetyAnalytics?.complianceScore || 96}/100</span>
                    <span className="text-[11px] text-emerald-300 font-semibold">Tier-1 Pass</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {currentInstitution.safetyAnalytics?.fireHydrantsNormalCount || 28} hydrants ({currentInstitution.safetyAnalytics?.avgWaterPressurePsi || 64.2} PSI)
                  </p>
                  <span className="text-[10px] text-emerald-400 mt-2 block font-medium group-hover:underline">View emergency audit →</span>
                </div>

                {/* Emissions */}
                <div
                  onClick={() => setActiveTab('emissions')}
                  className="bg-[#081635] hover:bg-[#0c204c] border border-blue-900/40 hover:border-teal-500/50 rounded-2xl p-4.5 cursor-pointer transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Carbon Footprint</span>
                    <Leaf className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline gap-2 my-1">
                    <span className="text-2xl font-black text-white font-mono">{currentInstitution.emissionsAnalytics?.totalTonnesCO2e || 52.7}</span>
                    <span className="text-[11px] text-emerald-400 font-semibold">-{currentInstitution.emissionsAnalytics?.reductionVsBaselinePercent || 22}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    Net-Zero Target: {currentInstitution.emissionsAnalytics?.netZeroTargetYear || 2035}
                  </p>
                  <span className="text-[10px] text-teal-400 mt-2 block font-medium group-hover:underline">Scope 1, 2, 3 ledger →</span>
                </div>

                {/* Climate & Weather */}
                <div
                  onClick={() => setActiveTab('climate')}
                  className="bg-[#081635] hover:bg-[#0c204c] border border-blue-900/40 hover:border-amber-500/50 rounded-2xl p-4.5 cursor-pointer transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Local Climate</span>
                    <Sun className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline gap-2 my-1">
                    <span className="text-2xl font-black text-amber-400 font-mono">{currentInstitution.climateWeatherAnalytics?.ambientTempC || 31.4}°C</span>
                    <span className="text-[11px] text-slate-400">{currentInstitution.climateWeatherAnalytics?.condition || 'Partly Cloudy'}</span>
                  </div>
                  <p className="text-[11px] text-amber-300 font-semibold mt-1 line-clamp-1">
                    Solar: {currentInstitution.climateWeatherAnalytics?.solarRadiationWattsM2 || 740} W/m² irradiance
                  </p>
                  <span className="text-[10px] text-amber-400 mt-2 block font-medium group-hover:underline">Solar PV & heat island →</span>
                </div>

                {/* Traffic */}
                <div
                  onClick={() => setActiveTab('traffic')}
                  className="bg-[#081635] hover:bg-[#0c204c] border border-blue-900/40 hover:border-cyan-500/50 rounded-2xl p-4.5 cursor-pointer transition-all shadow-md group col-span-1 sm:col-span-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Internal Traffic & Mobility</span>
                    <Compass className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline gap-3 my-1">
                    <span className="text-2xl font-black text-white font-mono">{currentInstitution.trafficAnalytics?.vehiclesPerHour || 142} <span className="text-xs text-slate-400 font-sans">veh/hr</span></span>
                    <span className="text-xs text-emerald-400 font-semibold">Free-Flow Arterials</span>
                    <span className="text-xs text-slate-400 font-mono">Gate wait: {currentInstitution.trafficAnalytics?.peakGateQueueMins || 3.2}m</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {currentInstitution.trafficAnalytics?.internalTransitBusesActive || 4} transit shuttles running · Avg speed: {currentInstitution.trafficAnalytics?.avgSpeedKmH || 18.5} km/h
                  </p>
                  <span className="text-[10px] text-cyan-400 mt-2 block font-medium group-hover:underline">View transit routes →</span>
                </div>
              </div>
            </div>

            {/* What-If Simulation Teaser */}
            <div className="p-6 bg-gradient-to-r from-blue-950/40 via-[#0a1a3a] to-teal-950/40 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-blue-950/40">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
                  Scenario Engineering
                </span>
                <h3 className="text-lg font-bold text-white">Simulate Institution Interventions</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Test schedule reductions, rooftop solar installations, and greywater recycling to view estimated rupee savings and sustainability index gains.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('what_if')}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
              >
                <span>Launch What-If Simulator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Campus Estate Map Preview Card */}
            <div className="p-6 bg-gradient-to-r from-blue-950/50 via-[#071738] to-[#040e26] border border-blue-900/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-950/40">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                  <Map className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-0.5">
                    Spatial Facility Intelligence
                  </span>
                  <h3 className="text-lg font-bold text-white">Campus Masterplan & Estate Layout Map</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Explore interactive spatial distribution of {currentInstitution.buildings.length} physical blocks, {currentInstitution.waterAnalytics?.tanks?.length || 0} overhead water tanks, and {currentInstitution.metrics.dustbinsCount} smart bins across {currentInstitution.metrics.campusArea}.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('estate_map')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-transform hover:scale-105 flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
              >
                <span>View Full Estate Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Smart Device Control Center Preview Card */}
            <div className="p-6 bg-gradient-to-r from-amber-950/40 via-[#0a1a3a] to-[#040e26] border border-amber-500/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-950/40">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Room-Level IoT Switching & AI Setbacks
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-sky-300 border border-blue-500/30">
                      Simulation & Connected Modes
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Smart Device Control Center</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Remotely inspect and switch individual 💡 Lights (20W), 🌀 Fans (70W), and ❄️ ACs (1200W) room-by-room across all {currentInstitution.buildings.length} facility blocks. Automated AI triggers detect empty rooms with active loads and execute instant setbacks.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('smart_devices')}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Open Device Remote Control</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ESTATE MAP TAB */}
        {activeTab === 'estate_map' && (
          <EstateMap
            institution={currentInstitution}
            onOpenWhatIf={() => setActiveTab('what_if')}
            onOpenChatWithQuery={() => setChatOpen(true)}
            onUpdateTanks={handleUpdateTanks}
            onUpdateBins={handleUpdateBins}
          />
        )}

        {/* SMART DEVICE CONTROL TAB */}
        {activeTab === 'smart_devices' && (
          <SmartDeviceControlDashboard
            institution={currentInstitution}
            onOpenWhatIf={() => setActiveTab('what_if')}
          />
        )}

        {/* ENERGY TAB */}
        {activeTab === 'energy' && hasElectricity && (
          <EnergyDashboard
            institution={currentInstitution}
            onOpenWhatIf={() => setActiveTab('what_if')}
          />
        )}

        {/* WATER TAB */}
        {activeTab === 'water' && hasWater && (
          <WaterDashboard
            institution={currentInstitution}
            onUpdateTanks={handleUpdateTanks}
            onOpenEstateMap={() => setActiveTab('estate_map')}
          />
        )}

        {/* WASTE TAB */}
        {activeTab === 'waste' && hasWaste && (
          <WasteDashboard
            institution={currentInstitution}
            onUpdateBins={handleUpdateBins}
          />
        )}

        {/* AIR QUALITY & ENVIRONMENT TAB */}
        {activeTab === 'air_quality' && (
          <AirQualityDashboard institution={currentInstitution} />
        )}

        {/* PARKING TAB */}
        {activeTab === 'parking' && (
          <ParkingDashboard institution={currentInstitution} />
        )}

        {/* EQUIPMENT TAB */}
        {activeTab === 'equipment' && (
          <EquipmentDashboard institution={currentInstitution} />
        )}

        {/* TRAFFIC & TRANSIT TAB */}
        {activeTab === 'traffic' && (
          <TrafficDashboard institution={currentInstitution} />
        )}

        {/* EMISSIONS & NET-ZERO TAB */}
        {activeTab === 'emissions' && (
          <EmissionsDashboard institution={currentInstitution} />
        )}

        {/* CLIMATE & SOLAR TAB */}
        {activeTab === 'climate' && (
          <ClimateWeatherDashboard institution={currentInstitution} />
        )}

        {/* SAFETY & READINESS TAB */}
        {activeTab === 'safety' && (
          <SafetyDashboard institution={currentInstitution} />
        )}

        {/* AI INSIGHTS TAB */}
        {activeTab === 'ai_insights' && (
          <AIFacilityIntelligence
            institution={currentInstitution}
            onActionClick={(insight) => {
              if (insight.module === 'electricity') setActiveTab('energy');
              else if (insight.module === 'water') setActiveTab('water');
              else if (insight.module === 'waste') setActiveTab('waste');
              else if (insight.module === 'airQuality') setActiveTab('air_quality');
              else if (insight.module === 'parking') setActiveTab('parking');
              else if (insight.module === 'equipment') setActiveTab('equipment');
              else if (insight.module === 'traffic') setActiveTab('traffic');
              else if (insight.module === 'emissions') setActiveTab('emissions');
              else if (insight.module === 'climate') setActiveTab('climate');
              else if (insight.module === 'safety') setActiveTab('safety');
              else setChatOpen(true);
            }}
          />
        )}

        {/* WHAT-IF SIMULATOR TAB */}
        {activeTab === 'what_if' && (
          <WhatIfSimulator institution={currentInstitution} />
        )}

        {/* BUILDINGS TAB */}
        {activeTab === 'buildings' && (
          <FacilityBuildingsView institution={currentInstitution} />
        )}
      </main>

      {/* Floating Ask AI Button (bottom right) */}
      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-full shadow-2xl shadow-emerald-500/30 flex items-center gap-2 transition-transform hover:scale-105"
      >
        <Bot className="w-5 h-5" />
        <span>Ask AI About Campus</span>
      </button>

      {/* Chat Drawer / Modal */}
      <AskAIChatModal
        institution={currentInstitution}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onSimulateShortcut={() => {
          setChatOpen(false);
          setActiveTab('what_if');
        }}
      />

      {/* Institution Profile & Settings Modal */}
      <InstitutionProfileModal
        institution={currentInstitution}
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* Institution Cross-Benchmark Compare Modal */}
      <InstitutionComparisonModal
        institutions={institutions}
        currentInstitutionId={currentInstitution.id}
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        onSelectInstitution={(id) => setCurrentInstitutionId(id)}
      />

      {/* Footer */}
      <footer className="border-t border-blue-950/80 bg-[#030612]/90 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{currentInstitution.name} · EcoXsphere Digital Facility Intelligence System</span>
          <span className="text-slate-500">Model: Gemini 3.8 Flash & Deterministic IoT Telemetry Engine</span>
        </div>
      </footer>
    </div>
  );
}

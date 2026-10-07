export type InstitutionType =
  | 'College / University'
  | 'Hospital'
  | 'School'
  | 'Government Office'
  | 'Industrial Facility'
  | 'Industrial Estate'
  | 'Corporate Campus'
  | 'Residential Township'
  | 'Residential / Township'
  | 'Government Institution'
  | 'Research Institute / Laboratory'
  | 'Shopping Mall / Commercial Complex'
  | 'Hotel'
  | 'Other';

export type ResourceType =
  | 'electricity'
  | 'water'
  | 'waste'
  | 'airQuality'
  | 'parking'
  | 'equipment'
  | 'traffic'
  | 'emissions'
  | 'climate'
  | 'safety';

export type DataSourceType =
  | 'smart_meter'
  | 'flow_meter'
  | 'ultrasonic_sensor'
  | 'environmental_sensor'
  | 'iot_camera'
  | 'manual_entry'
  | 'upload_csv'
  | 'api'
  | 'synthetic_sample';

export interface DataSourceConfig {
  type: DataSourceType;
  label: string;
  isSynthetic: boolean;
  lastSync: string;
  csvFileName?: string;
  recordCount?: number;
}

export interface Building {
  id: string;
  name: string;
  type: string;
  areaSqFt: number;
  floors: number;
  occupancy: number;
  majorEquipment: string;
  monthlyElectricityKWh: number;
  dailyWaterLiters: number;
  expectedElectricityKWh: number;
  expectedWaterLiters: number;
  notes?: string;
}

export type WasteType = 'Organic / Wet' | 'Dry / Recyclable' | 'Biomedical / Hazardous' | 'General Solid' | 'E-Waste';
export type WasteFillStatus = 'normal' | 'filling' | 'almost_full' | 'full';
export type DustbinCollectionStatus = 'Normal' | 'Pending' | 'Scheduled' | 'Collected';

export interface WasteBin {
  id: string; // e.g. "Dustbin #B-204" or "B-204"
  name: string; // e.g. "Dustbin #B-204"
  location: string; // e.g. "Block A, Ground Floor"
  building?: string; // e.g. "Block A"
  area?: string; // e.g. "Ground Floor Foyer"
  wasteType?: WasteType;
  fillPercent: number; // 0-100%
  fillRatePerHour: number;
  predictedOverflowHours: number;
  status: 'normal' | 'warning' | 'critical';
  fillCategory?: WasteFillStatus; // 'normal' (0-49%), 'filling' (50-79%), 'almost_full' (80-94%), 'full' (95-100%)
  lastUpdated?: string;
  collectionStatus?: DustbinCollectionStatus;
  scheduledAt?: string;
  clearedAt?: string;
  priority?: 'High' | 'Medium' | 'Low';
}

export type ParkingZoneCategory = 'authorized' | 'no_parking';

export interface SmartParkingZone {
  zoneId: string;
  zoneName: string;
  category: ParkingZoneCategory;
  description: string;
  totalSlots: number;
  occupiedSlots: number;
  isRestricted: boolean;
  restrictionReason?: string;
}

export type VehicleType = 'Sedan' | 'SUV' | 'Motorcycle' | 'Delivery Van' | 'Electric Bus' | 'Ambulance';

export interface MonitoredVehicle {
  vehicleId: string; // e.g. "DL-01-AB-1234"
  vehicleType: VehicleType;
  zoneId: string;
  zoneName: string;
  zoneCategory: ParkingZoneCategory;
  entryTime: string;
  parkedDurationMins: number;
  isViolation: boolean;
  violationReason?: string;
  sirenActive?: boolean;
  securityDispatched?: boolean;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface ParkingViolationIncident {
  incidentId: string;
  timestamp: string;
  vehiclePlate: string;
  vehicleType: VehicleType;
  zoneName: string;
  violationReason: string;
  status: 'Active Violation' | 'Security Dispatched' | 'Resolved (Relocated)';
  sirenSounded: boolean;
  resolvedAt?: string;
}

export interface WaterTank {
  id: string;
  name: string;
  location: string;
  type: 'overhead' | 'sump' | 'fire_reserve' | 'recycled_stp';
  capacityLiters: number;
  currentLevelLiters: number;
  fillPercent: number;
  status: 'normal' | 'filling' | 'full_alert' | 'overflow_risk';
  inflowRateLitersPerMin: number;
  pumpStatus: 'ON' | 'OFF' | 'AUTO_CUTOFF';
  lastAutoShutoff?: string;
  timeToFullMinutes?: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'chiller' | 'boiler' | 'pump' | 'transformer' | 'generator' | 'elevator' | 'compressor';
  location: string;
  healthScore: number; // 0 - 100
  status: 'healthy' | 'warning' | 'critical';
  runHoursTotal: number;
  vibrationMmSec: number;
  tempC: number;
  loadPercent: number;
  nextMaintenanceDue: string;
  aiAnomaly?: string;
}

export interface EquipmentAnalytics {
  totalCount: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  overallHealthScore: number;
  uptimePercent: number;
  preventiveAlertsCount: number;
  items: EquipmentItem[];
  aiInsight: string;
}

export interface AirZoneSensor {
  zoneId: string;
  zoneName: string;
  aqi: number;
  pm25: number;
  pm10: number;
  co2: number;
  tempC: number;
  humidity: number;
  status: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
}

export interface AirQualityAnalytics {
  aqi: number;
  aqiLabel: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
  pm25: number;
  pm10: number;
  co2: number;
  vocPpb: number;
  o3Ppb: number;
  tempC: number;
  humidity: number;
  noiseLevelDba: number;
  status: string;
  zones: AirZoneSensor[];
  aiInsight: string;
}

export interface ParkingBayZone {
  zoneName: string;
  totalSlots: number;
  occupiedSlots: number;
  utilizationPercent: number;
  type: 'Standard' | 'EV Charging' | 'Two-Wheeler' | 'Handicapped' | 'VIP/Fleet';
}

export interface ParkingAnalytics {
  totalSlots: number;
  occupiedSlots: number;
  utilizationPercent: number;
  evChargingTotal: number;
  evChargingOccupied: number;
  twoWheelerTotal: number;
  twoWheelerOccupied: number;
  fourWheelerTotal: number;
  fourWheelerOccupied: number;
  handicapTotal: number;
  handicapOccupied: number;
  gateFlowRatePerMin: number;
  peakHours: string;
  congestionRisk: 'low' | 'moderate' | 'high';
  zones: ParkingBayZone[];
  aiInsight: string;
}

export interface TrafficAnalytics {
  vehiclesPerHour: number;
  internalTransitBusesActive: number;
  avgSpeedKmH: number;
  speedLimitKmH: number;
  congestionIndex: 'low' | 'moderate' | 'high';
  peakGateQueueMins: number;
  bottleneckLocation: string;
  pedestrianPeakHour: string;
  dailyVehicleFootfall: number;
  aiInsight: string;
}

export interface EmissionsAnalytics {
  scope1DieselGasTonnes: number;
  scope2GridTonnes: number;
  scope3CommuteWasteTonnes: number;
  totalTonnesCO2e: number;
  baselineYearTonnes: number;
  reductionVsBaselinePercent: number;
  carbonOffsetCreditsTonnes: number;
  netZeroTargetYear: number;
  intensityPerCapitaKg: number;
  aiInsight: string;
}

export interface ClimateWeatherAnalytics {
  ambientTempC: number;
  feelsLikeTempC: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Thunderstorm' | 'Extreme Heat';
  humidityPercent: number;
  windSpeedKmH: number;
  windDirection: string;
  solarRadiationWattsM2: number;
  uvIndex: number;
  rainfallMm: number;
  heatIslandIndexC: number;
  coolingDegreeDays: number;
  forecastSummary: string;
  extremeWeatherAlert?: string;
  aiInsight: string;
}

export interface SafetyIncidentItem {
  id: string;
  title: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  time: string;
  status: 'resolved' | 'monitoring' | 'action_required';
}

export interface SafetyAnalytics {
  complianceScore: number; // 0 - 100
  fireHydrantsTotal: number;
  fireHydrantsNormalCount: number;
  avgWaterPressurePsi: number;
  emergencyExitsClearPercent: number;
  musterPointHeadcount: number;
  cctvCoveragePercent: number;
  activeSensorsCount: number;
  gasDetectorStatus: 'All Clear' | 'Caution' | 'Elevated';
  recentIncidents: SafetyIncidentItem[];
  aiInsight: string;
}

export interface AIInsightItem {
  id: string;
  type: 'critical' | 'warning' | 'positive' | 'recommendation';
  title: string;
  message: string;
  metricImpact?: string;
  module: ResourceType | 'facility';
  actionable?: boolean;
  actionLabel?: string;
  isResolved?: boolean;
}

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  icon: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  metrics: {
    buildingsCount: number;
    occupancyCount: number; // Students or Employees
    campusArea: string; // e.g. "25 acres"
    floorsCount: number;
    classroomsCount: number;
    laboratoriesCount: number;
    hostelsCount: number;
    parkingAreasCount: number;
    vehiclesCount: number;
    dustbinsCount: number;
    waterTanksCount: number;
    avgDailyWaterLiters: number;
    avgMonthlyElectricityKWh: number;
    acUnitsCount: number;
    fansCount: number;
    lightsCount: number;
    majorMachinesCount: number;
    notes?: string;
  };
  buildings: Building[];
  monitoredResources: ResourceType[];
  dataSources: Partial<Record<ResourceType, DataSourceConfig>>;
  
  // Dynamic analytics computed for this institution
  status: 'good' | 'warning' | 'attention_needed';
  overallSummary: string;
  
  sustainabilityScore: {
    overall: number;
    breakdown: Record<string, number>;
    explanation: string;
  };

  energyAnalytics: {
    totalMonthlyKWh: number;
    expectedMonthlyKWh: number;
    savedKWh: number;
    savedPercent: number;
    highestConsumptionBuilding: string;
    highestSavingBuilding: string;
    buildingBreakdown: {
      buildingId: string;
      buildingName: string;
      actualKWh: number;
      expectedKWh: number;
      savedKWh: number;
    }[];
    aiInsight: string;
  };

  waterAnalytics: {
    totalDailyLiters: number;
    expectedDailyLiters: number;
    savedLiters: number;
    abnormalUsage: boolean;
    highConsumptionZone: string;
    totalTanks: number;
    tanks: WaterTank[];
    fullTankAlertCount: number;
    activePumpCount: number;
    zoneBreakdown: {
      buildingId: string;
      buildingName: string;
      actualLiters: number;
      expectedLiters: number;
      status: string;
    }[];
    aiInsight: string;
  };

  wasteAnalytics: {
    totalBins: number;
    normalCount: number;
    nearlyFullCount: number;
    criticalCount: number;
    bins: WasteBin[];
    aiInsight: string;
  };

  airQualityAnalytics?: AirQualityAnalytics;
  parkingAnalytics?: ParkingAnalytics;
  equipmentAnalytics?: EquipmentAnalytics;
  trafficAnalytics?: TrafficAnalytics;
  emissionsAnalytics?: EmissionsAnalytics;
  climateWeatherAnalytics?: ClimateWeatherAnalytics;
  safetyAnalytics?: SafetyAnalytics;

  aiInsights: AIInsightItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  dataHighlights?: { label: string; value: string }[];
}

export interface WhatIfSimulationInput {
  acReductionPercent: number;
  solarCapacityKW: number;
  greywaterRecyclingPercent: number;
  smartBinRouteOptimization: boolean;
  ledRetrofitPercent: number;
}

export interface WhatIfSimulationResult {
  currentMonthlyEnergyKWh: number;
  simulatedMonthlyEnergyKWh: number;
  monthlyEnergySavedKWh: number;
  energySavingPercent: number;
  monthlyCostSavingINR: number;
  carbonReductionTons: number;
  currentDailyWaterLiters: number;
  simulatedDailyWaterLiters: number;
  dailyWaterSavedLiters: number;
  wasteOverflowReductionPercent: number;
  simulatedSustainabilityScore: number;
  scoreDelta: number;
  aiAssessment: string;
}

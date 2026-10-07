import {
  Institution,
  Building,
  WasteBin,
  WaterTank,
  AIInsightItem,
  ResourceType,
  DataSourceConfig,
  WhatIfSimulationInput,
  WhatIfSimulationResult,
  EquipmentItem,
  EquipmentAnalytics,
  AirQualityAnalytics,
  ParkingAnalytics,
  TrafficAnalytics,
  EmissionsAnalytics,
  ClimateWeatherAnalytics,
  SafetyAnalytics,
  AirZoneSensor,
  ParkingBayZone,
  SafetyIncidentItem,
} from '../types/institution';

export function calculateInstitutionAnalytics(
  inst: Omit<
    Institution,
    | 'status'
    | 'overallSummary'
    | 'sustainabilityScore'
    | 'energyAnalytics'
    | 'waterAnalytics'
    | 'wasteAnalytics'
    | 'airQualityAnalytics'
    | 'parkingAnalytics'
    | 'equipmentAnalytics'
    | 'trafficAnalytics'
    | 'emissionsAnalytics'
    | 'climateWeatherAnalytics'
    | 'safetyAnalytics'
    | 'aiInsights'
    | 'createdAt'
    | 'updatedAt'
  > & {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    airQualityAnalytics?: AirQualityAnalytics;
    parkingAnalytics?: ParkingAnalytics;
    equipmentAnalytics?: EquipmentAnalytics;
    trafficAnalytics?: TrafficAnalytics;
    emissionsAnalytics?: EmissionsAnalytics;
    climateWeatherAnalytics?: ClimateWeatherAnalytics;
    safetyAnalytics?: SafetyAnalytics;
    energyAnalytics?: any;
    waterAnalytics?: any;
    wasteAnalytics?: any;
    status?: 'good' | 'warning' | 'attention_needed';
    overallSummary?: string;
    sustainabilityScore?: any;
    aiInsights?: AIInsightItem[];
  }
): Institution {
  const { metrics, buildings, monitoredResources } = inst;

  // 1. Energy Analytics calculation
  let totalMonthlyKWh = metrics.avgMonthlyElectricityKWh || 0;
  const buildingKWhSum = buildings.reduce((acc, b) => acc + (b.monthlyElectricityKWh || 0), 0);
  if (buildingKWhSum > 0) {
    totalMonthlyKWh = buildingKWhSum;
  }

  let expectedMonthlyKWhTotal = 0;
  const buildingBreakdown = buildings.map((b) => {
    const benchmarkKWh =
      b.expectedElectricityKWh ||
      Math.round(
        (b.areaSqFt * 1.35) +
          (b.occupancy * 12) +
          (b.type.toLowerCase().includes('lab') ? 3500 : 0) +
          (b.type.toLowerCase().includes('hostel') ? 4000 : 0) +
          (b.type.toLowerCase().includes('icu') ? 8000 : 0)
      );
    const actual = b.monthlyElectricityKWh || Math.round(benchmarkKWh * 0.95);
    const saved = benchmarkKWh - actual;
    expectedMonthlyKWhTotal += benchmarkKWh;
    return {
      buildingId: b.id,
      buildingName: b.name,
      actualKWh: actual,
      expectedKWh: benchmarkKWh,
      savedKWh: saved,
    };
  });

  if (expectedMonthlyKWhTotal === 0) {
    expectedMonthlyKWhTotal = Math.round(totalMonthlyKWh * 1.1);
  }

  const savedKWh = Math.max(0, expectedMonthlyKWhTotal - totalMonthlyKWh);
  const savedPercent =
    expectedMonthlyKWhTotal > 0
      ? Math.round((savedKWh / expectedMonthlyKWhTotal) * 100)
      : 0;

  const sortedByConsumption = [...buildingBreakdown].sort((a, b) => b.actualKWh - a.actualKWh);
  const sortedBySaving = [...buildingBreakdown].sort((a, b) => b.savedKWh - a.savedKWh);

  const highestConsumptionBuilding =
    sortedByConsumption[0]?.buildingName || buildings[0]?.name || 'Main Facility';
  const highestSavingBuilding =
    sortedBySaving[0]?.savedKWh > 0
      ? sortedBySaving[0].buildingName
      : sortedBySaving[0]?.buildingName || 'Academic Wing';

  const energyAiInsight =
    sortedBySaving[0]?.savedKWh > 0
      ? `${highestSavingBuilding} achieved the highest estimated energy saving this month (${Math.abs(sortedBySaving[0].savedKWh).toLocaleString()} kWh saved).`
      : `${highestConsumptionBuilding} is consuming ${sortedByConsumption[0]?.actualKWh.toLocaleString()} kWh/month, representing the primary opportunity for HVAC scheduling.`;

  // 2. Water Analytics calculation
  let totalDailyLiters = metrics.avgDailyWaterLiters || 0;
  const buildingWaterSum = buildings.reduce((acc, b) => acc + (b.dailyWaterLiters || 0), 0);
  if (buildingWaterSum > 0) {
    totalDailyLiters = buildingWaterSum;
  }

  let expectedDailyLitersTotal = 0;
  const zoneBreakdown = buildings.map((b) => {
    const benchmarkLiters =
      b.expectedWaterLiters ||
      Math.round(
        (b.occupancy * 32) +
          (b.type.toLowerCase().includes('hostel') ? 25000 : 0) +
          (b.type.toLowerCase().includes('lab') ? 8000 : 0) +
          (b.type.toLowerCase().includes('icu') ? 12000 : 0)
      );
    const actual = b.dailyWaterLiters || Math.round(benchmarkLiters * 1.05);
    expectedDailyLitersTotal += benchmarkLiters;

    let status = 'normal';
    if (actual > benchmarkLiters * 1.2) {
      status = 'elevated_possible_leak';
    } else if (actual < benchmarkLiters * 0.85) {
      status = 'efficient';
    }

    return {
      buildingId: b.id,
      buildingName: b.name,
      actualLiters: actual,
      expectedLiters: benchmarkLiters,
      status,
    };
  });

  if (expectedDailyLitersTotal === 0) {
    expectedDailyLitersTotal = Math.round(totalDailyLiters * 0.95);
  }

  const savedWaterLiters = Math.max(0, expectedDailyLitersTotal - totalDailyLiters);
  const abnormalUsage = zoneBreakdown.some((z) => z.status === 'elevated_possible_leak');
  const elevatedZone = zoneBreakdown.find((z) => z.status === 'elevated_possible_leak');
  const highConsumptionZone =
    elevatedZone?.buildingName ||
    [...zoneBreakdown].sort((a, b) => b.actualLiters - a.actualLiters)[0]?.buildingName ||
    'Main Block';

  const waterAiInsight = abnormalUsage
    ? `Possible leakage / abnormal water usage detected in ${highConsumptionZone}. Sustained non-zero nocturnal flow observed; physical inspection advised.`
    : `Water distribution operating within normal hydraulic tolerances campus-wide (${totalDailyLiters.toLocaleString()} L/day).`;

  // Water Tanks Setup
  const totalWaterTanks = Math.max(2, metrics.waterTanksCount || 4);
  const existingTanks = (inst as any).waterAnalytics?.tanks || [];
  const tanks: WaterTank[] = [];

  const tankTemplates = [
    { name: 'Overhead Tank A', loc: 'Block A Rooftop', type: 'overhead' as const, cap: 25000, level: 23800, fill: 95, status: 'full_alert' as const, inflow: 0, pump: 'AUTO_CUTOFF' as const },
    { name: 'Overhead Tank B', loc: 'Block B Rooftop', type: 'overhead' as const, cap: 30000, level: 21600, fill: 72, status: 'normal' as const, inflow: 0, pump: 'OFF' as const },
    { name: 'Central Underground Sump', loc: 'Utility Yard', type: 'sump' as const, cap: 75000, level: 56250, fill: 75, status: 'normal' as const, inflow: 0, pump: 'OFF' as const },
    { name: 'Hostel Reserve Tank', loc: 'Hostel Terrace', type: 'overhead' as const, cap: 35000, level: 31500, fill: 90, status: 'filling' as const, inflow: 45, pump: 'ON' as const },
    { name: 'Emergency Fire Reserve', loc: 'Basement Level 1', type: 'fire_reserve' as const, cap: 50000, level: 49000, fill: 98, status: 'normal' as const, inflow: 0, pump: 'OFF' as const },
    { name: 'Recycled STP Water Tank', loc: 'Eco Park', type: 'recycled_stp' as const, cap: 20000, level: 12400, fill: 62, status: 'filling' as const, inflow: 25, pump: 'ON' as const },
  ];

  for (let i = 0; i < totalWaterTanks; i++) {
    const tmpl = tankTemplates[i % tankTemplates.length];
    const existing = existingTanks.find((t: WaterTank) => t.id === `tank-${i + 1}`);

    if (existing) {
      tanks.push(existing);
      continue;
    }

    const timeToFull = tmpl.inflow > 0 ? Math.max(2, Math.round((tmpl.cap - tmpl.level) / tmpl.inflow)) : undefined;

    tanks.push({
      id: `tank-${i + 1}`,
      name: i === 0 ? tmpl.name : `${tmpl.name} #${i + 1}`,
      location: tmpl.loc,
      type: tmpl.type,
      capacityLiters: tmpl.cap,
      currentLevelLiters: tmpl.level,
      fillPercent: tmpl.fill,
      status: tmpl.status,
      inflowRateLitersPerMin: tmpl.inflow,
      pumpStatus: tmpl.pump,
      timeToFullMinutes: timeToFull,
    });
  }

  const fullTankAlertCount = tanks.filter((t) => t.status === 'full_alert' || t.status === 'overflow_risk' || t.fillPercent >= 95).length;
  const activePumpCount = tanks.filter((t) => t.pumpStatus === 'ON').length;

  // 3. Waste Analytics
  const totalDustbins = Math.max(4, metrics.dustbinsCount || 20);
  const wasteTypesList: ('Organic / Wet' | 'Dry / Recyclable' | 'Biomedical / Hazardous' | 'General Solid' | 'E-Waste')[] = 
    inst.type.toLowerCase().includes('hospital') || inst.type.toLowerCase().includes('lab')
      ? ['Biomedical / Hazardous', 'Dry / Recyclable', 'Organic / Wet', 'General Solid', 'E-Waste']
      : ['Dry / Recyclable', 'Organic / Wet', 'General Solid', 'E-Waste', 'Dry / Recyclable'];

  const areaTemplates = [
    'Ground Floor Foyer',
    'Cafeteria & Dining Courtyard',
    '1st Floor West Corridor',
    'Main Entrance Lobby',
    '2nd Floor Laboratories',
    'Basement Utility & Parking',
    '3rd Floor Conference Hall',
    'Central Outdoor Plaza',
    'Staff Room & Pantry',
    'Logistics & Dispatch Bay',
  ];

  const bins: WasteBin[] = [];
  const buildingNames = buildings.length > 0 ? buildings.map((b) => b.name) : ['Block A', 'Block B', 'Main Block', 'Facility Center'];

  // Specifically seed the canonical example Dustbin #B-204 from prompt
  bins.push({
    id: 'B-204',
    name: 'Dustbin #B-204',
    building: buildingNames[0] || 'Block A',
    area: 'Ground Floor',
    location: `${buildingNames[0] || 'Block A'}, Ground Floor`,
    wasteType: wasteTypesList[0],
    fillPercent: 96,
    fillRatePerHour: 8,
    predictedOverflowHours: 0.5,
    status: 'critical',
    fillCategory: 'full',
    lastUpdated: 'Just now',
    collectionStatus: 'Pending',
    priority: 'High',
  });

  // Seed second canonical prediction example (82% fill, predicted overflow in ~2h)
  bins.push({
    id: 'B-108',
    name: 'Dustbin #B-108',
    building: buildingNames[1] || buildingNames[0] || 'Block B',
    area: 'Cafeteria Courtyard',
    location: `${buildingNames[1] || buildingNames[0] || 'Block B'}, Cafeteria Courtyard`,
    wasteType: wasteTypesList[1],
    fillPercent: 82,
    fillRatePerHour: 9,
    predictedOverflowHours: 2.0,
    status: 'warning',
    fillCategory: 'almost_full',
    lastUpdated: '2 mins ago',
    collectionStatus: 'Pending',
    priority: 'High',
  });

  // Generate remaining dustbins distributed across buildings
  for (let i = 3; i <= Math.min(totalDustbins, 28); i++) {
    const bld = buildingNames[(i - 1) % buildingNames.length];
    const area = areaTemplates[(i - 1) % areaTemplates.length];
    const binNumber = 100 + i * 4;
    const wType = wasteTypesList[(i - 1) % wasteTypesList.length];

    let fillPercent: number;
    let status: 'normal' | 'warning' | 'critical';
    let fillCategory: 'normal' | 'filling' | 'almost_full' | 'full';
    let fillRate = 3 + (i % 6);
    let priority: 'High' | 'Medium' | 'Low' = 'Low';

    if (i === 4) {
      fillPercent = 91;
      status = 'critical';
      fillCategory = 'almost_full';
      priority = 'High';
    } else if (i % 5 === 0) {
      fillPercent = 74;
      status = 'warning';
      fillCategory = 'filling';
      priority = 'Medium';
    } else if (i % 3 === 0) {
      fillPercent = 58;
      status = 'warning';
      fillCategory = 'filling';
      priority = 'Medium';
    } else {
      fillPercent = 20 + ((i * 7) % 28);
      status = 'normal';
      fillCategory = 'normal';
      priority = 'Low';
    }

    const hoursLeft = Math.max(0.5, Number(((100 - fillPercent) / Math.max(1, fillRate)).toFixed(1)));

    bins.push({
      id: `B-${binNumber}`,
      name: `Dustbin #B-${binNumber}`,
      building: bld,
      area,
      location: `${bld}, ${area}`,
      wasteType: wType,
      fillPercent,
      fillRatePerHour: fillRate,
      predictedOverflowHours: hoursLeft,
      status,
      fillCategory,
      lastUpdated: `${(i % 5) + 1} mins ago`,
      collectionStatus: fillPercent >= 95 ? 'Pending' : 'Normal',
      priority,
    });
  }

  const criticalCount = bins.filter((b) => b.fillPercent >= 95 || b.status === 'critical').length;
  const nearlyFullCount = bins.filter((b) => b.fillPercent >= 80 && b.fillPercent < 95).length;
  const normalCount = bins.filter((b) => b.fillPercent < 50).length;

  const overflowBin = bins.find((b) => b.fillPercent >= 95) || bins.find((b) => b.fillPercent >= 85) || bins[0];
  const wasteAiInsight = overflowBin
    ? `Dustbin #${overflowBin.id} (${overflowBin.location}) has reached ${overflowBin.fillPercent}% capacity. Immediate collection required. Predicted overflow in ${overflowBin.predictedOverflowHours} hours.`
    : `All ${totalDustbins} registered smart bins operating within standard fill velocity limits.`;

  // 4. Air Quality & Environment Analytics
  const airZones: AirZoneSensor[] = [
    { zoneId: 'z-outdoor', zoneName: 'Campus Central Quad & Main Gate', aqi: 68, pm25: 22, pm10: 48, co2: 415, tempC: 29.2, humidity: 58, status: 'Moderate' },
    { zoneId: 'z-acad', zoneName: 'Academic Lecture Theatres', aqi: 45, pm25: 12, pm10: 28, co2: 560, tempC: 24.1, humidity: 52, status: 'Good' },
    { zoneId: 'z-lab', zoneName: 'Advanced Laboratories & Research', aqi: 52, pm25: 14, pm10: 32, co2: 480, tempC: 22.5, humidity: 48, status: 'Good' },
    { zoneId: 'z-dining', zoneName: 'Cafeteria & Dining Hall', aqi: 75, pm25: 26, pm10: 55, co2: 640, tempC: 26.8, humidity: 65, status: 'Moderate' },
    { zoneId: 'z-library', zoneName: 'Central Library Silent Floors', aqi: 38, pm25: 9, pm10: 20, co2: 440, tempC: 23.5, humidity: 50, status: 'Good' },
  ];

  const airQualityAnalytics: AirQualityAnalytics = {
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
    zones: airZones,
    aiInsight: 'Indoor CO2 levels remain well below ASHRAE threshold (800 ppm). Increased fresh air intake recommended for Canteen zone between 12:30 PM - 2:00 PM.',
  };

  // 5. Smart Parking Analytics
  const parkingZones: ParkingBayZone[] = [
    { zoneName: 'North Executive & Faculty Bay', totalSlots: 80, occupiedSlots: 68, utilizationPercent: 85, type: 'Standard' },
    { zoneName: 'Green Mobility EV Charging Hub', totalSlots: 24, occupiedSlots: 18, utilizationPercent: 75, type: 'EV Charging' },
    { zoneName: 'South Multi-Tier Two-Wheeler Lot', totalSlots: 320, occupiedSlots: 245, utilizationPercent: 76, type: 'Two-Wheeler' },
    { zoneName: 'Visitor & Logistics Gate Bay', totalSlots: 60, occupiedSlots: 34, utilizationPercent: 57, type: 'Standard' },
    { zoneName: 'Accessible & Emergency Response Bay', totalSlots: 16, occupiedSlots: 4, utilizationPercent: 25, type: 'Handicapped' },
  ];

  const totalParkingSlots = parkingZones.reduce((sum, z) => sum + z.totalSlots, 0);
  const occupiedParkingSlots = parkingZones.reduce((sum, z) => sum + z.occupiedSlots, 0);
  const parkingUtilization = Math.round((occupiedParkingSlots / totalParkingSlots) * 100);

  const parkingAnalytics: ParkingAnalytics = {
    totalSlots: totalParkingSlots,
    occupiedSlots: occupiedParkingSlots,
    utilizationPercent: parkingUtilization,
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
    congestionRisk: parkingUtilization > 85 ? 'high' : parkingUtilization > 70 ? 'moderate' : 'low',
    zones: parkingZones,
    aiInsight: `EV Charging station utilization is at 75% (18/24 bays). Peak inflow recorded at North Gate. Predicted turnover will open 32 bays before 1:00 PM.`,
  };

  // 6. Equipment & Predictive Maintenance Analytics
  const equipmentItems: EquipmentItem[] = [
    {
      id: 'eq-chiller-1',
      name: 'HVAC Central Water-Cooled Chiller #1',
      category: 'chiller',
      location: 'Central Utility Plant Basement',
      healthScore: 94,
      status: 'healthy',
      runHoursTotal: 4820,
      vibrationMmSec: 1.8,
      tempC: 44.2,
      loadPercent: 78,
      nextMaintenanceDue: 'In 45 days',
    },
    {
      id: 'eq-chiller-2',
      name: 'HVAC Variable Speed Chiller #2',
      category: 'chiller',
      location: 'Block B Plant Room',
      healthScore: 78,
      status: 'warning',
      runHoursTotal: 6240,
      vibrationMmSec: 4.6,
      tempC: 56.8,
      loadPercent: 88,
      nextMaintenanceDue: 'In 6 days',
      aiAnomaly: 'Bearing vibration frequency spike detected in compressor shaft (4.6 mm/s vs 2.5 mm/s baseline).',
    },
    {
      id: 'eq-dg-1',
      name: 'Standby Diesel Generator Set (1000 kVA)',
      category: 'generator',
      location: 'Substation Yard',
      healthScore: 98,
      status: 'healthy',
      runHoursTotal: 310,
      vibrationMmSec: 1.2,
      tempC: 28.0,
      loadPercent: 0,
      nextMaintenanceDue: 'In 90 days',
    },
    {
      id: 'eq-pump-main',
      name: 'Main Hydro-Pneumatic Domestic Water Pump',
      category: 'pump',
      location: 'Pumping Station',
      healthScore: 89,
      status: 'healthy',
      runHoursTotal: 3410,
      vibrationMmSec: 2.1,
      tempC: 38.5,
      loadPercent: 65,
      nextMaintenanceDue: 'In 28 days',
    },
    {
      id: 'eq-trans-1',
      name: '11kV / 415V Step-Down Oil Transformer',
      category: 'transformer',
      location: 'Main Substation',
      healthScore: 92,
      status: 'healthy',
      runHoursTotal: 14200,
      vibrationMmSec: 0.9,
      tempC: 52.0,
      loadPercent: 72,
      nextMaintenanceDue: 'In 60 days',
    },
    {
      id: 'eq-lift-1',
      name: 'Academic Tower High-Speed Passenger Elevator #1',
      category: 'elevator',
      location: 'Block A Core',
      healthScore: 86,
      status: 'healthy',
      runHoursTotal: 5120,
      vibrationMmSec: 1.4,
      tempC: 32.1,
      loadPercent: 55,
      nextMaintenanceDue: 'In 18 days',
    },
  ];

  const eqHealthy = equipmentItems.filter((e) => e.status === 'healthy').length;
  const eqWarning = equipmentItems.filter((e) => e.status === 'warning').length;
  const eqCritical = equipmentItems.filter((e) => e.status === 'critical').length;
  const avgHealth = Math.round(
    equipmentItems.reduce((acc, e) => acc + e.healthScore, 0) / equipmentItems.length
  );

  const equipmentAnalytics: EquipmentAnalytics = {
    totalCount: equipmentItems.length,
    healthyCount: eqHealthy,
    warningCount: eqWarning,
    criticalCount: eqCritical,
    overallHealthScore: avgHealth,
    uptimePercent: 99.4,
    preventiveAlertsCount: eqWarning + eqCritical,
    items: equipmentItems,
    aiInsight: 'Chiller #2 in Block B exhibits elevated shaft vibration (4.6 mm/s). Preventive bearing lubrication scheduled to prevent unplanned shutdown.',
  };

  // 7. Traffic & Mobility Analytics
  const trafficAnalytics: TrafficAnalytics = {
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

  // 8. Emissions & Carbon Net-Zero Analytics
  const monthlyKWhToTonnes = (totalMonthlyKWh * 0.82) / 1000;
  const scope1Tonnes = Number((monthlyKWhToTonnes * 0.15).toFixed(1));
  const scope2Tonnes = Number(monthlyKWhToTonnes.toFixed(1));
  const scope3Tonnes = Number((monthlyKWhToTonnes * 0.28).toFixed(1));
  const totalTonnes = Number((scope1Tonnes + scope2Tonnes + scope3Tonnes).toFixed(1));

  const emissionsAnalytics: EmissionsAnalytics = {
    scope1DieselGasTonnes: scope1Tonnes,
    scope2GridTonnes: scope2Tonnes,
    scope3CommuteWasteTonnes: scope3Tonnes,
    totalTonnesCO2e: totalTonnes,
    baselineYearTonnes: Number((totalTonnes * 1.28).toFixed(1)),
    reductionVsBaselinePercent: 22,
    carbonOffsetCreditsTonnes: 14.5,
    netZeroTargetYear: 2035,
    intensityPerCapitaKg: Math.round((totalTonnes * 1000) / Math.max(100, metrics.occupancyCount || 1000)),
    aiInsight: `Campus has reduced carbon emissions by 22% compared to historical baseline through rooftop solar PV arrays and LED smart scheduling.`,
  };

  // 9. Climate & Weather Analytics
  const climateWeatherAnalytics: ClimateWeatherAnalytics = {
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

  // 10. Safety & Emergency Compliance Analytics
  const safetyIncidents: SafetyIncidentItem[] = [
    {
      id: 'inc-1',
      title: 'Routine Fire Suppression Pressure Test Completed',
      location: 'Block A & B Hydrant Ring',
      severity: 'low',
      time: 'Today 09:15 AM',
      status: 'resolved',
    },
    {
      id: 'inc-2',
      title: 'Emergency Exit Corridor Clearance Verified',
      location: 'Central Library Ground Floor',
      severity: 'low',
      time: 'Yesterday 04:30 PM',
      status: 'resolved',
    },
  ];

  const safetyAnalytics: SafetyAnalytics = {
    complianceScore: 96,
    fireHydrantsTotal: 28,
    fireHydrantsNormalCount: 28,
    avgWaterPressurePsi: 64.2,
    emergencyExitsClearPercent: 100,
    musterPointHeadcount: 0,
    cctvCoveragePercent: 98.4,
    activeSensorsCount: 84,
    gasDetectorStatus: 'All Clear',
    recentIncidents: safetyIncidents,
    aiInsight: 'All 28 fire hydrants maintain optimal hydraulic head (64.2 PSI). All emergency exits are 100% unobstructed with zero active hazardous warnings.',
  };

  // 11. Calculate Sustainability Score
  const energyScore = savedPercent >= 10 ? 86 : 74;
  const waterScore = abnormalUsage ? 68 : 84;
  const wasteScore = criticalCount > 3 ? 72 : 82;
  const aqiScore = 84;
  const parkingScore = 88;
  const equipmentScore = avgHealth;
  const safetyScore = 96;
  const carbonScore = 82;

  const scoreMap: Record<string, number> = {
    Energy: energyScore,
    Water: waterScore,
    Waste: wasteScore,
    'Air Quality': aqiScore,
    Parking: parkingScore,
    Equipment: equipmentScore,
    Safety: safetyScore,
    'Carbon Footprint': carbonScore,
  };

  const scoreValues = Object.values(scoreMap);
  const overallScore = Math.round(
    scoreValues.reduce((sum, val) => sum + val, 0) / (scoreValues.length || 1)
  );

  let scoreExplanation = `Your strongest monitored domain is Safety & Air Quality (${safetyScore}/100). `;
  if (abnormalUsage) {
    scoreExplanation += 'Immediate improvement priority: Address abnormal water draw in elevated zones.';
  } else if (criticalCount > 0) {
    scoreExplanation += 'Immediate improvement priority: Clear designated high-traffic waste bins.';
  } else {
    scoreExplanation += 'All primary indicators are balanced near or above benchmark targets.';
  }

  // 12. Facility Status
  let facilityStatus: 'good' | 'warning' | 'attention_needed' = 'good';
  if ((abnormalUsage && criticalCount > 2) || fullTankAlertCount > 0) {
    facilityStatus = 'warning';
  } else if (abnormalUsage || criticalCount > 0) {
    facilityStatus = 'warning';
  }

  let overallSummary = `Facility systems are operating stably across energy, water, air quality, safety, and parking domains.`;
  if (fullTankAlertCount > 0) {
    overallSummary = `Water tank at ${tanks.find((t) => t.status === 'full_alert' || t.fillPercent >= 95)?.name} is at maximum capacity with auto-cutoff engaged; other facility systems operating stably.`;
  }

  // 13. AI Insights
  const aiInsights: AIInsightItem[] = [];

  // Critical Insights: Water Tank Full Alert
  const overflowTank = tanks.find((t) => t.status === 'overflow_risk' || t.status === 'full_alert' || t.fillPercent >= 95);
  if (overflowTank) {
    aiInsights.push({
      id: 'insight-crit-tank-full',
      type: 'critical',
      module: 'water',
      title: `Critical Alert: ${overflowTank.name} Reached ${overflowTank.fillPercent}% Capacity`,
      message: `${overflowTank.name} (${overflowTank.location}) is at ${overflowTank.fillPercent}% fill (${overflowTank.currentLevelLiters.toLocaleString()} / ${overflowTank.capacityLiters.toLocaleString()} L). ${overflowTank.pumpStatus === 'ON' ? `Inflow pump is RUNNING at ${overflowTank.inflowRateLitersPerMin} L/min! Overflow risk imminent without cutoff.` : 'Inflow pump auto-cutoff engaged; tank at maximum limit.'}`,
      metricImpact: `${overflowTank.fillPercent}% Full · Inflow ${overflowTank.inflowRateLitersPerMin} L/min`,
      actionable: true,
      actionLabel: 'Cut Off Inflow Pump',
    });
  }

  if (elevatedZone) {
    aiInsights.push({
      id: 'insight-crit-water',
      type: 'critical',
      module: 'water',
      title: `${elevatedZone.buildingName} Water Consumption Exceeds Baseline`,
      message: `${elevatedZone.buildingName} is drawing ${elevatedZone.actualLiters.toLocaleString()} L/day, which is ~${Math.round(
        ((elevatedZone.actualLiters - elevatedZone.expectedLiters) / elevatedZone.expectedLiters) * 100
      )}% above baseline (${elevatedZone.expectedLiters.toLocaleString()} L/day). Inspect plumbing fixtures and laboratory wet circuits.`,
      metricImpact: `+${(elevatedZone.actualLiters - elevatedZone.expectedLiters).toLocaleString()} L/day excess`,
      actionable: true,
      actionLabel: 'Inspect Fixtures & Valves',
    });
  }

  // Equipment anomaly insight
  const warnEquip = equipmentItems.find((e) => e.status === 'warning' || e.status === 'critical');
  if (warnEquip) {
    aiInsights.push({
      id: 'insight-warn-equip',
      type: 'warning',
      module: 'equipment',
      title: `Predictive Maintenance: ${warnEquip.name}`,
      message: warnEquip.aiAnomaly || `${warnEquip.name} exhibits vibration levels of ${warnEquip.vibrationMmSec} mm/s and requires bearing inspection.`,
      metricImpact: `Health Score: ${warnEquip.healthScore}/100`,
      actionable: true,
      actionLabel: 'Schedule Service Dispatch',
    });
  }

  // Parking & Air Quality insights
  aiInsights.push({
    id: 'insight-rec-ev-parking',
    type: 'recommendation',
    module: 'parking',
    title: 'EV Charging Bay Expansion Advisory',
    message: `EV charging utilization averaged 75% this morning. Reallocating 6 standard bays to Level-2 EV smart chargers will reduce employee turnaround latency.`,
    metricImpact: '6 bays recommended',
    actionable: true,
    actionLabel: 'View Parking Map',
  });

  aiInsights.push({
    id: 'insight-rec-air-cooling',
    type: 'positive',
    module: 'airQuality',
    title: 'Indoor IAQ & Carbon Performance Clean',
    message: `Average indoor CO2 levels remain at 495 ppm and ambient AQI is 64 (Satisfactory). Solar irradiance is generating 740 W/m² rooftop power.`,
    metricImpact: 'AQI 64 · CO2 495 ppm',
  });

  return {
    ...inst,
    status: facilityStatus,
    overallSummary,
    sustainabilityScore: {
      overall: overallScore,
      breakdown: scoreMap,
      explanation: scoreExplanation,
    },
    energyAnalytics: {
      totalMonthlyKWh,
      expectedMonthlyKWh: expectedMonthlyKWhTotal,
      savedKWh,
      savedPercent,
      highestConsumptionBuilding,
      highestSavingBuilding,
      buildingBreakdown,
      aiInsight: energyAiInsight,
    },
    waterAnalytics: {
      totalDailyLiters,
      expectedDailyLiters: expectedDailyLitersTotal,
      savedLiters: savedWaterLiters,
      abnormalUsage,
      highConsumptionZone,
      totalTanks: totalWaterTanks,
      tanks,
      fullTankAlertCount,
      activePumpCount,
      zoneBreakdown,
      aiInsight: waterAiInsight,
    },
    wasteAnalytics: {
      totalBins: totalDustbins,
      normalCount,
      nearlyFullCount,
      criticalCount,
      bins,
      aiInsight: wasteAiInsight,
    },
    airQualityAnalytics,
    parkingAnalytics,
    equipmentAnalytics,
    trafficAnalytics,
    emissionsAnalytics,
    climateWeatherAnalytics,
    safetyAnalytics,
    aiInsights,
    createdAt: inst.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function runWhatIfSimulation(
  institution: Institution,
  input: WhatIfSimulationInput
): WhatIfSimulationResult {
  const currentEnergy = institution.energyAnalytics.totalMonthlyKWh;
  const currentWater = institution.waterAnalytics.totalDailyLiters;

  const acLoadRatio = 0.45;
  const acSavings = currentEnergy * acLoadRatio * (input.acReductionPercent / 100);
  const solarGenKWh = input.solarCapacityKW * 120;
  const ledSavings = currentEnergy * 0.15 * 0.4 * (input.ledRetrofitPercent / 100);

  const totalEnergySaved = Math.round(acSavings + solarGenKWh + ledSavings);
  const simulatedMonthlyEnergy = Math.max(0, currentEnergy - totalEnergySaved);
  const energySavingPercent = Math.min(
    100,
    Math.round((totalEnergySaved / (currentEnergy || 1)) * 100)
  );

  const monthlyCostSavingINR = Math.round(totalEnergySaved * 8.5);
  const carbonReductionTons = Number(((totalEnergySaved * 0.82) / 1000).toFixed(2));

  const dailyWaterSaved = Math.round(currentWater * (input.greywaterRecyclingPercent / 100) * 0.4);
  const simulatedDailyWater = Math.max(0, currentWater - dailyWaterSaved);

  const wasteOverflowReductionPercent = input.smartBinRouteOptimization ? 65 : 0;

  const scoreBoost = Math.round(
    (energySavingPercent * 0.4) +
      ((dailyWaterSaved / (currentWater || 1)) * 30) +
      (input.smartBinRouteOptimization ? 4 : 0)
  );
  const simulatedSustainabilityScore = Math.min(
    99,
    institution.sustainabilityScore.overall + scoreBoost
  );

  const aiAssessment = `Simulating a ${input.acReductionPercent}% AC schedule setback combined with ${
    input.solarCapacityKW > 0 ? `${input.solarCapacityKW} kW solar PV and ` : ''
  }${input.greywaterRecyclingPercent}% greywater recycling projects a monthly reduction of ${totalEnergySaved.toLocaleString()} kWh (${energySavingPercent}% reduction) and ~₹${monthlyCostSavingINR.toLocaleString()} in utility expenditures. Campus sustainability score increases from ${
    institution.sustainabilityScore.overall
  } to ${simulatedSustainabilityScore}/100.`;

  return {
    currentMonthlyEnergyKWh: currentEnergy,
    simulatedMonthlyEnergyKWh: simulatedMonthlyEnergy,
    monthlyEnergySavedKWh: totalEnergySaved,
    energySavingPercent,
    monthlyCostSavingINR,
    carbonReductionTons,
    currentDailyWaterLiters: currentWater,
    simulatedDailyWaterLiters: simulatedDailyWater,
    dailyWaterSavedLiters: dailyWaterSaved,
    wasteOverflowReductionPercent,
    simulatedSustainabilityScore,
    scoreDelta: simulatedSustainabilityScore - institution.sustainabilityScore.overall,
    aiAssessment,
  };
}

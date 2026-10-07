import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_INSTITUTIONS } from './src/data/initialInstitutions.ts';
import { calculateInstitutionAnalytics, runWhatIfSimulation } from './src/services/syntheticEngine.ts';
import { Institution, WhatIfSimulationInput, ChatMessage } from './src/types/institution.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory store initialized with seed institutions
let institutionsStore: Institution[] = [...INITIAL_INSTITUTIONS];

// Shared Gemini client setup with recommended aistudio-build header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ----------------- API ROUTES ----------------- //

// GET all institutions
app.get('/api/institutions', (req, res) => {
  res.json({ institutions: institutionsStore });
});

// GET single institution by ID
app.get('/api/institutions/:id', (req, res) => {
  const inst = institutionsStore.find((i) => i.id === req.params.id);
  if (!inst) {
    return res.status(404).json({ error: 'Institution not found' });
  }
  res.json({ institution: inst });
});

// POST save / create institution
app.post('/api/institutions', (req, res) => {
  try {
    const rawData = req.body;
    const enriched = calculateInstitutionAnalytics({
      ...rawData,
      id: rawData.id || `inst-${Date.now()}`,
    });

    const existingIndex = institutionsStore.findIndex((i) => i.id === enriched.id);
    if (existingIndex >= 0) {
      institutionsStore[existingIndex] = enriched;
    } else {
      institutionsStore.unshift(enriched);
    }

    res.json({ institution: enriched });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to save institution' });
  }
});

// PUT update institution
app.put('/api/institutions/:id', (req, res) => {
  try {
    const id = req.params.id;
    const rawData = req.body;
    const enriched = calculateInstitutionAnalytics({
      ...rawData,
      id,
    });

    const index = institutionsStore.findIndex((i) => i.id === id);
    if (index >= 0) {
      institutionsStore[index] = enriched;
    } else {
      institutionsStore.unshift(enriched);
    }

    res.json({ institution: enriched });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update institution' });
  }
});

// DELETE institution
app.delete('/api/institutions/:id', (req, res) => {
  const id = req.params.id;
  institutionsStore = institutionsStore.filter((i) => i.id !== id);
  res.json({ success: true, remaining: institutionsStore.length });
});

// POST Deep AI Analysis of an Institution using Gemini
app.post('/api/institution/analyze', async (req, res) => {
  try {
    const institution: Institution = req.body;
    if (!institution) {
      return res.status(400).json({ error: 'Institution payload is required' });
    }

    // Default calculated fallback
    const computed = calculateInstitutionAnalytics(institution);

    if (!ai) {
      return res.json({
        institution: computed,
        source: 'local_engine',
        note: 'Calculated via deterministic facility intelligence models',
      });
    }

    // Prepare contextual prompt for Gemini
    const buildingContext = institution.buildings
      .map(
        (b) =>
          `- ${b.name} (${b.type}): Actual Energy: ${b.monthlyElectricityKWh} kWh/mo (Exp: ${b.expectedElectricityKWh}), Actual Water: ${b.dailyWaterLiters} L/day (Exp: ${b.expectedWaterLiters}), Area: ${b.areaSqFt} sq ft, Occupancy: ${b.occupancy}, Major Equip: ${b.majorEquipment}`
      )
      .join('\n');

    const prompt = `You are a senior Facility Intelligence & Sustainability AI Architect.
Analyze the following real institution data:

Institution Name: ${institution.name}
Type: ${institution.type}
Location: ${institution.location.city}, ${institution.location.state}, ${institution.location.country}
Buildings (${institution.metrics.buildingsCount}):
${buildingContext}
Campus Area: ${institution.metrics.campusArea}
Students / Employees: ${institution.metrics.occupancyCount}
Total Dustbins: ${institution.metrics.dustbinsCount}
AC Units: ${institution.metrics.acUnitsCount}
Total Monthly Electricity: ${institution.energyAnalytics?.totalMonthlyKWh || institution.metrics.avgMonthlyElectricityKWh} kWh
Total Daily Water: ${institution.waterAnalytics?.totalDailyLiters || institution.metrics.avgDailyWaterLiters} Liters/day
Monitored Resources: ${institution.monitoredResources.join(', ')}

Please provide a personalized, quantitative assessment:
1. Overall summary (1-2 sentences on current performance, highlighting specific areas of strength and concern).
2. Energy insight: Specific building analysis (highest consumer, highest saver with exact numbers).
3. Water insight: Specific zone analysis (abnormal draws or well-controlled zones; do NOT claim pipe leak without flow sensor confirmation).
4. Waste insight: Dustbin capacity risk.
5. Sustainability Score explanation.
6. 3-4 structured insights with: type ('critical' | 'warning' | 'positive' | 'recommendation'), title, message referencing specific buildings, metricImpact, module ('electricity'|'water'|'waste'|'airQuality'|'parking').

Respond in strictly valid JSON format matching this schema:
{
  "overallSummary": "string",
  "facilityStatus": "good" | "warning" | "attention_needed",
  "energyAiInsight": "string",
  "waterAiInsight": "string",
  "wasteAiInsight": "string",
  "scoreExplanation": "string",
  "insights": [
    {
      "type": "critical" | "warning" | "positive" | "recommendation",
      "module": "electricity" | "water" | "waste" | "airQuality" | "parking",
      "title": "string",
      "message": "string",
      "metricImpact": "string",
      "actionable": boolean,
      "actionLabel": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.overallSummary) {
          computed.overallSummary = parsed.overallSummary;
        }
        if (parsed.facilityStatus) {
          computed.status = parsed.facilityStatus;
        }
        if (parsed.energyAiInsight) {
          computed.energyAnalytics.aiInsight = parsed.energyAiInsight;
        }
        if (parsed.waterAiInsight) {
          computed.waterAnalytics.aiInsight = parsed.waterAiInsight;
        }
        if (parsed.wasteAiInsight) {
          computed.wasteAnalytics.aiInsight = parsed.wasteAiInsight;
        }
        if (parsed.scoreExplanation) {
          computed.sustainabilityScore.explanation = parsed.scoreExplanation;
        }
        if (Array.isArray(parsed.insights) && parsed.insights.length > 0) {
          computed.aiInsights = parsed.insights.map((item: any, idx: number) => ({
            id: `ai-gen-${Date.now()}-${idx}`,
            type: item.type || 'recommendation',
            module: item.module || 'facility',
            title: item.title,
            message: item.message,
            metricImpact: item.metricImpact,
            actionable: item.actionable ?? true,
            actionLabel: item.actionLabel || 'View Details',
          }));
        }

        return res.json({
          institution: computed,
          source: 'gemini_3.8_flash',
        });
      } catch (err) {
        console.error('Failed to parse Gemini response JSON:', err);
      }
    }

    res.json({ institution: computed, source: 'local_engine' });
  } catch (error: any) {
    console.error('Error during AI analysis:', error);
    // Return baseline computed analytics on failure
    const fallback = calculateInstitutionAnalytics(req.body);
    res.json({ institution: fallback, source: 'fallback_engine' });
  }
});

// POST Chat with AI About Your Institution
app.post('/api/institution/chat', async (req, res) => {
  try {
    const { institution, message, history } = req.body as {
      institution: Institution;
      message: string;
      history?: ChatMessage[];
    };

    if (!institution || !message) {
      return res.status(400).json({ error: 'Institution and message are required' });
    }

    const { metrics, buildings, energyAnalytics, waterAnalytics, wasteAnalytics, sustainabilityScore } = institution;

    // Local heuristic responses for instant offline support or quick replies
    const lower = message.toLowerCase();

    if (!ai) {
      let reply = `Based on data for **${institution.name}**:\n\n`;
      let highlights: { label: string; value: string }[] = [];

      if (lower.includes('energy') || lower.includes('saving') || lower.includes('electricity') || lower.includes('kwh')) {
        reply += `• Total Monthly Consumption: **${energyAnalytics.totalMonthlyKWh.toLocaleString()} kWh** (Baseline: ${energyAnalytics.expectedMonthlyKWh.toLocaleString()} kWh)\n`;
        reply += `• Energy Conserved: **${energyAnalytics.savedKWh.toLocaleString()} kWh** (${energyAnalytics.savedPercent}% reduction)\n`;
        reply += `• Highest Consumption Building: **${energyAnalytics.highestConsumptionBuilding}**\n`;
        reply += `• Leading Saving Building: **${energyAnalytics.highestSavingBuilding}**\n\n`;
        reply += `${energyAnalytics.aiInsight}`;
        highlights = [
          { label: 'Saved Energy', value: `${energyAnalytics.savedKWh.toLocaleString()} kWh` },
          { label: 'Top Saver', value: energyAnalytics.highestSavingBuilding },
        ];
      } else if (lower.includes('tank') || lower.includes('water') || lower.includes('liters') || lower.includes('overflow')) {
        const fullTanks = (waterAnalytics.tanks || []).filter(
          (t) => t.status === 'full_alert' || t.status === 'overflow_risk' || t.fillPercent >= 95
        );
        reply += `• Total Daily Water Draw: **${waterAnalytics.totalDailyLiters.toLocaleString()} L/day**\n`;
        reply += `• High Consumption Zone: **${waterAnalytics.highConsumptionZone}**\n`;
        reply += `• Monitored Water Tanks: **${waterAnalytics.totalTanks || (waterAnalytics.tanks || []).length} tanks**\n`;
        if (fullTanks.length > 0) {
          reply += `🚨 **FULL TANK ALERT:** **${fullTanks[0].name} (${fullTanks[0].location})** has reached **${fullTanks[0].fillPercent}% capacity** (${fullTanks[0].currentLevelLiters.toLocaleString()} / ${fullTanks[0].capacityLiters.toLocaleString()} L). `;
          if (fullTanks[0].pumpStatus === 'ON') {
            reply += `Inflow pump is RUNNING at ${fullTanks[0].inflowRateLitersPerMin} L/min! Auto-cutoff recommended to prevent spillage.\n\n`;
          } else {
            reply += `Pump has been stopped; tank is at maximum storage limit.\n\n`;
          }
        } else {
          reply += `🟢 All campus water tanks are operating within safe storage capacities.\n\n`;
        }
        reply += `${waterAnalytics.aiInsight}`;
        highlights = [
          { label: 'Daily Water', value: `${waterAnalytics.totalDailyLiters.toLocaleString()} L/day` },
          { label: 'Tank Alerts', value: `${fullTanks.length} tank(s) full` },
        ];
      } else if (lower.includes('dustbin') || lower.includes('bin') || lower.includes('waste') || lower.includes('overflow')) {
        const critBin = wasteAnalytics.bins.find((b) => b.status === 'critical') || wasteAnalytics.bins[0];
        reply += `• Total Registered Bins: **${wasteAnalytics.totalBins}**\n`;
        reply += `• Status breakdown: 🟢 ${wasteAnalytics.normalCount} normal · 🟡 ${wasteAnalytics.nearlyFullCount} nearly full · 🔴 ${wasteAnalytics.criticalCount} high overflow risk\n`;
        if (critBin) {
          reply += `• First Overflow Risk: **${critBin.name} (${critBin.location})** at **${critBin.fillPercent}%** fill (~${critBin.predictedOverflowHours} hours remaining until overflow).\n\n`;
        }
        reply += `${wasteAnalytics.aiInsight}`;
        highlights = [
          { label: 'Critical Bins', value: `${wasteAnalytics.criticalCount}` },
          { label: 'Next Overflow', value: critBin ? critBin.name : 'None' },
        ];
      } else if (lower.includes('score') || lower.includes('sustainability')) {
        reply += `• Sustainability Score: **${sustainabilityScore.overall}/100**\n`;
        reply += `• Breakdown: Energy: ${sustainabilityScore.breakdown['Energy'] || 82}, Water: ${sustainabilityScore.breakdown['Water'] || 70}, Waste: ${sustainabilityScore.breakdown['Waste'] || 74}\n\n`;
        reply += `${sustainabilityScore.explanation}`;
        highlights = [
          { label: 'Campus Score', value: `${sustainabilityScore.overall}/100` },
        ];
      } else {
        reply += `Currently monitoring **${buildings.length} buildings** across **${metrics.campusArea}** for **${metrics.occupancyCount.toLocaleString()} occupants**.\n\n`;
        reply += `• Monthly Power: ${energyAnalytics.totalMonthlyKWh.toLocaleString()} kWh\n`;
        reply += `• Daily Water: ${waterAnalytics.totalDailyLiters.toLocaleString()} L/day\n`;
        reply += `• Dustbins: ${metrics.dustbinsCount} active points\n\n`;
        reply += `How can I help analyze your facility today? You can ask about energy conservation, water anomalies, bin overflow alerts, or what-if simulations!`;
      }

      return res.json({
        reply,
        highlights,
        source: 'local_engine',
      });
    }

    // Call Gemini with full factual context
    const buildingFacts = buildings
      .map(
        (b) =>
          `[${b.name} (${b.type})]: Area ${b.areaSqFt} sqft, Occupants ${b.occupancy}, Energy ${b.monthlyElectricityKWh} kWh (baseline ${b.expectedElectricityKWh}), Water ${b.dailyWaterLiters} L/day (baseline ${b.expectedWaterLiters}), Equipment: ${b.majorEquipment}, Notes: ${b.notes || 'None'}`
      )
      .join('\n');

    const binFacts = wasteAnalytics.bins
      .slice(0, 10)
      .map(
        (b) =>
          `[${b.name} - ${b.location}]: ${b.fillPercent}% full, fill rate ${b.fillRatePerHour}%/hr, overflow in ~${b.predictedOverflowHours}h, status: ${b.status}`
      )
      .join('\n');

    const conversationHistory = (history || [])
      .slice(-6)
      .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n');

    const systemInstruction = `You are the dedicated AI Facility Intelligence Advisor for ${institution.name} located in ${institution.location.city}, ${institution.location.state}.
Answer the user's questions strictly using the exact numbers and facilities provided below.
Rules:
- Never make up fictional buildings or numbers. If asked about a building not on the list, clarify politely.
- Always provide clear, direct numbers with units (kWh, L/day, hours, %).
- Do NOT declare a confirmed water pipe leak without dedicated acoustic or differential pressure telemetry (advise physical inspection instead).
- Be crisp, professional, helpful, and concise (2-4 paragraphs maximum, bullet points preferred).

FACILITY DATA FOR ${institution.name}:
Type: ${institution.type}
Total Buildings: ${buildings.length}
Campus Area: ${metrics.campusArea}
Students / Employees: ${metrics.occupancyCount.toLocaleString()}
Total AC Units: ${metrics.acUnitsCount}, Fans: ${metrics.fansCount}, Lights: ${metrics.lightsCount}
Monthly Electricity: ${energyAnalytics.totalMonthlyKWh.toLocaleString()} kWh (Baseline: ${energyAnalytics.expectedMonthlyKWh.toLocaleString()} kWh, Saved: ${energyAnalytics.savedKWh.toLocaleString()} kWh [${energyAnalytics.savedPercent}%])
Highest Energy Building: ${energyAnalytics.highestConsumptionBuilding}
Highest Saving Building: ${energyAnalytics.highestSavingBuilding}
Daily Water: ${waterAnalytics.totalDailyLiters.toLocaleString()} L/day (Baseline: ${waterAnalytics.expectedDailyLiters.toLocaleString()} L/day, High zone: ${waterAnalytics.highConsumptionZone})
Dustbins: Total ${wasteAnalytics.totalBins} (Normal: ${wasteAnalytics.normalCount}, Warning: ${wasteAnalytics.nearlyFullCount}, Critical: ${wasteAnalytics.criticalCount})
Water Tanks: Total ${waterAnalytics.totalTanks || (waterAnalytics.tanks || []).length} tanks (Alert/Full: ${waterAnalytics.fullTankAlertCount || 0}, Active Inflow Pumps: ${waterAnalytics.activePumpCount || 0})
Sustainability Score: ${sustainabilityScore.overall}/100

AIR QUALITY & ENVIRONMENT:
AQI: ${institution.airQualityAnalytics?.aqi || 64} (${institution.airQualityAnalytics?.aqiLabel || 'Moderate'}), PM2.5: ${institution.airQualityAnalytics?.pm25 || 19} µg/m³, PM10: ${institution.airQualityAnalytics?.pm10 || 44} µg/m³, CO2: ${institution.airQualityAnalytics?.co2 || 495} ppm, VOC: ${institution.airQualityAnalytics?.vocPpb || 115} ppb, Temp: ${institution.airQualityAnalytics?.tempC || 28.5}°C, Humidity: ${institution.airQualityAnalytics?.humidity || 56}%, Noise: ${institution.airQualityAnalytics?.noiseLevelDba || 48} dBA.

PARKING & TRANSIT:
Total Bays: ${institution.parkingAnalytics?.totalSlots || 500}, Occupied: ${institution.parkingAnalytics?.occupiedSlots || 369} (${institution.parkingAnalytics?.utilizationPercent || 74}%), EV Charging: ${institution.parkingAnalytics?.evChargingOccupied || 18}/${institution.parkingAnalytics?.evChargingTotal || 24} in use, Gate Flow: ${institution.parkingAnalytics?.gateFlowRatePerMin || 14} veh/min, Peak Hours: ${institution.parkingAnalytics?.peakHours || '09:00 AM - 10:45 AM'}.

EQUIPMENT & PREDICTIVE MAINTENANCE:
Fleet Health: ${institution.equipmentAnalytics?.overallHealthScore || 89}/100, Uptime: ${institution.equipmentAnalytics?.uptimePercent || 99.4}%, Machines Monitored: ${institution.equipmentAnalytics?.totalCount || 6} (${institution.equipmentAnalytics?.healthyCount || 5} optimal, ${institution.equipmentAnalytics?.warningCount || 1} advisory).

TRAFFIC & INTERNAL MOBILITY:
Vehicles: ${institution.trafficAnalytics?.vehiclesPerHour || 142} veh/hr, Active Shuttles: ${institution.trafficAnalytics?.internalTransitBusesActive || 4}, Avg Speed: ${institution.trafficAnalytics?.avgSpeedKmH || 18.5} km/h (Limit: ${institution.trafficAnalytics?.speedLimitKmH || 25} km/h), Gate Queue: ${institution.trafficAnalytics?.peakGateQueueMins || 3.2} mins.

CARBON EMISSIONS & NET-ZERO:
Total Carbon: ${institution.emissionsAnalytics?.totalTonnesCO2e || 52.7} Tonnes CO2e (-${institution.emissionsAnalytics?.reductionVsBaselinePercent || 22}% vs baseline), Target Net-Zero: ${institution.emissionsAnalytics?.netZeroTargetYear || 2035}, Carbon Offset Credits: ${institution.emissionsAnalytics?.carbonOffsetCreditsTonnes || 14.5} T.

LOCAL CLIMATE & SOLAR RADIATION:
Ambient Temp: ${institution.climateWeatherAnalytics?.ambientTempC || 31.4}°C (Feels like ${institution.climateWeatherAnalytics?.feelsLikeTempC || 34.2}°C), Condition: ${institution.climateWeatherAnalytics?.condition || 'Partly Cloudy'}, Solar Radiation: ${institution.climateWeatherAnalytics?.solarRadiationWattsM2 || 740} W/m² (Peak PV output), UV Index: ${institution.climateWeatherAnalytics?.uvIndex || 7.8}.

SAFETY & EMERGENCY COMPLIANCE:
Compliance Score: ${institution.safetyAnalytics?.complianceScore || 96}/100, Fire Hydrants: ${institution.safetyAnalytics?.fireHydrantsNormalCount || 28}/${institution.safetyAnalytics?.fireHydrantsTotal || 28} Ready, Line Pressure: ${institution.safetyAnalytics?.avgWaterPressurePsi || 64.2} PSI, Emergency Exits: ${institution.safetyAnalytics?.emergencyExitsClearPercent || 100}% Clear, Gas Detectors: ${institution.safetyAnalytics?.gasDetectorStatus || 'All Clear'}.

WATER TANKS TELEMETRY:
${(waterAnalytics.tanks || [])
  .map(
    (t) =>
      `[${t.name} - ${t.location}]: ${t.fillPercent}% full (${t.currentLevelLiters}/${t.capacityLiters} L), Pump: ${t.pumpStatus}, Inflow: ${t.inflowRateLitersPerMin} L/min, Status: ${t.status}`
  )
  .join('\n')}

BUILDINGS BREAKDOWN:
${buildingFacts}

WASTE BINS SAMPLE:
${binFacts}`;

    const prompt = `${conversationHistory ? `RECENT CONVERSATION:\n${conversationHistory}\n\n` : ''}USER QUESTION: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'Unable to generate analysis at this time.';

    // Extract quick metric highlights
    const highlights: { label: string; value: string }[] = [];
    if (reply.includes('kWh')) {
      highlights.push({ label: 'Power Monitored', value: `${energyAnalytics.totalMonthlyKWh.toLocaleString()} kWh` });
    }
    if (reply.includes('L/day') || reply.includes('water')) {
      highlights.push({ label: 'Water Monitored', value: `${waterAnalytics.totalDailyLiters.toLocaleString()} L/day` });
    }
    if (reply.includes('Bin') || reply.includes('overflow')) {
      highlights.push({ label: 'Critical Bins', value: `${wasteAnalytics.criticalCount} bins` });
    }

    res.json({
      reply,
      highlights,
      source: 'gemini_3.8_flash',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'AI Assistant service unavailable' });
  }
});

// POST What-If Simulation
app.post('/api/institution/simulate', async (req, res) => {
  try {
    const { institution, input } = req.body as {
      institution: Institution;
      input: WhatIfSimulationInput;
    };

    if (!institution || !input) {
      return res.status(400).json({ error: 'Institution and simulation input required' });
    }

    const result = runWhatIfSimulation(institution, input);

    // If Gemini is available, generate a tailored executive engineering commentary
    if (ai) {
      try {
        const prompt = `As a Facility Energy Engineer, write a 2-sentence executive summary for the following simulated upgrade at ${institution.name}:
- AC schedule reduction: ${input.acReductionPercent}%
- Rooftop Solar PV: ${input.solarCapacityKW} kW
- Greywater recycling: ${input.greywaterRecyclingPercent}%
- Smart Bin compaction: ${input.smartBinRouteOptimization ? 'Enabled' : 'Disabled'}
Result:
- Monthly Energy Saved: ${result.monthlyEnergySavedKWh.toLocaleString()} kWh (${result.energySavingPercent}%)
- Monthly Utility Cost Reduction: ~₹${result.monthlyCostSavingINR.toLocaleString()}
- Daily Water Saved: ${result.dailyWaterSavedLiters.toLocaleString()} L/day
- Score Increase: from ${institution.sustainabilityScore.overall} to ${result.simulatedSustainabilityScore}/100.
Keep it strictly professional and grounded in numbers.`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        if (aiResponse.text) {
          result.aiAssessment = aiResponse.text.trim();
        }
      } catch (err) {
        console.error('Simulation Gemini commentary skipped:', err);
      }
    }

    res.json({ result });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Simulation failed' });
  }
});

// ----------------- VITE / STATIC SERVING ----------------- //

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Facility Intelligence Server running on port ${PORT}`);
  });
}

startServer();

// Mock data for frontend development - will be replaced by real API calls
// This simulates the backend responses for testing the UI

import type { FloodReport, WardRisk, Hotspot, DashboardData, RainfallData } from "./api"

export const delhiWards: WardRisk[] = [
  {
    ward_id: "1",
    ward_name: "Connaught Place",
    risk_score: 72,
    risk_level: "HIGH",
    rainfall_intensity: 85,
    flood_recurrence_index: 65,
    hotspot_persistence: 70,
    drainage_stress_index: 75,
    population_exposure: 80,
    report_count: 12,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [77.205, 28.625],
          [77.225, 28.625],
          [77.23, 28.635],
          [77.225, 28.645],
          [77.21, 28.648],
          [77.2, 28.64],
          [77.205, 28.625],
        ],
      ],
    },
  },
  {
    ward_id: "2",
    ward_name: "Karol Bagh",
    risk_score: 58,
    risk_level: "MEDIUM",
    rainfall_intensity: 60,
    flood_recurrence_index: 55,
    hotspot_persistence: 50,
    drainage_stress_index: 65,
    population_exposure: 70,
    report_count: 8,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [77.175, 28.645],
          [77.195, 28.642],
          [77.2, 28.655],
          [77.195, 28.668],
          [77.178, 28.67],
          [77.17, 28.658],
          [77.175, 28.645],
        ],
      ],
    },
  },
  {
    ward_id: "3",
    ward_name: "Rohini",
    risk_score: 45,
    risk_level: "MEDIUM",
    rainfall_intensity: 50,
    flood_recurrence_index: 40,
    hotspot_persistence: 45,
    drainage_stress_index: 50,
    population_exposure: 55,
    report_count: 5,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [77.08, 28.72],
          [77.12, 28.715],
          [77.135, 28.735],
          [77.125, 28.755],
          [77.1, 28.76],
          [77.075, 28.745],
          [77.08, 28.72],
        ],
      ],
    },
  },
  {
    ward_id: "4",
    ward_name: "Dwarka",
    risk_score: 32,
    risk_level: "LOW",
    rainfall_intensity: 35,
    flood_recurrence_index: 30,
    hotspot_persistence: 25,
    drainage_stress_index: 40,
    population_exposure: 45,
    report_count: 3,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [77.02, 28.57],
          [77.055, 28.565],
          [77.065, 28.585],
          [77.055, 28.605],
          [77.025, 28.61],
          [77.01, 28.59],
          [77.02, 28.57],
        ],
      ],
    },
  },
  {
    ward_id: "5",
    ward_name: "Lajpat Nagar",
    risk_score: 68,
    risk_level: "HIGH",
    rainfall_intensity: 75,
    flood_recurrence_index: 70,
    hotspot_persistence: 65,
    drainage_stress_index: 60,
    population_exposure: 75,
    report_count: 10,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [77.225, 28.555],
          [77.255, 28.55],
          [77.265, 28.57],
          [77.255, 28.59],
          [77.23, 28.595],
          [77.215, 28.575],
          [77.225, 28.555],
        ],
      ],
    },
  },
  {
    ward_id: "6",
    ward_name: "Saket",
    risk_score: 28,
    risk_level: "LOW",
    rainfall_intensity: 30,
    flood_recurrence_index: 25,
    hotspot_persistence: 30,
    drainage_stress_index: 35,
    population_exposure: 25,
    report_count: 2,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [77.195, 28.515],
          [77.225, 28.51],
          [77.235, 28.53],
          [77.225, 28.55],
          [77.2, 28.555],
          [77.185, 28.535],
          [77.195, 28.515],
        ],
      ],
    },
  },
  {
    ward_id: "7",
    ward_name: "Shahdara",
    risk_score: 75,
    risk_level: "HIGH",
    rainfall_intensity: 80,
    flood_recurrence_index: 75,
    hotspot_persistence: 72,
    drainage_stress_index: 78,
    population_exposure: 70,
    report_count: 15,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [77.275, 28.66],
          [77.315, 28.655],
          [77.325, 28.68],
          [77.31, 28.705],
          [77.28, 28.71],
          [77.265, 28.685],
          [77.275, 28.66],
        ],
      ],
    },
  },
  {
    ward_id: "8",
    ward_name: "Najafgarh",
    risk_score: 82,
    risk_level: "HIGH",
    rainfall_intensity: 90,
    flood_recurrence_index: 85,
    hotspot_persistence: 80,
    drainage_stress_index: 75,
    population_exposure: 65,
    report_count: 18,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [76.94, 28.575],
          [76.985, 28.57],
          [77.0, 28.595],
          [76.99, 28.62],
          [76.955, 28.625],
          [76.935, 28.6],
          [76.94, 28.575],
        ],
      ],
    },
  },
  {
    ward_id: "9",
    ward_name: "Janakpuri",
    risk_score: 52,
    risk_level: "MEDIUM",
    rainfall_intensity: 55,
    flood_recurrence_index: 50,
    hotspot_persistence: 48,
    drainage_stress_index: 55,
    population_exposure: 60,
    report_count: 6,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [77.07, 28.615],
          [77.105, 28.61],
          [77.115, 28.63],
          [77.105, 28.65],
          [77.075, 28.655],
          [77.06, 28.635],
          [77.07, 28.615],
        ],
      ],
    },
  },
  {
    ward_id: "10",
    ward_name: "Pitampura",
    risk_score: 38,
    risk_level: "LOW",
    rainfall_intensity: 40,
    flood_recurrence_index: 35,
    hotspot_persistence: 38,
    drainage_stress_index: 42,
    population_exposure: 40,
    report_count: 4,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [77.12, 28.695],
          [77.155, 28.69],
          [77.165, 28.71],
          [77.155, 28.73],
          [77.125, 28.735],
          [77.11, 28.715],
          [77.12, 28.695],
        ],
      ],
    },
  },
]

export const mockReports: FloodReport[] = [
  {
    id: "1",
    latitude: 28.6329,
    longitude: 77.2195,
    severity: "high",
    description: "Severe waterlogging near metro station",
    ward_name: "Connaught Place",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user_id: "user1",
  },
  {
    id: "2",
    latitude: 28.6519,
    longitude: 77.1893,
    severity: "medium",
    description: "Road flooded, traffic blocked",
    ward_name: "Karol Bagh",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    user_id: "user2",
  },
  {
    id: "3",
    latitude: 28.7041,
    longitude: 77.1025,
    severity: "low",
    description: "Minor waterlogging on sidewalk",
    ward_name: "Rohini",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    user_id: "user3",
  },
  {
    id: "4",
    latitude: 28.5672,
    longitude: 77.241,
    severity: "high",
    description: "Basement flooding in residential area",
    ward_name: "Lajpat Nagar",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    user_id: "user4",
  },
  {
    id: "5",
    latitude: 28.6814,
    longitude: 77.2946,
    severity: "high",
    description: "Major flooding, vehicles stuck",
    ward_name: "Shahdara",
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    user_id: "user5",
  },
]

export const mockHotspots: Hotspot[] = [
  {
    id: "1",
    centroid_lat: 28.6329,
    centroid_lng: 77.2195,
    frequency: 12,
    avg_rainfall: 45.5,
    last_seen: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    ward_name: "Connaught Place",
  },
  {
    id: "2",
    centroid_lat: 28.5987,
    centroid_lng: 76.9756,
    frequency: 18,
    avg_rainfall: 52.3,
    last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ward_name: "Najafgarh",
  },
  {
    id: "3",
    centroid_lat: 28.6814,
    centroid_lng: 77.2946,
    frequency: 15,
    avg_rainfall: 48.7,
    last_seen: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    ward_name: "Shahdara",
  },
  {
    id: "4",
    centroid_lat: 28.5672,
    centroid_lng: 77.241,
    frequency: 10,
    avg_rainfall: 42.1,
    last_seen: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    ward_name: "Lajpat Nagar",
  },
]

export const mockRainfallData: RainfallData[] = [
  {
    ward_id: "1",
    ward_name: "Connaught Place",
    rainfall_1h: 15.2,
    rainfall_3h: 42.5,
    timestamp: new Date().toISOString(),
  },
  { ward_id: "2", ward_name: "Karol Bagh", rainfall_1h: 12.8, rainfall_3h: 35.2, timestamp: new Date().toISOString() },
  { ward_id: "3", ward_name: "Rohini", rainfall_1h: 8.5, rainfall_3h: 22.1, timestamp: new Date().toISOString() },
  { ward_id: "4", ward_name: "Dwarka", rainfall_1h: 5.2, rainfall_3h: 15.8, timestamp: new Date().toISOString() },
  {
    ward_id: "5",
    ward_name: "Lajpat Nagar",
    rainfall_1h: 18.5,
    rainfall_3h: 48.2,
    timestamp: new Date().toISOString(),
  },
  { ward_id: "6", ward_name: "Saket", rainfall_1h: 4.2, rainfall_3h: 12.5, timestamp: new Date().toISOString() },
  { ward_id: "7", ward_name: "Shahdara", rainfall_1h: 22.1, rainfall_3h: 55.8, timestamp: new Date().toISOString() },
  { ward_id: "8", ward_name: "Najafgarh", rainfall_1h: 28.5, rainfall_3h: 68.2, timestamp: new Date().toISOString() },
  { ward_id: "9", ward_name: "Janakpuri", rainfall_1h: 10.3, rainfall_3h: 28.5, timestamp: new Date().toISOString() },
  { ward_id: "10", ward_name: "Pitampura", rainfall_1h: 6.8, rainfall_3h: 18.2, timestamp: new Date().toISOString() },
]

export const mockDashboardData: DashboardData = {
  total_reports: 48,
  active_hotspots: 4,
  high_risk_wards: 4,
  avg_rainfall: 14.4,
  recent_reports: mockReports,
  ward_risks: delhiWards,
  hotspots: mockHotspots,
}

// Function to calculate risk with simulation multiplier
export function calculateSimulatedRisk(wards: WardRisk[], rainfallMultiplier: number): WardRisk[] {
  return wards.map((ward) => {
    // Risk Score = 0.35 × Rainfall + 0.25 × Recurrence + 0.20 × Persistence + 0.10 × Drainage + 0.10 × Population
    const adjustedRainfall = Math.min(ward.rainfall_intensity * rainfallMultiplier, 100)
    const newScore = Math.round(
      0.35 * adjustedRainfall +
        0.25 * ward.flood_recurrence_index +
        0.2 * ward.hotspot_persistence +
        0.1 * ward.drainage_stress_index +
        0.1 * ward.population_exposure,
    )

    let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW"
    if (newScore >= 65) riskLevel = "HIGH"
    else if (newScore >= 40) riskLevel = "MEDIUM"

    return {
      ...ward,
      rainfall_intensity: adjustedRainfall,
      risk_score: newScore,
      risk_level: riskLevel,
    }
  })
}

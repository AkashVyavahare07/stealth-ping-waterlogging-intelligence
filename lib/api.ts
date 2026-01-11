// API service for communicating with FastAPI backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

import type { GeoJSON } from "geojson"

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  token?: string | null
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "An error occurred" }))
    throw new Error(error.detail || "API request failed")
  }

  return response.json()
}

// Types for API responses
export interface FloodReport {
  id: string
  latitude: number
  longitude: number
  severity: "low" | "medium" | "high"
  description?: string
  ward_name?: string
  created_at: string
  user_id?: string
}

export interface WardRisk {
  ward_id: string
  ward_name: string
  risk_score: number
  risk_level: "LOW" | "MEDIUM" | "HIGH"
  rainfall_intensity: number
  flood_recurrence_index: number
  hotspot_persistence: number
  drainage_stress_index: number
  population_exposure: number
  report_count: number
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
}

export interface Hotspot {
  id: string
  centroid_lat: number
  centroid_lng: number
  frequency: number
  avg_rainfall: number
  last_seen: string
  ward_name?: string
}

export interface DashboardData {
  total_reports: number
  active_hotspots: number
  high_risk_wards: number
  avg_rainfall: number
  recent_reports: FloodReport[]
  ward_risks: WardRisk[]
  hotspots: Hotspot[]
}

export interface SimulationResult {
  ward_risks: WardRisk[]
  rainfall_multiplier: number
}

export interface RainfallData {
  ward_id: string
  ward_name: string
  rainfall_1h: number
  rainfall_3h: number
  timestamp: string
}

// API functions
export const api = {
  // Reports
  submitReport: (
    data: { latitude: number; longitude: number; severity: string; description?: string },
    token?: string | null,
  ) => apiRequest<FloodReport>("/api/reports", { method: "POST", body: data, token }),

  getReports: (token?: string | null) => apiRequest<FloodReport[]>("/api/reports", { token }),

  // Risk Map
  getWardsRisk: () => apiRequest<WardRisk[]>("/api/wards-risk"),

  // Admin Dashboard
  getDashboard: (token?: string | null) => apiRequest<DashboardData>("/api/admin/dashboard", { token }),

  // Simulation
  runSimulation: (rainfallMultiplier: number, token?: string | null) =>
    apiRequest<SimulationResult>("/api/admin/simulate", {
      method: "POST",
      body: { rainfall_multiplier: rainfallMultiplier },
      token,
    }),

  // Rainfall
  getCurrentRainfall: () => apiRequest<RainfallData[]>("/api/rainfall"),

  // Hotspots
  getHotspots: () => apiRequest<Hotspot[]>("/api/hotspots"),
}

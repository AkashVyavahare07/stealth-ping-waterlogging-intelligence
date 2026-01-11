"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Map, AlertTriangle, Droplets, TrendingUp } from "lucide-react"

/* ---------------- MAP (NO SSR) ---------------- */
const LeafletMap = dynamic(
  () => import("@/components/map/leaflet-map").then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
)

/* ---------------- COLORS ---------------- */
const riskColors: Record<"LOW" | "MEDIUM" | "HIGH", string> = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#ef4444",
}

/* ---------------- TYPES ---------------- */
interface Ward {
  ward_id: number
  ward_name: string
  risk_score: number
  risk_level: "LOW" | "MEDIUM" | "HIGH"
  geometry: {
    type: "Polygon" | "MultiPolygon"
    coordinates: number[][][]
  }
}

interface Hotspot {
  id: number
  latitude: number
  longitude: number
  frequency: number
  ward_name: string
}

/* ================= PAGE ================= */
export default function RiskMapPage() {
  const [wards, setWards] = useState<Ward[]>([])
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRisk, setFilterRisk] = useState("all")

  /* -------- FETCH WARDS -------- */
  useEffect(() => {
    async function loadWards() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/wards-risk")
        const data = await res.json()

        const parsed: Ward[] = data.features.map((f: any) => ({
          ward_id: f.properties.ward_id,
          ward_name: f.properties.ward_name,
          risk_score: f.properties.risk_score,
          risk_level: f.properties.risk_level,
          geometry: f.geometry,
        }))

        setWards(parsed)
      } catch (err) {
        console.error("Failed to load wards", err)
      }
    }

    loadWards()
  }, [])

  /* -------- FETCH HOTSPOTS -------- */
  useEffect(() => {
    async function loadHotspots() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/hotspots")
        const data = await res.json()
        setHotspots(data)
      } catch (err) {
        console.error("Failed to load hotspots", err)
      } finally {
        setLoading(false)
      }
    }

    loadHotspots()
  }, [])

  /* -------- FILTER -------- */
  const filteredWards = useMemo(() => {
    if (filterRisk === "all") return wards
    return wards.filter((w) => w.risk_level === filterRisk)
  }, [filterRisk, wards])

  /* -------- POLYGONS -------- */
  const polygons = useMemo(() => {
    return filteredWards.map((w) => ({
      id: String(w.ward_id),
      coordinates: w.geometry.coordinates,
      color: riskColors[w.risk_level],
      fillColor: riskColors[w.risk_level],
      popup: `
        <strong>${w.ward_name}</strong><br/>
        Risk Level: <b>${w.risk_level}</b><br/>
        Risk Score: ${w.risk_score}
      `,
    }))
  }, [filteredWards])

  /* -------- HOTSPOT MARKERS -------- */
  const markers = useMemo(() => {
    return hotspots.map((h) => ({
      id: `hotspot-${h.id}`,
      lat: h.latitude,
      lng: h.longitude,
      radius: Math.min(800, 40 + h.frequency * 60),
     popup: `
  <div style="
    font-family: system-ui, -apple-system, BlinkMacSystemFont;
    min-width: 180px;
  ">
    <div style="
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 6px;
      color: #111827;
    ">
      🚨 Flood Hotspot
    </div>

    <div style="
      font-size: 12px;
      color: #374151;
      margin-bottom: 8px;
      line-height: 1.4;
    ">
      <div><b>Ward:</b> ${h.ward_name}</div>
      <div><b>Reports:</b> ${h.frequency}</div>
    </div>

    <a
      href="https://www.google.com/maps?q=${h.latitude},${h.longitude}"
      target="_blank"
      rel="noopener noreferrer"
      style="
        display: inline-block;
        margin-top: 4px;
        padding: 6px 10px;
        background: #ef4444;
        color: white;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        text-decoration: none;
      "
    >
      📍 Get Directions
    </a>
  </div>
`,


    }))
  }, [hotspots])

  /* -------- STATS -------- */
  const stats = useMemo(() => {
    const total = wards.length || 1
    return {
      high: wards.filter((w) => w.risk_level === "HIGH").length,
      medium: wards.filter((w) => w.risk_level === "MEDIUM").length,
      low: wards.filter((w) => w.risk_level === "LOW").length,
      avg: (wards.reduce((s, w) => s + w.risk_score, 0) / total).toFixed(1),
    }
  }, [wards])

  /* -------- LOADING -------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Map className="h-6 w-6 text-accent" />
              Ward Risk Map
            </h1>
            <p className="text-muted-foreground">
              Real-time flood risk & hotspot detection
            </p>
          </div>

          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              <SelectItem value="HIGH">High Risk</SelectItem>
              <SelectItem value="MEDIUM">Medium Risk</SelectItem>
              <SelectItem value="LOW">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="High Risk" value={stats.high} icon={<AlertTriangle />} />
          <StatCard title="Medium Risk" value={stats.medium} icon={<TrendingUp />} />
          <StatCard title="Low Risk" value={stats.low} icon={<Droplets />} />
          <StatCard title="Avg Risk" value={stats.avg} icon={<Droplets />} />
        </div>

        {/* Map */}
        <Card className="relative">
          {/* ---------- LEGEND ---------- */}
          <div className="absolute top-4 right-4 z-[1000] bg-black/80 backdrop-blur-md rounded-lg p-3 text-xs text-white shadow-lg border border-white/10">
            <div className="font-semibold mb-2">Legend</div>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-sm bg-[#22c55e]" />
              <span>Low Risk</span>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-sm bg-[#eab308]" />
              <span>Medium Risk</span>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-sm bg-[#ef4444]" />
              <span>High Risk</span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="w-3 h-3 rounded-full border-2 border-red-500" />
              <span>Flood Hotspot</span>
            </div>
          </div>

          {/* ---------- MAP ---------- */}
          <CardContent className="p-0">
            <LeafletMap
              center={[28.6139, 77.209]}
              zoom={11}
              polygons={polygons}
              markers={markers}
              className="h-[600px] w-full"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ---------------- STAT CARD ---------------- */
function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number | string
  icon: JSX.Element
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

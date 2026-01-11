"use client"

import { useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  LayoutDashboard,
  AlertTriangle,
  Droplets,
  MapPin,
  TrendingUp,
  Activity,
  Play,
  Loader2,
  Shield,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { delhiWards, mockHotspots, mockReports, mockRainfallData } from "@/lib/mock-data"

const LeafletMap = dynamic(() => import("@/components/map/leaflet-map").then((mod) => mod.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-muted rounded-lg flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

const riskColors = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#ef4444",
}

export default function AdminDashboardPage() {
  const { userRole, loading } = useAuth()

  const stats = useMemo(
    () => ({
      totalReports: mockReports.length,
      activeHotspots: mockHotspots.length,
      highRiskWards: delhiWards.filter((w) => w.risk_level === "HIGH").length,
      avgRainfall: (mockRainfallData.reduce((sum, r) => sum + r.rainfall_1h, 0) / mockRainfallData.length).toFixed(1),
    }),
    [],
  )

  const riskDistribution = useMemo(
    () => [
      { name: "High", value: delhiWards.filter((w) => w.risk_level === "HIGH").length, color: riskColors.HIGH },
      { name: "Medium", value: delhiWards.filter((w) => w.risk_level === "MEDIUM").length, color: riskColors.MEDIUM },
      { name: "Low", value: delhiWards.filter((w) => w.risk_level === "LOW").length, color: riskColors.LOW },
    ],
    [],
  )

  const rainfallChartData = mockRainfallData.slice(0, 6).map((r) => ({
    ward: r.ward_name.split(" ")[0],
    rainfall: r.rainfall_1h,
  }))

  const polygons = delhiWards.map((ward) => ({
    id: ward.ward_id,
    coordinates: ward.geometry.coordinates as number[][][],
    color: riskColors[ward.risk_level],
    fillColor: riskColors[ward.risk_level],
    popup: `<strong>${ward.ward_name}</strong><br/>Risk: ${ward.risk_level} (${ward.risk_score})`,
  }))

  const hotspotMarkers = mockHotspots.map((h) => ({
    id: h.id,
    lat: h.centroid_lat,
    lng: h.centroid_lng,
    color: "red" as const,
    popup: `<strong>Hotspot</strong><br/>Frequency: ${h.frequency}`,
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-16 text-center">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-accent" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Real-time monitoring and control panel</p>
          </div>
          <Link href="/admin/simulations">
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Run Simulation
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalReports}</p>
                  <p className="text-xs text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeHotspots}</p>
                  <p className="text-xs text-muted-foreground">Active Hotspots</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.highRiskWards}</p>
                  <p className="text-xs text-muted-foreground">High Risk Wards</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.avgRainfall}mm</p>
                  <p className="text-xs text-muted-foreground">Avg Rainfall/hr</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Mini Map */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Risk Overview Map</CardTitle>
              <CardDescription>Current ward-level risk distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <LeafletMap
                center={[28.6139, 77.209]}
                zoom={10}
                polygons={polygons}
                markers={hotspotMarkers}
                className="h-[300px] w-full rounded-lg"
              />
            </CardContent>
          </Card>

          {/* Risk Distribution Pie */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Risk Distribution</CardTitle>
              <CardDescription>Ward risk level breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Rainfall Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Current Rainfall by Ward
              </CardTitle>
              <CardDescription>Live data from OpenWeather API</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={rainfallChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="ward" tick={{ fill: "#888", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#888", fontSize: 12 }} unit="mm" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="rainfall" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hotspots Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Active Hotspots</CardTitle>
              <CardDescription>Areas with recurring flooding</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Avg Rain</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHotspots.map((hotspot) => (
                    <TableRow key={hotspot.id}>
                      <TableCell className="font-medium">{hotspot.ward_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{hotspot.frequency} events</Badge>
                      </TableCell>
                      <TableCell>{hotspot.avg_rainfall.toFixed(1)}mm</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Ward Risk Table */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ward Risk Analysis</CardTitle>
            <CardDescription>Detailed breakdown of all monitored wards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ward Name</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Rainfall</TableHead>
                    <TableHead>Recurrence</TableHead>
                    <TableHead>Drainage</TableHead>
                    <TableHead>Reports</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {delhiWards
                    .sort((a, b) => b.risk_score - a.risk_score)
                    .map((ward) => (
                      <TableRow key={ward.ward_id}>
                        <TableCell className="font-medium">{ward.ward_name}</TableCell>
                        <TableCell>{ward.risk_score}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              ward.risk_level === "HIGH"
                                ? "destructive"
                                : ward.risk_level === "MEDIUM"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {ward.risk_level}
                          </Badge>
                        </TableCell>
                        <TableCell>{ward.rainfall_intensity}%</TableCell>
                        <TableCell>{ward.flood_recurrence_index}%</TableCell>
                        <TableCell>{ward.drainage_stress_index}%</TableCell>
                        <TableCell>{ward.report_count}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

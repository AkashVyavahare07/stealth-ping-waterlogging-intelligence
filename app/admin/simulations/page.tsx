"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, RefreshCw, Loader2, Shield, ArrowLeft, TrendingUp, AlertTriangle, Droplets } from "lucide-react"
import { delhiWards, calculateSimulatedRisk } from "@/lib/mock-data"
import type { WardRisk } from "@/lib/api"

const LeafletMap = dynamic(() => import("@/components/map/leaflet-map").then((mod) => mod.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-muted rounded-lg flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

const riskColors = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#ef4444",
}

export default function SimulationsPage() {
  const { userRole, loading: authLoading } = useAuth()
  const [rainfallMultiplier, setRainfallMultiplier] = useState(1)
  const [simulatedWards, setSimulatedWards] = useState<WardRisk[]>(delhiWards)
  const [isSimulating, setIsSimulating] = useState(false)
  const [hasSimulated, setHasSimulated] = useState(false)

  const runSimulation = async () => {
    setIsSimulating(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    const newWards = calculateSimulatedRisk(delhiWards, rainfallMultiplier)
    setSimulatedWards(newWards)
    setHasSimulated(true)
    setIsSimulating(false)
  }

  const resetSimulation = () => {
    setRainfallMultiplier(1)
    setSimulatedWards(delhiWards)
    setHasSimulated(false)
  }

  const stats = useMemo(
    () => ({
      original: {
        high: delhiWards.filter((w) => w.risk_level === "HIGH").length,
        medium: delhiWards.filter((w) => w.risk_level === "MEDIUM").length,
        low: delhiWards.filter((w) => w.risk_level === "LOW").length,
      },
      simulated: {
        high: simulatedWards.filter((w) => w.risk_level === "HIGH").length,
        medium: simulatedWards.filter((w) => w.risk_level === "MEDIUM").length,
        low: simulatedWards.filter((w) => w.risk_level === "LOW").length,
      },
    }),
    [simulatedWards],
  )

  const polygons = simulatedWards.map((ward) => ({
    id: ward.ward_id,
    coordinates: ward.geometry.coordinates as number[][][],
    color: riskColors[ward.risk_level],
    fillColor: riskColors[ward.risk_level],
    popup: `
      <div style="min-width: 180px;">
        <strong>${ward.ward_name}</strong><br/>
        <span style="color: ${riskColors[ward.risk_level]};">Risk: ${ward.risk_level} (${ward.risk_score})</span>
        ${hasSimulated ? `<br/><small>Adjusted Rainfall: ${ward.rainfall_intensity.toFixed(0)}%</small>` : ""}
      </div>
    `,
  }))

  if (authLoading) {
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
            <Link
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Play className="h-6 w-6 text-accent" />
              Rainfall Simulation
            </h1>
            <p className="text-muted-foreground mt-1">Simulate rainfall scenarios to predict flood risk changes</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Simulation Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Simulation Parameters</CardTitle>
                <CardDescription>Adjust rainfall multiplier to simulate different scenarios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Rainfall Multiplier</span>
                    <Badge variant="outline" className="text-lg px-3">
                      {rainfallMultiplier.toFixed(1)}x
                    </Badge>
                  </div>
                  <Slider
                    value={[rainfallMultiplier]}
                    onValueChange={(v) => setRainfallMultiplier(v[0])}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Light (0.5x)</span>
                    <span>Normal (1x)</span>
                    <span>Heavy (3x)</span>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">Scenario Description</p>
                  <p className="text-muted-foreground">
                    {rainfallMultiplier < 0.8
                      ? "Light rainfall - Minimal flooding expected"
                      : rainfallMultiplier < 1.3
                        ? "Normal monsoon conditions"
                        : rainfallMultiplier < 2
                          ? "Heavy rainfall - Increased flood risk"
                          : "Extreme rainfall - Emergency conditions likely"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={runSimulation} disabled={isSimulating} className="flex-1 gap-2">
                    {isSimulating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetSimulation} disabled={isSimulating || !hasSimulated}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Risk Comparison</CardTitle>
                <CardDescription>Before vs After simulation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <AlertTriangle className="h-4 w-4 mx-auto text-red-500 mb-1" />
                      <p className="text-xs text-muted-foreground">High</p>
                      <p className="font-bold text-red-500">
                        {stats.original.high} → {stats.simulated.high}
                      </p>
                    </div>
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <TrendingUp className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
                      <p className="text-xs text-muted-foreground">Medium</p>
                      <p className="font-bold text-yellow-500">
                        {stats.original.medium} → {stats.simulated.medium}
                      </p>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Droplets className="h-4 w-4 mx-auto text-green-500 mb-1" />
                      <p className="text-xs text-muted-foreground">Low</p>
                      <p className="font-bold text-green-500">
                        {stats.original.low} → {stats.simulated.low}
                      </p>
                    </div>
                  </div>

                  {hasSimulated && (
                    <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm">
                      <p className="font-medium text-accent mb-1">Simulation Active</p>
                      <p className="text-muted-foreground">
                        Risk scores recalculated with {rainfallMultiplier}x rainfall intensity.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map and Table */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Simulated Risk Map
                  {hasSimulated && (
                    <Badge variant="outline" className="ml-2 text-accent">
                      {rainfallMultiplier}x Rainfall
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeafletMap
                  center={[28.6139, 77.209]}
                  zoom={11}
                  polygons={polygons}
                  className="h-[400px] w-full rounded-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Simulated Ward Risks</CardTitle>
                <CardDescription>Sorted by risk score (highest first)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ward</TableHead>
                        <TableHead>Original</TableHead>
                        <TableHead>Simulated</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {simulatedWards
                        .sort((a, b) => b.risk_score - a.risk_score)
                        .map((ward) => {
                          const original = delhiWards.find((w) => w.ward_id === ward.ward_id)!
                          const change = ward.risk_score - original.risk_score
                          return (
                            <TableRow key={ward.ward_id}>
                              <TableCell className="font-medium">{ward.ward_name}</TableCell>
                              <TableCell>{original.risk_score}</TableCell>
                              <TableCell className="font-bold">{ward.risk_score}</TableCell>
                              <TableCell>
                                <span
                                  className={
                                    change > 0
                                      ? "text-red-500"
                                      : change < 0
                                        ? "text-green-500"
                                        : "text-muted-foreground"
                                  }
                                >
                                  {change > 0 ? "+" : ""}
                                  {change}
                                </span>
                              </TableCell>
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
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, MapPin, Loader2, CheckCircle } from "lucide-react"
import { delhiWards } from "@/lib/mock-data"

const LeafletMap = dynamic(
  () => import("@/components/map/leaflet-map").then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)

interface Report {
  id: number
  latitude: number
  longitude: number
  severity: "LOW" | "MEDIUM" | "HIGH"
  description?: string
  ward_name?: string
}

export default function ReportPage() {
  const { toast } = useToast()

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [wardName, setWardName] = useState<string | null>(null)
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 28.6139, lng: 77.209 })
      )
    }
  }, [])

  const loadReports = () => {
    fetch("http://127.0.0.1:8000/api/reports/all", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReports(data)
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadReports()
  }, [])

  const handleMapClick = (lat: number, lng: number) => {
    setLocation({ lat, lng })

    const ward = delhiWards.find((w) => {
      const coords = w.geometry.coordinates[0]
      const lats = coords.map((c) => c[1])
      const lngs = coords.map((c) => c[0])
      return (
        lat >= Math.min(...lats) &&
        lat <= Math.max(...lats) &&
        lng >= Math.min(...lngs) &&
        lng <= Math.max(...lngs)
      )
    })

    setWardName(ward?.ward_name || "Unknown Ward")
  }

  const handleSubmit = async () => {
    if (!location) {
      toast({
        title: "Location required",
        description: "Please click on the map to select a location.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          severity: severity.toUpperCase(),
          description,
        }),
      })

      if (!res.ok) throw new Error("Failed")

      // ✅ ONLY NECESSARY ADDITION
      loadReports()

      setSubmitted(true)
      toast({
        title: "Report submitted!",
        description: "Your waterlogging report has been recorded.",
      })
    } catch {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setSeverity("medium")
    setDescription("")
    setWardName(null)
  }

  const reportMarkers = reports.map((r) => ({
    id: r.id,
    lat: r.latitude,
    lng: r.longitude,
    color: r.severity === "HIGH" ? "red" : r.severity === "MEDIUM" ? "yellow" : "green",
    popup: `<strong>${r.severity}</strong><br/>${r.ward_name || ""}<br/>${r.description || ""}`,
  }))

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-12">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-6">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Report Submitted</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for helping keep Delhi safe.
              </p>
              <Button onClick={resetForm} className="w-full">
                Submit Another Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 py-8 max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Location</CardTitle>
              <CardDescription>Click on map to mark waterlogging</CardDescription>
            </CardHeader>
            <CardContent>
              <LeafletMap
                center={location ? [location.lat, location.lng] : [28.6139, 77.209]}
                zoom={12}
                onClick={handleMapClick}
                markers={reportMarkers}
                className="h-[400px] w-full rounded-lg"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={severity}
                onValueChange={(v) => setSeverity(v as any)}
                className="grid grid-cols-3 gap-3"
              >
                {["low", "medium", "high"].map((s) => (
                  <Label key={s} className="border rounded-lg p-4 text-center cursor-pointer">
                    <RadioGroupItem value={s} className="sr-only" />
                    {s.toUpperCase()}
                  </Label>
                ))}
              </RadioGroup>

              <Textarea
                placeholder="Describe the situation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

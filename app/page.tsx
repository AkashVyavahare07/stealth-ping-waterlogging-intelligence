"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Map, AlertTriangle, BarChart3, Shield, Users, ArrowRight, CloudRain } from "lucide-react"

const features = [
  {
    icon: AlertTriangle,
    title: "Report Flooding",
    description: "Citizens can report waterlogging incidents with location and severity details in real-time.",
    href: "/report",
  },
  {
    icon: Map,
    title: "Risk Map",
    description: "Interactive GIS visualization showing ward-level flood risk with color-coded zones.",
    href: "/risk-map",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    description: "Real-time rainfall data from OpenWeather API integrated with risk calculations.",
    href: "/reports",
  },
  {
    icon: Shield,
    title: "Admin Dashboard",
    description: "Comprehensive control panel for authorities with simulation capabilities.",
    href: "/admin",
  },
]

const stats = [
  { label: "Wards Monitored", value: "272" },
  { label: "Reports Today", value: "48" },
  { label: "Active Hotspots", value: "12" },
  { label: "Risk Coverage", value: "100%" },
]

export default function HomePage() {
  const { user, userRole } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-background to-background" />
        <div className="container relative px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <CloudRain className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-accent">Government of NCT Delhi</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
              Waterlogging Intelligence System
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              A GIS-powered decision support platform for urban flood prediction and preparedness. Real-time monitoring,
              citizen reporting, and data-driven risk assessment for Delhi.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/report">
                <Button size="lg" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Report Flooding
                </Button>
              </Link>
              <Link href="/risk-map">
                <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                  <Map className="h-4 w-4" />
                  View Risk Map
                </Button>
              </Link>
              {userRole === "admin" && (
                <Link href="/admin">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card">
        <div className="container px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Platform Capabilities</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comprehensive tools for flood monitoring, prediction, and emergency response
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:border-accent/50 transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={feature.href}>
                    <Button variant="ghost" className="gap-2 p-0 h-auto text-accent hover:text-accent/80">
                      Learn More
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Formula Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Risk Calculation Methodology</h2>
            <Card className="bg-sidebar border-sidebar-border">
              <CardContent className="p-6">
                <div className="font-mono text-sm text-sidebar-foreground bg-sidebar-accent/30 p-4 rounded-lg mb-4">
                  Risk Score = 0.35 × Rainfall Intensity + 0.25 × Flood Recurrence + 0.20 × Hotspot Persistence + 0.10 ×
                  Drainage Stress + 0.10 × Population Exposure
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-[#22c55e]" />
                    <span className="text-sm text-sidebar-foreground">LOW: 0-39</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-[#eab308]" />
                    <span className="text-sm text-sidebar-foreground">MEDIUM: 40-64</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-[#ef4444]" />
                    <span className="text-sm text-sidebar-foreground">HIGH: 65-100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Ready to Contribute?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join thousands of citizens helping make Delhi safer during monsoon season.
          </p>
          {!user ? (
            <div className="flex justify-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  <Users className="h-4 w-4" />
                  Create Account
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/report">
              <Button size="lg" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Submit a Report
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-sidebar">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-sidebar-primary" />
              <span className="font-semibold text-sidebar-foreground">Stealth Ping</span>
            </div>
            <p className="text-sm text-sidebar-foreground/70">
              Waterlogging Intelligence System - Government of NCT Delhi
            </p>
            <p className="text-xs text-sidebar-foreground/50">Data Source: OpenWeather API | GIS: PostGIS</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

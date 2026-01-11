"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Search, MapPin, Clock, AlertTriangle } from "lucide-react"

type Report = {
  id: number
  latitude: number
  longitude: number
  severity: "LOW" | "MEDIUM" | "HIGH"
  description?: string
  ward_name?: string
  created_at: string
}

const severityColors: Record<string, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-red-500",
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")

  // ✅ LOAD REAL REPORTS FROM BACKEND
  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/reports/all", {
          cache: "no-store",
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          setReports(data)
        }
      } catch (err) {
        console.error("Failed to load reports", err)
      }
    }

    loadReports()
  }, [])

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.ward_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSeverity =
        filterSeverity === "all" || report.severity === filterSeverity.toUpperCase()
      return matchesSearch && matchesSeverity
    })
  }, [reports, searchQuery, filterSeverity])

  const stats = useMemo(
    () => ({
      total: reports.length,
      high: reports.filter((r) => r.severity === "HIGH").length,
      medium: reports.filter((r) => r.severity === "MEDIUM").length,
      low: reports.filter((r) => r.severity === "LOW").length,
    }),
    [reports]
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-accent" />
            Flood Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            View all citizen-submitted waterlogging reports
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Reports</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/30">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-red-500">{stats.high}</p>
              <p className="text-xs text-muted-foreground">High Severity</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-yellow-500">{stats.medium}</p>
              <p className="text-xs text-muted-foreground">Medium Severity</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/30">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-green-500">{stats.low}</p>
              <p className="text-xs text-muted-foreground">Low Severity</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ward or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Reports</CardTitle>
            <CardDescription>{filteredReports.length} reports found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(report.created_at), "MMM d, HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{report.ward_name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <div
                            className={`h-2 w-2 rounded-full ${severityColors[report.severity]}`}
                          />
                          <span>{report.severity}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {report.description || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No reports found matching your filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

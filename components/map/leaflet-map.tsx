"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

/* ---------------- FIX DEFAULT MARKERS ---------------- */
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

/* ---------------- TYPES ---------------- */
interface MapProps {
  center?: [number, number]
  zoom?: number

  onClick?: (lat: number, lng: number) => void

  markers?: Array<{
    id: string
    lat: number
    lng: number
    popup?: string
    color?: "red" | "yellow" | "green" | "blue"
    radius?: number // hotspot intensity
  }>

  polygons?: Array<{
    id: string
    coordinates: number[][][]
    color?: string
    fillColor?: string
    popup?: string
  }>

  className?: string
}

const markerColors: Record<string, string> = {
  red: "#ef4444",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
}

/* ================= MAP COMPONENT ================= */
export function LeafletMap({
  center = [28.6139, 77.209],
  zoom = 11,
  onClick,
  markers = [],
  polygons = [],
  className = "h-[500px] w-full",
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  const markersLayer = useRef<L.LayerGroup | null>(null)
  const polygonsLayer = useRef<L.LayerGroup | null>(null)
  const clickMarker = useRef<L.Marker | null>(null)

  const [clickedPos, setClickedPos] = useState<[number, number] | null>(null)

  /* ---------- INIT MAP ---------- */
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    mapInstance.current = map
    markersLayer.current = L.layerGroup().addTo(map)
    polygonsLayer.current = L.layerGroup().addTo(map)

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
        subdomains: "abcd",
      },
    ).addTo(map)

    if (onClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        setClickedPos([lat, lng])
        onClick(lat, lng)
      })
    }

    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  /* ---------- CLICK MARKER ---------- */
  useEffect(() => {
    if (!mapInstance.current || !onClick) return

    if (clickMarker.current) clickMarker.current.remove()

    if (clickedPos) {
      clickMarker.current = L.marker(clickedPos, {
        icon: L.divIcon({
          html: `<div style="
            width:18px;
            height:18px;
            background:#3b82f6;
            border-radius:50%;
            border:3px solid white;
          "></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      }).addTo(mapInstance.current)
    }
  }, [clickedPos, onClick])

  /* ---------- MARKERS & 🔥 PULSING HOTSPOTS ---------- */
  useEffect(() => {
    if (!markersLayer.current) return
    markersLayer.current.clearLayers()

    markers.forEach((m) => {
      // 🔥 HOTSPOT — PULSING ICON
      if (m.radius) {
        const pulseIcon = L.divIcon({
          className: "",
          html: `
            <div style="
              width:16px;
              height:16px;
              background:#ef4444;
              border-radius:50%;
              position:relative;
              box-shadow: 0 0 0 rgba(239,68,68,0.7);
              animation: pulse 1.8s infinite;
            "></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })

        const hotspot = L.marker([m.lat, m.lng], { icon: pulseIcon })

        if (m.popup) hotspot.bindPopup(m.popup)
        markersLayer.current.addLayer(hotspot)
        return
      }

      // 📍 NORMAL MARKER
      const color = markerColors[m.color || "blue"]
      const marker = L.marker([m.lat, m.lng], {
        icon: L.divIcon({
          html: `<div style="
            width:14px;
            height:14px;
            background:${color};
            border-radius:50%;
            border:2px solid white;
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
      })

      if (m.popup) marker.bindPopup(m.popup)
      markersLayer.current.addLayer(marker)
    })
  }, [markers])

  /* ---------- POLYGONS ---------- */
  useEffect(() => {
    if (!polygonsLayer.current) return
    polygonsLayer.current.clearLayers()

    polygons.forEach((p) => {
      const coords = p.coordinates[0].map(
        (c) => [c[1], c[0]] as [number, number],
      )

      const polygon = L.polygon(coords, {
        color: p.color || "#22c55e",
        fillColor: p.fillColor || "#22c55e",
        fillOpacity: 0.45,
        weight: 2,
      })

      if (p.popup) polygon.bindPopup(p.popup)
      polygonsLayer.current.addLayer(polygon)
    })
  }, [polygons])

  return (
    <>
      {/* 🔥 Pulse animation CSS */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6);
          }
          70% {
            box-shadow: 0 0 0 25px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>

      <div
        ref={mapRef}
        className={className}
        style={{ background: "#0f172a", minHeight: "300px" }}
      />
    </>
  )
}

export default LeafletMap

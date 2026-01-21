"use client"

import L from "leaflet"
import { useEffect } from "react"
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet"

// Import CSS Leaflet
import "leaflet/dist/leaflet.css"

interface MapProps {
  center?: number[]
}

// Icône custom, utilisant le dossier public
const customIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function ChangeView({ center }: { center: number[] }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center as L.LatLngExpression, 12, { animate: true })
    }
  }, [center, map])
  return null
}

const Map: React.FC<MapProps> = ({ center }) => {
  const defaultCenter: [number, number] = [-21.1151, 55.5364]

  return (
    <MapContainer
      center={(center as L.LatLngExpression) || defaultCenter}
      zoom={center ? 10 : 8}
      scrollWheelZoom={false}
      className="h-[35vh] rounded-lg"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {center && (
        <Marker position={center as L.LatLngExpression} icon={customIcon} />
      )}
      {center && <ChangeView center={center} />}
    </MapContainer>
  )
}

export default Map

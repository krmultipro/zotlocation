"use client"

import React from "react"
import Select from "react-select"

export type CitySelectValue = {
  label: string
  value: string
  latlng: number[]
}

interface CitySelectProps {
  value?: CitySelectValue | null
  onChange: (val: CitySelectValue | null) => void
}

// Liste complète des communes de La Réunion + coordonnées GPS
const REUNION_CITIES = [
  { name: "Saint-Denis", lat: -20.8789, lng: 55.4481 },
  { name: "Saint-Paul", lat: -21.0096, lng: 55.2693 },
  { name: "Saint-Pierre", lat: -21.3393, lng: 55.4781 },
  { name: "Le Tampon", lat: -21.2766, lng: 55.5177 },
  { name: "Saint-André", lat: -20.9633, lng: 55.6502 },
  { name: "Saint-Louis", lat: -21.2859, lng: 55.4115 },
  { name: "Saint-Benoît", lat: -21.0389, lng: 55.7155 },
  { name: "Le Port", lat: -20.9371, lng: 55.291 },
  { name: "Saint-Joseph", lat: -21.3775, lng: 55.6192 },
  { name: "Sainte-Marie", lat: -20.8952, lng: 55.5496 },
  { name: "Sainte-Suzanne", lat: -20.9064, lng: 55.6083 },
  { name: "Saint-Leu", lat: -21.1789, lng: 55.2806 },
  { name: "Les Avirons", lat: -21.2425, lng: 55.345 },
  { name: "L'Étang-Salé", lat: -21.2783, lng: 55.3538 },
  { name: "Trois-Bassins", lat: -21.1001, lng: 55.3042 },
  { name: "La Possession", lat: -20.9286, lng: 55.3351 },
  { name: "Salazie", lat: -21.0281, lng: 55.5421 },
  { name: "Cilaos", lat: -21.136, lng: 55.4713 },
  { name: "Bras-Panon", lat: -20.9767, lng: 55.6741 },
  { name: "Petite-Île", lat: -21.3573, lng: 55.5719 },
  { name: "Plaine-des-Palmistes", lat: -21.1443, lng: 55.6366 },
  { name: "Sainte-Rose", lat: -21.1281, lng: 55.8008 },
  { name: "La Plaine-des-Cafres", lat: -21.228, lng: 55.569 },
]

const CitySelect: React.FC<CitySelectProps> = ({ value, onChange }) => {
  const options = REUNION_CITIES.map((city) => ({
    label: city.name,
    value: city.name,
    latlng: [city.lat, city.lng],
  }))

  return (
    <Select
      placeholder="Choisissez une ville"
      options={options}
      value={value}
      onChange={(val) => onChange(val as CitySelectValue | null)}
      isClearable
      isSearchable
      classNames={{
        control: () => "p-3 border-2",
        input: () => "text-lg",
        option: () => "text-lg",
      }}
      theme={(theme) => ({
        ...theme,
        borderRadius: 8,
        colors: {
          ...theme.colors,
          primary: "black",
          primary25: "#e0ffe4",
        },
      })}
    />
  )
}

export default CitySelect

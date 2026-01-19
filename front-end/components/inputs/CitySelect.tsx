"use client"

import axios from "axios";
import React, { useEffect, useState } from "react";
import Select from "react-select";

export type CitySelectValue = {
  label: string
  value: string // Sera l'ID de la base de données (ex: "1")
  latlng: number[]
}

interface CitySelectProps {
  value?: CitySelectValue | null
  onChange: (val: CitySelectValue | null) => void
}

// On garde tes coordonnées GPS ici
const CITY_COORDINATES: Record<string, {lat: number, lng: number}> = {
  "Saint-Denis": { lat: -20.8789, lng: 55.4481 },
  "Saint-Paul": { lat: -21.0096, lng: 55.2693 },
  "Saint-Pierre": { lat: -21.3393, lng: 55.4781 },
  "Le Tampon": { lat: -21.2766, lng: 55.5177 },
  "Saint-André": { lat: -20.9633, lng: 55.6502 },
  "Saint-Louis": { lat: -21.2859, lng: 55.4115 },
  "Saint-Benoît": { lat: -21.0389, lng: 55.7155 },
  "Le Port": { lat: -20.9371, lng: 55.291 },
  "Saint-Joseph": { lat: -21.3775, lng: 55.6192 },
  "Sainte-Marie": { lat: -20.8952, lng: 55.5496 },
  "Sainte-Suzanne": { lat: -20.9064, lng: 55.6083 },
  "Saint-Leu": { lat: -21.1789, lng: 55.2806 },
  "Les Avirons": { lat: -21.2425, lng: 55.345 },
  "L'Étang-Salé": { lat: -21.2783, lng: 55.3538 },
  "Trois-Bassins": { lat: -21.1001, lng: 55.3042 },
  "La Possession": { lat: -20.9286, lng: 55.3351 },
  "Salazie": { lat: -21.0281, lng: 55.5421 },
  "Cilaos": { lat: -21.136, lng: 55.4713 },
  "Bras-Panon": { lat: -20.9767, lng: 55.6741 },
  "Petite-Île": { lat: -21.3573, lng: 55.5719 },
  "Plaine-des-Palmistes": { lat: -21.1443, lng: 55.6366 },
  "Sainte-Rose": { lat: -21.1281, lng: 55.8008 },
  "La Plaine-des-Cafres": { lat: -21.228, lng: 55.569 },
}

const CitySelect: React.FC<CitySelectProps> = ({ value, onChange }) => {
  const [options, setOptions] = useState<CitySelectValue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCities = async () => {
      try {
        //  Ajout d'un header explicite
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/localisations`, {
            headers: {
                'Accept': 'application/ld+json'
            }
        });

        // On vérifie tous les formats possibles (hydra:member ou member)
        const data = response.data["hydra:member"] || response.data["member"] || [];

        if (Array.isArray(data)) {
            const formattedOptions = data.map((city: any) => {
              const coords = CITY_COORDINATES[city.name] || { lat: -21.1151, lng: 55.5364 };
              return {
                label: city.name,
                value: city.id.toString(),
                latlng: [coords.lat, coords.lng],
              }
            });
            setOptions(formattedOptions);
        }
      } catch (error) {
        console.error("Erreur chargement villes API", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCities();
  }, []);
  return (
    <Select
      placeholder={isLoading ? "Chargement des villes..." : "Choisissez une ville"}
      options={options}
      value={value}
      onChange={(val) => onChange(val as CitySelectValue | null)}
      isClearable
      isSearchable
      isLoading={isLoading}
      classNames={{
        control: () => "p-3 border-2",
        input: () => "text-lg",
        option: () => "text-lg",
      }}
    />
  )
}

export default CitySelect
"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import CitySelect, { CitySelectValue } from "../inputs/CitySelect"
import Modal from "./Modal"

// Map dynamique
const Map = dynamic(() => import("../Map"), {
  ssr: false,
})

interface CountrySearchModalProps {
  isOpen: boolean
  onClose: () => void

  // on renvoie la ville sélectionnée
  onSubmit: (city: CitySelectValue | null) => void
}

const CountrySearchModal: React.FC<CountrySearchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [city, setCity] = useState<CitySelectValue | null>(null)

  const handleValidate = () => {
    onSubmit(city) // renvoie la ville
    onClose() // ferme la modale
  }

  const bodyContent = (
    <div className="flex flex-col gap-6">
      <CitySelect value={city} onChange={setCity} />

      <div className="mt-2">
        <Map center={city?.latlng} />
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleValidate}
      title="Choisir une ville"
      actionLabel="Valider"
      body={bodyContent}
    />
  )
}

export default CountrySearchModal

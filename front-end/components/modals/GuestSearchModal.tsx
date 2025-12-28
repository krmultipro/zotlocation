/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import qs from "query-string"
import { useState } from "react"
import Modal from "./Modal" // Votre composant Modal générique

interface GuestSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const GuestSearchModal: React.FC<GuestSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter()
  const params = useSearchParams()
  const [guestCount, setGuestCount] = useState(1)

  const onSubmit = () => {
    let currentQuery = {}

    if (params) {
      currentQuery = qs.parse(params.toString())
    }

    // On ajoute le filtre de capacité
    // Note : API Platform NumericFilter utilise par défaut la valeur exacte.
    // Pour "au moins X personnes", on utilise 'capacity' ou 'capacity[gte]' selon votre config
    const updatedQuery: any = {
      ...currentQuery,
      //  On ajoute explicitement [gte] pour "Greater Than or Equal" supp ou egal au nombres de personnes recherchées
      "capacity[gte]": guestCount,
    }

    const url = qs.stringifyUrl(
      {
        url: "/",
        query: updatedQuery,
      },
      { skipNull: true }
    )

    onClose()
    router.push(url)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Voyageurs"
      actionLabel="Rechercher"
      body={
        <div className="flex flex-col gap-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="font-semibold text-lg">Nombre de personnes</div>
              <div className="text-gray-500">Trouvez un logement adapté</div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
              >
                -
              </button>
              <span className="text-xl font-medium w-6 text-center">
                {guestCount}
              </span>
              <button
                onClick={() => setGuestCount(guestCount + 1)}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
              >
                +
              </button>
            </div>
          </div>
        </div>
      }
    />
  )
}

export default GuestSearchModal

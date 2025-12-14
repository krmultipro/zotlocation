/* eslint-disable react/no-unescaped-entities */
// 🛑 DANS src/components/Search.tsx

"use client"

import { useCallback, useState } from "react" // Ajout de useCallback
import { BiSearch } from "react-icons/bi"
import CountrySearchModal from "../modals/CountrySearchModal"
// 💡 Import de la nouvelle modale
import DateSearchModal from "../modals/DateSearchModal"

const Search = () => {
  const [openLocationModal, setOpenLocationModal] = useState(false)
  // 💡 Nouvel état pour la modale de calendrier
  const [openDateModal, setOpenDateModal] = useState(false)

  // 💡 NOUVELLE FONCTION REQUISES : Gère la soumission de la recherche de localisation.
  // Pour l'instant, elle se contente de fermer la modale, car la logique de recherche n'est pas encore implémentée.
  const handleLocationSubmit = useCallback(() => {
    // Ici, vous ajouterez la logique de navigation avec les paramètres de localisation
    setOpenLocationModal(false) // Ferme la modale
  }, [])

  return (
    <>
      <div className="border w-full md:w-auto py-2 rounded-full shadow-sm hover:shadow-md transition cursor-pointer">
        <div className="flex flex-row items-center justify-between">
          {/* N'importe où (Location) */}
          <div
            className="text-sm font-semibold px-6"
            onClick={() => setOpenLocationModal(true)}
          >
            N'importe où
          </div>

          {/* N'importe quand (Dates) */}
          <div
            className="hidden sm:block text-sm font-semibold px-6 border-x flex-2 text-center"
            // 💡 AJOUT DU CLIC POUR OUVRIR LA MODALE DE DATE
            onClick={() => setOpenDateModal(true)}
          >
            N'importe quand
          </div>

          <div className="text-sm pl-6 pr-2 text-gray-600 flex flex-row items-center gap-3">
            <div className="hidden sm:block">Ajouter des voyageurs</div>
            <div className="p-2 bg-green-600 rounded-full text-white">
              <BiSearch size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* 🛑 CORRECTION ICI : AJOUT DE onSubmit */}
      <CountrySearchModal
        isOpen={openLocationModal}
        onClose={() => setOpenLocationModal(false)}
        onSubmit={handleLocationSubmit} // 💡 Ajout de la prop requise
      />

      {/* Rendu de la nouvelle modale de calendrier */}
      <DateSearchModal
        isOpen={openDateModal}
        onClose={() => setOpenDateModal(false)}
      />
    </>
  )
}

export default Search

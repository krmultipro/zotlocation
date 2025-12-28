/* eslint-disable react/no-unescaped-entities */
"use client"

import { useCallback, useState } from "react"
import { BiSearch } from "react-icons/bi"
import CountrySearchModal from "../modals/CountrySearchModal"
import DateSearchModal from "../modals/DateSearchModal"
import GuestSearchModal from "../modals/GuestSearchModal"

const Search = () => {
  const [openLocationModal, setOpenLocationModal] = useState(false)
  const [openDateModal, setOpenDateModal] = useState(false)
  const [openGuestModal, setOpenGuestModal] = useState(false)

  const handleLocationSubmit = useCallback(() => {
    setOpenLocationModal(false)
  }, [])

  return (
    <>
      <div className="border-[1px] w-full md:w-auto py-2 rounded-full shadow-sm hover:shadow-md transition cursor-pointer bg-white">
        <div className="flex flex-row items-center justify-between">
          {/* Section Localisation */}
          <div
            className="text-sm font-semibold px-6"
            onClick={() => setOpenLocationModal(true)}
          >
            N'importe où
          </div>

          <div
            className="hidden sm:block text-sm font-semibold px-6 border-x-[1px] flex-1 text-center"
            onClick={() => setOpenDateModal(true)}
          >
            N'importe quand
          </div>

          {/* Section Voyageurs + Icône Search */}
          <div
            className="text-sm pl-6 pr-2 text-gray-600 flex flex-row items-center gap-3"
            onClick={() => setOpenGuestModal(true)}
          >
            <div className="hidden sm:block font-medium">
              Ajouter des voyageurs
            </div>
            <div className="p-2 bg-green-600 rounded-full text-white transition hover:bg-green-700">
              <BiSearch size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Modales de recherche */}
      <CountrySearchModal
        isOpen={openLocationModal}
        onClose={() => setOpenLocationModal(false)}
        onSubmit={handleLocationSubmit}
      />

      <DateSearchModal
        isOpen={openDateModal}
        onClose={() => setOpenDateModal(false)}
      />

      <GuestSearchModal
        isOpen={openGuestModal}
        onClose={() => setOpenGuestModal(false)}
      />
    </>
  )
}

export default Search

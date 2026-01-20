/* eslint-disable react/no-unescaped-entities */
"use client"

import { useRouter, useSearchParams } from "next/navigation"; //
import { useCallback, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { CitySelectValue } from "../inputs/CitySelect"; //
import CountrySearchModal from "../modals/CountrySearchModal";
import DateSearchModal from "../modals/DateSearchModal";
import GuestSearchModal from "../modals/GuestSearchModal";

const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [openLocationModal, setOpenLocationModal] = useState(false)
  const [openDateModal, setOpenDateModal] = useState(false)
  const [openGuestModal, setOpenGuestModal] = useState(false)

  // Gestion de la soumission de la ville
  const handleLocationSubmit = useCallback((city: CitySelectValue | null) => {
    // 1. On récupère les paramètres actuels de l'URL
    const currentParams = new URLSearchParams(searchParams.toString());

    if (city?.value) {
      // 2. On ajoute l'ID de la ville (localisation)
      currentParams.set("localisation", city.value);
    } else {
      // Si l'utilisateur efface la sélection
      currentParams.delete("localisation");
    }

    // 3. On pousse la nouvelle URL (ex: /?localisation=1)
    const query = currentParams.toString();
    router.push(`/?${query}`);

    setOpenLocationModal(false);
  }, [router, searchParams]);

  return (
    <>
      <div className="border w-full md:w-auto py-2 rounded-full shadow-sm hover:shadow-md transition cursor-pointer bg-white">
        <div className="flex flex-row items-center justify-between">
          <div
            className="text-sm font-semibold px-6"
            onClick={() => setOpenLocationModal(true)}
          >
            {/* afficher le nom de la ville dans la barre si sélectionnée */}
            N'importe où
          </div>

          <div
            className="hidden sm:block text-sm font-semibold px-6 border-x flex-1 text-center"
            onClick={() => setOpenDateModal(true)}
          >
            N'importe quand
          </div>

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

      <CountrySearchModal
        isOpen={openLocationModal}
        onClose={() => setOpenLocationModal(false)}
        onSubmit={handleLocationSubmit} // Reçoit maintenant la ville
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
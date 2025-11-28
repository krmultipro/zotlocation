/* eslint-disable react/no-unescaped-entities */
"use client"

import { BiSearch } from "react-icons/bi"

const Search = () => {
  return (
    <div className="border w-full md:w-auto py-2 rounded-full shadow-sm hover:shadow-md transition cursor-pointer">
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm font-semibold px-6">N'importe où</div>{" "}
        {/* au clic ici nous pourrons afficher les catégories */}
        <div className="hidden sm:block text-sm font-semibold px-6 border-x flex-2 text-center">
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
  )
}

export default Search

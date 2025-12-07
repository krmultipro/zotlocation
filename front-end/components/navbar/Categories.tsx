/**
 * Composant Categories
 *
 * Affiche une barre de navigation horizontale contenant différentes catégories d'annonces.
 * Les catégories sont récupérées dynamiquement depuis l'API Symfony.
 * La barre reste visible lors du défilement (sticky) et met en évidence la catégorie active.
 */

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { IconType } from "react-icons"
import {
  TbBeach,
  TbBuilding,
  TbCrown,
  TbHome,
  TbMountain,
  TbPool,
  TbSparkles,
  TbTent,
  TbTrees,
  TbVolcano,
} from "react-icons/tb"
import Container from "../Container"

interface Category {
  id: number
  name: string
}

const icons: Record<string, IconType> = {
  Camping: TbTent,
  Montagne: TbMountain,
  Plage: TbBeach,
  Bassin: TbPool,
  Luxe: TbCrown,
  Moderne: TbBuilding,
  Forêt: TbTrees,
  Volcan: TbVolcano,
  Insolite: TbSparkles,
  Traditionnelle: TbHome,
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const params = useSearchParams()
  const router = useRouter()
  const selectedCategoryId = params?.get("categoryId") || "all"

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)  
      .then((res) => res.json())
      .then((data) => setCategories(data.member || []))
      .catch((err) => console.error("Erreur récupération catégories :", err))
  }, [])

  const handleCategoryClick = (id: number | "all") => {
    router.push(id === "all" ? "/" : `/?categoryId=${id}`)
  }

  return (
    <Container>
      <div className="overflow-x-auto flex gap-4 py-3">
        {/* Bouton "Tous" */}
        <button
          onClick={() => handleCategoryClick("all")}
          className={`flex flex-col items-center py-3 px-4 gap-1 rounded-md ${
            selectedCategoryId === "all"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <TbHome className="w-6 h-6" />
          <span className="text-xs font-medium">Tous</span>
        </button>

        {categories.map((cat) => {
          const Icon = icons[cat.name] || TbHome
          const isActive = selectedCategoryId === String(cat.id)

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex flex-col items-center py-3 px-4 gap-1 rounded-md ${
                isActive
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{cat.name}</span>
            </button>
          )
        })}
      </div>
    </Container>
  )
}

export default Categories

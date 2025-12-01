import { useSearchParams } from "next/navigation"
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
import CategoryBox from "../CategoryBox"
import Container from "../Container"

// Typage de la catégorie
interface Category {
  id: number
  name: string
}

// Mapping catégories → icônes
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
  const selectedCategoryId = params?.get("categoryId") // récupération de l'id sélectionné

  useEffect(() => {
    fetch("https://localhost:8000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.member || []))
      .catch((err) => console.error("Erreur récupération catégories :", err))
  }, [])

  return (
    <Container>
      <div className="overflow-x-auto flex gap-4 py-3">
        {categories.map((cat) => {
          const Icon = icons[cat.name] || TbHome
          return (
            <CategoryBox
              key={cat.id}
              label={cat.name}
              icon={Icon}
              selected={selectedCategoryId === String(cat.id)}
              id={cat.id} // on passe l'id pour le clic
            />
          )
        })}
      </div>
    </Container>
  )
}

export default Categories

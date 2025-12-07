"use client"

import ListingsGrid from "@/components/ListingsGrid"
import { useSearchParams } from "next/navigation"

export default function CategoryListings() {
  const params = useSearchParams()
  const categoryId = params?.get("categoryId") || "" // on récupère l'ID de la catégorie

  return <ListingsGrid categoryFilter={categoryId} />
}

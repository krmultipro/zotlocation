"use client"


/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter, useSearchParams } from "next/navigation"
import qs from "query-string"
import { useCallback } from "react"
import { IconType } from "react-icons"

interface CategoryBoxProps {
  icon: IconType
  label: string
  selected?: boolean
  id: number
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  icon: Icon,
  label,
  selected,
  id,
}) => {
  const router = useRouter()
  const params = useSearchParams()

  const handleClick = useCallback(() => {
    let currentQuery = {}

    if (params) {
      currentQuery = qs.parse(params.toString())
    }

    const updatedQuery: any = {
      ...currentQuery,
      categoryId: id, // Utilisation de l'id au lieu du label
    }

    // Si la catégorie est déjà sélectionnée, on la supprime
    if (params?.get("categoryId") === String(id)) {
      delete updatedQuery.categoryId
    }

    const url = qs.stringifyUrl(
      {
        url: "/",
        query: updatedQuery,
      },
      { skipNull: true }
    )

    router.push(url)
  }, [id, params, router])

  return (
    <div
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center gap-2 p-3 border-b-2 hover:text-neutral-800 transition cursor-pointer
        ${selected ? "border-b-neutral-800" : "border-transparent"}
        ${selected ? "text-neutral-800" : "text-neutral-500"}
      `}
    >
      <Icon size={26} />
      <div className="font-medium text-sm">{label}</div>
    </div>
  )
}

export default CategoryBox

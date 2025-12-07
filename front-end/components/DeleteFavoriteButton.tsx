// components/listings/DeleteFavoriteButton.tsx

"use client"

import React, { useCallback } from "react"
import { AiFillDelete } from "react-icons/ai" // Icône de corbeille

interface DeleteFavoriteButtonProps {
  // La fonction de suppression sera fournie par le parent (favorites/page.tsx)
  onDelete: () => void
}

const DeleteFavoriteButton: React.FC<DeleteFavoriteButtonProps> = ({
  onDelete,
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // Empêche la carte entière de naviguer vers la page de l'annonce.
      e.stopPropagation()
      e.preventDefault()

      // Appel de la fonction de suppression passée en prop
      onDelete()
    },
    [onDelete]
  )

  return (
    <button
      onClick={handleClick}
      className="
        relative
        transition
        cursor-pointer
        hover:opacity-80
      "
      aria-label="Supprimer des favoris"
    >
      {/* Icône de fond (pour l'effet de bordure) */}
      <AiFillDelete
        size={24}
        className="
          fill-gray-900
          absolute
          -top-[2px]
          -right-[2px]
        "
      />
      {/* Icône principale (en rouge) */}
      <AiFillDelete
        size={20}
        className="fill-black hover:fill-gray-700 transition"
      />
    </button>
  )
}

export default DeleteFavoriteButton

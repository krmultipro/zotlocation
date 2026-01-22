/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useFavorites } from "@/app/context/FavoritesContext";
import Container from "@/components/Container";
import DeleteFavoriteButton from "@/components/DeleteFavoriteButton";
import Heading from "@/components/Heading";
import ListingCard from "@/components/ListingCard";
import { useCallback } from "react";
import { toast } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
const SYMFONY_API_URL = `${API_URL}/api/favorites`

export default function FavorisContent() {
  const { favorites, isLoading, refreshFavorites } = useFavorites()
  const token = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

  // La fonction d'exécution réelle de la suppression
  const executeDelete = async (favoriteId: number) => {
    try {
      const res = await fetch(`${SYMFONY_API_URL}/${favoriteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Erreur lors de la suppression")

      refreshFavorites()
      toast.success("🗑️ Favori supprimé")
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer le favori")
    }
  }

  // La fonction qui déclenche le toast de confirmation
  const confirmDelete = useCallback(
    (favoriteId: number) => {
      if (!token) return toast.error("Veuillez vous reconnecter.")

      toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-gray-800">
            Retirer cette annonce de vos favoris ?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executeDelete(favoriteId);
              }}
              className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 rounded-md transition"
            >
              Supprimer
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: "top-center",
        style: {
          minWidth: '300px',
        }
      });
    },
    [token, refreshFavorites]
  )

  if (isLoading) {
    return (
      <Container>
        <Heading title="Chargement..." subtitle="Récupération des favoris" center />
      </Container>
    )
  }

  if (favorites.length === 0) {
    return (
      <Container>
        <Heading
          title="Pas de favoris"
          subtitle="Vous n'avez encore rien sauvegardé."
          center
        />
      </Container>
    )
  }

  return (
    <Container>
      <Heading
        title="Mes Favoris"
        subtitle={`Vous avez ${favorites.length} annonce${favorites.length > 1 ? 's' : ''}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
        {favorites.map((favorite: any) => (
          <ListingCard
            key={favorite.id}
            id={favorite.listing.id}
            title={favorite.listing.title}
            pricePerNight={favorite.listing.pricePerNight}
            capacity={favorite.listing.capacity}
            category={favorite.listing.category?.name || "Sans catégorie"}
            imageUrl={favorite.listing.images?.[0]?.url || "/images/placeholder.png"}
            actionButton={
              <DeleteFavoriteButton
                onDelete={() => confirmDelete(favorite.id)}
              />
            }
          />
        ))}
      </div>
    </Container>
  )
}
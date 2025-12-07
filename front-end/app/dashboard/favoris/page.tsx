/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Container from "@/components/Container"
import DeleteFavoriteButton from "@/components/DeleteFavoriteButton"
import Heading from "@/components/Heading"
import ListingCard from "@/components/ListingCard"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-hot-toast"

interface FavoriteListing {
  id: number
  listing: {
    id: number
    title: string
    pricePerNight: number
    capacity: number
    category: { name: string }
    images: { url: string }[]
  }
}

const SYMFONY_API_URL = "https://localhost:8000/api/favorites"

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<FavoriteListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

  // Récupération des favoris
  const fetchFavorites = useCallback(async () => {
    if (!token) {
      setError("Veuillez vous connecter pour voir vos favoris.")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(SYMFONY_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/ld+json",
        },
      })

      if (!res.ok) {
        if (res.status === 401) {
          setError("Session expirée. Veuillez vous reconnecter.")
        } else {
          throw new Error(`Erreur chargement: ${res.status}`)
        }
      }

      const data = await res.json()
      const fetchedFavorites = data.member || data["hydra:member"] || []
      setFavorites(fetchedFavorites)
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`)
      setError("Impossible de charger les favoris.")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  // Suppression d'un favori
  const handleFavoriteDelete = useCallback(
    async (favoriteId: number) => {
      if (!token) {
        toast.error("Veuillez vous reconnecter.")
        return
      }

      if (
        !window.confirm(
          "Voulez-vous vraiment supprimer cette annonce de vos favoris ?"
        )
      ) {
        return
      }

      try {
        const res = await fetch(`${SYMFONY_API_URL}/${favoriteId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error("Échec de la suppression.")
        }

        setFavorites((current) =>
          current.filter((item) => item.id !== favoriteId)
        )

        // Sync globale
        window.dispatchEvent(new Event("favorites:updated"))

        toast.success("🗑️ Annonce supprimée des favoris !")
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de la suppression.")
      }
    },
    [token]
  )

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  // 1. État de chargement
  if (isLoading) {
    return (
      <Container>
        <div className="w-full h-[60vh] flex items-center justify-center">
          <Heading
            title="Chargement..."
            subtitle="Récupération de vos favoris"
            center
          />
        </div>
      </Container>
    )
  }

  // 2. État d'erreur
  if (error) {
    return (
      <Container>
        <Heading title="Erreur d'accès" subtitle={error} center />
      </Container>
    )
  }

  if (favorites.length === 0) {
    return (
      <Container>
        <div className="pt-24">
          <Heading
            title="Pas de favoris"
            subtitle="Vous n'avez pas encore d'annonce en favoris."
            center
          />
        </div>
      </Container>
    )
  }

  // 4. Affichage de la liste
  return (
    <Container>
      <Heading
        title="Mes Favoris"
        subtitle={`Vous avez ${favorites.length} annonces sauvegardées.`}
      />
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
        {favorites.map((favoriteItem) => (
          <ListingCard
            key={favoriteItem.id}
            id={favoriteItem.listing.id}
            title={favoriteItem.listing.title}
            pricePerNight={favoriteItem.listing.pricePerNight}
            capacity={favoriteItem.listing.capacity}
            category={favoriteItem.listing.category?.name || "Sans catégorie"}
            imageUrl={
              favoriteItem.listing.images?.[0]?.url || "/images/placeholder.png"
            }
            actionButton={
              <DeleteFavoriteButton
                onDelete={() => handleFavoriteDelete(favoriteItem.id)}
              />
            }
          />
        ))}
      </div>
    </Container>
  )
}

export default FavoritesPage

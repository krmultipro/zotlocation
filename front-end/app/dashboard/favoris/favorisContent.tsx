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

export default function FavorisContent() {
  const [favorites, setFavorites] = useState<FavoriteListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

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
      setFavorites(data.member || data["hydra:member"] || [])
    } catch (err: any) {
      toast.error(err.message)
      setError("Impossible de charger les favoris.")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const handleFavoriteDelete = useCallback(
    async (favoriteId: number) => {
      if (!token) return toast.error("Veuillez vous reconnecter.")

      if (!window.confirm("Supprimer cette annonce des favoris ?")) return

      try {
        await fetch(`${SYMFONY_API_URL}/${favoriteId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })

        setFavorites((prev) =>
          prev.filter((item) => item.id !== favoriteId)
        )

        window.dispatchEvent(new Event("favorites:updated"))
        toast.success("🗑️ Favori supprimé")
      } catch (err: any) {
        toast.error(err.message)
      }
    },
    [token]
  )

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  // ⬇️ RENDU ⬇️

  if (isLoading) {
    return (
      <Container>
        <Heading title="Chargement..." subtitle="Récupération des favoris" center />
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Heading title="Erreur" subtitle={error} center />
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
        subtitle={`Vous avez ${favorites.length} annonces`}
      />

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {favorites.map((favorite) => (
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
                onDelete={() => handleFavoriteDelete(favorite.id)}
              />
            }
          />
        ))}
      </div>
    </Container>
  )
}

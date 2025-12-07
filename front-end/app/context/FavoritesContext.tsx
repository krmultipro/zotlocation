"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

interface FavoriteItem {
  id: number // ID du favori
  listing: { id: number } // ID de l'annonce
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  isLoading: boolean
  // Fonction utilitaire pour vérifier si une annonce est favorite
  getFavoriteIdByListingId: (listingId: string) => string | null
  // Fonction pour forcer le rechargement (après ajout/suppression)
  refreshFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [trigger, setTrigger] = useState(0) // Sert à forcer le refresh

  useEffect(() => {
    const fetchFavorites = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

      if (!token) {
        setFavorites([])
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch("https://localhost:8000/api/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/ld+json",
          },
        })

        if (res.ok) {
          const data = await res.json()
          setFavorites(data.member || data["hydra:member"] || [])
        }
      } catch (error) {
        console.error("Erreur chargement favoris global:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()

    // Écoute aussi l'événement custom qu'on avait mis en place, par sécurité
    const handleGlobalUpdate = () => setTrigger((prev) => prev + 1)
    window.addEventListener("favorites:updated", handleGlobalUpdate)

    return () => {
      window.removeEventListener("favorites:updated", handleGlobalUpdate)
    }
  }, [trigger])

  const refreshFavorites = useCallback(() => {
    setTrigger((prev) => prev + 1)
  }, [])

  // Fonction optimisée pour trouver l'ID du favori
  const getFavoriteIdByListingId = useCallback(
    (listingId: string) => {
      const found = favorites.find(
        (fav) => fav.listing.id.toString() === listingId
      )
      return found ? found.id.toString() : null
    },
    [favorites]
  )

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        getFavoriteIdByListingId,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavorites doit être utilisé dans un FavoritesProvider")
  }
  return context
}

"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface FavoriteItem {
  id: number
  listing: { id: number }
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  isLoading: boolean
  getFavoriteIdByListingId: (listingId: string) => string | null
  refreshFavorites: () => void
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [trigger, setTrigger] = useState(0)

  const fetchFavorites = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

    if (!token) {
      setFavorites([])
      setIsLoading(false)
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      // 💡 Ajout de l'anti-cache ?t=
      const res = await fetch(`${API_URL}/api/favorites?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/ld+json",
        },
      })

      if (res.ok) {
        const data = await res.json()
        setFavorites(data["hydra:member"] || data.member || [])
      }
    } catch (error) {
      console.error("Erreur chargement favoris global:", error)
    } finally {
      setIsLoading(false)
    }
  }, [trigger])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  // Écoute des mises à jour manuelles via Event
  useEffect(() => {
    const handleGlobalUpdate = () => setTrigger((prev) => prev + 1)
    window.addEventListener("favorites:updated", handleGlobalUpdate)
    return () => window.removeEventListener("favorites:updated", handleGlobalUpdate)
  }, [])

  const refreshFavorites = useCallback(() => {
    setTrigger((prev) => prev + 1)
  }, [])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

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
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error("useFavorites doit être utilisé dans un FavoritesProvider")
  return context
}
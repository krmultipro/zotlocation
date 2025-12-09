"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

interface FavoriteItem {
  id: number
  listing: { id: number }
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  isLoading: boolean
  getFavoriteIdByListingId: (listingId: string) => string | null
  refreshFavorites: () => void
  clearFavorites: () => void // <-- 🔥 Ajout essentiel
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [trigger, setTrigger] = useState(0)

  useEffect(() => {
    const fetchFavorites = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

      if (!token) {
        setFavorites([]) // <-- 🔥 On reset quand pas de token
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
        } else {
          setFavorites([])
        }
      } catch (error) {
        console.error("Erreur chargement favoris global:", error)
        setFavorites([]) // sécurité
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()

    const handleGlobalUpdate = () => setTrigger((prev) => prev + 1)
    window.addEventListener("favorites:updated", handleGlobalUpdate)

    return () => {
      window.removeEventListener("favorites:updated", handleGlobalUpdate)
    }
  }, [trigger])

  const refreshFavorites = useCallback(() => {
    setTrigger((prev) => prev + 1)
  }, [])

  const clearFavorites = useCallback(() => {
    setFavorites([]) // <-- 🔥 vide totalement les favoris
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
        clearFavorites, // <-- 🔥 On expose au front
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

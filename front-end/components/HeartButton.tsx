"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai"
// 💡 IMPORTANT : Import du contexte pour éviter les requêtes inutiles
import { useFavorites } from "@/app/context/FavoritesContext"

interface HeartButtonProps {
  listingId: string
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/favorites`
const FAVORITE_TOAST_DURATION = 4500

const HeartButton: React.FC<HeartButtonProps> = ({ listingId }) => {
  // 1. Récupération des données depuis le Contexte Global (Mémoire)
  const { getFavoriteIdByListingId, refreshFavorites } = useFavorites()

  // On regarde dans le contexte si cette annonce a un ID de favori associé
  const contextFavoriteId = getFavoriteIdByListingId(listingId)
  const isFavoritedInContext = !!contextFavoriteId

  // 2. État local pour l'Optimistic UI (Réactivité immédiate au clic)
  const [hasFavorited, setHasFavorited] = useState(isFavoritedInContext)
  const [loading, setLoading] = useState(false)

  // 3. Synchronisation : Si le contexte change (ex: suppression depuis le dashboard),
  // on met à jour le bouton localement.
  useEffect(() => {
    setHasFavorited(isFavoritedInContext)
  }, [isFavoritedInContext])

  const toggleFavorite = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      e.preventDefault()

      const token =
        typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

      if (!token) {
        toast.error(
          "Vous devez avoir un compte pour mettre une annonce en favoris",
          { duration: FAVORITE_TOAST_DURATION },
        )
        return
      }

      // ⚡️ Optimistic UI : On change la couleur tout de suite avant la réponse serveur
      const previousState = hasFavorited
      setHasFavorited(!previousState)
      setLoading(true)

      try {
        if (previousState) {
          // --- CAS : SUPPRESSION (DELETE) ---
          // On utilise l'ID venant du contexte car il est fiable
          if (!contextFavoriteId) {
            throw new Error("ID du favori introuvable")
          }

          const res = await fetch(`${API_BASE_URL}/${contextFavoriteId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!res.ok && res.status !== 404) {
            throw new Error("Erreur lors de la suppression")
          }

          toast.success("Annonce retirée des favoris", {
            duration: FAVORITE_TOAST_DURATION,
          })
        } else {
          // --- CAS : AJOUT (POST) ---
          const res = await fetch(`${API_BASE_URL}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ listing: `/api/listings/${listingId}` }),
          })

          // Gestion spécifique des erreurs
          if (!res.ok) {
            // Si c'est un doublon (422 ou 500 selon config), on considère que c'est bon
            if (res.status === 422 || res.status === 500) {
              toast.success("Annonce ajoutée en favoris", {
                duration: FAVORITE_TOAST_DURATION,
              })
              refreshFavorites() // On rafraichit pour être sûr
              return
            }
            const data = await res.json()
            throw new Error(data["hydra:description"] || "Impossible d'ajouter")
          }

          toast.success("Annonce ajoutée en favoris", {
            duration: FAVORITE_TOAST_DURATION,
          })
        }

        // 💡 CRUCIAL : On met à jour le contexte global pour que
        // le Dashboard et les autres boutons soient au courant
        refreshFavorites()
      } catch (error) {
        console.error(error)
        toast.error("Une erreur est survenue", {
          duration: FAVORITE_TOAST_DURATION,
        })
        // En cas d'erreur, on annule le changement visuel (Rollback)
        setHasFavorited(previousState)
      } finally {
        setLoading(false)
      }
    },
    [hasFavorited, listingId, contextFavoriteId, refreshFavorites]
  )

  const Icon = hasFavorited ? AiFillHeart : AiOutlineHeart

  return (
    <div
      onClick={toggleFavorite}
      className={`relative hover:opacity-80 transition cursor-pointer ${
        loading ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <AiOutlineHeart size={28} className="absolute top-0 left-0 text-white" />
      <Icon
        size={24}
        className={hasFavorited ? "fill-rose-500" : "fill-neutral-500/70"}
      />
    </div>
  )
}

export default HeartButton

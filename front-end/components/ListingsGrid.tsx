/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Container from "@/components/Container"
import ListingCard from "@/components/ListingCard"
import axios from "axios"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

// Types
interface Listing {
  "@id": string
  "@type": string
  id: number
  title: string
  description: string
  pricePerNight: number
  capacity: number
  category: {
    id: number
    name: string
  }
  owner: string
  images: Array<{
    id: number
    url: string
  }>
}

interface ApiPlatformResponse {
  "hydra:member"?: Listing[]
  member?: Listing[]
  "hydra:totalItems"?: number
  totalItems?: number
}

interface ListingsGridProps {
  categoryFilter?: string
}

export default function ListingsGrid({ categoryFilter }: ListingsGridProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Récupérer les paramètres de l'URL
  const searchParams = useSearchParams()
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  // 💡 AJOUT : Récupération du paramètre de capacité
  const capacity = searchParams.get("capacity[gte]")

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      setError(null)

      try {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL
        const endpoint = `${baseApiUrl}/api/listings`

        // Construction des paramètres pour le filtrage côté SERVEUR
        const params: Record<string, string> = {}

        // 1. Filtrage par Catégorie
        if (categoryFilter) {
          params["category"] = `/api/categories/${categoryFilter}`
        }

        // 2. Filtrage par Disponibilité
        if (startDate) {
          params["startDate"] = startDate
        }
        if (endDate) {
          params["endDate"] = endDate
        }

        // 3. 💡 AJOUT : Filtrage par Capacité (transmis à l'API Symfony)
        if (capacity) {
          params["capacity[gte]"] = capacity
        }

        // Appel API
        const response = await axios.get<ApiPlatformResponse>(endpoint, {
          params,
        })

        const data = response.data["hydra:member"] || response.data.member || []
        setListings(data)
      } catch (err: any) {
        console.error("Erreur lors du chargement des listings:", err)
        setError("Erreur lors de la récupération des annonces.")
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
    // 💡 AJOUT de 'capacity' dans les dépendances pour relancer le fetch
  }, [categoryFilter, startDate, endDate, capacity])

  // --- Affichage de l'état de chargement ---
  if (loading) {
    return (
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 py-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="py-20 text-center text-red-500">{error}</div>
      </Container>
    )
  }

  // --- Affichage du résumé de la recherche ---
  const dateSummary =
    startDate && endDate
      ? `Annonces disponibles du ${startDate} au ${endDate}`
      : null

  const guestSummary = capacity ? `pour au moins ${capacity} personnes` : null

  // --- Affichage de l'état vide ---
  if (listings.length === 0) {
    return (
      <Container>
        <div className="py-20 text-center">
          <p className="text-gray-600 text-lg font-medium">
            Aucune annonce ne correspond à vos critères.
          </p>
          <p className="text-gray-400 mt-2">
            Essayez de modifier vos filtres ou de réduire le nombre de
            voyageurs.
          </p>
        </div>
      </Container>
    )
  }

  // --- Affichage de la grille d'annonces ---
  return (
    <Container>
      <div className="pt-8">
        {(dateSummary || guestSummary) && (
          <div className="text-center mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-700 font-medium">
              {dateSummary} {guestSummary}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              pricePerNight={listing.pricePerNight}
              capacity={listing.capacity}
              category={listing.category?.name || "Non spécifiée"}
              imageUrl={listing.images?.[0]?.url || "/images/placeholder.png"}
            />
          ))}
        </div>
      </div>
    </Container>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Container from "@/components/Container"
import ListingCard from "@/components/ListingCard"
import axios from "axios"
import { useEffect, useState } from "react"

import { useSearchParams } from "next/navigation"

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

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      setError(null)

      try {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL
        const endpoint = `${baseApiUrl}/api/listings`

        // Construction des paramètres pour le filtrage côté SERVEUR
        const params: Record<string, string> = {}

        // 1. Filtrage par Catégorie (Existant)
        if (categoryFilter) {
          params["category"] = `/api/categories/${categoryFilter}`
        }

        // FILTRAGE PAR DISPONIBILITÉ
        if (startDate) {
          // (startDate) pour le filtre custom du backend
          params["startDate"] = startDate
        }
        if (endDate) {
          // (endDate) pour le filtre custom du backend
          params["endDate"] = endDate
        }

        // Appel API
        const response = await axios.get<ApiPlatformResponse>(endpoint, {
          params,
        })

        const data = response.data["hydra:member"] || response.data.member || []

        setListings(data)
      } catch (err: any) {
        console.error("Erreur lors du chargement des listings:", err)

        const debugUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/listings`
        setError(
          `Erreur lors de la récupération des annonces. Vérifiez la console et l'URL : ${debugUrl}`
        )
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [categoryFilter, startDate, endDate]) //  L'effet se relance quand les dates dans l'URL changent

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

  // --- Affichage de l'état d'erreur ---
  if (error) {
    return (
      <Container>
        <div className="py-20 text-center">
          <p className="text-red-500 text-lg">Erreur : {error}</p>
          <p className="text-gray-600 mt-2">
            Vérifiez que le serveur backend est démarré et accessible.
          </p>
        </div>
      </Container>
    )
  }

  // --- Affichage du résumé de la recherche ---
  const dateSummary =
    startDate && endDate
      ? `Annonces disponibles du ${startDate} au ${endDate}`
      : null

  // --- Affichage de l'état vide ---
  if (listings.length === 0) {
    return (
      <Container>
        <div className="py-20 text-center">
          <p className="text-gray-600 text-lg">
            {dateSummary || categoryFilter
              ? `Aucune annonce disponible ne correspond à vos critères de recherche.`
              : "Aucune annonce disponible pour le moment."}
          </p>
          {dateSummary && (
            <p className="text-gray-500 mt-2 text-sm">{dateSummary}</p>
          )}
        </div>
      </Container>
    )
  }

  // --- Affichage de la grille d'annonces ---
  return (
    <Container>
      {dateSummary && (
        <div className="pt-8 text-center text-lg font-medium text-gray-700">
          {dateSummary}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 py-8">
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
    </Container>
  )
}

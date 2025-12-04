/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Container from "@/components/Container"
import ListingCard from "@/components/ListingCard"
import axios from "axios"
import https from "https"
import { useEffect, useState } from "react"

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
  member: Listing[]
  totalItems: number
}

interface ListingsGridProps {
  categoryFilter?: string // ici c'est l'ID de la catégorie
}

export default function ListingsGrid({ categoryFilter }: ListingsGridProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      setError(null)

      try {
        const agent = new https.Agent({ rejectUnauthorized: false })

        const response = await axios.get<ApiPlatformResponse>(
          "https://localhost:8000/api/listings",
          { httpsAgent: agent }
        )

        let filteredListings = response.data.member || []

        if (categoryFilter) {
          filteredListings = filteredListings.filter(
            (listing) => listing.category?.id === Number(categoryFilter) // filtrage par ID
          )
        }

        setListings(filteredListings)
      } catch (err: any) {
        console.error("Erreur lors du chargement des listings:", err)
        setError(err.message || "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [categoryFilter])

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
        <div className="py-20 text-center">
          <p className="text-red-500 text-lg">Erreur : {error}</p>
          <p className="text-gray-600 mt-2">
            Vérifiez que le serveur backend est démarré
          </p>
        </div>
      </Container>
    )
  }

  if (listings.length === 0) {
    return (
      <Container>
        <div className="py-20 text-center">
          <p className="text-gray-600 text-lg">
            {categoryFilter
              ? `Aucune annonce disponible pour cette catégorie`
              : "Aucune annonce disponible pour le moment"}
          </p>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 py-8">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            id={listing.id}
            title={listing.title}
            pricePerNight={listing.pricePerNight}
            capacity={listing.capacity}
            category={listing.category.name}
            imageUrl={listing.images?.[0]?.url || "/images/placeholder.png"}
          />
        ))}
      </div>
    </Container>
  )
}

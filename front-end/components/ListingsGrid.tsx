/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Pour les icônes de pagination
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


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

  //  ÉTATS POUR LA PAGINATION
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 5 // Doit correspondre à paginationItemsPerPage dans Symfony

  // Récupérer les paramètres de l'URL
  const searchParams = useSearchParams()
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const capacity = searchParams.get("capacity[gte]")

  // Reset de la page à 1 si les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, startDate, endDate, capacity])

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      setError(null)

      try {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL
        const endpoint = `${baseApiUrl}/api/listings`

        // Construction des paramètres
        const params: Record<string, any> = {
          page: currentPage, // On envoie le numéro de page à Symfony
        }

        if (categoryFilter) {
          params["category"] = `/api/categories/${categoryFilter}`
        }
        if (startDate) params["startDate"] = startDate
        if (endDate) params["endDate"] = endDate
        if (capacity) params["capacity[gte]"] = capacity

        const response = await axios.get<ApiPlatformResponse>(endpoint, {
          params,
        })

        const data = response.data["hydra:member"] || response.data.member || []
        const total = response.data["hydra:totalItems"] || response.data.totalItems || 0

        setListings(data)
        setTotalItems(total)
      } catch (err: any) {
        console.error("Erreur lors du chargement des listings:", err)
        setError("Erreur lors de la récupération des annonces.")
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [categoryFilter, startDate, endDate, capacity, currentPage])

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Gestionnaires de changement de page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // --- États de chargement et d'erreur ---
  if (loading) {
    return (
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 py-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
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

  return (
    <Container>
      <div className="pt-8 pb-20">
        {/* Grille d'annonces */}
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

        {/* BARRE DE PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center mt-16 space-y-4">
            <div className="flex items-center gap-6">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-3 border rounded-full hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex items-center font-semibold text-lg">
                <span className="text-green-500 mr-1">{currentPage}</span>
                <span className="text-gray-400 mx-2">/</span>
                <span>{totalPages}</span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-3 border rounded-full hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition shadow-sm"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-500 italic">
              {totalItems} logements trouvés
            </p>
          </div>
        )}

        {/* État vide */}
        {listings.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-600 text-lg font-medium">Aucune annonce trouvée.</p>
          </div>
        )}
      </div>
    </Container>
  )
}
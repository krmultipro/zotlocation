/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import axios from "axios";
import { ChevronLeft, ChevronRight, MapPinOff } from "lucide-react"; // Import d'icône pour le vide
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Review {
  id: number;
  rating: number;
}

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
  localisation?: {
    id: number
    name: string
  }
  owner: string
  images: Array<{
    id: number
    url: string
  }>
  reviews: Review[]
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

  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 5

  const searchParams = useSearchParams()
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const capacity = searchParams.get("capacity[gte]")
  // On récupère l'ID de la ville depuis l'URL
  const cityFilter = searchParams.get("localisation")

  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, startDate, endDate, capacity, cityFilter])

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      setError(null)

      try {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL
        const endpoint = `${baseApiUrl}/api/listings`

        const params: Record<string, any> = {
          page: currentPage,
        }

        if (categoryFilter) {
          params["category"] = `/api/categories/${categoryFilter}`
        }

        //  ajout du filtre de localisation pour l'API Symfony
        if (cityFilter) {
          params["localisation"] = `/api/localisations/${cityFilter}`
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
    //  ajout cityFilter aux dépendances pour déclencher la recherche
  }, [categoryFilter, startDate, endDate, capacity, currentPage, cityFilter])

  const totalPages = Math.ceil(totalItems / itemsPerPage)

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
          {listings.map((listing) => {
            const reviews = listing.reviews || [];
            const reviewsCount = reviews.length;
            const averageRating = reviewsCount > 0
              ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewsCount).toFixed(1)
              : null;

            return (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                pricePerNight={listing.pricePerNight}
                capacity={listing.capacity}
                category={listing.category?.name || "Logement"}
                location={listing.localisation?.name || "La Réunion"}
                imageUrl={listing.images?.[0]?.url || "/images/placeholder.png"}
                rating={averageRating}
                reviewsCount={reviewsCount > 0 ? reviewsCount : undefined}
              />
            );
          })}
        </div>

        {/* Pagination */}
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
          </div>
        )}

        {/*  État vide si aucune annonce ne correspond à la ville */}
        {listings.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="p-6 bg-gray-50 rounded-full mb-6">
              <MapPinOff size={48} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Aucun résultat trouvé</h3>
            <p className="text-gray-500 mt-2 max-w-sm">
              Il n'y a pas encore d'annonces disponibles pour cette localisation.
              Essayez de modifier votre recherche ou d'enlever les filtres.
            </p>
            <button
              onClick={() => window.location.href = "/"}
              className="mt-8 px-6 py-2 border border-black rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </Container>
  )
}
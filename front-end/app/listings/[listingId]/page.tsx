"use client"

import { useUser } from "@/app/context/UserProvider"
import Container from "@/components/Container"
import BookingCalendar from "@/components/reservations/BookingCalendar"
import axios from "axios"
import { ArrowLeft, MapPin, Users } from "lucide-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ListingDetail {
  id: number
  title: string
  description: string
  pricePerNight: number
  capacity: number
  category: {
    id: number
    name: string
  }
  owner: {
    id: string
    name: string
  }
  images: Array<{
    id: number
    url: string
  }>
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listingId = params.listingId

  const { isLoading: userLoading } = useUser()

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL
        const response = await axios.get(
          `${baseApiUrl}/api/listings/${listingId}`
        )
        setListing(response.data)
      } catch (err) {
        setError("Erreur lors du chargement de l'annonce")
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [listingId])

  if (loading || userLoading) {
    return (
      <Container>
        <div className="py-32 text-center">Chargement...</div>
      </Container>
    )
  }

  if (error || !listing) {
    return (
      <Container>
        <div className="py-32 text-center text-red-500">
          {error || "Annonce introuvable"}
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="max-w-7xl mx-auto pt-32 pb-8">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </button>

        {/* 🔥 SECTION IMAGES + RÉSERVATION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image principale */}
            <div className="relative w-full h-[60vh] rounded-xl overflow-hidden shadow-lg">
              <Image
                src={listing.images[0]?.url || "/images/placeholder.png"}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Miniatures */}
            {listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.images.slice(1, 5).map((image, idx) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image.url}
                      alt={`Photo ${idx + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Carte réservation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border border-gray-200 rounded-xl p-6 shadow-lg bg-white space-y-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {listing.pricePerNight}€
                  </span>
                  <span className="text-gray-600">/ nuit</span>
                </div>

                <BookingCalendar
                  listingId={listing.id}
                  pricePerNight={listing.pricePerNight}
                />

                <p className="text-center text-sm text-gray-500">
                  Vous ne serez pas débité pour le moment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🔽 INFOS ANNONCE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>
                    {listing.capacity}{" "}
                    {listing.capacity > 1 ? "personnes" : "personne"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{listing.category.name}</span>
                </div>
              </div>
            </div>

            <hr />

            <div>
              <h2 className="text-2xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            <hr />

            <div>
              <h2 className="text-2xl font-semibold mb-3">Hébergé par</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                  {listing.owner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{listing.owner.name}</p>
                  <p className="text-sm text-gray-500">Propriétaire</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
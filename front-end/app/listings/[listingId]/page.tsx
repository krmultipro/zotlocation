/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useUser } from "@/app/context/UserProvider"
import Container from "@/components/Container"
import BookingCalendar from "@/components/reservations/BookingCalendar"
import axios from "axios"
import { ArrowLeft, CheckCircle2, MapPin, Star, Users } from "lucide-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

interface Review {
  id: number
  rating: number
  comment: string
  author: {
    name: string
  }
}

// 💡 Interface pour les options/équipements
interface Option {
  id: number
  name: string
}

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
  reviews: Review[]
  options: Option[] // 💡 Ajouté pour supporter les équipements dynamiques
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

    if (listingId) {
      fetchListing()
    }
  }, [listingId])

  const averageRating = useMemo(() => {
    if (!listing?.reviews || listing.reviews.length === 0) return null
    const sum = listing.reviews.reduce((acc, r) => acc + r.rating, 0)
    return (sum / listing.reviews.length).toFixed(1)
  }, [listing?.reviews])

  if (loading || userLoading) {
    return (
      <Container>
        <div className="py-32 text-center flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Chargement du logement...</p>
        </div>
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
      <div className="max-w-7xl mx-auto pt-32 pb-16">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          <span className="font-medium">Retour</span>
        </button>

        {/* SECTION IMAGES + RÉSERVATION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Images */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative w-full h-[50vh] md:h-[60vh] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <Image
                src={listing.images[0]?.url || "/images/placeholder.png"}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {listing.images.slice(1, 5).map((image, idx) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:opacity-90 transition cursor-pointer"
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
            <div className="sticky top-28">
              <div className="border border-gray-200 rounded-2xl p-6 shadow-xl bg-white space-y-6">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {listing.pricePerNight}€
                    </span>
                    <span className="text-gray-500">/ nuit</span>
                  </div>
                  {averageRating && (
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{averageRating}</span>
                      <span className="text-gray-400">
                        ({listing.reviews.length})
                      </span>
                    </div>
                  )}
                </div>

                <BookingCalendar
                  listingId={listing.id}
                  pricePerNight={listing.pricePerNight}
                />

                <p className="text-center text-xs text-gray-400">
                  Aucun frais ne vous sera prélevé à cette étape
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* INFOS ANNONCE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-10">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-600 font-medium">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>
                    {listing.capacity}{" "}
                    {listing.capacity > 1 ? "voyageurs" : "voyageur"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>{listing.category.name}</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* À propos */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                À propos de ce logement
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            <hr className="border-gray-100" />

            {/* 💡 NOUVELLE SECTION : ÉQUIPEMENTS / OPTIONS */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Ce que propose ce logement
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {listing.options && listing.options.length > 0 ? (
                  listing.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <span className="text-lg font-medium">{option.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    Aucun équipement particulier n'est listé.
                  </p>
                )}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* PROPRIÉTAIRE */}
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
                {listing.owner.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  Hébergé par {listing.owner.name}
                </p>
                <p className="text-gray-500 font-medium">
                  Hôte sur la plateforme
                </p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION AVIS */}
            <div className="space-y-8 pt-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Commentaires
                </h2>
                {averageRating && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full border border-green-100 font-bold">
                    <Star className="w-4 h-4 fill-green-700" />
                    <span>
                      {averageRating} · {listing.reviews.length} avis
                    </span>
                  </div>
                )}
              </div>

              {listing.reviews && listing.reviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {listing.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                            {review.author.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-800">
                            {review.author.name}
                          </span>
                        </div>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? "fill-current"
                                  : "text-gray-200"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed italic">
                        &rdquo;{review.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-2xl text-center border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium italic">
                    Aucun avis n&rsquo;a encore été publié pour cette annonce.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

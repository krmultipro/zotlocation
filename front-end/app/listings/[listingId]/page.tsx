/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useUser } from "@/app/context/UserProvider";
import Container from "@/components/Container";
import BookingCalendar from "@/components/reservations/BookingCalendar";
import axios from "axios";
import { ArrowLeft, Box, Building2, Car, CheckCircle2, Flower2, LayoutPanelLeft, MapPin, Star, Users } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listingId = params.listingId

  const { isLoading: userLoading } = useUser()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL
        const response = await axios.get(`${baseApiUrl}/api/listings/${listingId}?t=${Date.now()}`)
        setListing(response.data)
      } catch (err) {
        setError("Erreur lors du chargement du logement")
      } finally {
        setLoading(false)
      }
    }
    if (listingId) fetchListing()
  }, [listingId])

  const averageRating = useMemo(() => {
    if (!listing?.reviews || listing.reviews.length === 0) return null
    const sum = listing.reviews.reduce((acc: number, r: any) => acc + r.rating, 0)
    return (sum / listing.reviews.length).toFixed(1)
  }, [listing?.reviews])

  if (loading || userLoading) return <Container><p className="py-32 text-center">Chargement...</p></Container>
  if (error || !listing) return <Container><p className="py-32 text-center text-red-500">{error || "Logement introuvable"}</p></Container>

  const garden = listing.gardenSize ?? listing.garden_size;
  const garage = listing.hasGarage ?? listing.has_garage;
  const rooms = listing.numberOfRooms ?? listing.number_of_rooms;
  const balcony = listing.balcony;

  return (
    <Container>
      <div className="max-w-7xl mx-auto pt-32 pb-16">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 mb-6 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          <span className="font-medium font-sans">Retour</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="relative w-full h-[50vh] md:h-[60vh] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <Image src={listing.images?.[0]?.url || "/images/placeholder.png"} alt={listing.title} fill className="object-cover" priority />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-28 border border-gray-200 rounded-2xl p-6 shadow-xl bg-white space-y-6">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{listing.pricePerNight}€</span>
                    <span className="text-gray-500">/ nuit</span>
                  </div>
                  {averageRating && (
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{averageRating}</span>
                      <span className="text-gray-400">({listing.reviews.length})</span>
                    </div>
                  )}
                </div>
               <BookingCalendar listingId={listing.id} pricePerNight={listing.pricePerNight} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-10">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-gray-600 font-medium">
                  <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-green-600" /> {listing.localisation?.name || "La Réunion"}</div>
                  <div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-green-600" /> {listing.category?.name}</div>
                  <div className="flex items-center gap-2"><Users className="w-5 h-5 text-green-600" /> {listing.capacity} pers.</div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION CARACTÉRISTIQUES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(garden !== undefined && garden !== null) && (
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <Flower2 className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-bold text-gray-900">{garden} m²</span>
                  <span className="text-xs text-gray-500 font-medium">Jardin</span>
                </div>
              )}
              {garage === true && (
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <Car className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-bold text-gray-900">Garage</span>
                  <span className="text-xs text-gray-500 font-medium">Inclus</span>
                </div>
              )}
              {(rooms !== undefined && rooms !== null) && (
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <Box className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-bold text-gray-900">{rooms}</span>
                  <span className="text-xs text-gray-500 font-medium">Pièces</span>
                </div>
              )}
              {balcony === true && (
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <LayoutPanelLeft className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-bold text-gray-900">Balcon</span>
                  <span className="text-xs text-gray-500 font-medium">Privatif</span>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">À propos de ce logement</h2>
              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line font-sans">{listing.description}</p>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION OPTIONS */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Ce que propose ce logement</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {listing.options?.map((option: any) => (
                  <div key={option.id} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <span className="text-lg font-medium">{option.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION HÔTE (RESTAURÉE) */}
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
                {listing.owner?.name?.charAt(0).toUpperCase() || "H"}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 tracking-tight">
                  Hébergé par {listing.owner?.name || "un propriétaire"}
                </p>
                <p className="text-gray-500 font-medium">Membre vérifié de la plateforme</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION AVIS */}
            <div className="space-y-8 pt-4 pb-20">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Commentaires</h2>
                {averageRating && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full border border-green-100 font-bold">
                    <Star className="w-4 h-4 fill-green-700" />
                    <span>{averageRating} · {listing.reviews.length} avis</span>
                  </div>
                )}
              </div>

              {listing.reviews && listing.reviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {listing.reviews.map((review: any) => (
                    <div key={review.id} className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                            {review.author?.name?.charAt(0).toUpperCase() || "V"}
                          </div>
                          <span className="font-bold text-gray-800">{review.author?.name || "Voyageur"}</span>
                        </div>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-gray-200"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Aucun avis pour le moment.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
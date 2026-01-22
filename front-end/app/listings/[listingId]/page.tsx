 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useUser } from "@/app/context/UserProvider";
import Container from "@/components/Container";
import BookingCalendar from "@/components/reservations/BookingCalendar";
import axios from "axios";
import { ArrowLeft, Box, Building2, Car, Flower2, LayoutPanelLeft, MapPin, Users } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
        // On force le rafraîchissement avec un timestamp
        const response = await axios.get(`${baseApiUrl}/api/listings/${listingId}?t=${Date.now()}`)
        console.log("DEBUG API RESPONSE:", response.data);
        setListing(response.data)
      } catch (err) {
        setError("Erreur lors du chargement")
      } finally {
        setLoading(false)
      }
    }
    if (listingId) fetchListing()
  }, [listingId])

  if (loading || userLoading) return <Container><p className="py-32 text-center">Chargement...</p></Container>
  if (error || !listing) return <Container><p className="py-32 text-center text-red-500">Logement introuvable</p></Container>

  // 💡 MAPPING DE SÉCURITÉ : On vérifie TOUTES les variantes possibles (camelCase et snake_case)
  const garden = listing.gardenSize ?? listing.garden_size;
  const garage = listing.hasGarage ?? listing.has_garage;
  const rooms = listing.numberOfRooms ?? listing.number_of_rooms;
  const balcony = listing.balcony; // Souvent booléen simple

  return (
    <Container>
      <div className="max-w-7xl mx-auto pt-32 pb-16">
        {/* --- DEBUG ZONE (A supprimer quand ça marche) --- */}
        <div className="mb-4 p-2 bg-black text-white text-[10px] rounded overflow-x-auto">
             JSON Reçu : {JSON.stringify({ garden, garage, rooms, balcony })}
        </div>

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
            <div className="sticky top-28 border border-gray-200 rounded-2xl p-6 shadow-xl bg-white">
               <BookingCalendar listingId={listing.id} pricePerNight={listing.pricePerNight} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{listing.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 font-medium">
                <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-green-600" /> {listing.localisation?.name || "La Réunion"}</div>
                <div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-green-600" /> {listing.category?.name}</div>
                <div className="flex items-center gap-2"><Users className="w-5 h-5 text-green-600" /> {listing.capacity} pers.</div>
            </div>

            <hr className="border-gray-100" />

            {/* 💡 SECTION CARACTÉRISTIQUES (RESTAURATION) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Affichage Jardin si la valeur existe */}
              {(garden !== undefined && garden !== null) && (
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <Flower2 className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-bold text-gray-900">{garden} m²</span>
                  <span className="text-xs text-gray-500 font-medium">Jardin</span>
                </div>
              )}

              {/* Affichage Garage si la valeur est true */}
              {garage === true && (
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <Car className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-bold text-gray-900">Garage</span>
                  <span className="text-xs text-gray-500 font-medium">Inclus</span>
                </div>
              )}

              {/* Affichage Pièces si la valeur existe */}
              {(rooms !== undefined && rooms !== null) && (
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <Box className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-bold text-gray-900">{rooms}</span>
                  <span className="text-xs text-gray-500 font-medium">Pièces</span>
                </div>
              )}

              {/* Affichage Balcon si la valeur est true */}
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
          </div>
        </div>
      </div>
    </Container>
  )
}
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Container from "@/components/Container";
import Heading from "@/components/Heading";
import ListingCard from "@/components/ListingCard";
import AddListingModal from "@/components/modals/AddListingModal";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function LocationsContent() {
  const router = useRouter()
  const [locations, setLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedListing, setSelectedListing] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken")
    setToken(storedToken)
  }, [])

  const fetchLocations = useCallback(async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const res = await fetch(`${API_URL}/api/my-listings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/ld+json",
        },
      })

      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`)

      const data = await res.json()
      const fetchedData = data["hydra:member"] || data["member"] || data || []
      setLocations(Array.isArray(fetchedData) ? fetchedData : [])
    } catch (err: any) {
      console.error("Erreur Fetch Locations:", err)
      setError("Impossible de charger vos locations.")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) fetchLocations()
    else if (token === null && !isLoading) setIsLoading(false)
  }, [fetchLocations, token, isLoading])

  // --- ACTIONS ---

  // Fonction de suppression réelle
  const executeDelete = async (id: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const res = await fetch(`${API_URL}/api/listings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Erreur suppression")

      setLocations((prev) => prev.filter((item) => item.id !== id))
      toast.success("Annonce supprimée avec succès")
    } catch (err: any) {
      toast.error("Impossible de supprimer l'annonce")
    }
  }

  // Déclencheur du toast de confirmation
  const onDelete = useCallback(
    (id: number) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-sm text-gray-800">
            Voulez-vous vraiment supprimer cette annonce ?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                executeDelete(id)
              }}
              className="px-3 py-1 text-xs bg-rose-500 text-white hover:bg-rose-600 rounded-md transition"
            >
              Supprimer
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: "top-center",
      })
    },
    [token]
  )

  const onEdit = useCallback((location: any) => {
    setSelectedListing(location)
    setIsModalOpen(true)
  }, [])

  // --- RENDU ---
  if (isLoading)
    return (
      <Container>
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Chargement de vos annonces...</p>
        </div>
      </Container>
    )

  if (error)
    return (
      <Container>
        <p className="py-20 text-center text-red-500">{error}</p>
      </Container>
    )

  return (
    <Container>
      <AddListingModal
        open={isModalOpen}
        onOpenChange={(open: boolean) => {
          setIsModalOpen(open)
          if (!open) setSelectedListing(null)
        }}
        listingToEdit={selectedListing}
      />

      <Heading
        title="Mes Locations"
        subtitle={`Gestion de vos ${locations.length} annonce(s)`}
      />

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {locations.length > 0 ? (
          locations.map((location) => (
            <ListingCard
              key={location.id}
              id={location.id}
              title={location.title}
              pricePerNight={location.pricePerNight}
              capacity={location.capacity}
              category={location.category?.name || "Sans catégorie"}
              imageUrl={location.images?.[0]?.url || "/images/placeholder.png"}
              onDelete={() => onDelete(location.id)}
              onEdit={() => onEdit(location)}
            />
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-gray-50">
            <p className="text-gray-500 mb-6 text-lg">
              Vous n'avez pas encore créé d'annonces.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition shadow-md"
            >
              Créer ma première annonce
            </button>
          </div>
        )}
      </div>
    </Container>
  )
}
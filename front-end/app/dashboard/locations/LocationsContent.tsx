/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Heading from "@/components/Heading"
import ListingCard from "@/components/ListingCard"
import AddListingModal from "@/components/modals/AddListingModal"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Container from "@/components/Container";

export default function LocationsContent() {
  const router = useRouter()
  const [locations, setLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedListing, setSelectedListing] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 1. Récupération du token avec sécurité SSR
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
      console.log("Appel API vers my-listings...")
      const res = await fetch("https://localhost:8000/api/my-listings", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/ld+json",
        },
      })

      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`)

      const data = await res.json()
      console.log("Données reçues :", data)

      // API Platform : les données sont souvent dans hydra:member
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
  const onDelete = useCallback(
    async (id: number) => {
      if (!token || !confirm("Supprimer cette annonce ?")) return

      try {
        const res = await fetch(`https://localhost:8000/api/listings/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Erreur suppression")

        setLocations((prev) => prev.filter((item) => item.id !== id))
        toast.success("Supprimé !")
      } catch (err: any) {
        toast.error("Erreur lors de la suppression")
      }
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
        <p className="py-20 text-center">Chargement...</p>
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
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) setSelectedListing(null)
        }}
        listing={selectedListing}
      />

      <Heading
        title="Mes Locations"
        subtitle={`Vous avez ${locations.length} annonce(s)`}
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
              onDelete={onDelete}
              onEdit={() => onEdit(location)}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <p className="text-gray-500 mb-4">
              Vous n'avez pas encore créé d'annonces.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-rose-500 font-bold hover:underline"
            >
              Créer une annonce maintenant
            </button>
          </div>
        )}
      </div>
    </Container>
  )
}

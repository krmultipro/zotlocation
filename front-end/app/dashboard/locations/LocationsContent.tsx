/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Container from "@/components/Container";
import Heading from "@/components/Heading";
import ListingCard from "@/components/ListingCard";
import ModalAjoutAnnonce from "@/components/modals/ModalAjoutAnnonce";
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
      const res = await fetch("https://localhost:8000/api/my-listings", {
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
      setError("Impossible de charger vos locations.")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) fetchLocations()
    else if (token === null && !isLoading) setIsLoading(false)
  }, [fetchLocations, token, isLoading])

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

  // 💡 Ouvre la modale en passant l'objet complet
  const onEdit = useCallback((location: any) => {
    setSelectedListing(location)
    setIsModalOpen(true)
  }, [])

  if (isLoading) return <Container><p className="py-20 text-center">Chargement...</p></Container>

  return (
    <Container>
      <ModalAjoutAnnonce
        open={isModalOpen}
        onOpenChange={(open: boolean) => {
          setIsModalOpen(open)
          if (!open) setSelectedListing(null) // Reset au moment de la fermeture
        }}
        listingToEdit={selectedListing} // Doit correspondre à la prop de la modale
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
              location={location.localisation?.name} //  Affiche la ville
              imageUrl={location.images?.[0]?.url || "/images/placeholder.png"}
              onDelete={onDelete}
              onEdit={() => onEdit(location)} // Passe l'objet à onEdit
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore créé d'annonces.</p>
            <button onClick={() => { setSelectedListing(null); setIsModalOpen(true); }} className="text-rose-500 font-bold hover:underline">
              Créer une annonce maintenant
            </button>
          </div>
        )}
      </div>
    </Container>
  )
}
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useUser } from "@/app/context/UserProvider"
import Container from "@/components/Container"
import Heading from "@/components/Heading"
import ListingCard from "@/components/ListingCard"
import AddListingModal from "@/components/modals/AddListingModal"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function LocationsContent() {
  const router = useRouter()
  const { user, isLoading: isUserLoading } = useUser()
  const [locations, setLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedListing, setSelectedListing] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [token, setToken] = useState<string | null>(null)
  const canManageLocations =
    !!user &&
    (user.isOwner ||
      user.roles?.includes("ROLE_PROPRIETAIRE") ||
      user.roles?.includes("ROLE_ADMIN"))

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
      setError(null)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085"
      const res = await fetch(`${API_URL}/api/my-listings?t=${Date.now()}`, {
        cache: "no-store",
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
    if (isUserLoading) return

    if (!user || !canManageLocations) {
      setIsLoading(false)
      return
    }

    if (token) fetchLocations()
    else if (token === null && !isLoading) setIsLoading(false)
  }, [fetchLocations, token, isLoading, isUserLoading, user, canManageLocations])

  // --- ACTIONS ---

  // Fonction de suppression réelle
  const executeDelete = useCallback(async (id: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085"
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
  }, [token])

  // Déclencheur du toast de confirmation
  const onDelete = useCallback(
    (id: number) => {
      toast(
        (t) => (
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
        ),
        {
          duration: 5000,
          position: "top-center",
        },
      )
    },
    [executeDelete],
  )

  const onEdit = useCallback((location: any) => {
    setSelectedListing(location)
    setIsModalOpen(true)
  }, [])

  const handleListingSaved = useCallback(
    async (savedListing: any) => {
      if (savedListing?.id) {
        setLocations((current) => {
          const exists = current.some((item) => item.id === savedListing.id)
          if (exists) {
            return current.map((item) =>
              item.id === savedListing.id ? savedListing : item,
            )
          }
          return [savedListing, ...current]
        })
      }

      await fetchLocations()
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    },
    [fetchLocations],
  )

  // --- RENDU ---
  if (isUserLoading || isLoading)
    return (
      <Container>
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Chargement de vos annonces...</p>
        </div>
      </Container>
    )

  if (!user)
    return (
      <Container>
        <div className="py-20 text-center">
          <Heading
            title="Connexion requise"
            subtitle="Vous devez être connecté pour accéder à cette page."
          />
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Retour à l'accueil
          </Link>
        </div>
      </Container>
    )

  if (!canManageLocations)
    return (
      <Container>
        <div className="py-20 text-center">
          <Heading
            title="Accès refusé"
            subtitle="Cette page est réservée aux propriétaires."
          />
          <Link
            href="/dashboard/reservations"
            className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Voir mes réservations
          </Link>
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
        onSuccess={handleListingSaved}
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

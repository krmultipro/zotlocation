"use client"

import ListingCard from "@/components/ListingCard"
import Container from "@/components/Container"
import Heading from "@/components/Heading"
import { useEffect, useState, useCallback } from "react"
import { toast } from "react-hot-toast"

export default function LocationsContent() {
  const [locations, setLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

  const fetchLocations = useCallback(async () => {
    if (!token) {
      setError("Veuillez vous connecter.")
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

      if (!res.ok) {
        if (res.status === 401) {
          setError("Session expirée.")
        } else {
          throw new Error(`Erreur chargement: ${res.status}`)
        }
      }

      const data = await res.json()
      console.log("data: ",data)
      setLocations(data.member ?? data["hydra:member"] ?? [])
    } catch (err: any) {
      toast.error(err.message)
      setError("Impossible de charger vos locations.")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  if (isLoading) return <p>Chargement...</p>
  if (error) return <p>{error}</p>

  return (
    <Container>
          <Heading
        title="Mes Locations"
        subtitle={`Vous avez ${locations.length} locations`}
      />

      {locations.length === 0 && <p>Aucune location créée.</p>}

        <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {locations.map((location) => (
            <ListingCard 
              key={location.id}
              id={location.id}
              title={location.title}
              pricePerNight={location.pricePerNight}
              capacity={location.capacity}
              category={location.category?.name || "Sans catégorie"}
              imageUrl={location.images?.[0]?.url || "/images/placeholder.png"}
              >
            </ListingCard>
          ))}
        </div>



    </Container>
  )
}

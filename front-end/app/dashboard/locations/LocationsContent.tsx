"use client"

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
      setLocations(data["hydra:member"] || [])
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
    <div>
      <h2 className="text-xl font-bold mb-4">Mes locations</h2>

      {locations.length === 0 && <p>Aucune annonce créée.</p>}

      <ul>
        {locations.map((location) => (
          <li key={location.id}>
            {location.title}
          </li>
        ))}
      </ul>
    </div>
  )
}

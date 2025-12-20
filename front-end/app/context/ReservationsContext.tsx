"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

interface Listing {
  id: number
  title: string
  pricePerNight: number
  capacity: number
  category?: { name: string }
  images?: { url: string }[]
}

export interface Booking {
  id: number
  startDate: string
  endDate: string
  totalPrice: number
  listing: Listing
  duration?: number
}

interface ReservationsContextType {
  bookings: Booking[]
  isLoading: boolean
  refreshBookings: () => void
}

const ReservationsContext = createContext<ReservationsContextType | null>(null)

export const ReservationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [trigger, setTrigger] = useState(0)

  const fetchBookings = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null

    // Si pas de token, on ne peut rien charger.
    // On attend que l'utilisateur soit connecté.
    if (!token) {
      setBookings([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000"
      let userId: number | null = null

      // 1. On tente l'ID du localStorage d'abord (plus rapide pour l'affichage initial)
      if (storedUser) {
        try {
          userId = JSON.parse(storedUser).id
        } catch (e) {
          console.error("Erreur parsing user local")
        }
      }

      // 2. Si pas d'ID en local, ou pour vérifier la validité, on appelle /api/me
      if (!userId) {
        const meRes = await fetch(`${API_URL}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        if (meRes.ok) {
          const userData = await meRes.json()
          userId = userData.id
        }
      }

      if (!userId) throw new Error("Utilisateur non identifié")

      // 3. Récupération des réservations
      const res = await fetch(`${API_URL}/api/bookings?booker=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/ld+json",
        },
      })

      if (!res.ok) throw new Error("Erreur serveur")

      const data = await res.json()
      const bookingsArray =
        data["member"] ||
        data["hydra:member"] ||
        (Array.isArray(data) ? data : [])

      setBookings(bookingsArray)
    } catch (err) {
      console.error("Erreur ReservationsContext:", err)
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }, [trigger]) // Dépend de trigger pour permettre le refresh manuel

  // Fonction exposée pour forcer le rechargement
  const refreshBookings = useCallback(() => {
    setTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    fetchBookings()

    // Gestion des événements globaux
    const handleAuthChange = () => fetchBookings()

    window.addEventListener("reservations:updated", handleAuthChange)
    window.addEventListener("storage", handleAuthChange)

    return () => {
      window.removeEventListener("reservations:updated", handleAuthChange)
      window.removeEventListener("storage", handleAuthChange)
    }
  }, [fetchBookings])

  return (
    <ReservationsContext.Provider
      value={{ bookings, isLoading, refreshBookings }}
    >
      {children}
    </ReservationsContext.Provider>
  )
}

export const useReservations = () => {
  const context = useContext(ReservationsContext)
  if (!context)
    throw new Error(
      "useReservations doit être utilisé dans un ReservationsProvider"
    )
  return context
}

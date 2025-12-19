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

      // Tentative de récupération de l'ID utilisateur (Dynamique via /api/me)
      try {
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
      } catch (e) {
        // Secours via localStorage si la route /api/me échoue
        if (storedUser) {
          userId = JSON.parse(storedUser).id
        }
      }

      if (!userId) {
        setIsLoading(false)
        return
      }

      // Récupération des réservations filtrées par l'ID du booker
      const res = await fetch(`${API_URL}/api/bookings?booker=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/ld+json",
        },
      })

      if (!res.ok) throw new Error("Erreur lors du chargement des réservations")

      const data = await res.json()

      // Extraction compatible avec les formats JSON-LD (member ou hydra:member)
      const bookingsArray =
        data["member"] ||
        data["hydra:member"] ||
        (Array.isArray(data) ? data : [])

      setBookings(bookingsArray)
    } catch (err) {
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }, [trigger])

  useEffect(() => {
    fetchBookings()

    const handleUpdate = () => {
      setTrigger((prev) => prev + 1)
    }

    window.addEventListener("reservations:updated", handleUpdate)
    return () => {
      window.removeEventListener("reservations:updated", handleUpdate)
    }
  }, [fetchBookings])

  const refreshBookings = useCallback(() => {
    window.dispatchEvent(new Event("reservations:updated"))
  }, [])

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

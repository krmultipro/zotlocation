/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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
  status: string // 'pending', 'paid', 'cancelled'
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
    const token = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

    if (!token) {
      setBookings([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      let userId: number | null = null

      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          userId = parsed.id || parsed.userId
        } catch (e) {
          console.error("Erreur lors du parsing de l'utilisateur")
        }
      }

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

      const res = await fetch(`${API_URL}/api/bookings?booker=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/ld+json",
        },
      })

      if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`)

      const data = await res.json()
      const bookingsArray = data["member"] || data["hydra:member"] || (Array.isArray(data) ? data : [])

      setBookings(bookingsArray)
    } catch (err) {
      console.error("Erreur ReservationsContext:", err)
    } finally {
      setIsLoading(false)
    }
  }, [trigger])

  const refreshBookings = useCallback(() => {
    // Utiliser Date.now() force React à voir un changement immédiat
    setTrigger(Date.now());
}, []);

  useEffect(() => {
    fetchBookings()
    const handleRefresh = () => refreshBookings()
    window.addEventListener("reservations:updated", handleRefresh)
    window.addEventListener("storage", handleRefresh)

    return () => {
      window.removeEventListener("reservations:updated", handleRefresh)
      window.removeEventListener("storage", handleRefresh)
    }
  }, [fetchBookings, refreshBookings])

  return (
    <ReservationsContext.Provider value={{ bookings, isLoading, refreshBookings }}>
      {children}
    </ReservationsContext.Provider>
  )
}

export const useReservations = () => {
  const context = useContext(ReservationsContext)
  if (!context) throw new Error("useReservations doit être utilisé dans un ReservationsProvider")
  return context
}
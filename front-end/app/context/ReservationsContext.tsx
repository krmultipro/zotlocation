"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import toast from "react-hot-toast"

interface Listing {
  id: number
  title: string
  pricePerNight: number
  capacity: number
  category?: { name: string }
  // Assurez-vous que l'entité Image.php est sérialisée avec 'booking:read' pour voir l'URL
  images?: { url: string }[]
}

export interface Booking {
  id: number
  startDate: string
  endDate: string
  totalPrice: number
  listing: Listing
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
  const [trigger, setTrigger] = useState(0) // Utilisé pour forcer le rafraîchissement

  // Fonction de récupération principale
  const fetchBookings = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

    if (!token) {
      setBookings([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000"
      const res = await fetch(`${API_URL}/api/users/me/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json", // Changé pour du JSON simple car le contrôleur le renvoie
        },
      })

      if (!res.ok) {
        throw new Error("Impossible de récupérer vos réservations.")
      }

      const data = await res.json()

      // 💡 CORRECTION MAJEURE : Gérer la réponse de votre Contrôleur Symfony Classique (tableau direct)
      // Si c'est un tableau, on l'utilise. Sinon, on essaie hydra:member, sinon un tableau vide.
      const bookingsArray = Array.isArray(data) ? data : (data["hydra:member"] || [])

      setBookings(bookingsArray as Booking[])

    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Erreur lors de la récupération des réservations.")
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }, [trigger]) // fetchBookings dépend de 'trigger' pour être exécuté quand il change

  // Exécution du fetch au montage et quand 'trigger' change
  useEffect(() => {
    fetchBookings()

    // Gestion de l'événement de rafraîchissement global
    const handleUpdate = () => {
        // Incrémente 'trigger' pour relancer fetchBookings
        setTrigger((prev) => prev + 1)
    }

    window.addEventListener("reservations:updated", handleUpdate)

    return () => {
      window.removeEventListener("reservations:updated", handleUpdate)
    }
  }, [fetchBookings]) // fetchBookings est la seule dépendance ici, car 'trigger' est dans fetchBookings

  // Fonction exposée pour rafraîchir manuellement (via dispatchEvent)
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
    throw new Error("useReservations doit être utilisé dans un ReservationsProvider")
  return context
}
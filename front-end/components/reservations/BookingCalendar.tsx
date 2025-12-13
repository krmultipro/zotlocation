"use client"

import { useEffect, useMemo, useState } from "react"
import { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/context/UserProvider"

interface BookingCalendarProps {
  listingId: number
  pricePerNight: number
}

export default function BookingCalendar({
  listingId,
  pricePerNight,
}: BookingCalendarProps) {
  const router = useRouter()
  const { user } = useUser()

  const [range, setRange] = useState<DateRange>()
  const [disabledDates, setDisabledDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(false)

  // 🔹 Charger les réservations existantes
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("jwtToken")
        const apiUrl = process.env.NEXT_PUBLIC_API_URL

        const res = await axios.get(
          `${apiUrl}/api/bookings?listing=/api/listings/${listingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/ld+json",
            },
          }
        )

        const dates: Date[] = []

        // 💡 CORRECTION 1 : S'assurer que 'hydra:member' existe
        const bookingsData = res.data["hydra:member"] || []

        bookingsData.forEach((booking: any) => {
          // Note : On utilise 'new Date(string)' pour les dates de l'API
          let current = new Date(booking.startDate)
          const end = new Date(booking.endDate)

          // Boucler pour désactiver tous les jours entre la date de début et de fin incluses
          while (current <= end) {
            // Créer une nouvelle instance de Date pour éviter les problèmes de référence
            dates.push(new Date(current))
            current.setDate(current.getDate() + 1)
          }
        })
        setDisabledDates(dates)
      } catch (err) {
        console.error("Erreur lors du chargement des réservations du logement:", err)
      }
    }

    fetchBookings()
  }, [listingId])

  // 🔹 Calcul nuits & total
  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0
    return Math.ceil(
      (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)
    )
  }, [range])

  const total = nights * pricePerNight

  // 🔹 Création réservation
  const handleBooking = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour réserver")
      router.push("/")
      return
    }

    if (!range?.from || !range?.to) {
      toast.error("Veuillez sélectionner des dates")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("jwtToken")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      await axios.post(
        `${apiUrl}/api/bookings`,
        {
          listing: `/api/listings/${listingId}`,
          startDate: range.from,
          endDate: range.to,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast.success("Réservation confirmée 🎉")

      // 💡 CORRECTION 2 : Déclenche le rafraîchissement du ReservationsContext
      window.dispatchEvent(new Event("reservations:updated"))

      router.push("/dashboard/reservations")
    } catch (err: any) {
      console.error(err)
      toast.error("Erreur lors de la réservation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        numberOfMonths={1}
        disabled={[
          { before: new Date() },
          ...disabledDates,
        ]}
        className="rounded-md border [&_.rdp-day_selected]:bg-green-500 [&_.rdp-day_selected]:text-white"
      />

      {nights > 0 && (
        <div className="text-sm text-gray-600">
          {nights} nuits · <strong>{total}€</strong>
        </div>
      )}

      <Button
        onClick={handleBooking}
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 text-white"
      >
        Réserver
      </Button>
    </div>
  )
}
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useUser } from "@/app/context/UserProvider"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { DateRange } from "react-day-picker"
import toast from "react-hot-toast"

interface BookingCalendarProps {
  listingId: number
  pricePerNight: number
}

// 💡 Utilitaire pour formater la date pour l'envoi API (YYYY-MM-DD)
const getLocalFormattedDate = (date: Date): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().substring(0, 10)
}

// 💡 Utilitaire pour créer une date locale sans décalage à partir d'une string API
const createLocalDay = (dateString: string): Date => {
  const parts = dateString.split("T")[0].split("-")
  return new Date(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2])
  )
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

  // 🔹 Charger les réservations existantes pour griser les dates
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("jwtToken")
        const apiUrl = process.env.NEXT_PUBLIC_API_URL

        const res = await axios.get(
          `${apiUrl}/api/bookings?listing=${listingId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              Accept: "application/ld+json",
            },
          }
        )

        // 💡 Support des deux formats de réponse API Platform
        const bookingsData =
          res.data["member"] || res.data["hydra:member"] || []
        const dates: Date[] = []

        bookingsData.forEach((booking: any) => {
          const current = createLocalDay(booking.startDate)
          const end = createLocalDay(booking.endDate)

          // 💡 On grise du début jusqu'à la veille de la fin
          // (le jour du check-out est disponible pour le prochain voyageur)
          while (current < end) {
            dates.push(new Date(current))
            current.setDate(current.getDate() + 1)
          }
        })

        setDisabledDates(dates)
      } catch (err) {
        console.error("Erreur lors du chargement des réservations:", err)
      }
    }

    if (listingId) {
      fetchBookings()
    }
  }, [listingId])

  // 🔹 Calcul du nombre de nuits et du prix total
  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0
    return Math.ceil(
      (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)
    )
  }, [range])

  const total = nights * pricePerNight

  // 🔹 Action de réservation
  const handleBooking = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour réserver")
      return
    }

    if (!range?.from || !range?.to) {
      toast.error("Veuillez sélectionner une période")
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
          startDate: getLocalFormattedDate(range.from),
          endDate: getLocalFormattedDate(range.to),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      toast.success("Réservation confirmée 🎉")
      window.dispatchEvent(new Event("reservations:updated"))
      router.push("/dashboard/reservations")
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Dates indisponibles"
      toast.error(msg)
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
        // Désactiver les dates passées et les dates déjà réservées
        disabled={[{ before: new Date() }, ...disabledDates]}
        className="rounded-md border
          [&_.rdp-day_selected]:bg-green-600
          [&_.rdp-day_selected]:text-white
          [&_.rdp-day_range_middle]:bg-green-100
          [&_.rdp-day_range_middle]:text-green-900"
      />

      {nights > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span>
              {pricePerNight}€ x {nights} nuits
            </span>
            <span className="font-bold">{total}€</span>
          </div>
        </div>
      )}

      <Button
        onClick={handleBooking}
        disabled={loading || !range?.from || !range?.to}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6"
      >
        {loading ? "Confirmation..." : "Réserver maintenant"}
      </Button>
    </div>
  )
}

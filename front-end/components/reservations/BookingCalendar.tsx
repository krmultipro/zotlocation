// src/components/modals/BookingCalendar.tsx

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

// 💡 FONCTION UTILITAIRE POUR CORRIGER LE DÉCALAGE UTC lors de l'ENVOI
const getLocalFormattedDate = (date: Date): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().substring(0, 10)
}

// 💡 FONCTION UTILITAIRE ROBUSTE POUR CRÉER UNE DATE LOCALE à partir de 'YYYY-MM-DD'
const createLocalDay = (dateString: string): Date => {
  const parts = dateString.split("-")
  // Utilise le constructeur Date(année, mois-index, jour) pour créer une date locale fiable.
  return new Date(
    parseInt(parts[0]), // Année
    parseInt(parts[1]) - 1, // Mois (0-indexé)
    parseInt(parts[2]) // Jour
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

  // 🔹 Charger les réservations existantes et désactiver les dates
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
        const bookingsData = res.data["hydra:member"] || []

        // 🛑 DEBUG : Affiche les données de réservation brutes reçues de l'API
        console.log(
          "DEBUG: Données de réservation brutes reçues de l'API:",
          bookingsData
        )

        bookingsData.forEach((booking: any) => {
          const current = createLocalDay(booking.startDate)
          const end = createLocalDay(booking.endDate)

          // Timestamp pour un jour (24 heures)
          const oneDay = 1000 * 60 * 60 * 24

          // 💡 Utilisation des Timestamps pour la comparaison et l'incrémentation (Méthode la plus sûre)
          let currentTime = current.getTime()
          const endTime = end.getTime()

          // Logique de grisement : Tant que le timestamp actuel est strictement inférieur à la fin
          while (currentTime < endTime) {
            // Ajouter le jour à désactiver à partir du timestamp
            dates.push(new Date(currentTime))

            // Incrémenter le timestamp de 24 heures
            currentTime += oneDay
          }
        })

        // 🛑 DEBUG CRITIQUE : Affiche les objets Date exacts générés pour la désactivation
        console.log(
          "DEBUG: Liste des jours désactivés générés (doivent être affichés):",
          dates
        )

        setDisabledDates(dates)
      } catch (err) {
        console.error(
          "Erreur lors du chargement des réservations du logement:",
          err
        )
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

      // Envoi : Utilisation de la fonction fiable getLocalFormattedDate
      const formattedStartDate = getLocalFormattedDate(range.from)
      const formattedEndDate = getLocalFormattedDate(range.to)

      await axios.post(
        `${apiUrl}/api/bookings`,
        {
          listing: `/api/listings/${listingId}`,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast.success("Réservation confirmée 🎉")

      window.dispatchEvent(new Event("reservations:updated"))

      router.push("/dashboard/reservations")
    } catch (err: any) {
      // Gestion de l'erreur 409 (Conflict)
      const errorMessage =
        err.response?.data?.detail || "Erreur lors de la réservation"
      console.error(err)
      toast.error(errorMessage)
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
        disabled={[{ before: new Date() }, ...disabledDates]}
        className="rounded-md border [
          &_.rdp-day_selected]:bg-green-600
          [&_.rdp-day_selected]:text-white
          [&_.rdp-day_range_middle]:bg-green-200
          [&_.rdp-day_range_middle]:text-gray-800
        "
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

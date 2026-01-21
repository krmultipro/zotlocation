/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Modal from "@/components/modals/Modal"
import { Calendar } from "@/components/ui/calendar"
import { addDays, differenceInDays } from "date-fns"
import { Loader2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
// Import des interfaces manquantes

// --- INTERFACES MANQUANTES AJOUTÉES ICI ---
interface Booking {
  id: number
  startDate: string
  endDate: string
  totalPrice: number
  listing: {
    id: number
    title: string
    pricePerNight: number
  }
}

interface ListingData {
  id: number
  title: string
  pricePerNight: number
  bookings: Booking[]
}

interface BookingEditModalProps {
  isOpen: boolean
  booking: Booking
  onClose: () => void
  onSuccess: () => void // Fonction pour recharger les réservations
}
// --- FIN DES INTERFACES MANQUANTES ---

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

const BookingEditModal: React.FC<BookingEditModalProps> = ({
  isOpen,
  booking,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const [listingData, setListingData] = useState<ListingData | null>(null)

  // Initialiser la plage avec les dates existantes
  const initialRange = {
    from: new Date(booking.startDate.split("T")[0]),
    to: new Date(booking.endDate.split("T")[0]),
  }
  const [range, setRange] = useState<any>(initialRange)

  // --- 1. CHARGEMENT DES DONNÉES DE L'ANNONCE (et des dates réservées) ---
  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      setIsLoading(true)

      try {
        const res = await fetch(`${API_URL}/api/listings/${booking.listing.id}`)

        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(
            `Échec du chargement de l'annonce (${
              res.status
            }). Détail: ${errorText.substring(0, 100)}...`
          )
        }

        const data = await res.json()
        setListingData(data)
      } catch (err: any) {
        console.error("ERREUR CRITIQUE DANS LE CHARGEMENT DE LA MODALE:", err)
        toast.error(
          err.message ||
            "Erreur lors du chargement des données. Consultez la console."
        )
        onClose()
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [booking.listing.id, onClose, isOpen])

  // --- 2. CALCUL DES NOUVELLES DONNÉES ET DATES INDISPONIBLES ---

  const newDaysCount = useMemo(() => {
    if (!range?.from || !range?.to) return 0

    const count = Math.ceil(differenceInDays(range.to, range.from))

    console.log(`[EditModal] Jours calculés: ${count}`)

    return count > 0 ? count : 0
  }, [range])

  const newTotalPrice = useMemo(() => {
    if (!listingData || newDaysCount <= 0) return 0
    return newDaysCount * listingData.pricePerNight
  }, [listingData, newDaysCount])

  // Dates déjà réservées par les AUTRES utilisateurs (pour griser le calendrier)
  const disabledDates = useMemo(() => {
    if (!listingData) return []

    // Désactiver les dates passées
    const dates: { before: Date }[] = [{ before: addDays(new Date(), -1) }]

    listingData.bookings.forEach((b) => {
      // Ignorer la réservation en cours d'édition
      if (b.id === booking.id) return

      const start = new Date(b.startDate.split("T")[0])
      const end = new Date(b.endDate.split("T")[0])

      let loopDate = start
      while (loopDate < end) {
        dates.push({ before: new Date(loopDate) })
        loopDate = addDays(loopDate, 1)
      }
    })

    return dates
  }, [listingData, booking.id])

  // --- 3. GESTION DE L'ENVOI (PATCH) ---
  const handleSubmit = useCallback(async () => {
    if (!listingData || newDaysCount <= 0) {
      toast.error(
        "Veuillez sélectionner des dates valides (au moins une nuit)."
      )
      return
    }
    if (!range.from || !range.to) {
      toast.error("Veuillez sélectionner une plage de dates.")
      return
    }

    setIsLoading(true) // Désactive le bouton lors de la soumission

    const token = localStorage.getItem("jwtToken")
    console.log("Token JWT trouvé:", !!token)

    if (!token) {
      toast.error("Veuillez vous reconnecter.")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Envoyer les dates au format YYYY-MM-DD
          startDate: range.from.toISOString().split("T")[0],
          endDate: range.to.toISOString().split("T")[0],
        }),
      })

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ "hydra:description": "Erreur non décodable" }))
        const errorMessage =
          errorData["hydra:description"] || "Erreur lors de la modification."
        throw new Error(errorMessage)
      }

      toast.success(
        "Réservation modifiée avec succès! Les nouvelles dates ont été enregistrées."
      )
      if (typeof onSuccess === "function") {
        onSuccess()
      }
      onClose()
    } catch (err: any) {
      console.error("Erreur de soumission de la modification:", err)
      toast.error(
        err.message || "Erreur lors de la modification de la réservation."
      )
    } finally {
      // Réactive le bouton à la fin
      setIsLoading(false)
    }
  }, [booking.id, range, listingData, newDaysCount, onSuccess, onClose])

  // --- 4. Rendu du contenu de la modale ---
  const bodyContent = (
    <div className="flex flex-col gap-4">
      {/* Calendrier intégré */}
      <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
        {isLoading ? (
          <Loader2 className="animate-spin w-6 h-6 text-green-500" />
        ) : (
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
            disabled={disabledDates}
            className="rounded-md border [
              &_.rdp-day_selected]:bg-green-600!important
              [&_.rdp-day_selected]:text-white!important
              [&_.rdp-day_range_middle]:bg-green-200!important
              [&_.rdp-day_range_middle]:text-gray-800!important
              [&_.rdp-day_range_middle]:hover:bg-green-300!important
          "
          />
        )}
      </div>

      {/* Résumé du prix */}
      <div className="mt-2 p-4 border-t flex justify-between items-center font-bold">
        <span>Nouveau Prix Total:</span>
        {isLoading ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          <span>
            {newTotalPrice.toFixed(2)}€ ({newDaysCount} nuits)
          </span>
        )}
      </div>
    </div>
  )

  // Rendu avec votre composant Modal
  return (
    <Modal
      isOpen={isOpen}
      title={""}
      actionLabel="Confirmer la Modification"
      onSubmit={handleSubmit}
      onClose={onClose}
      body={bodyContent}
      // Le bouton est actif si isLoading est faux ET newDaysCount > 0
      disabled={isLoading || newDaysCount <= 0}
    />
  )
}

export default BookingEditModal

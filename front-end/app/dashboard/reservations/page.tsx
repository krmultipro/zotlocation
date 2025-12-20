/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useReservations } from "@/app/context/ReservationsContext"
import Container from "@/components/Container"
import ListingCard from "@/components/ListingCard"
import BookingEditModal from "@/components/modals/BookingEditModal"
import { differenceInDays, format } from "date-fns"
import { Calendar, Edit, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-hot-toast"

const ReservationsPage = () => {
  const router = useRouter()
  const { bookings, isLoading, refreshBookings } = useReservations()

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null)

  // 💡 SOLUTION AU PROBLÈME D'AFFICHAGE INITIAL
  // On force le rafraîchissement dès que l'utilisateur arrive sur la page
  // Cela garantit que si le contexte était "vide" à cause d'une connexion récente,
  // les données sont récupérées immédiatement.
  useEffect(() => {
    refreshBookings()
  }, [refreshBookings])

  const onCancel = useCallback(
    async (bookingId: number, event: React.MouseEvent) => {
      event.stopPropagation()

      const token =
        typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null
      if (!token) {
        toast.error("Vous n'êtes plus connecté.")
        return
      }

      if (
        !window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")
      ) {
        return
      }

      setDeletingId(bookingId)

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000"

        const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Échec de l'annulation.")

        toast.success("Réservation annulée avec succès.")

        // On rafraîchit la liste globale
        refreshBookings()

        // Optionnel : Rediriger vers l'accueil ou rester sur la page
        // Si vous restez sur la page, refreshBookings() suffit à mettre à jour la liste
        router.push("/")
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de l'annulation.")
      } finally {
        setDeletingId(null)
      }
    },
    [refreshBookings, router]
  )

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0
    const startDate = new Date(start.split("T")[0])
    const endDate = new Date(end.split("T")[0])
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0
    return differenceInDays(endDate, startDate)
  }

  if (isLoading) {
    return (
      <Container>
        <div className="w-full h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin w-10 h-10 text-green-500 mb-4" />
          <p className="text-xl font-semibold text-gray-700">
            Synchronisation de vos réservations...
          </p>
        </div>
      </Container>
    )
  }

  if (bookings.length === 0) {
    return (
      <Container>
        <div className="pt-24 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Aucune réservation trouvée
          </h2>
          <p className="text-gray-500 mt-2 mb-6">
            Il semble que vous n'ayez pas encore planifié de voyage.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Explorer les annonces
          </button>
        </div>
      </Container>
    )
  }

  const editingBooking = bookings.find((b) => b.id === editingBookingId)

  return (
    <Container>
      <div className="py-10">
        <h1 className="text-3xl font-bold mb-8">
          📅 Mes Réservations ({bookings.length})
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {bookings.map((booking) => {
            const days =
              booking.duration ??
              calculateDays(booking.startDate, booking.endDate)
            const isDeleting = deletingId === booking.id

            const start = booking.startDate
              ? new Date(booking.startDate.split("T")[0])
              : null
            const end = booking.endDate
              ? new Date(booking.endDate.split("T")[0])
              : null
            const isDateValid =
              start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())

            const actionButtons = (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingBookingId(booking.id)
                  }}
                  className="p-2 rounded-full transition bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                  title="Modifier les dates"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => onCancel(booking.id, e)}
                  disabled={isDeleting}
                  className={`p-2 rounded-full transition shadow-sm ${
                    isDeleting
                      ? "bg-gray-300 text-gray-500"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                  title="Annuler la réservation"
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            )

            return (
              <div key={booking.id} className="relative group">
                <ListingCard
                  id={booking.listing.id}
                  title={booking.listing.title}
                  pricePerNight={booking.listing.pricePerNight}
                  capacity={booking.listing.capacity}
                  category={booking.listing.category?.name || "Hébergement"}
                  imageUrl={
                    booking.listing.images?.[0]?.url ||
                    "/images/placeholder.png"
                  }
                  actionButton={actionButtons}
                  extraInfo={
                    <div className="flex flex-col text-sm font-medium space-y-1 mt-2">
                      <span className="text-green-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {isDateValid
                          ? `Du ${format(start!, "dd/MM/yyyy")} au ${format(
                              end!,
                              "dd/MM/yyyy"
                            )}`
                          : "Dates à confirmer"}
                      </span>
                      <span className="text-gray-700">
                        {days > 0 ? (
                          <>
                            <strong>{days} nuits</strong> · Total:{" "}
                            <strong>{booking.totalPrice}€</strong>
                          </>
                        ) : (
                          "Séjour court"
                        )}
                      </span>
                    </div>
                  }
                />
              </div>
            )
          })}
        </div>
      </div>

      {editingBooking && (
        <BookingEditModal
          isOpen={!!editingBooking}
          booking={editingBooking}
          onClose={() => setEditingBookingId(null)}
          onSuccess={() => {
            refreshBookings()
            setEditingBookingId(null)
          }}
        />
      )}
    </Container>
  )
}

export default ReservationsPage

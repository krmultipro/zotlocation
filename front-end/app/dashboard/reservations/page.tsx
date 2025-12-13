"use client"

import Container from "@/components/Container"
import ListingCard from "@/components/ListingCard"
import { Calendar, Loader2, Trash2, Edit } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { toast } from "react-hot-toast"
import { useCallback, useState } from "react"
import { useReservations } from "@/app/context/ReservationsContext"
import { useRouter } from "next/navigation"; //  ESSENTIEL : Import du hook de navigation

// Import de la modale de modification des dates
import BookingEditModal from "@/components/modals/BookingEditModal"

const ReservationsPage = () => {
  const router = useRouter(); // 💡 INITIALISATION
  const { bookings, isLoading, fetchBookings } = useReservations()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null)

  // 💡 CORRECTION SUPPRESSION & REDIRECTION
  const onCancel = useCallback(async (bookingId: number, event: React.MouseEvent) => {
    // ESSENTIEL : Empêcher l'événement de se propager au Link parent
    event.stopPropagation();

    const token =
      typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

    if (!token) {
      toast.error("Vous n'êtes plus connecté.")
      return
    }

    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      return
    }

    setDeletingId(bookingId)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000"

      const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Échec de l'annulation.")

      toast.success("Réservation annulée avec succès.")

      // 1. Rechargement des données (pour le cas où la redirection échoue)
      if (fetchBookings) {
        fetchBookings();
      } else {
        window.dispatchEvent(new Event("reservations:updated"))
      }

      // 2. Redirection vers la page d'accueil (selon votre demande)
      router.push('/');

    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'annulation.")
    } finally {
      setDeletingId(null)
    }
  }, [fetchBookings, router]) // router est ajouté comme dépendance

  // LOGIQUE DE CALCUL DES JOURS
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;

    const cleanStartDate = start.split('T')[0];
    const cleanEndDate = end.split('T')[0];

    const startDate = new Date(cleanStartDate);
    const endDate = new Date(cleanEndDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Date invalide détectée (calcul days):", start, end);
        return 0;
    }

    return differenceInDays(endDate, startDate)
  }

  if (isLoading) {
    return (
      <Container>
        <div className="w-full h-[60vh] flex items-center justify-center">
          <Loader2 className="animate-spin w-6 h-6 text-green-500" />
          <p className="ml-3 text-xl font-semibold text-gray-700">
            Chargement de vos réservations...
          </p>
        </div>
      </Container>
    )
  }

  if (bookings.length === 0) {
    return (
      <Container>
        <div className="pt-24 text-center font-semibold text-gray-600">
          Vous n'avez aucune réservation pour le moment.
          <p className="text-sm text-gray-500 mt-2">
            Commencez par explorer nos annonces !
          </p>
        </div>
      </Container>
    )
  }

  const editingBooking = bookings.find(b => b.id === editingBookingId);

  return (
    <Container>
      <div className="py-10">
        <h1 className="text-3xl font-bold mb-8">
          📅 Mes Réservations ({bookings.length})
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

          {bookings.map((booking) => {
            const days = booking.duration ?? calculateDays(booking.startDate, booking.endDate)
            const isDeleting = deletingId === booking.id

            const start = booking.startDate ? new Date(booking.startDate.split('T')[0]) : null;
            const end = booking.endDate ? new Date(booking.endDate.split('T')[0]) : null;
            const isDateValid = start && end && !isNaN(start.getTime()) && !isNaN(end.getTime());

            // Regroupement des boutons d'action
            const actionButtons = (
                <div className="flex items-center gap-2">
                    {/* Bouton Modifier */}
                    <button
                        onClick={(e) => {
                          console.log("Clic sur modifier qui fonctionne")

                            e.stopPropagation(); // ESSENTIEL: Empêche la navigation
                            setEditingBookingId(booking.id);
                        }}
                        className="p-2 rounded-full transition text-sm font-semibold z-10 bg-blue-500 text-white hover:bg-blue-600"
                        title="Modifier la réservation"
                    >
                        <Edit className="w-4 h-4" />
                    </button>

                    {/* Bouton Annuler/Supprimer */}
                    <button
                        onClick={(e) => onCancel(booking.id, e)} // Passer l'événement
                        disabled={isDeleting}
                        className={`
                            p-2 rounded-full transition text-sm font-semibold z-10
                            ${
                                isDeleting
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }
                        `}
                        title="Annuler la réservation"
                    >
                        {isDeleting ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            );


            return (
              <div
                key={booking.id}
                className="relative"
              >
                <ListingCard
                  id={booking.listing.id}
                  title={booking.listing.title}
                  pricePerNight={booking.listing.pricePerNight}
                  capacity={booking.listing.capacity}
                  category={booking.listing.category?.name || "Sans catégorie"}

                  imageUrl={
                    booking.listing.images?.[0]?.url ||
                    "/images/placeholder.png"
                  }

                  actionButton={actionButtons}

                  extraInfo={
                    <div className="flex flex-col text-sm font-medium space-y-1 mt-2">
                      <span className="text-green-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {isDateValid ? (
                            <>
                                Du {format(start!, "dd/MM/yyyy")}{" "}
                                au {format(end!, "dd/MM/yyyy")}
                            </>
                        ) : (
                            "Dates Invalides"
                        )}
                      </span>
                      <span className="text-gray-700">
                        {days > 0 ? (
                            <>
                                <strong>{days} nuits</strong> · Total payé:{" "}
                                <span className="font-bold">{booking.totalPrice}€</span>
                            </>
                        ) : (
                            "Calcul des nuits impossible."
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

      {/* TODO: Modale de modification des réservations (à créer) */}
      {editingBooking && (
        <BookingEditModal
        isOpen={!!editingBooking}
          booking={editingBooking}
          onClose={() => setEditingBookingId(null)}
          onSuccess={fetchBookings}
        />
      )}

    </Container>
  )
}

export default ReservationsPage
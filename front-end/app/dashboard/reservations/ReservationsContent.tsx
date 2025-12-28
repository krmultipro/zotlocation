"use client"

import { useReservations } from "@/app/context/ReservationsContext"
import Container from "@/components/Container"
import ListingCard from "@/components/ListingCard"
import BookingEditModal from "@/components/modals/BookingEditModal"
import Heading from "@/components/Heading"
import ReviewModal from "@/components/modals/ReviewModal"
import { differenceInDays, format } from "date-fns"
import { Edit, Loader2, Star, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function ReservationsContent() {
  const router = useRouter()
  const { bookings, isLoading, refreshBookings } = useReservations()

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null)
  const [reviewListingId, setReviewListingId] = useState<number | null>(null)

  useEffect(() => {
    refreshBookings()
  }, [refreshBookings])

  const onCancel = useCallback(
    async (bookingId: number, event: React.MouseEvent) => {
      event.stopPropagation()
      const token = localStorage.getItem("jwtToken")
      if (!token) return toast.error("Vous n'êtes plus connecté.")

      if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?"))
        return

      setDeletingId(bookingId)

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000"

        const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Échec de l'annulation.")

        toast.success("Réservation annulée avec succès.")
        refreshBookings()
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
    const startDate = new Date(start.split("T")[0])
    const endDate = new Date(end.split("T")[0])
    return differenceInDays(endDate, startDate)
  }

  if (isLoading) {
    return (
      <Container>
        <div className="w-full h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin w-10 h-10 text-green-500 mb-4" />
          <p className="text-xl font-semibold text-gray-700">
            Synchronisation...
          </p>
        </div>
      </Container>
    )
  }


  return (
    <Container>
      <div className="">
        <Heading  
        title="Mes Réservations"
        subtitle={`Vous avez ${bookings.length} réservation`}
      />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {bookings.map((booking) => {
            const days =
              booking.duration ??
              calculateDays(booking.startDate, booking.endDate)
            const isDeleting = deletingId === booking.id
            const end = booking.endDate
              ? new Date(booking.endDate.split("T")[0])
              : null

            // 💡 LOGIQUE : Le séjour est-il fini ? (Date de fin < Maintenant)
            // const isPast = true // test pour voir si ca fonctionne en ayant des fin de réservations dans le futur ( test effectué le 20 et reservation terminée le 21)
            const isPast = end && new Date() > end

            const actionButtons = (
              <div className="flex items-center gap-2">
                {/* 💡 BOUTON AVIS : Jaune, apparaît si le séjour est terminé */}
                {isPast && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setReviewListingId(booking.listing.id)
                    }}
                    className="p-2 rounded-full transition bg-yellow-400 text-white hover:bg-yellow-500 shadow-sm"
                    title="Laisser un avis"
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingBookingId(booking.id)
                  }}
                  className="p-2 rounded-full transition bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => onCancel(booking.id, e)}
                  disabled={isDeleting}
                  className={`p-2 rounded-full transition shadow-sm ${
                    isDeleting
                      ? "bg-gray-300"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
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
              <div key={booking.id} className="relative">
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
                    <div className="text-sm mt-2">
                      <span className="text-green-600 font-medium">
                        Du {format(new Date(booking.startDate), "dd/MM/yy")} au{" "}
                        {format(new Date(booking.endDate), "dd/MM/yy")}
                      </span>
                    </div>
                  }
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Modale de modification */}
      {editingBookingId && (
        <BookingEditModal
          isOpen={!!editingBookingId}
          booking={bookings.find((b) => b.id === editingBookingId)!}
          onClose={() => setEditingBookingId(null)}
          onSuccess={() => {
            refreshBookings()
            setEditingBookingId(null)
          }}
        />
      )}

      {/* 💡 Modale d'Avis */}
      {reviewListingId && (
        <ReviewModal
          isOpen={!!reviewListingId}
          listingId={reviewListingId}
          onClose={() => setReviewListingId(null)}
          onSuccess={() => {
            refreshBookings()
            setReviewListingId(null)
          }}
        />
      )}
    </Container>
  )
}

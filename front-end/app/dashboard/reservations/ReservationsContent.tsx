/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useReservations } from "@/app/context/ReservationsContext"
import Container from "@/components/Container"
import Heading from "@/components/Heading"
import ListingCard from "@/components/ListingCard"
import BookingEditModal from "@/components/modals/BookingEditModal"
import ReviewModal from "@/components/modals/ReviewModal"
import axios from "axios"
import { format } from "date-fns"
import { CreditCard, Edit, Loader2, Star, Trash2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation" // Ajout de useSearchParams
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function ReservationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams() // Pour détecter ?payment=success
  const { bookings, isLoading, refreshBookings } = useReservations()

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null)
  const [reviewListingId, setReviewListingId] = useState<number | null>(null)
  const [payingId, setPayingId] = useState<number | null>(null)

  // 1. Chargement initial des réservations
  useEffect(() => {
    refreshBookings()
  }, [refreshBookings])

  // 2. 💡 Gestion du retour de paiement Stripe (Success/Cancel)
  useEffect(() => {
    const paymentStatus = searchParams.get("payment")

    if (paymentStatus === "success") {
      toast.success("Paiement validé ! Votre réservation est confirmée.")
      refreshBookings()
      // Nettoyage de l'URL pour éviter de répéter le toast
      window.history.replaceState({}, "", "/dashboard/reservations")
    } else if (paymentStatus === "cancel") {
      toast.error("Le paiement a été annulé.")
      window.history.replaceState({}, "", "/dashboard/reservations")
    }
  }, [searchParams, refreshBookings])

  // 3. 💡 Fonction pour relancer le paiement Stripe
  const onPayNow = async (bookingId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setPayingId(bookingId)

    try {
      const token = localStorage.getItem("jwtToken")
      // On utilise l'URL d'API définie ou l'IP locale par défaut pour Symfony
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

      const res = await axios.post(
        `${API_URL}/api/bookings/${bookingId}/create-checkout-session`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.url) {
        // Redirection vers la page de paiement Stripe
        window.location.href = res.data.url
      }
    } catch (err) {
      console.error("Erreur Stripe:", err)
      toast.error("Impossible de relancer le paiement.")
    } finally {
      setPayingId(null)
    }
  }

  const onCancel = useCallback(
    async (bookingId: number, event: React.MouseEvent) => {
      event.stopPropagation()
      const token = localStorage.getItem("jwtToken")
      if (!token) return toast.error("Vous n'êtes plus connecté.")

      if (
        !window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")
      )
        return

      setDeletingId(bookingId)

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"


        const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Échec de l'annulation.")

        toast.success("Réservation annulée avec succès.")
        refreshBookings()
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de l'annulation.")
      } finally {
        setDeletingId(null)
      }
    },
    [refreshBookings]
  )

  // 4. Utilitaire pour le Badge de Statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
            Payé
          </span>
        )
      case "cancelled":
        return (
          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
            Annulé
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
            En attente
          </span>
        )
    }
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
      <div className="pb-20">
        <Heading
          title="Mes Réservations"
          subtitle={`Vous avez ${bookings.length} réservation${
            bookings.length > 1 ? "s" : ""
          }`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
          {bookings.map((booking) => {
            const isDeleting = deletingId === booking.id
            const isPaying = payingId === booking.id
            const end = booking.endDate
              ? new Date(booking.endDate.split("T")[0])
              : null
            const isPast = end && new Date() > end

            const actionButtons = (
              <div className="flex items-center gap-2">
                {/* 💡 BOUTON PAYER : Apparaît uniquement si "pending" */}
                {/* 💡 BOUTON PAYER : On s'assure que le clic ne "traverse" pas vers la carte */}
                {booking.status === "pending" && (
                  <button
                    onClick={(e) => {
                      e.preventDefault() // Empêche tout comportement par défaut
                      e.stopPropagation() // 👈 C'EST CETTE LIGNE QUI EST CRUCIALE
                      onPayNow(booking.id, e)
                    }}
                    disabled={isPaying}
                    className="p-2 rounded-full transition bg-green-600 text-white hover:bg-green-700 shadow-sm z-30" // Ajout de z-30 pour être au dessus
                    title="Payer maintenant"
                  >
                    {isPaying ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                  </button>
                )}

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
              <div key={booking.id} className="relative group">
                <div className="absolute top-3 left-3 z-10">
                  {getStatusBadge(booking.status || "pending")}
                </div>

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
                    <div className="text-sm mt-2 flex flex-col gap-1">
                      <div className="text-green-600 font-semibold">
                        Du {format(new Date(booking.startDate), "dd/MM/yy")} au{" "}
                        {format(new Date(booking.endDate), "dd/MM/yy")}
                      </div>
                      <div className="text-gray-500 font-bold">
                        Total : {booking.totalPrice}€
                      </div>
                    </div>
                  }
                />
              </div>
            )
          })}
        </div>
      </div>

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

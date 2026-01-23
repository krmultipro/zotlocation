/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useReservations } from "@/app/context/ReservationsContext"
import Container from "@/components/Container"
import Heading from "@/components/Heading"
import ListingCard from "@/components/ListingCard"
import axios from "axios"
import { format, isValid } from "date-fns"
import { CreditCard, Loader2, Star, Trash2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function ReservationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { bookings, isLoading, refreshBookings } = useReservations()

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [payingId, setPayingId] = useState<number | null>(null)

  // Synchronisation au montage
  useEffect(() => {
    refreshBookings()
  }, [refreshBookings])

  // Gestion des retours Stripe
  useEffect(() => {
    const paymentStatus = searchParams.get("payment")
    if (paymentStatus === "success") {
      toast.success("Paiement validé ! Votre séjour est confirmé.")
      refreshBookings()
      // On nettoie l'URL sans recharger pour éviter les doubles toasts au refresh
      router.replace("/dashboard/reservations")
    } else if (paymentStatus === "cancel") {
      toast.error("Le paiement a été annulé.")
      router.replace("/dashboard/reservations")
    }
  }, [searchParams, refreshBookings, router])

  const onPayNow = async (bookingId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setPayingId(bookingId)
    try {
      const token = localStorage.getItem("jwtToken")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

      const res = await axios.post(
        `${apiUrl}/api/bookings/${bookingId}/create-checkout-session`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (err: any) {
      // 💡 ICI : On affiche l'erreur réelle du serveur dans la console
      console.error("DÉTAIL ERREUR STRIPE:", err.response?.data)
      const errorMsg = err.response?.data?.error || "Erreur de paiement"
      toast.error(errorMsg)
    } finally {
      setPayingId(null)
    }
  }

  const executeDelete = async (booking: any) => {
    const token = localStorage.getItem("jwtToken")
    setDeletingId(booking.id)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const status = booking.status?.toLowerCase().trim()
      const isPending = status === "pending"

      const res = await fetch(`${API_URL}/api/bookings/${booking.id}`, {
        method: isPending ? "PATCH" : "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/ld+json",
          ...(isPending && { "Content-Type": "application/merge-patch+json" }),
        },
        body: isPending ? JSON.stringify({ status: "cancelled" }) : null,
      })

      if (res.ok || res.status === 404) {
        toast.success(
          isPending ? "Réservation annulée." : "Réservation supprimée.",
        )
        // Petit délai pour laisser le temps au DBAL de commit
        setTimeout(() => refreshBookings(), 500)
      }
    } catch (err: any) {
      toast.error("Erreur lors de l'opération.")
    } finally {
      setDeletingId(null)
    }
  }

  const onCancel = useCallback(
    async (booking: any, event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()

      const isPending = booking.status?.toLowerCase() === "pending"
      const title = isPending
        ? "Annuler cette réservation ?"
        : "Supprimer définitivement l'historique de cette réservation ?"

      toast(
        (t) => (
          <div className="flex flex-col gap-3">
            <p className="font-medium text-gray-800 text-sm">{title}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition"
              >
                Retour
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id)
                  executeDelete(booking)
                }}
                className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 rounded-md transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        ),
        { duration: 5000, position: "top-center" },
      )
    },
    [refreshBookings],
  )

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase()
    switch (s) {
      case "paid":
        return (
          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200 shadow-sm">
            Payé
          </span>
        )
      case "cancelled":
        return (
          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200 shadow-sm">
            Annulé
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200 shadow-sm">
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
          <p className="text-xl font-semibold text-gray-700 animate-pulse">
            Synchronisation de vos séjours...
          </p>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="pb-20 pt-10">
        <Heading
          title="Mes Réservations"
          subtitle={`Vous avez ${bookings.length} séjour${bookings.length > 1 ? "s" : ""} enregistré${bookings.length > 1 ? "s" : ""}`}
        />

        {bookings.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
            <p className="text-gray-500 text-lg">
              Aucune réservation pour le moment.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 text-green-600 font-bold hover:underline"
            >
              Découvrir nos logements
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
            {bookings.map((booking) => {
              const isDeleting = deletingId === booking.id
              const isPaying = payingId === booking.id

              // Sécurité pour l'affichage des dates
              const startD = new Date(booking.startDate)
              const endD = new Date(booking.endDate)
              const isPast = isValid(endD) && new Date() > endD

              return (
                <div
                  key={booking.id}
                  className="relative group transition hover:scale-[1.02]"
                >
                  <div className="absolute top-3 left-3 z-10 scale-90 origin-top-left">
                    {getStatusBadge(booking.status)}
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
                    actionButton={
                      <div className="flex items-center gap-2">
                        {booking.status?.toLowerCase() === "pending" && (
                          <button
                            onClick={(e) => onPayNow(booking.id, e)}
                            disabled={isPaying}
                            className="p-2.5 rounded-full bg-green-600 text-white hover:bg-green-700 z-30 shadow-sm transition"
                            title="Procéder au paiement"
                          >
                            {isPaying ? (
                              <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                              <CreditCard className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {isPast && booking.status?.toLowerCase() === "paid" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation() /* Logic pour avis ici */
                            }}
                            className="p-2.5 rounded-full bg-yellow-400 text-white hover:bg-yellow-500 shadow-sm transition"
                            title="Laisser un avis"
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        )}
                        <button
                          onClick={(e) => onCancel(booking, e)}
                          disabled={isDeleting}
                          className={`p-2.5 rounded-full shadow-sm transition ${isDeleting ? "bg-gray-300" : "bg-red-500 text-white hover:bg-red-600"}`}
                          title={
                            booking.status?.toLowerCase() === "pending"
                              ? "Annuler"
                              : "Supprimer"
                          }
                        >
                          {isDeleting ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    }
                    extraInfo={
                      <div className="text-sm mt-3 p-3 bg-gray-50 rounded-xl flex flex-col gap-1 border border-gray-100">
                        <div className="text-green-700 font-bold flex items-center justify-between">
                          <span>Séjour :</span>
                          <span className="text-xs">
                            {isValid(startD) && isValid(endD)
                              ? `${format(startD, "dd/MM/yy")} - ${format(endD, "dd/MM/yy")}`
                              : "Dates invalides"}
                          </span>
                        </div>
                        <div className="text-gray-900 font-black text-right border-t border-gray-200 mt-1 pt-1">
                          {booking.totalPrice}€
                        </div>
                      </div>
                    }
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Container>
  )
}

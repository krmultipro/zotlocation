/**
 * Composant ListingCard
 * * Affiche une carte visuelle représentant une annonce de location.
 * Corrigé pour éviter les erreurs d'hydratation Next.js.
 */

"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import HeartButton from "./HeartButton"

/**
 * Interface ListingCardProps
 */
interface ListingCardProps {
  id: number | null | undefined
  title: string
  pricePerNight: number
  capacity: number
  category: string
  imageUrl: string
  actionButton?: React.ReactNode
  extraInfo?: React.ReactNode
}

export default function ListingCard({
  id,
  title,
  pricePerNight,
  capacity,
  category,
  imageUrl,
  actionButton,
  extraInfo,
}: ListingCardProps) {
  // 💡 Empêche les erreurs d'hydratation en attendant que le composant soit monté sur le client
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const listingIdString = id?.toString() || ""
  const isIdValid = !!id

  // Contenu principal de la carte
  const cardContent = (
    <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full border-none shadow-sm">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <Image
          src={imageUrl || "/images/placeholder.png"}
          alt={title || "Image de l'annonce"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          priority={false}
        />
        <div className="absolute top-3 right-3 z-10">
          {!actionButton && isIdValid && (
            <HeartButton listingId={listingIdString} />
          )}
        </div>
      </div>

      <CardContent className="p-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-sm truncate">{title}</h3>
          <p className="text-gray-500 text-sm truncate">{category}</p>
          <div className="text-gray-400 text-xs flex items-center gap-1 mt-1">
            <span>👥</span>
            <span>
              {capacity} {capacity > 1 ? "personnes" : "personne"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex flex-col gap-2">
        <div className="flex justify-between items-center w-full">
          <div className="font-semibold text-sm">
            {pricePerNight}€{" "}
            <span className="font-normal text-gray-500">/ nuit</span>
          </div>
          {actionButton && <div className="z-20 relative">{actionButton}</div>}
        </div>
        {extraInfo && (
          <div className="text-gray-500 text-xs mt-1 border-t pt-2 w-full">
            {extraInfo}
          </div>
        )}
      </CardFooter>
    </Card>
  )

  // 💡 Rendu pendant l'hydratation : on affiche un squelette simple pour éviter le flash
  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[300px] bg-gray-50 animate-pulse rounded-xl" />
    )
  }

  // Si on a un bouton d'action (ex: page réservations), on évite le Link global
  if (actionButton) {
    return <div className="relative h-full">{cardContent}</div>
  }

  // Rendu standard avec lien vers le détail
  return (
    <Link href={isIdValid ? `/listings/${id}` : "#"} className="block h-full">
      {cardContent}
    </Link>
  )
}

/**
 * Composant ListingCard
 *
 * Affiche une carte visuelle représentant une annonce de location.
 */

"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
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
  extraInfo?: React.ReactNode // Changé en React.ReactNode pour supporter les DIVs de page.tsx
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
  const listingIdString = id?.toString() || ""
  const isIdValid = !!id

  // 1. Définir le contenu de la carte sans l'enveloppe Link
  const cardContent = (
    <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={imageUrl || "/images/placeholder.png"}
          alt={title || "Image de l'annonce"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          {/* Le bouton Heart reste actif si actionButton n'est PAS là (page d'accueil) */}
          {!actionButton && isIdValid && (
            <HeartButton listingId={listingIdString} />
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-sm truncate mb-2">{title}</h3>
        <p className="text-gray-600 text-sm truncate mb-2">{category}</p>
        <p className="text-gray-500 text-xs flex items-center gap-1">
          <span>👥</span>
          <span>
            {capacity} {capacity > 1 ? "personnes" : "personne"}
          </span>
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-1">
        <div className="flex justify-between items-center w-full">
          <p className="font-semibold">
            {pricePerNight}€{" "}
            <span className="font-normal text-gray-600">/ nuit</span>
          </p>
          {/* L'actionButton est rendu ici */}
          {actionButton}
        </div>
        {extraInfo && (
          // 💡 Correction HTML : Changement de <p> à <div>
          <div className="text-gray-500 text-sm mt-1">{extraInfo}</div>
        )}
      </CardFooter>
    </Card>
  );

  // 2. Logique de rendu conditionnel :
  // Si actionButton est fourni (page des réservations), on ne met PAS de Link parent.
  if (actionButton) {
    return (
      <div className="relative">
        {cardContent}
      </div>
    );
  }

  // 3. Sinon (page d'accueil/sans boutons d'action), on enveloppe le tout dans un Link pour la navigation.
  return (
    <Link href={isIdValid ? `/listings/${id}` : "#"}>
      {cardContent}
    </Link>
  )
}
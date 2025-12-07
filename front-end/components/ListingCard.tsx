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
  // Reste un type flexible pour éviter les erreurs de plantage
  id: number | null | undefined
  title: string
  pricePerNight: number
  capacity: number
  category: string
  imageUrl: string
  // 💡 NOUVEAU : Optionnel pour insérer un bouton d'action personnalisé (Corbeille)
  actionButton?: React.ReactNode
}

export default function ListingCard({
  id,
  title,
  pricePerNight,
  capacity,
  category,
  imageUrl,
  actionButton, // 💡 Récupération de la prop
}: ListingCardProps) {
  // Utiliser une chaîne vide comme fallback si l'ID est manquant
  const listingIdString = id?.toString() || ""

  // Vérifie si l'ID est valide pour la navigation et le bouton
  const isIdValid = !!id

  return (
    <Link href={isIdValid ? `/listings/${id}` : "#"}>
      <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl || "/images/placeholder.png"}
            alt={title || "Image de l'annonce"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Zone du HeartButton (EN HAUT) */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            {/* Affiche le HeartButton UNIQUEMENT si actionButton est ABSENT (et si l'ID est valide) */}
            {!actionButton && isIdValid && (
              <HeartButton listingId={listingIdString} />
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Titre */}
          <h3 className="font-semibold text-sm truncate mb-2">{title}</h3>

          {/* Catégorie */}
          <p className="text-gray-600 text-sm truncate mb-2">{category}</p>

          {/* Capacité */}
          <p className="text-gray-500 text-xs flex items-center gap-1">
            <span>👥</span>
            <span>
              {capacity} {capacity > 1 ? "personnes" : "personne"}
            </span>
          </p>
        </CardContent>

        {/* CardFooter (EN BAS : Prix + Corbeille) */}
        <CardFooter className="p-4 pt-0">
          <div className="flex justify-between items-center w-full">
            {/* Affichage du prix / nuit */}
            <p className="font-semibold">
              {pricePerNight}€{" "}
              <span className="font-normal text-gray-600">/ nuit</span>
            </p>

            {/* 💡 AFFICHAGE DE L'ACTION (Corbeille) ICI */}
            {actionButton}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

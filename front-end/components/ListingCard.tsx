/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Edit, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import HeartButton from "./HeartButton";

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
  onDelete?: (id: number) => void
  onEdit?: (id: number) => void
  rating?: string | null
  reviewsCount?: number
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
  onDelete,
  onEdit,
  rating,
  reviewsCount,
}: ListingCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const listingIdString = id?.toString() || ""
  const isIdValid = !!id

  const renderManagementButtons = () => {
    if (!isIdValid) return null

    return (
      <div className="flex items-center gap-1">
        {onEdit && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit(id as number)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit size={18} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete(id as number)
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    )
  }

  const cardContent = (
    <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full border-none shadow-sm bg-white">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <Image
          src={imageUrl || "/images/placeholder.png"}
          alt={title || "Image de l'annonce"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority={false}
        />

        {!onDelete && !onEdit && !actionButton && isIdValid && (
          <div className="absolute top-3 right-3 z-10">
            <HeartButton listingId={listingIdString} />
          </div>
        )}
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
          {/* ZONE PRIX */}
          <div className="font-semibold text-sm text-neutral-800">
            {pricePerNight}€{" "}
            <span className="font-normal text-gray-500">/ nuit</span>
          </div>

          {/* ZONE NOTATION OU GESTION */}
          <div className="flex items-center">
            {rating && (
              <div className="flex items-center gap-1 text-sm font-bold text-neutral-700">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                <span>{rating}</span>
                {reviewsCount && reviewsCount > 0 && (
                  <span className="text-gray-400 font-normal text-xs ml-0.5">
                    ({reviewsCount})
                  </span>
                )}
              </div>
            )}

            <div className="z-20 relative ml-2">
              {onDelete || onEdit
                ? renderManagementButtons()
                : actionButton && <div>{actionButton}</div>}
            </div>
          </div>
        </div>

        {extraInfo && (
          <div className="text-gray-500 text-xs mt-1 border-t pt-2 w-full">
            {extraInfo}
          </div>
        )}
      </CardFooter>
    </Card>
  )

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[300px] bg-gray-100 animate-pulse rounded-xl" />
    )
  }

  return (
    <Link href={isIdValid ? `/listings/${id}` : "#"} className="block h-full">
      {cardContent}
    </Link>
  )
}
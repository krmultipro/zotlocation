/**
 * Composant ListingCard
 * 
 * Affiche une carte visuelle représentant une annonce de location.
 * Utilise les composants Card de shadcn/ui pour un style cohérent.
 */

// components/ListingCard.tsx
"use client"

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

/**
 * Interface ListingCardProps
 * Props basées sur les données réellement disponibles de l'API
 */
interface ListingCardProps {
  id: number;
  title: string;
  pricePerNight: number;
  capacity: number;        // ✅ Maintenant utilisé
  category: string;        // ✅ Renommé (était "city")
  imageUrl: string;
  // rating?: number;      // ❌ Retiré temporairement
  // type?: string;        // ❌ Non disponible dans l'API
}

export default function ListingCard({
  id,
  title,
  pricePerNight,
  capacity,
  category,
  imageUrl
}: ListingCardProps) {
  return (
    <Link href={`/listings/${id}`}>
      <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow duration-300">
        
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl || "/images/placeholder.png"}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Bouton favori */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log(`Ajout de l'annonce ${id} aux favoris`);
            }}
          >
            <Heart className="w-5 h-5" />
          </Button>
        </div>
        
        <CardContent className="p-4">
          {/* Titre */}
          <h3 className="font-semibold text-sm truncate mb-2">{title}</h3>
          
          {/* Catégorie */}
          <p className="text-gray-600 text-sm truncate mb-2">{category}</p>
          
          {/* Capacité - NOUVEAU */}
          <p className="text-gray-500 text-xs flex items-center gap-1">
            <span>👥</span>
            <span>{capacity} {capacity > 1 ? 'personnes' : 'personne'}</span>
          </p>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <p className="font-semibold">
            {pricePerNight}€ <span className="font-normal text-gray-600">/ nuit</span>
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
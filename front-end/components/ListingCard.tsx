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
 * Définit les propriétés nécessaires pour afficher une carte d'annonce
 */
interface ListingCardProps {
  id: number;
  title: string;
  pricePerNight: number;
  city: string;
  imageUrl: string;
  rating?: number;
}

/**
 * Composant principal ListingCard
 * Affiche une carte stylisée pour une annonce de location
 */
export default function ListingCard({
  id,
  title,
  pricePerNight,
  city,
  imageUrl,
  rating
}: ListingCardProps) {
  return (
    <Link href={`/listings/${id}`}>
      {/* Card shadcn/ui avec effet hover personnalisé */}
      <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow duration-300">
        
        {/* Section image avec bouton favori */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl || "/images/placeholder.png"}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Bouton favori positionné en absolu */}
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
        
{/* Contenu de la carte : informations textuelles */}
<CardContent className="p-4">
  {/* Titre de l'annonce et note */}
  <div className="flex justify-between items-start mb-2">
    <h3 className="font-semibold text-sm truncate">{title}</h3>
    {rating && (
      <span className="text-sm flex-shrink-0 ml-2">⭐ {rating}</span>
    )}
  </div>
  
  {/* Catégorie/Ville (secondaire) */}
  <p className="text-gray-600 text-sm truncate mb-2">{city}</p>
</CardContent>
        {/* Pied de carte : Prix */}
        <CardFooter className="p-4 pt-0">
          <p className="font-semibold">
            {pricePerNight}€ <span className="font-normal text-gray-600">/ nuit</span>
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
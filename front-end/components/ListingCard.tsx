/**
 * Composant ListingCard
 * 
 * Affiche une carte visuelle représentant une annonce de location.
 * Chaque carte contient l'image principale, le titre, la catégorie, le prix et un bouton favori.
 * Le composant est interactif avec des effets de survol (hover) et peut être cliqué.
 */

// components/ListingCard.tsx
"use client"

import Image from "next/image";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Interface ListingCardProps
 * Définit les propriétés nécessaires pour afficher une carte d'annonce
 */
interface ListingCardProps {
  id: number;                    // Identifiant unique de l'annonce (non utilisé visuellement mais utile pour la navigation future)
  title: string;                 // Titre complet de l'annonce
  pricePerNight: number;         // Prix par nuit en euros
  city: string;                  // Ville ou catégorie de l'annonce (utilisée comme localisation)
  imageUrl: string;              // URL de l'image principale de l'annonce
  rating?: number;               // Note optionnelle de l'annonce (sur 5 étoiles)
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
    // Conteneur principal avec effet de groupe pour les animations au survol
    // La classe "group" permet aux éléments enfants de réagir au hover du parent
    // cursor-pointer indique que l'élément est cliquable
    <div className="group cursor-pointer">
      
      {/* Section image avec bouton favori */}
      {/* relative: permet de positionner le bouton favori en absolu à l'intérieur */}
      {/* aspect-square: force un ratio 1:1 (carré) pour toutes les images */}
      {/* overflow-hidden: cache les parties de l'image qui dépassent lors du zoom */}
      <div className="relative aspect-square overflow-hidden rounded-lg mb-2">
        
        {/* Composant Image de Next.js optimisé pour les performances */}
        {/* fill: l'image remplit tout le conteneur parent */}
        {/* object-cover: l'image couvre tout l'espace sans déformation */}
        {/* group-hover:scale-110: zoom de 110% au survol du parent (effet visuel) */}
        {/* transition: animation fluide du zoom */}
        <Image
  src={imageUrl || "/images/placeholder.png"}
  alt={title}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
  className="object-cover group-hover:scale-110 transition"
/>
        
        {/* Bouton favori (coeur) positionné en haut à droite de l'image */}
        {/* absolute: position absolue par rapport au conteneur parent (relative) */}
        {/* top-2 right-2: positionne à 8px du haut et de la droite */}
        {/* bg-white/80: fond blanc avec 80% d'opacité pour voir légèrement l'image derrière */}
        <Button
          size="icon"                                  // Taille prédéfinie pour les boutons icône uniquement
          variant="ghost"                              // Style transparent du bouton
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
        >
          {/* Icône coeur de la bibliothèque Lucide */}
          <Heart className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Section informations : ville/catégorie et note */}
      {/* flex: disposition horizontale des éléments */}
      {/* justify-between: espace maximum entre les éléments (gauche et droite) */}
      {/* items-start: alignement en haut */}
      <div className="flex justify-between items-start mb-1">
        {/* Nom de la ville ou catégorie */}
        {/* truncate: coupe le texte trop long et ajoute "..." */}
        <h3 className="font-semibold text-sm truncate">{city}</h3>
        
        {/* Affichage conditionnel de la note uniquement si elle existe */}
        {/* L'opérateur && permet d'afficher l'élément seulement si rating est défini */}
        {rating && (
          <span className="text-sm">⭐ {rating}</span>
        )}
      </div>
      
      {/* Titre de l'annonce */}
      {/* text-gray-600: couleur grise pour le texte secondaire */}
      {/* truncate: coupe le titre s'il est trop long */}
      <p className="text-gray-600 text-sm truncate mb-1">{title}</p>
      
      {/* Prix de l'annonce */}
      {/* font-semibold sur le prix pour le mettre en évidence */}
      {/* font-normal sur "/ nuit" pour différencier du prix */}
      <p className="font-semibold">
        {pricePerNight}€ <span className="font-normal">/ nuit</span>
      </p>
    </div>
  );
}
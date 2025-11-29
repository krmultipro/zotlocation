/**
 * Composant ListingsGrid
 * 
 * Ce composant affiche une grille d'annonces de location (listings).
 * Il récupère les données depuis l'API Symfony et les affiche sous forme de cartes.
 * Il gère également le filtrage par catégorie et les états de chargement/erreur.
 */

// components/ListingsGrid.tsx
"use client"

import { useEffect, useState } from "react";
import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";

/**
 * Interface Listing
 * Définit la structure d'une annonce de location telle qu'elle est retournée par l'API
 */
interface Listing {
  id: number;                    // Identifiant unique de l'annonce
  title: string;                 // Titre de l'annonce
  pricePerNight: number;         // Prix par nuit en euros
  capacity: number;              // Capacité d'accueil (nombre de personnes)
  category?: {                   // Catégorie optionnelle (plage, montagne, etc.)
    name: string;                // Nom de la catégorie
  };
  owner?: string;                // Identifiant du propriétaire (format IRI d'API Platform)
  images?: Array<{               // Tableau d'images optionnel
    url: string;                 // URL de l'image
  }>;
}

/**
 * Interface ApiPlatformResponse
 * Définit la structure de la réponse retournée par API Platform (format JSON-LD)
 */
interface ApiPlatformResponse {
  "member": Listing[];           // Tableau des annonces (API Platform utilise "member" au lieu de "data")
  "totalItems": number;          // Nombre total d'annonces disponibles
}

/**
 * Interface ListingsGridProps
 * Définit les propriétés acceptées par le composant ListingsGrid
 */
interface ListingsGridProps {
  categoryFilter?: string;       // Filtre optionnel pour afficher uniquement une catégorie spécifique
}

/**
 * Composant principal ListingsGrid
 * Récupère et affiche la liste des annonces avec possibilité de filtrage
 */
export default function ListingsGrid({ categoryFilter }: ListingsGridProps) {
  // État pour stocker la liste des annonces
  const [listings, setListings] = useState<Listing[]>([]);
  
  // État pour gérer le chargement (affiche un skeleton pendant la récupération des données)
  const [loading, setLoading] = useState(true);
  
  // État pour gérer les erreurs éventuelles lors de l'appel API
  const [error, setError] = useState<string | null>(null);

  /**
   * Hook useEffect
   * S'exécute au montage du composant et à chaque changement de categoryFilter
   * Effectue l'appel API pour récupérer les annonces
   */
  useEffect(() => {
    // Appel à l'API Symfony pour récupérer toutes les annonces
    fetch('http://localhost:8000/api/listings')
      .then(res => {
        // Vérification que la réponse HTTP est valide (code 2xx)
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        // Conversion de la réponse en JSON
        return res.json();
      })
      .then((data: ApiPlatformResponse) => {
        // Affichage des données reçues dans la console (utile pour déboguer)
        console.log('Données reçues:', data);
        
        // Extraction du tableau d'annonces depuis la propriété "member"
        // Si "member" est undefined, on utilise un tableau vide
        let filteredListings = data.member || [];
        
        // Application du filtre par catégorie si un filtre est fourni
        if (categoryFilter) {
          // On compare le nom de la catégorie en minuscule avec le filtre en minuscule
          // L'opérateur "?." évite les erreurs si category ou name sont undefined
          filteredListings = filteredListings.filter(
            (listing) => listing.category?.name?.toLowerCase() === categoryFilter.toLowerCase()
          );
        }
        
        // Mise à jour de l'état avec les annonces filtrées
        setListings(filteredListings);
      })
      .catch(error => {
        // Gestion des erreurs (problème réseau, API indisponible, etc.)
        console.error('Erreur lors du chargement des listings:', error);
        setError(error.message);
      })
      .finally(() => {
        // Dans tous les cas (succès ou erreur), on arrête le chargement
        setLoading(false);
      });
  }, [categoryFilter]); // Dépendance : relance l'effet si categoryFilter change

  /**
   * Affichage pendant le chargement
   * Affiche 10 cartes "skeleton" animées pour indiquer que le contenu se charge
   */
  if (loading) {
    return (
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 py-8">
          {/* Création d'un tableau de 10 éléments pour afficher 10 skeletons */}
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              {/* Rectangle carré gris pour simuler l'image */}
              <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
              {/* Ligne grise pour simuler le titre */}
              <div className="h-4 bg-gray-200 rounded mb-2" />
              {/* Ligne grise plus courte pour simuler le prix */}
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </Container>
    );
  }

  /**
   * Affichage en cas d'erreur
   * Informe l'utilisateur qu'une erreur s'est produite
   */
  if (error) {
    return (
      <Container>
        <div className="py-20 text-center">
          {/* Message d'erreur en rouge */}
          <p className="text-red-500 text-lg">Erreur : {error}</p>
          {/* Message d'aide pour résoudre le problème */}
          <p className="text-gray-600 mt-2">
            Vérifiez que le serveur backend est démarré
          </p>
        </div>
      </Container>
    );
  }

  /**
   * Affichage si aucune annonce n'est trouvée
   * Affiche un message différent selon qu'un filtre est appliqué ou non
   */
  if (listings.length === 0) {
    return (
      <Container>
        <div className="py-20 text-center">
          <p className="text-gray-600 text-lg">
            {/* Message conditionnel : avec ou sans filtre */}
            {categoryFilter 
              ? `Aucune annonce disponible pour la catégorie "${categoryFilter}"`
              : "Aucune annonce disponible pour le moment"
            }
          </p>
        </div>
      </Container>
    );
  }

  /**
   * Affichage principal : grille des annonces
   * Utilise une grille responsive qui s'adapte à la taille de l'écran
   */
  return (
    <Container>
      {/* Grille responsive : 1 colonne sur mobile, jusqu'à 5 colonnes sur très grand écran */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 py-8">
        {/* Itération sur chaque annonce pour créer une carte */}
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}                                                    // Clé unique pour React
            id={listing.id}                                                     // ID de l'annonce
            title={listing.title}                                               // Titre de l'annonce
            pricePerNight={listing.pricePerNight}                               // Prix par nuit
            city={listing.category?.name || "Réunion"}                          // Nom de la catégorie ou "Réunion" par défaut
            imageUrl={listing.images?.[0]?.url || "/images/placeholder.png"}   // Première image ou image par défaut
            rating={undefined}                                                  // Note non implémentée pour le moment
          />
        ))}
      </div>
    </Container>
  );
}
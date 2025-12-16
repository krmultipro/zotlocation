<?php
// src/State/BookingCollectionProvider.php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Booking;
use App\Repository\BookingRepository;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Ce Provider intercepte les requêtes GET Collection pour Booking,
 * permettant de filtrer sur le Listing ID lorsque le SearchFilter par défaut échoue.
 */
final class BookingCollectionProvider implements ProviderInterface
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private RequestStack $requestStack
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        // On s'assure qu'on gère seulement le GetCollection pour Booking
        if ($operation->getClass() !== Booking::class || !$operation instanceof \ApiPlatform\Metadata\GetCollection) {
            return null; // Délègue aux autres providers
        }

        $request = $this->requestStack->getMainRequest();

        // 1. Récupérer l'ID du Listing du paramètre de requête (?listing=ID)
        $listingId = $request?->query->get('listing');


            // 2. Utiliser notre méthode DQL fiable dans le Repository
            if ($listingId && is_numeric($listingId)) {
              // 2. Utiliser notre méthode DQL fiable dans le Repository
              // 💡 ASSUREZ-VOUS QUE CELA RETOURNE UNE COLLECTION D'OBJETS DOCTRINE
              $bookings = $this->bookingRepository->findBookingsByListingId((int) $listingId);
              return $bookings; // Renvoie la collection chargée
          }

        // Si aucun filtre n'est fourni, on ne renvoie rien (tableau vide),
        // car l'accès est PUBLIC_ACCESS et nous ne voulons pas lister toutes les réservations.
        return [];
    }
}
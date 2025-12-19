<?php


namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Booking;
use App\Repository\BookingRepository;
use Symfony\Component\HttpFoundation\RequestStack;

final class BookingCollectionProvider implements ProviderInterface
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private RequestStack $requestStack
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        // On s'assure qu'on gère seulement le GetCollection pour Booking
        if ($operation->getClass() !== Booking::class || !$operation instanceof GetCollection) {
            return null;
        }

        $request = $this->requestStack->getMainRequest();
        if (!$request) {
            return [];
        }

        // Récupération des deux filtres possibles
        $listingId = $request->query->get('listing');
        $bookerId = $request->query->get('booker');

        // --- CAS 1 : Filtre par Listing (Calendrier de l'annonce) ---
        if ($listingId && is_numeric($listingId)) {
            $bookings = $this->bookingRepository->findBookingsByListingId((int) $listingId);
            error_log("[DEBUG PROVIDER] Calendrier : " . count($bookings) . " réservations trouvées pour Listing $listingId");
            return $bookings;
        }

        // --- CAS 2 : Filtre par Booker (Dashboard de l'utilisateur) ---
        if ($bookerId && is_numeric($bookerId)) {
            // On utilise findBy de base pour récupérer les réservations de l'utilisateur
            $bookings = $this->bookingRepository->findBy(
                ['booker' => (int) $bookerId],
                ['startDate' => 'DESC']
            );
            error_log("[DEBUG PROVIDER] Dashboard : " . count($bookings) . " réservations trouvées pour Booker $bookerId");
            return $bookings;
        }

        // Si aucun des deux filtres n'est présent, on retourne un tableau vide
        // pour ne pas exposer toutes les réservations du site publiquement
        return [];
    }
}
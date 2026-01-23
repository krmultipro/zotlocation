<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Booking;
use App\Repository\BookingRepository;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Bundle\SecurityBundle\Security;

final class BookingCollectionProvider implements ProviderInterface
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private RequestStack $requestStack,
        private Security $security
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        if ($operation->getClass() !== Booking::class || !$operation instanceof GetCollection) {
            return null;
        }

        $request = $this->requestStack->getMainRequest();
        $user = $this->security->getUser();

        // 1. Si c'est un ADMIN, on lui donne tout (ton code actuel)
        if ($user && $this->security->isGranted('ROLE_ADMIN')) {
            return $this->bookingRepository->findBy([], ['startDate' => 'DESC']);
        }

        // 2. Récupération des filtres dans l'URL
        $listingId = $request ? $request->query->get('listing') : null;
        $bookerId = $request ? $request->query->get('booker') : null;

        // --- CAS 1 : Calendrier de l'annonce (Filtre listing) ---
        if ($listingId && is_numeric($listingId)) {
            return $this->bookingRepository->findBookingsByListingId((int) $listingId);
        }

        // --- CAS 2 : Filtre booker explicite ---
        if ($bookerId && is_numeric($bookerId)) {
            return $this->bookingRepository->findBy(
                ['booker' => (int) $bookerId],
                ['startDate' => 'DESC']
            );
        }

        // --- 💡 CAS 3 (INDISPENSABLE) : Pas de filtre, on prend l'utilisateur connecté ---
        // Si l'utilisateur est connecté mais n'a pas mis de ?booker= dans l'URL,
        // on lui renvoie ses propres réservations automatiquement.
        if ($user) {
            return $this->bookingRepository->findBy(
                ['booker' => $user],
                ['startDate' => 'DESC']
            );
        }

        // Si vraiment personne n'est connecté et aucun filtre, vide.
        return [];
    }
}
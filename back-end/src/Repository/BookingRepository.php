<?php

namespace App\Repository;

use App\Entity\Booking;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Booking>
 */
class BookingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Booking::class);
    }

    /**
     * Trouve toutes les réservations qui chevauchent la période donnée pour un Listing.
     * Utilisé pour la validation de chevauchement (par BookingAvailabilityChecker).
     *
     * @param int $listingId L'ID du Listing
     * @param string $startDate Date de début (format 'Y-m-d')
     * @param string $endDate Date de fin (format 'Y-m-d')
     * @param int|null $excludedBookingId ID d'une réservation à exclure (pour l'édition)
     * @return Booking[]
     */
    public function findOverlappingBookings(int $listingId, string $startDate, string $endDate, ?int $excludedBookingId = null): array
    {
        $qb = $this->createQueryBuilder('b')
            // 💡 CORRECTION 1: Utiliser where pour la première condition afin de ne pas écraser les paramètres
            ->where('b.listing = :listingId')
            ->setParameter('listingId', $listingId)

            // 💡 CORRECTION 2: Logique de chevauchement INCLUSIVE et stable pour les bornes
            ->andWhere('b.endDate >= :startDate')
            ->andWhere('b.startDate <= :endDate')

            // Les paramètres de date sont maintenant ajoutés sans conflit
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate);

        if ($excludedBookingId !== null) {
            $qb->andWhere('b.id != :excludedId')
               ->setParameter('excludedId', $excludedBookingId);
        }

        return $qb
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve les IDs des Listings ayant une réservation qui chevauche la période [startDate, endDate].
     * Utilisé par le filtre API Platform pour masquer les annonces indisponibles.
     *
     * @param string $startDate Date de début de la recherche (format 'Y-m-d')
     * @param string $endDate Date de fin de la recherche (format 'Y-m-d')
     * @return int[] IDs des listings en conflit (c'est-à-dire non disponibles).
     */
    public function findConflictingListingIds(string $startDate, string $endDate): array
    {
        $qb = $this->createQueryBuilder('b')
            ->select('DISTINCT IDENTITY(b.listing)')

            // Logique de chevauchement INCLUSIVE (Harmonisation)
            ->where('b.endDate >= :startDate')
            ->andWhere('b.startDate <= :endDate')

            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate);

        $result = $qb->getQuery()->getResult();
        return array_column($result, 0);
    }


    /**
     * Récupère toutes les réservations d'un utilisateur, en chargeant immédiatement le Listing associé (Join Fetch).
     * @param User $user L'utilisateur dont on veut les réservations.
     * @return Booking[]
     */
    public function findBookingsWithListingByUser(User $user)
    {
        return $this->createQueryBuilder('b')
            ->where('b.booker = :user')
            ->setParameter('user', $user->getId())
            ->leftJoin('b.listing', 'l') // Jointure
            ->addSelect('l')             // Sélection de l'entité jointe (Eager Loading)
            ->orderBy('b.startDate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve toutes les réservations pour un Listing donné par son ID.
     * Utilisé par BookingCollectionProvider.
     * @param int $listingId
     * @return Booking[]
     */
    public function findBookingsByListingId(int $listingId): array
    {
        return $this->createQueryBuilder('b')
            ->where('b.listing = :listingId')
            ->setParameter('listingId', $listingId)
            // Optionnel : ajouter le listing en select si vous en avez besoin, sinon on peut laisser simple
            // ->leftJoin('b.listing', 'l')->addSelect('l')
            ->getQuery()
            ->getResult();
    }
}
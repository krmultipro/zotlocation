<?php

namespace App\Repository;

use App\Entity\Booking;
use App\Entity\User; // <-- Import de l'entité User
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
            ->andWhere('b.listing = :listingId')
            ->setParameter('listingId', $listingId)

            // Logique de chevauchement de dates :
            // (La réservation existante commence avant la fin de la nouvelle) ET
            // (La réservation existante se termine après le début de la nouvelle)
            ->andWhere('b.startDate < :endDate')
            ->andWhere('b.endDate > :startDate')
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
     * Récupère toutes les réservations d'un utilisateur, en chargeant immédiatement le Listing associé (Join Fetch).
     * Ceci est nécessaire pour éviter les erreurs de proxy Doctrine lors de la sérialisation via un contrôleur classique.
     * * @param User $user L'utilisateur dont on veut les réservations.
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
}
<?php
// src/Service/BookingAvailabilityChecker.php

namespace App\Service;

use App\Entity\Booking;
use App\Repository\BookingRepository;

class BookingAvailabilityChecker
{
    public function __construct(
        private BookingRepository $bookingRepository
    ) {}

    /**
     * Vérifie si une nouvelle réservation chevauche des réservations existantes pour un Listing.
     * * @return bool Vrai si les dates sont disponibles, Faux sinon.
     */
    public function isAvailable(Booking $newBooking): bool
    {
        $listingId = $newBooking->getListing()->getId();
        $startDate = $newBooking->getStartDate()->format('Y-m-d');
        $endDate = $newBooking->getEndDate()->format('Y-m-d');

        // Utilisation d'une méthode de Repository pour trouver les conflits
        $conflicts = $this->bookingRepository->findOverlappingBookings(
            $listingId,
            $startDate,
            $endDate,
            $newBooking->getId() // Exclure la réservation actuelle si c'est une modification
        );

        return count($conflicts) === 0;
    }
}
<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Booking;
use App\Repository\BookingRepository;
use Symfony\Bundle\SecurityBundle\Security;

final class CurrentUserBookingProvider implements ProviderInterface
{
    public function __construct(
        private Security $security,
        private BookingRepository $bookingRepository
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): iterable
    {
        $user = $this->security->getUser();
        if (!$user) {
            return [];
        }

        // Retourne uniquement les réservations du current user
        return $this->bookingRepository->findBy(['booker' => $user], ['startDate' => 'DESC']);
    }
}
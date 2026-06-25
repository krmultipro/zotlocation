<?php

namespace App\Controller;

use App\Repository\BookingRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class ListingBookedPeriodsController extends AbstractController
{
    #[Route('/api/listings/{id}/booked-periods', name: 'api_listing_booked_periods', methods: ['GET'])]
    public function __invoke(int $id, BookingRepository $bookingRepository): JsonResponse
    {
        $bookings = $bookingRepository->findBookingsByListingId($id);

        $periods = array_values(array_map(
            static fn ($booking): array => [
                'startDate' => $booking->getStartDate()?->format('Y-m-d'),
                'endDate' => $booking->getEndDate()?->format('Y-m-d'),
            ],
            array_filter(
                $bookings,
                static fn ($booking): bool => in_array(
                    strtolower($booking->getStatus()),
                    ['pending', 'paid'],
                    true
                )
            )
        ));

        return new JsonResponse($periods);
    }
}

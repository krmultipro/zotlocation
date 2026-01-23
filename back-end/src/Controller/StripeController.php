<?php

namespace App\Controller;

use App\Entity\Booking;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;

class StripeController extends AbstractController
{
    #[Route('/api/bookings/{id}/create-checkout-session', name: 'api_booking_checkout', methods: ['POST'])]
    public function createCheckoutSession(int $id, EntityManagerInterface $em): JsonResponse
    {
        // 1. Sécurité
        $this->denyAccessUnlessGranted('ROLE_USER');

        // Récupération manuelle via EntityManager
        $booking = $em->getRepository(Booking::class)->find($id);

        if (!$booking) {
            return new JsonResponse(['error' => 'Réservation non trouvée'], 404);
        }

        if ($booking->getBooker() !== $this->getUser()) {
            return new JsonResponse(['error' => 'Accès non autorisé'], 403);
        }

        // 2. Clé Stripe (on check toutes les sources possibles)
        $stripeSecretKey = $_ENV['STRIPE_SECRET_KEY'] ?? getenv('STRIPE_SECRET_KEY');

        if (!$stripeSecretKey) {
            return new JsonResponse(['error' => 'Clé Stripe manquante dans le .env'], 500);
        }

        Stripe::setApiKey($stripeSecretKey);

        // 3. URL de base
        $baseUrl = rtrim($_ENV['FRONTEND_URL'] ?? 'http://localhost:8080', '/');

        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => $booking->getListing()->getTitle(),
                        ],
                        'unit_amount' => (int)round($booking->getTotalPrice() * 100),
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'metadata' => ['booking_id' => $booking->getId()],
                'success_url' => $baseUrl . '/dashboard/reservations?payment=success',
                'cancel_url' => $baseUrl . '/dashboard/reservations?payment=cancel',
            ]);

            return new JsonResponse(['url' => $session->url]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}
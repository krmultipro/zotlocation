<?php

namespace App\Controller;

use App\Entity\Booking;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class StripeController extends AbstractController
{
    #[Route('/api/bookings/{id}/create-checkout-session', name: 'api_booking_checkout', methods: ['POST'])]
    public function createCheckoutSession(Booking $booking): JsonResponse
    {
        // 1. Sécurité : Seul le propriétaire de la réservation peut payer
        $this->denyAccessUnlessGranted('ROLE_USER');
        if ($booking->getBooker() !== $this->getUser()) {
            return new JsonResponse(['error' => 'Accès non autorisé'], 403);
        }

        // 2. Configuration de Stripe
        Stripe::setApiKey($this->getParameter('kernel.project_dir') . $_ENV['STRIPE_SECRET_KEY']);
        // Plus simple si tu n'as pas configuré de paramètres :
        Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

        // 3. Création de la session Stripe
        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => $booking->getListing()->getTitle(),
                        'description' => sprintf(
                            "Séjour à La Réunion du %s au %s",
                            $booking->getStartDate()->format('d/m/Y'),
                            $booking->getEndDate()->format('d/m/Y')
                        ),
                    ],
                    // Stripe veut des centimes (ex: 100.50€ -> 10050)
                    'unit_amount' => (int)($booking->getTotalPrice() * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            // Metadata permet de retrouver l'ID dans le futur Webhook
            'metadata' => [
                'booking_id' => $booking->getId()
            ],
            // URLs de redirection après le paiement
            'success_url' => 'http://localhost:3000/reservations?payment=success',
            'cancel_url' => 'http://localhost:3000/reservations?payment=cancel',
        ]);

        return new JsonResponse(['url' => $session->url]);
    }
}
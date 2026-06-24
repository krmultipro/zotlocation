<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Repository\BookingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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
        // On s'assure que la clé API est bien présente dans le .env
        $stripeSecretKey = $_ENV['STRIPE_SECRET_KEY']
            ?? $_SERVER['STRIPE_SECRET_KEY']
            ?? getenv('STRIPE_SECRET_KEY')
            ?: null;
        if (!$stripeSecretKey) {
            return new JsonResponse(['error' => 'Configuration Stripe manquante'], 500);
        }

        Stripe::setApiKey($stripeSecretKey);

        // 3. Récupération de l'URL de redirection depuis le .env racine
        // On retire un éventuel slash final pour construire une URL propre
        $baseUrl = rtrim(
            $_ENV['FRONTEND_URL']
                ?? $_SERVER['FRONTEND_URL']
                ?? getenv('FRONTEND_URL')
                ?: 'http://localhost:3000',
            '/'
        );

        // 4. Création de la session Stripe
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
                    // Stripe attend des centimes (ex: 100.50€ -> 10050)
                    'unit_amount' => (int)round($booking->getTotalPrice() * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'metadata' => [
                'booking_id' => $booking->getId()
            ],
            // Stripe remplace {CHECKOUT_SESSION_ID} par l'identifiant réel de la session.
            'success_url' => $baseUrl . '/dashboard/reservations?payment=success&session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $baseUrl . '/dashboard/reservations?payment=cancel',
        ]);

        return new JsonResponse(['url' => $session->url]);
    }

    #[Route('/api/stripe/confirm-session', name: 'api_stripe_confirm_session', methods: ['POST'])]
    public function confirmSession(
        Request $request,
        BookingRepository $bookingRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $payload = json_decode($request->getContent(), true) ?: [];
        $sessionId = $payload['sessionId'] ?? null;

        if (!$sessionId) {
            return new JsonResponse(['error' => 'Session Stripe manquante'], 400);
        }

        $stripeSecretKey = $_ENV['STRIPE_SECRET_KEY']
            ?? $_SERVER['STRIPE_SECRET_KEY']
            ?? getenv('STRIPE_SECRET_KEY')
            ?: null;

        if (!$stripeSecretKey) {
            return new JsonResponse(['error' => 'Configuration Stripe manquante'], 500);
        }

        Stripe::setApiKey($stripeSecretKey);

        try {
            $session = Session::retrieve($sessionId);
        } catch (\Throwable $exception) {
            return new JsonResponse(['error' => 'Impossible de vérifier la session Stripe'], 400);
        }
        $bookingId = $session->metadata->booking_id ?? null;

        if (!$bookingId || $session->payment_status !== 'paid') {
            return new JsonResponse(['error' => 'Le paiement Stripe n\'est pas confirmé'], 400);
        }

        $booking = $bookingRepository->find((int) $bookingId);

        if (!$booking) {
            return new JsonResponse(['error' => 'Réservation introuvable'], 404);
        }

        if ($booking->getBooker() !== $this->getUser()) {
            return new JsonResponse(['error' => 'Accès non autorisé'], 403);
        }

        $booking->setStatus('paid');
        $entityManager->flush();

        return new JsonResponse(['message' => 'Paiement confirmé', 'bookingId' => $booking->getId()]);
    }
}

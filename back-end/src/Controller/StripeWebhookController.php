<?php

namespace App\Controller;

use App\Repository\BookingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Webhook;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class StripeWebhookController extends AbstractController
{
    /**
     * On définit deux chemins pour éviter les redirections 307 (trailing slash)
     */
    #[Route('/api/webhook/stripe', name: 'stripe_webhook', methods: ['POST'])]
    #[Route('/api/webhook/stripe/', name: 'stripe_webhook_slash', methods: ['POST'])]
    public function handle(Request $request, BookingRepository $bookingRepository, EntityManagerInterface $em): Response
    {
        $payload = $request->getContent();
        $sigHeader = $request->headers->get('Stripe-Signature');
        $endpointSecret = $_ENV['STRIPE_WEBHOOK_SECRET'];

        // LOG DE DÉBUG : Pour confirmer que Symfony reçoit bien l'appel
        file_put_contents('php://stderr', "--- WEBHOOK STRIPE APPELE --- \n");

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\Exception $e) {
            file_put_contents('php://stderr', "ERREUR SIGNATURE : " . $e->getMessage() . "\n");
            return new Response('Erreur de signature', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $bookingId = $session->metadata->booking_id ?? null;

            file_put_contents('php://stderr', "EVENT RECU : checkout.session.completed pour ID " . $bookingId . "\n");

            if ($bookingId) {
                // On s'assure que c'est un entier
                $booking = $bookingRepository->find((int)$bookingId);

                if ($booking) {
                    $booking->setStatus('paid');

                    $em->persist($booking);
                    $em->flush();

                    file_put_contents('php://stderr', "SUCCÈS : Statut mis à jour en 'paid' en BDD \n");
                } else {
                    file_put_contents('php://stderr', "ERREUR : Réservation #$bookingId introuvable \n");
                }
            }
        }

        return new Response('Webhook traité avec succès', 200);
    }
}
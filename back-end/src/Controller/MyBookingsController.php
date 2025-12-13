<?php

namespace App\Controller;

use App\Repository\BookingRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\SerializerInterface;
use App\Entity\User; // N'oubliez pas d'importer l'entité User

class MyBookingsController extends AbstractController
{
    // Définissons la route que vous souhaitez utiliser, par exemple l'originale pour le front.
    #[Route('/api/users/me/bookings', name: 'app_my_bookings_user', methods: ['GET'])]
    public function __invoke(
        Security $security,
        BookingRepository $bookingRepository,
        SerializerInterface $serializer
    ): Response
    {
        /** @var User|null $user */
        $user = $security->getUser();

        // 1. Vérification de l'authentification
        // Si l'utilisateur n'est pas connecté, renvoyer une erreur 401.
        if (!$user) {
            return $this->json(['message' => 'Jeton d\'authentification manquant ou invalide.'], Response::HTTP_UNAUTHORIZED);
        }

        // 2. Récupération des réservations
        // On utilise la même logique que dans votre Provider
        $bookings = $bookingRepository->findBookingsWithListingByUser($user);

        // 3. Sérialisation des données
        // On utilise le Serializer de Symfony en spécifiant les mêmes groupes de sérialisation
        $jsonContent = $serializer->serialize($bookings, 'json', [
            'groups' => ['booking:read']
        ]);

        // 4. Renvoi de la réponse JSON
        return new Response($jsonContent, Response::HTTP_OK, [
            'Content-Type' => 'application/json'
        ]);
    }
}
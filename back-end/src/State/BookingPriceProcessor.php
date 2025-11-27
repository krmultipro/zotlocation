<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Booking;
use Symfony\Bundle\SecurityBundle\Security;
use RuntimeException;
use Symfony\Component\DependencyInjection\Attribute\Autowire; // 💡 Import de Autowire

class BookingPriceProcessor implements ProcessorInterface
{
    public function __construct(
        // ✅ CORRECTION : On revient à Autowire pour forcer l'injection du service existant
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private Security $security,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        // 1. Vérification du type
        if (!$data instanceof Booking) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        // 2. Définir automatiquement le booker = utilisateur connecté
        $user = $this->security->getUser();
        if (!$user) {
            throw new RuntimeException("Un utilisateur doit être connecté pour effectuer une réservation.");
        }
        $data->setBooker($user);


        // 3. Récupération du Listing (Annonce)
        $listing = $data->getListing();
        if (!$listing) {
            throw new RuntimeException("Annonce manquante pour le calcul du prix.");
        }

        // 4. Calcul du prix
        $start = $data->getStartDate();
        $end = $data->getEndDate();

        // Sécurité/Validation : S'assurer que les dates sont valides
        if (!$start || !$end || $start >= $end) {
            throw new RuntimeException("Les dates de début et de fin sont invalides (la fin doit être après le début).");
        }

        $nightCount = $start->diff($end)->days;

        // Sécurité : Ne pas autoriser de réservation de 0 nuit
        if ($nightCount === 0) {
            throw new RuntimeException("La réservation doit durer au moins une nuit.");
        }

        $total = $nightCount * $listing->getPricePerNight();

        // 5. Enregistrer le prix final dans l'entité
        $data->setTotalPrice($total);

        // 6. Persistance : On appelle le processeur par défaut pour sauvegarder en BDD
        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
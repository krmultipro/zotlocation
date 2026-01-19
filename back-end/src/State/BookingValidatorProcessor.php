<?php


namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Booking;
use App\Service\BookingAvailabilityChecker;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use App\State\BookingPriceProcessor;

final class BookingValidatorProcessor implements ProcessorInterface
{
    /**
     * @param BookingPriceProcessor $priceProcessor Le processeur qui doit être exécuté après la validation.
     * @param BookingAvailabilityChecker $checker Votre service de validation de disponibilité.
     */
    public function __construct(
        // Injecter directement le BookingPriceProcessor
        private BookingPriceProcessor $priceProcessor,
        private BookingAvailabilityChecker $checker
    ) {}

    /**
     * Traite l'entité avant l'enregistrement.
     * @param Booking $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (!$data instanceof Booking) {
            // Si ce n'est pas une Booking, on délègue au processeur suivant (ici priceProcessor)
            return $this->priceProcessor->process($data, $operation, $uriVariables, $context);
        }

        // 1. Vérification de la disponibilité via le service
        if (!$this->checker->isAvailable($data)) {
            throw new ConflictHttpException('Cette période de réservation chevauche une réservation existante. Veuillez choisir d\'autres dates.');
        }

        // 2. Si la validation réussit, on délègue au BookingPriceProcessor pour calculer le prix et persister.
        return $this->priceProcessor->process($data, $operation, $uriVariables, $context);
    }
}
<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Patch; // 💡 Import de Patch
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Booking;
use App\Service\BookingAvailabilityChecker;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;
use App\State\BookingPriceProcessor;
use Symfony\Bundle\SecurityBundle\Security;

final class BookingValidatorProcessor implements ProcessorInterface
{
    public function __construct(
        private BookingPriceProcessor $priceProcessor,
        private BookingAvailabilityChecker $checker,
        private Security $security,
        private EntityManagerInterface $entityManager
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (!$data instanceof Booking) {
            return $this->priceProcessor->process($data, $operation, $uriVariables, $context);
        }

        // 1. Gestion du Booker
        $user = $this->security->getUser();
        if ($user && !$data->getBooker()) {
            $data->setBooker($user);
        }

        if ($operation instanceof Post && !$this->isStripeConfigured()) {
            throw new ServiceUnavailableHttpException(
                null,
                "Le paiement est temporairement indisponible. La réservation n'a pas été créée."
            );
        }

        // 💡 2. Si c'est un PATCH, on vérifie si on change les dates
        // Si on change juste le statut, on saute la vérification de disponibilité
        if ($operation instanceof Patch) {
            $previousData = $context['previous_data'] ?? null;

            // Si les dates n'ont pas changé, on saute le checker et on va direct au prix/save
            if ($previousData instanceof Booking &&
                $previousData->getStartDate() == $data->getStartDate() &&
                $previousData->getEndDate() == $data->getEndDate()) {

                return $this->priceProcessor->process($data, $operation, $uriVariables, $context);
            }
        }

        return $this->entityManager->wrapInTransaction(function () use ($data, $operation, $uriVariables, $context) {
            $listingId = $data->getListing()?->getId();
            if ($listingId !== null) {
                $this->entityManager
                    ->getConnection()
                    ->executeStatement('SELECT pg_advisory_xact_lock(:lock_key)', [
                        'lock_key' => $listingId,
                    ]);
            }

            // 3. Vérification de la disponibilité après verrouillage transactionnel.
            if (!$this->checker->isAvailable($data)) {
                throw new ConflictHttpException('Cette période de réservation chevauche une réservation existante.');
            }

            return $this->priceProcessor->process($data, $operation, $uriVariables, $context);
        });
    }

    private function isStripeConfigured(): bool
    {
        $secretKey = $_ENV['STRIPE_SECRET_KEY']
            ?? $_SERVER['STRIPE_SECRET_KEY']
            ?? getenv('STRIPE_SECRET_KEY')
            ?: '';

        return trim($secretKey) !== '';
    }
}

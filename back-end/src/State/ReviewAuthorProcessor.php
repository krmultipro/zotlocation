<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Review;
use App\Entity\User;
use App\Repository\BookingRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

final class ReviewAuthorProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private Security $security,
        private BookingRepository $bookingRepository
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if ($data instanceof Review && ($operation instanceof Post)) {
            $user = $this->security->getUser();
            $listing = $data->getListing();

            if (!$user instanceof User) {
                throw new AccessDeniedHttpException("Vous devez être connecté.");
            }

            // Vérifier si une réservation terminée existe
            // On utilise la méthode du repository (ou une simple recherche)
            $hasPastBooking = $this->bookingRepository->findOneBy([
                'booker' => $user,
                'listing' => $listing,
            ]);

            // Optionnel : On peut vérifier que la date de fin est < à aujourd'hui
            $now = new \DateTime();
            if (!$hasPastBooking || $hasPastBooking->getEndDate() > $now) {
                throw new AccessDeniedHttpException(
                    "Vous ne pouvez laisser un avis qu'après la fin de votre séjour."
                );
            }

            $data->setAuthor($user);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
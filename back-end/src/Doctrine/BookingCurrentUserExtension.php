<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Booking;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

final class BookingCurrentUserExtension implements QueryCollectionExtensionInterface
{
    public function __construct(private Security $security) {}

    /**
     * Cette méthode est appelée pour chaque collection GET.
     * On filtre les bookings pour que chaque user voie seulement les siens,
     * sauf les admins qui voient tout.
     */
    public function applyToCollection(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        if ($resourceClass !== Booking::class) {
            return;
        }

        // Admin voit toutes les bookings
        if ($this->security->isGranted('ROLE_ADMIN')) {
            return;
        }

        $user = $this->security->getUser();
        if (!$user) {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];
        $queryBuilder
        ->andWhere(sprintf('%s.booker = :current_user', $rootAlias))
        ->setParameter('current_user', $user);
    }
}
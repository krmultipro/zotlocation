<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Listing;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

final class CurrentUserExtension implements QueryCollectionExtensionInterface
{
    public function __construct(
        private readonly Security $security
    ) {}

    public function applyToCollection(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        $this->addWhere($queryBuilder, $resourceClass, $operation);
    }

    private function addWhere(QueryBuilder $queryBuilder, string $resourceClass, ?Operation $operation): void
    {
        $user = $this->security->getUser();

        // On vérifie si l'uriTemplate correspond à notre route personnalisée
        $isMyListings = $operation && $operation->getUriTemplate() === '/my-listings';

        if (Listing::class !== $resourceClass || !$isMyListings || null === $user) {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];
        $queryBuilder->andWhere(sprintf('%s.owner = :current_user', $rootAlias));
        $queryBuilder->setParameter('current_user', $user);
    }
}
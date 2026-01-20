<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Listing;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

final class MyListingsExtension implements QueryCollectionExtensionInterface
{
    private Security $security;

    public function __construct(Security $security)
    {
        $this->security = $security;
    }

    public function applyToCollection(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        if ($resourceClass !== Listing::class) {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];

        // --- PARTIE 1 : OPTIMISATION DES PERFORMANCES (JOIN) ---
        // On force le chargement groupé pour éviter les logs "Executing statement" en boucle
        $queryBuilder
            ->leftJoin(sprintf('%s.category', $rootAlias), 'c')
            ->addSelect('c')
            ->leftJoin(sprintf('%s.localisation', $rootAlias), 'l')
            ->addSelect('l')
            ->leftJoin(sprintf('%s.images', $rootAlias), 'i')
            ->addSelect('i');

        // --- PARTIE 2 : FILTRE SÉCURITÉ /my-listings ---
        // On vérifie si l'URI demandée est bien celle de tes annonces personnelles
        if ($operation && $operation->getUriTemplate() === '/my-listings') {
            $user = $this->security->getUser();
            if ($user) {
                $queryBuilder
                    ->andWhere(sprintf('%s.owner = :current_user', $rootAlias))
                    ->setParameter('current_user', $user);
            }
        }
    }
}
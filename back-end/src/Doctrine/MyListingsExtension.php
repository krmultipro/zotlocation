<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Listing;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;
use ApiPlatform\Doctrine\Orm\Extension\AsDoctrineOrmQueryCollectionExtension;

/**
 * Cette classe permet de filtrer automatiquement les collections de l'entité Listing.
 * L'attribut PHP 8 permet à Symfony de reconnaître automatiquement cette extension.
 */
#[AsDoctrineOrmQueryCollectionExtension]
final class MyListingsExtension implements QueryCollectionExtensionInterface
{
    // On injecte le service Security pour récupérer l'utilisateur actuellement connecté
    public function __construct(private Security $security) {}

    /**
     * Cette méthode est appelée par API Platform lors de la récupération d'une liste d'objets.
     */
    public function applyToCollection(
        QueryBuilder $qb,
        QueryNameGeneratorInterface $qng,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {

        // 1. On vérifie si l'entité demandée est bien "Listing"
        if ($resourceClass !== Listing::class) {
            return;
        }

        // 2. On vérifie que le filtre ne s'applique QUE sur l'endpoint spécifique "/my-listings"
        if ($operation?->getUriTemplate() !== '/my-listings') {
            return;
        }

        // 3. On récupère l'utilisateur connecté. S'il n'y en a pas, on ne fait rien (ou accès refusé)
        $user = $this->security->getUser();
        if (!$user) {
            return;
        }

        // 4. On récupère l'alias de la table (souvent 'o' par défaut) pour construire la requête
        $alias = $qb->getRootAliases()[0];

        // 5. On modifie la requête Doctrine (DQL) pour ajouter la condition de propriété
        $qb
            ->andWhere("$alias.owner = :user")
            ->setParameter('user', $user);
    }
}
<?php

namespace App\Doctrine;

final class MyListingsExtension implements QueryCollectionExtensionInterface
{
    public function __construct(private Security $security) {}

    public function applyToCollection(
        QueryBuilder $qb,
        QueryNameGeneratorInterface $qng,
        string $resourceClass,
        ?Operation $operation = null
    ) {
        if ($resourceClass !== Listing::class) return;

        $user = $this->security->getUser();
        if (!$user) return;

        $alias = $qb->getRootAliases()[0];

        $qb
          ->andWhere("$alias.owner = :user")
          ->setParameter('user', $user);
    }
}


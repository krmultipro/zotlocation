<?php


namespace App\Doctrine;
use ApiPlatform\Doctrine\Orm\Extension\AsDoctrineOrmQueryCollectionExtension;
use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Listing;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security; 

#[AsDoctrineOrmQueryCollectionExtension]
final class MyListingsExtension implements QueryCollectionExtensionInterface
{
    public function __construct(private Security $security) {}

    public function applyToCollection(
        QueryBuilder $qb,
        QueryNameGeneratorInterface $qng,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        
        if ($resourceClass !== Listing::class) {
            return;
        }

        if ($operation?->getUriTemplate() !== '/my-listings') {
            return;
        }

        $user = $this->security->getUser();
        if (!$user) {
            return;
        }

        


        $alias = $qb->getRootAliases()[0];

        $qb
            ->andWhere("$alias.owner = :user")
            ->setParameter('user', $user);
    }


}


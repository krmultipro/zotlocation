<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Repository\BookingRepository;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\PropertyInfo\Type;

final class ListingAvailabilityFilter extends AbstractFilter
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private RequestStack $requestStack,
        array $properties = null
    ) {
        parent::__construct($properties);
    }

    // API Platform appelle filterProperty pour chaque paramètre de l'URL
    protected function filterProperty(
        string $property,
        $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        // On ne déclenche la logique qu'une seule fois (quand on passe sur 'startDate')
        if ($property !== 'startDate') {
            return;
        }

        $request = $this->requestStack->getCurrentRequest();
        $startDate = $request?->query->get('startDate');
        $endDate = $request?->query->get('endDate');

        if (!$startDate || !$endDate) {
            return;
        }

        // Récupération des IDs indisponibles
        $conflictingListingIds = $this->bookingRepository->findConflictingListingIds(
            (string) $startDate,
            (string) $endDate
        );



        if (!empty($conflictingListingIds)) {
            $alias = $queryBuilder->getRootAliases()[0];
            $paramName = $queryNameGenerator->generateParameterName('conflictingIds');

            $queryBuilder
                ->andWhere($queryBuilder->expr()->notIn($alias . '.id', ':' . $paramName))
                ->setParameter($paramName, $conflictingListingIds);
        }
    }

    public function getDescription(string $resourceClass): array
    {
        return [
            'startDate' => [
                'property' => 'startDate',
                'type' => 'string',
                'required' => false,
                'description' => 'Format YYYY-MM-DD',
            ],
            'endDate' => [
                'property' => 'endDate',
                'type' => 'string',
                'required' => false,
                'description' => 'Format YYYY-MM-DD',
            ],
        ];
    }
}
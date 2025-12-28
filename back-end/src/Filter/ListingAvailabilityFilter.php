<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Repository\BookingRepository;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\HttpFoundation\RequestStack;

final class ListingAvailabilityFilter extends AbstractFilter
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private RequestStack $requestStack,
        array $properties = null
    ) {
        parent::__construct($properties);
    }

    protected function filterProperty(
        string $property,
        $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        $rootAlias = $queryBuilder->getRootAliases()[0];

        // 1. GESTION DE LA CAPACITÉ (Voyageurs)
        // On intercepte 'capacity' ou 'capacity[gte]' pour être sûr de capter le front
        if ($property === 'capacity' || $property === 'capacity[gte]') {
            $parameterName = $queryNameGenerator->generateParameterName('capacity');

            $queryBuilder
                ->andWhere(sprintf('%s.capacity >= :%s', $rootAlias, $parameterName))
                ->setParameter($parameterName, $value);
            return;
        }

        // 2. GESTION DES DATES (Disponibilité)
        // On ne déclenche la logique des dates que sur le paramètre 'startDate'
        if ($property === 'startDate') {
            $request = $this->requestStack->getCurrentRequest();
            $startDate = $request?->query->get('startDate');
            $endDate = $request?->query->get('endDate');

            if ($startDate && $endDate) {
                $conflictingListingIds = $this->bookingRepository->findConflictingListingIds(
                    (string) $startDate,
                    (string) $endDate
                );

                if (!empty($conflictingListingIds)) {
                    $paramName = $queryNameGenerator->generateParameterName('conflictingIds');
                    $queryBuilder
                        ->andWhere($queryBuilder->expr()->notIn($rootAlias . '.id', ':' . $paramName))
                        ->setParameter($paramName, $conflictingListingIds);
                }
            }
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
            'capacity' => [
                'property' => 'capacity',
                'type' => 'integer',
                'required' => false,
                'description' => 'Nombre minimum de voyageurs',
            ],
            'capacity[gte]' => [
                'property' => 'capacity',
                'type' => 'integer',
                'required' => false,
                'description' => 'Nombre minimum de voyageurs (alias gte)',
            ],
        ];
    }
}
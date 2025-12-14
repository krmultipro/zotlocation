<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Repository\BookingRepository;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Request; // Nécessaire pour le type hinting dans le corps
use Symfony\Component\PropertyInfo\Type;

final class ListingAvailabilityFilter extends AbstractFilter
{
    // Injection du BookingRepository et du RequestStack via le constructeur
    public function __construct(
        private BookingRepository $bookingRepository,
        private RequestStack $requestStack, // 💡 Nous devons l'utiliser pour récupérer la Request
        array $properties = null
    ) {
        parent::__construct($properties);
    }

    /**
     * Applique le filtre de disponibilité.
     * La signature est simplifiée pour correspondre EXCLUSIVEMENT à ce qu'attend l'AbstractFilter.
     * @param array<string, mixed> $context
     */
    public function apply( //  Doit être public
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,

        ?Operation $operation = null,
        array $context = []
    ): void {
        if ($resourceClass !== \App\Entity\Listing::class) {
            return;
        }

        // 1. Récupérer la Request via le RequestStack
        $request = $this->requestStack->getCurrentRequest();

        if (!$request instanceof Request) {
            return;
        }

        $startDate = $request->query->get('startDate');
        $endDate = $request->query->get('endDate');

        if (!$startDate || !$endDate) {
            return;
        }

        // 2. Utiliser le Repository pour trouver les IDs des Listings non disponibles
        $conflictingListingIds = $this->bookingRepository->findConflictingListingIds(
            (string) $startDate,
            (string) $endDate
        );

        // 3. Appliquer la clause NOT IN pour exclure les annonces en conflit
        if (!empty($conflictingListingIds)) {
            $alias = $queryBuilder->getRootAliases()[0];
            $parameterName = $queryNameGenerator->generateParameterName('conflictingListingIds');

            $queryBuilder
                ->andWhere($queryBuilder->expr()->notIn(
                    $alias . '.id',
                    ':' . $parameterName
                ))
                ->setParameter($parameterName, $conflictingListingIds);
        }
    }

    /**
     * Requis par AbstractFilter, mais non utilisé pour ce filtre global. Doit être PUBLIC.
     */
    public function filterProperty(
        string $property,
        $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {}

    // Déclaration des paramètres pour la documentation API (Swagger/Hydra)
    public function getDescription(string $resourceClass): array
    {
        if ($resourceClass !== \App\Entity\Listing::class) {
            return [];
        }

        return [
            'startDate' => [
                'property' => 'startDate',
                'type' => Type::BUILTIN_TYPE_STRING,
                'required' => false,
                'description' => 'Date de début de la période de recherche (YYYY-MM-DD).',
            ],
            'endDate' => [
                'property' => 'endDate',
                'type' => Type::BUILTIN_TYPE_STRING,
                'required' => false,
                'description' => 'Date de fin de la période de recherche (YYYY-MM-DD).',
            ],
        ];
    }
}
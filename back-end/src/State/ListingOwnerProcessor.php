<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post; //  Import nécessaire pour la vérification de l'opération POST
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Listing;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Security\Core\User\UserInterface;

class ListingOwnerProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private Security $security
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Listing) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        // 1. Récupération de l'utilisateur connecté
        $user = $this->security->getUser();

        // 2. Vérification de la création (POST)
        // On vérifie si l'opération est une instance de la classe ApiPlatform\Metadata\Post
        if ($operation instanceof Post) {

            // 3. Attribution de l'Owner si l'utilisateur est connecté et que l'owner n'est pas déjà défini
            if ($user instanceof UserInterface && $data->getOwner() === null) {
                // 🚀 Attribution automatique de l'utilisateur connecté
                $data->setOwner($user);
            }
        }

        // 4. Persistance des données
        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
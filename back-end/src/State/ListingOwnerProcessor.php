<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
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

    /**
     * @param mixed $data L'entité à traiter
     * @param Operation $operation L'opération API Platform en cours
     * @param array $uriVariables Les variables d'URI (optionnel)
     * @param array $context Contexte supplémentaire (optionnel)
     *
     * @return mixed L'entité persistée
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        // On ne traite que les objets Listing
        if (!$data instanceof Listing) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        // Récupération de l'utilisateur connecté
        $user = $this->security->getUser();

        // Si c'est une création (POST) et que l'utilisateur est connecté
        if ($operation instanceof Post) {
            if ($user instanceof UserInterface && $data->getOwner() === null) {
                $data->setOwner($user); // Attribution automatique
            }
        }

        // Persistance de l'entité via le processeur standard
        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
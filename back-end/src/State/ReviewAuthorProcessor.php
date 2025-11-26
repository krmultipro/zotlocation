<?php


namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Review;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire; // 💡 Importez ceci

final class ReviewAuthorProcessor implements ProcessorInterface
{
    public function __construct(
        // 💡 CORRECTION : Utilisation de #[Autowire] pour cibler le service exact
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private Security $security
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        // Assigne l'utilisateur connecté comme auteur lors de la création
        if ($data instanceof Review && ($operation instanceof Post)) {
            $user = $this->security->getUser();

            if ($user && $user instanceof User) {
                $data->setAuthor($user);
            }
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
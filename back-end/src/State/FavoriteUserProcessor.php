<?php


namespace App\State;


use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Favorite;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire; // 💡 ASSUREZ-VOUS QUE CECI EST IMPORTÉ

final class FavoriteUserProcessor implements ProcessorInterface
{
    public function __construct(
        // 💡 CORRECTION : Utilisation de #[Autowire] pour cibler le service exact
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private Security $security
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Favorite
    {
        if ($data instanceof Favorite && ($operation instanceof Post)) {
            // Assigner l'utilisateur connecté comme favoriteUser
            $user = $this->security->getUser();
            if ($user && $user instanceof \App\Entity\User) {
                $data->setFavoriteUser($user);
            }
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
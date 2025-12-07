<?php
namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Favorite;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException; // 💡 Ajoutez ceci

final class FavoriteUserProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private Security $security
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Favorite
    {
        if ($data instanceof Favorite && ($operation instanceof Post)) {
            $user = $this->security->getUser();

            // 🚨 CONTRÔLE DE SÉCURITÉ CRITIQUE
            // Si l'utilisateur est null (non connecté), on bloque la requête ici.
            if (!$user || !$user instanceof \App\Entity\User) {
                throw new UnauthorizedHttpException('Bearer', 'Vous devez être connecté pour effectuer cette action.');
            }

            // Assigner l'utilisateur connecté
            $data->setFavoriteUser($user);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
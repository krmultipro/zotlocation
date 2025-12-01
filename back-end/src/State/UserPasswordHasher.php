<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Entity\Profile;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class UserPasswordHasher implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        // Si ce n'est pas un User, on délègue directement
        if (!$data instanceof User) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        // Gestion des rôles et création du profil à l'inscription
        if ($operation instanceof Post) {
            $roles = ['ROLE_USER'];
            if ($data->getIsOwner() === true) {
                $roles[] = 'ROLE_PROPRIETAIRE';
                $roles[] = 'ROLE_ADMIN';
            }
            $data->setRoles(array_unique($roles));

            // Crée un profil si absent
            if (!$data->getProfile()) {
                $profile = new Profile();
                $profile->setFullName($data->getName() ?? '');
                $data->setProfile($profile);
            }
        }

        // Hachage du mot de passe si fourni
        if ($data->getPlainPassword()) {
            $data->setPassword(
                $this->passwordHasher->hashPassword($data, $data->getPlainPassword())
            );
        }
        $data->eraseCredentials();

        // Avatar : si c'est une URL valide, on la stocke directement
        $avatar = $data->getAvatar();
        if ($avatar && filter_var($avatar, FILTER_VALIDATE_URL) === false) {
            // Si ce n'est pas une URL valide, on peut l'ignorer ou lever une exception
            $data->setAvatar(null);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
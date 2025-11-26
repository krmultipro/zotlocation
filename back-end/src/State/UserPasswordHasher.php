<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Entity\Profile; // 💡 Import de l'entité Profile
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class UserPasswordHasher implements ProcessorInterface
{
    public function __construct(
        // On injecte le processeur Doctrine par défaut pour la persistance réelle
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        // On s'assure que nous traitons bien un objet User
        if (!$data instanceof User) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        // ----------------------------------------------------
        // 1. LOGIQUE DE RÔLE & CRÉATION DE PROFIL (POST uniquement)
        // ----------------------------------------------------
        if ($operation instanceof Post) {
            // A. Gestion des Rôles
            $roles = ['ROLE_USER']; // Rôle de base pour tous les utilisateurs

            // Si le champ virtuel isOwner est vrai, on ajoute le rôle
            if ($data->getIsOwner() === true) {
                $roles[] = 'ROLE_PROPRIETAIRE';
            }
            $data->setRoles(array_unique($roles));

            // B. 💡 NOUVEAU : Création et Liaison du Profil
            $profile = new Profile();

            // Initialisation du nom complet du profil (utilisez le nom de l'utilisateur pour une valeur par défaut)
            $profile->setFullName($data->getName() ?? '');

            // Lier l'objet Profile à l'objet User.
            // Grâce à la cascade: ['persist'] dans l'entité User, le Profile sera persisté automatiquement.
            $data->setProfile($profile);
        }

        // ----------------------------------------------------
        // 2. LOGIQUE DE HACHAGE : Appliquée si un mot de passe en clair est fourni
        // ----------------------------------------------------
        if ($data->getPlainPassword()) {
            // Hachage du mot de passe
            $hashedPassword = $this->passwordHasher->hashPassword(
                $data,
                $data->getPlainPassword()
            );
            $data->setPassword($hashedPassword);
        }

        // Nettoyage du mot de passe en clair (sécurité)
        $data->eraseCredentials();

        // ----------------------------------------------------
        // 3. PERSISTANCE : On appelle le processeur par défaut pour sauvegarder en BDD
        // ----------------------------------------------------
        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
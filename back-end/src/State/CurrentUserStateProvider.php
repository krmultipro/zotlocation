<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Me; // <-- ASSUREZ-VOUS QUE CECI EST CORRECT
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Récupère l'utilisateur connecté et ses données de profil pour l'endpoint /api/me.
 * Implémente le State Provider pour la ressource Me.
 */
class CurrentUserStateProvider implements ProviderInterface
{
    public function __construct(
        private readonly Security $security,
    ) {}

    /**
     * @param Operation $operation
     * @param array $uriVariables
     * @param array $context
     * @return Me|null
     */
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        // On vérifie que la requête concerne bien notre ressource personnalisée
        if ($operation->getName() !== 'get_current_user') {
            return null;
        }

        // 1. Récupération de l'utilisateur via le composant Security
        /** @var User|null $user */
        $user = $this->security->getUser();

        if (!$user) {
            // L'utilisateur doit être connecté grâce à la sécurité définie sur la ressource Me
            throw new AccessDeniedException('Vous devez être authentifié pour accéder à cette ressource.');
        }

        // 2. Construction de l'objet DTO Me
        $me = new Me();
        $me->id = $user->getId();
        $me->email = $user->getEmail();
        $me->roles = $user->getRoles();

        // Vérification du rôle d'Owner (utilisation du champ virtuel isOwner de l'entité User)
        $me->isOwner = $user->getIsOwner() || in_array('ROLE_PROPRIETAIRE', $me->roles);

        // 3. Ajout des données du Profile
        $profile = $user->getProfile();

        if ($profile) {
            $me->full_name = $profile->getFullName();
            $me->avatarUrl = $user->getAvatar();
        } else {
            $me->full_name = $user->getName() ?? $user->getEmail();
            $me->avatarUrl = $user->getAvatar();
        }

        return $me;
    }
}
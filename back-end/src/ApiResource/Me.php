<?php
// src/ApiResource/Me.php

namespace App\ApiResource; // <-- NAMESPACE RESTAURÉ

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\State\CurrentUserStateProvider;

/**
 * Définit la ressource API pour récupérer l'utilisateur courant (/api/me).
 */
#[ApiResource(
    // Nous revenons à '/me' car le préfixe '/api' est géré par la configuration Symfony/API Platform
    uriTemplate: '/me',
    operations: [
        new Get(
            security: "is_granted('ROLE_USER')",
            name: 'get_current_user',
            formats: ['json'],
            provider: CurrentUserStateProvider::class
        ),
    ],
    shortName: 'Me',
    types: ['Me'],
)]
class Me
{
    public ?int $id = null;
    public ?string $email = null;
    public ?array $roles = [];
    public ?bool $isOwner = false;
    public ?string $full_name = null;
    public ?string $avatarUrl = null;
}
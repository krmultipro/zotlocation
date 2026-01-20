<?php
// src/ApiResource/AdminCheck.php

// src/ApiResource/Admin.php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;

#[ApiResource(
    uriTemplate: 'api/admin',
    operations: [
        new Get(
            security: "is_granted('ROLE_ADMIN')",
            name: 'admin_entrypoint'
        )
    ]
)]
class AdminCheck
{
    public string $message = 'Accès admin autorisé';
}

<?php



namespace App\OpenApi;



use ApiPlatform\OpenApi\Factory\OpenApiFactoryInterface;

use ApiPlatform\OpenApi\OpenApi;

use ApiPlatform\OpenApi\Model\SecurityScheme;



class OpenApiFactory implements OpenApiFactoryInterface

{

public function __construct(

private OpenApiFactoryInterface $decorated

) {}



public function __invoke(array $context = []): OpenApi

{

$openApi = ($this->decorated)($context);



// --- Ajout du BearerAuth ---

$components = $openApi->getComponents();

$securitySchemes = $components->getSecuritySchemes() ?? [];



// Ajout du schéma JWT

$securitySchemes['bearerAuth'] = new SecurityScheme(

type: 'http',

scheme: 'bearer',

bearerFormat: 'JWT'

);



// Mise à jour des composants

$components = $components->withSecuritySchemes($securitySchemes);

$openApi = $openApi->withComponents($components);



// Activation globale de ce security scheme

$openApi = $openApi->withSecurity([['bearerAuth' => []]]);



return $openApi;

}

}
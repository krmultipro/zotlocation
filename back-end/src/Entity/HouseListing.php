<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Repository\HouseListingRepository;
use App\State\ListingOwnerProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: HouseListingRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['house:read', 'listing:read']],
    denormalizationContext: ['groups' => ['house:create', 'house:update', 'listing:create', 'listing:update']],
    operations: [
        new Post(
            processor: ListingOwnerProcessor::class,
            security: "is_granted('ROLE_PROPRIETAIRE') or is_granted('ROLE_ADMIN')"
        ),
    ],
)]
class HouseListing extends Listing
{
    #[ORM\Column]
    // 💡 Ajout de 'listing:read' pour la visibilité lors de la lecture d'un Listing générique
    #[Groups(['house:read', 'house:card:read', 'house:create', 'house:update', 'listing:read'])]
    #[Assert\PositiveOrZero(message: "La taille du jardin doit être positive ou nulle.")]
    private ?float $gardenSize = null;

    #[ORM\Column]
    #[Groups(['house:read', 'house:card:read', 'house:create', 'house:update', 'listing:read'])]
    private ?bool $hasGarage = null;

    public function getGardenSize(): ?float { return $this->gardenSize; }
    public function setGardenSize(float $gardenSize): static { $this->gardenSize = $gardenSize; return $this; }
    public function isHasGarage(): ?bool { return $this->hasGarage; }
    public function setHasGarage(bool $hasGarage): static { $this->hasGarage = $hasGarage; return $this; }
}

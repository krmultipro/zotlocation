<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use App\Repository\HouseListingRepository;
use App\State\ListingOwnerProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: HouseListingRepository::class)]
#[ApiResource(
    processor: ListingOwnerProcessor::class,
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Patch(),
        new Delete(),
    ],
    // 💡 Mise à jour ici : on ajoute 'listing:card:read' pour la vue principale
    normalizationContext: [
        'groups' => ['house:read', 'listing:read', 'listing:card:read']
    ],
    denormalizationContext: [
        'groups' => ['house:create', 'house:update', 'listing:create', 'listing:update']
    ],
)]
class HouseListing extends Listing
{
    #[ORM\Column]
    #[Groups(['house:read', 'house:create', 'house:update', 'listing:read', 'listing:card:read'])]
    #[Assert\PositiveOrZero(message: "La taille du jardin doit être positive ou nulle.")]
    private ?float $gardenSize = null;

    #[ORM\Column]
    #[Groups(['house:read', 'house:create', 'house:update', 'listing:read', 'listing:card:read'])]
    private ?bool $hasGarage = null;

    // --- GETTERS & SETTERS ---

    public function getGardenSize(): ?float
    {
        return $this->gardenSize;
    }

    public function setGardenSize(float $gardenSize): static
    {
        $this->gardenSize = $gardenSize;
        return $this;
    }

    public function isHasGarage(): ?bool
    {
        return $this->hasGarage;
    }

    public function setHasGarage(bool $hasGarage): static
    {
        $this->hasGarage = $hasGarage;
        return $this;
    }
}
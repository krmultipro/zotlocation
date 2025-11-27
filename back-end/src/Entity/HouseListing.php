<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource; // 💡 NOUVEAU
use App\Repository\HouseListingRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups; // 💡 NOUVEAU
use Symfony\Component\Validator\Constraints as Assert; // 💡 NOUVEAU

#[ORM\Entity(repositoryClass: HouseListingRepository::class)]
#[ApiResource(
    // Les opérations sont héritées de Listing.
    // On définit des groupes spécifiques pour la dénormalisation et la lecture.
    normalizationContext: ['groups' => ['house:read', 'listing:read']],
    denormalizationContext: ['groups' => ['house:create', 'house:update', 'listing:create', 'listing:update']],
)]
class HouseListing extends Listing // Hérite de $id, Owner, etc.
{
    // Propriétés spécifiques
    #[ORM\Column]
    #[Groups(['house:read', 'house:create', 'house:update'])]
    #[Assert\PositiveOrZero(message: "La taille du jardin doit être positive ou nulle.")]

    private ?float $gardenSize = null;

    #[ORM\Column]
    #[Groups(['house:read', 'house:create', 'house:update'])]
    private ?bool $hasGarage = null;



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
<?php

namespace App\Entity;

use App\Repository\HouseListingRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: HouseListingRepository::class)]
class HouseListing extends Listing // Hérite de $id, Owner, etc.
{
    // RETIRER LE CODE DE REDÉCLARATION DE L'ID :
    /*
    #[ORM\Id]
    #[ORM\OneToOne(targetEntity: Listing::class)]
    #[ORM\JoinColumn(name: 'id', referencedColumnName: 'id')]
    protected $id;
    */

    // Propriétés spécifiques (déjà en CamelCase)
    #[ORM\Column]
    private ?float $gardenSize = null;

    #[ORM\Column]
    private ?bool $hasGarage = null;

    // NOTE : Les méthodes getId() et setId() ne sont plus nécessaires car elles sont héritées de Listing.
    /*
    public function getId(): ?int
    {
        return parent::getId();
    }

    public function setId(?int $id): static
    {
        parent::setId($id);
        return $this;
    }
    */

    // --- GETTERS & SETTERS PROPRIÉTÉS SPÉCIFIQUES ---

    public function getGardenSize(): ?float
    {
        return $this->gardenSize;
    }

    public function setGardenSize(float $gardenSize): static
    {
        $this->gardenSize = $gardenSize;
        return $this;
    }

    public function getHasGarage(): ?bool
    {
        return $this->hasGarage;
    }

    public function setHasGarage(bool $hasGarage): static
    {
        $this->hasGarage = $hasGarage;
        return $this;
    }
}
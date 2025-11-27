<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ApartmentListingRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ApartmentListingRepository::class)]
#[ApiResource(
    // Les opérations sont héritées de Listing.
    // On définit des groupes spécifiques pour la dénormalisation et la lecture.
    normalizationContext: ['groups' => ['apartment:read', 'listing:read']],
    denormalizationContext: ['groups' => ['apartment:create', 'apartment:update', 'listing:create', 'listing:update']],
)]
class ApartmentListing extends Listing // Hérite de $id, Owner, etc.
{
    // Propriétés spécifiques : application du CamelCase
    #[ORM\Column]
    #[Groups(['apartment:read', 'apartment:create', 'apartment:update'])]
    private ?bool $balcony = null;

    #[ORM\Column]
    #[Groups(['apartment:read', 'apartment:create', 'apartment:update'])]
    #[Assert\Positive(message: "Le nombre de pièces doit être positif.")]
    private ?int $numberOfRooms = null;


    // --- GETTERS & SETTERS PROPRIÉTÉS SPÉCIFIQUES ---

    public function isBalcony(): ?bool
    {
        return $this->balcony;
    }

    public function setBalcony(bool $balcony): static
    {
        $this->balcony = $balcony;
        return $this;
    }

    public function getNumberOfRooms(): ?int
    {
        return $this->numberOfRooms;
    }

    public function setNumberOfRooms(int $numberOfRooms): static
    {
        $this->numberOfRooms = $numberOfRooms;
        return $this;
    }
}
<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use App\Repository\ApartmentListingRepository;
use App\State\ListingOwnerProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ApartmentListingRepository::class)]
#[ApiResource(
    processor: ListingOwnerProcessor::class,
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Patch(),
        new Delete(),
    ],
    // 💡 On s'aligne sur les groupes de Listing pour que la vue "Collection" fonctionne
    normalizationContext: [
        'groups' => ['apartment:read', 'listing:read', 'listing:card:read']
    ],
    denormalizationContext: [
        'groups' => ['apartment:create', 'apartment:update', 'listing:create', 'listing:update']
    ],
)]
class ApartmentListing extends Listing
{
    #[ORM\Column]
    // 💡 Inclus dans listing:card:read pour être visible sur la page d'accueil (vue principale)
    #[Groups(['apartment:read', 'apartment:create', 'apartment:update', 'listing:read', 'listing:card:read'])]
    private ?bool $balcony = null;

    #[ORM\Column]
    #[Groups(['apartment:read', 'apartment:create', 'apartment:update', 'listing:read', 'listing:card:read'])]
    #[Assert\Positive(message: "Le nombre de pièces doit être positif.")]
    private ?int $numberOfRooms = null;

    // --- GETTERS & SETTERS ---

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
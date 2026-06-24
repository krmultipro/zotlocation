<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Repository\ApartmentListingRepository;
use App\State\ListingOwnerProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ApartmentListingRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['apartment:read', 'listing:read']],
    denormalizationContext: ['groups' => ['apartment:create', 'apartment:update', 'listing:create', 'listing:update']],
    operations: [
        new Post(
            processor: ListingOwnerProcessor::class,
            security: "is_granted('ROLE_PROPRIETAIRE') or is_granted('ROLE_ADMIN')"
        ),
    ],
)]
class ApartmentListing extends Listing
{
    #[ORM\Column]
    // 💡 Ajout de 'listing:read' pour que ces champs apparaissent dans le GET global de Listing
    #[Groups(['apartment:read', 'apartment:card:read', 'apartment:create', 'apartment:update', 'listing:read'])]
    private ?bool $balcony = null;

    #[ORM\Column]
    #[Groups(['apartment:read', 'apartment:card:read', 'apartment:create', 'apartment:update', 'listing:read'])]
    #[Assert\Positive(message: "Le nombre de pièces doit être positif.")]
    private ?int $numberOfRooms = null;

    public function isBalcony(): ?bool { return $this->balcony; }
    public function setBalcony(bool $balcony): static { $this->balcony = $balcony; return $this; }
    public function getNumberOfRooms(): ?int { return $this->numberOfRooms; }
    public function setNumberOfRooms(int $numberOfRooms): static { $this->numberOfRooms = $numberOfRooms; return $this; }
}

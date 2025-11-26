<?php

namespace App\Entity;

use App\Repository\FavoriteRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FavoriteRepository::class)]
class Favorite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'favoritesUser')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $favoriteUser = null;

    #[ORM\ManyToOne(inversedBy: 'favoriteListings')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Listing $listing = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFavoriteUser(): ?User
    {
        return $this->favoriteUser;
    }

    public function setFavoriteUser(?User $favoriteUser): static
    {
        $this->favoriteUser = $favoriteUser;

        return $this;
    }

    public function getListing(): ?Listing
    {
        return $this->listing;
    }

    public function setListing(?Listing $listing): static
    {
        $this->listing = $listing;

        return $this;
    }
}

<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\FavoriteRepository;
use App\State\FavoriteUserProcessor; // 💡 PROCESSEUR NÉCESSAIRE (à créer)
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity; // 💡 Pour éviter les doublons

#[ORM\Entity(repositoryClass: FavoriteRepository::class)]
// 💡 Assurance que la combinaison (User, Listing) est unique
#[UniqueEntity(
    fields: ['favoriteUser', 'listing'],
    message: "Cette annonce est déjà dans vos favoris."
)]
#[ApiResource(
    operations: [
        // GET Collection : Lister MES favoris (filtré)
        new GetCollection(
            security: "is_granted('ROLE_USER')",
            normalizationContext: ['groups' => ['favorite:read']]
            // Un Filtre Doctrine sera nécessaire pour n'afficher que les favoris de l'utilisateur connecté
        ),

        // GET Item : Lire un favori spécifique (si c'est le sien)
        new Get(
            security: "object.getFavoriteUser() == user",
            normalizationContext: ['groups' => ['favorite:read']]
        ),

        // POST : Ajouter un favori (utilisateur connecté)
        new Post(
            processor: FavoriteUserProcessor::class, //  Définit favoriteUser = utilisateur connecté
            security: "is_granted('ROLE_USER')",
            denormalizationContext: ['groups' => ['favorite:create']]
        ),

        // DELETE : Retirer des favoris (si c'est le sien)
        new Delete(security: "object.getFavoriteUser() == user"),
    ],
    // Groupes de sérialisation par défaut
    normalizationContext: ['groups' => ['favorite:read']],
)]
class Favorite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['favorite:read', 'listing:item:read', 'user:read'])]
    private ?int $id = null;

    // L'utilisateur qui a mis en favori
    #[ORM\ManyToOne(inversedBy: 'favoritesUser')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['favorite:read', 'listing:item:read'])]
    // 💡 PAS DANS 'favorite:create' : Défini par le processeur pour la sécurité
    private ?User $favoriteUser = null;

    // L'annonce mise en favori
    #[ORM\ManyToOne(inversedBy: 'favoriteListings')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['favorite:read', 'favorite:create', 'user:read'])]
    #[Assert\NotNull]
    private ?Listing $listing = null; // URI du listing fournie par l'utilisateur

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
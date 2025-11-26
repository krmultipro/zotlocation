<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Repository\ReviewRepository;
use App\State\ReviewAuthorProcessor; // 💡 PROCESSEUR NÉCESSAIRE (à créer)
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ReviewRepository::class)]
#[ORM\Table(name: 'review')]
#[ApiResource(
    operations: [
        // GET Collection : Accessible à TOUS
        new GetCollection(normalizationContext: ['groups' => ['review:read']]),

        // GET Item : Accessible à TOUS
        new Get(normalizationContext: ['groups' => ['review:read', 'review:item:read']]),

        // POST : Création par un utilisateur connecté
        new Post(
            processor: ReviewAuthorProcessor::class, // 💡 Définit l'auteur = utilisateur connecté
            security: "is_granted('ROLE_USER')",
            denormalizationContext: ['groups' => ['review:create']]
        ),

        // PATCH : Modification par l'auteur ou ADMIN
        new Patch(
            security: "is_granted('ROLE_ADMIN') or object.getAuthor() == user",
            denormalizationContext: ['groups' => ['review:update']]
        ),

        // DELETE : Suppression par l'auteur ou ADMIN
        new Delete(security: "is_granted('ROLE_ADMIN') or object.getAuthor() == user"),
    ],
    // Groupes de sérialisation par défaut
    normalizationContext: ['groups' => ['review:read']],
)]
class Review
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['review:read', 'listing:item:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['review:read', 'review:create', 'review:update', 'listing:item:read'])]
    #[Assert\NotBlank]
    #[Assert\Range(
        min: 1,
        max: 5,
        notInRangeMessage: "La note doit être comprise entre 1 et 5 étoiles."
    )]
    private ?int $rating = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['review:read', 'review:create', 'review:update', 'listing:item:read'])]
    #[Assert\Length(
        max: 500,
        maxMessage: "Le commentaire ne peut pas dépasser {{ limit }} caractères."
    )]
    private ?string $comment = null;

    // Relation ManyToOne avec Listing
    #[ORM\ManyToOne(inversedBy: 'reviews')]
    #[Groups(['review:read', 'review:create'])] // On fournit l'URI du Listing à la création
    #[Assert\NotNull]
    private ?Listing $listing = null;

    // Relation ManyToOne avec User (Author)
    #[ORM\ManyToOne(inversedBy: 'reviews')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['review:read', 'listing:item:read'])]
    // 💡 PAS DANS 'review:create' : Défini par le processeur pour la sécurité
    private ?User $author = null;

    // ... (Reste des Getters et Setters inchangés) ...
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRating(): ?int
    {
        return $this->rating;
    }

    public function setRating(int $rating): static
    {
        $this->rating = $rating;
        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;
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

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;
        return $this;
    }
}
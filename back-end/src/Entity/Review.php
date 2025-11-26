<?php

namespace App\Entity;

use App\Repository\ReviewRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ReviewRepository::class)]
#[ORM\Table(name: 'review')] // Convention : nom de table en minuscule et singulier
class Review
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // 1. Renommage: rating_review -> rating (CamelCase, suppression du préfixe)
    #[ORM\Column]
    private ?int $rating = null;

    // 2. Renommage: comment_review -> comment (CamelCase, suppression du préfixe)
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $comment = null;

    // Relation 3: Un avis concerne un seul Listing (One Listing <- Many Reviews)
    // Relation correcte. InversedBy 'reviews' est cohérent avec l'entité Listing attendue.
    #[ORM\ManyToOne(inversedBy: 'reviews')]
    private ?Listing $listing = null;

    // Relation 4: Un avis est écrit par un seul User (One User <- Many Reviews)
    // Renommage: $utilisateur -> $author pour correspondre à la propriété 'author' utilisée dans l'entité User (mappedBy: 'author').
    #[ORM\ManyToOne(inversedBy: 'reviews')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $author = null; // Renommé pour plus de clarté

    public function getId(): ?int
    {
        return $this->id;
    }

    // --- GETTERS & SETTERS CORRIGÉS ---

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

    // --- RELATIONS ---

    public function getListing(): ?Listing
    {
        return $this->listing;
    }

    public function setListing(?Listing $listing): static
    {
        $this->listing = $listing;
        return $this;
    }

    // Renommage du getter/setter
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
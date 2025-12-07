<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\ImageRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ImageRepository::class)]
#[ORM\Table(name: 'image')]
#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['image:read']]),
        new GetCollection(normalizationContext: ['groups' => ['image:read']]),
        new Post(
            security: "is_granted('ROLE_PROPRIETAIRE')",
            denormalizationContext: ['groups' => ['image:create']]
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getListing().getOwner() == user"
        )
    ],
    normalizationContext: ['groups' => ['image:read']],
    denormalizationContext: ['groups' => ['image:write']],
)]
class Image
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['image:read', 'listing:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    // 💡 CORRECTION : Ajout du groupe 'listing:card:read'
    #[Groups(['image:read', 'image:create', 'listing:read', 'listing:create', 'listing:card:read'])]
    #[Assert\NotBlank(message: "L'URL de l'image est obligatoire.")]
    #[Assert\Url(message: "Ceci n'est pas une URL valide.")]
    private ?string $url = null;

    // Relation ManyToOne avec Listing
    #[ORM\ManyToOne(inversedBy: 'images')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['image:create'])]
    #[Assert\NotNull(message: "L'image doit être associée à un Listing.")]
    private ?Listing $listing = null;

    // ... (Getters & Setters) ...
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(string $url): static
    {
        $this->url = $url;

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
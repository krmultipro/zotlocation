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
use Symfony\Component\Validator\Constraints as Assert; // 💡 NOUVEAU

#[ORM\Entity(repositoryClass: ImageRepository::class)]
#[ORM\Table(name: 'image')]
#[ApiResource(
    // 💡 Exposition de l'entité à l'API
    operations: [
        // GET (Lecture) : Accessible à tous
        new Get(normalizationContext: ['groups' => ['image:read']]),
        new GetCollection(normalizationContext: ['groups' => ['image:read']]),

        // POST (Création) : SEULEMENT si l'utilisateur est 'ROLE_PROPRIETAIRE' ou ADMIN
        new Post(
            security: "is_granted('ROLE_PROPRIETAIRE')",
            denormalizationContext: ['groups' => ['image:create']]
        ),

        // DELETE (Suppression) : SEULEMENT si l'utilisateur est le propriétaire du Listing associé ou ADMIN
        new Delete(
            // Assure que l'utilisateur est l'owner du listing OU admin
            security: "is_granted('ROLE_ADMIN') or object.getListing().getOwner() == user"
        )
    ],
    // Définition des groupes par défaut pour une meilleure cohérence
    normalizationContext: ['groups' => ['image:read']],
    denormalizationContext: ['groups' => ['image:write']],
)]
class Image
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['image:read', 'listing:read'])] // L'ID est visible dans l'image et dans le Listing
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['image:read', 'image:create', 'listing:read', 'listing:create'])] // 💡 Ajout des groupes
    #[Assert\NotBlank(message: "L'URL de l'image est obligatoire.")] // 💡 Validation
    #[Assert\Url(message: "Ceci n'est pas une URL valide.")] // 💡 Validation
    private ?string $url = null;

    // Relation ManyToOne avec Listing
    #[ORM\ManyToOne(inversedBy: 'images')]
    #[ORM\JoinColumn(nullable: false)]
    // 💡 L'URI du listing est requis lors de la création d'une image
    #[Groups(['image:create'])]
    #[Assert\NotNull(message: "L'image doit être associée à un Listing.")] // 💡 Validation
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
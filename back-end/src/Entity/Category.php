<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\CategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CategoryRepository::class)]
#[ORM\Table(name: 'category')]
#[ApiResource(
    normalizationContext: ['groups' => ['category:read']], // Groupes pour la lecture (GET)
    denormalizationContext: ['groups' => ['category:write']],     // Définition des groupes de sérialisation pour un meilleur contrôle
// Groupes pour l'écriture (POST/PUT/PATCH)
    operations: [
        // Route pour obtenir la collection (GET /api/categories)
        new GetCollection(normalizationContext: ['groups' => ['category:read']]),
        // Route pour obtenir un élément spécifique (GET /api/categories/{id})
        new Get(),
        // Route pour obtenir la collection (GET /api/categories)
        new Get(uriTemplate: '/categories'),
        // Route pour créer un nouvel élément (POST /api/categories)
        new Post(),
        // Route pour remplacer un élément existant (PUT /api/categories/{id})
        new Put(),
        // Route pour modifier partiellement un élément (PATCH /api/categories/{id})
        new Patch(),
        // Route pour supprimer un élément (DELETE /api/categories/{id})
        new Delete(),
    ],

)]
class Category
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['category:read', 'listing:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['category:read', 'category:write', 'listing:read'])]
    private ?string $name = null;

    /**
     * @var Collection<int, Listing>
     */
    #[ORM\OneToMany(
        targetEntity: Listing::class,
        mappedBy: 'category',
        orphanRemoval: true
    )]
    private Collection $listings;

    public function __construct()
    {
        $this->listings = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return Collection<int, Listing>
     */
    public function getListings(): Collection
    {
        return $this->listings;
    }

    public function addListing(Listing $listing): static
    {
        if (!$this->listings->contains($listing)) {
            $this->listings->add($listing);
            if ($listing->getCategory() !== $this) {
                $listing->setCategory($this);
            }
        }

        return $this;
    }

    public function removeListing(Listing $listing): static
    {
        if ($this->listings->removeElement($listing)) {
            if ($listing->getCategory() === $this) {
                $listing->setCategory(null);
            }
        }

        return $this;
    }
}
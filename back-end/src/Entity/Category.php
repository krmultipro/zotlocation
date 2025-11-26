<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource; // NOUVEAU : Importer ApiResource
use App\Repository\CategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups; // NOUVEAU : Importer les Groups de Serializer

#[ORM\Entity(repositoryClass: CategoryRepository::class)]
#[ORM\Table(name: 'category')]
// NOUVEAU : Déclaration ApiResource pour exposer l'entité via l'API
#[ApiResource(
    // Configuration simple des opérations (GET, POST, PUT/PATCH, DELETE)
    // Permet d'accéder à l'entité via /api/categories
    operations: [], // Utilise les opérations par défaut (GET collection, GET item, POST, PUT, DELETE)

    // Définition des groupes de sérialisation pour un meilleur contrôle
    normalizationContext: ['groups' => ['category:read']],
    denormalizationContext: ['groups' => ['category:write']]
)]
class Category
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    // Utiliser le groupe de lecture pour que l'ID soit toujours inclus dans les réponses GET
    #[Groups(['category:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    // Le nom est lisible et modifiable
    #[Groups(['category:read', 'category:write', 'listing:read'])] // 'listing:read' si vous voulez voir le nom dans l'entité Listing
    private ?string $name = null;

    /**
     * @var Collection<int, Listing>
     */
    // Relation OneToMany vers Listing
    #[ORM\OneToMany(targetEntity: Listing::class, mappedBy: 'category', orphanRemoval: true)]
    // NE PAS inclure 'category:read' ici si vous voulez éviter la récursivité infinie.
    // Par défaut, API Platform ne sérialise pas les relations OneToMany/ManyToMany
    // Si vous voulez la liste des IDs des listings, utilisez un groupe spécifique (e.g. 'category:detail')
    private Collection $listings;

    // ... (Le constructeur et les méthodes restent inchangés) ...

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
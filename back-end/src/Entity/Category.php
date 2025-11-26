<?php

namespace App\Entity;

use App\Repository\CategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CategoryRepository::class)]
#[ORM\Table(name: 'category')] // Convention : nom de table en minuscule et singulier
class Category
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // 1. Renommage: name_category -> name (CamelCase, suppression du préfixe)
    #[ORM\Column(length: 255)]
    private ?string $name = null;

    /**
     * @var Collection<int, Listing>
     */
    // Relation OneToMany vers Listing (mappedBy 'category' est cohérent avec Listing.category)
    #[ORM\OneToMany(targetEntity: Listing::class, mappedBy: 'category', orphanRemoval: true)]
    private Collection $listings;

    public function __construct()
    {
        $this->listings = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    // --- GETTERS & SETTERS CORRIGÉS ---

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    // --- RELATIONS ---

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
            // Assurez-vous que la relation inverse est définie
            $listing->setCategory($this);
        }

        return $this;
    }

    public function removeListing(Listing $listing): static
    {
        if ($this->listings->removeElement($listing)) {
            // set the owning side to null (unless already changed)
            if ($listing->getCategory() === $this) {
                $listing->setCategory(null);
            }
        }

        return $this;
    }
}
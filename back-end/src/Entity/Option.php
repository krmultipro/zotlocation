<?php

namespace App\Entity;

use App\Repository\OptionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OptionRepository::class)]
#[ORM\Table(name: 'option_listing')] // Nom de table explicite car 'option' est un mot clé SQL
class Option
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // 1. Renommage: name_option -> name (CamelCase, suppression du préfixe)
    #[ORM\Column(length: 255)]
    private ?string $name = null;

    /**
     * @var Collection<int, Listing>
     */
    // Côté INVERSE de la relation Listing <-> Option.
    // MappedBy doit correspondre au nom de la propriété sur l'entité Listing (qui sera la côté propriétaire).
    #[ORM\ManyToMany(targetEntity: Listing::class, mappedBy: 'options')]
    private Collection $listings;

    /**
     * @var Collection<int, User>
     */
    // Côté INVERSE de la relation User <-> Option.
    // MappedBy doit correspondre au nom de la propriété sur l'entité User (qui est la côté propriétaire).
    #[ORM\ManyToMany(targetEntity: User::class, mappedBy: 'options')]
    private Collection $users;

    public function __construct()
    {
        $this->listings = new ArrayCollection();
        $this->users = new ArrayCollection();
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
        }

        return $this;
    }

    public function removeListing(Listing $listing): static
    {
        $this->listings->removeElement($listing);
        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): static
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
        }

        return $this;
    }

    public function removeUser(User $user): static
    {
        $this->users->removeElement($user);
        return $this;
    }
}
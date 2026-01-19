<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\LocalisationRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: LocalisationRepository::class)]
#[ApiResource]
class Localisation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['listing:read', 'listing:item:read', 'listing:card:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['listing:read', 'listing:item:read', 'listing:card:read'])]
    private ?string $name = null;

    /**
     * Note : Nous n'ajoutons pas la propriété $listings ici (relation unidirectionnelle).
     * Cela évite les erreurs de chargement (hydratation) dans Doctrine
     * tout en permettant d'afficher le nom de la ville sur chaque annonce.
     */

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
}
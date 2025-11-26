<?php

namespace App\Entity;

use App\Repository\ProfileRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProfileRepository::class)]
#[ORM\Table(name: 'profile')] // Convention : nom de table en minuscule et singulier
class Profile
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // 1. Renommage: name_profile -> fullName (ou simple 'name')
    // J'ai choisi 'fullName' car 'name' est déjà utilisé sur l'entité User.
    #[ORM\Column(length: 255)]
    private ?string $fullName = null;

    // 2. Ajout de la relation OneToOne avec User
    // C'est le côté "propriétaire" de la relation (la clé étrangère sera sur la table 'profile').
    #[ORM\OneToOne(inversedBy: 'profile', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)] // Un profil doit obligatoirement être lié à un utilisateur
    private ?User $user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    // --- GETTERS & SETTERS CORRIGÉS ---

    public function getFullName(): ?string
    {
        return $this->fullName;
    }

    public function setFullName(string $fullName): static
    {
        $this->fullName = $fullName;

        return $this;
    }

    // --- RELATION USER ---

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;

        return $this;
    }
}
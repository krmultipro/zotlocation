<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Patch;
use App\Repository\ProfileRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ProfileRepository::class)]
#[ORM\Table(name: 'profile')]
#[ApiResource(
    operations: [
        // GET Item : Accès restreint au propriétaire du profil (ou ADMIN)
        new Get(
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user",
            normalizationContext: ['groups' => ['profile:read', 'user:read']]
        ),

        // PATCH : Modification restreinte au propriétaire du profil (ou ADMIN)
        new Patch(
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user",
            denormalizationContext: ['groups' => ['profile:update']]
        ),
    ],
    normalizationContext: ['groups' => ['profile:read']],
)]
class Profile
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['profile:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['profile:read', 'profile:update'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 3)]
    private ?string $fullName = null;

    // Relation OneToOne avec User
    // C'est le côté "propriétaire"
    #[ORM\OneToOne(inversedBy: 'profile', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['profile:read'])]
    private ?User $user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    // --- GETTERS & SETTERS ---

    public function getFullName(): ?string
    {
        return $this->fullName;
    }

    public function setFullName(string $fullName): static
    {
        $this->fullName = $fullName;

        return $this;
    }

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
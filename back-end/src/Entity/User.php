<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\UserRepository;
use App\State\UserPasswordHasher;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '"user"')]
#[ApiResource(
    operations: [
        new GetCollection(security: "is_granted('ROLE_ADMIN')"),
        new Post(processor: UserPasswordHasher::class, validationContext: ['groups' => ['Default', 'user:create']]),
        new Get(security: "is_granted('ROLE_ADMIN') or object == user"),
        new Put(processor: UserPasswordHasher::class, security: "object == user"),
        new Patch(processor: UserPasswordHasher::class, security: "object == user"),
        new Delete(security: "is_granted('ROLE_ADMIN') or object == user"),
    ],
    normalizationContext: ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:create', 'user:update']],
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    // Ajout de 'listing:item:read'
    #[Groups(['user:read', 'listing:read', 'booking:read', 'review:read', 'listing:item:read'])]
    #[Assert\NotBlank]
    private ?string $name = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Groups(['user:read', 'user:create', 'user:update'])]
    #[Assert\Email]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[Groups(['user:create', 'user:update'])]
    #[Assert\NotBlank(groups: ['user:create'])]
    private ?string $plainPassword = null;

    #[Groups(['user:create'])]
    private ?bool $isOwner = false;

    #[ORM\Column(type: 'json')]
    #[Groups(['user:read'])]
    private array $roles = [];

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read', 'user:create', 'user:update'])]
    #[Assert\Url(
        protocols: ['http', 'https'],
        message: 'Veuillez fournir une URL valide pour l\'avatar.'
    )]
    private ?string $avatar = null;

    /**
     * @var Collection<int, Listing>
     */
    #[ORM\OneToMany(targetEntity: Listing::class, mappedBy: 'owner', orphanRemoval: true)]
    private Collection $listings;

    /**
     * @var Collection<int, Booking>
     */
    #[ORM\OneToMany(targetEntity: Booking::class, mappedBy: 'booker', orphanRemoval: true)]
    private Collection $bookings;

    /**
     * @var Collection<int, Review>
     */
    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'author', orphanRemoval: true)]
    private Collection $reviews;

    /**
     * @var Collection<int, Option>
     */
    #[ORM\ManyToMany(targetEntity: Option::class, inversedBy: 'users')]
    private Collection $options;

    #[ORM\OneToOne(mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?Profile $profile = null;

    /**
     * @var Collection<int, Favorite>
     */
    #[ORM\OneToMany(targetEntity: Favorite::class, mappedBy: 'favoriteUser', orphanRemoval: true)]
    private Collection $favoritesUser;

    public function __construct()
    {
        $this->listings = new ArrayCollection();
        $this->bookings = new ArrayCollection();
        $this->reviews = new ArrayCollection();
        $this->options = new ArrayCollection();
        $this->roles = ['ROLE_USER'];
        $this->favoritesUser = new ArrayCollection();
    }



    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = '';
        return array_unique($roles);
    }


    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function eraseCredentials(): void
    {
        $this->plainPassword = null;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): self
    {
        $this->plainPassword = $plainPassword;
        return $this;
    }

    public function getIsOwner(): ?bool
    {
        return $this->isOwner;
    }

    public function setIsOwner(?bool $isOwner): self
    {
        $this->isOwner = $isOwner;
        return $this;
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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): static
    {
        if ($avatar && !filter_var($avatar, FILTER_VALIDATE_URL)) {
            throw new \InvalidArgumentException('L\'avatar doit être une URL valide.');
        }
        $this->avatar = $avatar;
        return $this;
    }

    public function getListings(): Collection
    {
        return $this->listings;
    }

    public function getProfile(): ?Profile
    {
        return $this->profile;
    }

    public function setProfile(Profile $profile): static
    {
        if ($profile->getUser() !== $this) {
            $profile->setUser($this);
        }
        $this->profile = $profile;
        return $this;
    }

    public function getFavoritesUser(): Collection
    {
        return $this->favoritesUser;
    }

    public function addFavoritesUser(Favorite $favoritesUser): static
    {
        if (!$this->favoritesUser->contains($favoritesUser)) {
            $this->favoritesUser->add($favoritesUser);
            $favoritesUser->setFavoriteUser($this);
        }
        return $this;
    }

    public function removeFavoritesUser(Favorite $favoritesUser): static
    {
        if ($this->favoritesUser->removeElement($favoritesUser)) {
            if ($favoritesUser->getFavoriteUser() === $this) {
                $favoritesUser->setFavoriteUser(null);
            }
        }
        return $this;
    }
}

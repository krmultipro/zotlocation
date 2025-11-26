<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'user')] // Convention : nom de table en minuscule et singulier
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Renommé: name_user -> name
    #[ORM\Column(length: 255)]
    private ?string $name = null;

    // Renommé: email_user -> email | Doit être unique pour l'authentification
    #[ORM\Column(length: 180, unique: true)]
    private ?string $email = null;

    // Renommé: password_user -> password | Nécessaire pour l'interface de sécurité
    #[ORM\Column(length: 255)]
    private ?string $password = null;

    // Renommé: role_user (boolean) -> roles (json) | Nécessaire pour l'interface de sécurité
    #[ORM\Column(type: 'json')]
    private array $roles = [];

    // Renommé: avatar_user -> avatar
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatar = null;

    /**
     * @var Collection<int, Listing>
     */
    // mappedBy: 'owner' (L'utilisateur est le propriétaire du Listing)
    #[ORM\OneToMany(targetEntity: Listing::class, mappedBy: 'owner', orphanRemoval: true)]
    private Collection $listings;

    /**
     * @var Collection<int, Booking>
     */
    // mappedBy: 'booker' (L'utilisateur est celui qui fait la réservation)
    #[ORM\OneToMany(targetEntity: Booking::class, mappedBy: 'booker', orphanRemoval: true)]
    private Collection $bookings;

    /**
     * @var Collection<int, Review>
     */
    // mappedBy: 'author' (L'utilisateur est l'auteur de l'avis)
    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'author', orphanRemoval: true)]
    private Collection $reviews;

    /**
     * @var Collection<int, Option>
     */
    // Relation ManyToMany pour les options (si l'utilisateur peut avoir des options/préférences)
    #[ORM\ManyToMany(targetEntity: Option::class, inversedBy: 'users')]
    private Collection $options;

    // OneToOne avec Profile (le champ de jointure est sur l'entité Profile)
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
        $this->roles = ['ROLE_USER']; // Rôle de base pour tous les nouveaux utilisateurs
        $this->favoritesUser = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    // --- INTERFACES DE SÉCURITÉ SYMFONY ---

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // Garantie qu'il y a toujours au moins un rôle
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // Si vous stockez des données sensibles non persistantes, nettoyez-les ici
        // $this->plainPassword = null;
    }

    /**
     * @see UserInterface
     * Le champ utilisé pour identifier l'utilisateur (email dans notre cas)
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    // --- GETTERS & SETTERS DES PROPRIÉTÉS ---

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
        $this->avatar = $avatar;
        return $this;
    }

    // --- GETTERS & SETTERS DES RELATIONS (Méthodes d'ajout/suppression) ---

    // (Les méthodes add/remove pour toutes les collections sont à implémenter ici)

    // Exemple pour Listings:
    public function getListings(): Collection
    {
        return $this->listings;
    }
    // ...
    // Ajoutez toutes les méthodes add/remove pour bookings, reviews, favorites, options, et profile
    // ...

    public function getProfile(): ?Profile
    {
        return $this->profile;
    }

    public function setProfile(Profile $profile): static
    {
        // set the owning side of the relation if necessary
        if ($profile->getUser() !== $this) {
            $profile->setUser($this);
        }
        $this->profile = $profile;
        return $this;
    }

    /**
     * @return Collection<int, Favorite>
     */
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
            // set the owning side to null (unless already changed)
            if ($favoritesUser->getFavoriteUser() === $this) {
                $favoritesUser->setFavoriteUser(null);
            }
        }

        return $this;
    }
}
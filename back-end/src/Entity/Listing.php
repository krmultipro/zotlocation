<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Filter\ListingAvailabilityFilter;
use App\Repository\ListingRepository;
use App\State\ListingOwnerProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ListingRepository::class)]
#[ORM\Table(name: 'listing')]
#[ORM\InheritanceType('JOINED')]
#[ORM\DiscriminatorColumn(name: 'type', type: 'string')]
#[ORM\DiscriminatorMap([
    'listing' => Listing::class,
    'house' => HouseListing::class,
    'apartment' => ApartmentListing::class
])]
#[ApiResource(
    paginationItemsPerPage: 5,
    paginationClientItemsPerPage: true,
    paginationMaximumItemsPerPage: 50,
    operations: [
        new GetCollection(
            uriTemplate: '/my-listings',
            security: "is_granted('ROLE_USER')",
            normalizationContext: ['groups' => ['listing:card:read']]
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['listing:card:read']]
        ),
        new Get(
            normalizationContext: ['groups' => ['listing:read', 'listing:item:read']]
        ),
        new Post(
            processor: ListingOwnerProcessor::class,
            security: "is_granted('ROLE_PROPRIETAIRE') or is_granted('ROLE_ADMIN')",
            denormalizationContext: ['groups' => ['listing:create']]
        ),
        new Patch(
            processor: ListingOwnerProcessor::class,
            security: "is_granted('ROLE_ADMIN') or object.getOwner() == user",
            denormalizationContext: ['groups' => ['listing:update']]
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getOwner() == user"
        ),
    ]
)]
#[ApiFilter(SearchFilter::class, properties: [
    'category' => 'exact',
    'capacity' => 'gte',
    'localisation' => 'exact'
])]
#[ApiFilter(ListingAvailabilityFilter::class)]
class Listing
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['listing:read', 'booking:read', 'review:read', 'listing:card:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['listing:read', 'listing:create', 'listing:update', 'listing:card:read', 'booking:read'])]
    #[Assert\NotBlank]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['listing:read', 'listing:item:read', 'listing:create', 'listing:update'])]
    #[Assert\NotBlank]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['listing:read', 'listing:create', 'listing:update', 'listing:card:read', 'booking:read'])]
    #[Assert\PositiveOrZero]
    private ?float $pricePerNight = null;

    #[ORM\Column]
    #[Groups(['listing:read', 'listing:create', 'listing:update', 'listing:card:read', 'booking:read'])]
    #[Assert\Positive]
    private ?int $capacity = null;

    #[ORM\ManyToOne(inversedBy: 'listings')]
    #[Groups(['booking:read', 'review:read', 'listing:item:read', 'listing:card:read'])]
    #[Assert\Valid]
    private ?User $owner = null;

    #[ORM\ManyToOne(inversedBy: 'listings')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['listing:create', 'listing:update', 'listing:card:read', 'listing:item:read', 'booking:read'])]
    #[Assert\NotNull]
    private ?Category $category = null;

    // 💡 RELATION UNIDIRECTIONNELLE (Solution du bug 500)
    #[ORM\ManyToOne(targetEntity: Localisation::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['listing:read', 'listing:item:read', 'listing:card:read', 'listing:create', 'listing:update'])]
    #[Assert\NotNull(message: "La localisation est obligatoire.")]
    private ?Localisation $localisation = null;

    #[ORM\OneToMany(targetEntity: Booking::class, mappedBy: 'listing', orphanRemoval: true)]
    #[Groups(['listing:item:read'])]
    private Collection $bookings;

    #[ORM\OneToMany(targetEntity: Image::class, mappedBy: 'listing', cascade: ['persist'], orphanRemoval: true)]
    #[Groups(['listing:read', 'listing:item:read', 'listing:create', 'listing:card:read', 'booking:read'])]
    #[Assert\Count(min: 1, minMessage: "Une annonce doit obligatoirement avoir au moins une image.")]
    private Collection $images;

    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'listing', orphanRemoval: true)]
    #[Groups(['listing:item:read', 'listing:card:read'])]
    private Collection $reviews;

    #[ORM\ManyToMany(targetEntity: Option::class, inversedBy: 'listings')]
    #[Groups(['listing:read', 'listing:create', 'listing:update'])]
    #[Assert\Count(min: 1, minMessage: "Vous devez sélectionner au moins une option.")]
    private Collection $options;

    #[ORM\OneToMany(targetEntity: Favorite::class, mappedBy: 'listing', orphanRemoval: true)]
    private Collection $favoriteListings;

    public function __construct()
    {
        $this->bookings = new ArrayCollection();
        $this->images = new ArrayCollection();
        $this->reviews = new ArrayCollection();
        $this->options = new ArrayCollection();
        $this->favoriteListings = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getTitle(): ?string { return $this->title; }
    public function setTitle(string $title): static { $this->title = $title; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(string $description): static { $this->description = $description; return $this; }
    public function getPricePerNight(): ?float { return $this->pricePerNight; }
    public function setPricePerNight(float $pricePerNight): static { $this->pricePerNight = $pricePerNight; return $this; }
    public function getCapacity(): ?int { return $this->capacity; }
    public function setCapacity(int $capacity): static { $this->capacity = $capacity; return $this; }
    public function getOwner(): ?User { return $this->owner; }
    public function setOwner(?User $owner): static { $this->owner = $owner; return $this; }
    public function getCategory(): ?Category { return $this->category; }
    public function setCategory(?Category $category): static { $this->category = $category; return $this; }

    public function getLocalisation(): ?Localisation { return $this->localisation; }
    public function setLocalisation(?Localisation $localisation): static { $this->localisation = $localisation; return $this; }

    public function getBookings(): Collection { return $this->bookings; }
    public function getImages(): Collection { return $this->images; }
    public function getReviews(): Collection { return $this->reviews; }
    public function getOptions(): Collection { return $this->options; }
    public function getFavoriteListings(): Collection { return $this->favoriteListings; }

    // Méthodes add/remove simplifiées pour l'espace
    public function addImage(Image $image): static { if (!$this->images->contains($image)) { $this->images->add($image); $image->setListing($this); } return $this; }
    public function addOption(Option $option): static { if (!$this->options->contains($option)) { $this->options->add($option); } return $this; }
}

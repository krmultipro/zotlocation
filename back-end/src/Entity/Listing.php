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
    operations: [
        // Route pour le Dashboard : "Mes annonces"
        new GetCollection(
            uriTemplate: '/my-listings',
            // On remplace openapiContext par openapi
            openapi: new \ApiPlatform\OpenApi\Model\Operation(
                summary: 'Récupère les annonces de l\'utilisateur connecté',
                description: 'Retourne uniquement les annonces appartenant au token JWT fourni.'
            ),
            security: "is_granted('ROLE_USER')",
            normalizationContext: ['groups' => ['listing:card:read']]
        ),

        // GET Collection standard (public)
        new GetCollection(
            normalizationContext: ['groups' => ['listing:card:read']]
        ),

        // GET Collection : Public
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
#[ApiFilter(SearchFilter::class, properties: ['category' => 'exact'])]
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

    #[ORM\OneToMany(targetEntity: Booking::class, mappedBy: 'listing', orphanRemoval: true)]
    #[Groups(['listing:item:read'])]
    private Collection $bookings;

    #[ORM\OneToMany(targetEntity: Image::class, mappedBy: 'listing', cascade: ['persist'], orphanRemoval: true)]
    #[Groups(['listing:read', 'listing:item:read', 'listing:create', 'listing:card:read', 'booking:read'])]
    #[Assert\Count(min: 1, minMessage: "Une annonce doit obligatoirement avoir au moins une image.")]
    private Collection $images;

    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'listing', orphanRemoval: true)]
    #[Groups(['listing:item:read'])]
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

    // --- GETTERS & SETTERS (Inchangés) ---
    public function getId(): ?int { return $this->id; }
    public function setId(?int $id): static { $this->id = $id; return $this; }
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
    public function getBookings(): Collection { return $this->bookings; }
    public function addBooking(Booking $booking): static { if (!$this->bookings->contains($booking)) { $this->bookings->add($booking); $booking->setListing($this); } return $this; }
    public function removeBooking(Booking $booking): static { if ($this->bookings->removeElement($booking) && $booking->getListing() === $this) { $booking->setListing(null); } return $this; }
    public function getImages(): Collection { return $this->images; }
    public function addImage(Image $image): static { if (!$this->images->contains($image)) { $this->images->add($image); $image->setListing($this); } return $this; }
    public function removeImage(Image $image): static { if ($this->images->removeElement($image) && $image->getListing() === $this) { $image->setListing(null); } return $this; }
    public function getReviews(): Collection { return $this->reviews; }
    public function addReview(Review $review): static { if (!$this->reviews->contains($review)) { $this->reviews->add($review); $review->setListing($this); } return $this; }
    public function removeReview(Review $review): static { if ($this->reviews->removeElement($review) && $review->getListing() === $this) { $review->setListing(null); } return $this; }
    public function getOptions(): Collection { return $this->options; }
    public function addOption(Option $option): static { if (!$this->options->contains($option)) { $this->options->add($option); } return $this; }
    public function removeOption(Option $option): static { $this->options->removeElement($option); return $this; }
    public function getFavoriteListings(): Collection { return $this->favoriteListings; }
    public function addFavoriteListing(Favorite $favoriteListing): static { if (!$this->favoriteListings->contains($favoriteListing)) { $this->favoriteListings->add($favoriteListing); $favoriteListing->setListing($this); } return $this; }
    public function removeFavoriteListing(Favorite $favoriteListing): static { if ($this->favoriteListings->removeElement($favoriteListing) && $favoriteListing->getListing() === $this) { $favoriteListing->setListing(null); } return $this; }
}
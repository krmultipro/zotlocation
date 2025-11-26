<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
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
        // GET Collection : Accessible à TOUS
        new GetCollection(
            normalizationContext: ['groups' => ['listing:read']]
        ),

        // GET Item : Accessible à TOUS
        new Get(
            normalizationContext: ['groups' => ['listing:read', 'listing:item:read']]
        ),

        // POST : SEULEMENT si 'ROLE_PROPRIETAIRE' & Utilisation du Processeur
        new Post(
            processor: ListingOwnerProcessor::class, // Assigne l'utilisateur connecté comme owner
            security: "is_granted('ROLE_PROPRIETAIRE')",
            denormalizationContext: ['groups' => ['listing:create']]
        ),

        // PATCH : SEULEMENT si l'utilisateur est le propriétaire ou un ADMIN
        new Patch(
            processor: ListingOwnerProcessor::class,
            security: "is_granted('ROLE_ADMIN') or object.getOwner() == user",
            denormalizationContext: ['groups' => ['listing:update']]
        ),

        // DELETE : SEULEMENT si l'utilisateur est le propriétaire ou un ADMIN
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getOwner() == user"
        ),
    ]
)]
class Listing
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['listing:read', 'booking:read', 'review:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['listing:read', 'listing:create', 'listing:update'])]
    #[Assert\NotBlank]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['listing:read', 'listing:item:read', 'listing:create', 'listing:update'])]
    #[Assert\NotBlank]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['listing:read', 'listing:create', 'listing:update'])]
    #[Assert\PositiveOrZero]
    private ?float $pricePerNight = null;

    #[ORM\Column]
    #[Groups(['listing:read', 'listing:create', 'listing:update'])]
    #[Assert\Positive]
    private ?int $capacity = null;

    // Relation ManyToOne avec User (Owner)
    #[ORM\ManyToOne(inversedBy: 'listings')]
    #[Groups(['listing:read', 'booking:read', 'review:read'])]
    #[Assert\Valid]
    private ?User $owner = null;

    // Relation ManyToOne avec Category
    #[ORM\ManyToOne(inversedBy: 'listings')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['listing:read', 'listing:create', 'listing:update'])]
    #[Assert\NotNull]
    private ?Category $category = null;

    /**
     * @var Collection<int, Booking>
     */
    #[ORM\OneToMany(targetEntity: Booking::class, mappedBy: 'listing', orphanRemoval: true)]
    #[Groups(['listing:item:read'])]
    private Collection $bookings;

    /**
     * @var Collection<int, Image>
     */
    #[ORM\OneToMany(targetEntity: Image::class, mappedBy: 'listing', cascade: ['persist'], orphanRemoval: true)]
    #[Groups(['listing:read', 'listing:item:read', 'listing:create'])]
    // OBLIGATOIRE : Au moins une image
    #[Assert\Count(
        min: 1,
        minMessage: "Une annonce doit obligatoirement avoir au moins une image."
    )]
    private Collection $images;

    /**
     * @var Collection<int, Review>
     */
    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'listing', orphanRemoval: true)]
    #[Groups(['listing:item:read'])]
    private Collection $reviews;

    /**
     * @var Collection<int, Option>
     */
    #[ORM\ManyToMany(targetEntity: Option::class, inversedBy: 'listings')]
    #[Groups(['listing:read', 'listing:create', 'listing:update'])]
    // OBLIGATOIRE : Au moins une option
    #[Assert\Count(
        min: 1,
        minMessage: "Vous devez sélectionner au moins une option pour cette annonce."
    )]
    private Collection $options;

    // ❌ LIGNE SUPPRIMÉE : La relation ManyToMany `$favoritedByUsers` qui causait le conflit
    // avec l'entité Favorite n'est plus présente ici.

    /**
     * @var Collection<int, Favorite>
     */
    #[ORM\OneToMany(targetEntity: Favorite::class, mappedBy: 'listing', orphanRemoval: true)]
    private Collection $favoriteListings;

    public function __construct()
    {
        $this->bookings = new ArrayCollection();
        $this->images = new ArrayCollection();
        $this->reviews = new ArrayCollection();
        $this->options = new ArrayCollection();
        // $this->favoritedByUsers = new ArrayCollection(); // ❌ Ligne retirée
        $this->favoriteListings = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): static
    {
        $this->id = $id;
        return $this;
    }

    // --- GETTERS & SETTERS PROPRIÉTÉS DE BASE ---

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getPricePerNight(): ?float
    {
        return $this->pricePerNight;
    }

    public function setPricePerNight(float $pricePerNight): static
    {
        $this->pricePerNight = $pricePerNight;
        return $this;
    }

    public function getCapacity(): ?int
    {
        return $this->capacity;
    }

    public function setCapacity(int $capacity): static
    {
        $this->capacity = $capacity;
        return $this;
    }

    // --- GETTERS & SETTERS RELATIONS ManyToOne ---

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        $this->owner = $owner;
        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): static
    {
        $this->category = $category;
        return $this;
    }

    // --- RELATIONS OneToMany : Bookings ---

    /**
     * @return Collection<int, Booking>
     */
    public function getBookings(): Collection
    {
        return $this->bookings;
    }

    public function addBooking(Booking $booking): static
    {
        if (!$this->bookings->contains($booking)) {
            $this->bookings->add($booking);
            $booking->setListing($this);
        }
        return $this;
    }

    public function removeBooking(Booking $booking): static
    {
        if ($this->bookings->removeElement($booking)) {
            if ($booking->getListing() === $this) {
                $booking->setListing(null);
            }
        }
        return $this;
    }

    // --- RELATIONS OneToMany : Images ---

    /**
     * @return Collection<int, Image>
     */
    public function getImages(): Collection
    {
        return $this->images;
    }

    public function addImage(Image $image): static
    {
        if (!$this->images->contains($image)) {
            $this->images->add($image);
            $image->setListing($this);
        }
        return $this;
    }

    public function removeImage(Image $image): static
    {
        if ($this->images->removeElement($image)) {
            if ($image->getListing() === $this) {
                $image->setListing(null);
            }
        }
        return $this;
    }

    // --- RELATIONS OneToMany : Reviews ---

    /**
     * @return Collection<int, Review>
     */
    public function getReviews(): Collection
    {
        return $this->reviews;
    }

    public function addReview(Review $review): static
    {
        if (!$this->reviews->contains($review)) {
            $this->reviews->add($review);
            $review->setListing($this);
        }
        return $this;
    }

    public function removeReview(Review $review): static
    {
        if ($this->reviews->removeElement($review)) {
            if ($review->getListing() === $this) {
                $review->setListing(null);
            }
        }
        return $this;
    }

    // --- RELATIONS ManyToMany : Options ---

    /**
     * @return Collection<int, Option>
     */
    public function getOptions(): Collection
    {
        return $this->options;
    }

    public function addOption(Option $option): static
    {
        if (!$this->options->contains($option)) {
            $this->options->add($option);
        }
        return $this;
    }

    public function removeOption(Option $option): static
    {
        $this->options->removeElement($option);
        return $this;
    }

    // --- RELATIONS VERS FAVORITE (entité de liaison) ---

    // ❌ Les méthodes add/removeFavoritedByUser ont été supprimées.

    /**
     * @return Collection<int, Favorite>
     */
    public function getFavoriteListings(): Collection
    {
        return $this->favoriteListings;
    }

    public function addFavoriteListing(Favorite $favoriteListing): static
    {
        if (!$this->favoriteListings->contains($favoriteListing)) {
            $this->favoriteListings->add($favoriteListing);
            $favoriteListing->setListing($this);
        }

        return $this;
    }

    public function removeFavoriteListing(Favorite $favoriteListing): static
    {
        if ($this->favoriteListings->removeElement($favoriteListing)) {
            if ($favoriteListing->getListing() === $this) {
                $favoriteListing->setListing(null);
            }
        }

        return $this;
    }
}
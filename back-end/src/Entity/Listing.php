<?php

namespace App\Entity;

use App\Repository\ListingRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ListingRepository::class)]
#[ORM\Table(name: 'listing')]
#[ORM\InheritanceType('JOINED')]
#[ORM\DiscriminatorColumn(name: 'type', type: 'string')]
#[ORM\DiscriminatorMap([
    'listing' => Listing::class,
    'house' => HouseListing::class,
    'apartment' => ApartmentListing::class
])]
abstract class Listing
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Renommage: title_listing -> title
    #[ORM\Column(length: 255)]
    private ?string $title = null;

    // Renommage: description_listing -> description
    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    // Renommage: pricePerNight_listing -> pricePerNight
    #[ORM\Column]
    private ?float $pricePerNight = null;

    // Renommage: capacity_listing -> capacity
    #[ORM\Column]
    private ?int $capacity = null;

    // Relation ManyToOne avec User
    #[ORM\ManyToOne(inversedBy: 'listings')]
    private ?User $owner = null;

    // Relation ManyToOne avec Category
    #[ORM\ManyToOne(inversedBy: 'listings')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Category $category = null;

    /**
     * @var Collection<int, Booking>
     */
    #[ORM\OneToMany(targetEntity: Booking::class, mappedBy: 'listing', orphanRemoval: true)]
    private Collection $bookings;

    /**
     * @var Collection<int, Image>
     */
    #[ORM\OneToMany(targetEntity: Image::class, mappedBy: 'listing', orphanRemoval: true)]
    private Collection $images;

    /**
     * @var Collection<int, Review>
     */
    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'listing', orphanRemoval: true)]
    private Collection $reviews;

    /**
     * @var Collection<int, Option>
     */
    #[ORM\ManyToMany(targetEntity: Option::class, inversedBy: 'listings')]
    private Collection $options;

    /**
     * @var Collection<int, User>
     */
    // Côté INVERSE de la relation User <-> Listing (mappedBy: 'favorites' sur User)
    #[ORM\ManyToMany(targetEntity: User::class, mappedBy: 'favorites')]
    private Collection $favoritedByUsers;

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
        $this->favoritedByUsers = new ArrayCollection();
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

    // --- RELATIONS ManyToMany : FavoritedByUsers (Favorites) ---

    public function getFavoritedByUsers(): Collection
    {
        return $this->favoritedByUsers;
    }

    public function addFavoritedByUser(User $user): static
    {
        if (!$this->favoritedByUsers->contains($user)) {
            $this->favoritedByUsers->add($user);
        }
        return $this;
    }

    public function removeFavoritedByUser(User $user): static
    {
        $this->favoritedByUsers->removeElement($user);
        return $this;
    }

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
            // set the owning side to null (unless already changed)
            if ($favoriteListing->getListing() === $this) {
                $favoriteListing->setListing(null);
            }
        }

        return $this;
    }
}
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
use App\Repository\BookingRepository;
use App\State\BookingValidatorProcessor; // Processeur de validation
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ORM\Table(name: 'booking')]

#[ApiResource(
    operations: [
        // 1. Endpoint pour récupérer toutes les bookings (pour l'affichage du calendrier)
        new GetCollection(
            // 💡 CORRECTION CRITIQUE : Permettre l'accès public pour que le Front-end puisse charger les dates réservées.
            security: "is_granted('PUBLIC_ACCESS')",
            normalizationContext: ['groups' => ['booking:read']],
        ),

        // 2. GET Item (Lecture d'une seule réservation)
        new Get(
            security: "is_granted('ROLE_ADMIN') or object.getBooker() == user or object.getListing().getOwner() == user",
            normalizationContext: ['groups' => ['booking:read', 'booking:item:read']]
        ),

        // 3. POST (Création d'une réservation)
        new Post(
            security: "is_granted('ROLE_USER')",
            processor: BookingValidatorProcessor::class,
            denormalizationContext: ['groups' => ['booking:create']]
        ),

        // 4. PATCH (Mise à jour d'une réservation)
        new Patch(
            security: "is_granted('ROLE_ADMIN') or object.getBooker() == user",
            denormalizationContext: ['groups' => ['booking:update']]
        ),

        // 5. DELETE (Suppression d'une réservation)
        new Delete(security: "is_granted('ROLE_ADMIN') or object.getBooker() == user"),
    ],
    normalizationContext: ['groups' => ['booking:read']],
    denormalizationContext: ['groups' => ['booking:create', 'booking:update']],
)]

#[ApiFilter(SearchFilter::class, properties: [
    'listing' => 'exact',
])]
#[Assert\Expression(
    "this.getEndDate() > this.getStartDate()",
    message: "La date de fin de la réservation doit être postérieure à la date de début."
)]
class Booking
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['booking:read', 'listing:item:read'])]
    private ?int $id = null;

    // Dates
    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Groups(['booking:read', 'booking:create', 'booking:update', 'listing:item:read'])]
    #[Assert\NotBlank]
    #[Assert\GreaterThanOrEqual('today', message: "La date de début ne peut pas être dans le passé.", groups: ['booking:create'])]
    private ?\DateTimeInterface $startDate = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Groups(['booking:read', 'booking:create', 'booking:update', 'listing:item:read'])]
    #[Assert\NotBlank]
    private ?\DateTimeInterface $endDate = null;

    // Prix
    #[ORM\Column]
    #[Groups(['booking:read', 'booking:item:read'])]
    #[Assert\PositiveOrZero]
    private ?float $totalPrice = null;

    // Relation ManyToOne avec Listing
    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['booking:read', 'booking:create'])]
    #[Assert\NotNull]
    private ?Listing $listing = null;

    // Relation ManyToOne avec User (Booker)
    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['booking:read', 'listing:item:read'])]
    private ?User $booker = null;

    // --- Getters et Setters ---

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStartDate(): ?\DateTimeInterface
    {
        return $this->startDate;
    }

    public function setStartDate(\DateTimeInterface $startDate): static
    {
        $this->startDate = $startDate;
        return $this;
    }

    public function getEndDate(): ?\DateTimeInterface
    {
        return $this->endDate;
    }

    public function setEndDate(\DateTimeInterface $endDate): static
    {
        $this->endDate = $endDate;
        return $this;
    }

    // Propriété calculée : DURATION
    #[Groups(['booking:read'])]
    public function getDuration(): ?int
    {
        if (!$this->startDate || !$this->endDate) {
            return null;
        }

        $interval = $this->startDate->diff($this->endDate);
        return (int) $interval->days;
    }

    // --- Reste des getters et setters inchangés ---

    public function getTotalPrice(): ?float
    {
        return $this->totalPrice;
    }

    public function setTotalPrice(float $totalPrice): static
    {
        $this->totalPrice = $totalPrice;
        return $this;
    }

    public function getListing(): ?Listing
    {
        return $this->listing;
    }

    public function setListing(?Listing $listing): static
    {
        $this->listing = $listing;
        return $this;
    }

    public function getBooker(): ?User
    {
        return $this->booker;
    }

    public function setBooker(?User $booker): static
    {
        $this->booker = $booker;
        return $this;
    }
}
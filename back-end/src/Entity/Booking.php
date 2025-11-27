<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Repository\BookingRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ORM\Table(name: 'booking')]

#[ApiResource(
    operations: [
        // GET Collection : Seulement ADMIN peut voir toutes les bookings
        new GetCollection(security: "is_granted('ROLE_ADMIN')"),

        // GET Item : Booker, Owner du Listing ou ADMIN
        new Get(
            security: "is_granted('ROLE_ADMIN') or object.getBooker() == user or object.getListing().getOwner() == user",
            normalizationContext: ['groups' => ['booking:read', 'booking:item:read']]
        ),

        // POST : Tout utilisateur connecté peut créer une réservation
        new Post(
            // Le Booker sera l'utilisateur connecté (on le set dans un processeur si nécessaire, mais on assume la relation dans le denormalization)
            security: "is_granted('ROLE_USER')",
            denormalizationContext: ['groups' => ['booking:create']]
        ),

        // PATCH : Seul l'auteur peut modifier sa réservation (pourrait être limité aux dates, pas au listing)
        new Patch(
            security: "is_granted('ROLE_ADMIN') or object.getBooker() == user",
            denormalizationContext: ['groups' => ['booking:update']]
        ),

        // DELETE : Seul l'auteur peut annuler
        new Delete(security: "is_granted('ROLE_ADMIN') or object.getBooker() == user"),
    ],
    // Groupes de sérialisation par défaut
    normalizationContext: ['groups' => ['booking:read']],
    denormalizationContext: ['groups' => ['booking:create', 'booking:update']],
)]
// 💡 Assertion globale : la date de fin doit être après la date de début
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
    #[Groups(['booking:read', 'booking:create', 'booking:update'])]
    #[Assert\NotBlank]
    #[Assert\GreaterThanOrEqual('today', message: "La date de début ne peut pas être dans le passé.", groups: ['booking:create'])]
    private ?\DateTimeInterface $startDate = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Groups(['booking:read', 'booking:create', 'booking:update'])]
    #[Assert\NotBlank]
    private ?\DateTimeInterface $endDate = null;

    // Prix
    #[ORM\Column]
    #[Groups(['booking:read', 'booking:item:read'])]
    #[Assert\PositiveOrZero]
    // 💡 REMARQUE : totalPrice n'est PAS en denormalisation ('create', 'update'), car il doit être calculé
    // par un Data Transformer ou un Event Listener (EventListener) pour éviter la fraude.
    private ?float $totalPrice = null;

    // Relation ManyToOne avec Listing
    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['booking:read', 'booking:create'])] // On donne l'URI du Listing à la création
    #[Assert\NotNull]
    private ?Listing $listing = null;

    // Relation ManyToOne avec User (Booker)
    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['booking:read', 'listing:item:read'])]
    // 💡 REMARQUE : Booker n'est PAS en denormalisation ('create') car il doit être défini
    // automatiquement comme l'utilisateur connecté (via un Processeur, comme pour Listing Owner).
    private ?User $booker = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    // --- GETTERS & SETTERS ---

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

    public function getTotalPrice(): ?float
    {
        return $this->totalPrice;
    }

    public function setTotalPrice(float $totalPrice): static
    {
        $this->totalPrice = $totalPrice;
        return $this;
    }

    // --- RELATIONS ---

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
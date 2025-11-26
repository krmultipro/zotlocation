<?php

namespace App\Entity;

use App\Repository\BookingRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ORM\Table(name: 'booking')] // Convention : nom de table en minuscule et singulier
class Booking
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // 1. Renommage: start_date -> startDate (CamelCase)
    // 2. Utilisation de DateTimeImmutable recommandée (immutable)
    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private ?\DateTimeInterface $startDate = null;

    // 1. Renommage: end_date -> endDate (CamelCase)
    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private ?\DateTimeInterface $endDate = null;

    // 1. Renommage: total_price -> totalPrice (CamelCase)
    #[ORM\Column]
    private ?float $totalPrice = null;

    // Relation ManyToOne avec Listing (inversedBy 'bookings' est cohérent)
    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Listing $listing = null; // Un booking doit être lié à un listing

    // Relation ManyToOne avec User. Renommage: $utilisateur -> $booker (celui qui réserve)
    // Ceci correspond à la propriété 'booker' définie dans l'entité User (mappedBy: 'booker')
    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $booker = null; // Renommé pour plus de clarté et cohérence

    public function getId(): ?int
    {
        return $this->id;
    }

    // --- GETTERS & SETTERS CORRIGÉS ---

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
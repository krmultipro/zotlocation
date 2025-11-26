<?php

namespace App\Entity;

use App\Repository\ApartmentListingRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ApartmentListingRepository::class)]
class ApartmentListing extends Listing // Hérite de $id, Owner, etc.
{
    // RETIRER LE CODE SUIVANT :
    /*
    #[ORM\Id]
    #[ORM\OneToOne(targetEntity: Listing::class)]
    #[ORM\JoinColumn(name: 'id', referencedColumnName: 'id')]
    protected $id;
    */

    // Propriétés spécifiques : application du CamelCase
    #[ORM\Column]
    private ?bool $balcony = null;

    #[ORM\Column]
    private ?int $numberOfRooms = null;

    // L'ID est géré par la jointure.
    // NOTE: getId() est hérité de Listing, mais vous pouvez le laisser ici pour la clarté.
    public function getId(): ?int
    {
        // Retourne l'ID hérité de Listing
        return parent::getId();
    }

    // Le Setter de l'ID est également hérité de Listing.
    public function setId(?int $id): static
    {
        // Appelle le setter de Listing
        parent::setId($id);
        return $this;
    }

    // --- GETTERS & SETTERS PROPRIÉTÉS SPÉCIFIQUES ---

    public function isBalcony(): ?bool
    {
        return $this->balcony;
    }

    public function setBalcony(bool $balcony): static
    {
        $this->balcony = $balcony;
        return $this;
    }

    public function getNumberOfRooms(): ?int
    {
        return $this->numberOfRooms;
    }

    public function setNumberOfRooms(int $numberOfRooms): static
    {
        $this->numberOfRooms = $numberOfRooms;
        return $this;
    }
}
<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\OptionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups; // 💡 NOUVEAU
use Symfony\Component\Validator\Constraints as Assert; // 💡 NOUVEAU

#[ORM\Entity(repositoryClass: OptionRepository::class)]
#[ORM\Table(name: 'option_listing')]
#[ApiResource(
    operations: [
        // GET (Lecture) : Accessible à tous
        new Get(normalizationContext: ['groups' => ['option:read']]),
        new GetCollection(normalizationContext: ['groups' => ['option:read']]),

        // POST (Création) : Peut-être limité à ROLE_ADMIN si les options sont statiques
        new Post(
            // La sécurité dépend de qui peut créer/gérer les options (ADMIN est souvent préférable)
            // security: "is_granted('ROLE_ADMIN')",
            denormalizationContext: ['groups' => ['option:create']]
        ),
    ],
    normalizationContext: ['groups' => ['option:read']],
    denormalizationContext: ['groups' => ['option:write']]
)]
class Option
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['option:read', 'listing:read'])] // L'ID est visible dans l'option et dans le Listing
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['option:read', 'option:create', 'listing:read', 'listing:create'])] // 💡 Ajout des groupes
    #[Assert\NotBlank(message: "Le nom de l'option est obligatoire.")] // 💡 Validation
    private ?string $name = null;

    /**
     * @var Collection<int, Listing>
     */
    #[ORM\ManyToMany(targetEntity: Listing::class, mappedBy: 'options')]
    private Collection $listings;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, mappedBy: 'options')]
    private Collection $users;

    public function __construct()
    {
        $this->listings = new ArrayCollection();
        $this->users = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    /**
     * @return Collection<int, Listing>
     */
    public function getListings(): Collection
    {
        return $this->listings;
    }

    public function addListing(Listing $listing): static
    {
        if (!$this->listings->contains($listing)) {
            $this->listings->add($listing);
        }

        return $this;
    }

    public function removeListing(Listing $listing): static
    {
        $this->listings->removeElement($listing);
        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): static
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
        }

        return $this;
    }

    public function removeUser(User $user): static
    {
        $this->users->removeElement($user);
        return $this;
    }
}
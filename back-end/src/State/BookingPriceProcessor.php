<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Booking;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class BookingPriceProcessor implements ProcessorInterface
{
    public function __construct(
        private ProcessorInterface $persistProcessor,
        private Security $security,
        private EntityManagerInterface $em
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (!$data instanceof Booking) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        //  Récupération du listing
        $listing = $data->getListing();
        if (!$listing) {
            throw new \RuntimeException("Annonce manquante pour le calcul du prix");
        }

        //  Calcul du nombre de nuits
        $start = $data->getStartDate();
        $end = $data->getEndDate();
        $nightCount = $start->diff($end)->days;

        //  Prix final
        $total = $nightCount * $listing->getPricePerNight();

        //  Enregistrer le prix dans l'entité
        $data->setTotalPrice($total);

        // Définir automatiquement le booker = utilisateur connecté
        if ($this->security->getUser()) {
            $data->setBooker($this->security->getUser());
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}

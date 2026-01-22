<?php

namespace App\Controller;

use App\Repository\ListingRepository;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class HomeController extends AbstractController
{
    #[Route('/home', name: 'app_home')]
    public function index( LoggerInterface $logger, ListingRepository $listingRepository,): Response
    {

    $listings = $listingRepository->findAll();

    $logger->info('COUCOUUUUUUUUUUUU : ' .count($listings));

        return $this->render('home/index.html.twig', [
            'controller_name' => 'HomeController',
        ]);
    }
}

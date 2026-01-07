<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\String\Slugger\SluggerInterface;

class UploadImageController extends AbstractController
{
    #[Route('/api/upload-image', name: 'api_upload_image', methods: ['POST'])]
    public function __invoke(Request $request, SluggerInterface $slugger): JsonResponse
    {

        $file = $request->files->get('file');

        if (!$file) {
            return new JsonResponse(['error' => 'Aucun fichier reçu'], 400);
        }

        // Sécurisation du nom du fichier
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $slugger->slug($originalFilename);
        $newFilename = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();

        try {
            // Déplacement du fichier dans le dossier public
            $file->move(
                $this->getParameter('kernel.project_dir') . '/public/uploads/listings',
                $newFilename
            );
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Erreur lors de l\'enregistrement du fichier'], 500);
        }

        // Retourne l'URL relative
        return new JsonResponse([
            'url' => '/uploads/listings/' . $newFilename
        ]);
    }
}
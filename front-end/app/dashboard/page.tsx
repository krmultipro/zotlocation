"use client"

import { useUser } from "@/app/context/UserProvider";
import ReservationsPage from "@/app/dashboard/reservations/page";
import FavorisPage from "./favoris/page";
import LocationsPage from "./locations/page";

export default function DashboardPage() {
    // On récupère aussi isLoading pour gérer l'attente
    const { user, isLoading } = useUser()

    // 1. Protection pendant le chargement
    if (isLoading) {
        return <div className="py-20 text-center">Chargement de votre profil...</div>;
    }

    // 2. Protection si l'utilisateur n'est pas connecté
    if (!user) {
        return <div className="py-20 text-center">Veuillez vous connecter pour accéder au tableau de bord.</div>;
    }

    // 3. Calcul de la permission (avec parenthèses pour la priorité)
    const canSeeLocations = user.isOwner || user.roles?.includes('ROLE_PROPRIETAIRE') || user.roles?.includes('ROLE_ADMIN');

    return (
        <>
            <h1 className="mt-8 text-center text-3xl font-bold mb-6">
                Tableau de bord
            </h1>

            <ReservationsPage />

            <div className="mt-12">
                <FavorisPage />
            </div>

            {/* ✅ Utilisation de la variable canSeeLocations déjà protégée */}
            {canSeeLocations && (
                <div id="locations" className="mt-12">
                    <LocationsPage />
                </div>
            )}
        </>
    )
}
"use client"

import FavorisPage from "./favoris/page"
import LocationsPage from "./locations/page"
import ReservationsPage from "@/app/dashboard/reservations/page";
import {useUser} from "@/app/context/UserProvider";

export default function DashboardPage() {
    const { user } = useUser()


    return (   <>
      <h1 className="mt-8 text-center text-3xl font-bold mb-6">
        Tableau de bord
      </h1>
    
      <ReservationsPage />
           <div className="mt-12">
        <FavorisPage />
     
      </div>
      {user.isOwner || user.roles?.includes('ROLE_PROPRIETAIRE') && (
      <div className="mt-12">
         <LocationsPage />
      </div>  )}
    </>)

}
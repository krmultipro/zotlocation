import FavorisPage from "./favoris/page"
import LocationsPage from "./locations/page"
import ReservationsContent from "./reservations/ReservationsContent"

export default function ReservationsPage() {
  return (   <>
      <h1 className="mt-8 text-center text-3xl font-bold mb-6">
        Tableau de bord
      </h1>
    
      <ReservationsContent />
           <div className="mt-12">
        <FavorisPage />
     
      </div>
      <div className="mt-12">
         <LocationsPage />
      </div>
    </>)

}
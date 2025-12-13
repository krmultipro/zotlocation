// src/components/modals/BookingEditModal.tsx

"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { format, differenceInDays, addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import Modal from "@/components/modals/Modal";
import { Calendar } from "@/components/ui/calendar";

// ... (Interfaces inchangées) ...

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000";

const BookingEditModal: React.FC<BookingEditModalProps> = ({
  isOpen,
  booking,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [listingData, setListingData] = useState<ListingData | null>(null);

  // Initialiser la plage avec les dates existantes
  const initialRange = {
    from: new Date(booking.startDate.split('T')[0]),
    to: new Date(booking.endDate.split('T')[0]),
  };
  const [range, setRange] = useState<any>(initialRange);


  // --- 1. CHARGEMENT DES DONNÉES DE L'ANNONCE (et des dates réservées) ---
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoading(true);

      try {
        const res = await fetch(`${API_URL}/api/listings/${booking.listing.id}`);

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Échec du chargement de l'annonce (${res.status}). Détail: ${errorText.substring(0, 100)}...`);
        };

        const data = await res.json();
        setListingData(data);

      } catch (err: any) {
        console.error("ERREUR CRITIQUE DANS LE CHARGEMENT DE LA MODALE:", err);
        toast.error(err.message || "Erreur lors du chargement des données. Consultez la console.");
        onClose();

      } finally {
        setIsLoading(false);
      }
    };

    loadData();

  }, [booking.listing.id, onClose, isOpen]); // 💡 CORRECTION SYNTAXIQUE : Fin du useEffect


  // --- 2. CALCUL DES NOUVELLES DONNÉES ET DATES INDISPONIBLES ---

  const newDaysCount = useMemo(() => {
    if (!range?.from || !range?.to) return 0;

    const count = Math.ceil(differenceInDays(range.to, range.from));

    console.log(`[EditModal] Jours calculés: ${count}`);

    return count > 0 ? count : 0;
  }, [range]);

  const newTotalPrice = useMemo(() => {
    if (!listingData || newDaysCount <= 0) return 0;
    return newDaysCount * listingData.pricePerNight;
  }, [listingData, newDaysCount]);


  // Dates déjà réservées par les AUTRES utilisateurs (pour griser le calendrier)
  const disabledDates = useMemo(() => {
    if (!listingData) return [];

    const dates: Date[] = [{ before: addDays(new Date(), -1) }];

    listingData.bookings.forEach((b) => {
        if (b.id === booking.id) return;

        let start = new Date(b.startDate.split('T')[0]);
        let end = new Date(b.endDate.split('T')[0]);

        let loopDate = start;
        while (loopDate < end) {
            dates.push(new Date(loopDate));
            loopDate = addDays(loopDate, 1);
        }
    });

    return dates;
  }, [listingData, booking.id]);


  // --- 3. GESTION DE L'ENVOI (PATCH) ---
  const handleSubmit = useCallback(async () => {
    if (!listingData || newDaysCount <= 0) {
        toast.error("Veuillez sélectionner des dates valides (au moins une nuit).");
        return;
    }
    if (!range.from || !range.to) {
        toast.error("Veuillez sélectionner une plage de dates.");
        return;
    }

    setIsLoading(true);

    const token = localStorage.getItem("jwtToken");
    if (!token) {
        toast.error("Veuillez vous reconnecter.");
        setIsLoading(false);
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/bookings/${booking.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                // Envoyer les dates au format YYYY-MM-DD
                startDate: range.from.toISOString().split('T')[0],
                endDate: range.to.toISOString().split('T')[0],
            }),
        });

        if (!res.ok) {
             const errorData = await res.json();
             const errorMessage = errorData['hydra:description'] || "Erreur lors de la modification.";
             throw new Error(errorMessage);
        }

        toast.success("Réservation modifiée avec succès! Les nouvelles dates ont été enregistrées.");
        onSuccess();
        onClose();

    } catch (err: any) {
        console.error("Erreur de soumission de la modification:", err);
        toast.error(err.message || "Erreur lors de la modification de la réservation.");
    } finally {
        setIsLoading(false);
    }
  }, [booking.id, range, listingData, newDaysCount, onSuccess, onClose]);


  // --- 4. Rendu du contenu de la modale ---
  const bodyContent = (
    <div className="flex flex-col gap-4">

      {/* Calendrier intégré */}
      <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
        {isLoading
            ? <Loader2 className="animate-spin w-6 h-6 text-green-500" />
            : (
                <Calendar
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    numberOfMonths={1}
                    disabled={disabledDates}
                    className="rounded-md border [&_.rdp-day_selected]:bg-green-500 [&_.rdp-day_selected]:text-white"
                />
            )
        }
      </div>

      {/* Résumé du prix */}
      <div className="mt-2 p-4 border-t flex justify-between items-center font-bold">
        <span>Nouveau Prix Total:</span>
        {isLoading
            ? <Loader2 className="animate-spin w-4 h-4" />
            : <span>{newTotalPrice.toFixed(2)}€ ({newDaysCount} nuits)</span>
        }
      </div>
    </div>
  );

  // Rendu avec votre composant Modal
    return (
      <Modal
        isOpen={isOpen}
        title={""}
        actionLabel="Confirmer la Modification"
        onSubmit={handleSubmit}
        onClose={onClose}
        body={bodyContent}
        disabled={isLoading || newDaysCount <= 0}
      />
    );
  };

export default BookingEditModal;
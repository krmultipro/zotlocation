// src/components/modals/DateSearchModal.tsx

"use client"

import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"

import Modal from "@/components/modals/Modal"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"

interface DateSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const DateSearchModal: React.FC<DateSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter()
  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  // --- 1. CALCUL DU LABEL ET DE L'ÉTAT ---
  const actionLabel = useMemo(() => {
    return range?.from && range?.to ? "Rechercher" : "Sélectionner les dates"
  }, [range])

  const disabled = useMemo(() => {
    return isLoading || !range?.from || !range?.to
  }, [isLoading, range])

  // --- 2. GESTION DE LA RECHERCHE (Soumission) ---
  const handleSubmit = useCallback(() => {
    if (disabled) return

    setIsLoading(true)

    if (range?.from && range?.to) {
      const start = format(range.from, "yyyy-MM-dd")
      const end = format(range.to, "yyyy-MM-dd")

      // Construire l'URL de recherche
      const searchUrl = `/?startDate=${start}&endDate=${end}`

      // Redirection vers la page d'accueil avec les paramètres
      router.push(searchUrl)
    } else {
      // Optionnel : Rechercher sans filtre de date si le bouton le permet
      router.push("/")
    }

    setIsLoading(false)
    onClose()
  }, [disabled, range, router, onClose])

  // --- 3. Rendu du contenu de la modale ---
  const bodyContent = (
    <div className="flex flex-col gap-4 items-center justify-center">
      <h3 className="text-xl font-semibold mb-3">
        Quand souhaitez-vous voyager ?
      </h3>

      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        numberOfMonths={1} // afficher seulement 1 mois pour l'instant a voir le rendu
        disabled={[{ before: new Date() }]} // Désactive les dates passées
        className="rounded-md border [
          &_.rdp-day_selected]:bg-green-600
          [&_.rdp-day_selected]:text-white
          [&_.rdp-day_range_middle]:bg-green-200
          [&_.rdp-day_range_middle]:text-gray-800
        "
      />

      {range?.from && range?.to && (
        <div className="text-center mt-4 text-lg font-medium">
          Sélection: {format(range.from, "dd/MM/yyyy")} au{" "}
          {format(range.to, "dd/MM/yyyy")}
        </div>
      )}
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      title="Sélectionner les Dates"
      actionLabel={actionLabel}
      onSubmit={handleSubmit}
      onClose={onClose}
      body={bodyContent}
      disabled={disabled}
    />
  )
}

export default DateSearchModal

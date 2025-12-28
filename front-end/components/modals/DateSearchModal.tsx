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

const getLocalFormattedDate = (date: Date): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().substring(0, 10)
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

  // On sépare le 'disabled' pour le bouton et l'état de chargement
  const isSubmitDisabled = useMemo(() => {
    return isLoading || !range?.from || !range?.to
  }, [isLoading, range])

  // --- 2. GESTION DE LA RECHERCHE (Soumission) ---
  const handleSubmit = useCallback(() => {
    // Si on clique sur le bouton mais que ce n'est pas prêt, on ne fait rien
    if (isSubmitDisabled) return

    setIsLoading(true)

    if (range?.from && range?.to) {
      const start = getLocalFormattedDate(range.from)
      const end = getLocalFormattedDate(range.to)
      const searchUrl = `/?startDate=${start}&endDate=${end}`
      router.push(searchUrl)
    }

    setIsLoading(false)
    onClose()
  }, [isSubmitDisabled, range, router, onClose])

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
        numberOfMonths={1}
        disabled={[{ before: new Date() }]}
        className="rounded-md border shadow-sm p-3"
      />

      {range?.from && range?.to && (
        <div className="text-center mt-4 text-lg font-medium text-green-700 bg-green-50 px-4 py-2 rounded-full border border-green-100">
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
      /* 💡 IMPORTANT : On passe 'isSubmitDisabled' ici.
         Vérifiez bien que votre composant Modal.tsx n'utilise
         PAS cette prop 'disabled' pour bloquer la fonction 'handleClose'.
      */
      disabled={isSubmitDisabled}
    />
  )
}

export default DateSearchModal

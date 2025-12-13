/* eslint-disable @typescript-eslint/no-empty-object-type */
// types/react-date-range.d.ts

declare module "react-date-range" {
  import { Locale } from "date-fns" // Import du type Locale de date-fns
  import * as React from "react"

  // 1. Mise à jour de l'interface Range (Rendre les dates optionnelles)
  export interface Range {
    startDate?: Date | undefined
    endDate?: Date | undefined
    key: string
    color?: string
    autoFocus?: boolean
    disabled?: boolean
  }

  // 2. Interface des props génériques pour le calendrier
  export interface CommonProps {
    ranges: Range[]
    onChange: (ranges: { [key: string]: Range }) => void
    showSelectionPreview?: boolean
    moveRangeOnFirstSelection?: boolean
    disabledDates?: Date[]
    minDate?: Date
    maxDate?: Date
    rangeColors?: string[]
    showMonthAndYearPickers?: boolean
    locale?: Locale
    direction?: "vertical" | "horizontal" // Ajout de la direction
    months?: number // Ajout du nombre de mois
    showDateDisplay?: boolean // Ajout pour cacher l'affichage
  }

  // 3. Interface spécifique au DateRangePicker (étend les props communes)
  export interface DateRangePickerProps extends CommonProps {
    // Le DateRangePicker inclut des propriétés supplémentaires non utilisées ici mais souvent présentes
    // ...
  }

  // 4. Interface pour l'objet retourné par onChange
  export interface RangeKeyDict {
    [key: string]: Range
  }

  // 5. Déclaration des composants
  // Le composant DateRangePicker est celui qui supporte "months"
  export class DateRangePicker extends React.Component<DateRangePickerProps> {}

  // Si vous voulez également le composant simple DateRange:
  export class DateRange extends React.Component<CommonProps> {}
}

"use client"

import React from "react"
import { IconType } from "react-icons"

interface ButtonProps {
  label: string
  // Ajout de la propriété 'type'
  type?: "button" | "submit" | "reset"
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  outline?: boolean
  small?: boolean
  icon?: IconType
}

const CustomButton: React.FC<ButtonProps> = ({
  label,
  type = "button", // Valeur par défaut si non spécifiée
  disabled,
  outline,
  small,
  icon: Icon,
}) => {
  return (
    <button
      // Transmission de la propriété 'type' au bouton HTML
      type={type}
      disabled={disabled}
      className={`
    relative disabled:opacity-70 disabled:cursor-not-allowed rounded-lg hover:opacity-80 transition w-full
    ${outline ? "bg-white" : "bg-green-600"}
    ${outline ? "border-black" : "border-green-600"}
    ${outline ? "text-black" : "text-white"}
    ${small ? "py-1" : "py-3"}
    ${small ? "text-sm" : "text-md"}
    ${small ? "font-light" : "font-semibold"}
    ${small ? "border" : "border-2"}
    `}
    >
      {/* L'icône peut nécessiter un ajustement du `top-3` ou `h-full` pour être centrée */}
      {Icon && <Icon size={24} className="absolute left-4 top-3" />}
      {label}
    </button>
  )
}

export default CustomButton

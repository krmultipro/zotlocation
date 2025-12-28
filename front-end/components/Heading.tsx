"use client"

import React from "react"

interface HeadingProps {
  title: string
  subtitle?: string
  center?: boolean
}

const Heading: React.FC<HeadingProps> = ({ title, subtitle, center }) => {
  return (
    <div       className={`mb-6 ${center ? "text-center" : "text-left"}`} >
      {/* Titre Principal */}
      <div className="text-2xl font-bold">{title}</div>

      {/* Sous-titre */}
      {subtitle && (
        <div className="font-light text-neutral-500 mt-2">{subtitle}</div>
      )}
    </div>
  )
}

export default Heading

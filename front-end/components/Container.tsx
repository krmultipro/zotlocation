"use client" // quand nous creeons un composant, il est par default en mode server, pour de pas avoir de problemes d'injection et de vue nous devons lui indiquer que c'est un composant client
import React from "react"

// propriétés du composant Container
interface ContainerProps {
  children: React.ReactNode
}

// ici on attribut les propruétés du composant Container
const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
      {children}
    </div>
  )
}

export default Container

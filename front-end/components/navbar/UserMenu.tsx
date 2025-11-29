"use client"

import useLoginModal from "@/app/hooks/useLoginModal"
import useRegisterModal from "@/app/hooks/useRegisterModal"
import { useCallback, useState } from "react"
import { AiOutlineMenu } from "react-icons/ai"
import Avatar from "../Avatar"
import MenuItem from "./MenuItem"

// creation de la fonction pour notre modale
const UserMenu = () => {
  const registerModal = useRegisterModal()
  const loginModal = useLoginModal() // <-- INITIALISATION DU HOOK DE CONNEXION
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value)
  }, [])

  // Fonction utilitaire pour fermer le menu après un clic d'action
  const handleLoginClick = useCallback(() => {
    setIsOpen(false) // Ferme le menu déroulant
    loginModal.onOpen() // Ouvre la modale de connexion
  }, [loginModal])

  const handleRegisterClick = useCallback(() => {
    setIsOpen(false) // Ferme le menu déroulant
    registerModal.onOpen() // Ouvre la modale d'inscription
  }, [registerModal])

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">
        <div
          onClick={() => {}}
          className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
        >
          Mon compte
          {/* a modifier au besoin (ce sera une modale au clic dessus ca peut afficher nos reservations?*/}
        </div>

        <div
          onClick={toggleOpen}
          className="p-4 md:py-1 md:px-2 border border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition"
        >
          <AiOutlineMenu />
          <div className="hidden md:block">
            <Avatar />
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute rounded-xl shadow-md w-[40vw] md:w-3/4 bg-white overflow-hidden right-0 top-12 text-sm">
          <div className="flex flex-col cursor-pointer">
            <>
              <MenuItem onClick={handleLoginClick} label="Se connecter" />
              <MenuItem onClick={handleRegisterClick} label="S'inscrire" />
            </>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu

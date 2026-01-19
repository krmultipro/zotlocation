"use client"

import { useUser } from "@/app/context/UserProvider";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";

import { useFavorites } from "@/app/context/FavoritesContext";
import ModalAjoutAnnonce from "@/components/modals/ModalAjoutAnnonce";
import Avatar from "../Avatar";
import MenuItem from "./MenuItem";

const UserMenu = () => {
  const router = useRouter()
  const loginModal = useLoginModal()
  const registerModal = useRegisterModal()
  const { user, isLoading, refreshUser } = useUser()
  const { refreshFavorites } = useFavorites()
  const [isOpen, setIsOpen] = useState(false)
  const [openModal, setOpenModal] = useState(false)

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), [])

  const handleLoginClick = useCallback(() => {
    setIsOpen(false)
    loginModal.onOpen()
  }, [loginModal])

  const handleRegisterClick = useCallback(() => {
    setIsOpen(false)
    registerModal.onOpen()
  }, [registerModal])

  const handleLogoutClick = useCallback(() => {
    setIsOpen(false)
    localStorage.removeItem("jwtToken")
    refreshUser()
    refreshFavorites()
    router.push("/")
  }, [refreshUser, refreshFavorites, router])

  const handleDashboardClick = useCallback(() => {
    setIsOpen(false)
    router.push("/dashboard")
  }, [router])

  const handleReservationsClick = useCallback(() => {
    setIsOpen(false)
    router.push("/dashboard/reservations")
  }, [router])

  const handleFavoritesClick = useCallback(() => {
    setIsOpen(false)
    router.push("/dashboard/favoris")
  }, [router])

  const handleLocationsClick = useCallback(() => {
    setIsOpen(false)
    router.push("/dashboard/locations")
  }, [router])

  if (isLoading) {
    return (
      <div className="relative">
        <div className="flex flex-row items-center gap-3">
          <div className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full bg-neutral-100 animate-pulse w-24">
            &nbsp;
          </div>
          <div className="p-4 md:py-1 md:px-2 border border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition">
            <AiOutlineMenu />
            <div className="hidden md:block">
              <Avatar src={user?.avatarUrl} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex items-center gap-3">
      <div className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-default">
        {user ? `Bienvenue, ${user.name}` : ""}
      </div>

      <div
        onClick={toggleOpen}
        className="p-4 md:py-1 md:px-2 border border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition"
      >
        <AiOutlineMenu />
        <div className="hidden md:block">
          <Avatar src={user?.avatarUrl} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute rounded-xl shadow-md w-[40vw] md:w-3/4 bg-white overflow-hidden right-0 top-12 text-sm z-50">
          <div className="flex flex-col cursor-pointer">
            {user ? (
              <>
                <MenuItem
                  onClick={handleDashboardClick}
                  label="Tableau de bord"
                />
                <MenuItem
                  onClick={handleReservationsClick}
                  label="Mes réservations"
                />
                <MenuItem onClick={handleFavoritesClick} label="Mes favoris" />
                <MenuItem onClick={handleLocationsClick} label="Mes locations" />
                {user.isOwner && (
                  <MenuItem
                    onClick={() => {
                      setOpenModal(true)
                      setIsOpen(false)
                    }}
                    label="Créer une annonce"
                  />
                )}
                <hr className="my-1 border-neutral-100" />
                <MenuItem onClick={handleLogoutClick} label="Déconnexion" />
              </>
            ) : (
              <>
                <MenuItem onClick={handleLoginClick} label="Connexion" />
                <MenuItem onClick={handleRegisterClick} label="S'inscrire" />
              </>
            )}
          </div>
        </div>
      )}

      <ModalAjoutAnnonce open={openModal} onOpenChange={setOpenModal} />
    </div>
  )
}

export default UserMenu

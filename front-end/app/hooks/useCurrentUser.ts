/* eslint-disable @typescript-eslint/no-unused-vars */
// app/hooks/useCurrentUser.ts

import { useEffect, useState } from "react"

// Définition de l'interface utilisateur (à compléter avec vos vrais champs)
interface CurrentUser {
  id: string
  email: string
  name: string
  full_name: string | null
  isOwner: boolean
  avatarUrl: string | null
}

// NOUVELLE INTERFACE DE RETOUR POUR LE HOOK
interface CurrentUserHook {
  user: CurrentUser | null
  isLoading: boolean
  refreshUser: () => void
  token: string | null // <-- 🎯 Ajout de la propriété token
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
const SYMFONY_ME_URL = `${API_URL}/api/me`

// 💡 APPLICATION DE L'INTERFACE
const useCurrentUser = (): CurrentUserHook => {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Token local réactif
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null
  )

  // Permettra d’actualiser l’utilisateur après connexion
  const refreshUser = () => {
    const newToken = localStorage.getItem("jwtToken")
    setToken(newToken)
  }

  useEffect(() => {
    const fetchUser = async () => {
      // ... (votre logique de récupération de l'utilisateur) ...
    }
    fetchUser()
  }, [token])

  // 💡 RETOUR DU TOKEN
  return {
    user,
    isLoading,
    refreshUser,
    token, // <-- Le token est maintenant retourné, correspondant au type CurrentUserHook
  }
}

export default useCurrentUser

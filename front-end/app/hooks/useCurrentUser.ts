import axios from "axios"
import { useEffect, useState } from "react"

// Définition de l'interface utilisateur retournée par /api/me
interface CurrentUser {
  id: string
  email: string
  name: string
  full_name: string | null
  isOwner: boolean
  avatarUrl: string | null
}

// Endpoint pour récupérer l'utilisateur actuellement connecté
const SYMFONY_ME_URL = "https://127.0.0.1:8000/api/me"

const useCurrentUser = () => {
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
      setIsLoading(true)

      // Aucun token = utilisateur non connecté
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        const response = await axios.get(SYMFONY_ME_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        const userData = response.data

        const currentUserData: CurrentUser = {
          id: userData.id,
          email: userData.email,
          name: userData.full_name || userData.email,
          full_name: userData.full_name || null,
          isOwner: userData.isOwner || false,
          avatarUrl: userData.avatarUrl || null,
        }

        setUser(currentUserData)
      } catch (error) {
        console.error("Erreur d'authentification:", error)
        setUser(null)
        localStorage.removeItem("jwtToken")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [token]) // Ré-exécute le hook quand le token change (login/logout)

  return { user, isLoading, refreshUser }
}

export default useCurrentUser

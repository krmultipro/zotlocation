/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import axios from "axios"
import { createContext, useContext, useEffect, useState } from "react"

interface CurrentUser {
  id: string
  email: string
  name: string
  isOwner: boolean
  avatarUrl: string | null
}

interface UserContextType {
  user: CurrentUser | null
  isLoading: boolean
  refreshUser: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)
const SYMFONY_ME_URL = "https://127.0.0.1:8000/api/me"

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    const token = localStorage.getItem("jwtToken")
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await axios.get(SYMFONY_ME_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const data = res.data
      setUser({
        id: data.id,
        email: data.email,
        name: data.full_name || data.email,
        isOwner: data.isOwner || false,
        avatarUrl: data.avatarUrl || null,
      })
    } catch (err) {
      setUser(null)
      localStorage.removeItem("jwtToken")
    } finally {
      setIsLoading(false)
    }
  }

  // 🔥 Event listener pour détecter changement de token
  useEffect(() => {
    fetchUser()
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "jwtToken") fetchUser()
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const refreshUser = () => fetchUser()

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context)
    throw new Error("useUser doit être utilisé dans un UserProvider")
  return context
}

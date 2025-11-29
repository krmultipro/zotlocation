import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: number
  email: string
  role?: string
  token?: string
}

interface UserState {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      logout: () => set({ user: null }),
    }),
    {
      name: "user-store", // nom du stockage localStorage
      skipHydration: true, // évite les soucis côté serveur Next.js
    }
  )
)

export default useUserStore

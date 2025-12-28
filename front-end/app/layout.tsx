// app/layout.tsx
import { FavoritesProvider } from "@/app/context/FavoritesContext" // 💡 IMPORT DU PROVIDER
import {ReservationsProvider} from "@/app/context/ReservationsContext"
import { Providers } from "@/app/context/Provider"
import LoginModal from "@/components/modals/LoginModal"
import RegisterModal from "@/components/modals/RegisterModal"
import Navbar from "@/components/navbar/Navbar"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"

const font = Nunito({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "🌴 ZotLocation",
  description: "Réservez vos meilleurs séjours à la Réunion",
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={font.className}>
        {/* Wrapper client principal */}
        <Providers>
          {/* 💡 ENGLOBER L'APPLICATION AVEC LE CONTEXTE FAVORIS */}
          <FavoritesProvider>
            <ReservationsProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <RegisterModal />
            <LoginModal />
            <Navbar />

            {/* Contenu de la page */}
            <div className="pt-62 min-h-screen">{children}</div>
            </ReservationsProvider>
          </FavoritesProvider>
        </Providers>
      </body>
    </html>
  )
}

// app/layout.tsx
import { FavoritesProvider } from "@/app/context/FavoritesContext"
import { Providers } from "@/app/context/Provider"
import { ReservationsProvider } from "@/app/context/ReservationsContext"
import LoginModal from "@/components/modals/LoginModal"
import RegisterModal from "@/components/modals/RegisterModal"
import Navbar from "@/components/navbar/Navbar"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"
import { Suspense } from "react"


const font = Nunito({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "🌴 ZotLocation",
  description: "Réservez vos meilleurs séjours à la Réunion",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    /* 💡 Ajout de suppressHydrationWarning pour ignorer les attributs injectés par les extensions (ex: data-yd-content-ready) */
    <html lang="fr" suppressHydrationWarning>
      <body className={font.className}>
        {/* Wrapper client principal */}
        <Providers>
          <FavoritesProvider>
            <ReservationsProvider>
              <Toaster position="top-center" reverseOrder={false} />
              <RegisterModal />
              <LoginModal />
              <Suspense fallback={<div />}>
  <Navbar />
</Suspense>

              {/* Contenu de la page */}
              <div className="pt-62 min-h-screen">{children}</div>
            </ReservationsProvider>
          </FavoritesProvider>
        </Providers>
      </body>
    </html>
  )
}

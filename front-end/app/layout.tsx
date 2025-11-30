import { Nunito } from "next/font/google"

import LoginModal from "@/components/modals/LoginModal"
import RegisterModal from "@/components/modals/RegisterModal"
import Navbar from "@/components/navbar/Navbar"

import type { Metadata } from "next"
import { Toaster } from "react-hot-toast"
import "./globals.css"

const font = Nunito({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "🌴 ZotLocation",
  description: "Réservez vos meilleurs séjours à la Réunion",
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={font.className}>
        <Toaster position="top-center" reverseOrder={false} />
        <RegisterModal />
        <LoginModal />
        <Navbar />
        <main className="pt-32">
        <Categories />
        {children}
        </main>
      </body>
    </html>
  )
}

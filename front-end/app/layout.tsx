import { Nunito } from "next/font/google"

import "./globals.css"
import Navbar from "@/components/navbar/Navbar"
import type { Metadata } from "next"
import RegisterModal from "@/components/modals/RegisterModal"
import LoginModal from "@/components/modals/LoginModal"
import Categories from "@/components/Categories"

const font = Nunito({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "🌴 ZotLocation",
  description: "Réservez vos meilleurs sejour à la Réunion",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={font.className}>
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

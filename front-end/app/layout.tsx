import Navbar from "@/components/navbar/Navbar"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"

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
        <Navbar />
        {children}
      </body>
    </html>
  )
}

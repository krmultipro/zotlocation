"use client"

import { useSearchParams } from "next/navigation"
import Container from "@/components/Container"

export default function ErrorPage() {
    const searchParams = useSearchParams()
    const message =
        searchParams.get("message") ||
        "Une erreur est survenue."

    return (
        <Container>
            <div className="pt-32 text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">
                    Accès refusé petit voyou
                </h1>
                <p className="text-gray-700 mb-8">
                </p>

                <a
                    href="/"
                    className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
                >
                    Retour à l’accueil
                </a>
            </div>
        </Container>
    )
}

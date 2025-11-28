/* eslint-disable react/no-unescaped-entities */
"use client"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import axios from "axios"
import { useEffect, useState } from "react"

// URL de base de votre API Symfony/API Platform. route publique
const API_BASE_URL = "https://localhost:8000/api/listings"

const ApiTestComponent = () => {
  const [status, setStatus] = useState("Initialisation...")
  const [dataPreview, setDataPreview] = useState("Aucune donnée reçue.")
  const [color, setColor] = useState("default")

  useEffect(() => {
    // Fonction pour effectuer la requête
    const testApiConnection = async () => {
      setStatus("Tentative de connexion à l'API...")
      setColor("yellow")

      try {
        // Requête GET vers une ressource spécifique de l'API Platform
        const response = await axios.get(API_BASE_URL, {
          timeout: 5000, // Timeout de 5 secondes
          headers: { Accept: "application/json" },
        })

        if (response.status >= 200 && response.status < 300) {
          setStatus(`Connexion Réussie (Statut: ${response.status})`)
          setColor("green")
          // Affiche les premières 500 caractères des données reçues pour confirmation
          const preview = JSON.stringify(response.data, null, 2)
          setDataPreview(
            preview.substring(0, 500) + (preview.length > 500 ? "..." : "")
          )
        } else {
          setStatus(`Échec de la connexion (Statut: ${response.status})`)
          setColor("red")
          setDataPreview(`Réponse reçue : ${response.statusText}`)
        }
      } catch (error) {
        setStatus("Échec de la requête (Erreur réseau ou CORS)")
        setColor("red")
        // Afficher des messages d'erreur spécifiques
        if (axios.isAxiosError(error)) {
          if (error.code === "ECONNABORTED") {
            setDataPreview(
              "Timeout: La requête a pris trop de temps. Vérifiez que le backend est en cours d'exécution."
            )
          } else if (error.response) {
            setDataPreview(
              `Erreur de réponse API (Statut: ${error.response.status}). Problème CORS ou chemin incorrect.`
            )
          } else {
            setDataPreview(
              "Erreur réseau. Vérifiez que le serveur Symfony est démarré et que le CORS est configuré. Si le CORS échoue, cela est dû à un blocage par le serveur Symfony."
            )
          }
        } else {
          setDataPreview(`Erreur inattendue: ${error.message}`)
        }
      }
    }

    testApiConnection()
  }, [])

  // Détermine la classe Tailwind pour la couleur du badge
  const getBadgeVariant = (statusColor) => {
    if (statusColor === "green")
      return "bg-green-500 text-white hover:bg-green-600"
    if (statusColor === "red") return "bg-red-500 text-white hover:bg-red-600"
    return "bg-yellow-500 text-white hover:bg-yellow-600"
  }

  return (
    <Card className="max-w-3xl mx-auto my-8 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Test de Connexion API Symfony</CardTitle>
          <CardDescription>
            Vérification du point d'entrée de la collection Users:{" "}
            {API_BASE_URL}
          </CardDescription>
        </div>
        <Badge className={getBadgeVariant(color)}>{status}</Badge>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-2">Détails de la Réponse :</h3>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm text-gray-700 whitespace-pre-wrap">
          {dataPreview}
        </pre>
        <p className="mt-4 text-xs text-neutral-500">
          * Si le statut est ROUGE, la cause la plus probable est le **CORS**
          non configuré correctement ou l'URL du serveur est incorrecte.
          Assurez-vous d'avoir redémarré votre serveur Symfony.
        </p>
      </CardContent>
    </Card>
  )
}

export default ApiTestComponent

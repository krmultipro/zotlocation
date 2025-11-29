/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import axios from "axios" // Importation d'axios pour les appels API
import { useState } from "react"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"

// Importation des hooks modaux
import useLoginModal from "@/app/hooks/useLoginModal"
import useRegisterModal from "@/app/hooks/useRegisterModal"

// Importation des composants Shadcn
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CustomButton from "../CustomButton"

// URL DE L'API SYMFONY POUR LA CONNEXION (récupération du JWT)

const SYMFONY_LOGIN_CHECK_URL = "https://127.0.0.1:8000/api/login_check"

const LoginModal = () => {
  const registerModal = useRegisterModal()
  const loginModal = useLoginModal()

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // Ajout de l'état pour les messages d'erreur

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Fonction pour basculer vers la modale d'inscription
  const onToggle = () => {
    loginModal.onClose()
    registerModal.onOpen()
  }

  // GESTION DE LA SOUMISSION DU FORMULAIRE DE CONNEXION

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true)
    setErrorMessage(null) // Réinitialisation du message d'erreur

    const loginPayload = {
      email: data.email,
      password: data.password,
    }

    try {
      // Appel à l'endpoint de connexion Symfony pour obtenir le JWT
      const response = await axios.post(SYMFONY_LOGIN_CHECK_URL, loginPayload, {
        headers: { "Content-Type": "application/json" },
      })

      const token = response.data.token
      if (token) {
        // Succès: Stocker le token JWT dans le localStorage
        localStorage.setItem("jwtToken", token)
        console.log("Connexion réussie! Token JWT stocké.")

        // Fermer la modal et réinitialiser le formulaire
        reset()
        loginModal.onClose()
        // Recharger la page pour mettre à jour l'état de l'application (afficher le contenu authentifié)
        // window.location.reload()
      } else {
        throw new Error(
          "Réponse de connexion réussie mais aucun token JWT reçu."
        )
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Gestion des erreurs spécifiques (e.g., identifiants invalides)
        console.error(
          "Échec de la connexion:",
          error.response.data || error.response
        )

        let message = "Une erreur est survenue lors de la connexion."

        if (error.response.status === 401) {
          message = "Identifiants invalides (email ou mot de passe incorrect)."
        } else if (error.response.data.detail) {
          message = error.response.data.detail
        } else {
          message = "Échec de la connexion : " + error.response.statusText
        }

        setErrorMessage(message)
      } else {
        setErrorMessage(
          "Impossible de se connecter au serveur Symfony. (Erreur réseau/CORS)"
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  // STRUCTURE DU FORMULAIRE

  const FormBody = (
    <div className="flex flex-col space-y-4">
      {/* Affichage des messages d'erreur */}
      {errorMessage && (
        <div
          className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-3 rounded-md"
          role="alert"
        >
          <p className="font-bold">Erreur :</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Email Input */}
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="email@exemple.com"
          disabled={isLoading}
          {...register("email", { required: "L'email est requis" })}
          className={
            errors.email ? "border-rose-500 focus-visible:ring-rose-500" : ""
          }
        />
        {errors.email && (
          <p className="text-rose-500 text-sm mt-1">
            {errors.email.message as string}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <Label htmlFor="login-password">Mot de passe</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="********"
          disabled={isLoading}
          {...register("password", {
            required: "Le mot de passe est requis",
          })}
          className={
            errors.password ? "border-rose-500 focus-visible:ring-rose-500" : ""
          }
        />
        {errors.password && (
          <p className="text-rose-500 text-sm mt-1">
            {errors.password.message as string}
          </p>
        )}
      </div>
    </div>
  )

  // RENDU DU COMPOSANT (Modal Dialog shadcnUI)

  return (
    <Dialog open={loginModal.isOpen} onOpenChange={loginModal.onClose}>
      <DialogContent
        className="
          sm:max-w-md md:max-w-xl lg:max-w-lg
          w-[90vw] max-h-[90vh] overflow-y-auto
          p-0 border-0 shadow-lg
        "
      >
        <Card className="border-none shadow-none">
          {/* L'élément form est lié à la fonction onSubmit via handleSubmit */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* HEADER */}
            <CardHeader className="p-6 border-b flex flex-row items-center justify-center relative">
              <button
                onClick={loginModal.onClose}
                type="button"
                className="p-1 border-0 hover:opacity-70 transition absolute left-4 md:left-9 text-neutral-500 hover:text-neutral-800"
                aria-label="Fermer"
              ></button>
              <DialogTitle className="text-2xl font-semibold">
                Se connecter
              </DialogTitle>
            </CardHeader>

            {/* BODY */}
            <CardContent className="relative p-6">{FormBody}</CardContent>

            {/* FOOTER */}
            <CardFooter className="flex flex-col gap-4 p-6">
              <div className="flex flex-col gap-2 w-full">
                {/* Bouton d'Action Principal (Submit) */}
                <CustomButton
                  disabled={isLoading}
                  label={isLoading ? "Connexion en cours..." : "Connexion"}
                  type="submit" // Type submit pour que handleSubmit(onSubmit) soit déclenché
                  onClick={function (
                    e: React.MouseEvent<HTMLButtonElement>
                  ): void {
                    throw new Error("Function not implemented.")
                  }}
                />
              </div>

              {/* Pied de Page pour le lien d'inscription */}
              <div className="text-neutral-500 text-center mt-4 font-light">
                <p>
                  Première fois sur notre plateforme ?
                  <span
                    onClick={onToggle} // Bascule vers la modale d'inscription
                    className="text-neutral-800 cursor-pointer hover:underline ml-1"
                  >
                    Créez un compte
                  </span>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

export default LoginModal

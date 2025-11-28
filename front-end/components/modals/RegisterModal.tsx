/* eslint-disable react/no-unescaped-entities */
"use client"
import axios from "axios"
import { useState } from "react"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import { IoMdClose } from "react-icons/io"

// Importation des composants Shadcn (Assurez-vous d'avoir bien installé ces composants via 'npx shadcn-ui@latest add <composant>')
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Assurez-vous que ce chemin est correct pour votre CustomButton
import useLoginModal from "@/app/hooks/useLoginModal"
import useRegisterModal from "@/app/hooks/useRegisterModal"
import CustomButton from "../CustomButton"

const RegisterModal = () => {
  const registerModal = useRegisterModal()
  const loginModal = useLoginModal() // Récupération du store pour la connexion
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  // Fonction pour basculer : ferme Register, ouvre Login
  const onToggle = () => {
    registerModal.onClose()
    loginModal.onOpen()
  }

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true)

    axios
      .post("/api/users", data)
      .then(() => {
        // En cas de succès, fermer la modale
        registerModal.onClose()
      })
      .catch((error) => {
        console.error("Erreur d'inscription:", error)
        // Logique d'affichage d'erreur à l'utilisateur
      })
      .finally(() => setIsLoading(false))
  }

  // Contenu du formulaire d'inscription
  const FormBody = (
    <div className="flex flex-col space-y-4">
      {/* Email Input */}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
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

      {/* Name Input */}
      <div>
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          placeholder="Votre nom"
          disabled={isLoading}
          {...register("name", { required: "Le nom est requis" })}
          className={
            errors.name ? "border-rose-500 focus-visible:ring-rose-500" : ""
          }
        />
        {errors.name && (
          <p className="text-rose-500 text-sm mt-1">
            {errors.name.message as string}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          disabled={isLoading}
          {...register("password", { required: "Le mot de passe est requis" })}
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

  return (
    // Utilisation du composant Dialog de shadcn/ui
    <Dialog open={registerModal.isOpen} onOpenChange={registerModal.onClose}>
      <DialogContent
        className="
          sm:max-w-md md:max-w-xl lg:max-w-lg
          w-[90vw] max-h-[90vh] overflow-y-auto
          p-0 border-0 shadow-lg
        "
      >
        {/* Utilisation du composant Card de shadcn/ui pour encadrer le contenu */}
        <Card className="border-none shadow-none">
          {/* HEADER */}
          <CardHeader className="p-6 border-b flex flex-row items-center justify-center relative">
            <button
              onClick={registerModal.onClose}
              className="p-1 border-0 hover:opacity-70 transition absolute left-4 md:left-9"
            >
              <IoMdClose size={18} />
            </button>
            <DialogTitle className="text-2xl font-semibold">
              S'inscrire
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
                label={isLoading ? "Inscription en cours..." : "Continuer"}
                onClick={handleSubmit(onSubmit)}
              />
            </div>

            {/* Pied de Page pour le lien de connexion */}
            <div className="text-neutral-500 text-center mt-4 font-light">
              <p>
                Vous avez déjà un compte ?
                <span
                  onClick={onToggle} // Bascule vers la modale de connexion
                  className="text-neutral-800 cursor-pointer hover:underline ml-1"
                >
                  Connectez-vous
                </span>
              </p>
            </div>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

export default RegisterModal

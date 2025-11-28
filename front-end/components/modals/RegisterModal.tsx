/* eslint-disable react-hooks/incompatible-library */
"use client"
import axios from "axios"
import { useState } from "react"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
// Import de IoMdClose supprimé car la croix personnalisée a été retirée

import { Checkbox } from "@/components/ui/checkbox" // Importation du composant Checkbox

// Utilisation des alias pour les imports (méthode standard Next.js)
// Si cela ne fonctionne pas, veuillez vérifier que votre tsconfig.json a l'alias '@/*' configuré pour le dossier 'src' ou la racine.

import useRegisterModal from "@/app/hooks/useRegisterModal"

// Importation des composants Shadcn
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import CustomButton from "../CustomButton"

const RegisterModal = () => {
  const registerModal = useRegisterModal()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue, // Ajout de setValue pour gérer l'état de la checkbox
    watch, // Ajout de watch pour surveiller l'état
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      isOwner: false, // Initialisation du champ de rôle
      avatarUrl: "", // Initialisation du champ d'avatar (non obligatoire)
    },
  })

  // Surveiller l'état de la case à cocher
  const isOwner = watch("isOwner")

  // Fonction utilitaire pour basculer la valeur de la checkbox
  const toggleOwner = (checked: boolean) => {
    setValue("isOwner", checked, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true)

    // Affichage des données (incluant isOwner et avatarUrl)
    console.log("Données envoyées:", data)

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

      {/* Avatar URL Input (Non obligatoire) */}
      <div>
        <Label htmlFor="avatarUrl">Avatar (URL)</Label>
        <Input
          id="avatarUrl"
          placeholder="Lien vers votre photo de profil (ex: https://...)"
          disabled={isLoading}
          {...register("avatarUrl")} // Pas de validation requise
        />
      </div>

      {/* Rôle Checkbox */}
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="isOwner"
          checked={isOwner}
          onCheckedChange={toggleOwner}
          disabled={isLoading}
        />
        <label
          htmlFor="isOwner"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Je suis Propriétaire ⭐️
        </label>
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
            <DialogTitle className="text-2xl font-semibold">
              S&rsquo;inscrire et définir votre rôle
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
                <span className="text-neutral-800 cursor-pointer hover:underline ml-1">
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

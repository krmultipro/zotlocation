"use client"
//import { signIn } from "next-auth/react" // Assurez-vous d'avoir NextAuth configuré, ou remplacez par votre propre méthode d'auth (axios, etc.)
import { useState } from "react"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import { IoMdClose } from "react-icons/io"

// Correction du chemin d'importation pour les stores Zustand
import useLoginModal from "@/app/hooks/useLoginModal"
import useRegisterModal from "@/app/hooks/useRegisterModal"

// Importation des composants Shadcn
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CustomButton from "../CustomButton"

const LoginModal = () => {
  const loginModal = useLoginModal()
  const registerModal = useRegisterModal() // Pour basculer entre les modales
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true)

    // Logique de connexion (exemple avec NextAuth)
    signIn("credentials", {
      ...data,
      redirect: false,
    })
      .then((callback) => {
        setIsLoading(false)
        if (callback?.ok) {
          console.log("Connexion réussie")
          loginModal.onClose()
          // Optionnel: router.refresh() si vous utilisez Next.js App Router
        }

        if (callback?.error) {
          console.error(callback.error)
          // Logique pour afficher un message d'erreur d'authentification
        }
      })
      .catch((error) => {
        console.error("Erreur de connexion inattendue:", error)
      })
      .finally(() => setIsLoading(false))
  }

  // Contenu du formulaire de connexion
  const FormBody = (
    <div className="flex flex-col space-y-4">
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
    <Dialog open={loginModal.isOpen} onOpenChange={loginModal.onClose}>
      <DialogContent
        className="
          sm:max-w-md md:max-w-xl lg:max-w-lg
          w-[90vw] max-h-[90vh] overflow-y-auto
          p-0 border-0 shadow-lg
        "
      >
        <Card className="border-none shadow-none">
          {/* HEADER */}
          <CardHeader className="p-6 border-b flex flex-row items-center justify-center relative">
            <button
              onClick={loginModal.onClose}
              className="p-1 border-0 hover:opacity-70 transition absolute left-4 md:left-9"
            >
              <IoMdClose size={18} />
            </button>
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
                label={isLoading ? "Connexion en cours..." : "Continuer"}
                onClick={handleSubmit(onSubmit)}
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
        </Card>
      </DialogContent>
    </Dialog>
  )
}

export default LoginModal

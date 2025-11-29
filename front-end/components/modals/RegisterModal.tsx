/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client" // Indique que ce composant est exécuté côté client (nécessaire pour les hooks et l'interactivité)

import axios from "axios" // Client HTTP pour effectuer des requêtes API
import { useCallback, useRef, useState } from "react" // Hooks React standard
import { FieldValues, SubmitHandler, useForm } from "react-hook-form" // Outils pour la gestion de formulaire (validation, soumission, état)

// Hooks personnalisés pour gérer l'ouverture/fermeture des modals
import useLoginModal from "../../app/hooks/useLoginModal"
import useRegisterModal from "../../app/hooks/useRegisterModal"
import CustomButton from "../CustomButton" // Composant de bouton personnalisé

// Importation des composants UI (Shadcn/ui) pour la structure et l'apparence
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SYMFONY_REGISTER_URL = "https://127.0.0.1:8000/api/users" // Endpoint pour l'inscription (POST)
const SYMFONY_LOGIN_CHECK_URL = "https://127.0.0.1:8000/api/login_check" // Endpoint pour la connexion (récupération du JWT)

// Définition des types pour les valeurs du formulaire (attendues par React Hook Form)
interface RegisterFormValues extends FieldValues {
  name: string
  email: string
  plainPassword: string
  isOwner: boolean // Champ virtuel envoyé au back-end pour définir le rôle Propriétaire
  avatarUrl: string | null
}

const RegisterModal = () => {
  const registerModal = useRegisterModal() // État d'ouverture/fermeture de la modal d'inscription
  const loginModal = useLoginModal() // État d'ouverture/fermeture de la modal de connexion
  const [isLoading, setIsLoading] = useState(false) // Gère l'état de soumission du formulaire
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null) // Stocke l'URL de prévisualisation de l'avatar
  const fileInputRef = useRef<HTMLInputElement>(null) // Permet de manipuler l'input de fichier caché
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // Stocke et affiche les erreurs API

  // Initialisation du formulaire avec React Hook Form
  const {
    register, // Fonction pour lier les inputs aux champs du formulaire
    handleSubmit, // Wrapper pour la fonction de soumission, gère la validation
    setValue, // Fonction pour définir manuellement la valeur d'un champ
    watch, // Fonction pour observer la valeur d'un champ en temps réel
    formState: { errors }, // Contient les erreurs de validation
    reset, // Fonction pour réinitialiser le formulaire
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      email: "",
      plainPassword: "",
      isOwner: false, // Valeur par défaut : Utilisateur simple (ROLE_USER)
      avatarUrl: null,
    },
  })

  // Suivi de la valeur 'isOwner' pour la checkbox
  const isOwner = watch("isOwner")

  // Fonction pour mettre à jour l'état de la checkbox 'isOwner' via setValue
  const toggleOwner = (checked: boolean) => {
    setValue("isOwner", checked, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  {
    /* TODO:  Actuellement(29/11) le chargement d'une photo avatar ne s'affiche pas en base, il faudra regarder ca*/
  }

  // Gestion du changement de fichier pour l'avatar (conversion en Base64)
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        // Vérification de la taille (max 2 Mo)
        if (file.size > 2 * 1024 * 1024) {
          console.error("Le fichier est trop volumineux (max 2 Mo).")
          setAvatarPreview(null)
          setValue("avatarUrl", null)
          return
        }

        // Lecture du fichier pour obtenir la chaîne Base64 (nécessaire pour l'envoi JSON)
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          setAvatarPreview(base64String) // Met à jour la prévisualisation
          setValue("avatarUrl", base64String, { shouldValidate: true }) // Stocke Base64 dans le champ 'avatarUrl'
        }
        reader.readAsDataURL(file)
      }
    },
    [setValue]
  )

  // Ouvre le sélecteur de fichier au clic sur l'Avatar ou le bouton
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  // Ferme la modal d'inscription et ouvre celle de connexion
  const onToggle = () => {
    registerModal.onClose()
    loginModal.onOpen()
  }

  // GESTION DE LA SOUMISSION DU FORMULAIRE (LOGIQUE ASYNCHRONE)
  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsLoading(true) // Démarre le chargement (désactive l'UI)
    setErrorMessage(null) // Réinitialise les erreurs précédentes

    // Construction du payload d'inscription
    const registerPayload = {
      name: data.name,
      email: data.email,
      plainPassword: data.plainPassword,
      // CLÉ CRUCIALE : Envoie le champ virtuel 'isOwner' (true/false)
      // Ceci est lu par le Data Processor Symfony (UserPasswordHasher) pour assigner les rôles.
      isOwner: data.isOwner,
      avatarUrl: data.avatarUrl || null,
    }

    let isRegistrationSuccess = false // Flag pour tracer l'état de la première étape

    try {
      // STEP 1: Appel d'Inscription (POST /api/users)

      const registerResponse = await axios.post(
        SYMFONY_REGISTER_URL,
        registerPayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      )

      if (registerResponse.status === 201) {
        // 201 Created : Inscription réussie
        isRegistrationSuccess = true
        console.log(
          "Inscription réussie! Tentative de connexion automatique..."
        )
        // STEP 2: Appel de Connexion (POST /api/login_check)
        // L'utilisateur est immédiatement connecté après son inscription.

        const loginPayload = {
          email: data.email, // Utilise l'email comme identifiant (conformément à la configuration JWT coté back end)
          password: data.plainPassword,
        }
        console.log(
          "Payload de CONNEXION (POST /api/login_check):",
          loginPayload
        )

        const loginResponse = await axios.post(
          SYMFONY_LOGIN_CHECK_URL,
          loginPayload
        )

        const token = loginResponse.data.token
        if (token) {
          // Stocke le jeton JWT dans le localStorage pour les requêtes futures (authentification)
          localStorage.setItem("jwtToken", token)
          console.log("Token JWT récupéré et stocké.")
        }

        // Nettoyage et fermeture de la modal après succès
        reset()
        registerModal.onClose()
        //window.location.reload(); // Rechargement potentiellement nécessaire pour mettre à jour l'état global d'auth
      } else {
        // Gère les statuts de réponse inattendus
        throw new Error(
          "Inscription terminée avec un statut inattendu : " +
            registerResponse.status
        )
      }
    } catch (error) {
      // GESTION DES ERREURS
      if (axios.isAxiosError(error) && error.response) {
        let message = "Une erreur est survenue lors de l'inscription."

        if (isRegistrationSuccess) {
          // Cas d'erreur 1: Inscription OK (201) mais Échec de la CONNEXION (Step 2)
          console.error(
            "Échec de la CONNEXION après inscription:",
            error.response.data || error.response
          )
          message =
            "Inscription réussie, mais échec de la connexion automatique. Veuillez vous connecter manuellement. Vérifiez vos identifiants ou le token JWT."
        } else {
          // Cas d'erreur 2: Échec de l'INSCRIPTION (Step 1)
          console.error(
            "Échec de l'INSCRIPTION:",
            error.response.data || error.response
          )
          // Tente d'extraire les messages de validation détaillés (API Platform violations)
          if (
            error.response.data.violations &&
            error.response.data.violations.length > 0
          ) {
            message = error.response.data.violations
              .map((v: any) => v.message)
              .join(" | ")
          } else if (error.response.data.detail) {
            message = error.response.data.detail
          } else if (error.response.status === 400) {
            message = "Données invalides. L'email est peut-être déjà utilisé."
          } else {
            message = "Échec de l'inscription : " + error.response.statusText
          }
        }

        setErrorMessage(message) // Affiche le message d'erreur à l'utilisateur
      } else {
        // Erreur réseau ou autre erreur non-Axios
        setErrorMessage(
          "Impossible de se connecter au serveur Symfony. (Erreur réseau/CORS)"
        )
      }
    } finally {
      setIsLoading(false) // Arrête le chargement, que ce soit un succès ou un échec
    }
  }

  // STRUCTURE DU FORMULAIRE
  const FormBody = (
    <div className="flex flex-col space-y-4">
      {/* Composant d'affichage des messages d'erreur (si errorMessage est défini) */}
      {errorMessage && (
        <div
          className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-3 rounded-md"
          role="alert"
        >
          <p className="font-bold">Erreur :</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Name Input : Utilise register() de React Hook Form pour lier le champ et définir la validation */}
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

      {/* Password Input (plainPassword) : Validation de longueur minimale (6 caractères) */}
      <div>
        <Label htmlFor="plainPassword">Mot de passe</Label>
        <Input
          id="plainPassword"
          type="password"
          placeholder="********"
          disabled={isLoading}
          {...register("plainPassword", {
            required: "Le mot de passe est requis",
            minLength: {
              value: 6,
              message: "Le mot de passe doit avoir au moins 6 caractères.",
            },
          })}
          className={
            errors.plainPassword
              ? "border-rose-500 focus-visible:ring-rose-500"
              : ""
          }
        />
        {errors.plainPassword && (
          <p className="text-rose-500 text-sm mt-1">
            {errors.plainPassword.message as string}
          </p>
        )}
      </div>

      {/* Avatar Upload (Non obligatoire) : Utilise la logique de Base64 et de prévisualisation */}
      <div className="flex flex-col gap-2">
        <Label>Avatar (Optionnel)</Label>
        <div className="flex items-center space-x-4">
          {/* Avatar cliquable pour déclencher la sélection de fichier */}
          <Avatar
            className="h-16 w-16 border-2 border-primary cursor-pointer"
            onClick={handleAvatarClick}
          >
            <AvatarImage
              src={
                avatarPreview ||
                "https://placehold.co/64x64/E0E0E0/333333?text=AV"
              }
              alt="Avatar Preview"
            />
            <AvatarFallback>AV</AvatarFallback>
          </Avatar>

          {/* Input de type fichier masqué, géré par référence (fileInputRef) */}
          <input
            type="file"
            id="avatar-upload-hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isLoading}
            accept="image/png, image/jpeg"
            style={{ display: "none" }}
          />

          <Button
            type="button"
            onClick={handleAvatarClick}
            variant="outline"
            disabled={isLoading}
          >
            {avatarPreview ? "Changer l'Image" : "Sélectionner une Image"}
          </Button>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Formats acceptés : PNG, JPEG (max 2 Mo).
        </p>
      </div>

      {/* Rôle Checkbox : Permet de définir si l'utilisateur sera un 'Propriétaire' */}
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="isOwner"
          checked={isOwner} // État actuel observé par watch()
          onCheckedChange={toggleOwner} // Fonction qui met à jour la valeur dans le formulaire
          disabled={isLoading}
        />
        <label
          htmlFor="isOwner"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Je suis Propriétaire ⭐️ (Si non coché, vous êtes un Utilisateur
          simple)
        </label>
      </div>
    </div>
  )

  // RENDU DU COMPOSANT (Modal Dialog utilisation de nos composants ShadcnUI))

  return (
    // Contrôle l'ouverture et la fermeture de la boîte de dialogue
    <Dialog open={registerModal.isOpen} onOpenChange={registerModal.onClose}>
      <DialogContent
        className="
          sm:max-w-md md:max-w-xl lg:max-w-lg
          w-[90vw] max-h-[90vh] overflow-y-auto
          p-0 border-0 shadow-lg
        "
      >
        <Card className="border-none shadow-none">
          {/* L'élément form est lié à la fonction onSubmit de React Hook Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* HEADER de la Card */}
            <CardHeader className="p-6 border-b flex flex-row items-center justify-center relative">
              <DialogTitle className="text-2xl font-semibold">
                S'inscrire et définir votre rôle
              </DialogTitle>
            </CardHeader>
            {/* CORPS de la Card (contient le FormBody JSX) */}
            <CardContent className="relative p-6">{FormBody}</CardContent>

            {/* FOOTER de la Card */}
            <CardFooter className="flex flex-col gap-4 p-6">
              <div className="flex flex-col gap-2 w-full">
                {/* Bouton de soumission personnalisé */}
                <CustomButton
                  disabled={isLoading}
                  label={isLoading ? "Connexion en cours..." : "Continuer"}
                  type="submit" // Déclenche la soumission du formulaire
                  onClick={function (
                    e: React.MouseEvent<HTMLButtonElement>
                  ): void {
                    throw new Error("Function not implemented.")
                  }}
                />
              </div>

              {/* Lien pour basculer vers la modal de connexion */}
              <div className="text-neutral-500 text-center mt-4 font-light">
                <p>
                  Vous avez déjà un compte ?
                  <span
                    onClick={onToggle} // Appelle onToggle pour changer de modal
                    className="text-neutral-800 cursor-pointer hover:underline ml-1"
                  >
                    Connectez-vous
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

export default RegisterModal

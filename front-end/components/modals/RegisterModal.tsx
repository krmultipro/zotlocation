/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios"
import { useCallback, useState } from "react"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import useLoginModal from "../../app/hooks/useLoginModal"
import useRegisterModal from "../../app/hooks/useRegisterModal"
import CustomButton from "../CustomButton"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
const SYMFONY_REGISTER_URL = `${API_URL}/api/users`
const SYMFONY_LOGIN_CHECK_URL = `${API_URL}/api/login_check`

interface RegisterFormValues extends FieldValues {
  name: string
  email: string
  plainPassword: string
  isOwner: boolean
  avatar: string
}

const RegisterModal = () => {
  const registerModal = useRegisterModal()
  const loginModal = useLoginModal()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      email: "",
      plainPassword: "",
      isOwner: false,
      avatar: "",
    },
  })

  const isOwner = watch("isOwner")
  const toggleOwner = (checked: boolean) =>
    setValue("isOwner", checked, { shouldValidate: true, shouldDirty: true })

  const handleAvatarChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setAvatarPreview(value)
      setValue("avatar", value, { shouldValidate: true, shouldDirty: true })
    },
    [setValue]
  )

  const onToggle = () => {
    registerModal.onClose()
    loginModal.onOpen()
  }

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await axios.post(SYMFONY_REGISTER_URL, {
        name: data.name,
        email: data.email,
        plainPassword: data.plainPassword,
        isOwner: data.isOwner,
        avatar: data.avatar || null,
      })

      if (response.status === 201) {
        const loginResponse = await axios.post(SYMFONY_LOGIN_CHECK_URL, {
          email: data.email,
          password: data.plainPassword,
        })

        if (loginResponse.data.token) {
          localStorage.setItem("jwtToken", loginResponse.data.token)
        }

        reset()
        registerModal.onClose()
      } else {
        setErrorMessage("Erreur inattendue lors de l'inscription.")
      }
    } catch (error: any) {
      if (error.response?.data) {
        if (error.response.data.violations) {
          setErrorMessage(
            error.response.data.violations
              .map((v: any) => v.message)
              .join(" | ")
          )
        } else {
          setErrorMessage(
            error.response.data.detail || "Erreur lors de l'inscription."
          )
        }
      } else {
        setErrorMessage("Impossible de se connecter au serveur Symfony.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={registerModal.isOpen} onOpenChange={registerModal.onClose}>
      <DialogContent className="sm:max-w-md md:max-w-xl lg:max-w-lg w-[90vw] max-h-[90vh] overflow-y-auto p-0 border-0 shadow-lg">
        <Card className="border-none shadow-none">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="p-6 border-b flex justify-center">
              <DialogTitle className="text-2xl font-semibold">
                S'inscrire et définir votre rôle
              </DialogTitle>
            </CardHeader>
            <CardContent className="relative p-6">
              {errorMessage && (
                <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-3 rounded-md">
                  <p className="font-bold">Erreur :</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              )}

              <div>
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  placeholder="Votre nom"
                  disabled={isLoading}
                  {...register("name", { required: "Le nom est requis" })}
                  className={errors.name ? "border-rose-500" : ""}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  disabled={isLoading}
                  {...register("email", { required: "L'email est requis" })}
                  className={errors.email ? "border-rose-500" : ""}
                />
              </div>

              <div>
                <Label htmlFor="plainPassword">Mot de passe</Label>
                <Input
                  id="plainPassword"
                  type="password"
                  placeholder="********"
                  disabled={isLoading}
                  {...register("plainPassword", {
                    required: "Le mot de passe est requis",
                    minLength: { value: 6, message: "Minimum 6 caractères" },
                  })}
                  className={errors.plainPassword ? "border-rose-500" : ""}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="avatar">URL Avatar (Optionnel)</Label>
                <Input
                  id="avatar"
                  type="text"
                  placeholder="https://example.com/avatar.png"
                  disabled={isLoading}
                  value={avatarPreview}
                  onChange={handleAvatarChange}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Fournir l'URL complète de l'image
                </p>
              </div>

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
            </CardContent>

            <CardFooter className="flex flex-col gap-4 p-6">
              <CustomButton
                disabled={isLoading}
                label={isLoading ? "Inscription en cours..." : "S'inscrire"}
                type="submit"
                onClick={() => {}}
              />
              <div className="text-neutral-500 text-center mt-4 font-light">
                <p>
                  Vous avez déjà un compte ?{" "}
                  <span
                    onClick={onToggle}
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

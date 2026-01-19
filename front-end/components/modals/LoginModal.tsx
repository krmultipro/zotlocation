"use client"

import axios from "axios";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useUser } from "@/app/context/UserProvider";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import CustomButton from "../CustomButton";

const SYMFONY_LOGIN_CHECK_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/login_check`;
const LoginModal = () => {
  const router = useRouter()
  const registerModal = useRegisterModal()
  const loginModal = useLoginModal()
  const { refreshUser } = useUser() // Hook global

  const [isLoading, setIsLoading] = useState(false)

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

  const onToggle = () => {
    loginModal.onClose()
    registerModal.onOpen()
  }

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true)
    try {
      const response = await axios.post(SYMFONY_LOGIN_CHECK_URL, data, {
        headers: { "Content-Type": "application/json" },
      })

      const token = response.data.token

      if (!token) throw new Error("Token JWT non reçu.")

      // Stocke le token et déclenche le refresh du provider
      localStorage.setItem("jwtToken", token)
      refreshUser() // 🔥 met à jour UserProvider immédiatement

      toast.success("Connexion réussie ! Bienvenue sur ZotLocation.", {
        duration: 4000,
      })

      reset()
      loginModal.onClose()
    } catch (error) {
      let message = "Une erreur est survenue lors de la connexion."
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) message = "Identifiants invalides."
        else if (error.response.data?.detail)
          message = error.response.data.detail
      }
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const FormBody = (
    <div className="flex flex-col space-y-4">
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="email@exemple.com"
          disabled={isLoading}
          {...register("email", { required: "L'email est requis" })}
          className={errors.email ? "border-rose-500" : ""}
        />
        {errors.email && (
          <p className="text-rose-500 text-sm mt-1">
            {errors.email.message as string}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="login-password">Mot de passe</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="********"
          disabled={isLoading}
          {...register("password", { required: "Le mot de passe est requis" })}
          className={errors.password ? "border-rose-500" : ""}
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
      <DialogContent className="sm:max-w-md w-[90vw] p-0 border-0 shadow-lg">
        <Card className="border-none shadow-none">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="p-6 border-b text-center">
              <DialogTitle className="text-2xl font-semibold">
                Se connecter
              </DialogTitle>
            </CardHeader>

            <CardContent className="p-6">{FormBody}</CardContent>

            <CardFooter className="flex flex-col gap-4 p-6">
              <CustomButton
                disabled={isLoading}
                label={isLoading ? "Connexion en cours..." : "Connexion"}
                type="submit"
              />
              <div className="text-neutral-500 text-center mt-4 font-light">
                <p>
                  Première fois sur notre plateforme ?
                  <span
                    onClick={onToggle}
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

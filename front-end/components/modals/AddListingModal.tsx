/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function AddListingModal({ open, onOpenChange }: any) {
  const [mounted, setMounted] = useState(false)
  const [typeLogement, setTypeLogement] = useState<"maison" | "appartement">(
    "maison"
  )
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [availableOptions, setAvailableOptions] = useState<any[]>([])

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open && mounted) {
      const fetchData = async () => {
        try {
          const [resCats, resOpts] = await Promise.all([
            fetch(`${API_URL}/api/categories`).then((r) => r.json()),
            fetch(`${API_URL}/api/options`).then((r) => r.json()),
          ])
          setCategories(resCats.member || [])
          setAvailableOptions(resOpts.member || [])
        } catch (err) {
          console.error("Erreur de chargement des données API", err)
        }
      }
      fetchData()
    }
  }, [open, mounted, API_URL])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const token = localStorage.getItem("jwtToken")

    try {
      // 1. Récupération de l'URL saisie manuellement
      let finalImageUrl = formData.get("imageUrl") as string

      // 2. Gestion de l'upload fichier (Prioritaire si présent)
      if (imageFile) {
        const imgData = new FormData()
        imgData.append("file", imageFile)
        const up = await axios.post(`${API_URL}/api/upload-image`, imgData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        // Construction de l'URL absolue pour Next/Image
        finalImageUrl = `${API_URL}${up.data.url}`
      }

      // 3. Image de secours (Placeholder neutre si aucun des deux n'est rempli)
      const fallback =
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000"

      const payload: any = {
        title: formData.get("title"),
        description: formData.get("description"),
        pricePerNight: Number(formData.get("pricePerNight")),
        capacity: Number(formData.get("capacity")),
        category: `/api/categories/${formData.get("category")}`,
        options: formData.getAll("options[]").map((id) => `/api/options/${id}`),
        images: [{ url: finalImageUrl || fallback }],
      }

      // Logique Héritage
      if (typeLogement === "maison") {
        payload.type = "house"
        payload.gardenSize = Number(formData.get("gardenSize") || 0)
        payload.hasGarage = formData.get("hasGarage") === "oui"
      } else {
        payload.type = "apartment"
        payload.numberOfRooms = Number(formData.get("numberOfRooms") || 1)
        payload.balcony = formData.get("balcony") === "oui"
      }

      await axios.post(`${API_URL}/api/listings`, payload, {
        headers: {
          "Content-Type": "application/ld+json",
          Authorization: `Bearer ${token}`,
        },
      })

      // ✅ NOTIFICATION DE SUCCÈS
      toast.success("Annonce créée avec succès !")

      // On ferme la modale avant le rechargement
      if (onOpenChange) onOpenChange(false)

      // Petit délai pour laisser le temps au toast d'être vu
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      console.error(err)
      toast.error("Erreur lors de la création de l'annonce")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mettre mon logement en ligne</DialogTitle>
          <DialogDescription>
            Remplissez les détails de votre annonce pour la publier sur la
            plateforme.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <Label className="font-bold">Type de bien</Label>
            <RadioGroup
              defaultValue="maison"
              onValueChange={(v) => setTypeLogement(v as any)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1">
                <RadioGroupItem value="maison" id="type-maison" />
                <Label htmlFor="type-maison" className="cursor-pointer">
                  Maison
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1">
                <RadioGroupItem value="appartement" id="type-appartement" />
                <Label htmlFor="type-appartement" className="cursor-pointer">
                  Appartement
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                name="title"
                id="title"
                placeholder="Ex: Villa bord de mer"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                name="description"
                id="description"
                placeholder="Décrivez votre bien..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
            {typeLogement === "maison" ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="gardenSize">Surface jardin (m²)</Label>
                  <Input
                    name="gardenSize"
                    id="gardenSize"
                    type="number"
                    defaultValue={0}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Garage ?</Label>
                  <Select name="hasGarage" defaultValue="non">
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oui">Oui</SelectItem>
                      <SelectItem value="non">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="numberOfRooms">Nombre de pièces</Label>
                  <Input
                    name="numberOfRooms"
                    id="numberOfRooms"
                    type="number"
                    defaultValue={1}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Balcon ?</Label>
                  <Select name="balcony" defaultValue="non">
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oui">Oui</SelectItem>
                      <SelectItem value="non">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Prix / nuit (€)</Label>
              <Input name="pricePerNight" type="number" required />
            </div>
            <div className="grid gap-2">
              <Label>Capacité</Label>
              <Input name="capacity" type="number" required />
            </div>
            <div className="grid gap-2">
              <Label>Catégorie</Label>
              <Select name="category" required key={`cat-${categories.length}`}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(categories) &&
                    categories.map(
                      (cat) =>
                        cat?.id && (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        )
                    )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2 border p-4 rounded-xl">
            <Label className="font-bold text-xs uppercase opacity-50">
              Options & Équipements
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {Array.isArray(availableOptions) &&
                availableOptions.map(
                  (opt) =>
                    opt?.id && (
                      <div key={opt.id} className="flex items-center space-x-2">
                        <Checkbox
                          name="options[]"
                          value={opt.id.toString()}
                          id={`opt-${opt.id}`}
                        />
                        <Label
                          htmlFor={`opt-${opt.id}`}
                          className="cursor-pointer text-sm"
                        >
                          {opt.name}
                        </Label>
                      </div>
                    )
                )}
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <Label className="font-bold">Photos</Label>
            <div className="grid gap-2">
              <Label className="text-xs text-gray-500">
                Uploader un fichier
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs text-gray-500">
                Ou lien URL direct (Unsplash, Pexels...)
              </Label>
              <Input
                name="imageUrl"
                type="url"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || categories.length === 0}
              className="bg-rose-600 text-white px-10"
            >
              {isLoading ? "Envoi en cours..." : "Publier l'annonce"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

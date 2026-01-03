/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
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

interface ModalAjoutAnnonceProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  listing?: any
}

export default function ModalAjoutAnnonce({
  open,
  onOpenChange,
  listing,
}: ModalAjoutAnnonceProps) {
  const [typeLogement, setTypeLogement] = useState<"maison" | "appartement">(
    "maison"
  )
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [categories, setCategories] = useState<any[]>([])
  const [availableOptions, setAvailableOptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isEditing = !!listing
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000"

  // 1. Chargement synchronisé des Catégories et des Options
  useEffect(() => {
    if (!open) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [catRes, optRes] = await Promise.all([
          fetch(`${apiUrl}/api/categories`).then((res) => res.json()),
          fetch(`${apiUrl}/api/options`).then((res) => res.json()),
        ])

        setCategories(catRes.member || catRes["hydra:member"] || catRes || [])
        setAvailableOptions(
          optRes.member || optRes["hydra:member"] || optRes || []
        )
      } catch (err) {
        console.error("Erreur chargement API :", err)
        toast.error("Erreur lors de la récupération des options/catégories")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [open, apiUrl])

  useEffect(() => {
    if (listing) {
      setTypeLogement(
        listing.pieces || listing.balcon ? "appartement" : "maison"
      )
    }
  }, [listing, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const token = localStorage.getItem("jwtToken")

    try {
      const url = `${apiUrl}/api/listings/${isEditing ? listing.id : ""}`

      if (isEditing && !imageFile) {
        // --- MODE PATCH (JSON) ---
        const rawData = Object.fromEntries(formData.entries())
        // On récupère toutes les options cochées sous forme de tableau d'IRIs
        const selectedOptions = formData.getAll("options[]")

        const payload: any = {
          title: rawData.title,
          description: rawData.description,
          pricePerNight: parseFloat(rawData.pricePerNight as string),
          capacity: parseInt(rawData.capacity as string, 10),
          category: rawData.category,
          options: selectedOptions,
        }

        if (typeLogement === "maison")
          payload.jardin = parseFloat(rawData.jardin as string)
        else payload.pieces = parseInt(rawData.pieces as string, 10)

        await axios.patch(url, payload, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/merge-patch+json",
          },
        })
      } else {
        // --- MODE POST (FormData) ---
        if (imageFile) formData.append("images[0][file]", imageFile)
        const finalUrl = isEditing ? `${url}?_method=PATCH` : url
        await axios.post(finalUrl, formData, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        })
      }

      toast.success(isEditing ? "Annonce mise à jour !" : "Annonce créée !")
      onOpenChange?.(false)
      window.location.reload()
    } catch (err: any) {
      console.error(err.response?.data)
      toast.error("Erreur lors de la sauvegarde")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'annonce" : "Ajouter un logement"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Type de bien */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Type de bien</Label>
            <RadioGroup
              key={listing?.id || "new"}
              defaultValue={
                isEditing
                  ? listing.pieces
                    ? "appartement"
                    : "maison"
                  : "maison"
              }
              onValueChange={(v) => setTypeLogement(v as any)}
            >
              <div className="flex gap-6 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maison" id="m" />
                  <Label htmlFor="m" className="cursor-pointer">
                    Maison
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="appartement" id="a" />
                  <Label htmlFor="a" className="cursor-pointer">
                    Appartement
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              name="title"
              defaultValue={listing?.title || ""}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={listing?.description || ""}
              required
              rows={4}
            />
          </div>

          {/* Catégories */}
          <div className="grid gap-2">
            <Label>Catégorie</Label>
            <Select
              name="category"
              key={listing?.id}
              defaultValue={
                listing?.category?.["@id"] ||
                `/api/categories/${listing?.category?.id}` ||
                ""
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoading ? "Chargement..." : "Sélectionner une catégorie"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c: any) => (
                  <SelectItem key={c.id} value={`/api/categories/${c.id}`}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options et Équipements */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Équipements et Options
            </Label>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-xl bg-slate-50/50">
              {availableOptions.map((opt: any) => {
                const optIri = `/api/options/${opt.id}`
                // On vérifie si l'IRI de l'option est présent dans les options du listing
                const isChecked = listing?.options?.some(
                  (listingOpt: any) =>
                    listingOpt["@id"] === optIri || listingOpt.id === opt.id
                )

                return (
                  <div key={opt.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`opt-${opt.id}`}
                      name="options[]"
                      value={optIri}
                      defaultChecked={isChecked}
                    />
                    <label
                      htmlFor={`opt-${opt.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {opt.name}
                    </label>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pricePerNight">Prix par nuit (€)</Label>
              <Input
                id="pricePerNight"
                name="pricePerNight"
                type="number"
                step="0.01"
                defaultValue={listing?.pricePerNight || ""}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacité (personnes)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                defaultValue={listing?.capacity || ""}
                required
              />
            </div>
          </div>

          {typeLogement === "maison" ? (
            <div className="grid gap-2">
              <Label htmlFor="jardin">Taille du jardin (m²)</Label>
              <Input
                id="jardin"
                name="jardin"
                type="number"
                defaultValue={listing?.jardin || ""}
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="pieces">Nombre de pièces</Label>
              <Input
                id="pieces"
                name="pieces"
                type="number"
                defaultValue={listing?.pieces || ""}
              />
            </div>
          )}

          <div className="grid gap-2 border-t pt-4">
            <Label htmlFor="image">
              Image principale{" "}
              {isEditing && "(Laissez vide pour conserver l'actuelle)"}
            </Label>
            <Input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              required={!isEditing}
            />
          </div>

          <div className="flex gap-3 justify-end sticky bottom-0 bg-white py-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-8"
            >
              {isEditing ? "Mettre à jour" : "Créer l'annonce"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

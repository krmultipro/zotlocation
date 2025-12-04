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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { IconType } from "react-icons"
import {
  TbBeach,
  TbBuilding,
  TbCrown,
  TbHome,
  TbMountain,
  TbPool,
  TbSparkles,
  TbTent,
  TbTrees,
  TbVolcano,
} from "react-icons/tb"

interface ModalAjoutAnnonceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Category {
  id: number
  name: string
}

const categoryIcons: Record<string, IconType> = {
  Camping: TbTent,
  Montagne: TbMountain,
  Plage: TbBeach,
  Bassin: TbPool,
  Luxe: TbCrown,
  Moderne: TbBuilding,
  Forêt: TbTrees,
  Volcan: TbVolcano,
  Insolite: TbSparkles,
  Traditionnelle: TbHome,
}

const optionsList = [
  { id: 22, name: "Vue sur l’océan Indien" },
  { id: 23, name: "Vue sur le Piton de la Fournaise" },
  { id: 24, name: "Vue sur les cirques" },
  { id: 25, name: "Piscine privée" },
  { id: 26, name: "Piscine chauffée" },
  { id: 27, name: "Jacuzzi" },
  { id: 28, name: "Climatisation" },
  { id: 29, name: "Ventilateur plafond" },
  { id: 30, name: "Cuisine équipée créole" },
  { id: 31, name: "Barbecue créole" },
  { id: 32, name: "Varangue" },
  { id: 33, name: "Jardin tropical" },
  { id: 34, name: "Proximité plage" },
  { id: 35, name: "Proximité randonnée" },
  { id: 36, name: "Wi-Fi fibre" },
  { id: 37, name: "Parking sécurisé" },
  { id: 38, name: "Accès PMR" },
  { id: 39, name: "Lit bébé" },
  { id: 40, name: "Animaux acceptés" },
  { id: 41, name: "Équipement snorkeling" },
  { id: 42, name: "Case en bois sous tôle" },
  { id: 43, name: "Cuisine extérieure" },
  { id: 44, name: "Douche extérieure tropicale" },
  { id: 45, name: "Lit à baldaquin moustiquaire" },
  { id: 46, name: "Dodo au rhum offert" },
  { id: 47, name: "Mobilier créole authentique" },
  { id: 48, name: "Caris maison à la demande" },
  { id: 49, name: "Jardin avec plantes endémiques" },
  { id: 50, name: "Vue sur bananeraie" },
  { id: 51, name: "Varangue créole" },
]

export default function ModalAjoutAnnonce({
  open,
  onOpenChange,
}: ModalAjoutAnnonceProps) {
  const [typeLogement, setTypeLogement] = useState<"maison" | "appartement">(
    "maison"
  )
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])

  useEffect(() => {
    fetch("https://localhost:8000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.member || []))
      .catch((err) => console.error("Erreur récupération catégories :", err))
  }, [])

  const handleOptionChange = (id: number) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedCategory) {
      toast.error("Veuillez sélectionner une catégorie")
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)

    const annonce: any = {
      title: formData.get("title"),
      description: formData.get("description"),
      pricePerNight: Number(formData.get("price")),
      capacity: Number(formData.get("capacity")),
      category: `https://localhost:8000/api/categories/${selectedCategory}`,
      images: [{ url: formData.get("imageUrl") }],
      options: selectedOptions.map(
        (id) => `https://localhost:8000/api/options/${id}`
      ),
      type: typeLogement,
    }

    if (typeLogement === "maison") {
      annonce.gardenSize = Number(formData.get("gardenSize"))
      annonce.hasGarage = formData.get("garage") === "oui"
    } else if (typeLogement === "appartement") {
      annonce.numberOfRooms = Number(formData.get("numberOfRooms"))
      annonce.balcony = formData.get("balcony") === "oui"
    }

    try {
      const token = localStorage.getItem("jwtToken") // récupérer ton token
      if (!token) {
        toast.error("Vous devez être connecté")
        return
      }

      const res = await fetch("https://localhost:8000/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(annonce),
      })

      if (!res.ok) throw new Error(`Erreur : ${res.status}`)

      toast.success("Annonce créée avec succès !")
      onOpenChange(false)
      form.reset()
      setSelectedCategory(null)
      setSelectedOptions([])
    } catch (err) {
      console.error("Erreur lors de la création de l'annonce :", err)
      toast.error("Impossible de créer l'annonce")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter votre logement</DialogTitle>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Type de logement */}
          <FieldGroup>
            <FieldSet>
              <FieldLabel>Que souhaitez-vous proposer ?</FieldLabel>
              <RadioGroup
                defaultValue="maison"
                onValueChange={(v) =>
                  setTypeLogement(v as "maison" | "appartement")
                }
              >
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="maison" /> Maison
                </label>
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="appartement" /> Appartement
                </label>
              </RadioGroup>
            </FieldSet>
          </FieldGroup>

          {/* Titre */}
          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Ex: Villa créole avec vue sur l'océan"
            />
          </div>

          {/* Description */}
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Charmante villa avec piscine..."
            />
          </Field>

          {/* Champs maison */}
          {typeLogement === "maison" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="gardenSize">Taille du jardin (m²)</Label>
                <Input
                  id="gardenSize"
                  name="gardenSize"
                  type="number"
                  min={0}
                />
              </div>
              <FieldGroup>
                <FieldSet>
                  <FieldLabel>Garage</FieldLabel>
                  <RadioGroup name="garage" defaultValue="non">
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="oui" /> Oui
                    </label>
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="non" /> Non
                    </label>
                  </RadioGroup>
                </FieldSet>
              </FieldGroup>
            </>
          )}

          {/* Champs appartement */}
          {typeLogement === "appartement" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="numberOfRooms">Nombre de pièces</Label>
                <Input
                  id="numberOfRooms"
                  name="numberOfRooms"
                  type="number"
                  min={1}
                />
              </div>
              <FieldGroup>
                <FieldSet>
                  <FieldLabel>Balcon</FieldLabel>
                  <RadioGroup name="balcony" defaultValue="non">
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="oui" /> Oui
                    </label>
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="non" /> Non
                    </label>
                  </RadioGroup>
                </FieldSet>
              </FieldGroup>
            </>
          )}

          {/* Prix */}
          <div className="grid gap-2">
            <Label htmlFor="price">Prix par nuit</Label>
            <Input id="price" name="price" type="number" min={0} step={1} />
          </div>

          {/* Capacité */}
          <div className="grid gap-2">
            <Label htmlFor="capacity">Capacité</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              step={1}
            />
          </div>

          {/* Image */}
          <div className="grid gap-2">
            <Label htmlFor="imageUrl">URL de l&apos;image</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="text"
              placeholder="https://..."
            />
          </div>

          {/* Catégorie */}
          <Field>
            <FieldLabel>Catégorie</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.name] || TbHome
                const selected = selectedCategory === cat.id
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center p-2 border rounded-md ${
                      selected ? "border-green-500" : "border-gray-300"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs">{cat.name}</span>
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Options */}
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Options</FieldLegend>
              <div className="grid grid-cols-2 gap-2">
                {optionsList.map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedOptions.includes(opt.id)}
                      onCheckedChange={() => handleOptionChange(opt.id)}
                    />
                    {opt.name}
                  </label>
                ))}
              </div>
            </FieldSet>
          </FieldGroup>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Ajouter le logement</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

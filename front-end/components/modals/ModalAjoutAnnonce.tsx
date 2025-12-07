/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
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
import { useState } from "react"

interface ModalAjoutAnnonceProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function ModalAjoutAnnonce({
  open,
  onOpenChange,
}: ModalAjoutAnnonceProps) {
  const [isOpen, setOpen] = useState(false)
  const [typeLogement, setTypeLogement] = useState<"maison" | "appartement">(
    "maison"
  )
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    if (imageFile) {
      formData.append("images[0][file]", imageFile) // API Platform attend un array pour images
    }

    try {
      const token = localStorage.getItem("jwtToken")
      await axios.post("https://localhost:8000/api/listings", formData, {
        headers: {
          // NE PAS définir Content-Type pour FormData
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      })

      // Fermeture et reset
      setOpen(false)
      form.reset()
      setImageFile(null)

      // Refresh pour voir la nouvelle annonce
      window.location.reload()
    } catch (err: any) {
      console.error(
        "Erreur lors de la création :",
        err.response?.data || err.message
      )
      alert("Erreur lors de la création de l'annonce")
    }
  }

  return (
    <Dialog open={open ?? isOpen} onOpenChange={onOpenChange ?? setOpen}>
      <DialogTrigger asChild></DialogTrigger>

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
                onValueChange={(value) =>
                  setTypeLogement(value as "maison" | "appartement")
                }
              >
                <FieldLabel htmlFor="maison">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Maison</FieldTitle>
                    </FieldContent>
                    <RadioGroupItem value="maison" id="maison" />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="appartement">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Appartement</FieldTitle>
                    </FieldContent>
                    <RadioGroupItem value="appartement" id="appartement" />
                  </Field>
                </FieldLabel>
              </RadioGroup>
            </FieldSet>
          </FieldGroup>

          {/* Titre */}
          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Magnifique villa à la Réunion"
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
              placeholder="Ex: Villa luxueuse avec piscine, 3 chambres, vue imprenable sur l’océan..."
              rows={4}
              required
            />
          </Field>

          {/* Maison */}
          {typeLogement === "maison" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="jardin">Taille du jardin (m²)</Label>
                <Input
                  id="jardin"
                  name="jardin"
                  type="number"
                  placeholder="200"
                  min="0"
                />
              </div>

              <FieldGroup>
                <FieldSet>
                  <FieldLabel>Garage</FieldLabel>
                  <RadioGroup defaultValue="non" name="garage">
                    <FieldLabel htmlFor="garage-oui">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Oui</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem value="oui" id="garage-oui" />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="garage-non">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Non</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem value="non" id="garage-non" />
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                </FieldSet>
              </FieldGroup>
            </>
          )}

          {/* Appartement */}
          {typeLogement === "appartement" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="pieces">Nombre de pièces</Label>
                <Input
                  id="pieces"
                  name="pieces"
                  type="number"
                  placeholder="3"
                  min="1"
                  required
                />
              </div>

              <FieldGroup>
                <FieldSet>
                  <FieldLabel>Balcon</FieldLabel>
                  <RadioGroup defaultValue="non" name="balcon">
                    <FieldLabel htmlFor="balcon-oui">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Oui</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem value="oui" id="balcon-oui" />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="balcon-non">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Non</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem value="non" id="balcon-non" />
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                </FieldSet>
              </FieldGroup>
            </>
          )}

          {/* Prix */}
          <div className="grid gap-2">
            <Label htmlFor="price">Prix par nuit</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
              <Input
                id="price"
                name="pricePerNight"
                type="number"
                placeholder="150"
                min="0"
                step="1"
                className="pl-8"
                required
              />
            </div>
          </div>

          {/* Capacité */}
          <div className="grid gap-2">
            <Label htmlFor="capacity">Capacité (nombre de personnes)</Label>
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
            <Select name="category">
              <SelectTrigger>
                <SelectValue placeholder="Choisissez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="camping">Camping</SelectItem>
                <SelectItem value="montagne">Montagne</SelectItem>
                <SelectItem value="plage">Plage</SelectItem>
                <SelectItem value="bassin">Bassin</SelectItem>
                <SelectItem value="luxe">Luxe</SelectItem>
                <SelectItem value="moderne">Moderne</SelectItem>
                <SelectItem value="foret">Forêt</SelectItem>
                <SelectItem value="volcan">Volcan</SelectItem>
                <SelectItem value="insolite">Insolite</SelectItem>
                <SelectItem value="traditionnelle">Traditionnelle</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>
              Sélectionnez la catégorie qui correspond le mieux à votre
              logement.
            </FieldDescription>
          </Field>

          {/* Options */}
          <FieldGroup>
            <FieldSet>
              <FieldLegend variant="label">
                Choisissez une ou plusieurs options
              </FieldLegend>
              <FieldGroup className="flex flex-row flex-wrap gap-3">
                <Field orientation="horizontal">
                  <Checkbox
                    id="wifi"
                    name="options[]"
                    value="wifi"
                    defaultChecked
                  />
                  <FieldLabel htmlFor="wifi" className="font-normal">
                    WiFi
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox id="parking" name="options[]" value="parking" />
                  <FieldLabel htmlFor="parking" className="font-normal">
                    Parking
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox id="piscine" name="options[]" value="piscine" />
                  <FieldLabel htmlFor="piscine" className="font-normal">
                    Piscine
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox id="clim" name="options[]" value="clim" />
                  <FieldLabel htmlFor="clim" className="font-normal">
                    Climatisation
                  </FieldLabel>
                </Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>

          {/* Image */}
          <div className="grid gap-2">
            <Label htmlFor="image">Image principale</Label>
            <Input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0])
                }
              }}
              required
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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

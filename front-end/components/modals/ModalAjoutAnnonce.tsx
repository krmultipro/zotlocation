/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function ModalAjoutAnnonce({ open, onOpenChange, listingToEdit }: any) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [categories, setCategories] = useState<any[]>([])
  const [availableOptions, setAvailableOptions] = useState<any[]>([])
  const [localisations, setLocalisations] = useState<any[]>([])

  // 💡 ÉTATS CONTRÔLÉS POUR TOUS LES CHAMPS (Correction du blocage 'required')
  const [typeLogement, setTypeLogement] = useState<"maison" | "appartement">("maison")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [capacity, setCapacity] = useState<string>("")

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000"
  const isEditMode = !!listingToEdit

  useEffect(() => { setMounted(true) }, [])

  // Initialisation au chargement
  useEffect(() => {
    if (listingToEdit && open) {
      setTypeLogement(listingToEdit.gardenSize !== undefined ? "maison" : "appartement")
      setTitle(listingToEdit.title || "")
      setDescription(listingToEdit.description || "")
      setSelectedCity(listingToEdit.localisation?.id?.toString() || "")
      setSelectedCategory(listingToEdit.category?.id?.toString() || "")
      setPrice(listingToEdit.pricePerNight?.toString() || "")
      setCapacity(listingToEdit.capacity?.toString() || "")
    } else if (open) {
      // Reset pour création
      setTitle(""); setDescription(""); setSelectedCity(""); setSelectedCategory("");
      setPrice(""); setCapacity(""); setTypeLogement("maison")
    }
  }, [listingToEdit, open])

  useEffect(() => {
    if (open && mounted) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("jwtToken")
          const config = { headers: { 'accept': 'application/ld+json', 'Authorization': `Bearer ${token}` } }
          const [resCats, resOpts, resLocs] = await Promise.all([
            axios.get(`${API_URL}/api/categories`, config),
            axios.get(`${API_URL}/api/options`, config),
            axios.get(`${API_URL}/api/localisations`, config)
          ])
          setCategories(resCats.data.member || [])
          setAvailableOptions(resOpts.data.member || [])
          setLocalisations(resLocs.data.member || [])
        } catch (err) { console.error(err) }
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
      let finalImageUrl = formData.get("imageUrl") as string
      if (imageFile) {
        const imgData = new FormData(); imgData.append("file", imageFile)
        const up = await axios.post(`${API_URL}/api/upload-image`, imgData, { headers: { Authorization: `Bearer ${token}` } })
        finalImageUrl = `${API_URL}${up.data.url}`
      }

      const payload: any = {
        title,
        description,
        pricePerNight: Number(price),
        capacity: Number(capacity),
        category: `/api/categories/${selectedCategory}`,
        localisation: `/api/localisations/${selectedCity}`,
        options: formData.getAll("options[]").map((id) => `/api/options/${id}`),
      }

      if (finalImageUrl) payload.images = [{ url: finalImageUrl }]

      if (typeLogement === "maison") {
        payload.gardenSize = Number(formData.get("gardenSize") || 0)
        payload.hasGarage = formData.get("hasGarage") === "oui"
      } else {
        payload.numberOfRooms = Number(formData.get("numberOfRooms") || 1)
        payload.balcony = formData.get("balcony") === "oui"
      }

      if (isEditMode) {
        await axios.patch(`${API_URL}/api/listings/${listingToEdit.id}`, payload, {
          headers: { "Content-Type": "application/merge-patch+json", Authorization: `Bearer ${token}` }
        })
        toast.success("Modifié avec succès !")
      } else {
        payload.type = typeLogement === "maison" ? "house" : "apartment"
        await axios.post(`${API_URL}/api/listings`, payload, {
          headers: { "Content-Type": "application/ld+json", Authorization: `Bearer ${token}` }
        })
        toast.success("Créé avec succès !")
      }
      onOpenChange(false); setTimeout(() => window.location.reload(), 800)
    } catch (err) { toast.error("Erreur lors de l'envoi") } finally { setIsLoading(false) }
  }

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Modifier mon annonce" : "Mettre mon logement en ligne"}</DialogTitle>
          <DialogDescription>Tous les champs sont pré-remplis. Modifiez uniquement ce que vous voulez.</DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* TYPE DE LOGEMENT */}
          <div className="space-y-3">
            <Label className="font-bold">Type de bien</Label>
            <RadioGroup disabled={isEditMode} value={typeLogement} onValueChange={(v) => setTypeLogement(v as any)} className="flex gap-4">
              <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1">
                <RadioGroupItem value="maison" id="type-maison" />
                <Label htmlFor="type-maison">Maison</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1">
                <RadioGroupItem value="appartement" id="type-appartement" />
                <Label htmlFor="type-appartement">Appartement</Label>
              </div>
            </RadioGroup>
          </div>

          {/* TITRE & DESCRIPTION */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Titre</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="min-h-[120px]" />
            </div>
          </div>

          {/* CHAMPS SPÉCIFIQUES RESTAURÉS */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
            {typeLogement === "maison" ? (
              <>
                <div className="grid gap-2">
                  <Label>Surface jardin (m²)</Label>
                  <Input name="gardenSize" type="number" defaultValue={listingToEdit?.gardenSize || 0} />
                </div>
                <div className="grid gap-2">
                  <Label>Garage ?</Label>
                  <Select name="hasGarage" defaultValue={listingToEdit?.hasGarage ? "oui" : "non"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="oui">Oui</SelectItem><SelectItem value="non">Non</SelectItem></SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label>Nombre de pièces</Label>
                  <Input name="numberOfRooms" type="number" defaultValue={listingToEdit?.numberOfRooms || 1} required />
                </div>
                <div className="grid gap-2">
                  <Label>Balcon ?</Label>
                  <Select name="balcony" defaultValue={listingToEdit?.balcony ? "oui" : "non"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="oui">Oui</SelectItem><SelectItem value="non">Non</SelectItem></SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {/* VILLE & CATÉGORIE */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Ville</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity} required>
                <SelectTrigger><SelectValue placeholder="Où se situe le bien ?" /></SelectTrigger>
                <SelectContent position="popper" className="z-9999 max-h-[200px]">
                  {localisations.map((loc) => <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Catégorie</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent position="popper" className="z-9999 max-h-[200px]">
                  {categories.map((cat) => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PRIX & CAPACITÉ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Prix / nuit (€)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>Capacité (pers.)</Label>
              <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
            </div>
          </div>


          <div className="grid gap-2 border p-4 rounded-xl">
            <Label className="font-bold text-xs opacity-50 uppercase italic">Équipements</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableOptions.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <Checkbox
                    name="options[]"
                    value={opt.id.toString()}
                    id={`opt-${opt.id}`}
                    defaultChecked={listingToEdit?.options?.some((o: any) => o.id === opt.id)}
                  />
                  <Label htmlFor={`opt-${opt.id}`} className="cursor-pointer text-sm">{opt.name}</Label>
                </div>
              ))}
            </div>
          </div>


          <div className="border-t pt-4 space-y-4">
            <Label className="font-bold">Photos</Label>
            <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            <Input name="imageUrl" type="url" placeholder="Ou URL directe" defaultValue={listingToEdit?.images?.[0]?.url} />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 text-white px-10">
              {isLoading ? "Envoi..." : isEditMode ? "Enregistrer" : "Publier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
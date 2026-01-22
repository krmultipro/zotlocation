/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function AddListingModal({ open, onOpenChange, listingToEdit }: any) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [categories, setCategories] = useState<any[]>([])
  const [availableOptions, setAvailableOptions] = useState<any[]>([])
  const [localisations, setLocalisations] = useState<any[]>([])

  // États du formulaire
  const [typeLogement, setTypeLogement] = useState<"maison" | "appartement">("maison")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [capacity, setCapacity] = useState<string>("")
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [manualImageUrl, setManualImageUrl] = useState("")

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000"
  const isEditMode = !!listingToEdit

  useEffect(() => { setMounted(true) }, [])

  // Remplissage auto lors de l'édition
  useEffect(() => {
    if (listingToEdit && open) {
      // Détection du type basée sur les propriétés présentes dans l'objet reçu du back
      const isHouse = Object.prototype.hasOwnProperty.call(listingToEdit, 'gardenSize');
      setTypeLogement(isHouse ? "maison" : "appartement")

      setTitle(listingToEdit.title || "")
      setDescription(listingToEdit.description || "")
      setSelectedCity(listingToEdit.localisation?.id?.toString() || "")
      setSelectedCategory(listingToEdit.category?.id?.toString() || "")
      setPrice(listingToEdit.pricePerNight?.toString() || "")
      setCapacity(listingToEdit.capacity?.toString() || "")
      setSelectedOptions(listingToEdit.options?.map((o: any) => o.id.toString()) || [])
      setManualImageUrl(listingToEdit.images?.[0]?.url || "")
    } else if (open) {
      setTitle(""); setDescription(""); setSelectedCity(""); setSelectedCategory("");
      setPrice(""); setCapacity(""); setTypeLogement("maison"); setSelectedOptions([]);
      setManualImageUrl(""); setImageFile(null);
    }
  }, [listingToEdit, open])

  // Chargement des données de référence
  useEffect(() => {
    if (open && mounted) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("jwtToken")
          const config = { headers: { 'Accept': 'application/ld+json', 'Authorization': `Bearer ${token}` } }
          const [resCats, resOpts, resLocs] = await Promise.all([
            axios.get(`${API_URL}/api/categories`, config),
            axios.get(`${API_URL}/api/options`, config),
            axios.get(`${API_URL}/api/localisations`, config)
          ])
          setCategories(resCats.data["hydra:member"] || resCats.data.member || [])
          setAvailableOptions(resOpts.data["hydra:member"] || resOpts.data.member || [])
          setLocalisations(resLocs.data["hydra:member"] || resLocs.data.member || [])
        } catch (error) {
            toast.error("Erreur lors de la récupération des options");
        }
      }
      fetchData()
    }
  }, [open, mounted, API_URL])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("jwtToken");
    const formData = new FormData(e.currentTarget);

    try {
      let imageToSubmit = manualImageUrl.trim();

      // Gestion Upload Image
      if (imageFile) {
        const imgData = new FormData();
        imgData.append("file", imageFile);
        const up = await axios.post(`${API_URL}/api/upload-image`, imgData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        imageToSubmit = up.data.url.startsWith('http') ? up.data.url : `${API_URL}${up.data.url}`;
      }

      // Payload de base (Listing)
      const payload: any = {
        title,
        description,
        pricePerNight: parseFloat(price),
        capacity: parseInt(capacity),
        category: `/api/categories/${selectedCategory}`,
        localisation: `/api/localisations/${selectedCity}`,
        options: selectedOptions.map(id => `/api/options/${id}`),
        images: imageToSubmit ? [{ url: imageToSubmit }] : []
      };

      // 💡 GESTION DE L'HÉRITAGE ET DES ENDPOINTS SPÉCIFIQUES
      let endpoint = "listings";
      if (typeLogement === "maison") {
        payload.gardenSize = parseFloat(formData.get("gardenSize")?.toString() || "0");
        payload.hasGarage = formData.get("hasGarage") === "oui";
        if (!isEditMode) endpoint = "house_listings"; // Endpoint pour créer une maison
      } else {
        payload.numberOfRooms = parseInt(formData.get("numberOfRooms")?.toString() || "1");
        payload.balcony = formData.get("balcony") === "oui";
        if (!isEditMode) endpoint = "apartment_listings"; // Endpoint pour créer un appartement
      }

      if (payload.images.length === 0 || payload.options.length === 0) {
        toast.error("Veuillez ajouter une image et un équipement.");
        setIsLoading(false);
        return;
      }

      const config = {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/ld+json",
          "Content-Type": isEditMode ? "application/merge-patch+json" : "application/ld+json"
        }
      };

      // URL dynamique : on utilise l'id pour PATCH, l'endpoint de type pour POST
      const finalUrl = isEditMode
        ? `${API_URL}/api/listings/${listingToEdit.id}`
        : `${API_URL}/api/${endpoint}`;

      if (isEditMode) {
        await axios.patch(finalUrl, payload, config);
        toast.success("Annonce mise à jour !");
      } else {
        await axios.post(finalUrl, payload, config);
        toast.success("Annonce publiée !");
      }

      onOpenChange(false);
      router.push("/dashboard#locations");
      setTimeout(() => window.location.reload(), 500);

    } catch (err: any) {
      console.error("Erreur enregistrement:", err.response?.data);
      const violations = err.response?.data?.violations;
      if (violations) {
        violations.forEach((v: any) => toast.error(v.message));
      } else {
        toast.error("Erreur lors de l'enregistrement.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Modifier l'annonce" : "Publier une nouvelle annonce"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* SÉLECTEUR DE TYPE */}
          <RadioGroup
            value={typeLogement}
            onValueChange={(v) => setTypeLogement(v as any)}
            className="flex gap-4"
            disabled={isEditMode}
          >
            <div className={`flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer ${isEditMode && typeLogement !== 'maison' ? 'opacity-50' : ''}`}>
              <RadioGroupItem value="maison" id="m" />
              <Label htmlFor="m" className="cursor-pointer">Maison</Label>
            </div>
            <div className={`flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer ${isEditMode && typeLogement !== 'appartement' ? 'opacity-50' : ''}`}>
              <RadioGroupItem value="appartement" id="a" />
              <Label htmlFor="a" className="cursor-pointer">Appartement</Label>
            </div>
          </RadioGroup>

          {/* TITRE & DESCRIPTION */}
          <div className="grid gap-4">
            <div className="grid gap-2">
                <Label>Titre</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Magnifique villa avec piscine" required />
            </div>
            <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre logement..." required />
            </div>
          </div>

          {/* CHAMPS SPÉCIFIQUES HÉRITAGE */}
          <div className="grid grid-cols-2 gap-4 bg-green-50/50 p-4 rounded-lg border border-green-100">
            {typeLogement === "maison" ? (
              <>
                <div className="grid gap-2">
                    <Label className="text-green-800">Taille du jardin (m²)</Label>
                    <Input name="gardenSize" type="number" step="0.01" defaultValue={listingToEdit?.gardenSize || 0} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-green-800">Garage disponible ?</Label>
                  <Select name="hasGarage" defaultValue={listingToEdit?.hasGarage ? "oui" : "non"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Label className="text-green-800">Nombre de pièces</Label>
                    <Input name="numberOfRooms" type="number" defaultValue={listingToEdit?.numberOfRooms || 1} required />
                </div>
                <div className="grid gap-2">
                  <Label className="text-green-800">Présence d'un balcon ?</Label>
                  <Select name="balcony" defaultValue={listingToEdit?.balcony ? "oui" : "non"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="oui">Oui</SelectItem>
                        <SelectItem value="non">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {/* VILLE & CATÉGORIE */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label>Localisation</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity} required>
                <SelectTrigger><SelectValue placeholder="Choisir une ville" /></SelectTrigger>
                <SelectContent>
                    {localisations.map((loc) => <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label>Catégorie de bien</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent>
                    {categories.map((cat) => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
          </div>

          {/* PRIX & CAPACITÉ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label>Prix par nuit (€)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="grid gap-2">
                <Label>Capacité d'accueil</Label>
                <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
            </div>
          </div>

          {/* ÉQUIPEMENTS */}
          <div className="grid gap-2 border p-4 rounded-xl bg-muted/30">
            <Label className="font-bold text-xs uppercase text-muted-foreground mb-2">Équipements & Services *</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableOptions.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`opt-${opt.id}`}
                    checked={selectedOptions.includes(opt.id.toString())}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedOptions(prev => [...prev, opt.id.toString()])
                      else setSelectedOptions(prev => prev.filter(id => id !== opt.id.toString()))
                    }}
                  />
                  <Label htmlFor={`opt-${opt.id}`} className="cursor-pointer text-sm">{opt.name}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* PHOTOS */}
          <div className="border-t pt-4 space-y-4">
            <Label className="font-bold">Galerie Photos</Label>
            <div className="grid gap-3 p-4 border-2 border-dashed rounded-lg">
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="cursor-pointer" />
                <div className="text-center text-xs text-muted-foreground font-semibold italic">OU</div>
                <Input
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    type="url"
                    placeholder="URL de l'image"
                />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]">
              {isLoading ? "Enregistrement..." : (isEditMode ? "Enregistrer les modifications" : "Publier l'annonce")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
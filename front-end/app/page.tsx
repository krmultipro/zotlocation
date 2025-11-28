"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup, FieldSet, FieldLabel, FieldDescription, Field, FieldContent, FieldTitle, FieldLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function ModalAnnonce() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Ajouter un logement</Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter votre logement !</DialogTitle>
        </DialogHeader>
        
        <form className="space-y-6">
          {/* Type de logement */}
          <FieldGroup>
            <FieldSet>
              <FieldLabel>Que souhaitez-vous proposer ?</FieldLabel>
              <RadioGroup defaultValue="maison">
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
            <Label htmlFor="titre">Titre</Label>
            <Input
              id="titre"
              type="text"
              placeholder="Magnifique maison en bord de mer"
              required
            />
          </div>

          {/* Description */}
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              placeholder="Ex: Charmante villa face à la mer avec terrasse panoramique, accès direct à la plage, 3 chambres, jardin arboré..."
              rows={4}
            />
          </Field>

          {/* Prix */}
          <div className="grid gap-2">
            <Label htmlFor="prix">Prix par nuit</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
              <Input
                id="prix"
                type="number"
                placeholder="150"
                min="0"
                step="1"
                required
                className="pl-8"
              />
            </div>
          </div>

          {/* Capacité */}
          <div className="grid gap-2">
            <Label htmlFor="capacite">Capacité (nombre de personnes)</Label>
            <Input
              id="capacite"
              type="number"
              placeholder="4"
              min="1"
              step="1"
              required
            />
          </div>

          {/* Catégorie */}
          <Field>
            <FieldLabel>Catégorie</FieldLabel>
            <Select>
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
              Sélectionnez la catégorie qui correspond le mieux à votre logement.
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
                  <Checkbox id="wifi" defaultChecked />
                  <FieldLabel htmlFor="wifi" className="font-normal">
                    WiFi
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox id="parking" />
                  <FieldLabel htmlFor="parking" className="font-normal">
                    Parking
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox id="piscine" />
                  <FieldLabel htmlFor="piscine" className="font-normal">
                    Piscine
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox id="clim" />
                  <FieldLabel htmlFor="clim" className="font-normal">
                    Climatisation
                  </FieldLabel>
                </Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>

          {/* Boutons */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Ajouter le logement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
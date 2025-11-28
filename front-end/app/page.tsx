"use client"


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FieldGroup, FieldSet, FieldLabel, FieldDescription, Field, FieldContent, FieldTitle, FieldLegend, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


export default function Home() {
  return (
    <Card className="w-full max-w-sm">
<CardHeader className="relative">
        <CardTitle>Ajouter votre logement !</CardTitle>
        <button
          type="button"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => {
            console.log("Fermeture du modal");
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </button>
      </CardHeader>
      <CardContent>
        <form>
          <div className="w-full max-w-md mb-6">
            <FieldGroup>
              <FieldSet>
                <FieldLabel htmlFor="compute-environment-p8w">
                  Que souhaitez-vous proposer ?
                </FieldLabel>
                <RadioGroup defaultValue="kubernetes">
                  <FieldLabel htmlFor="kubernetes-r2h">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Maison</FieldTitle>
                        <FieldDescription></FieldDescription>
                      </FieldContent>
                      <RadioGroupItem value="kubernetes" id="kubernetes-r2h" />
                    </Field>
                  </FieldLabel>
                  <FieldLabel htmlFor="vm-z4k">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Appartement</FieldTitle>
                        <FieldDescription></FieldDescription>
                      </FieldContent>
                      <RadioGroupItem value="vm" id="vm-z4k" />
                    </Field>
                  </FieldLabel>
                </RadioGroup>
              </FieldSet>
            </FieldGroup>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                type="text"
                placeholder="Magnifique maison en bord de mer"
                required
              />
            </div>

            <div className="w-full max-w-md">
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="feedback">Description</FieldLabel>
                    <Textarea
                      id="feedback"
                      placeholder="Ex: Charmante villa face à la mer avec terrasse panoramique, accès direct à la plage, 3 chambres, jardin arboré..."
                      rows={4}
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>
            </div>

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
            <div className="w-full max-w-md">
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
            </div>

            <div className="w-full max-w-md">
              <FieldGroup>
                <FieldSet>
                  <FieldLegend variant="label">
                    Choisissez une ou plusieurs options
                  </FieldLegend>
                  <FieldGroup className="flex flex-row flex-wrap gap-3">
                    <Field orientation="horizontal">
                      <Checkbox id="finder-pref-9k2-hard-disks-ljj" defaultChecked />
                      <FieldLabel
                        htmlFor="finder-pref-9k2-hard-disks-ljj"
                        className="font-normal"
                      >
                        WiFi
                      </FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox id="finder-pref-9k2-external-disks-1yg" />
                      <FieldLabel
                        htmlFor="finder-pref-9k2-external-disks-1yg"
                        className="font-normal"
                      >
                        Parking
                      </FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox id="finder-pref-9k2-cds-dvds-fzt" />
                      <FieldLabel
                        htmlFor="finder-pref-9k2-cds-dvds-fzt"
                        className="font-normal"
                      >
                        Piscine
                      </FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox id="finder-pref-9k2-connected-servers-6l2" />
                      <FieldLabel
                        htmlFor="finder-pref-9k2-connected-servers-6l2"
                        className="font-normal"
                      >
                        Climatisation
                      </FieldLabel>
                    </Field>
                  </FieldGroup>
                </FieldSet>
                <FieldSeparator />
              </FieldGroup>
            </div>


          </div>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Ajouter le logement
        </Button>
      </CardFooter>
    </Card>
  );
}
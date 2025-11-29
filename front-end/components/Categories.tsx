/**
 * Composant Categories
 * 
 * Affiche une barre de navigation horizontale contenant différentes catégories d'annonces.
 * Permet à l'utilisateur de filtrer les annonces par type (plage, montagne, camping, etc.).
 * La barre reste visible lors du défilement (sticky) et met en évidence la catégorie active.
 */

"use client"

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Home,
  Palmtree,
  Mountain,
  Tent,
  Waves,
  Gem,
  Building2,
  Trees,
  Flame,
  Sparkles,
  Landmark,
  type LucideIcon
} from "lucide-react";

/**
 * Composant principal Categories
 * Gère l'affichage et la navigation entre les différentes catégories d'annonces
 */
export default function Categories() {
  // Hook pour naviguer programmatiquement entre les pages
  const router = useRouter();
  
  // Hook pour obtenir le chemin de l'URL actuelle (ex: "/categorie/bassin")
  const pathname = usePathname();

  /**
   * Tableau des catégories disponibles
   * Chaque catégorie contient :
   * - id : identifiant unique utilisé dans l'URL et pour le filtrage
   * - icon : composant d'icône Lucide à afficher
   * - label : texte à afficher sous l'icône
   */
  const categories: { id: string; icon: LucideIcon; label: string }[] = [
    { id: "all", icon: Home, label: "Tous" },                      // Affiche toutes les annonces
    { id: "plage", icon: Palmtree, label: "Plage" },               // Annonces proches de la plage
    { id: "montagne", icon: Mountain, label: "Montagne" },         // Annonces en montagne
    { id: "camping", icon: Tent, label: "Camping" },               // Annonces de type camping
    { id: "bassin", icon: Waves, label: "Bassin" },                // Annonces près d'un bassin
    { id: "luxe", icon: Gem, label: "Luxe" },                      // Annonces de luxe
    { id: "moderne", icon: Building2, label: "Moderne" },          // Annonces modernes
    { id: "foret", icon: Trees, label: "Forêt" },                  // Annonces en forêt
    { id: "volcan", icon: Flame, label: "Volcan" },                // Annonces près d'un volcan
    { id: "insolite", icon: Sparkles, label: "Insolite" },         // Annonces insolites
    { id: "traditionnelle", icon: Landmark, label: "Traditionnelle" }, // Annonces traditionnelles
  ];

  /**
   * Fonction de gestion du clic sur une catégorie
   * Redirige l'utilisateur vers la page correspondante
   * 
   * @param categoryId - Identifiant de la catégorie cliquée
   */
  const handleCategoryClick = (categoryId: string) => {
    // Construction de l'URL en fonction de la catégorie
    // Si "all" est sélectionné, on redirige vers la page d'accueil "/"
    // Sinon, on redirige vers "/categorie/[categoryId]"
    const url = categoryId === "all" ? "/" : `/categorie/${categoryId}`;
    
    // Navigation vers l'URL construite
    router.push(url);
  };

  /**
   * Détermination de la catégorie actuellement active
   * - Si on est sur la page d'accueil ("/"), la catégorie active est "all"
   * - Sinon, on extrait l'ID de catégorie depuis l'URL (ex: "/categorie/bassin" → "bassin")
   * pathname.split("/")[2] décompose l'URL : ["", "categorie", "bassin"] et prend l'index 2
   */
  const activeCategory = pathname === "/" ? "all" : pathname.split("/")[2];

  return (
    // Section principale contenant la barre de catégories
    // sticky top-24 : reste fixe à 24 unités (96px) du haut lors du défilement
    // z-30 : niveau de profondeur pour rester au-dessus des autres éléments
    // bg-background : couleur de fond définie dans le thème
    // border-b : bordure en bas pour séparer visuellement du contenu
    <section className="sticky top-24 z-30 bg-background border-b">
      {/* Conteneur pour centrer et espacer le contenu */}
      <div className="container mx-auto px-4 py-4">
        {/* ScrollArea de shadcn/ui pour permettre le défilement horizontal */}
        {/* whitespace-nowrap : empêche le retour à la ligne des éléments */}
        <ScrollArea className="w-full whitespace-nowrap">
          {/* Conteneur flex pour aligner les boutons horizontalement */}
          {/* gap-2 : espace de 8px entre chaque bouton */}
          <div className="flex gap-2">
            {/* Itération sur chaque catégorie pour créer un bouton */}
            {categories.map((cat) => {
              // Extraction du composant d'icône pour l'utiliser dans le JSX
              const IconComponent = cat.icon;
              
              // Vérification si cette catégorie est actuellement active
              const isActive = activeCategory === cat.id;
              
              return (
                <Button
                  key={cat.id}                                    // Clé unique pour React
                  variant={isActive ? "default" : "ghost"}        // Style différent si actif
                  size="sm"                                       // Taille small du bouton
                  onClick={() => handleCategoryClick(cat.id)}     // Navigation au clic
                  className={`flex flex-col h-auto py-3 px-4 gap-1 ${
                    // Classes supplémentaires si la catégorie est active
                    // bg-green-600 : fond vert personnalisé (remplace le style default)
                    // hover:bg-green-700 : fond vert plus foncé au survol
                    // text-white : texte blanc pour contraster avec le fond vert
                    isActive ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                  }`}
                >
                  {/* Affichage de l'icône de la catégorie */}
                  {/* w-6 h-6 : largeur et hauteur de 24px */}
                  <IconComponent className="w-6 h-6" />
                  
                  {/* Affichage du label de la catégorie */}
                  {/* text-xs : petite taille de texte */}
                  {/* font-medium : poids de police moyen */}
                  {/* whitespace-nowrap : empêche le retour à la ligne du texte */}
                  <span className="text-xs font-medium whitespace-nowrap">
                    {cat.label}
                  </span>
                </Button>
              );
            })}
          </div>
          
          {/* Barre de défilement horizontale visible pour indiquer qu'on peut scroller */}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}
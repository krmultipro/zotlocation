/**
 * Composant Categories
 * 
 * Affiche une barre de navigation horizontale contenant différentes catégories d'annonces.
 * Les catégories sont récupérées dynamiquement depuis l'API Symfony.
 * La barre reste visible lors du défilement (sticky) et met en évidence la catégorie active.
 */

"use client"

import { useEffect, useState } from "react";
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
 * Interface Category depuis l'API
 */
interface ApiCategory {
  "@id": string;
  "@type": string;
  id: number;
  name: string;
}

/**
 * Interface pour les catégories affichées
 */
interface Category {
  id: string;
  icon: LucideIcon;
  label: string;
}

/**
 * Mapping des noms de catégories vers les icônes Lucide
 * Permet d'associer chaque catégorie de la BDD à une icône
 */
const categoryIconMap: Record<string, LucideIcon> = {
  "Plage": Palmtree,
  "Montagne": Mountain,
  "Camping": Tent,
  "Bassin": Waves,
  "Luxe": Gem,
  "Moderne": Building2,
  "Forêt": Trees,
  "Volcan": Flame,
  "Insolite": Sparkles,
  "Traditionnelle": Landmark,
};

export default function Categories() {
  const router = useRouter();
  const pathname = usePathname();
  
  // État pour stocker les catégories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // URL de l'API depuis les variables d'environnement
  const API_URL = process.env.NEXT_PUBLIC_API_URL ;

  /**
   * Récupération des catégories depuis l'API au montage du composant
   */
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        // Extraction des catégories depuis le format Hydra
        const apiCategories: ApiCategory[] = data.member || data["hydra:member"] || [];
        
        // Transformation des catégories API en format utilisable
        const transformedCategories: Category[] = apiCategories.map(cat => ({
          id: cat.name.toLowerCase(),  // "Bassin" → "bassin" pour l'URL
          icon: categoryIconMap[cat.name] || Landmark,  // Icône par défaut si non trouvée
          label: cat.name
        }));

        // Ajout de la catégorie "Tous" au début
        const allCategories: Category[] = [
          { id: "all", icon: Home, label: "Tous" },
          ...transformedCategories
        ];

        setCategories(allCategories);
      })
      .catch(error => {
        console.error('Erreur lors du chargement des catégories:', error);
        // En cas d'erreur, afficher au moins la catégorie "Tous"
        setCategories([{ id: "all", icon: Home, label: "Tous" }]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API_URL]);

  /**
   * Fonction de gestion du clic sur une catégorie
   */
  const handleCategoryClick = (categoryId: string) => {
    const url = categoryId === "all" ? "/" : `/categorie/${categoryId}`;
    router.push(url);
  };

  /**
   * Détermination de la catégorie actuellement active
   */
  const activeCategory = pathname === "/" ? "all" : pathname.split("/")[2];

  // Affichage pendant le chargement
  if (loading) {
    return (
      <section className="sticky top-20 z-30 bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2">
            {/* Skeleton loader */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-20 h-16 bg-gray-200 rounded-md animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="sticky top-20 z-30 bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isActive = activeCategory === cat.id;
              
              return (
                <Button
                  key={cat.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex flex-col h-auto py-3 px-4 gap-1 ${
                    isActive ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                  <span className="text-xs font-medium whitespace-nowrap">
                    {cat.label}
                  </span>
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}
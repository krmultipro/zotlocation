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

export default function Categories() {
  const router = useRouter();
  const pathname = usePathname();

  const categories: { id: string; icon: LucideIcon; label: string }[] = [
    { id: "all", icon: Home, label: "Tous" },
    { id: "plage", icon: Palmtree, label: "Plage" },
    { id: "montagne", icon: Mountain, label: "Montagne" },
    { id: "camping", icon: Tent, label: "Camping" },
    { id: "bassin", icon: Waves, label: "Bassin" },
    { id: "luxe", icon: Gem, label: "Luxe" },
    { id: "moderne", icon: Building2, label: "Moderne" },
    { id: "foret", icon: Trees, label: "Forêt" },
    { id: "volcan", icon: Flame, label: "Volcan" },
    { id: "insolite", icon: Sparkles, label: "Insolite" },
    { id: "traditionnelle", icon: Landmark, label: "Traditionnelle" },
  ];

  const handleCategoryClick = (categoryId: string) => {
    const url = categoryId === "all" ? "/" : `/categorie/${categoryId}`;
    router.push(url);
  };

  const activeCategory = pathname === "/" ? "all" : pathname.split("/")[2];

  return (
    <section className="sticky top-35 z-30 bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <Button
                  key={cat.id}
      variant={isActive ? "default" : "outline"}
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
// app/categorie/[categoryId]/page.tsx
import ListingsGrid from "@/components/ListingsGrid";

// Cette interface définit la structure des props que Next.js passe automatiquement
interface CategoryPageProps {
  params: Promise<{
    categoryId: string;  // ← La valeur capturée depuis l'URL (ex: "bassin")
  }>;
}

// Fonction async car params est une Promise dans Next.js 15+
export default async function CategoryPage({ params }: CategoryPageProps) {
  // On extrait "bassin" (ou autre) depuis l'URL
  // Si l'URL est "/categorie/bassin", categoryId vaudra "bassin"
  const { categoryId } = await params;
  
  return (
    <div className="pb-20">
      {/* On passe "bassin" à ListingsGrid pour filtrer les annonces */}
      <ListingsGrid categoryFilter={categoryId} />
    </div>
  );
}
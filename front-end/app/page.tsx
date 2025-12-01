// app/page.tsx
import ListingsGrid from "@/components/ListingsGrid";

export default function Home() {
  return (
    <div className="pb-20 pt-32">  {/* Ajouter pt-32 pour le padding-top */}
      <ListingsGrid />
    </div>
  );
}
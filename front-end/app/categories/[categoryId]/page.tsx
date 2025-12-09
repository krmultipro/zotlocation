import ListingsGrid from "@/components/ListingsGrid"

interface CategoryPageProps {
  params: Promise<{ categoryId: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params

  return (
    <div className="pb-20">
      <ListingsGrid categoryFilter={categoryId} /> {/* Filtrage par ID */}
    </div>
  )
}

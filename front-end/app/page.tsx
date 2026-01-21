"use client"

import { Suspense } from "react"
import CategoryListings from "@/components/CategoryListings"

export default function HomePage() {
  return (
    <Suspense fallback={<div />}>
      <CategoryListings />
    </Suspense>
  )
}

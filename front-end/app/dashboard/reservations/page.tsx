import { Suspense } from "react"
import ReservationsContent from "./ReservationsContent"

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <ReservationsContent />
    </Suspense>
  )
}

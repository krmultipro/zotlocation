/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import axios from "axios"
import { Loader2, Star, X } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  listingId: number
  onSuccess: () => void
}

export default function ReviewModal({
  isOpen,
  onClose,
  listingId,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (comment.length < 5) return toast.error("Le commentaire est trop court.")

    setLoading(true)
    try {
      const token = localStorage.getItem("jwtToken")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      await axios.post(
        `${apiUrl}/api/reviews`,
        {
          rating,
          comment,
          listing: `/api/listings/${listingId}`, // Format IRI attendu par API Platform
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      toast.success("Avis publié ! Merci.")
      onSuccess()
      onClose()
      setComment("")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Votre avis nous intéresse</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X />
          </button>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={35}
              onClick={() => setRating(star)}
              className={`cursor-pointer transition ${
                star <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-200"
              }`}
            />
          ))}
        </div>

        <textarea
          className="w-full border rounded-xl p-3 h-32 focus:ring-2 focus:ring-green-500 outline-none transition"
          placeholder="Comment s'est passé votre séjour ?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-500 text-white py-3 rounded-xl mt-6 font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          // eslint-disable-next-line react/no-unescaped-entities Publier l'avis
        </button>
      </div>
    </div>
  )
}

"use client"

import Image from "next/image"

interface AvatarProps {
  src: string | null | undefined
}

const Avatar: React.FC<AvatarProps> = ({ src }) => {
  // Si src existe, on l'affiche, sinon avatar par défaut
  const avatarSrc = src || "/images/placeholder.png"

  return (
    <Image
      src={avatarSrc}
      width={64}
      height={64}
      alt="Avatar"
      className="rounded-full"
      unoptimized // nécessaire pour les SVG externes
    />
  )
}

export default Avatar

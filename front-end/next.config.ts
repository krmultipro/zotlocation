import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
      // === AJOUT NÉCESSAIRE POUR PEXELS ===
      {
        protocol: "https",
        hostname: "images.pexels.com", // <-- C'est l'hôte qui manquait
        port: "",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig

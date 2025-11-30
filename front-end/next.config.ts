/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.dicebear.com"], // <-- ajoute ce domaine
  },
}

module.exports = nextConfig

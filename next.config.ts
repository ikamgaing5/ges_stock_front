import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Indique explicitement la racine du projet. Sans cela, Next.js remonte
    // les dossiers parents et tombe sur un package-lock.json qui ne nous
    // concerne pas, ce qui provoque un avertissement au démarrage.
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: [
    "172.20.10.3",
    "https://begin-grocery-pin-buf.trycloudflare.com",
    "http://169.254.75.38:3001",
  ],
};

export default nextConfig;

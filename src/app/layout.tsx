import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

/*
 * Les polices sont chargées par next/font : les fichiers sont téléchargés
 * au moment de la construction et servis depuis notre propre domaine.
 * Rien n'est demandé à Google au chargement de la page, et le texte ne
 * saute pas quand la police arrive.
 *
 * Chaque appel crée une variable CSS, rattachée à Tailwind dans
 * src/app/globals.css (--font-sans, --font-mono).
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Parc Mobile",
  description:
    "Suivi du stock de téléphones, appareil par appareil, pour les boutiques multi-points de vente.",
};

/**
 * Enveloppe TOUTES les pages de l'application.
 * C'est ici qu'on met ce qui doit être disponible partout :
 * les polices, l'utilisateur connecté et les notifications.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // `suppressHydrationWarning` est requis par next-themes : il écrit la
    // classe du thème sur <html> avant l'affichage, ce qui crée forcément
    // un écart avec ce qu'a produit le serveur. L'avertissement est donc
    // attendu, et seulement sur cette balise.
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

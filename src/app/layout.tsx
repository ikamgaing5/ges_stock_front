import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { BandeauCookies } from "@/components/bandeau-cookies";
import { SchemaOrg } from "@/components/seo/schema-org";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://telora.app",
  ),
  title: {
    default: "Telora — Logiciel de Gestion de Stock & Caisse Téléphonie",
    template: "%s — Telora",
  },
  description:
    "Application professionnelle de traçabilité unitaire par IMEI, gestion de stock multi-boutiques et caisse pour magasins de téléphones et produits high-tech.",
  keywords: [
    "gestion de stock téléphone",
    "suivi IMEI",
    "caisse enregistreuse téléphone",
    "logiciel boutique téléphonie",
    "gestion multi-magasins",
    "traçabilité smartphone",
    "Telora",
  ],
  authors: [{ name: "Telora" }],
  creator: "Impact Tech Solutions",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Telora",
    title: "Telora — Gestion de Stock & Caisse pour Boutiques de Téléphonie",
    description:
      "Chaque appareil suivi unitairement de l'arrivage à la vente. Zéro perte, réconciliation immédiate et scan ultra-rapide.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Telora — Gestion de Stock & Caisse Téléphonie",
    description:
      "La solution moderne pour sécuriser le stock et accélérer les encaissements de votre boutique de smartphones.",
  },
};

/**
 * Enveloppe TOUTES les pages de l'application.
 * C'est ici qu'on met ce qui doit être disponible partout :
 * les polices, l'internationalisation, l'utilisateur connecté et les notifications.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // `suppressHydrationWarning` est requis par next-themes et i18n
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SchemaOrg />
        <GoogleAnalytics />
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
            <BandeauCookies />
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

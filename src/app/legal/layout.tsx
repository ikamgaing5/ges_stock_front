"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Smartphone } from "lucide-react";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { IconeTelora } from "@/components/ui/logo-telora";
import { PiedDePageLegal } from "@/components/layout/pied-de-page-legal";
import { FilAriane } from "@/components/layout/fil-ariane";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/components/auth-provider";

const ONGLETS_LEGAUX = [
  {
    href: "/legal/mentions-legales",
    labelFr: "Mentions légales",
    labelEn: "Legal notices",
  },
  {
    href: "/legal/securite",
    labelFr: "Sécurité",
    labelEn: "Security",
  },
  {
    href: "/legal/confidentialite",
    labelFr: "Confidentialité",
    labelEn: "Privacy policy",
  },
  {
    href: "/legal/cookies",
    labelFr: "Cookies",
    labelEn: "Cookies",
  },
  {
    href: "/legal/cgu",
    labelFr: "Conditions d'utilisation",
    labelEn: "Terms of service",
  },
  {
    href: "/legal/accessibilite",
    labelFr: "Accessibilité",
    labelEn: "Accessibility",
  },
];

export default function LayoutLegal({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t, lang } = useI18n();
  const router = useRouter();
  const { utilisateur } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Barre supérieure */}
      <header className="border-b bg-background/95 sticky top-0 z-40 backdrop-blur">
        <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (
                  typeof window !== "undefined" &&
                  window.history.length > 1
                ) {
                  router.back();
                } else {
                  router.push(utilisateur ? "/mon-compte" : "/connexion");
                }
              }}
              className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("commun.retour")}</span>
            </button>

            <span className="text-border">|</span>

            <div className="flex items-center gap-2">
              <IconeTelora size={20} />
              <span className="font-semibold text-sm tracking-tight">
                Telora · Légal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <BasculeLangue />
            <BasculeTheme />
          </div>
        </div>
      </header>

      {/* En-tête de section et navigation textuelle sobre */}
      <div className="border-b bg-muted/20">
        <div className="container mx-auto max-w-5xl px-4 pt-8 pb-0 sm:px-6">
          <FilAriane
            elements={[
              {
                label: lang === "en" ? "Legal Center" : "Centre Juridique",
                href: "/legal/mentions-legales",
              },
              {
                label:
                  ONGLETS_LEGAUX.find((o) => o.href === pathname)?.[
                    lang === "en" ? "labelEn" : "labelFr"
                  ] || "Document",
                actif: true,
              },
            ]}
            className="mb-4"
          />

          <div className="space-y-1 pb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {lang === "en"
                ? "Legal & Compliance Center"
                : "Centre Juridique & Conformité"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {lang === "en"
                ? "Official legal documentation, security standards, and terms governing the Telora platform."
                : "Documentation juridique officielle, normes de sécurité et conditions applicables à la plateforme Telora."}
            </p>
          </div>

          {/* Onglets textuels sobres sans icônes */}
          <nav className="flex gap-1 overflow-x-auto scrollbar-none text-xs sm:text-sm -mb-px">
            {ONGLETS_LEGAUX.map((onglet) => {
              const estActif = pathname === onglet.href;

              return (
                <Link
                  key={onglet.href}
                  href={onglet.href}
                  className={`border-b-2 px-3 py-2.5 font-medium whitespace-nowrap transition-colors ${
                    estActif
                      ? "border-primary text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {lang === "en" ? onglet.labelEn : onglet.labelFr}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          {children}
        </div>
      </main>

      {/* Pied de page style Spotify */}
      <PiedDePageLegal complet={true} className="mt-auto bg-muted/10" />
    </div>
  );
}

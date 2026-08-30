"use client";

import Link from "next/link";
import { HelpCircle, Home, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconeTelora } from "@/components/ui/logo-telora";
import { PiedDePageLegal } from "@/components/layout/pied-de-page-legal";
import { useI18n } from "@/lib/i18n";
import { BasculeLangue } from "@/components/bascule-langue";
import { BasculeTheme } from "@/components/bascule-theme";

/**
 * Option 2 : Version Détaillée / Thématique
 * Comporte l'emblème complet, le message d'inventaire, 3 CTA d'orientation et les liens de pied de page.
 * Supporte le bilinguisme (FR/EN) et les thèmes clair/sombre.
 */
export function Page404Detaillee() {
  const { t, lang } = useI18n();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      {/* Barre supérieure discrète */}
      <header className="border-b border-border/40 py-4 px-6">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <IconeTelora size={28} />
            <span className="font-heading text-sm font-bold tracking-tight">TELORA</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/faq"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 mr-2"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{t("page404.centreAide")}</span>
            </Link>
            <BasculeLangue />
            <BasculeTheme />
          </div>
        </div>
      </header>

      {/* Contenu principal de la 404 */}
      <main className="container mx-auto max-w-2xl px-4 py-16 text-center space-y-8 my-auto">
        <div className="relative inline-block mx-auto">
          <IconeTelora size={84} className="mx-auto" />
          <span className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground font-mono font-bold text-xs px-2.5 py-1 rounded-full border-2 border-background shadow-md">
            404
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
            {t("page404.titreDetaille")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {t("page404.descriptionDetaillee")}
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 shadow-md"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <Home className="h-4 w-4" />
            <span>{t("page404.tableauDeBord")}</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-border text-foreground hover:bg-muted"
            nativeButton={false}
            render={<Link href="/scanner" />}
          >
            <ScanLine className="h-4 w-4 text-primary" />
            <span>{t("page404.ouvrirScanner")}</span>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="gap-2 text-muted-foreground hover:text-foreground"
            nativeButton={false}
            render={<Link href="/faq" />}
          >
            <HelpCircle className="h-4 w-4" />
            <span>{t("page404.consulterFaq")}</span>
          </Button>
        </div>

        {/* Liens utiles contextuels */}
        <div className="border-t border-border/40 pt-6 text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/connexion" className="hover:text-foreground hover:underline">
            {lang === "en" ? "Sign in" : "Se connecter"}
          </Link>
          <span className="text-border">·</span>
          <Link href="/inscription" className="hover:text-foreground hover:underline">
            {lang === "en" ? "Sign up" : "Créer un compte"}
          </Link>
          <span className="text-border">·</span>
          <Link href="/etudes-de-cas" className="hover:text-foreground hover:underline">
            {lang === "en" ? "Case Studies" : "Études de cas"}
          </Link>
          <span className="text-border">·</span>
          <Link href="/legal/mentions-legales" className="hover:text-foreground hover:underline">
            {lang === "en" ? "Legal Notice" : "Mentions légales"}
          </Link>
        </div>
      </main>

      {/* Pied de page officiel */}
      <PiedDePageLegal className="mt-auto" />
    </div>
  );
}

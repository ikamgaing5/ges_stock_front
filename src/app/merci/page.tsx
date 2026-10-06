"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Smartphone,
  Users,
  Receipt,
  Scan,
  HelpCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { IconeTelora } from "@/components/ui/logo-telora";
import { FilAriane } from "@/components/layout/fil-ariane";
import { PiedDePageLegal } from "@/components/layout/pied-de-page-legal";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";

export default function PageMerci() {
  const { utilisateur } = useAuth();
  const { t } = useI18n();

  const etapes = [
    {
      numero: t("merci.etape1Numero"),
      titre: t("merci.etape1Titre"),
      description: t("merci.etape1Description"),
      actionLibelle: t("merci.etape1Action"),
      lien: "/telephones/nouveau",
      icone: Smartphone,
    },
    {
      numero: t("merci.etape2Numero"),
      titre: t("merci.etape2Titre"),
      description: t("merci.etape2Description"),
      actionLibelle: t("merci.etape2Action"),
      lien: "/equipe",
      icone: Users,
    },
    {
      numero: t("merci.etape3Numero"),
      titre: t("merci.etape3Titre"),
      description: t("merci.etape3Description"),
      actionLibelle: t("merci.etape3Action"),
      lien: "/",
      icone: Receipt,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      {/* En-tête de la page */}
      <header className="border-b border-border/40 py-3.5 px-4 sm:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <IconeTelora size={28} />
            <span className="font-heading text-sm font-bold tracking-tight">
              TELORA
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <BasculeLangue />
            <BasculeTheme />
            <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
            <Link
              href="/faq"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted/50"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("merci.assistance")}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12 space-y-8 my-auto">
        <FilAriane elements={[{ label: t("merci.filAriane"), actif: true }]} />

        {/* Bloc d'accueil & remerciement */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          
          <div className="space-y-3">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text">
              {utilisateur?.name
                ? t("merci.titreNom", { nom: utilisateur.name })
                : t("merci.titre")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("merci.sousTitre")}
            </p>
          </div>
        </div>

        {/* Étapes clés de démarrage (Cartes d'action) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {etapes.map((etape) => {
            const Icone = etape.icone;
            return (
              <div
                key={etape.numero}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 hover:bg-card/90 hover:border-primary/40 p-5 sm:p-6 transition-all duration-200 shadow-2xs hover:shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {/* <span className="text-xs font-mono font-bold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md">
                      {etape.numero}
                    </span> */}
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icone className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-foreground tracking-tight">
                      {etape.titre}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {etape.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-auto">
                  <Link
                    href={etape.lien}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{etape.actionLibelle}</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions principales (CTA) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 h-12 shadow-md hover:shadow-lg transition-all"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <span>{t("merci.boutonPrincipal")}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2 border-border/80 text-foreground hover:bg-muted/80 h-12 px-6"
            nativeButton={false}
            render={<Link href="/scanner" />}
          >
            <Scan className="h-4 w-4 text-primary" />
            <span>{t("merci.boutonScanner")}</span>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto gap-2 text-muted-foreground hover:text-foreground h-12 px-5"
            nativeButton={false}
            render={<Link href="/faq" />}
          >
            <BookOpen className="h-4 w-4" />
            <span>{t("merci.boutonSecondaire")}</span>
          </Button>
        </div>

        {/* Bloc d'aide & accompagnement personnalisé */}
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {/* <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div> */}
            <div>
              <p className="font-semibold text-foreground">
                {t("merci.aideTitre")}
              </p>
              <p className="text-muted-foreground">
                {t("merci.aideDescription")}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs shrink-0 self-end sm:self-center"
            nativeButton={false}
            render={<Link href="/faq" />}
          >
            {t("merci.assistance")}
          </Button>
        </div>
      </main>

      {/* Pied de page officiel */}
      <PiedDePageLegal className="mt-auto" />
    </div>
  );
}

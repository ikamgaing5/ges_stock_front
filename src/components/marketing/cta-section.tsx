"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface CtaSectionProps {
  className?: string;
  titre?: string;
  sousTitre?: string;
  labelBouton?: string;
  hrefBouton?: string;
  labelSecondaire?: string;
  hrefSecondaire?: string;
}

export function CtaSection({
  className = "",
  titre,
  sousTitre,
  labelBouton,
  hrefBouton = "/inscription",
  labelSecondaire,
  hrefSecondaire = "/faq",
}: CtaSectionProps) {
  const { lang } = useI18n();

  const texteTitre =
    titre ??
    (lang === "en"
      ? "Ready to simplify your shop management?"
      : "Envie de simplifier la gestion de votre boutique ?");

  const texteSousTitre =
    sousTitre ??
    (lang === "en"
      ? "Join retail store owners who keep their inventory accurate, their staff aligned and their daily cash closing effortless."
      : "Rejoignez les commerçants qui gardent un stock toujours juste, des équipes sereines et une caisse transparente chaque soir.");

  const texteBouton =
    labelBouton ??
    (lang === "en" ? "Start 14-day free trial" : "Démarrer l'essai gratuit de 14 jours");

  const texteSecondaire =
    labelSecondaire ??
    (lang === "en" ? "Frequently asked questions" : "Questions fréquentes");

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-sm ${className}`}
    >
      <div className="relative max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
          <Store className="h-3.5 w-3.5 shrink-0" />
          <span>
            {lang === "en"
              ? "Designed for phone shops & electronics stores"
              : "Pensé pour les boutiques de téléphonie"}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {texteTitre}
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {texteSousTitre}
        </p>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs px-8 h-11 text-sm"
            nativeButton={false}
            render={<Link href={hrefBouton} />}
          >
            <span>{texteBouton}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-border text-foreground hover:bg-muted/80 h-11 px-6 text-sm"
            nativeButton={false}
            render={<Link href={hrefSecondaire} />}
          >
            {texteSecondaire}
          </Button>
        </div>

        {/* Garanties concrètes et humaines */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-4 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {lang === "en"
                ? "No credit card required"
                : "Sans carte bancaire requise"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {lang === "en"
                ? "Set up in less than 5 minutes"
                : "Installation en moins de 5 minutes"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {lang === "en"
                ? "Human support available 6 days a week"
                : "Assistance humaine disponible 6j/7"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

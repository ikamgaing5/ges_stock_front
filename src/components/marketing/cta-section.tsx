"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CtaSectionProps {
  className?: string;
  titre?: string;
  sousTitre?: string;
  labelBouton?: string;
  hrefBouton?: string;
}

export function CtaSection({
  className = "",
  titre = "Prêt à éliminer les pertes de stock dans votre boutique ?",
  sousTitre = "Rejoignez les professionnels de la téléphonie qui sécurisent chaque appareil grâce à la traçabilité IMEI unitaire.",
  labelBouton = "Démarrer gratuitement en 2 min",
  hrefBouton = "/inscription",
}: CtaSectionProps) {
  return (
    <section className={`relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-card p-8 sm:p-12 text-center shadow-lg ${className}`}>
      {/* Lueur d'ambiance */}
      <div
        aria-hidden="true"
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/20 blur-[100px] pointer-events-none rounded-full"
      />

      <div className="relative max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Essai gratuit de démarrage</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
          {titre}
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {sousTitre}
        </p>

        {/* CTA Principal */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md px-8 h-12"
            nativeButton={false}
            render={<Link href={hrefBouton} />}
          >
            <span>{labelBouton}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-border text-foreground hover:bg-muted/80 h-12 px-6"
            nativeButton={false}
            render={<Link href="/etudes-de-cas" />}
          >
            Découvrir les études de cas
          </Button>
        </div>

        {/* Garanties rassurantes */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-4 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Sans carte bancaire requise</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Activation en 2 minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Multi-boutiques & vendeuses inclus</span>
          </div>
        </div>
      </div>
    </section>
  );
}

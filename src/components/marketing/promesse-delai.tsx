"use client";

import React from "react";
import { Clock, ShieldCheck, Smartphone, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface PromesseDelaiProps {
  className?: string;
  titre?: string;
  sousTitre?: string;
}

export function PromesseDelai({
  className = "",
  titre,
  sousTitre,
}: PromesseDelaiProps) {
  const { lang } = useI18n();

  const texteTitre =
    titre ??
    (lang === "en"
      ? "What Telora changes for your shop every day"
      : "Ce qui change concrètement au quotidien dans vos boutiques");

  const texteSousTitre =
    sousTitre ??
    (lang === "en"
      ? "Built for the fast-paced reality of retail stores: fewer disputes, faster counter service and zero inventory guessing."
      : "Conçu pour la réalité du terrain : moins de litiges, un service rapide au comptoir et la fin des incertitudes de stock.");

  const engagements =
    lang === "en"
      ? [
          {
            icone: ShieldCheck,
            repere: "Clear accountability",
            titre: "Full trace on every device",
            description:
              "Every smartphone is tracked with its unique IMEI number. You always know who received it, who sold it, and when.",
            couleur: "text-primary bg-primary/10 border-primary/20",
          },
          {
            icone: Smartphone,
            repere: "Zero learning curve",
            titre: "Intuitive for all staff",
            description:
              "Designed for busy sales counters. Your sales team can use it immediately from a phone, tablet, or desktop computer.",
            couleur: "text-blue-500 bg-blue-500/10 border-blue-500/20",
          },
          {
            icone: Clock,
            repere: "No end-of-day headaches",
            titre: "Accurate daily closing",
            description:
              "Cash in drawer, mobile money payments and units sold match up automatically without hours spent counting paper sheets.",
            couleur: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
          },
          {
            icone: Users,
            repere: "Real human contact",
            titre: "Direct support whenever needed",
            description:
              "A responsive, dedicated team available 6 days a week to help you set up your shops and assist your team.",
            couleur: "text-amber-500 bg-amber-500/10 border-amber-500/20",
          },
        ]
      : [
          {
            icone: ShieldCheck,
            repere: "Fini les doutes",
            titre: "Chaque appareil a son identité",
            description:
              "Chaque smartphone est relié à son code IMEI unique. Vous savez avec certitude qui l'a réceptionné, qui l'a vendu et quand.",
            couleur: "text-primary bg-primary/10 border-primary/20",
          },
          {
            icone: Smartphone,
            repere: "Prise en main immédiate",
            titre: "Simple pour toute l'équipe",
            description:
              "Pensé pour le rythme soutenu du comptoir. Vos vendeurs et vendeuses le prennent en main sans formation informatique compliquée.",
            couleur: "text-blue-500 bg-blue-500/10 border-blue-500/20",
          },
          {
            icone: Clock,
            repere: "Comptes nets",
            titre: "Clôture de caisse sereine",
            description:
              "Les espèces, paiements mobile money et sorties de stock sont réconciliés automatiquement. Fini les soirées passées sur des carnets.",
            couleur: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
          },
          {
            icone: Users,
            repere: "Disponibilité 6j/7",
            titre: "Une vraie équipe à vos côtés",
            description:
              "Une assistance humaine et réactive par appel ou message pour vous aider à démarrer vos boutiques et répondre à vos questions.",
            couleur: "text-amber-500 bg-amber-500/10 border-amber-500/20",
          },
        ];

  return (
    <section
      className={`rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-10 backdrop-blur-sm ${className}`}
    >
      <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {texteTitre}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {texteSousTitre}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {engagements.map((item) => {
          const Icone = item.icone;
          return (
            <div
              key={item.titre}
              className="rounded-xl border border-border/50 bg-background/80 p-5 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg border ${item.couleur}`}>
                    <Icone className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-medium tracking-tight text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                    {item.repere}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-foreground tracking-tight">
                  {item.titre}
                </h4>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Page404Simple } from "@/components/404/page-404-simple";
import { Page404Detaillee } from "@/components/404/page-404-detaillee";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { BasculeLangue } from "@/components/bascule-langue";
import { BasculeTheme } from "@/components/bascule-theme";

export default function Comparatif404() {
  const [variante, setVariante] = useState<"simple" | "detaillee">("simple");
  const { lang } = useI18n();

  return (
    <div className="relative">
      {/* Barre de sélection en haut pour comparer les 2 options */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border/80 bg-background/95 px-4 py-2.5 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {lang === "en" ? "404 Comparison:" : "Comparatif 404 :"}
          </span>
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
            <Button
              size="sm"
              variant={variante === "simple" ? "default" : "ghost"}
              onClick={() => setVariante("simple")}
              className="h-7 text-xs px-3 font-medium cursor-pointer"
            >
              {lang === "en" ? "Option 1: Simple (New)" : "Option 1 : Simple (Nouvelle)"}
            </Button>
            <Button
              size="sm"
              variant={variante === "detaillee" ? "default" : "ghost"}
              onClick={() => setVariante("detaillee")}
              className="h-7 text-xs px-3 font-medium cursor-pointer"
            >
              {lang === "en" ? "Option 2: Detailed (Previous)" : "Option 2 : Détaillée (Précédente)"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground hidden md:block">
            {variante === "simple"
              ? lang === "en"
                ? "✨ Clean version: clear message + 1 return button to previous page"
                : "✨ Version épurée : message clair + 1 bouton retour vers la page précédente"
              : lang === "en"
                ? "📋 Detailed version: with scanner, dashboard, FAQ and legal footer"
                : "📋 Version détaillée : avec scanner, tableau de bord, FAQ et footer complet"}
          </p>
          <BasculeLangue />
          <BasculeTheme />
        </div>
      </div>

      {/* Rendu de la version sélectionnée */}
      {variante === "simple" ? <Page404Simple /> : <Page404Detaillee />}
    </div>
  );
}

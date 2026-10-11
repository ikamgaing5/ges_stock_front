"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  PanelLeft,
  ArrowLeft,
  ArrowRight,
  Minus,
  Square,
  Copy,
  X,
  ScanLine,
} from "lucide-react";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { useSidebar } from "@/components/layout/contexte-sidebar";
import { useAuthOptionnel } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { SelecteurBoutique } from "@/components/layout/selecteur-boutique";

export function BarreTitreDesktop() {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuthOptionnel();
  const utilisateur = auth?.utilisateur;
  const estAuthentifie = Boolean(utilisateur);
  const estAdmin = utilisateur?.role === "admin";
  const aBoutiques = (auth?.boutiques?.length ?? 0) > 0;
  const boutiqueActive = auth?.boutiqueActive;
  const { t } = useI18n();
  const { ouverte, basculer } = useSidebar();

  const [isDesktop, setIsDesktop] = useState(false);
  const [estMaximise, setEstMaximise] = useState(false);
  const [estPleinEcran, setEstPleinEcran] = useState(false);

  useEffect(() => {
    const desktopDetecte =
      typeof window !== "undefined" &&
      Boolean(window.teloraDesktop?.isDesktop);

    setIsDesktop(desktopDetecte);

    if (desktopDetecte && window.teloraDesktop) {
      document.documentElement.style.setProperty("--hauteur-barre-titre", "2.25rem");
      document.documentElement.classList.add("telora-desktop");

      // Statut initial
      if (window.teloraDesktop.estMaximise) {
        window.teloraDesktop.estMaximise().then((max) => setEstMaximise(Boolean(max)));
      }
      if (window.teloraDesktop.estPleinEcran) {
        window.teloraDesktop.estPleinEcran().then((plein) => setEstPleinEcran(Boolean(plein)));
      }

      // Écouteur maximisé
      const unsubMax = window.teloraDesktop.surChangementMaximise
        ? window.teloraDesktop.surChangementMaximise((max) => {
            setEstMaximise(Boolean(max));
          })
        : () => {};

      // Écouteur plein écran
      const unsubPlein = window.teloraDesktop.surChangementPleinEcran
        ? window.teloraDesktop.surChangementPleinEcran((plein) => {
            setEstPleinEcran(Boolean(plein));
          })
        : () => {};

      return () => {
        document.documentElement.style.removeProperty("--hauteur-barre-titre");
        document.documentElement.classList.remove("telora-desktop");
        unsubMax();
        unsubPlein();
      };
    }
  }, []);

  if (!isDesktop) {
    return null;
  }

  const handleMinimiser = () => {
    window.teloraDesktop?.minimiser();
  };

  const handleMaximiser = () => {
    window.teloraDesktop?.maximiser();
  };

  const handleFermer = () => {
    window.teloraDesktop?.fermer();
  };

  const noDragStyle = { WebkitAppRegion: "no-drag" } as React.CSSProperties;
  const dragStyle = { WebkitAppRegion: "drag" } as React.CSSProperties;

  return (
    <div
      style={dragStyle}
      className="sticky top-0 z-50 flex h-9 w-full select-none items-center justify-between border-b border-border bg-background px-2 text-foreground transition-colors"
    >
      {/* -------------------- SECTION GAUCHE -------------------- */}
      {estAuthentifie && (
        <div className="flex items-center" style={noDragStyle}>
          {/* Contrôles de navigation et de vue (Menu, Toggle, Suivant/Précédent, Scanner) */}
          <div
            className={`flex items-center gap-1 transition-all duration-150 ${
              ouverte && !estAdmin ? "w-[230px] pr-1.5 justify-between" : "mr-1"
            }`}
          >
            <div className="flex items-center gap-1">
              {/* 1. Menu déroulant applicatif (Hamburger) - désactivé */}

              {/* 2. Bouton Toggle Sidebar [|] (uniquement si non-admin car l'espace admin n'a pas de menu latéral) */}
              {!estAdmin && (
                <button
                  type="button"
                  onClick={basculer}
                  title={
                    ouverte
                      ? t("desktop.replierMenu")
                      : t("desktop.deplierMenu")
                  }
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer ${
                    ouverte
                      ? "text-primary hover:bg-accent"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
              )}

              {/* 3. Navigation : Précédent ← */}
              <button
                type="button"
                onClick={() => router.back()}
                title={t("desktop.precedent")}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>

              {/* 4. Navigation : Suivant → */}
              <button
                type="button"
                onClick={() => router.forward()}
                title={t("desktop.suivant")}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* 5. Scanner d'IMEI rapide (masqué quand un administrateur est connecté) */}
            {!estAdmin && (
              <button
                type="button"
                onClick={() => router.push("/scanner")}
                title={t("desktop.scannerRapide")}
                className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer ${
                  pathname === "/scanner"
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <ScanLine className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Séparateur vertical aligné avec la bordure droite de la barre latérale (axe 240px) */}
          {!estAdmin && aBoutiques && (
            <div className="h-4 w-[1px] bg-border shrink-0" />
          )}

          {/* Sélecteur de boutique dans la barre de titre : aligné à la même position horizontale que dans la navbar */}
          {!estAdmin && aBoutiques && (
            <div className={`flex items-center ${ouverte ? "pl-3 sm:pl-4" : "pl-2"}`}>
              <SelecteurBoutique compact={true} />
            </div>
          )}
        </div>
      )}

      {/* -------------------- SECTION CENTRALE (DRAGGABLE) -------------------- */}
      <div
        onDoubleClick={handleMaximiser}
        className="h-full flex-1 cursor-default"
      />

      {/* -------------------- SECTION DROITE -------------------- */}
      <div className="flex items-center gap-1" style={noDragStyle}>
        {/* Sélecteurs de langue et thème */}
        <div className="flex items-center gap-1">
          <BasculeLangue />
          <BasculeTheme />
        </div>

        <div className="mx-1 h-3.5 w-[1px] bg-border" />

        {/* Boutons de fenêtre Windows natifs */}
        <div className="flex items-center -mr-1">
          {/* Minimiser */}
          <button
            type="button"
            onClick={handleMinimiser}
            title={t("desktop.minimiser")}
            className="flex h-7 w-9 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          {/* Maximiser / Restaurer */}
          <button
            type="button"
            onClick={handleMaximiser}
            title={
              estMaximise || estPleinEcran
                ? t("desktop.restaurer")
                : t("desktop.agrandir")
            }
            className="flex h-7 w-9 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          >
            {estMaximise || estPleinEcran ? (
              <Copy className="h-3 w-3" />
            ) : (
              <Square className="h-3 w-3" />
            )}
          </button>

          {/* Fermer */}
          <button
            type="button"
            onClick={handleFermer}
            title={t("desktop.fermer")}
            className="flex h-7 w-9 items-center justify-center rounded text-muted-foreground hover:bg-[#e81123] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { ExternalLink, Printer, ZoomIn, Minimize2 } from "lucide-react";
import type { Mouvement } from "@/types";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModeleFacture } from "@/components/facture/modele-facture";
import { imprimerFacture, genererNomFichierFacture } from "@/lib/impression";

interface ModalFactureProps {
  ouvert: boolean;
  onFermer: () => void;
  mouvement: Mouvement | { data: Mouvement } | null;
}

export function ModalFacture({ ouvert, onFermer, mouvement: propMouvement }: ModalFactureProps) {
  const { t } = useI18n();
  const zoneImpressionRef = useRef<HTMLDivElement>(null);
  const [modeZoom, setModeZoom] = useState<"ajuster" | "100%">("ajuster");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(
      typeof window !== "undefined" &&
        (Boolean(window.teloraDesktop?.isDesktop) ||
          document.documentElement.classList.contains("telora-desktop"))
    );
  }, []);

  const mouvement: Mouvement | null =
    propMouvement && typeof propMouvement === "object" && "data" in propMouvement && propMouvement.data
      ? (propMouvement.data as Mouvement)
      : (propMouvement as Mouvement | null);

  const lancerImpression = useCallback(() => {
    if (!mouvement) return;
    imprimerFacture("facture-imprimable", {
      nomClient: mouvement.client_nom,
      dateIso: mouvement.created_at,
    });
  }, [mouvement]);

  // Synchronise le nom du document (utilisé comme nom de fichier PDF lors de l'enregistrement)
  useEffect(() => {
    if (!ouvert || !mouvement) return;
    const ancienTitre = document.title;
    document.title = genererNomFichierFacture(mouvement.client_nom, mouvement.created_at);
    return () => {
      document.title = ancienTitre;
    };
  }, [ouvert, mouvement]);

  // Permet d'imprimer avec Ctrl+P / Cmd+P quand le modal est ouvert
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p" && ouvert) {
        e.preventDefault();
        lancerImpression();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ouvert, lancerImpression]);

  if (!mouvement) return null;

  return (
    <Dialog open={ouvert} onOpenChange={(v) => !v && onFermer()}>
      <DialogContent
        className="w-full sm:max-w-[900px] h-[92vh] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-muted/40 border border-border/80 shadow-2xl rounded-2xl print:border-none print:shadow-none print:bg-white print:max-h-none print:h-auto print:overflow-visible print:p-0"
        style={{ height: "92vh", maxHeight: "92vh" }}
        showCloseButton={true}
      >
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border/60 px-5 py-3 bg-card shrink-0 pr-12 print:hidden">
          <div className="min-w-0 flex-1 pr-3">
            <DialogTitle className="text-sm font-bold truncate text-foreground">
              {t("factures.factureTitre")} {mouvement.numero_facture || `№0${mouvement.id}`}
            </DialogTitle>
            <p className="text-xs text-muted-foreground truncate">
              {mouvement.client_nom ? `${mouvement.client_nom} · ` : ""}
              {t("factures.titre")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Bascule pour voir toute la facture (ajuster) ou taille réelle (100%) */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModeZoom((prev) => (prev === "ajuster" ? "100%" : "ajuster"))}
              className="h-8 gap-1.5 text-xs font-semibold"
              title={modeZoom === "ajuster" ? t("factures.zoomTailleReelle") : t("factures.zoomAjuster")}
            >
              {modeZoom === "ajuster" ? (
                <>
                  <ZoomIn className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("factures.zoomTailleReelle")}</span>
                </>
              ) : (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("factures.zoomAjuster")}</span>
                </>
              )}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={lancerImpression}
              className="h-8 gap-1.5 shadow-xs font-semibold text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{t("factures.imprimer")}</span>
            </Button>

            {/* Bouton d'ouverture de page externe masqué sur la version Desktop */}
            {!isDesktop && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bouton-externe-facture"
                nativeButton={false}
                render={
                  <Link
                    href={`/factures/${mouvement.uuid ?? mouvement.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                title={t("factures.voirFacture")}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Corps avec défilement pour prévisualiser l'intégralité de la feuille A4 */}
        <div
          className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 pb-8 flex justify-center bg-muted/30 overscroll-contain print:overflow-visible print:p-0 print:bg-white"
          style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}
        >
          <div ref={zoneImpressionRef} className="w-full flex justify-center py-1">
            <ModeleFacture
              mouvement={mouvement}
              zoomMode={modeZoom}
              onZoomChange={(nouveau) => setModeZoom(nouveau as "ajuster" | "100%")}
              afficherControlesZoom={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

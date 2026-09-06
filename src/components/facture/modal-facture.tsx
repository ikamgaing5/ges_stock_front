"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Printer, X } from "lucide-react";
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
  mouvement: Mouvement | null;
}

export function ModalFacture({ ouvert, onFermer, mouvement }: ModalFactureProps) {
  const { t } = useI18n();
  const zoneImpressionRef = useRef<HTMLDivElement>(null);

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
        className="w-full sm:max-w-[890px] max-h-[92dvh] flex flex-col p-0 overflow-hidden bg-muted/40 border border-border/80 shadow-2xl rounded-2xl print:border-none print:shadow-none print:bg-white print:max-h-none print:overflow-visible print:p-0"
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
            <Button
              variant="default"
              size="sm"
              onClick={lancerImpression}
              className="h-8 gap-1.5 shadow-xs font-semibold text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{t("factures.imprimer")}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
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
          </div>
        </DialogHeader>

        {/* Corps avec défilement pour prévisualiser la feuille A4 */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex justify-center bg-muted/30 overscroll-contain print:overflow-visible print:p-0 print:bg-white">
          <div ref={zoneImpressionRef} className="w-full flex justify-center">
            <ModeleFacture mouvement={mouvement} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

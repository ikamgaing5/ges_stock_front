"use client";

import { ExternalLink, Info, ShieldCheck, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogCorps,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconeCarteBancaires,
  IconeMtnMomo,
  IconeOrangeMoney,
} from "@/components/icones-paiement";
import type { FactureAbonnementItem } from "@/types";

interface Props {
  facture: FactureAbonnementItem | null;
  ouvert: boolean;
  onFermer: () => void;
}

export function ModalPreuveOperateur({ facture, ouvert, onFermer }: Props) {
  const { formatDate, formatMontant } = useI18n();

  if (!facture) return null;

  const estOrange = facture.moyen_paiement === "orange_money";
  const estMtn = facture.moyen_paiement === "mtn_momo";
  const estCarte = facture.moyen_paiement === "carte";

  return (
    <Dialog open={ouvert} onOpenChange={(val) => !val && onFermer()}>
      <DialogContent className="max-w-md p-0 border border-border shadow-2xl">
        <DialogHeader className="px-5 py-4 border-b bg-muted/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            {estOrange && <IconeOrangeMoney className="h-6 w-6" />}
            {estMtn && <IconeMtnMomo className="h-6 w-6" />}
            {estCarte && <IconeCarteBancaires className="h-6 w-9" />}
            <div>
              <DialogTitle className="text-sm font-bold">
                Preuve de transaction opérateur
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground">
                Justificatif de débit réseau
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onFermer}
            className="h-7 w-7 rounded-full"
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </DialogHeader>

        <DialogCorps className="p-5 space-y-4 text-xs">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Paiement confirmé par l&apos;opérateur</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Ce règlement a été authentifié et validé par les serveurs sécurisés de{" "}
              {estOrange
                ? "Orange Money"
                : estMtn
                  ? "MTN Mobile Money"
                  : estCarte
                    ? "la passerelle bancaire"
                    : "l'opérateur"}.
            </p>
          </div>

          <div className="divide-y rounded-lg border bg-muted/20">
            <div className="flex justify-between items-center p-2.5">
              <span className="text-muted-foreground">Montant débité :</span>
              <span className="font-bold text-foreground font-mono">
                {formatMontant(facture.total, facture.devise)}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5">
              <span className="text-muted-foreground">Moyen de règlement :</span>
              <span className="font-semibold text-foreground">
                {estOrange
                  ? "Orange Money Cameroun"
                  : estMtn
                    ? "MTN MoMo Cameroun"
                    : estCarte
                      ? "Carte Bancaire (Visa/Mastercard)"
                      : facture.moyen_paiement}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5">
              <span className="text-muted-foreground">Réf. Opérateur Réseau :</span>
              <span className="font-mono font-medium text-foreground bg-background px-2 py-0.5 rounded border border-border/80">
                {facture.operateur_id || "N/A (Transaction directe)"}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5">
              <span className="text-muted-foreground">Réf. Interne Telora :</span>
              <span className="font-mono text-muted-foreground text-[11px]">
                {facture.reference}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5">
              <span className="text-muted-foreground">Horodatage du débit :</span>
              <span className="text-foreground">
                {formatDate(facture.date)}
              </span>
            </div>
          </div>

          {facture.recu_url && (
            <div className="pt-1">
              <Button
                variant="outline"
                className="w-full text-xs gap-2"
                onClick={() => window.open(facture.recu_url!, "_blank")}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Ouvrir le reçu en ligne officiel de la passerelle</span>
              </Button>
            </div>
          )}
        </DialogCorps>

        <DialogFooter className="px-5 py-2.5 border-t bg-muted/30">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onFermer}
            className="text-xs ml-auto"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

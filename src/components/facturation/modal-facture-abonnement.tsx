"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Printer, ShieldCheck, X } from "lucide-react";
import { api, ErreurApi } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { IconeTelora } from "@/components/ui/logo-telora";
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
import type { FactureAbonnementDetail } from "@/types";

interface Props {
  reference: string | null;
  ouvert: boolean;
  onFermer: () => void;
}

export function ModalFactureAbonnement({ reference, ouvert, onFermer }: Props) {
  const { t, formatMontant, formatDate, formatDateCourte } = useI18n();
  const [facture, setFacture] = useState<FactureAbonnementDetail | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!ouvert || !reference) {
      setFacture(null);
      return;
    }

    let actif = true;
    setChargement(true);
    setErreur(null);

    api
      .get<FactureAbonnementDetail>(`/facturation/factures/${reference}`)
      .then((data) => {
        if (actif) {
          setFacture(data);
        }
      })
      .catch((err) => {
        if (actif) {
          setErreur(
            err instanceof ErreurApi
              ? err.resume()
              : "Impossible de charger la facture demandée."
          );
        }
      })
      .finally(() => {
        if (actif) setChargement(false);
      });

    return () => {
      actif = false;
    };
  }, [ouvert, reference]);

  function imprimer() {
    window.print();
  }

  return (
    <Dialog open={ouvert} onOpenChange={(val) => !val && onFermer()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 border border-border shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base font-bold">
              {facture ? facture.numero_facture : "Facture d'abonnement"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Facture officielle Telora — Justificatif comptable
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onFermer}
            className="h-8 w-8 rounded-full"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <DialogCorps className="p-6 overflow-y-auto space-y-6 print:p-0">
          {chargement && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">
                Génération de la facture en cours...
              </p>
            </div>
          )}

          {erreur && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive text-center">
              {erreur}
            </div>
          )}

          {facture && !chargement && (
            <div
              id="facture-imprimable"
              className="space-y-6 text-foreground text-sm bg-card p-6 sm:p-8 rounded-xl border border-border/80 shadow-2xs"
            >
              {/* En-tête de facture */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IconeTelora size={32} />
                    <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                      TELORA
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p className="font-semibold text-foreground">
                      {facture.emetteur.societe}
                    </p>
                    <p>{facture.emetteur.adresse}</p>
                    <p>
                      {facture.emetteur.ville}, {facture.emetteur.pays}
                    </p>
                    <p>
                      NIU : <span className="font-mono">{facture.emetteur.niu}</span> • RCCM :{" "}
                      <span className="font-mono">{facture.emetteur.rccm}</span>
                    </p>
                    <p>Contact : {facture.emetteur.email}</p>
                  </div>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Facture Acquittée
                  </span>
                  <h2 className="text-base font-bold font-mono text-foreground pt-1">
                    {facture.numero_facture}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Date : {formatDateCourte(facture.date_emission)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Réf. Transaction :{" "}
                    <span className="font-mono font-medium text-foreground">
                      {facture.reference_transaction}
                    </span>
                  </p>
                </div>
              </div>

              {/* Bloc Destinataire / Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg bg-muted/30 p-4 border border-border/60">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Facturé à (Client) :
                  </span>
                  <div className="mt-1 space-y-0.5 text-xs">
                    <p className="font-bold text-foreground text-sm">
                      {facture.client.entreprise}
                    </p>
                    <p className="text-muted-foreground">
                      Attn : {facture.client.nom}
                    </p>
                    <p className="text-muted-foreground">
                      {facture.client.email}
                      {facture.client.telephone ? ` • ${facture.client.telephone}` : ""}
                    </p>
                    {facture.client.adresse && (
                      <p className="text-muted-foreground">
                        {facture.client.adresse}, {facture.client.ville}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Identifiants fiscaux client :
                  </span>
                  <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {facture.client.niu && (
                      <p>
                        NIU : <span className="font-mono font-medium text-foreground">{facture.client.niu}</span>
                      </p>
                    )}
                    {facture.client.rccm && (
                      <p>
                        RCCM : <span className="font-mono font-medium text-foreground">{facture.client.rccm}</span>
                      </p>
                    )}
                    <p>Pays : {facture.client.pays}</p>
                  </div>
                </div>
              </div>

              {/* Tableau de la prestation */}
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b text-foreground font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Description du service</th>
                      <th className="py-2.5 px-3 text-center">Période</th>
                      <th className="py-2.5 px-3 text-center">Qté</th>
                      <th className="py-2.5 px-3 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-muted-foreground">
                    {facture.lignes.map((ligne, idx) => (
                      <tr key={idx} className="hover:bg-muted/10">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-foreground">
                            {ligne.designation}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Accès complet logiciel de stock, caisse, impression tickets et support.
                          </p>
                        </td>
                        <td className="py-3 px-3 text-center text-foreground font-medium">
                          {ligne.periode}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {ligne.quantite}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-foreground">
                          {formatMontant(ligne.total, facture.devise)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totaux & Mentions de règlement */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                <div className="space-y-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-xs w-full sm:max-w-sm">
                  <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Règlement enregistré & validé</span>
                  </div>
                  <div className="text-muted-foreground space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span>Moyen :</span>
                      {facture.moyen_paiement === "orange_money" && (
                        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                          <IconeOrangeMoney className="h-4 w-4" /> Orange Money
                        </span>
                      )}
                      {facture.moyen_paiement === "mtn_momo" && (
                        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                          <IconeMtnMomo className="h-4 w-4" /> MTN Mobile Money
                        </span>
                      )}
                      {facture.moyen_paiement === "carte" && (
                        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                          <IconeCarteBancaires className="h-4 w-6" /> Carte Bancaire
                        </span>
                      )}
                      {!["orange_money", "mtn_momo", "carte"].includes(
                        facture.moyen_paiement || ""
                      ) && (
                        <span className="font-semibold text-foreground">
                          {facture.moyen_paiement || "Paiement en ligne"}
                        </span>
                      )}
                    </div>
                    {facture.operateur_id && (
                      <p>
                        Réf. Opérateur :{" "}
                        <span className="font-mono text-foreground font-medium">
                          {facture.operateur_id}
                        </span>
                      </p>
                    )}
                    <p>Payé le : {formatDate(facture.date_emission)}</p>
                  </div>
                </div>

                <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-muted-foreground py-1 border-b">
                    <span>Total Net HT :</span>
                    <span className="font-semibold text-foreground">
                      {formatMontant(facture.montant_ht, facture.devise)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground py-1 border-b">
                    <span>TVA (0% — Prestation SaaS) :</span>
                    <span className="font-semibold text-foreground">0 FCFA</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-sm font-bold text-foreground">
                    <span>Total TTC Réglé :</span>
                    <span className="text-base font-extrabold text-primary font-mono">
                      {formatMontant(facture.montant_ttc, facture.devise)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mentions légales de bas de page */}
              <div className="pt-4 border-t text-[11px] text-muted-foreground text-center space-y-1">
                <p>
                  Facture acquittée conformément aux dispositions fiscales en vigueur. Prestation logicielle exonérée de retenue à la source.
                </p>
                <p className="text-[10px] text-muted-foreground/80">
                  Telora — Solution certifiée de gestion de stock et caisse pour boutiques de téléphonie.
                </p>
              </div>
            </div>
          )}
        </DialogCorps>

        <DialogFooter className="px-6 py-3 border-t bg-muted/30 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onFermer}
            className="text-xs"
          >
            Fermer
          </Button>

          {facture && (
            <Button
              type="button"
              size="sm"
              onClick={imprimer}
              className="text-xs gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimer / Sauvegarder (PDF)</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

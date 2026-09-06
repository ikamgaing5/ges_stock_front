"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Eye, FileText, Printer, Receipt, Search } from "lucide-react";
import { api } from "@/lib/api";
import { useListe } from "@/lib/useListe";
import { formaterImei } from "@/lib/imei";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import {
  Apparait,
  EtatErreur,
  EtatVide,
  SquelettePageTableau,
  SquelettesTableau,
  TitrePage,
} from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ModalFacture } from "@/components/facture/modal-facture";
import type { Mouvement, Page } from "@/types";

export default function PageMesFactures() {
  const { devise, deviseBoutique, parametresBoutique } = useAuth();
  const { t, formatMontant, formatDate } = useI18n();

  const [recherche, setRecherche] = useState("");
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [modePaiement, setModePaiement] = useState("tous");
  const [page, setPage] = useState(1);

  // Mouvement sélectionné pour affichage/impression dans le modal
  const [factureSelectionnee, setFactureSelectionnee] = useState<Mouvement | null>(null);

  const boutiqueId = parametresBoutique.boutique_id;

  const { donnees, chargement, erreur, recharger } = useListe(
    (signal) =>
      api.get<Page<Mouvement>>(
        "/mouvements",
        {
          boutique_id: boutiqueId,
          type: "vente",
          recherche: recherche.trim() || undefined,
          mode_paiement: modePaiement === "tous" ? undefined : modePaiement,
          du: du || undefined,
          au: au || undefined,
          page,
        },
        signal,
      ),
    [boutiqueId, recherche, modePaiement, du, au, page],
  );

  const factures = donnees?.data ?? [];
  const nbPages = donnees?.meta.last_page ?? 1;
  const total = donnees?.meta.total ?? 0;

  const filtreActif = Boolean(recherche.trim() || du || au || modePaiement !== "tous");

  if (!donnees && chargement) {
    return (
      <SquelettePageTableau
        lignes={8}
        colonnes={6}
        selectsFiltre={3}
        avecBouton={false}
      />
    );
  }

  return (
    <>
      <TitrePage
        titre={t("factures.titre")}
        chargement={chargement}
        description={t("factures.description")}
      />

      {/* Barre de filtres */}
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-2.5 p-3 sm:gap-3 sm:p-5">
          {/* Recherche texte (client, téléphone, IMEI, N° facture) */}
          <div className="w-full space-y-1.5 sm:w-64">
            <Label htmlFor="recherche-facture" className="text-xs sm:text-sm">
              {t("commun.recherche")}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="recherche-facture"
                className="h-9 sm:h-10 pl-9"
                placeholder={t("factures.recherchePlaceholder")}
                value={recherche}
                onChange={(e) => {
                  setRecherche(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="w-[calc(50%-0.35rem)] space-y-1.5 sm:w-44">
            <Label className="text-xs sm:text-sm">{t("factures.modePaiement")}</Label>
            <Select
              items={{
                tous: t("factures.tousPaiements"),
                cash: t("factures.cash"),
                om_momo: t("factures.omMomo"),
              }}
              value={modePaiement}
              onValueChange={(v) => {
                setModePaiement(v ?? "tous");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-full sm:h-10 sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">{t("factures.tousPaiements")}</SelectItem>
                <SelectItem value="cash">{t("factures.cash")}</SelectItem>
                <SelectItem value="om_momo">{t("factures.omMomo")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date début */}
          <div className="w-[calc(50%-0.35rem)] space-y-1.5 sm:w-36">
            <Label htmlFor="du" className="text-xs sm:text-sm">
              {t("mouvements.filtreDu")}
            </Label>
            <Input
              id="du"
              type="date"
              className="chiffres h-9 w-full sm:h-10 sm:w-36"
              value={du}
              onChange={(e) => {
                setDu(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Date fin */}
          <div className="w-[calc(50%-0.35rem)] space-y-1.5 sm:w-36">
            <Label htmlFor="au" className="text-xs sm:text-sm">
              {t("mouvements.filtreAu")}
            </Label>
            <Input
              id="au"
              type="date"
              className="chiffres h-9 w-full sm:h-10 sm:w-36"
              value={au}
              onChange={(e) => {
                setAu(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {filtreActif && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRecherche("");
                setModePaiement("tous");
                setDu("");
                setAu("");
                setPage(1);
              }}
            >
              {t("commun.reinitialiser")}
            </Button>
          )}
        </CardContent>
      </Card>

      {erreur ? (
        <EtatErreur message={erreur} onReessayer={recharger} />
      ) : chargement ? (
        <SquelettesTableau lignes={8} colonnes={6} />
      ) : factures.length === 0 ? (
        <EtatVide
          icone={<Receipt className="h-6 w-6" />}
          titre={t("factures.aucuneFacture")}
          description={
            filtreActif
              ? t("factures.aucuneFactureDesc")
              : t("factures.aucuneFactureDesc")
          }
        />
      ) : (
        <Apparait>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("factures.numero")}</TableHead>
                      <TableHead>{t("factures.dateHeure")}</TableHead>
                      <TableHead>{t("factures.client")}</TableHead>
                      <TableHead>{t("factures.articlesAchetes")}</TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t("factures.modePaiement")}
                      </TableHead>
                      <TableHead className="text-right">{t("factures.montant")}</TableHead>
                      <TableHead className="text-right w-28">{t("commun.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {factures.map((facture) => {
                      const tel = facture.telephone;
                      const dev = facture.boutique?.devise ?? deviseBoutique ?? devise;
                      return (
                        <TableRow key={facture.id}>
                          <TableCell className="font-mono text-xs font-bold whitespace-nowrap">
                            <Link
                              href={`/factures/${facture.uuid ?? facture.id}`}
                              className="text-primary hover:underline"
                              title={t("factures.voirFacture")}
                            >
                              {facture.numero_facture || `№0${facture.id}`}
                            </Link>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(facture.created_at)}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-foreground block">
                              {facture.client_nom || "—"}
                            </span>
                            {facture.client_telephone && (
                              <span className="text-xs font-mono text-muted-foreground">
                                {facture.client_telephone}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/telephones/${tel?.id}`}
                              className="font-medium text-foreground hover:underline block"
                            >
                              {tel?.modele?.libelle ?? tel?.modele?.nom ?? "Téléphone"}
                            </Link>
                            {tel?.imei && (
                              <span className="chiffres font-mono text-xs text-muted-foreground">
                                {formaterImei(tel.imei)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="hidden whitespace-nowrap text-xs md:table-cell">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                facture.mode_paiement === "om_momo"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              }`}
                            >
                              {facture.mode_paiement === "om_momo"
                                ? t("factures.omMomo")
                                : t("factures.cash")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-sm whitespace-nowrap">
                            {formatMontant(facture.prix ?? tel?.prix_vente_reel ?? 0, dev, dev)}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFactureSelectionnee(facture)}
                                className="h-8 gap-1.5 text-xs"
                              >
                                <Printer className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                  {t("factures.imprimer")}
                                </span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                nativeButton={false}
                                render={
                                  <Link
                                    href={`/factures/${facture.uuid ?? facture.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  />
                                }
                                title={t("factures.voirFacture")}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </Apparait>
      )}

      {nbPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("commun.precedent")}
          </Button>
          <span className="chiffres text-sm text-muted-foreground">
            {t("commun.pageSur", { current: page, total: nbPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= nbPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("commun.suivant")}
          </Button>
        </div>
      )}

      {/* Modal d'aperçu et d'impression */}
      <ModalFacture
        ouvert={factureSelectionnee !== null}
        onFermer={() => setFactureSelectionnee(null)}
        mouvement={factureSelectionnee}
      />
    </>
  );
}

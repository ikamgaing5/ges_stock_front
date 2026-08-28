"use client";

/** Fiche d'un appareil (/telephones/12). */

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { api, ErreurApi } from "@/lib/api";
import { formaterImei } from "@/lib/imei";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { ActionsTelephone } from "@/components/actions-telephone";
import {
  Apparait,
  EtatErreur,
  PastilleMouvement,
  PastilleStatut,
  SquelettesTableau,
  TitrePage,
} from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Mouvement, Page, Telephone } from "@/types";

export default function PageAppareil({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { devise, deviseBoutique } = useAuth();
  const { t, formatMontant, formatDate, libelleEtat, libelleStatut, lang } =
    useI18n();

  const [appareil, setAppareil] = useState<Telephone | null>(null);
  const [historique, setHistorique] = useState<Mouvement[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [nonTrouve, setNonTrouve] = useState(false);
  const [nonAutorise, setNonAutorise] = useState(false);

  const charger = useCallback(async () => {
    setErreur(null);
    setNonTrouve(false);
    setNonAutorise(false);
    try {
      const [fiche, mouvements] = await Promise.all([
        api.get<{ data: Telephone }>(`/telephones/${id}`),
        api.get<Page<Mouvement>>("/mouvements", {
          telephone_id: id,
          par_page: 50,
        }),
      ]);
      setAppareil(fiche.data);
      setHistorique(mouvements.data);
    } catch (e) {
      if (e instanceof ErreurApi && e.statut === 404) {
        setNonTrouve(true);
      } else if (e instanceof ErreurApi && e.statut === 403) {
        setNonAutorise(true);
      } else {
        setErreur(e instanceof ErreurApi ? e.message : t("commun.erreur"));
      }
    } finally {
      setChargement(false);
    }
  }, [id, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  if (chargement) return <SquelettesTableau />;

  if (nonTrouve || nonAutorise) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-lg font-medium">
          {t(nonTrouve ? "telephones.deviceNotFound" : "telephones.accessDenied")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t(nonTrouve ? "telephones.deviceNotFoundDesc" : "telephones.accessDeniedDesc")}
        </p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/telephones" />}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("telephones.backToInventory")}
        </Button>
      </div>
    );
  }

  if (erreur || !appareil) {
    return (
      <EtatErreur
        message={erreur ?? t("telephones.deviceNotFoundSimple")}
        onReessayer={() => void charger()}
      />
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        nativeButton={false}
        render={<Link href="/telephones" />}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("telephones.backToInventory")}
      </Button>

      <TitrePage titre={appareil.modele?.libelle ?? "Appareil"}>
        <PastilleStatut statut={appareil.statut} className="px-3 py-1 text-sm" />
      </TitrePage>

      <p className="chiffres -mt-3 mb-6 font-mono text-sm text-muted-foreground">
        {formaterImei(appareil.imei)}
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Apparait>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("commun.actions")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ActionsTelephone
                  telephone={appareil}
                  surSucces={() => void charger()}
                />
              </CardContent>
            </Card>
          </Apparait>

          <Apparait index={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("telephones.identification")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Ligne
                  libelle={t("telephones.imei")}
                  valeur={formaterImei(appareil.imei)}
                  mono
                />
                {appareil.imei2 && (
                  <Ligne
                    libelle={t("telephones.imei2")}
                    valeur={formaterImei(appareil.imei2)}
                    mono
                  />
                )}
                {appareil.numero_serie && (
                  <Ligne
                    libelle={t("telephones.numeroSerie")}
                    valeur={appareil.numero_serie}
                    mono
                  />
                )}
                <Ligne
                  libelle={t("telephones.couleur")}
                  valeur={appareil.couleur ?? "—"}
                />
                <Ligne
                  libelle={t("commun.etat")}
                  valeur={libelleEtat(appareil.etat)}
                />
                <Ligne
                  libelle={t("telephones.boutique")}
                  valeur={appareil.boutique?.nom ?? "—"}
                  icone={<Store className="h-3.5 w-3.5" />}
                />
              </CardContent>
            </Card>
          </Apparait>

          <Apparait index={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("telephones.commercial")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Ligne
                  libelle={t("telephones.prixAchat")}
                  valeur={formatMontant(appareil.prix_achat, devise, appareil.boutique?.devise ?? deviseBoutique)}
                />
                <Ligne
                  libelle={t("telephones.prixVente")}
                  valeur={formatMontant(appareil.prix_vente, devise, appareil.boutique?.devise ?? deviseBoutique)}
                />
                {appareil.prix_vente_reel !== null && (
                  <Ligne
                    libelle={t("telephones.venduA", { client: "" })}
                    valeur={formatMontant(appareil.prix_vente_reel, devise, appareil.boutique?.devise ?? deviseBoutique)}
                    accent
                  />
                )}
                {appareil.fournisseur && (
                  <Ligne
                    libelle={t("telephones.fournisseur")}
                    valeur={appareil.fournisseur}
                  />
                )}
                {appareil.client_nom && (
                  <Ligne
                    libelle={t("telephones.clientNom")}
                    valeur={appareil.client_nom}
                  />
                )}
                {appareil.client_telephone && (
                  <Ligne
                    libelle={t("telephones.clientTelephone")}
                    valeur={appareil.client_telephone}
                  />
                )}
                <Ligne
                  libelle={t("telephones.tableauDateEntree")}
                  valeur={
                    appareil.entre_le ? formatDate(appareil.entre_le) : "—"
                  }
                />
                {appareil.sorti_le && (
                  <Ligne
                    libelle={t("telephones.exitedOn")}
                    valeur={formatDate(appareil.sorti_le)}
                  />
                )}
                {appareil.notes && (
                  <p className="border-t pt-3 text-sm text-muted-foreground">
                    {appareil.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          </Apparait>
        </div>

        <Apparait index={3}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">
                {t("telephones.historiqueAppareil")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {historique.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {t("telephones.aucunHistorique")}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("commun.date")}</TableHead>
                        <TableHead>{t("commun.actions")}</TableHead>
                        <TableHead>{t("commun.statut")}</TableHead>
                        <TableHead>{t("mouvements.tableauAuteur")}</TableHead>
                        <TableHead>{t("commun.details")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historique.map((mouvement) => (
                        <TableRow key={mouvement.id}>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(mouvement.created_at)}
                          </TableCell>
                          <TableCell>
                            <PastilleMouvement type={mouvement.type} />
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs">
                            {mouvement.statut_avant ? (
                              <span className="text-muted-foreground">
                                {libelleStatut(mouvement.statut_avant)}
                                {" → "}
                              </span>
                            ) : null}
                            <span className="font-medium">
                              {libelleStatut(mouvement.statut_apres)}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {mouvement.user?.name ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {mouvement.type === "transfert" &&
                            mouvement.boutique_source ? (
                              <>
                                {mouvement.boutique_source.nom} →{" "}
                                {mouvement.boutique_destination?.nom}
                              </>
                            ) : (
                              <>
                                {mouvement.client_nom && (
                                  <span className="block">
                                    {mouvement.client_nom}
                                  </span>
                                )}
                                {mouvement.prix !== null && (
                                  <span className="chiffres block">
                                    {formatMontant(mouvement.prix, devise, appareil.boutique?.devise ?? deviseBoutique)}
                                  </span>
                                )}
                                {mouvement.motif && (
                                  <span>{mouvement.motif}</span>
                                )}
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </Apparait>
      </div>
    </>
  );
}

function Ligne({
  libelle,
  valeur,
  mono,
  accent,
  icone,
}: {
  libelle: string;
  valeur: string;
  mono?: boolean;
  accent?: boolean;
  icone?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{libelle}</span>
      <span
        className={[
          "min-w-0 truncate text-right font-medium",
          mono ? "chiffres font-mono text-xs" : "",
          accent ? "text-statut-ok" : "",
        ].join(" ")}
      >
        {icone && <span className="mr-1.5 inline-block align-middle">{icone}</span>}
        {valeur}
      </span>
    </div>
  );
}

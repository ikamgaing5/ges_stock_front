"use client";

/** L'historique de tous les mouvements (/mouvements). */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { api } from "@/lib/api";
import { useListe } from "@/lib/useListe";
import { formaterImei } from "@/lib/imei";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import {
  Apparait,
  EtatErreur,
  EtatVide,
  PastilleMouvement,
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
import type { Mouvement, Page, TypeMouvement } from "@/types";

export default function PageHistorique() {
  const { devise, deviseBoutique, parametresBoutique } = useAuth();
  const {
    t,
    formatMontant,
    formatDate,
    libelleStatut,
    libelleMouvement,
  } = useI18n();

  const [type, setType] = useState("tous");
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [page, setPage] = useState(1);

  const boutiqueId = parametresBoutique.boutique_id;

  const typesDispo: TypeMouvement[] = [
    "entree",
    "vente",
    "reservation",
    "transfert",
    "sav",
    "retour",
    "perte",
    "correction",
  ];

  const optionsType: Record<string, string> = useMemo(
    () => ({
      tous: t("mouvements.tousTypes"),
      ...Object.fromEntries(typesDispo.map((m) => [m, libelleMouvement(m)])),
    }),
    [t, libelleMouvement],
  );

  const { donnees, chargement, erreur, recharger } = useListe(
    (signal) =>
      api.get<Page<Mouvement>>(
        "/mouvements",
        {
          boutique_id: boutiqueId,
          type: type === "tous" ? undefined : type,
          du: du || undefined,
          au: au || undefined,
          page,
        },
        signal,
      ),
    [boutiqueId, type, du, au, page],
  );

  const mouvements = donnees?.data ?? [];
  const nbPages = donnees?.meta.last_page ?? 1;
  const total = donnees?.meta.total ?? 0;

  const filtreActif = type !== "tous" || du || au;

  if (!donnees) {
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
        titre={t("mouvements.titre")}
        chargement={chargement}
        description={t("mouvements.totalMouvements", { total })}
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-2.5 p-3 sm:gap-3 sm:p-5">
          <div className="w-full space-y-1.5 sm:w-44">
            <Label className="text-xs sm:text-sm">{t("commun.actions")}</Label>
            <Select
              items={optionsType}
              value={type}
              onValueChange={(v) => {
                setType(v ?? "tous");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-full sm:h-10 sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(optionsType).map(([valeur, libelle]) => (
                  <SelectItem key={valeur} value={valeur}>
                    {libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[calc(50%-0.35rem)] space-y-1.5 sm:w-40">
            <Label htmlFor="du" className="text-xs sm:text-sm">{t("mouvements.filtreDu")}</Label>
            <Input
              id="du"
              type="date"
              className="chiffres h-9 w-full sm:h-10 sm:w-40"
              value={du}
              onChange={(e) => {
                setDu(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="w-[calc(50%-0.35rem)] space-y-1.5 sm:w-40">
            <Label htmlFor="au" className="text-xs sm:text-sm">{t("mouvements.filtreAu")}</Label>
            <Input
              id="au"
              type="date"
              className="chiffres h-9 w-full sm:h-10 sm:w-40"
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
              onClick={() => {
                setType("tous");
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
      ) : mouvements.length === 0 ? (
        <EtatVide
          icone={<ArrowLeftRight className="h-5 w-5" />}
          titre={t("mouvements.aucunMouvement")}
          description={
            filtreActif
              ? t("mouvements.aucunMouvementFiltres")
              : t("mouvements.aucunMouvementDesc")
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
                      <TableHead>{t("commun.date")}</TableHead>
                      <TableHead>{t("mouvements.tableauAppareil")}</TableHead>
                      <TableHead>{t("commun.actions")}</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        {t("commun.statut")}
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t("mouvements.tableauAuteur")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("commun.details")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mouvements.map((mouvement) => (
                      <TableRow key={mouvement.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(mouvement.created_at)}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/telephones/${mouvement.telephone?.id}`}
                            className="font-medium hover:underline"
                          >
                            {mouvement.telephone?.modele?.libelle ?? "Appareil"}
                          </Link>
                          {mouvement.telephone && (
                            <p className="chiffres font-mono text-xs text-muted-foreground">
                              {formaterImei(mouvement.telephone.imei)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <PastilleMouvement type={mouvement.type} />
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-xs lg:table-cell">
                          {mouvement.statut_avant && (
                            <span className="text-muted-foreground">
                              {libelleStatut(mouvement.statut_avant)} →{" "}
                            </span>
                          )}
                          <span className="font-medium">
                            {libelleStatut(mouvement.statut_apres)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-sm md:table-cell">
                          {mouvement.user?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {mouvement.type === "transfert" &&
                          mouvement.boutique_source ? (
                            <>
                              {mouvement.boutique_source.nom} →{" "}
                              {mouvement.boutique_destination?.nom}
                            </>
                          ) : (
                            <>
                              {mouvement.prix !== null && (
                                <span className="chiffres block font-medium text-foreground">
                                  {formatMontant(mouvement.prix, devise, deviseBoutique)}
                                </span>
                              )}
                              {mouvement.client_nom && (
                                <span className="block">
                                  {mouvement.client_nom}
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
    </>
  );
}

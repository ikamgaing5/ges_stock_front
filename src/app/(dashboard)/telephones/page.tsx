"use client";

/** Le parc d'appareils (/telephones). */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Boxes, Laptop, Plus, Search, Smartphone } from "lucide-react";
import { api } from "@/lib/api";
import { useListe } from "@/lib/useListe";
import { formaterImei } from "@/lib/imei";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Apparait,
  EtatErreur,
  EtatVide,
  PastilleStatut,
  SquelettePageTableau,
  SquelettesTableau,
  TitrePage,
} from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectRecherche } from "@/components/ui/select-recherche";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Modele, Page, Telephone } from "@/types";

export default function PageParc() {
  const { devise, deviseBoutique, boutiqueActive, parametresBoutique } = useAuth();
  const { t, formatMontant, formatDate, libelleEtat, lang } = useI18n();
  const parametresUrl = useSearchParams();
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [chargementModeles, setChargementModeles] = useState(true);

  // Le tableau de bord renvoie ici avec un statut pré-filtré.
  const [statut, setStatut] = useState(parametresUrl.get("statut") ?? "en_stock");
  const [typeAppareil, setTypeAppareil] = useState<string>("tous");
  const [recherche, setRecherche] = useState("");
  const [modeleId, setModeleId] = useState("tous");
  const [page, setPage] = useState(1);

  const boutiqueId = parametresBoutique.boutique_id;

  const optionsStatut: Record<string, string> = useMemo(
    () => ({
      tous: t("telephones.tousStatuts"),
      en_stock: t("statuts.en_stock"),
      reserve: t("statuts.reserve"),
      vendu: t("statuts.vendu"),
      sav: t("statuts.sav"),
      perdu: t("statuts.perdu"),
    }),
    [t],
  );

  // `useListe` attend 300 ms après la dernière frappe, et annule la
  // recherche précédente : deux réponses ne peuvent plus se doubler et
  // afficher un résultat qui ne correspond plus à la saisie.
  const { donnees, chargement, erreur, recharger } = useListe(
    (signal) =>
      api.get<Page<Telephone>>(
        "/telephones",
        {
          boutique_id: boutiqueId,
          type_appareil: typeAppareil === "tous" ? undefined : typeAppareil,
          recherche,
          statut: statut === "tous" ? undefined : statut,
          modele_id: modeleId === "tous" ? undefined : modeleId,
          page,
        },
        signal,
      ),
    [boutiqueId, typeAppareil, recherche, statut, modeleId, page],
    { attente: 300 },
  );

  const appareils = donnees?.data ?? [];
  const nbPages = donnees?.meta.last_page ?? 1;
  const total = donnees?.meta.total ?? 0;
  const totalBoutique = donnees?.meta.total_boutique;

  // Réinitialiser le modèle sélectionné et la recherche si la boutique, le type ou le statut change
  useEffect(() => {
    setModeleId("tous");
    setRecherche("");
    setPage(1);
  }, [boutiqueId, statut, typeAppareil]);

  // S'il n'y a pas d'appareils dans la boutique (pour la vue actuelle ou au global),
  // on masque le champ de recherche et le filtre des modèles, sauf si une recherche est en cours.
  const aDesAppareils = Boolean(
    recherche !== "" ||
    modeleId !== "tous" ||
    ((totalBoutique === undefined || totalBoutique > 0) && (total > 0 || modeles.length > 0))
  );

  useEffect(() => {
    const controleur = new AbortController();
    setChargementModeles(true);

    api
      .get<{ data: Modele[] }>(
        "/modeles",
        {
          boutique_id: boutiqueId,
          type_appareil: typeAppareil === "tous" ? undefined : typeAppareil,
          statut_telephone: statut,
        },
        controleur.signal,
      )
      .then((r) => setModeles(r.data))
      .catch(() => setModeles([]))
      .finally(() => setChargementModeles(false));

    return () => controleur.abort();
  }, [boutiqueId, statut, typeAppareil]);

  // Sécurité supplémentaire si le modèle sélectionné n'existe pas dans les modèles chargés
  useEffect(() => {
    if (modeleId !== "tous" && !modeles.some((m) => String(m.id) === modeleId)) {
      setModeleId("tous");
    }
  }, [modeles, modeleId]);

  const optionsModeles = useMemo(
    () => [
      { valeur: "tous", libelle: t("telephones.tousModeles") },
      ...modeles.map((m) => ({
        valeur: String(m.id),
        libelle: m.libelle,
        badge:
          statut === "en_stock" && m.nb_en_stock !== undefined && m.nb_en_stock > 0
            ? `${m.nb_en_stock}`
            : undefined,
      })),
    ],
    [modeles, statut, t],
  );

  if (!donnees) {
    return (
      <SquelettePageTableau
        lignes={8}
        colonnes={7}
        selectsFiltre={2}
        avecBouton={true}
      />
    );
  }

  return (
    <>
      <TitrePage
        titre={t("telephones.titre")}
        chargement={chargement}
        description={
          boutiqueActive
            ? `${total} ${t("telephones.titre").toLowerCase()} — ${boutiqueActive.nom}`
            : `${total} ${t("telephones.titre").toLowerCase()}, ${t("dashboard.descriptionToutes").toLowerCase()}`
        }
      >
        <Button
          nativeButton={false}
          render={<Link href="/telephones/nouveau" />}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("telephones.nouvelAppareil")}
        </Button>
      </TitrePage>

      {/* Sélecteur de type d'appareil */}
      <div className="mb-3 flex items-center gap-1.5 rounded-lg border bg-muted/40 p-1 w-fit">
        <button
          type="button"
          onClick={() => setTypeAppareil("tous")}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            typeAppareil === "tous"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("telephones.tousTypes")}
        </button>
        <button
          type="button"
          onClick={() => setTypeAppareil("telephone")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            typeAppareil === "telephone"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Smartphone className="h-3.5 w-3.5" />
          {t("telephones.typeTelephone")}s
        </button>
        <button
          type="button"
          onClick={() => setTypeAppareil("ordinateur_portable")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            typeAppareil === "ordinateur_portable"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Laptop className="h-3.5 w-3.5" />
          {t("telephones.typeOrdinateur")}s
        </button>
      </div>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-2.5 p-3 sm:flex-row sm:gap-3 sm:p-5">
          {aDesAppareils && (
            <div className="relative min-w-48 flex-1 basis-full sm:basis-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 pl-9 sm:h-10"
                placeholder={t("telephones.recherchePlaceholder")}
                value={recherche}
                onChange={(e) => {
                  setRecherche(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          )}

          <Select
            items={optionsStatut}
            value={statut}
            onValueChange={(v) => {
              setStatut(v ?? "tous");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-full sm:h-10 sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(optionsStatut).map(([valeur, libelle]) => (
                <SelectItem key={valeur} value={valeur}>
                  {libelle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {aDesAppareils && (
            <div className="w-full sm:w-56">
              <SelectRecherche
                options={optionsModeles}
                valeur={modeleId}
                onChange={(v) => {
                  setModeleId(v || "tous");
                  setPage(1);
                }}
                disabled={chargementModeles}
                chargement={chargementModeles}
                texteChargement={
                  lang === "en"
                    ? "Loading models..."
                    : "Chargement des modèles…"
                }
                placeholder={t("telephones.tousLesModeles")}
                placeholderRecherche={
                  lang === "en" ? "Filter model..." : "Filtrer un modèle…"
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
      {erreur ? (
        <EtatErreur message={erreur} onReessayer={recharger} />
      ) : chargement ? (
        <SquelettesTableau lignes={8} colonnes={7} />
      ) : appareils.length === 0 ? (
        <EtatVide
          icone={<Boxes className="h-5 w-5" />}
          titre={t("telephones.aucunAppareil")}
          description={t("telephones.aucunAppareilDesc")}
        >
          <Button
            nativeButton={false}
            render={<Link href="/telephones/nouveau" />}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("telephones.nouvelAppareil")}
          </Button>
        </EtatVide>
      ) : (
        <Apparait>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("telephones.tableauAppareil")}</TableHead>
                      <TableHead>{t("telephones.tableauImei")}</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        {t("telephones.tableauBoutique")}
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t("telephones.tableauEtat")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("telephones.tableauPrixVente")}
                      </TableHead>
                      <TableHead>{t("telephones.tableauStatut")}</TableHead>
                      <TableHead className="hidden xl:table-cell">
                        {t("telephones.tableauDateEntree")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appareils.map((appareil) => {
                      const estPc = appareil.type_appareil === "ordinateur_portable";
                      return (
                        <TableRow key={appareil.id}>
                          <TableCell>
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5 shrink-0 text-muted-foreground">
                                {estPc ? (
                                  <Laptop className="h-4 w-4 text-primary" />
                                ) : (
                                  <Smartphone className="h-4 w-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/telephones/${appareil.id}`}
                                  className="font-medium hover:underline block truncate"
                                >
                                  {appareil.modele?.libelle ?? "—"}
                                </Link>
                                <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                                  {appareil.couleur && <span>{appareil.couleur}</span>}
                                  {estPc && appareil.specs_ordinateur && (
                                    <span className="font-mono text-[11px] text-foreground/80 font-normal">
                                      • {appareil.specs_ordinateur}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="chiffres whitespace-nowrap font-mono text-xs">
                            {estPc ? (
                              <div className="flex items-center gap-1.5">
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-sans font-medium text-muted-foreground">
                                  S/N
                                </span>
                                <span>{appareil.numero_serie || "—"}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-sans font-medium text-muted-foreground">
                                  IMEI
                                </span>
                                <span>{formaterImei(appareil.imei)}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="hidden text-muted-foreground lg:table-cell">
                            {appareil.boutique?.nom ?? "—"}
                          </TableCell>
                          <TableCell className="hidden text-muted-foreground md:table-cell">
                            {libelleEtat(appareil.etat)}
                          </TableCell>
                          <TableCell className="chiffres whitespace-nowrap text-right">
                            {formatMontant(
                              appareil.prix_vente_reel ?? appareil.prix_vente,
                              devise,
                              appareil.boutique?.devise ?? deviseBoutique,
                            )}
                          </TableCell>
                          <TableCell>
                            <PastilleStatut statut={appareil.statut} />
                          </TableCell>
                          <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground xl:table-cell">
                            {appareil.entre_le
                              ? formatDate(appareil.entre_le)
                              : "—"}
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
    </>
  );
}

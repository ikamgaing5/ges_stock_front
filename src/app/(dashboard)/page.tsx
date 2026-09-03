"use client";

/** Tableau de bord — la page d'accueil (/). */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  PackageCheck,
  ScanLine,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api, ErreurApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import {
  Apparait,
  EtatErreur,
  PastilleMouvement,
  SqueletteDashboard,
  SqueletteTitrePage,
  TitrePage,
} from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TableauBord } from "@/types";

export default function PageTableauBord() {
  const { utilisateur, devise, deviseBoutique, boutiques, boutiqueActive, parametresBoutique } = useAuth();
  const { t } = useI18n();

  const [donnees, setDonnees] = useState<TableauBord | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      setDonnees(await api.get<TableauBord>("/tableau-bord", parametresBoutique));
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : t("commun.erreur"));
    } finally {
      setChargement(false);
    }
  }, [parametresBoutique, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  if (erreur) {
    return <EtatErreur message={erreur} onReessayer={() => void charger()} />;
  }

  if (chargement || !donnees) {
    return (
      <div className="space-y-4">
        <SqueletteTitrePage avecBouton={true} />
        <SqueletteDashboard />
      </div>
    );
  }

  const prenom = utilisateur?.name.split(" ")[0] ?? "";

  return (
    <>
      <TitrePage
        titre={t("dashboard.bonjour", { nom: prenom })}
        description={
          boutiqueActive
            ? t("dashboard.descriptionBoutique", { boutique: boutiqueActive.nom })
            : t("dashboard.descriptionToutes")
        }
      >
        <Button nativeButton={false} render={<Link href="/telephones/nouveau" />}>
          <ScanLine className="mr-2 h-4 w-4" />
          {t("dashboard.entreeStock")}
        </Button>
      </TitrePage>

      <Contenu
        donnees={donnees}
        devise={devise}
        deviseBoutique={deviseBoutique}
        boutiques={boutiques}
      />
    </>
  );
}

function Contenu({
  donnees,
  devise,
  deviseBoutique,
  boutiques,
}: {
  donnees: TableauBord;
  devise: string;
  deviseBoutique: string;
  boutiques: { id: string | number; devise?: string }[];
}) {
  const { t, formatMontant, formatNombre, formatDate } = useI18n();
  const s = donnees.statistiques;

  return (
    <>
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Apparait index={0}>
          <Statistique
            libelle={t("dashboard.appareilsEnStock")}
            valeur={formatNombre(s.nb_en_stock)}
            detail={`${formatMontant(s.valeur_vente, devise, deviseBoutique)} ${t("dashboard.deValeur")}`}
            icone={PackageCheck}
          />
        </Apparait>
        <Apparait index={1}>
          <Statistique
            libelle={t("dashboard.ventesDuJour", { count: s.ventes_du_jour })}
            valeur={formatNombre(s.ventes_du_jour)}
            detail={formatMontant(s.chiffre_du_jour, devise, deviseBoutique)}
            icone={Banknote}
          />
        </Apparait>
        <Apparait index={2}>
          <Statistique
            libelle={t("dashboard.ventesMois", { count: s.ventes_du_mois })}
            valeur={formatNombre(s.ventes_du_mois)}
            detail={formatMontant(s.chiffre_du_mois, devise, deviseBoutique)}
            icone={BadgeCheck}
          />
        </Apparait>
        <Apparait index={3}>
          <Statistique
            libelle={t("dashboard.alertesStock")}
            valeur={formatNombre(s.nb_alertes)}
            detail={t("dashboard.alertesDesc")}
            icone={TriangleAlert}
            accent={s.nb_alertes > 0 ? "text-statut-alerte" : undefined}
            lien={s.nb_alertes > 0 ? "/modeles?statut=alerte" : undefined}
          />
        </Apparait>
      </div>

      {/* Ce qui n'est ni vendu ni disponible : à surveiller. */}
      {(s.nb_reserves > 0 || s.nb_sav > 0 || s.nb_perdus > 0) && (
        <Apparait index={4} className="mt-3 sm:mt-4">
          <div className="flex flex-wrap gap-x-5 gap-y-2.5 sm:gap-x-8 sm:gap-y-3 rounded-xl border bg-card px-3.5 py-3 sm:px-5 sm:py-4 text-sm">
            <Compteur
              libelle={t("dashboard.appareilsReserves")}
              valeur={s.nb_reserves}
              lien="/telephones?statut=reserve"
            />
            <Compteur
              libelle={t("dashboard.enReparation")}
              valeur={s.nb_sav}
              lien="/telephones?statut=sav"
              icone={Wrench}
            />
            <Compteur
              libelle={t("dashboard.appareilsPerdus")}
              valeur={s.nb_perdus}
              lien="/telephones?statut=perdu"
            />
          </div>
        </Apparait>
      )}

      <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Modèles à recommander */}
        <Apparait index={5}>
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{t("dashboard.alertesStock")}</CardTitle>
              <Link
                href="/modeles?statut=alerte"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("commun.voirTout")}
              </Link>
            </CardHeader>
            <CardContent>
              {donnees.alertes.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {t("dashboard.aucuneAlerte")}
                </p>
              ) : (
                <ul className="divide-y">
                  {donnees.alertes.map((modele) => (
                    <li
                      key={modele.id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <span className="min-w-0 truncate text-sm font-medium">
                        {modele.libelle}
                      </span>
                      <span className="chiffres shrink-0 text-sm">
                        <span
                          className={
                            (modele.nb_en_stock ?? 0) === 0
                              ? "font-semibold text-statut-alerte"
                              : "font-semibold text-statut-attente"
                          }
                        >
                          {modele.nb_en_stock ?? 0}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          / {modele.seuil_alerte}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Apparait>

        {/* Derniers mouvements */}
        <Apparait index={6}>
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{t("dashboard.derniersMouvements")}</CardTitle>
              <Link
                href="/mouvements"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("commun.voirTout")}
              </Link>
            </CardHeader>
            <CardContent>
              {donnees.derniers_mouvements.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {t("dashboard.aucunMouvement")}
                </p>
              ) : (
                <ul className="divide-y">
                  {donnees.derniers_mouvements.map((mouvement) => (
                    <li key={mouvement.id} className="py-2.5">
                      <Link
                        href={`/telephones/${mouvement.telephone?.id}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {mouvement.telephone?.modele?.libelle ?? "Appareil"}
                          </p>
                          <p className="chiffres truncate font-mono text-xs text-muted-foreground">
                            {mouvement.telephone?.imei}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <PastilleMouvement type={mouvement.type} />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(mouvement.created_at)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Apparait>
      </div>

      {/* Répartition, utile dès qu'il y a plusieurs boutiques */}
      {donnees.par_boutique.length > 1 && (
        <Apparait index={7} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("dashboard.repartitionBoutiques")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {donnees.par_boutique.map((ligne) => {
                const total = donnees.par_boutique.reduce(
                  (somme, l) => somme + l.nb_en_stock,
                  0,
                );
                const part = total > 0 ? (ligne.nb_en_stock / total) * 100 : 0;

                const boutiqueLigne = boutiques.find(
                  (b) => String(b.id) === String(ligne.boutique_id),
                );
                const deviseSourceLigne = boutiqueLigne?.devise ?? deviseBoutique;

                return (
                  <div key={ligne.boutique_id}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate font-medium">
                        {ligne.boutique}
                      </span>
                      <span className="chiffres shrink-0 text-muted-foreground">
                        {formatNombre(ligne.nb_en_stock)}{" "}
                        {t("telephones.titre").toLowerCase()} ·{" "}
                        {formatMontant(ligne.valeur, devise, deviseSourceLigne)}
                      </span>
                    </div>
                    {/* Barre de proportion, sans piste de fond marquée */}
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${part}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </Apparait>
      )}
    </>
  );
}

function Statistique({
  libelle,
  valeur,
  detail,
  icone: Icone,
  accent,
  lien,
}: {
  libelle: string;
  valeur: string;
  detail?: string;
  icone: LucideIcon;
  accent?: string;
  lien?: string;
}) {
  const contenu = (
    <Card className="h-full mx-2 transition-colors hover:border-primary/40">
      <CardContent className="flex items-start justify-between gap-3 p-3.5 sm:p-5">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground">{libelle}</p>
          <p
            className={`chiffres mt-0.5 sm:mt-1 text-xl sm:text-2xl font-semibold ${accent ?? ""}`}
          >
            {valeur}
          </p>
          {detail && (
            <p className="mt-0.5 sm:mt-1 truncate text-xs text-muted-foreground">
              {detail}
            </p>
          )}
        </div>
        <Icone
          className={`h-5 w-5 shrink-0 ${accent ?? "text-muted-foreground"}`}
        />
      </CardContent>
    </Card>
  );

  return lien ? <Link href={lien}>{contenu}</Link> : contenu;
}

function Compteur({
  libelle,
  valeur,
  lien,
  icone: Icone,
}: {
  libelle: string;
  valeur: number;
  lien: string;
  icone?: LucideIcon;
}) {
  const { formatNombre } = useI18n();
  if (valeur === 0) return null;

  return (
    <Link href={lien} className="group flex items-center gap-2">
      {Icone && <Icone className="h-4 w-4 text-muted-foreground" />}
      <span className="chiffres font-semibold">{formatNombre(valeur)}</span>
      <span className="text-muted-foreground">{libelle}</span>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

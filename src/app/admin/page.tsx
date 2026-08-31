"use client";

/** Vue d'ensemble de la plateforme (/admin). */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, CalendarClock, Store, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api, ErreurApi } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import {
  Apparait,
  EtatErreur,
  SquelettesCartes,
  TitrePage,
} from "@/components/ui-commun";
import { Card, CardContent } from "@/components/ui/card";
import type { StatistiquesAdmin } from "@/types";

export default function PageAdmin() {
  const { t, formatNombre, lang } = useI18n();
  const [stats, setStats] = useState<StatistiquesAdmin | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      setStats(await api.get<StatistiquesAdmin>("/admin/statistiques"));
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : t("commun.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  return (
    <>
      <TitrePage
        titre={t("admin.vueEnsemble")}
        description={t("admin.vueEnsembleDesc")}
      />

      {erreur ? (
        <EtatErreur message={erreur} onReessayer={() => void charger()} />
      ) : chargement || !stats ? (
        <SquelettesCartes />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Apparait index={0}>
              <Bloc
                libelle={t("admin.clients")}
                valeur={stats.nb_proprietaires}
                detail={t("admin.avecAccesOuvert", {
                  count: formatNombre(stats.nb_actifs),
                })}
                icone={Building2}
                lien="/admin/proprietaires"
              />
            </Apparait>
            <Apparait index={1}>
              <Bloc
                libelle={t("admin.essaisActifs")}
                valeur={stats.nb_essais}
                detail={
                  lang === "en"
                    ? `${formatNombre(stats.inscriptions_30_jours)} sign-up(s) over 30 days`
                    : `${formatNombre(stats.inscriptions_30_jours)} inscription(s) sur 30 jours`
                }
                icone={CalendarClock}
                lien="/admin/proprietaires?statut=essai"
              />
            </Apparait>
            <Apparait index={2}>
              <Bloc
                libelle={t("admin.comptesSuspendus")}
                valeur={stats.nb_suspendus}
                detail={lang === "en" ? "Access cut off" : "Accès coupé"}
                icone={Users}
                accent={stats.nb_suspendus > 0 ? "text-statut-alerte" : undefined}
                lien="/admin/proprietaires?statut=suspendu"
              />
            </Apparait>
            <Apparait index={3}>
              <Bloc
                libelle={t("admin.echeancesProches")}
                valeur={stats.nb_echeances_proches}
                detail={lang === "en" ? "Within 7 days" : "Dans les 7 jours"}
                icone={CalendarClock}
                accent={
                  stats.nb_echeances_proches > 0
                    ? "text-statut-attente"
                    : undefined
                }
              />
            </Apparait>
          </div>

          <Apparait index={4} className="mt-4 sm:mt-6">
            <Card>
              <CardContent className="flex flex-wrap gap-x-6 sm:gap-x-10 gap-y-3 sm:gap-y-4 p-3.5 sm:p-5">
                <Volume
                  libelle={t("admin.totalBoutiques")}
                  valeur={stats.nb_boutiques}
                  icone={Store}
                />
                <Volume
                  libelle={t("admin.totalEmployes")}
                  valeur={stats.nb_employes}
                  icone={Users}
                />
                <Volume
                  libelle={t("admin.totalAppareils")}
                  valeur={stats.nb_appareils}
                />
              </CardContent>
            </Card>
          </Apparait>

          <p className="mt-4 text-xs text-muted-foreground">
            {lang === "en"
              ? "These numbers represent global aggregates. Individual client stock details are neither accessible here nor via API: only the store owner and their team have access."
              : "Ces chiffres sont des volumes globaux. Le détail du stock d'un client n'est accessible ni ici ni par l'API : seul son propriétaire et son équipe peuvent le consulter."}
          </p>
        </>
      )}
    </>
  );
}

function Bloc({
  libelle,
  valeur,
  detail,
  icone: Icone,
  accent,
  lien,
}: {
  libelle: string;
  valeur: number;
  detail?: string;
  icone: LucideIcon;
  accent?: string;
  lien?: string;
}) {
  const { formatNombre } = useI18n();

  const contenu = (
    <Card className="h-full transition-colors hover:border-foreground/25">
      <CardContent className="flex h-full flex-col justify-between gap-4 p-3.5 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{libelle}</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icone className="h-4 w-4" />
          </div>
        </div>

        <div>
          <p className={`chiffres text-2xl font-bold tracking-tight ${accent ?? ""}`}>
            {formatNombre(valeur)}
          </p>
          {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
        </div>
      </CardContent>
    </Card>
  );

  if (lien) {
    return (
      <Link href={lien} className="block h-full">
        {contenu}
      </Link>
    );
  }

  return contenu;
}

function Volume({
  libelle,
  valeur,
  icone: Icone,
}: {
  libelle: string;
  valeur: number;
  icone?: LucideIcon;
}) {
  const { formatNombre } = useI18n();

  return (
    <div className="flex items-center gap-3">
      {Icone && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icone className="h-4 w-4" />
        </div>
      )}
      <div>
        <p className="chiffres text-xl font-bold">{formatNombre(valeur)}</p>
        <p className="text-xs text-muted-foreground">{libelle}</p>
      </div>
    </div>
  );
}

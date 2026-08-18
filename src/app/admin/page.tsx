"use client";

/** Vue d'ensemble de la plateforme (/admin). */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, CalendarClock, Store, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api, ErreurApi } from "@/lib/api";
import { formaterNombre } from "@/lib/format";
import {
  Apparait,
  EtatErreur,
  SquelettesCartes,
  TitrePage,
} from "@/components/ui-commun";
import { Card, CardContent } from "@/components/ui/card";
import type { StatistiquesAdmin } from "@/types";

export default function PageAdmin() {
  const [stats, setStats] = useState<StatistiquesAdmin | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      setStats(await api.get<StatistiquesAdmin>("/admin/statistiques"));
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : "Erreur inconnue.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  return (
    <>
      <TitrePage
        titre="Vue d'ensemble"
        description="Les comptes clients et leurs abonnements. Les stocks ne sont pas accessibles depuis cet espace."
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
                libelle="Clients"
                valeur={stats.nb_proprietaires}
                detail={`${formaterNombre(stats.nb_actifs)} avec un accès ouvert`}
                icone={Building2}
                lien="/admin/proprietaires"
              />
            </Apparait>
            <Apparait index={1}>
              <Bloc
                libelle="En période d'essai"
                valeur={stats.nb_essais}
                detail={`${formaterNombre(stats.inscriptions_30_jours)} inscription(s) sur 30 jours`}
                icone={CalendarClock}
                lien="/admin/proprietaires?statut=essai"
              />
            </Apparait>
            <Apparait index={2}>
              <Bloc
                libelle="Suspendus"
                valeur={stats.nb_suspendus}
                detail="Accès coupé"
                icone={Users}
                accent={stats.nb_suspendus > 0 ? "text-statut-alerte" : undefined}
                lien="/admin/proprietaires?statut=suspendu"
              />
            </Apparait>
            <Apparait index={3}>
              <Bloc
                libelle="Échéances proches"
                valeur={stats.nb_echeances_proches}
                detail="Dans les 7 jours"
                icone={CalendarClock}
                accent={
                  stats.nb_echeances_proches > 0
                    ? "text-statut-attente"
                    : undefined
                }
              />
            </Apparait>
          </div>

          <Apparait index={4} className="mt-6">
            <Card>
              <CardContent className="flex flex-wrap gap-x-10 gap-y-4 pt-6">
                <Volume
                  libelle="Boutiques créées"
                  valeur={stats.nb_boutiques}
                  icone={Store}
                />
                <Volume
                  libelle="Comptes employés"
                  valeur={stats.nb_employes}
                  icone={Users}
                />
                <Volume
                  libelle="Appareils enregistrés"
                  valeur={stats.nb_appareils}
                />
              </CardContent>
            </Card>
          </Apparait>

          <p className="mt-4 text-xs text-muted-foreground">
            Ces chiffres sont des volumes globaux. Le détail du stock d&apos;un
            client n&apos;est accessible ni ici ni par l&apos;API : seul son
            propriétaire et son équipe peuvent le consulter.
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
  const contenu = (
    <Card className="h-full transition-colors hover:border-primary/40">
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{libelle}</p>
          <p className={`chiffres mt-1 text-2xl font-semibold ${accent ?? ""}`}>
            {formaterNombre(valeur)}
          </p>
          {detail && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
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

function Volume({
  libelle,
  valeur,
  icone: Icone,
}: {
  libelle: string;
  valeur: number;
  icone?: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-3">
      {Icone && <Icone className="h-4 w-4 text-muted-foreground" />}
      <div>
        <p className="chiffres text-lg font-semibold">
          {formaterNombre(valeur)}
        </p>
        <p className="text-xs text-muted-foreground">{libelle}</p>
      </div>
    </div>
  );
}

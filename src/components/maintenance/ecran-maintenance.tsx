"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Clock,
  RefreshCw,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { IconeTelora } from "@/components/ui/logo-telora";
import { Button } from "@/components/ui/button";
import type { InfosMaintenance } from "@/types";

export function EcranMaintenance({
  maintenance,
  onMaintenanceTerminee,
}: {
  maintenance: InfosMaintenance;
  onMaintenanceTerminee?: () => void;
}) {
  const { t, formatDate } = useI18n();

  const [verificationEnCours, setVerificationEnCours] = useState(false);
  const [tempsRestant, setTempsRestant] = useState<string | null>(null);

  // Calcul du temps restant si une date de fin estimée est fournie
  useEffect(() => {
    if (!maintenance.fin_estimee) {
      setTempsRestant(null);
      return;
    }

    function calculerTemps() {
      const cible = new Date(maintenance.fin_estimee!).getTime();
      const maintenant = Date.now();
      const diff = cible - maintenant;

      if (diff <= 0) {
        setTempsRestant(t("maintenance.imminente"));
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const heures = Math.floor(minutes / 60);
      const minRestantes = minutes % 60;

      if (heures > 0) {
        setTempsRestant(
          `${heures}h ${minRestantes > 0 ? `${minRestantes}m` : ""}`,
        );
      } else {
        setTempsRestant(`${minutes} minute(s)`);
      }
    }

    calculerTemps();
    const intervalle = setInterval(calculerTemps, 30000);
    return () => clearInterval(intervalle);
  }, [maintenance.fin_estimee, t]);

  // Vérification de la disponibilité (ping statut)
  const verifierStatut = useCallback(
    async (manuel = false) => {
      if (manuel) setVerificationEnCours(true);
      try {
        const res = await api.get<InfosMaintenance>("/maintenance/statut");
        if (!res.active) {
          toast.success(t("maintenance.deRetourSucces"));
          if (onMaintenanceTerminee) {
            onMaintenanceTerminee();
          } else {
            window.location.reload();
          }
        } else if (manuel) {
          toast.info(t("maintenance.toujoursEnCours"));
        }
      } catch {
        // Serveur injoignable, toujours en maintenance
      } finally {
        if (manuel) setVerificationEnCours(false);
      }
    },
    [t, onMaintenanceTerminee],
  );

  // Ping automatique toutes les 15 secondes
  useEffect(() => {
    const minuterie = setInterval(() => {
      void verifierStatut(false);
    }, 15000);
    return () => clearInterval(minuterie);
  }, [verifierStatut]);

  return (
    <div className="fixed inset-0 z-50 flex min-h-[100dvh] flex-col items-center justify-center bg-background/95 p-4 backdrop-blur-md">
      {/* Halo lumineux d'arrière-plan */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <main className="relative flex w-full max-w-lg flex-col items-center text-center">
        {/* Logo & Icône animée */}
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-500/30 bg-amber-500/10 shadow-lg shadow-amber-500/10 backdrop-blur-sm">
            <Wrench className="h-10 w-10 text-amber-600 dark:text-amber-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border shadow-xs">
            <IconeTelora size={16} />
          </div>
        </div>

        {/* Badge statut */}
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          <span>{t("maintenance.badge")}</span>
        </div>

        {/* Titre & Message */}
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("maintenance.titre")}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {maintenance.motif || t("maintenance.motifParDefaut")}
        </p>

        {/* Cartes d'informations & réassurance */}
        <div className="mt-6 w-full space-y-2.5 rounded-2xl border bg-card/60 p-4 text-left shadow-xs backdrop-blur-xs sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {t("maintenance.donneesEnSecurite")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("maintenance.donneesEnSecuriteDesc")}
              </p>
            </div>
          </div>

          {maintenance.fin_estimee && (
            <div className="flex items-start gap-3 border-t pt-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {t("maintenance.repriseEstimee")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {tempsRestant
                    ? `${t("maintenance.dansEnviron")} ${tempsRestant} (${formatDate(maintenance.fin_estimee)})`
                    : formatDate(maintenance.fin_estimee)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bouton de réessai interactif */}
        <div className="mt-6 flex w-full flex-col items-center gap-3">
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2"
            disabled={verificationEnCours}
            onClick={() => void verifierStatut(true)}
          >
            <RefreshCw
              className={`h-4 w-4 ${verificationEnCours ? "animate-spin" : ""}`}
            />
            <span>
              {verificationEnCours
                ? t("maintenance.verificationEnCours")
                : t("maintenance.verifierDisponibilite")}
            </span>
          </Button>

          <p className="text-[11px] text-muted-foreground">
            {t("maintenance.rafraichissementAuto")}
          </p>
        </div>

        {/* Lien discret vers l'accès administrateur */}
        <div className="mt-10 border-t border-border/40 pt-4">
          <Link
            href="/connexion"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Lock className="h-3 w-3" />
            <span>{t("maintenance.accesAdminLien")}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </main>
    </div>
  );
}

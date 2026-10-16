"use client";

/**
 * Habillage commun aux pages de l'application : menu à gauche, barre en
 * haut, contenu au centre.
 *
 * Le dossier s'appelle « (dashboard) » avec des parenthèses : c'est un
 * groupe de routes Next.js. Il partage ce layout sans ajouter
 * « /dashboard » dans l'adresse des pages.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { TriangleAlert, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useSidebar } from "@/components/layout/contexte-sidebar";
import { SqueletteShellDashboard } from "@/components/ui-commun";
import { useI18n } from "@/lib/i18n";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { utilisateur, chargement } = useAuth();
  const { t } = useI18n();
  const { ouverte } = useSidebar();

  useEffect(() => {
    if (chargement) return;

    if (!utilisateur) {
      const cheminActuel =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "";
      const destination =
        cheminActuel && cheminActuel !== "/" && cheminActuel !== "/dashboard"
          ? `/connexion?retour=${encodeURIComponent(cheminActuel)}`
          : "/connexion";
      if (typeof window !== "undefined") {
        window.location.replace(destination);
      }
      return;
    }

    // L'administrateur n'a rien à faire ici : il n'a accès à aucun stock.
    if (utilisateur.role === "admin") {
      if (typeof window !== "undefined") {
        window.location.replace("/admin");
      }
    }
  }, [chargement, utilisateur]);

  // Empêcher tout défilement parasite au niveau de la fenêtre (html / body) pour éliminer la double barre
  useEffect(() => {
    document.documentElement.classList.add("overflow-hidden");
    document.body.classList.add("overflow-hidden");
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  if (chargement || !utilisateur || utilisateur.role === "admin") {
    return <SqueletteShellDashboard />;
  }

  return (
    <div className="fixed inset-0 top-[var(--hauteur-barre-titre,0px)] flex overflow-hidden">
      {/* 1. Barre latérale gauche : totalement fixe et figée, ne bouge jamais */}
      {ouverte && (
        <aside className="hidden h-full w-60 shrink-0 border-r lg:block animate-in fade-in duration-150 select-none">
          <Sidebar />
        </aside>
      )}

      {/* 2. Zone principale droite : défilement indépendant avec barre de défilement fluide et aérée */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Header />
        <BandeauAbonnement />
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 space-y-6">{children}</main>
      </div>
    </div>
  );
}

/**
 * Prévient quand l'abonnement approche de sa fin ou n'est plus valable.
 *
 * Quand il est bloqué, l'API répond 402 sur toutes les routes métier :
 * ce bandeau explique pourquoi les pages sont vides.
 */
function BandeauAbonnement() {
  const { utilisateur } = useAuth();
  const { formatDateCourte, t } = useI18n();
  const abonnement = utilisateur?.abonnement;

  // La date du jour est relevée après l'affichage, pas pendant : lire
  // l'heure en plein rendu donnerait un résultat différent sur le serveur
  // et dans le navigateur, et React le signale à juste titre.
  const [aujourdhui, setAujourdhui] = useState<number | null>(null);
  const [ferme, setFerme] = useState(false);

  useEffect(() => {
    setAujourdhui(Date.now());
    try {
      if (typeof window !== "undefined") {
        const masque = window.sessionStorage.getItem(
          "telora_bandeau_expiration_masque",
        );
        if (masque === "1") {
          setFerme(true);
        }
      }
    } catch {
      // Ignorer
    }
  }, []);

  function masquerBandeau() {
    setFerme(true);
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("telora_bandeau_expiration_masque", "1");
      }
    } catch {
      // Ignorer
    }
  }

  if (ferme || !abonnement?.statut) return null;

  const bloque = !abonnement.utilisable;

  const joursRestants =
    abonnement.echeance && aujourdhui !== null
      ? Math.ceil(
          (new Date(abonnement.echeance).getTime() - aujourdhui) / 86_400_000,
        )
      : null;

  const bientot =
    !bloque && joursRestants !== null && joursRestants >= 0 && joursRestants <= 7;

  if (!bloque && !bientot) return null;

  return (
    <div
      role="status"
      className={
        bloque
          ? "flex items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-xs sm:gap-2.5 sm:px-4 sm:py-2.5 sm:text-sm text-destructive"
          : "flex items-center gap-2 border-b border-statut-attente/30 bg-statut-attente-fond px-3 py-2 text-xs sm:gap-2.5 sm:px-4 sm:py-2.5 sm:text-sm text-statut-attente"
      }
    >
      <TriangleAlert className="h-4 w-4 shrink-0" />
      <p className="min-w-0 flex-1">
        {bloque ? (
          t("monCompte.abonnementExpire")
        ) : (
          <>
            {abonnement.statut === "essai"
              ? t("auth.votreEssai")
              : t("auth.votreAbonnement")}{" "}
            {t("auth.seTermineLe")}{" "}
            <span className="font-medium">
              {formatDateCourte(abonnement.echeance!)}
            </span>
            {joursRestants === 0
              ? ` (${t("commun.aujourdhui")}).`
              : ` (${t("commun.dans")} ${joursRestants} ${joursRestants! > 1 ? t("commun.jours") : t("commun.jour")}).`}
          </>
        )}
      </p>
      <Link
        href="/mon-compte/abonnement"
        className="shrink-0 font-medium underline underline-offset-4"
      >
        {bloque
          ? t("monCompte.choisirForfait")
          : t("monCompte.gererAbonnement")}
      </Link>
      <button
        type="button"
        onClick={masquerBandeau}
        aria-label={t("commun.fermer")}
        title={t("commun.fermer")}
        className={
          bloque
            ? "ml-1 -mr-1 rounded-md p-1 text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
            : "ml-1 -mr-1 rounded-md p-1 text-statut-attente/70 transition-colors hover:bg-statut-attente/15 hover:text-statut-attente"
        }
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

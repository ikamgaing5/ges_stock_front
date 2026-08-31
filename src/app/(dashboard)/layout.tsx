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
import { useRouter } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useI18n } from "@/lib/i18n";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { utilisateur, chargement } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (chargement) return;

    if (!utilisateur) {
      router.replace("/connexion");
      return;
    }

    // L'administrateur n'a rien à faire ici : il n'a accès à aucun stock.
    if (utilisateur.role === "admin") {
      router.replace("/admin");
    }
  }, [chargement, utilisateur, router]);

  if (chargement || !utilisateur || utilisateur.role === "admin") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="sr-only">{t("commun.chargement")}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh]">
      {/* Sur grand écran la sidebar est fixée : elle ne défile pas avec
          le contenu, et reste visible quelle que soit la longueur d'une
          liste d'appareils. */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r lg:block">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <BandeauAbonnement />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
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
  const { formatDateCourte, t, lang } = useI18n();
  const abonnement = utilisateur?.abonnement;

  // La date du jour est relevée après l'affichage, pas pendant : lire
  // l'heure en plein rendu donnerait un résultat différent sur le serveur
  // et dans le navigateur, et React le signale à juste titre.
  const [aujourdhui, setAujourdhui] = useState<number | null>(null);

  useEffect(() => {
    setAujourdhui(Date.now());
  }, []);

  if (!abonnement?.statut) return null;

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
          ? "flex items-center gap-2.5 border-b border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
          : "flex items-center gap-2.5 border-b border-statut-attente/30 bg-statut-attente-fond px-4 py-2.5 text-sm text-statut-attente"
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
          ? lang === "en"
            ? "Choose a plan"
            : "Choisir un forfait"
          : lang === "en"
            ? "Manage subscription"
            : "Gérer l'abonnement"}
      </Link>
    </div>
  );
}

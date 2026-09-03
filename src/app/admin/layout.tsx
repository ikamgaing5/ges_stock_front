"use client";

/**
 * L'espace de l'administrateur de la plateforme.
 *
 * Volontairement séparé de l'application métier : l'administrateur gère
 * des comptes clients et des abonnements, il n'a accès à aucun stock.
 * Cette séparation dans le code reflète la séparation des droits.
 */

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, CreditCard, LogOut, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const liens = [
  { href: "/admin", cleLibelle: "admin.vueEnsemble", icone: ShieldCheck },
  { href: "/admin/proprietaires", cleLibelle: "admin.clients", icone: Building2 },
  { href: "/admin/paiements", cleLibelle: "admin.paiements", icone: CreditCard },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { utilisateur, chargement, deconnexion } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const chemin = usePathname();

  useEffect(() => {
    if (chargement) return;

    if (!utilisateur) {
      const cheminActuel =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "";
      const destination = cheminActuel
        ? `/connexion?retour=${encodeURIComponent(cheminActuel)}`
        : "/connexion";
      router.replace(destination);
      return;
    }

    if (utilisateur.role !== "admin") {
      router.replace("/");
    }
  }, [chargement, utilisateur, router]);

  if (chargement || utilisateur?.role !== "admin") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="sr-only">{t("commun.chargement")}</span>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 sm:gap-6 px-3 sm:px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="font-heading text-sm font-semibold">
              {t("nav.administration")}
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {liens.map((lien) => {
              const actif =
                lien.href === "/admin"
                  ? chemin === "/admin"
                  : chemin.startsWith(lien.href);

              return (
                <Link
                  key={lien.href}
                  href={lien.href}
                  aria-current={actif ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm transition-colors",
                    actif
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(lien.cleLibelle)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <BasculeLangue />
            <BasculeTheme />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => void deconnexion()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t("nav.deconnexion")}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 sm:p-6">{children}</main>
    </div>
  );
}

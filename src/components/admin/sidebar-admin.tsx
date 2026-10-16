"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconeTelora } from "@/components/ui/logo-telora";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

type LienAdmin = {
  href: string;
  cleLibelle: string;
  icone: LucideIcon;
};

const liensAdmin: LienAdmin[] = [
  { href: "/admin", cleLibelle: "admin.vueEnsemble", icone: LayoutDashboard },
  { href: "/admin/proprietaires", cleLibelle: "admin.clients", icone: Building2 },
  { href: "/admin/paiements", cleLibelle: "admin.paiements", icone: CreditCard },
  { href: "/admin/securite", cleLibelle: "admin.securite", icone: ShieldAlert },
  { href: "/admin/mon-compte", cleLibelle: "nav.monCompte", icone: UserRound },
];

export function SidebarAdmin({
  dansLeTiroir = false,
  onNaviguer,
}: {
  dansLeTiroir?: boolean;
  onNaviguer?: () => void;
}) {
  const { utilisateur, deconnexion } = useAuth();
  const { t } = useI18n();
  const chemin = usePathname();

  const initiale =
    utilisateur?.name?.trim().charAt(0).toUpperCase() || "A";

  return (
    <nav className="flex h-full flex-col bg-sidebar select-none border-r border-sidebar-border">
      {/* En-tête : Logo Telora et mention Administration */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-sidebar-border">
        <Link
          href="/admin"
          onClick={onNaviguer}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <IconeTelora size={32} />
          <div className="min-w-0 flex-1">
            <span className="truncate font-heading text-[16px] font-bold tracking-tight text-foreground block">
              Telora
            </span>
            {/* <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-primary">
              {t("nav.administration")}
            </span> */}
          </div>
        </Link>

        {dansLeTiroir && (
          <Button variant="ghost" size="icon-sm" onClick={onNaviguer}>
            <X className="h-4 w-4" />
            <span className="sr-only">{t("nav.fermerMenu")}</span>
          </Button>
        )}
      </div>

      {/* Liens de navigation admin */}
      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {liensAdmin.map((lien) => {
          const actif =
            lien.href === "/admin"
              ? chemin === "/admin"
              : chemin.startsWith(lien.href);
          const Icone = lien.icone;

          return (
            <Link
              key={lien.href}
              href={lien.href}
              onClick={onNaviguer}
              aria-current={actif ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                dansLeTiroir ? "py-2.5" : "py-2.5",
                actif
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{t(lien.cleLibelle)}</span>
            </Link>
          );
        })}
      </div>

      {/* Profil de l'administrateur et déconnexion */}
      {utilisateur && (
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <div className="flex items-center gap-2.5 rounded-lg p-2 bg-sidebar-accent/30">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/25">
              {initiale}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold leading-tight text-foreground">
                {utilisateur.name}
              </p>
              <p className="truncate text-[11px] text-muted-foreground leading-normal">
                {utilisateur.email}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => void deconnexion()}
            className="w-full justify-start text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-2 h-3.5 w-3.5 shrink-0" />
            <span>{t("nav.deconnexion")}</span>
          </Button>
        </div>
      )}
    </nav>
  );
}

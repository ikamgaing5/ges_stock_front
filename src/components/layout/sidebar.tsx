"use client";

/**
 * Le menu de navigation.
 *
 * Le même composant sert dans les deux cas : fixé à gauche sur grand
 * écran, et glissé dans le tiroir sur téléphone. La prop `onNaviguer`
 * n'est fournie que dans le tiroir, ce qui permet de le refermer après
 * un clic et d'afficher un bouton de fermeture.
 *
 * Pour ajouter une entrée : ajoute un objet dans `liens` ci-dessous et
 * crée la page correspondante dans src/app/(dashboard)/.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BookOpen,
  LayoutDashboard,
  ScanLine,
  Smartphone,
  Store,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconeTelora } from "@/components/ui/logo-telora";
import { useAuth } from "@/components/auth-provider";
import { permissions } from "@/lib/permissions";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";

type LienDef = {
  href: string;
  cleLibelle: string;
  icone: LucideIcon;
  /** Absent = visible par tout le monde. */
  visiblePour?: (role: Role) => boolean;
};

const liens: LienDef[] = [
  { href: "/", cleLibelle: "nav.tableauDeBord", icone: LayoutDashboard },
  {
    href: "/scanner",
    cleLibelle: "nav.scanner",
    icone: ScanLine,
    visiblePour: permissions.bougerStock,
  },
  { href: "/telephones", cleLibelle: "nav.parc", icone: Smartphone },
  { href: "/modeles", cleLibelle: "nav.catalogue", icone: BookOpen },
  { href: "/mouvements", cleLibelle: "nav.historique", icone: ArrowLeftRight },
  {
    href: "/equipe",
    cleLibelle: "nav.equipe",
    icone: Users,
    visiblePour: permissions.voirEquipe,
  },
  {
    href: "/boutiques",
    cleLibelle: "nav.boutiques",
    icone: Store,
    visiblePour: permissions.gererBoutiques,
  },
];

export function Sidebar({ onNaviguer }: { onNaviguer?: () => void }) {
  const chemin = usePathname();
  const { utilisateur, boutiques } = useAuth();
  const { t, libelleRole } = useI18n();

  if (!utilisateur) return null;

  const dansLeTiroir = Boolean(onNaviguer);

  const visibles = liens.filter(
    (lien) => !lien.visiblePour || lien.visiblePour(utilisateur.role),
  );

  return (
    <nav className="flex h-full flex-col bg-sidebar">
      {/* En-tête : logo, et bouton de fermeture dans le tiroir */}
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <Link
          href="/"
          onClick={onNaviguer}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          <IconeTelora size={32} />
          <span className="truncate font-heading text-[16px] font-bold tracking-tight text-foreground">
            TELORA
          </span>
        </Link>

        {dansLeTiroir && (
          <Button variant="ghost" size="icon-sm" onClick={onNaviguer}>
            <X className="h-4 w-4" />
            <span className="sr-only">{t("nav.fermerMenu")}</span>
          </Button>
        )}
      </div>

      {/* Les liens. `overflow-y-auto` évite qu'un menu plus long qu'un
          petit écran devienne inaccessible. */}
      <div className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
        {visibles.map((lien) => {
          // Le lien « / » ne doit être actif que sur l'accueil exact.
          const actif =
            lien.href === "/" ? chemin === "/" : chemin.startsWith(lien.href);
          const Icone = lien.icone;

          return (
            <Link
              key={lien.href}
              href={lien.href}
              onClick={onNaviguer}
              aria-current={actif ? "page" : undefined}
              className={cn(
                // Une cible tactile confortable dans le tiroir : sur
                // téléphone, on vise avec le pouce.
                "flex items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                dansLeTiroir ? "py-2.5" : "py-2",
                actif
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icone className="h-4 w-4 shrink-0" />
              {t(lien.cleLibelle)}
            </Link>
          );
        })}
      </div>

      {/* Pied : qui est connecté. Utile dans le tiroir, où la barre du
          haut est masquée par le voile. */}
      <div className="border-t px-4 py-3">
        <p className="truncate text-sm font-medium">{utilisateur.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {libelleRole(utilisateur.role)}
          {boutiques.length > 1 &&
            ` · ${boutiques.length} ${t("boutiques.titre").toLowerCase()}`}
        </p>
      </div>
    </nav>
  );
}

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

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowUpCircle,
  BookOpen,
  Check,
  ChevronsUpDown,
  ExternalLink,
  Globe,
  HelpCircle,
  Info,
  Keyboard,
  Laptop,
  LayoutDashboard,
  LogOut,
  MonitorSmartphone,
  Receipt,
  ScanLine,
  Settings,
  Store,
  UserCheck,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Role } from "@/types";

type LienDef = {
  href: string;
  cleLibelle: string;
  icone: LucideIcon;
  /** Absent = visible par tout le monde. */
  visiblePour?: (role: Role) => boolean;
};

const liens: LienDef[] = [
  { href: "/dashboard", cleLibelle: "nav.tableauDeBord", icone: LayoutDashboard },
  {
    href: "/scanner",
    cleLibelle: "nav.scanner",
    icone: ScanLine,
    visiblePour: permissions.bougerStock,
  },
  { href: "/telephones", cleLibelle: "nav.parc", icone: MonitorSmartphone },
  { href: "/factures", cleLibelle: "nav.factures", icone: Receipt },
  { href: "/clients", cleLibelle: "nav.clients", icone: UserCheck },
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
  const router = useRouter();
  const chemin = usePathname();
  const { utilisateur, boutiques, deconnexion } = useAuth();
  const { t, lang, setLang, libelleRole } = useI18n();
  const [modalRaccourcisOuverte, setModalRaccourcisOuverte] = useState(false);

  const ouvrirLienEnSavoirPlus = (route: string) => {
    onNaviguer?.();
    if (typeof window !== "undefined" && window.teloraDesktop?.ouvrirLienLegal) {
      window.teloraDesktop.ouvrirLienLegal(route);
    } else {
      router.push(route);
    }
  };

  if (!utilisateur) return null;

  const dansLeTiroir = Boolean(onNaviguer);

  const visibles = liens.filter(
    (lien) => !lien.visiblePour || lien.visiblePour(utilisateur.role),
  );

  const initiale = (utilisateur.name || "U").trim().charAt(0).toUpperCase();

  return (
    <>
      <nav className="flex h-full flex-col bg-sidebar select-none">
        {/* En-tête : logo, et bouton de fermeture dans le tiroir */}
        <div className="flex items-center gap-2.5 px-4 py-3.5">
          <Link
            href="/dashboard"
            onClick={onNaviguer}
            className="flex min-w-0 flex-1 items-center gap-2.5"
          >
            <IconeTelora size={32} />
            <span className="truncate font-heading text-[16px] font-bold tracking-tight text-foreground">
              Telora
            </span>
          </Link>

          {dansLeTiroir && (
            <Button variant="ghost" size="icon-sm" onClick={onNaviguer}>
              <X className="h-4 w-4" />
              <span className="sr-only">{t("nav.fermerMenu")}</span>
            </Button>
          )}
        </div>

        {/* Les liens de navigation */}
        <div className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
          {visibles.map((lien) => {
            const actif =
              lien.href === "/dashboard"
                ? chemin === "/dashboard"
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

        {/* Pied : Menu Profil & Paramètres interactif (calqué sur la capture de référence) */}
        <div className="border-t border-sidebar-border p-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left hover:bg-sidebar-accent transition-colors cursor-pointer group outline-none"
                />
              }
            >
              {/* Avatar avec initiale */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/25">
                {initiale}
              </div>

              {/* Identité */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold leading-tight text-foreground group-hover:text-sidebar-accent-foreground">
                  {utilisateur.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground leading-normal">
                  {utilisateur.email || libelleRole(utilisateur.role)}
                </p>
              </div>

              {/* Chevron discret */}
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="top"
              align="start"
              sideOffset={8}
              className="w-72 text-xs"
            >
              {/* En-tête : Email / Identité */}
              <div className="px-2 py-1.5 border-b border-border/40">
                <p className="truncate text-xs font-semibold text-foreground">
                  {utilisateur.email || utilisateur.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {libelleRole(utilisateur.role)}
                  {boutiques.length > 1 &&
                    ` · ${boutiques.length} ${t("boutiques.titre").toLowerCase()}`}
                </p>
              </div>

              {/* Groupe 1 : Paramètres & Préférences */}
              <div className="py-1">
                <DropdownMenuItem
                  onClick={() => {
                    onNaviguer?.();
                    router.push("/mon-compte");
                  }}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <span>{t("nav.parametres")}</span>
                  <DropdownMenuShortcut>Ctrl+Shift+,</DropdownMenuShortcut>
                </DropdownMenuItem>

                {/* Sous-menu Langue */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <Globe className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <span>{t("nav.langue")}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-40 text-xs">
                    <DropdownMenuItem
                      onClick={() => setLang("fr")}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span>🇫🇷</span>
                        <span>Français</span>
                      </span>
                      {lang === "fr" && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setLang("en")}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span>🇬🇧</span>
                        <span>English</span>
                      </span>
                      {lang === "en" && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem
                  onClick={() => ouvrirLienEnSavoirPlus("/faq")}
                  className="cursor-pointer"
                >
                  <HelpCircle className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <span>{t("nav.obtenirAide")}</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator />

              {/* Groupe 2 : Forfait & Applications */}
              <div className="py-1">
                <DropdownMenuItem
                  onClick={() => {
                    onNaviguer?.();
                    router.push("/mon-compte/abonnement");
                  }}
                  className="cursor-pointer text-primary font-medium"
                >
                  <ArrowUpCircle className="mr-2 h-3.5 w-3.5 text-primary" />
                  <span>{t("nav.mettreForfaitNiveau")}</span>
                </DropdownMenuItem>

                {/* Sous-menu En savoir plus */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <Info className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <span>{t("nav.enSavoirPlus")}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-60 text-xs">
                    <DropdownMenuItem
                      onClick={() => ouvrirLienEnSavoirPlus("/legal/mentions-legales")}
                      className="cursor-pointer"
                    >
                      <span>{t("nav.aProposTelora")}</span>
                      <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground/60" />
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => ouvrirLienEnSavoirPlus("/faq")}
                      className="cursor-pointer"
                    >
                      <span>{t("nav.guideEtDocumentation")}</span>
                      <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground/60" />
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => ouvrirLienEnSavoirPlus("/legal/cgu")}
                      className="cursor-pointer"
                    >
                      <span>{t("nav.cgu")}</span>
                      <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground/60" />
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => ouvrirLienEnSavoirPlus("/legal/confidentialite")}
                      className="cursor-pointer"
                    >
                      <span>{t("nav.politiqueConfidentialite")}</span>
                      <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground/60" />
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => ouvrirLienEnSavoirPlus("/legal/securite")}
                      className="cursor-pointer"
                    >
                      <span>{t("nav.choixConfidentialite")}</span>
                      <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground/60" />
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => setModalRaccourcisOuverte(true)}
                      className="cursor-pointer"
                    >
                      <Keyboard className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      <span>{t("nav.raccourcisClavier")}</span>
                      <DropdownMenuShortcut>Ctrl+/</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </div>

              <DropdownMenuSeparator />

              {/* Groupe 3 : Déconnexion */}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => void deconnexion()}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                <span>{t("nav.deconnexion")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Modal Raccourcis Clavier */}
      <Dialog
        open={modalRaccourcisOuverte}
        onOpenChange={setModalRaccourcisOuverte}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-primary" />
              <span>{t("nav.modalRaccourcisTitre")}</span>
            </DialogTitle>
            <DialogDescription>
              {t("nav.modalRaccourcisDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 py-3 text-xs">
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">
                {t("nav.raccourciF1")}
              </span>
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-xs">
                F1
              </kbd>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">
                {t("nav.raccourciF11")}
              </span>
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-xs">
                F11
              </kbd>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">
                {t("nav.raccourciCompte")}
              </span>
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-xs">
                Ctrl + Shift + ,
              </kbd>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">
                {t("nav.raccourciRecharger")}
              </span>
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-xs">
                Ctrl + R
              </kbd>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalRaccourcisOuverte(false)}
            >
              {t("commun.fermer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

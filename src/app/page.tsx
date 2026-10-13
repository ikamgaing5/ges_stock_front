"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Flame,
  Globe,
  HardDrive,
  HelpCircle,
  Laptop,
  Layers,
  Lock,
  Maximize2,
  Monitor,
  PackageCheck,
  Printer,
  Receipt,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Terminal,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { IconeTelora } from "@/components/ui/logo-telora";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Plateforme = "windows" | "mac" | "linux";

interface VersionTelechargement {
  nom: string;
  type: string;
  taille: string;
  description: string;
  lien: string;
  recommande?: boolean;
}

const TELECHARGEMENTS: Record<
  Plateforme,
  {
    nom: string;
    icone: typeof Monitor;
    badge: string;
    description: string;
    versions: VersionTelechargement[];
  }
> = {
  windows: {
    nom: "Windows",
    icone: Monitor,
    badge: "Recommandé pour caisse POS",
    description:
      "Compatible avec Windows 10, Windows 11 et systèmes de caisse Windows POSReady.",
    versions: [
      {
        nom: "Telora Setup (Installateur 64-bit)",
        type: ".exe",
        taille: "84 Mo",
        description: "Installateur complet avec raccourci Bureau et Menu Démarrer",
        lien: "/telechargements/Telora-Setup-1.0.0.exe",
        recommande: true,
      },
      {
        nom: "Telora Portable (Sans installation)",
        type: ".exe",
        taille: "88 Mo",
        description: "Exécution directe sur clé USB ou sans droits d'administrateur",
        lien: "/telechargements/Telora-Portable-1.0.0.exe",
      },
    ],
  },
  mac: {
    nom: "macOS",
    icone: Laptop,
    badge: "Apple Silicon & Intel",
    description:
      "Compatible avec macOS 12 Monterey, macOS 13 Ventura, Sonoma et Sequoia.",
    versions: [
      {
        nom: "Telora pour Apple Silicon (M1 / M2 / M3 / M4)",
        type: ".dmg",
        taille: "89 Mo",
        description: "Optimisé nativement pour puces Apple Silicon ARM64",
        lien: "/telechargements/Telora-1.0.0-arm64.dmg",
        recommande: true,
      },
      {
        nom: "Telora pour processeurs Intel",
        type: ".dmg",
        taille: "92 Mo",
        description: "Pour Mac équipés d'un processeur Intel x64",
        lien: "/telechargements/Telora-1.0.0-x64.dmg",
      },
    ],
  },
  linux: {
    nom: "Linux",
    icone: Terminal,
    badge: "Ubuntu, Debian & Arch",
    description: "Compatible avec les principales distributions Linux 64-bit.",
    versions: [
      {
        nom: "Telora AppImage (Universel)",
        type: ".AppImage",
        taille: "95 Mo",
        description: "Fichier exécutable direct sur toutes distributions",
        lien: "/telechargements/Telora-1.0.0.AppImage",
        recommande: true,
      },
      {
        nom: "Paquet Debian / Ubuntu",
        type: ".deb",
        taille: "78 Mo",
        description: "Installation via apt pour Debian, Ubuntu, Mint",
        lien: "/telechargements/telora_1.0.0_amd64.deb",
      },
    ],
  },
};

const FAQS = [
  {
    q: "Est-ce que je dois payer pour tester Telora ?",
    r: "Non, absolument pas. Dès votre inscription, vous disposez de 30 jours d'essai gratuit complets. Aucune carte bancaire n'est requise et toutes les fonctionnalités sont débloquées dès le premier jour.",
  },
  {
    q: "Quelle est la différence entre la version Web et la version Desktop (PC) ?",
    r: "La version Web fonctionne directement dans votre navigateur (sur PC, Mac, tablette ou smartphone) pour consulter votre stock et piloter vos boutiques à distance. La version Desktop est une application native installée sur votre ordinateur de comptoir en boutique : elle permet notamment l'impression directe et silencieuse des tickets de caisse sur imprimante thermique et dispose d'un mode plein écran sécurisé.",
  },
  {
    q: "Pourquoi tracer les appareils par leur IMEI plutôt que par simple quantité ?",
    r: "Dans une boutique de téléphonie, un simple compteur de quantité (ex: 4 téléphones en stock) ne protège pas contre les vols internes, les disparitions inexpliquées ou les faux retours. Avec Telora, chaque appareil possède son IMEI unique. Vous savez exactement quel vendeur l'a réceptionné, dans quelle vitrine il se trouve, et sur quelle facture client il a été vendu.",
  },
  {
    q: "Mon imprimante thermique de caisse et ma douchette sont-elles compatibles ?",
    r: "Oui. L'application Desktop prend en charge toutes les imprimantes thermiques standards (format 80mm et 58mm, connectées en USB, réseau ou Bluetooth) avec impression sans boîte de dialogue. Pour le scan des IMEI, toutes les douchettes code-barres USB/Bluetooth et caméras sont reconnues nativement.",
  },
  {
    q: "Puis-je gérer plusieurs boutiques avec un seul compte ?",
    r: "Tout à fait. Telora est nativement multi-boutiques. Le propriétaire a une vue d'ensemble sur l'ensemble de ses points de vente et peut effectuer des transferts de stock entre boutiques en quelques clics. Les employés (vendeuses) ne voient quant à eux que les boutiques auxquelles ils sont rattachés.",
  },
  {
    q: "Que se passe-t-il à la fin des 30 jours d'essai gratuit ?",
    r: "À l'échéance des 30 jours, vous pouvez choisir de souscrire à un abonnement mensuel pour continuer à utiliser le service. Vos données, vos historiques d'IMEI et vos factures restent précieusement conservés sans aucun risque de perte.",
  },
];

export default function LandingPage() {
  const [osDetecte, setOsDetecte] = useState<Plateforme>("windows");
  const [plateformeActive, setPlateformeActive] = useState<Plateforme>("windows");
  const [modalTelechargement, setModalTelechargement] = useState<{
    ouverte: boolean;
    version?: VersionTelechargement;
    plateforme?: Plateforme;
  }>({ ouverte: false });
  const [faqOuverte, setFaqOuverte] = useState<number | null>(null);
  const [modalImageZoom, setModalImageZoom] = useState<string | null>(null);
  const [darkImgIntrouvable, setDarkImgIntrouvable] = useState(false);

  const { lang } = useI18n();
  const { resolvedTheme } = useTheme();

  // Détection de la capture selon la langue (FR/EN) et le thème (clair/sombre)
  // Prévoyez /capture-ecran-dark.png et /screenshot-dark.png pour le mode sombre !
  const estSombre = resolvedTheme === "dark";
  const srcCapture = React.useMemo(() => {
    if (lang === "en") {
      return estSombre && !darkImgIntrouvable
        ? "/screenshot-dark.png"
        : "/screenshot.png";
    }
    return estSombre && !darkImgIntrouvable
      ? "/capture-ecran-dark.png"
      : "/capture-ecran.png";
  }, [lang, estSombre, darkImgIntrouvable]);

  // Détection automatique de l'OS du visiteur
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes("mac")) {
        setOsDetecte("mac");
        setPlateformeActive("mac");
      } else if (ua.includes("linux") && !ua.includes("android")) {
        setOsDetecte("linux");
        setPlateformeActive("linux");
      } else {
        setOsDetecte("windows");
        setPlateformeActive("windows");
      }
    }
  }, []);

  function declencherTelechargement(v: VersionTelechargement, p: Plateforme) {
    setModalTelechargement({
      ouverte: true,
      version: v,
      plateforme: p,
    });
    toast.success(`Préparation du téléchargement de ${v.nom}`, {
      description: "Le téléchargement va démarrer dans quelques secondes.",
    });
  }

  const versionHero =
    TELECHARGEMENTS[osDetecte].versions.find((v) => v.recommande) ||
    TELECHARGEMENTS[osDetecte].versions[0];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* ─────────────────────────────────────────────────────────────
          1. BARRE DE NAVIGATION (HEADER)
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo et Nom */}
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            id="nav-logo"
          >
            <IconeTelora size={34} />
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                Telora
              </span>
              {/* <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Stock & Caisse
              </span> */}
            </div>
          </Link>

          {/* Liens de navigation centrale (Desktop) */}
          <nav className="hidden items-center gap-7 md:flex text-sm font-medium text-muted-foreground">
            <a
              href="#avantages"
              className="transition-colors hover:text-foreground"
            >
              Avantages
            </a>
            <a href="#imei" className="transition-colors hover:text-foreground">
              Traçabilité IMEI
            </a>
            <a
              href="#solutions"
              className="transition-colors hover:text-foreground"
            >
              Web vs Caisse
            </a>
            <a
              href="#telechargements"
              className="flex items-center gap-1.5 text-foreground transition-colors hover:text-primary"
            >
              <Download className="size-3.5 text-primary" />
              Télécharger
            </a>
            <a href="#tarifs" className="transition-colors hover:text-foreground">
              Tarifs
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>

          {/* Outils & Boutons d'action */}
          <div className="flex items-center gap-2 sm:gap-3">
            <BasculeLangue taille="icon" />
            <BasculeTheme />

            <Link
              href="/connexion"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex",
              )}
              id="btn-nav-connexion"
            >
              Se connecter
            </Link>

            <Link
              href="/inscription"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "gap-1.5 shadow-sm shadow-primary/20",
              )}
              id="btn-nav-essai-gratuit"
            >
              <span>Essai gratuit 30j</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ─────────────────────────────────────────────────────────────
            2. HERO SECTION
        ───────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
          {/* Effets lumineux subtils en arrière-plan */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#00D2FF]/25 to-[#0066FF]/25 opacity-40 sm:left-[calc(50%-25rem)] sm:w-[72.1875rem]"
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge de lancement */}
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur-sm">
              <Sparkles className="size-3.5 animate-pulse text-primary" />
              <span>Version Caisse Desktop & Web Cloud disponibles</span>
            </div> */}

            {/* Titre principal H1 */}
            <h1 className="mt-6 text-balance font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              La gestion de stock & caisse pensée pour les{" "}
              <span className="bg-gradient-to-r from-sky-400 via-primary to-indigo-600 bg-clip-text text-transparent">
                boutiques de téléphones
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="mx-auto mt-6 max-w-3xl text-balance text-base text-muted-foreground sm:text-lg md:text-xl">
              Chaque appareil est suivi{" "}
              <strong className="font-semibold text-foreground">
                individuellement par son IMEI
              </strong>
              , de son arrivage à sa vente. Fini les pertes inexpliquées :
              réconciliation en direct, scan ultra-rapide et impression
              thermique silencieuse de tickets de caisse.
            </p>

            {/* Double Call-to-Action */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
              {/* CTA Principal : Inscription Web (Essai gratuit) */}
              <Link
                href="/inscription"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto h-12 px-6 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all",
                )}
                id="btn-hero-essai-web"
              >
                <span>Démarrer l'essai gratuit 30 jours</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>

              {/* CTA Secondaire : Téléchargement Desktop */}
              <a
                href="#telechargements"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto h-12 px-5 text-base border-border/80 bg-background/50 hover:bg-muted/80 backdrop-blur-sm transition-all",
                )}
                id="btn-hero-telecharger"
              >
                <Download className="mr-2 size-4 text-primary" />
                <span>Télécharger pour {TELECHARGEMENTS[osDetecte].nom}</span>
              </a>
            </div>

            {/* Éléments de réassurance */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-500" />
                Sans carte bancaire requise
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Essai 30 jours 100% fonctionnel
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="size-4 text-amber-500" />
                Mise en service en 2 minutes
              </span>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                APERÇU INTERFACE IMMERSIF (CAPTURE D'ÉCRAN RÉELLE)
            ───────────────────────────────────────────────────────────── */}
            <div className="relative mx-auto mt-12 max-w-5xl rounded-2xl border border-border/70 bg-card/60 p-2 sm:p-4 shadow-2xl shadow-primary/10 backdrop-blur-xl">
              {/* Barre de fenêtre factice (Style macOS / Frameless) */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-500/80" />
                  <div className="size-3 rounded-full bg-amber-500/80" />
                  <div className="size-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 hidden sm:inline text-xs font-mono text-muted-foreground">
                    Telora 
                  </span>
                </div>
                
              </div>

              {/* Vraie capture d'écran avec zoom interactif */}
              <div
                className="group relative mt-3 aspect-[16/9] sm:aspect-[1918/885] w-full overflow-hidden rounded-xl border border-border/60 bg-muted/20 "
              >
                <Image
                  key={srcCapture}
                  src={srcCapture}
                  alt={
                    lang === "en"
                      ? "Telora Live Application Dashboard"
                      : "Aperçu réel du tableau de bord Telora"
                  }
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover object-top "
                  priority
                  onError={() => {
                    if (estSombre) {
                      setDarkImgIntrouvable(true);
                    }
                  }}
                />               
              </div>

              {/* Badges d'atouts sous la capture */}
              {/* <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Printer className="size-3.5 text-primary" />
                  {lang === "en"
                    ? "Direct thermal printing without pop-up (ESC/POS)"
                    : "Impression thermique directe sans pop-up (ESC/POS)"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="size-3.5 text-emerald-500" />
                  {lang === "en"
                    ? "Every stock move audited and signed by user"
                    : "Chaque mouvement tracé et signé par l'employé"}
                </span>
              </div> */}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. SECTION "LE SUIVI IMEI : POURQUOI C'EST CRUCIAL"
        ───────────────────────────────────────────────────────────── */}
        <section id="imei" className="border-t border-border/40 py-20 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Pourquoi un simple tableau Excel ou logiciel classique ne suffit pas
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Un téléphone n'est pas un article qu'on compte par carton. C'est un
                objet de valeur unique identifié par son numéro IMEI.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-2">
              {/* Le problème classique */}
              <div className="rounded-2xl border border-destructive/20 bg-card p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 text-destructive font-semibold text-base mb-4">
                  <ShieldAlert className="size-5 shrink-0" />
                  <span>Gestion par quantité ordinaire (Le piège)</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Le logiciel affiche simplement : <code>Galaxy S24 : Quantité = 3</code>.
                </p>
                <ul className="space-y-3.5 text-sm">
                  <li className="flex items-start gap-2.5 text-muted-foreground">
                    <X className="size-4 shrink-0 text-destructive mt-0.5" />
                    <span>
                      <strong>Vols invisibles :</strong> Si un appareil disparaît,
                      impossible de savoir quand ni qui tenait la boutique.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-muted-foreground">
                    <X className="size-4 shrink-0 text-destructive mt-0.5" />
                    <span>
                      <strong>Litiges de garantie :</strong> Un client revient avec un
                      téléphone en panne : comment prouver qu'il a été acheté chez vous ?
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-muted-foreground">
                    <X className="size-4 shrink-0 text-destructive mt-0.5" />
                    <span>
                      <strong>Mélange de stock :</strong> Aucune traçabilité sur les
                      téléphones réservés, réparés ou retournés.
                    </span>
                  </li>
                </ul>
              </div>

              {/* La solution Telora */}
              <div className="rounded-2xl border border-primary/30 bg-card p-6 sm:p-8 shadow-md ring-1 ring-primary/20">
                <div className="flex items-center gap-3 text-primary font-semibold text-base mb-4">
                  <CheckCircle2 className="size-5 shrink-0 text-primary" />
                  <span>La méthode Telora : Un appareil = Une ligne</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Chaque appareil a sa fiche propre avec son numéro IMEI gravé.
                </p>
                <ul className="space-y-3.5 text-sm">
                  <li className="flex items-start gap-2.5 text-foreground">
                    <Check className="size-4 shrink-0 text-primary mt-0.5" />
                    <span>
                      <strong>Zéro zone d'ombre :</strong> Chaque arrivage, vente,
                      SAV ou transfert est horodaté avec le nom exact de la vendeuse.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-foreground">
                    <Check className="size-4 shrink-0 text-primary mt-0.5" />
                    <span>
                      <strong>Factures certifiées :</strong> L'IMEI est imprimé sur
                      le ticket de caisse et la facture pour une garantie client
                      incontestable.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-foreground">
                    <Check className="size-4 shrink-0 text-primary mt-0.5" />
                    <span>
                      <strong>Scan instantané :</strong> Bip de la douchette à
                      l'encaissement = l'appareil précis sort immédiatement du stock.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. SECTION "DEUX FAÇONS D'UTILISER TELORA" (WEB vs DESKTOP)
        ───────────────────────────────────────────────────────────── */}
        <section id="solutions" className="py-20 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Flexibilité Totale
              </span>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Deux modes complémentaires selon vos besoins
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Profitez du meilleur des deux mondes : la liberté du Cloud pour le
                propriétaire et la puissance matérielle de l'application PC pour le
                comptoir.
              </p>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-2">
              {/* Carte Solution 1 : Web Cloud */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-gradient-to-b from-card to-background p-6 sm:p-8 hover:border-primary/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                        <Globe className="size-6" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        Telora Cloud (Web)
                      </h3>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      Navigateur · Zéro installation
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Idéal pour les gérants et propriétaires qui souhaitent surveiller
                    leurs boutiques à distance, depuis chez eux ou en voyage.
                  </p>

                  <ul className="space-y-3 text-sm mb-8">
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-emerald-500 shrink-0" />
                      <span>Accessible sur smartphone, tablette, PC et Mac</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-emerald-500 shrink-0" />
                      <span>Chiffre d'affaires et marges en temps réel</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-emerald-500 shrink-0" />
                      <span>Gestion des équipes et des permissions</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-emerald-500 shrink-0" />
                      <span>Mises à jour automatiques transparentes</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/inscription"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center")}
                >
                  <span>Tester directement sur le Web</span>
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </div>

              {/* Carte Solution 2 : Caisse Desktop */}
              <div className="flex flex-col justify-between rounded-2xl border border-primary/40 bg-gradient-to-b from-card to-background p-6 sm:p-8 shadow-md hover:border-primary transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                  Spécial Boutique Physique
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                        <Monitor className="size-6" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        Telora Caisse (Desktop)
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    L'application native installée sur votre ordinateur de vente.
                    Ultra-rapide, elle intègre directement le matériel de caisse.
                  </p>

                  <ul className="space-y-3 text-sm mb-8">
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-primary shrink-0" />
                      <span>
                        <strong>Impression directe sans pop-up :</strong> Vos reçus
                        sortent directement sur imprimante thermique.
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-primary shrink-0" />
                      <span>
                        <strong>Mode plein écran caisse :</strong> Bloque les
                        distractions sur le poste des vendeuses.
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-primary shrink-0" />
                      <span>
                        <strong>Tolérance aux micro-coupures :</strong> Reconnexion
                        automatique sans perte d'état.
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-primary shrink-0" />
                      <span>Raccourcis clavier de caisse (F2 scan, F4 encaissement)</span>
                    </li>
                  </ul>
                </div>

                <a
                  href="#telechargements"
                  className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full justify-center shadow-md shadow-primary/20")}
                >
                  <Download className="mr-2 size-4" />
                  <span>Télécharger l'application PC</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. SECTION TÉLÉCHARGEMENT MULTI-PLATEFORMES (WINDOWS / MAC / LINUX)
        ───────────────────────────────────────────────────────────── */}
        <section id="telechargements" className="border-t border-border/40 py-20 bg-muted/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground mb-3">
                <HardDrive className="size-3.5 text-primary" />
                <span>Disponible sur tous vos systèmes d'exploitation</span>
              </div>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Télécharger Telora pour votre poste de caisse
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Choisissez votre système d'exploitation ci-dessous. Le logiciel
                s'installe en quelques secondes sans configuration complexe.
              </p>
            </div>

            {/* Onglets de sélection du système */}
            <div className="mt-10 flex justify-center">
              <div className="inline-flex rounded-xl border border-border/70 bg-card p-1 shadow-sm">
                {(Object.keys(TELECHARGEMENTS) as Plateforme[]).map((cle) => {
                  const info = TELECHARGEMENTS[cle];
                  const Icone = info.icone;
                  const estActif = plateformeActive === cle;

                  return (
                    <button
                      key={cle}
                      onClick={() => setPlateformeActive(cle)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                        estActif
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                      id={`tab-os-${cle}`}
                    >
                      <Icone className="size-4" />
                      <span>{info.nom}</span>
                      {osDetecte === cle && (
                        <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wide opacity-80">
                          (Détecté)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Carte de téléchargement pour l'OS sélectionné */}
            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-heading text-2xl font-bold text-foreground">
                      Telora pour {TELECHARGEMENTS[plateformeActive].nom}
                    </h3>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {TELECHARGEMENTS[plateformeActive].badge}
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    {TELECHARGEMENTS[plateformeActive].description}
                  </p>
                </div>
              </div>

              {/* Liste des versions téléchargeables */}
              <div className="mt-6 space-y-3">
                {TELECHARGEMENTS[plateformeActive].versions.map((ver, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/50 p-4 transition-colors hover:border-primary/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm sm:text-base text-foreground">
                          {ver.nom}
                        </span>
                        {ver.recommande && (
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                            Recommandé
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ver.description} ·{" "}
                        <span className="font-mono">{ver.taille}</span>
                      </p>
                    </div>

                    <Button
                      onClick={() => declencherTelechargement(ver, plateformeActive)}
                      size="sm"
                      className="shrink-0 gap-1.5"
                      id={`btn-dl-${plateformeActive}-${idx}`}
                    >
                      <Download className="size-4" />
                      <span>Télécharger {ver.type}</span>
                    </Button>
                  </div>
                ))}
              </div>

              {/* Guide d'installation rapide */}
              <div className="mt-8 rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">
                  💡 Comment démarrer après le téléchargement ?
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Lancez le fichier d'installation téléchargé sur votre ordinateur.</li>
                  <li>
                    Connectez-vous avec vos identifiants ou créez un compte (30 jours
                    d'essai gratuit).
                  </li>
                  <li>
                    Votre imprimante à ticket thermique et votre douchette sont reconnues
                    automatiquement dès la première utilisation.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. SECTION "FONCTIONNALITÉS COMPLÈTES"
        ───────────────────────────────────────────────────────────── */}
        <section id="avantages" className="py-20 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Conçu pour la téléphonie
              </span>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Tout ce dont votre boutique a besoin pour tourner sereinement
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Chaque détail a été pensé pour le quotidien des commerçants et de
                leurs vendeuses sur le terrain.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Carte 1 */}
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/40 transition-all">
                {/* <div className="rounded-xl bg-primary/10 p-3 text-primary w-fit mb-4">
                  <ScanLine className="size-5" />
                </div> */}
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Scan d'IMEI ultra-rapide
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Gagnez des heures lors des arrivages. Scannez chaque boîte avec
                  votre douchette code-barres USB ou la caméra d'un smartphone.
                  L'IMEI est vérifié et enregistré instantanément.
                </p>
              </div>

              {/* Carte 2 */}
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/40 transition-all">
                {/* <div className="rounded-xl bg-primary/10 p-3 text-primary w-fit mb-4">
                  <Store className="size-5" />
                </div> */}
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Gestion Multi-Boutiques
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Transférez un téléphone de la boutique A vers la boutique B d'un
                  simple clic. Chaque point de vente a son stock propre tout en
                  offrant une vue consolidée au propriétaire.
                </p>
              </div>

              {/* Carte 3 */}
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/40 transition-all">
                {/* <div className="rounded-xl bg-primary/10 p-3 text-primary w-fit mb-4">
                  <Receipt className="size-5" />
                </div> */}
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Factures & Reçus Thermiques
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Imprimez des tickets de caisse élégants avec l'IMEI du téléphone,
                  les conditions de garantie et les coordonnées de la boutique pour
                  rassurer vos clients.
                </p>
              </div>

              {/* Carte 4 */}
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/40 transition-all">
                {/* <div className="rounded-xl bg-primary/10 p-3 text-primary w-fit mb-4">
                  <Users className="size-5" />
                </div> */}
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Rôles d'équipe sécurisés
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Propriétaire, Vendeuse, Secrétaire. Les employés ne voient que
                  leurs boutiques et ne peuvent jamais supprimer arbitrairement un
                  téléphone sans trace.
                </p>
              </div>

              {/* Carte 5 */}
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/40 transition-all">
                {/* <div className="rounded-xl bg-primary/10 p-3 text-primary w-fit mb-4">
                  <ShieldCheck className="size-5" />
                </div> */}
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Double Authentification (2FA)
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sécurisez vos accès sensibles par code TOTP (Google
                  Authenticator / Authy). Fonctionne sans réseau et sans coût de
                  SMS supplémentaires.
                </p>
              </div>

              {/* Carte 6 */}
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/40 transition-all">
                {/* <div className="rounded-xl bg-primary/10 p-3 text-primary w-fit mb-4">
                  <PackageCheck className="size-5" />
                </div> */}
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Catalogue & Fiches Modèles
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Base de données intégrée pour créer vos modèles (iPhone,
                  Samsung, Tecno, Infinix, Xiaomi) avec seuils d'alerte pour ne
                  jamais tomber en rupture de stock.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            7. SECTION TARIFS & ESSAI GRATUIT
        ───────────────────────────────────────────────────────────── */}
        <section id="tarifs" className="border-t border-border/40 py-20 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Tarification Simple
              </span>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Démarrez sans risque aujourd'hui
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Testez l'intégralité des fonctionnalités gratuitement pendant 30
                jours avant de prendre votre décision.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-primary/30 bg-card p-8 shadow-xl ring-1 ring-primary/20 text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400 via-primary to-indigo-600" />

              <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                Offre de Découverte
              </span>

              <h3 className="mt-4 font-heading text-2xl font-bold text-foreground">
                30 Jours d'Essai Gratuit
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Accès immédiat et complet à toutes les fonctionnalités
              </p>

              <div className="my-6">
                <span className="font-mono text-5xl font-extrabold text-foreground">
                  0 FCFA
                </span>
                <span className="text-sm text-muted-foreground"> / premier mois</span>
              </div>

              <ul className="space-y-3 text-left text-sm text-foreground mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Suivi unitaire par IMEI illimité</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Gestion multi-boutiques incluse</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Accès Web Cloud + Application Desktop PC</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Comptes vendeuses et secrétaires illimités</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Support technique et assistance au démarrage</span>
                </li>
              </ul>

              <Link
                href="/inscription"
                className={cn(buttonVariants({ size: "lg" }), "w-full text-base font-semibold shadow-md shadow-primary/20")}
                id="btn-pricing-essai"
              >
                <span>Créer mon compte en 2 minutes</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>

              <p className="mt-4 text-xs text-muted-foreground">
                Aucune carte bancaire demandée à l'inscription.
              </p>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            8. SECTION FAQ INTERACTIVE
        ───────────────────────────────────────────────────────────── */}
        <section id="faq" className="border-t border-border/40 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Foire aux Questions
              </span>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Des réponses à vos questions
              </h2>
            </div>

            <div className="mt-12 divide-y divide-border/60">
              {FAQS.map((faq, index) => {
                const estOuvert = faqOuverte === index;

                return (
                  <div key={index} className="py-4">
                    <button
                      onClick={() => setFaqOuverte(estOuvert ? null : index)}
                      className="flex w-full items-center justify-between text-left font-medium text-foreground hover:text-primary transition-colors gap-4"
                      id={`faq-btn-${index}`}
                    >
                      <span className="text-base font-semibold">{faq.q}</span>
                      <ChevronDown
                        className={cn(
                          "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
                          estOuvert && "rotate-180 text-primary",
                        )}
                      />
                    </button>
                    {estOuvert && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed pr-4">
                        {faq.r}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            9. CALL TO ACTION FINAL
        ───────────────────────────────────────────────────────────── */}
        <section className="border-t border-border/40 py-20 bg-gradient-to-b from-background via-primary/5 to-background text-center">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <IconeTelora size={56} className="mx-auto mb-6" />
            <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Prêt à reprendre le contrôle total sur vos stocks ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-base sm:text-lg">
              Rejoignez les boutiques qui ont éliminé les pertes d'appareils et
              accéléré leurs encaissements avec Telora.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link
                href="/inscription"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 px-7 text-base font-semibold shadow-lg shadow-primary/25",
                )}
                id="btn-cta-final-essai"
              >
                <span>Commencer l'essai gratuit 30 jours</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <a
                href="#telechargements"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-6 text-base")}
              >
                <Download className="mr-2 size-4 text-primary" />
                <span>Télécharger l'application PC</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          10. PIED DE PAGE (FOOTER)
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 bg-card/40 py-12 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <IconeTelora size={26} />
                <span className="font-heading font-bold text-foreground text-sm">
                  Telora
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Le logiciel de référence pour la traçabilité IMEI unitaire et la
                caisse des magasins de téléphones.
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground text-sm mb-3">Produit</p>
              <ul className="space-y-2">
                <li>
                  <a href="#avantages" className="hover:text-foreground">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-foreground">
                    Web vs Caisse
                  </a>
                </li>
                <li>
                  <a href="#telechargements" className="hover:text-foreground">
                    Téléchargements
                  </a>
                </li>
                <li>
                  <Link href="/inscription" className="hover:text-foreground">
                    Essai gratuit 30 jours
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-foreground text-sm mb-3">Ressources</p>
              <ul className="space-y-2">
                <li>
                  <Link href="/connexion" className="hover:text-foreground">
                    Espace Connexion
                  </Link>
                </li>
                <li>
                  <Link href="/etudes-de-cas" className="hover:text-foreground">
                    Études de cas
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-foreground">
                    Aide & Support
                  </Link>
                </li>
                <li>
                  <Link href="/securite" className="hover:text-foreground">
                    Sécurité & Données
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-foreground text-sm mb-3">Légal</p>
              <ul className="space-y-2">
                <li>
                  <Link href="/cgu" className="hover:text-foreground">
                    Conditions Générales (CGU)
                  </Link>
                </li>
                <li>
                  <Link href="/confidentialite" className="hover:text-foreground">
                    Politique de Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/mentions-legales" className="hover:text-foreground">
                    Mentions Légales
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-foreground">
                    Gestion des cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
            <p>© {new Date().getFullYear()} Telora. Tous droits réservés.</p>
            <p>Conçu pour l'excellence opérationnelle des commerçants.</p>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          11. MODAL D'ASSISTANCE AU TÉLÉCHARGEMENT
      ───────────────────────────────────────────────────────────── */}
      {modalTelechargement.ouverte && modalTelechargement.version && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Download className="size-5 text-primary" />
                <span className="font-heading font-bold text-foreground">
                  Téléchargement en cours
                </span>
              </div>
              <button
                onClick={() => setModalTelechargement({ ouverte: false })}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                id="btn-fermer-modal-dl"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 text-sm">
              <p className="font-medium text-foreground">
                {modalTelechargement.version.nom}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Format : {modalTelechargement.version.type} · Taille :{" "}
                {modalTelechargement.version.taille}
              </p>

              <div className="mt-5 rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2 text-xs">
                <p className="font-semibold text-foreground">
                  📋 Étapes après le téléchargement :
                </p>
                <div className="space-y-1.5 text-muted-foreground">
                  <p>1. Ouvrez le fichier dans votre dossier Téléchargements.</p>
                  <p>2. Suivez les instructions rapides de l'installateur.</p>
                  <p>
                    3. Connectez-vous avec vos identifiants ou cliquez sur "Créer
                    un compte" pour profiter des 30 jours d'essai gratuit.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Button
                  onClick={() => {
                    toast.success("Téléchargement relancé");
                    setModalTelechargement({ ouverte: false });
                  }}
                  className="w-full"
                >
                  <Download className="mr-2 size-4" />
                  <span>Enregistrer le fichier maintenant</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setModalTelechargement({ ouverte: false })}
                  className="w-full"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL D'AGRANDISSEMENT DE LA CAPTURE D'ÉCRAN
      ───────────────────────────────────────────────────────────── */}
      {modalImageZoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setModalImageZoom(null)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh] rounded-2xl border border-border bg-card overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
              <span className="text-xs font-mono text-muted-foreground">
                {lang === "en"
                  ? "Telora Dashboard — Full Resolution Preview"
                  : "Tableau de bord Telora — Résolution originale"}
              </span>
              <button
                onClick={() => setModalImageZoom(null)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="relative aspect-[16/9] sm:aspect-[1918/885] w-full">
              <Image
                src={modalImageZoom}
                alt="Capture d'écran Telora en taille réelle"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

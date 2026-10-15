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
  Star,
  Store,
  Terminal,
  Users,
  Wrench,
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

const TEMOIGNAGES = [
  {
    nom: "Fatou Kouamé",
    role: "Gérante de 2 boutiques de téléphonie",
    ville: "Abidjan, Côte d'Ivoire",
    avatar: "/images/v2/portrait-fatou.jpg",
    texte:
      "Avant Telora, nous comptions les iPhones par quantité sur un cahier. Les boîtes disparaissaient sans qu'on puisse savoir qui les avait prises. Maintenant, chaque téléphone est scanné à l'arrivage : 0 perte en 6 mois.",
    note: 5,
  },
  {
    nom: "Marc Djoumessi",
    role: "Responsable SAV & Vente de téléphones",
    ville: "Douala, Cameroun",
    avatar: "/images/v2/portrait-marc.jpg",
    texte:
      "Le suivi par IMEI nous a sauvés des faux litiges de garantie. Un client est venu réclamer un écran défectueux : en 2 clics sur Telora, on a prouvé que l'IMEI provenait d'une autre enseigne.",
    note: 5,
  },
  {
    nom: "Sarah Touré",
    role: "Propriétaire Magasin High-Tech & Accessoires",
    ville: "Dakar, Sénégal",
    avatar: "/images/v2/portrait-sarah.jpg",
    texte:
      "L'application PC de caisse est d'une rapidité incroyable. Le ticket thermique sort en moins d'une seconde sans aucune fenêtre popup. Mes vendeuses l'ont prise en main en 10 minutes.",
    note: 5,
  },
];

export default function LandingPageV2() {
  const [osDetecte, setOsDetecte] = useState<Plateforme>("windows");
  const [plateformeActive, setPlateformeActive] = useState<Plateforme>("windows");
  const [modalTelechargement, setModalTelechargement] = useState<{
    ouverte: boolean;
    version?: VersionTelechargement;
    plateforme?: Plateforme;
  }>({ ouverte: false });
  const [faqOuverte, setFaqOuverte] = useState<number | null>(null);
  const [darkImgIntrouvable, setDarkImgIntrouvable] = useState(false);
  const [periodeFacturation, setPeriodeFacturation] = useState<"mensuel" | "annuel">("mensuel");
  const [deviseTarif, setDeviseTarif] = useState<"XAF" | "USD">("XAF");

  const { lang } = useI18n();
  const { resolvedTheme } = useTheme();

  const estSombre = resolvedTheme === "dark";
  const srcCapture = React.useMemo(() => {
    if (lang === "en") {
      return estSombre && !darkImgIntrouvable ? "/screenshot-dark.png" : "/dashboard-en-clair.png";
    }
    return estSombre && !darkImgIntrouvable ? "/capture-ecran-dark.png" : "/dashboard-fr-clair.png";
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

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* ─────────────────────────────────────────────────────────────
          BANNIÈRE DISCRÈTE V2 PREVIEW
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-sky-600 via-primary to-indigo-600 px-4 py-2 text-center text-xs font-medium text-white shadow-sm flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          <Sparkles className="size-3" /> Version V2 Visuelle
        </span>
        <span className="hidden sm:inline">
          Aperçu avec intégration photographique professionnelle
        </span>
        <span className="opacity-60">•</span>
        <Link
          href="/"
          className="font-semibold underline underline-offset-2 hover:text-white/80 transition-colors"
        >
          Voir la version standard (sans images)
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER NAVIGATION
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo et Nom */}
          <Link
            href="/v2"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            id="nav-logo"
          >
            <IconeTelora size={34} />
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                Telora
              </span>
            </div>
          </Link>

          {/* Liens de navigation centrale (Desktop) */}
          <nav className="hidden items-center gap-7 md:flex text-sm font-medium text-muted-foreground">
            <a href="#usages" className="transition-colors hover:text-foreground">
              Pour qui ?
            </a>
            <a href="#imei" className="transition-colors hover:text-foreground">
              Traçabilité IMEI
            </a>
            <a href="#solutions" className="transition-colors hover:text-foreground">
              Caisse & Web
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
            <a href="#avis" className="transition-colors hover:text-foreground">
              Témoignages
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
            2. HERO SECTION ENRICHI D'IMAGES (SPLIT LAYOUT HYBRIDE)
        ───────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28">
          {/* Effets lumineux d'arrière-plan */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#00D2FF]/20 to-[#0066FF]/20 opacity-40 sm:left-[calc(50%-25rem)] sm:w-[72.1875rem]"
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Colonne Gauche : Pitch & CTA */}
              <div className="text-center lg:col-span-7 lg:text-left">
                {/* Badge contextuel */}
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
                  <Smartphone className="size-3.5 text-primary" />
                  <span>Conçu exclusivement pour les boutiques de téléphonie</span>
                </div>

                {/* Grand Titre H1 */}
                <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                  La gestion de stock & caisse pensée pour les{" "}
                  <span className="bg-gradient-to-r from-sky-400 via-primary to-indigo-600 bg-clip-text text-transparent">
                    boutiques de smartphones
                  </span>
                </h1>

                {/* Sous-titre */}
                <p className="mt-5 text-balance text-base text-muted-foreground sm:text-lg">
                  Chaque appareil est suivi{" "}
                  <strong className="font-semibold text-foreground">
                    individuellement par son IMEI
                  </strong>
                  , de son arrivage au comptoir de vente. Fini les pertes inexpliquées :
                  scan ultra-rapide à la douchette, réconciliation de stock en direct et
                  impression thermique instantanée de tickets de caisse.
                </p>

                {/* Double CTA */}
                <div className="mt-8 flex flex-col items-stretch sm:flex-row sm:items-center gap-3.5 justify-center lg:justify-start">
                  <Link
                    href="/inscription"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-12 px-6 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all",
                    )}
                    id="btn-hero-essai-web"
                  >
                    <span>Démarrer l'essai gratuit 30 jours</span>
                    <ArrowRight className="ml-2 size-4" />
                  </Link>

                  <a
                    href="#telechargements"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-12 px-5 text-base border-border/80 bg-background/60 hover:bg-muted/80 backdrop-blur-sm transition-all",
                    )}
                    id="btn-hero-telecharger"
                  >
                    <Download className="mr-2 size-4 text-primary" />
                    <span>Télécharger pour {TELECHARGEMENTS[osDetecte].nom}</span>
                  </a>
                </div>

                {/* Éléments de réassurance */}
                <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
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
              </div>

              {/* Colonne Droite : Composition Visuelle Photographique Réelle */}
              <div className="relative lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Photo de fond : Boutique de téléphonie moderne */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/80 bg-muted shadow-2xl">
                    <Image
                      src="/images/v2/hero-store.jpg"
                      alt="Commerçant dans une boutique de téléphonie au comptoir avec un client"
                      fill
                      priority
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                    {/* Badge flottant 1 : Scan IMEI */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 rounded-xl border border-border/60 bg-background/90 px-3 py-2 shadow-lg backdrop-blur-md">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                        <ScanLine className="size-4" />
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-[11px] font-bold text-foreground">Scan IMEI instantané</p>
                        <p className="text-[9px] font-mono text-muted-foreground">358912093847561</p>
                      </div>
                    </div>

                    {/* Badge flottant 2 : Ticket thermique direct */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 rounded-xl border border-border/60 bg-background/90 px-3 py-2 shadow-lg backdrop-blur-md">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/15 text-sky-500">
                        <Printer className="size-4" />
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-[11px] font-bold text-foreground">Reçu direct</p>
                        <p className="text-[9px] text-muted-foreground">ESC/POS sans pop-up</p>
                      </div>
                    </div>

                    {/* Légende en bas de photo */}
                    <div className="absolute bottom-4 inset-x-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/50 p-2.5 backdrop-blur-md text-white text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Store className="size-4 text-sky-400" />
                        Boutique & Caisse en situation réelle
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                        ● Synchronisé
                      </span>
                    </div>
                  </div>

                  {/* Carte incrustée en chevauchement : Aperçu Dashboard Telora */}
                  <div className="relative -mt-14 sm:-mt-16 mx-4 sm:mx-6 rounded-2xl border border-border/80 bg-card/95 p-2 sm:p-3 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2 px-1 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-red-500/80" />
                        <span className="size-2 rounded-full bg-amber-500/80" />
                        <span className="size-2 rounded-full bg-emerald-500/80" />
                        <span className="ml-2 font-mono text-[10px] font-medium text-foreground">
                          Telora Caisse Desktop & Cloud
                        </span>
                      </div>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                        HD 60 FPS
                      </span>
                    </div>

                    <div className="relative mt-2 overflow-hidden rounded-xl border border-border/50 bg-muted/40">
                      <Image
                        src={srcCapture}
                        alt="Aperçu réel du logiciel de stock et caisse Telora"
                        width={960}
                        height={500}
                        className="w-full h-auto object-cover"
                        onError={() => {
                          if (estSombre) {
                            setDarkImgIntrouvable(true);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. SECTION NOUVELLE : POUR QUI EST FAIT TELORA ? (GALERIE MÉTIER)
        ───────────────────────────────────────────────────────────── */}
        <section id="usages" className="border-t border-border/40 py-20 bg-muted/15">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Adapté à votre activité
              </span>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Un outil taillé sur-mesure pour chaque univers de la téléphonie
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Qu'il s'agisse de boîtes scellées haut de gamme, d'accessoires à grand débit
                ou d'ateliers de réparation, Telora s'adapte à votre méthode de travail.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {/* Carte 1 : Smartphones Neufs & Reconditionnés */}
              <div className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm hover:border-primary/50 transition-all flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <Image
                    src="/images/v2/store-shelf.jpg"
                    alt="Rayonnages de smartphones neufs et reconditionnés en boutique"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-primary/90 px-3 py-1 text-[11px] font-semibold text-primary-foreground backdrop-blur-md shadow-sm">
                    Smartphones Neufs & Occasions
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      Traçabilité unitaire stricte par IMEI
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Chaque carton ou boîte iPhone, Samsung ou Tecno a son identifiant unique.
                      Sachez précisément quel appareil est dans quelle vitrine, à quel prix et qui
                      l'a vendu.
                    </p>
                  </div>
                  <div className="mt-5 border-t border-border/50 pt-3 text-xs font-medium text-primary flex items-center gap-1.5">
                    <Check className="size-4" /> Fiches produits avec IMEI & garanties
                  </div>
                </div>
              </div>

              {/* Carte 2 : Caisse & Accessoires */}
              <div className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm hover:border-primary/50 transition-all flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <Image
                    src="/images/v2/customer-checkout.jpg"
                    alt="Commerçante encaissant des accessoires au comptoir"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-sky-600/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-sm">
                    Accessoires & Caisses Rapides
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      Coques, écouteurs, chargeurs au vol
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Pour les articles sans IMEI, gérez simplement par quantités avec seuils
                      d'alerte de rupture automatique et scan direct du code-barres EAN au comptoir.
                    </p>
                  </div>
                  <div className="mt-5 border-t border-border/50 pt-3 text-xs font-medium text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                    <Check className="size-4" /> Mode caisse express & impression thermique
                  </div>
                </div>
              </div>

              {/* Carte 3 : Réparation & SAV */}
              <div className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm hover:border-primary/50 transition-all flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <Image
                    src="/images/v2/phone-repair.jpg"
                    alt="Atelier de réparation smartphone avec outils de précision"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-amber-600/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-sm">
                    Ateliers de Réparation & SAV
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      Historique des pannes & pièces détachées
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Identifiez en 3 secondes si un téléphone retourné a réellement été vendu ou
                      réparé dans votre boutique. Fini les faux litiges de garantie client.
                    </p>
                  </div>
                  <div className="mt-5 border-t border-border/50 pt-3 text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Check className="size-4" /> Preuve d'achat irréfutable par IMEI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. SECTION "LE SUIVI IMEI : POURQUOI C'EST CRUCIAL" (AVEC PHOTO ARRIVAGE)
        ───────────────────────────────────────────────────────────── */}
        <section id="imei" className="border-t border-border/40 py-20 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Pourquoi un simple fichier Excel ou logiciel générique ne suffit pas
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Un smartphone n'est pas un article qu'on compte en vrac. C'est un objet de valeur
                portant une empreinte unique : son numéro IMEI.
              </p>
            </div>

            <div className="mt-14 grid items-center gap-8 lg:grid-cols-12">
              {/* Photo d'arrivage & de scan */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-lg">
                  <Image
                    src="/images/v2/inventory-scan.jpg"
                    alt="Scan des cartons d'arrivage de téléphones en stock"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 450px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-md text-white text-xs">
                    <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <ScanLine className="size-4" /> Arrivage contrôlé
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-200">
                      Bip de la douchette = l'appareil précis est enregistré avec date, heure et
                      nom du réceptionnaire.
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparatif Piège vs Solution Telora */}
              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
                {/* Le problème classique */}
                <div className="rounded-2xl border border-destructive/20 bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 text-destructive font-semibold text-base mb-3">
                    <ShieldAlert className="size-5 shrink-0" />
                    <span>Gestion par simple quantité (Le piège)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Le logiciel affiche simplement : <code>iPhone 15 : Quantité = 4</code>.
                  </p>
                  <ul className="space-y-3 text-xs sm:text-sm">
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <X className="size-4 shrink-0 text-destructive mt-0.5" />
                      <span>
                        <strong>Vols invisibles :</strong> Si une boîte disparaît, impossible de
                        savoir quel jour ni quelle vendeuse tenait la caisse.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <X className="size-4 shrink-0 text-destructive mt-0.5" />
                      <span>
                        <strong>Litiges de garantie :</strong> Un client revient avec un téléphone
                        en panne : comment prouver qu'il a été acheté chez vous ?
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <X className="size-4 shrink-0 text-destructive mt-0.5" />
                      <span>
                        <strong>Mélange de stock :</strong> Aucune traçabilité sur les téléphones
                        réservés, réparés ou retournés.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* La solution Telora */}
                <div className="rounded-2xl border border-primary/40 bg-card p-6 shadow-md ring-1 ring-primary/20">
                  <div className="flex items-center gap-2.5 text-primary font-semibold text-base mb-3">
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                    <span>La méthode Telora (1 appareil = 1 ligne)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Chaque téléphone a son passeport numérique avec son numéro IMEI gravé.
                  </p>
                  <ul className="space-y-3 text-xs sm:text-sm">
                    <li className="flex items-start gap-2 text-foreground">
                      <Check className="size-4 shrink-0 text-primary mt-0.5" />
                      <span>
                        <strong>Zéro zone d'ombre :</strong> Chaque arrivage, vente ou transfert
                        entre boutiques est signé par l'employé.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <Check className="size-4 shrink-0 text-primary mt-0.5" />
                      <span>
                        <strong>Factures certifiées :</strong> L'IMEI est imprimé sur le ticket
                        de caisse pour une garantie client incontestable.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <Check className="size-4 shrink-0 text-primary mt-0.5" />
                      <span>
                        <strong>Scan instantané :</strong> Bip de la douchette à l'encaissement =
                        l'appareil précis sort immédiatement du stock.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. SECTION "WEB CLOUD VS CAISSE DESKTOP" (AVEC PHOTO MATÉRIEL POS)
        ───────────────────────────────────────────────────────────── */}
        <section id="solutions" className="py-20 border-t border-border/40 bg-muted/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Flexibilité Totale
              </span>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Deux modes complémentaires selon votre besoin
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Profitez du meilleur des deux mondes : la liberté du Cloud pour le propriétaire
                et la puissance de l'application PC locale pour le comptoir de vente.
              </p>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-2">
              {/* Carte Solution 1 : Web Cloud */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 sm:p-8 hover:border-primary/40 transition-all shadow-sm">
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
                    Idéal pour les gérants et propriétaires qui souhaitent surveiller leurs
                    boutiques à distance, depuis chez eux, sur tablette ou smartphone.
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
                      <span>Gestion des équipes, rôles et permissions</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-emerald-500 shrink-0" />
                      <span>Mises à jour automatiques transparentes</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/inscription"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full justify-center",
                  )}
                >
                  <span>Tester directement sur le Web</span>
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </div>

              {/* Carte Solution 2 : Caisse Desktop avec photo POS */}
              <div className="flex flex-col justify-between rounded-2xl border border-primary/40 bg-card p-6 sm:p-8 shadow-md hover:border-primary transition-all relative overflow-hidden">
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
                    L'application native installée sur votre ordinateur de vente. Ultra-rapide,
                    elle intègre directement votre matériel de caisse.
                  </p>

                  {/* Photo miniature du matériel de caisse POS */}
                  <div className="relative mb-6 h-36 w-full overflow-hidden rounded-xl border border-border/60 bg-muted">
                    <Image
                      src="/images/v2/pos-receipt.jpg"
                      alt="Terminal de caisse POS et impression de ticket thermique"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 500px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                      <span className="flex items-center gap-1.5">
                        <Printer className="size-3.5 text-sky-400" />
                        Impression directe 80mm & 58mm
                      </span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                        Zéro dialogue pop-up
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 text-sm mb-8">
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-primary shrink-0" />
                      <span>
                        <strong>Impression directe sans pop-up :</strong> Vos reçus sortent
                        directement sur imprimante thermique.
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-primary shrink-0" />
                      <span>
                        <strong>Mode plein écran caisse :</strong> Bloque les distractions sur le
                        poste des vendeuses.
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-primary shrink-0" />
                      <span>
                        <strong>Tolérance aux coupures :</strong> Reconnexion automatique sans
                        perte d'état.
                      </span>
                    </li>
                  </ul>
                </div>

                <a
                  href="#telechargements"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "w-full justify-center shadow-md shadow-primary/20",
                  )}
                >
                  <Download className="mr-2 size-4" />
                  <span>Télécharger l'application PC</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. SECTION TÉLÉCHARGEMENT MULTI-PLATEFORMES
        ───────────────────────────────────────────────────────────── */}
        <section id="telechargements" className="border-t border-border/40 py-20 bg-background">
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
                Choisissez votre système d'exploitation ci-dessous. Le logiciel s'installe en
                quelques secondes sans configuration complexe.
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
                    Connectez-vous avec vos identifiants ou créez un compte (30 jours d'essai gratuit).
                  </li>
                  <li>
                    Votre imprimante thermique et votre douchette USB sont reconnues automatiquement.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            7. SECTION TARIFS (TABLEAU COMPARATIF COMPLET)
        ───────────────────────────────────────────────────────────── */}
        <section id="tarifs" className="border-t border-border/40 py-20 bg-muted/20 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Tarification Claire & Transparente
              </span>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Des forfaits adaptés à la taille de votre boutique
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-sm sm:text-base">
                Démarrez avec 30 jours d'essai gratuit en version Premium pour profiter du plein
                potentiel de l'application. Sans carte bancaire requise.
              </p>

              {/* Bascules : Mensuel / Annuel & XAF / USD */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                {/* Bascule Période */}
                <div className="inline-flex rounded-xl border border-border/80 bg-card p-1 shadow-sm">
                  <button
                    onClick={() => setPeriodeFacturation("mensuel")}
                    className={cn(
                      "rounded-lg px-4 py-2 text-xs font-semibold transition-all",
                      periodeFacturation === "mensuel"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Facturation mensuelle
                  </button>
                  <button
                    onClick={() => setPeriodeFacturation("annuel")}
                    className={cn(
                      "rounded-lg px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5",
                      periodeFacturation === "annuel"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>Facturation annuelle</span>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 text-[10px] font-bold">
                      -17% (2 mois offerts)
                    </span>
                  </button>
                </div>

                {/* Bascule Devise */}
                <div className="inline-flex rounded-xl border border-border/80 bg-card p-1 shadow-sm">
                  <button
                    onClick={() => setDeviseTarif("XAF")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                      deviseTarif === "XAF"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    FCFA (XAF)
                  </button>
                  <button
                    onClick={() => setDeviseTarif("USD")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                      deviseTarif === "USD"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    $ USD
                  </button>
                </div>
              </div>
            </div>

            {/* Tableau comparatif */}
            <div className="mt-12 overflow-x-auto pb-4">
              <div className="min-w-[760px] rounded-2xl border border-border/80 bg-card/80 shadow-xl backdrop-blur-md overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border/70 bg-muted/30">
                      <th className="p-5 w-1/4 align-bottom">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Critères & Capacités
                        </span>
                      </th>

                      {/* Gratuit 30 jours */}
                      <th className="p-5 w-1/4 border-l border-border/50 align-top">
                        <div className="flex flex-col">
                          <span className="font-heading text-lg font-bold text-foreground">
                            Essai Gratuit
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            30 jours • Sans engagement
                          </span>
                          <div className="mt-3">
                            <span className="font-mono text-2xl font-extrabold text-foreground">
                              0 {deviseTarif === "XAF" ? "FCFA" : "$"}
                            </span>
                            <span className="text-xs text-muted-foreground"> / 30 jours</span>
                          </div>
                          <span className="mt-2 inline-flex items-center text-[11px] font-medium text-emerald-500">
                            ✓ Accès Premium inclus
                          </span>
                        </div>
                      </th>

                      {/* Standard */}
                      <th className="p-5 w-1/4 border-l border-border/50 align-top">
                        <div className="flex flex-col">
                          <span className="font-heading text-lg font-bold text-foreground">
                            Standard
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            Boutique individuelle
                          </span>
                          <div className="mt-3">
                            <span className="font-mono text-2xl font-extrabold text-foreground">
                              {deviseTarif === "XAF"
                                ? periodeFacturation === "mensuel"
                                  ? "10 000"
                                  : "8 333"
                                : periodeFacturation === "mensuel"
                                ? "17"
                                : "13"}
                              {" "}{deviseTarif === "XAF" ? "FCFA" : "$"}
                            </span>
                            <span className="text-xs text-muted-foreground"> / mois</span>
                          </div>
                          {periodeFacturation === "annuel" && (
                            <span className="mt-1 text-[11px] text-muted-foreground">
                              Facturé {deviseTarif === "XAF" ? "100 000 FCFA" : "160 $"} / an
                            </span>
                          )}
                        </div>
                      </th>

                      {/* Premium */}
                      <th className="relative p-5 w-1/4 border-l border-border/50 bg-primary/[0.04] dark:bg-primary/[0.07] align-top">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-primary to-indigo-500" />
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-heading text-lg font-bold text-foreground">
                              Premium
                            </span>
                            <span className="rounded-full bg-gradient-to-r from-amber-500 to-primary px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                              Le plus choisi
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            Multi-boutiques & Tout illimité
                          </span>
                          <div className="mt-3">
                            <span className="font-mono text-2xl font-extrabold text-foreground">
                              {deviseTarif === "XAF"
                                ? periodeFacturation === "mensuel"
                                  ? "25 000"
                                  : "20 833"
                                : periodeFacturation === "mensuel"
                                ? "42"
                                : "33"}
                              {" "}{deviseTarif === "XAF" ? "FCFA" : "$"}
                            </span>
                            <span className="text-xs text-muted-foreground"> / mois</span>
                          </div>
                          {periodeFacturation === "annuel" && (
                            <span className="mt-1 text-[11px] text-muted-foreground">
                              Facturé {deviseTarif === "XAF" ? "250 000 FCFA" : "400 $"} / an
                            </span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border/50 text-xs sm:text-sm">
                    <tr>
                      <td className="p-4 font-medium text-foreground">Boutiques incluses</td>
                      <td className="p-4 border-l border-border/50 text-foreground font-semibold">
                        Illimité (30j)
                      </td>
                      <td className="p-4 border-l border-border/50 text-foreground">
                        1 boutique max
                      </td>
                      <td className="p-4 border-l border-border/50 bg-primary/[0.02] dark:bg-primary/[0.04] text-foreground font-semibold">
                        Illimité (Multi-boutiques)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-foreground">Membres de l'équipe</td>
                      <td className="p-4 border-l border-border/50 text-foreground font-semibold">
                        Illimité (30j)
                      </td>
                      <td className="p-4 border-l border-border/50 text-foreground">
                        Jusqu'à 3 employés
                      </td>
                      <td className="p-4 border-l border-border/50 bg-primary/[0.02] dark:bg-primary/[0.04] text-foreground font-semibold">
                        Illimité (Gérants, Caissières)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-foreground">Suivi IMEI unitaire</td>
                      <td className="p-4 border-l border-border/50 text-emerald-500 font-bold">
                        ✓ Inclus
                      </td>
                      <td className="p-4 border-l border-border/50 text-emerald-500 font-bold">
                        ✓ Inclus
                      </td>
                      <td className="p-4 border-l border-border/50 bg-primary/[0.02] dark:bg-primary/[0.04] text-emerald-500 font-bold">
                        ✓ Inclus
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-foreground">Application Caisse Desktop (PC)</td>
                      <td className="p-4 border-l border-border/50 text-emerald-500 font-bold">
                        ✓ Inclus
                      </td>
                      <td className="p-4 border-l border-border/50 text-emerald-500 font-bold">
                        ✓ Inclus
                      </td>
                      <td className="p-4 border-l border-border/50 bg-primary/[0.02] dark:bg-primary/[0.04] text-emerald-500 font-bold">
                        ✓ Inclus
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-foreground">Support & Assistance</td>
                      <td className="p-4 border-l border-border/50 text-foreground">Standard</td>
                      <td className="p-4 border-l border-border/50 text-foreground">Standard (Email)</td>
                      <td className="p-4 border-l border-border/50 bg-primary/[0.02] dark:bg-primary/[0.04] text-foreground font-semibold">
                        Prioritaire WhatsApp 7j/7
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            8. SECTION TÉMOIGNAGES CLIENTS RÉELS (PORTRAITS & AVIS)
        ───────────────────────────────────────────────────────────── */}
        <section id="avis" className="py-20 border-t border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Preuve Sociale
              </span>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Adopté par des commerçants exigeants sur le terrain
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Découvrez comment les propriétaires de boutiques ont éliminé les disparitions
                d'appareils et accéléré leurs clôtures de caisse.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {TEMOIGNAGES.map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Étoiles */}
                    <div className="flex items-center gap-1 text-amber-500 mb-4">
                      {Array.from({ length: t.note }).map((_, n) => (
                        <Star key={n} className="size-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>

                    <p className="text-sm text-foreground/90 italic leading-relaxed mb-6">
                      « {t.texte} »
                    </p>
                  </div>

                  {/* Profil avec vrai portrait */}
                  <div className="flex items-center gap-3 border-t border-border/50 pt-4">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border/80 bg-muted">
                      <Image
                        src={t.avatar}
                        alt={t.nom}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-foreground">{t.nom}</h4>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                      <p className="text-[11px] text-primary font-medium">{t.ville}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            9. FAQ
        ───────────────────────────────────────────────────────────── */}
        <section id="faq" className="border-t border-border/40 py-20 bg-muted/15">
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
            10. CALL TO ACTION FINAL
        ───────────────────────────────────────────────────────────── */}
        <section className="border-t border-border/40 py-20 bg-gradient-to-b from-background via-primary/5 to-background text-center">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <IconeTelora size={56} className="mx-auto mb-6" />
            <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Prêt à reprendre le contrôle total sur vos stocks ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-base sm:text-lg">
              Rejoignez les boutiques qui ont éliminé les pertes d'appareils et accéléré leurs
              encaissements avec Telora.
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
          11. FOOTER
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
                  <a href="#usages" className="hover:text-foreground">
                    Pour qui ?
                  </a>
                </li>
                <li>
                  <a href="#imei" className="hover:text-foreground">
                    Traçabilité IMEI
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
    </div>
  );
}

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
  ChevronRight,
  Download,
  Flame,
  Globe,
  HardDrive,
  Laptop,
  Layers,
  Lock,
  Maximize2,
  Monitor,
  PackageCheck,
  Printer,
  Radio,
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
import { BarreEcosysteme } from "@/components/barre-ecosysteme";

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
    q: "Qu'est-ce qui différencie Telora d'un logiciel de caisse ordinaire ?",
    r: "Les logiciels généralistes gèrent de simples quantités (ex: 4 téléphones en stock). Telora a été conçu dès le premier jour pour la téléphonie : chaque appareil possède sa fiche unique avec son numéro IMEI gravé. Vous tracez chaque appareil de son arrivage au carton jusqu'à sa remise au client avec impression de l'IMEI sur le reçu thermique pour la garantie.",
  },
  {
    q: "Est-ce que je dois payer pour tester Telora ?",
    r: "Non, aucun paiement n'est exigé. Dès votre inscription, vous bénéficiez de 30 jours d'essai gratuit avec 100% des fonctionnalités débloquées sur le plan Premium. Aucune carte bancaire n'est demandée.",
  },
  {
    q: "Comment fonctionne l'application de caisse Desktop en cas de coupure Internet ?",
    r: "L'application de caisse Desktop fonctionne en mode local tolérant aux pannes. Vos vendeuses continuent de scanner et d'encaisser normalement au comptoir. Dès que la connexion revient, les ventes et mouvements de stock se synchronisent automatiquement avec le Cloud du propriétaire.",
  },
  {
    q: "Quels types d'imprimantes et de scanners de code-barres sont compatibles ?",
    r: "Toutes les imprimantes thermiques 80mm et 58mm standards sont reconnues en ESC/POS (USB, réseau local Ethernet/Wi-Fi et Bluetooth) avec sortie directe sans fenêtre pop-up de navigateur. Pour le scan des IMEI, n'importe quelle douchette USB ou Bluetooth filaire/sans fil fonctionne immédiatement comme un clavier virtuel.",
  },
  {
    q: "Puis-je gérer plusieurs boutiques à la fois ?",
    r: "Oui. Telora est nativement multi-boutiques. Vous pouvez transférer des smartphones d'un point de vente à un autre en 2 clics avec traçabilité complète de l'employé qui a validé le transfert. Depuis votre tableau de bord, vous visualisez la trésorerie et les stocks de tous vos magasins réunis.",
  },
];

export default function LandingPageV3() {
  const [osDetecte, setOsDetecte] = useState<Plateforme>("windows");
  const [plateformeActive, setPlateformeActive] = useState<Plateforme>("windows");
  const [modalTelechargement, setModalTelechargement] = useState<{
    ouverte: boolean;
    version?: VersionTelechargement;
    plateforme?: Plateforme;
  }>({ ouverte: false });
  const [faqOuverte, setFaqOuverte] = useState<number | null>(null);
  const [ongletPourquoi, setOngletPourquoi] = useState<number>(0);
  const [periodeFacturation, setPeriodeFacturation] = useState<"mensuel" | "annuel">("mensuel");
  const [deviseTarif, setDeviseTarif] = useState<"XAF" | "USD">("XAF");
  const [darkImgIntrouvable, setDarkImgIntrouvable] = useState(false);

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

  // Contenus de l'accordéon "Pourquoi choisir Telora ?"
  const ONGLET_POURQUOI_ITEMS = [
    {
      titre: "Scan d'arrivage éclair",
      description:
        "Bippez chaque carton dès sa réception. L'IMEI est vérifié, associé au fournisseur et injecté dans votre stock en moins d'une seconde sans saisie manuelle fastidieuse.",
      badge: "Zéro saisie manuelle",
      detail: "Douchette USB & Caméra mobile compatibles",
    },
    {
      titre: "Caisse POS ultra-rapide",
      description:
        "Encaissement en 3 clics avec impression thermique directe sans boîte de dialogue pop-up. Raccourcis clavier F2 (scan) et F4 (règlement) taillés pour les rushs.",
      badge: "60 FPS natif",
      detail: "Compatible imprimantes 80mm & 58mm",
    },
    {
      titre: "Multi-boutiques synchronisé",
      description:
        "Transférez des téléphones d'une vitrine à l'autre en un clic. Chaque transfert est signé et tracé. Suivez le chiffre d'affaires global de vos magasins en direct.",
      badge: "Temps réel",
      detail: "Tableau de bord consolidé pour le patron",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-red-500/20 selection:text-red-600 dark:bg-[#070B14] dark:text-slate-100">
      {/* ─────────────────────────────────────────────────────────────
          BANNIÈRE DISCRÈTE V3 PREVIEW (STYLE NORDVPN)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-950 px-4 py-2 text-center text-xs font-medium text-white shadow-sm flex items-center justify-center gap-2 border-b border-white/10">
        <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          <Sparkles className="size-3" /> Version V3 Inspirée
        </span>
        <span className="hidden sm:inline text-slate-300">
          Mise en page haute fidélité inspirée de votre référence
        </span>
        <span className="opacity-40">•</span>
        <Link
          href="/"
          className="font-semibold underline underline-offset-2 hover:text-red-400 transition-colors"
        >
          Version standard
        </Link>
        <span className="opacity-40">•</span>
        <Link
          href="/v2"
          className="font-semibold underline underline-offset-2 hover:text-red-400 transition-colors"
        >
          Version V2
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER NAVIGATION (STYLE ÉPURÉ AVEC BOUTON ROUGE NORDVPN)
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-[#070B14]/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo et Nom */}
          <Link
            href="/v3"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            id="nav-logo"
          >
            <IconeTelora size={32} />
            <span className="font-heading text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              Telora
            </span>
          </Link>

          {/* Liens de navigation centrale (Desktop) */}
          <nav className="hidden items-center gap-7 md:flex text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#fonctionnalites" className="transition-colors hover:text-slate-950 dark:hover:text-white">
              Fonctionnalités
            </a>
            <a href="#pourquoi" className="transition-colors hover:text-slate-950 dark:hover:text-white">
              Pourquoi Telora ?
            </a>
            <a href="#statistiques" className="transition-colors hover:text-slate-950 dark:hover:text-white">
              Impact Réel
            </a>
            <a href="#avis" className="transition-colors hover:text-slate-950 dark:hover:text-white">
              Avis Clients
            </a>
            <a href="#tarifs" className="transition-colors hover:text-slate-950 dark:hover:text-white">
              Tarifs
            </a>
            <a href="#faq" className="transition-colors hover:text-slate-950 dark:hover:text-white">
              FAQ
            </a>
          </nav>

          {/* Outils & Bouton Rouge Énergique NordVPN */}
          <div className="flex items-center gap-2 sm:gap-3">
            <BasculeLangue taille="icon" />
            <BasculeTheme />

            <Link
              href="/connexion"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex text-xs font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white",
              )}
            >
              Se connecter
            </Link>

            {/* Bouton Rouge/Corail Iconique */}
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center rounded-full bg-[#E61E2A] hover:bg-[#D31823] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 shadow-md shadow-red-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              id="btn-nav-obtenir-offre"
            >
              <span>Essai gratuit 30j</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ─────────────────────────────────────────────────────────────
            2. HERO SECTION (STYLE NORDVPN : FOND BLEU CIEL + PERSONA EN VESTE)
        ───────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF3FC] via-[#F4F8FE] to-white pt-10 pb-16 md:pt-14 md:pb-24 dark:from-[#0D1527] dark:via-[#090E1B] dark:to-[#070B14]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
              {/* Colonne Gauche : Pitch & CTA Style Référence */}
              <div className="text-left lg:col-span-7">
                {/* Petit titre supérieur */}
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  La gestion de stock & caisse pour boutiques de téléphones
                </p>

                {/* Grand Titre inspiré : "Le meilleur service... vient encore de s'améliorer" */}
                <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-950 dark:text-white leading-[1.12]">
                  La gestion de vos stocks et de votre caisse vient de{" "}
                  <span className="text-[#0052CC] dark:text-[#388BFF]">
                    passer un cap
                  </span>
                </h1>

                {/* Sous-titre */}
                <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Chaque smartphone est tracé unitairement par son IMEI, de son arrivage
                  au comptoir de vente. Fini les pertes inexpliquées, les boîtes manquantes
                  et les contestations de garantie.
                </p>

                {/* Badge de confiance avec logo/étoiles */}
                <div className="mt-6 flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="size-4" />
                  </div>
                  <span>Noté 4.9/5 par plus de 350 propriétaires de magasins de téléphonie</span>
                </div>

                {/* Grand Bouton Rouge CTA Style NordVPN */}
                <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link
                    href="/inscription"
                    className="inline-flex items-center justify-center rounded-full bg-[#E61E2A] hover:bg-[#D31823] text-white text-base font-bold px-8 py-4 shadow-xl shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    id="btn-hero-obtenir-telora"
                  >
                    <span>Démarrer l'essai 30 jours gratuit</span>
                    <ArrowRight className="ml-2 size-4" />
                  </Link>

                  <a
                    href="#telechargements"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-4 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100 transition-all dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Download className="mr-2 size-4 text-[#0052CC] dark:text-[#388BFF]" />
                    <span>Télécharger PC ({TELECHARGEMENTS[osDetecte].nom})</span>
                  </a>
                </div>

                {/* Petite mention de réassurance */}
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  30 jours gratuits • Sans carte bancaire • Annulation en 1 clic
                </p>
              </div>

              {/* Colonne Droite : L'Ambassadeur / Gérant moderne avec ordinateur */}
              <div className="relative lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Photo de l'ambassadeur moderne avec son ordinateur */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <Image
                      src="/images/v3/ambassador-hero.jpg"
                      alt="Gérant moderne de boutique souriant devant son ordinateur et smartphone"
                      fill
                      priority
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 550px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Badge flottant Style Référence : Scan IMEI en direct */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-xl backdrop-blur-md dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                        <ScanLine className="size-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                          Scan IMEI instantané
                        </p>
                        <p className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          358912093847561 • Validé
                        </p>
                      </div>
                    </div>

                    {/* Badge flottant 2 : Ticket thermique direct */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-xl backdrop-blur-md dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#0052CC] text-white">
                        <Printer className="size-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                          Reçu ESC/POS
                        </p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400">
                          Sans boîte pop-up
                        </p>
                      </div>
                    </div>

                    {/* Message d'accroche en bas de l'image */}
                    <div className="absolute bottom-4 inset-x-4 rounded-2xl bg-black/75 p-3 text-white backdrop-blur-md border border-white/10 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <Store className="size-3.5 text-sky-400" />
                          Prêt pour votre boutique dès aujourd'hui
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          ● Actif
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. SECTION 1 : FOCUS PRODUIT EN MAIN (STYLE NORDVPN AVEC LE SMARTPHONE)
        ───────────────────────────────────────────────────────────── */}
        <section id="fonctionnalites" className="py-20 bg-white border-t border-slate-200/80 dark:bg-[#070B14] dark:border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Colonne Gauche : Pitch */}
              <div className="lg:col-span-6">
                <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-950 dark:text-white leading-tight">
                  Un scan d'arrivage nouvelle génération qui prend soin de chaque smartphone
                </h2>
                <p className="mt-5 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dès réception d'un carton de téléphones, finis les pointages manuels sur cahier
                  ou les classeurs perdus. Chaque boîte bippée à la douchette est automatiquement
                  enregistrée avec son IMEI, son modèle, sa capacité de stockage et la date d'arrivée.
                </p>
                <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Si un appareil disparaît ou si un client tente un échange frauduleux, vous disposez
                  d'une preuve numérique inaltérable avec le nom exact de la vendeuse qui a réceptionné l'appareil.
                </p>

                <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <Check className="size-4 text-emerald-500" />
                    <span>Zéro boîte manquante</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <Check className="size-4 text-emerald-500" />
                    <span>Contrôle immédiat de l'IMEI</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <Check className="size-4 text-emerald-500" />
                    <span>Facture certifiée au client</span>
                  </div>
                </div>
              </div>

              {/* Colonne Droite : Smartphone en main (Style Référence) */}
              <div className="lg:col-span-6">
                <div className="relative mx-auto max-w-md">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-2xl dark:border-slate-800">
                    <Image
                      src="/images/v3/phone-in-hand.jpg"
                      alt="Smartphone tenu en main scannant un code-barres IMEI"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Carte incrustée sur le téléphone */}
                    <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-slate-900/90 p-4 text-white backdrop-blur-xl shadow-2xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                        <span className="text-[11px] font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5" /> IMEI 358912093847561
                        </span>
                        <span className="text-[10px] rounded bg-white/10 px-2 py-0.5 text-slate-300">
                          Arrivage #412
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white">Apple iPhone 15 Pro Max 256 Go</p>
                      <p className="text-xs text-slate-400 mt-0.5">Titane Naturel • Neuf • Scellé</p>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                        <span className="text-slate-400">Emplacement : Vitrine Centrale</span>
                        <span className="font-mono font-bold text-white">750 000 FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. SECTION 2 : LE TRIO DE CARTES (STYLE NORDVPN : 3 BLOCS VERTICAUX)
        ───────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-slate-50 border-t border-slate-200/80 dark:bg-[#0B1120] dark:border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-950 dark:text-white">
                Une suite complète pour votre boutique, tout-en-un
              </h2>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
                La puissance de la caisse physique couplée à la souplesse du pilotage à distance.
              </p>
            </div>

            {/* Grille 3 Cartes Verticales (Connexion, Protection, Surveillance) */}
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {/* Carte 1 : Caisse & Encaissement Rapide (Fond Sombre Technique) */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-[#0F172A] p-6 text-white shadow-xl">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Caisse & Comptoir
                  </span>
                  <h3 className="mt-2 font-heading text-2xl font-bold text-white">
                    Encaissement 60 FPS
                  </h3>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    Vendez au vol en quelques secondes. Choisissez entre espèces, Orange Money,
                    MTN MoMo ou carte, et sortez un reçu thermique propre sans délai.
                  </p>
                </div>

                <div className="mt-8 relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  <Image
                    src={srcCapture}
                    alt="Aperçu caisse Telora"
                    fill
                    className="object-cover object-left-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 font-medium">
                  <span>Raccourcis F2 & F4</span>
                  <span className="text-sky-400 font-bold">Impression directe →</span>
                </div>
              </div>

              {/* Carte 2 : Stocks & Rayons (Photo Lifestyle Femme) */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="p-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Traçabilité Unitaire
                  </span>
                  <h3 className="mt-2 font-heading text-2xl font-bold text-slate-950 dark:text-white">
                    Stocks & Arrivages
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Contrôlez l'inventaire en temps réel. Chaque boîte en rayon a un identifiant.
                    Finies les mauvaises surprises lors de la fermeture du soir.
                  </p>
                </div>

                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src="/images/v3/lifestyle-woman.jpg"
                    alt="Commerçante gérant son inventaire en boutique"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-semibold">
                    ⭐ 100% des téléphones audités
                  </div>
                </div>

                <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span>Transferts inter-boutiques</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Zéro écart →</span>
                </div>
              </div>

              {/* Carte 3 : Pilotage à Distance & Marges (Photo Lifestyle Homme) */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="p-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC] dark:text-sky-400">
                    Supervision Cloud
                  </span>
                  <h3 className="mt-2 font-heading text-2xl font-bold text-slate-950 dark:text-white">
                    Marges & Trésorerie
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Consultez vos ventes depuis chez vous, votre smartphone ou en voyage.
                    Recevez une notification à chaque clôture de caisse avec le total en caisse.
                  </p>
                </div>

                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src="/images/v3/lifestyle-man.jpg"
                    alt="Propriétaire supervisant ses boutiques à distance"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-semibold">
                    📱 Synchronisation Cloud instantanée
                  </div>
                </div>

                <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span>Rôles & Permissions sécurisés</span>
                  <span className="text-[#0052CC] dark:text-sky-400 font-bold">Rapports PDF →</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. MANIFESTE TYPOGRAPHIQUE (CITATION GÉANTE STYLE NORDVPN)
        ───────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-white border-t border-slate-200/80 dark:bg-[#070B14] dark:border-slate-800/80 text-center">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <p className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
              <span className="text-[#0052CC] dark:text-[#388BFF]">Telora</span> vous permet de garder
              le contrôle total de votre boutique. Avec Telora, vous avez l'esprit tranquille
              en sachant que chaque téléphone est tracé, que chaque mouvement de stock est signé
              par vos employées, et que votre trésorerie est protégée au centime près.
            </p>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. SECTION INTERACTIVE : POURQUOI CHOISIR TELORA ? (ONGLETS + APERÇU ÉCRAN)
        ───────────────────────────────────────────────────────────── */}
        <section id="pourquoi" className="py-20 bg-slate-50 border-t border-slate-200/80 dark:bg-[#090E1A] dark:border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC] dark:text-sky-400">
                  Efficacité Opérationnelle
                </span>
                <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-950 dark:text-white">
                  Pourquoi utiliser Telora ?
                </h2>
              </div>

              {/* Bouton Rouge Style Référence */}
              <Link
                href="/inscription"
                className="inline-flex items-center justify-center rounded-full bg-[#E61E2A] hover:bg-[#D31823] text-white text-sm font-bold px-6 py-2.5 shadow-md shadow-red-600/25 transition-all self-start sm:self-auto"
              >
                <span>Obtenir Telora</span>
              </Link>
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-12">
              {/* Onglets / Accordéon à gauche */}
              <div className="space-y-4 lg:col-span-5">
                {ONGLET_POURQUOI_ITEMS.map((item, index) => {
                  const estActif = ongletPourquoi === index;
                  return (
                    <div
                      key={index}
                      onClick={() => setOngletPourquoi(index)}
                      className={cn(
                        "cursor-pointer rounded-2xl border p-6 transition-all",
                        estActif
                          ? "border-[#0052CC] bg-white shadow-xl dark:border-sky-500 dark:bg-[#0F172A]"
                          : "border-slate-200/80 bg-white/50 hover:bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
                            estActif
                              ? "bg-blue-100 text-[#0052CC] dark:bg-sky-500/20 dark:text-sky-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                          )}
                        >
                          {item.badge}
                        </span>
                        <ChevronRight
                          className={cn(
                            "size-5 transition-transform",
                            estActif ? "rotate-90 text-[#0052CC] dark:text-sky-400" : "text-slate-400",
                          )}
                        />
                      </div>
                      <h3 className="mt-3 font-heading text-lg font-bold text-slate-950 dark:text-white">
                        {item.titre}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                      <p className="mt-3 text-xs font-semibold text-[#0052CC] dark:text-sky-400">
                        ✓ {item.detail}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Aperçu écran à droite dans un cadre d'ordinateur élégant */}
              <div className="lg:col-span-7">
                <div className="relative mx-auto overflow-hidden rounded-2xl border border-slate-300 bg-slate-950 p-2 sm:p-4 shadow-2xl dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 px-2 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-red-500" />
                      <span className="size-2.5 rounded-full bg-amber-500" />
                      <span className="size-2.5 rounded-full bg-emerald-500" />
                      <span className="ml-3 font-mono text-[11px] text-slate-200">
                        telora.app/caisse
                      </span>
                    </div>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-emerald-400 font-mono">
                      ● SYNC 60 FPS
                    </span>
                  </div>

                  <div className="relative mt-3 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                    <Image
                      src={srcCapture}
                      alt="Capture de l'interface Telora"
                      width={1200}
                      height={650}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            7. SECTION SOMBRE STATS & IMPACT (STYLE NORDVPN : FOND NOIR AVEC STATS NÉON)
        ───────────────────────────────────────────────────────────── */}
        <section id="statistiques" className="py-24 bg-[#070B14] text-white border-t border-slate-800 relative overflow-hidden">
          {/* Effet néon radial en fond */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-16">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Statistiques & ROI
                </span>
                <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                  Mesurer l'impact réel sur votre commerce
                </h2>
              </div>

              <span className="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-sky-300 border border-blue-500/30">
                Données terrain 2026
              </span>
            </div>

            {/* 3 Blocs Statistiques avec Dégradés Néon (Comme sur la référence NordVPN) */}
            <div className="grid gap-8 md:grid-cols-3">
              {/* Stat 1 : 99.8% */}
              <div className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0F172A]/80 p-8 shadow-2xl backdrop-blur-md">
                <div>
                  {/* Graphique abstrait néon en arc */}
                  <div className="relative mb-6 h-28 w-full flex items-center justify-center">
                    <div className="relative size-24 rounded-full border-4 border-blue-500/20 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-sky-400 border-t-transparent animate-spin duration-3000" />
                      <span className="text-xl font-bold font-mono text-sky-400">99.8%</span>
                    </div>
                  </div>

                  <p className="text-3xl sm:text-4xl font-extrabold font-mono text-white text-center">
                    99.8 %
                  </p>
                  <h3 className="mt-2 text-base font-bold text-slate-200 text-center">
                    Précision d'inventaire
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 text-center leading-relaxed">
                    Dès la première semaine, les écarts inexpliqués entre le stock théorique
                    et le stock physique en vitrine sont éliminés.
                  </p>
                </div>
              </div>

              {/* Stat 2 : 2 minutes (Histogramme néon) */}
              <div className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0F172A]/80 p-8 shadow-2xl backdrop-blur-md">
                <div>
                  {/* 5 barres verticales néon */}
                  <div className="mb-6 h-28 w-full flex items-end justify-center gap-3">
                    <div className="w-3 h-12 bg-sky-600/40 rounded-t" />
                    <div className="w-3 h-16 bg-sky-500/60 rounded-t" />
                    <div className="w-3 h-20 bg-sky-400/80 rounded-t" />
                    <div className="w-3 h-24 bg-sky-400 rounded-t shadow-[0_0_12px_#38bdf8]" />
                    <div className="w-3 h-14 bg-sky-500/50 rounded-t" />
                  </div>

                  <p className="text-3xl sm:text-4xl font-extrabold font-mono text-white text-center">
                    2 minutes
                  </p>
                  <h3 className="mt-2 text-base font-bold text-slate-200 text-center">
                    Clôture de caisse du soir
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 text-center leading-relaxed">
                    Finis les calculs sur feuille de papier jusqu'à 21h. Telora calcule les totaux
                    en espèces, OM et MoMo et alerte en cas d'anomalie.
                  </p>
                </div>
              </div>

              {/* Stat 3 : 0 perte (Radar néon circulaire) */}
              <div className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0F172A]/80 p-8 shadow-2xl backdrop-blur-md">
                <div>
                  {/* Radar circulaire néon */}
                  <div className="relative mb-6 h-28 w-full flex items-center justify-center">
                    <div className="size-20 rounded-full border border-sky-500/30 flex items-center justify-center relative">
                      <div className="size-12 rounded-full border border-sky-400/50 flex items-center justify-center">
                        <div className="size-4 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                      </div>
                      <div className="absolute top-1 right-2 size-2 rounded-full bg-red-500 animate-ping" />
                    </div>
                  </div>

                  <p className="text-3xl sm:text-4xl font-extrabold font-mono text-white text-center">
                    0 perte
                  </p>
                  <h3 className="mt-2 text-base font-bold text-slate-200 text-center">
                    Appareils disparus non tracés
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 text-center leading-relaxed">
                    Chaque téléphone étant nominativement signé par l'employé à l'arrivage
                    et au départ, le vol interne devient immédiatement identifiable.
                  </p>
                </div>
              </div>
            </div>

            {/* Bannière radar dans le bloc noir (Style Référence) */}
            <div className="mt-14 rounded-3xl border border-white/15 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl text-left">
                <span className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  Multi-boutiques Cloud
                </span>
                <h3 className="mt-3 font-heading text-2xl sm:text-3xl font-extrabold text-white">
                  Contrôlez vos magasins où que vous soyez en direct
                </h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Consultez les flux d'entrées et de sorties d'appareils, la caisse en temps réel
                  et recevez un rapport quotidien automatisé par email ou WhatsApp.
                </p>
              </div>

              {/* Bouton Rouge Référence */}
              <Link
                href="/inscription"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#E61E2A] hover:bg-[#D31823] text-white text-sm font-bold px-8 py-3.5 shadow-xl shadow-red-600/30 transition-all hover:scale-[1.02]"
              >
                <span>Découvrir le Cloud</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            8. SECTION AVIS CLIENTS & PREUVE SOCIALE (STYLE NORDVPN)
        ───────────────────────────────────────────────────────────── */}
        <section id="avis" className="py-20 bg-white border-t border-slate-200/80 dark:bg-[#070B14] dark:border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC] dark:text-sky-400">
                Rejoignez les experts
              </span>
              <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-950 dark:text-white">
                Rejoignez les gérants de boutiques qui font la différence
              </h2>
            </div>

            {/* Grille Badges & Avis Référence */}
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {/* Bloc 1 Bleu : Trustpilot / Note forte */}
              <div className="rounded-3xl bg-[#0052CC] p-8 text-white shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-300 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-5 fill-amber-300" />
                    ))}
                  </div>
                  <h3 className="font-heading text-3xl font-extrabold text-white">4.9 / 5</h3>
                  <p className="text-xs text-blue-100 font-medium mt-1">Score moyen sur 350+ avis vérifiés</p>
                  <p className="mt-6 text-sm text-blue-100 leading-relaxed italic">
                    « 98% des propriétaires de magasins de téléphones déclarent avoir rentabilisé
                    leur abonnement Telora dès le premier mois grâce à l'élimination des pertes. »
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/20 text-xs font-bold text-white flex items-center justify-between">
                  <span>Enquête commerçants 2026</span>
                  <span>✓ Vérifié</span>
                </div>
              </div>

              {/* Bloc 2 : Avis Fatou Kouamé */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                    « Avant Telora, nous comptions les iPhones par quantité sur un cahier. Les boîtes
                    disparaissaient sans qu'on puisse savoir qui les avait prises. Maintenant, chaque
                    téléphone est scanné à l'arrivage : 0 perte en 6 mois. »
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-slate-300 dark:border-slate-700">
                    <Image
                      src="/images/v2/portrait-fatou.jpg"
                      alt="Fatou Kouamé"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Fatou Kouamé</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Gérante 2 boutiques • Abidjan 🇨🇮</p>
                  </div>
                </div>
              </div>

              {/* Bloc 3 : Avis Marc Djoumessi */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                    « L'application de caisse PC imprime le ticket thermique en moins d'une seconde sans
                    bloquer l'ordinateur. Le numéro IMEI est directement inscrit sur la facture, ce qui
                    élimine les faux litiges de garantie. »
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-slate-300 dark:border-slate-700">
                    <Image
                      src="/images/v2/portrait-marc.jpg"
                      alt="Marc Djoumessi"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Marc Djoumessi</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Responsable Ventes & SAV • Douala 🇨🇲</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            9. BARRE ÉCOSYSTÈME MATÉRIEL (STYLE NORDVPN : "POUR TOUS VOS APPAREILS")
        ───────────────────────────────────────────────────────────── */}
        <section id="telechargements" className="py-16 bg-slate-100 border-t border-slate-200/80 dark:bg-[#0B1120] dark:border-slate-800/80 text-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              Une solution compatible avec tout votre matériel de caisse
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Installez l'application sur votre ordinateur de comptoir ou utilisez-la sur n'importe quel navigateur.
            </p>

            {/* Rangée d'icônes épurées - Style Photo 1 écosystème Telora */}
            <BarreEcosysteme />

            {/* Téléchargements rapides */}
            <div className="mt-8 flex justify-center gap-3">
              <Button
                onClick={() =>
                  declencherTelechargement(
                    TELECHARGEMENTS[osDetecte].versions[0],
                    osDetecte,
                  )
                }
                className="rounded-full bg-[#0052CC] hover:bg-[#0047B3] text-white px-6 font-bold"
              >
                <Download className="mr-2 size-4" />
                <span>Télécharger pour {TELECHARGEMENTS[osDetecte].nom}</span>
              </Button>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            10. GRANDE BANNIÈRE CTA BAS (STYLE NORDVPN : FOND BLEU AVEC L'AMBASSADEUR)
        ───────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-white dark:bg-[#070B14]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0052CC] via-[#0D62E0] to-[#1E40AF] p-8 sm:p-14 text-white shadow-2xl">
              <div className="grid items-center gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8 text-left">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Offre Spéciale de Lancement
                  </span>
                  <h2 className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                    Économisez jusqu'à 2 mois et profitez de 30 jours d'essai offerts
                  </h2>
                  <p className="mt-3 text-base text-blue-100 max-w-xl">
                    Prenez le contrôle de vos stocks, arrêtez les disparitions de smartphones
                    et gagnez un temps précieux lors de chaque clôture de caisse.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Link
                      href="/inscription"
                      className="inline-flex items-center justify-center rounded-full bg-[#E61E2A] hover:bg-[#D31823] text-white text-base font-bold px-8 py-4 shadow-xl shadow-red-900/40 transition-all hover:scale-[1.02]"
                    >
                      <span>Obtenir Telora maintenant</span>
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </div>
                  <p className="mt-3 text-xs text-blue-200">
                    Sans carte bancaire • Configuration en 2 minutes • Annulation libre
                  </p>
                </div>

                <div className="hidden lg:block lg:col-span-4 relative h-64 w-full">
                  <Image
                    src="/images/v3/ambassador-hero.jpg"
                    alt="Telora ambassadeur"
                    fill
                    className="object-cover rounded-2xl shadow-xl border-2 border-white/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            11. SECTION TARIFS (TABLEAU COMPARATIF COMPLET)
        ───────────────────────────────────────────────────────────── */}
        <section id="tarifs" className="border-t border-slate-200/80 py-20 bg-slate-50 dark:bg-[#090E1A] dark:border-slate-800/80 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC] dark:text-sky-400">
                Tarification Simple
              </span>
              <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-950 dark:text-white">
                Des tarifs clairs adaptés à votre boutique
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                Commencez avec 30 jours d'essai gratuit sur le plan Premium complet.
              </p>

              {/* Bascules : Mensuel / Annuel & XAF / USD */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <button
                    onClick={() => setPeriodeFacturation("mensuel")}
                    className={cn(
                      "rounded-lg px-4 py-2 text-xs font-bold transition-all",
                      periodeFacturation === "mensuel"
                        ? "bg-[#0052CC] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white",
                    )}
                  >
                    Facturation mensuelle
                  </button>
                  <button
                    onClick={() => setPeriodeFacturation("annuel")}
                    className={cn(
                      "rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5",
                      periodeFacturation === "annuel"
                        ? "bg-[#0052CC] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white",
                    )}
                  >
                    <span>Facturation annuelle</span>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 text-[10px] font-bold">
                      -17% (2 mois offerts)
                    </span>
                  </button>
                </div>

                <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <button
                    onClick={() => setDeviseTarif("XAF")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                      deviseTarif === "XAF"
                        ? "bg-[#0052CC] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white",
                    )}
                  >
                    FCFA (XAF)
                  </button>
                  <button
                    onClick={() => setDeviseTarif("USD")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                      deviseTarif === "USD"
                        ? "bg-[#0052CC] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white",
                    )}
                  >
                    $ USD
                  </button>
                </div>
              </div>
            </div>

            {/* Tableau comparatif */}
            <div className="mt-12 overflow-x-auto pb-4">
              <div className="min-w-[760px] rounded-2xl border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-[#0F172A] overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
                      <th className="p-5 w-1/4 align-bottom">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Critères & Capacités
                        </span>
                      </th>

                      {/* Gratuit 30 jours */}
                      <th className="p-5 w-1/4 border-l border-slate-200 dark:border-slate-800 align-top">
                        <div className="flex flex-col">
                          <span className="font-heading text-lg font-bold text-slate-950 dark:text-white">
                            Essai Gratuit
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5">30 jours • Sans frais</span>
                          <div className="mt-3">
                            <span className="font-mono text-2xl font-extrabold text-slate-950 dark:text-white">
                              0 {deviseTarif === "XAF" ? "FCFA" : "$"}
                            </span>
                            <span className="text-xs text-slate-500"> / 30 jours</span>
                          </div>
                          <span className="mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ Accès Premium inclus
                          </span>
                        </div>
                      </th>

                      {/* Standard */}
                      <th className="p-5 w-1/4 border-l border-slate-200 dark:border-slate-800 align-top">
                        <div className="flex flex-col">
                          <span className="font-heading text-lg font-bold text-slate-950 dark:text-white">
                            Standard
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5">1 seule boutique</span>
                          <div className="mt-3">
                            <span className="font-mono text-2xl font-extrabold text-slate-950 dark:text-white">
                              {deviseTarif === "XAF"
                                ? periodeFacturation === "mensuel"
                                  ? "10 000"
                                  : "8 333"
                                : periodeFacturation === "mensuel"
                                ? "17"
                                : "13"}
                              {" "}{deviseTarif === "XAF" ? "FCFA" : "$"}
                            </span>
                            <span className="text-xs text-slate-500"> / mois</span>
                          </div>
                        </div>
                      </th>

                      {/* Premium */}
                      <th className="relative p-5 w-1/4 border-l border-slate-200 bg-blue-50/40 dark:border-slate-800 dark:bg-blue-950/20 align-top">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#E61E2A]" />
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-heading text-lg font-bold text-slate-950 dark:text-white">
                              Premium
                            </span>
                            <span className="rounded-full bg-[#E61E2A] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                              Populaire
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 mt-0.5">Multi-boutiques illimité</span>
                          <div className="mt-3">
                            <span className="font-mono text-2xl font-extrabold text-slate-950 dark:text-white">
                              {deviseTarif === "XAF"
                                ? periodeFacturation === "mensuel"
                                  ? "25 000"
                                  : "20 833"
                                : periodeFacturation === "mensuel"
                                ? "42"
                                : "33"}
                              {" "}{deviseTarif === "XAF" ? "FCFA" : "$"}
                            </span>
                            <span className="text-xs text-slate-500"> / mois</span>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                    <tr>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">Boutiques incluses</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800 font-bold">Illimité (30j)</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800">1 boutique max</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-950/10 font-bold text-[#0052CC] dark:text-sky-400">Illimité</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">Membres d'équipe</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800 font-bold">Illimité (30j)</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800">3 employés</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-950/10 font-bold text-[#0052CC] dark:text-sky-400">Illimité</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">Traçabilité IMEI unitaire</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800 text-emerald-600 font-bold">✓ Inclus</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800 text-emerald-600 font-bold">✓ Inclus</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-950/10 text-emerald-600 font-bold">✓ Inclus</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">Caisse PC Desktop (ESC/POS)</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800 text-emerald-600 font-bold">✓ Inclus</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800 text-emerald-600 font-bold">✓ Inclus</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-950/10 text-emerald-600 font-bold">✓ Inclus</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">Support & Assistance</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800">Standard</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800">Email</td>
                      <td className="p-4 border-l border-slate-200 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-950/10 font-bold text-[#0052CC] dark:text-sky-400">WhatsApp 7j/7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            12. FAQ ACCORDÉON (STYLE NORDVPN : 2 COLONNES)
        ───────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-20 bg-white border-t border-slate-200/80 dark:bg-[#070B14] dark:border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC] dark:text-sky-400">
                  Questions fréquentes
                </span>
                <h2 className="mt-2 font-heading text-3xl font-extrabold text-slate-950 dark:text-white">
                  Tout ce que vous devez savoir sur Telora
                </h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  Une question sur la mise en place dans votre boutique ? Notre équipe est à votre écoute.
                </p>
                <div className="mt-6">
                  <Link
                    href="/inscription"
                    className="inline-flex items-center text-sm font-bold text-[#0052CC] hover:underline dark:text-sky-400"
                  >
                    <span>Démarrer l'essai sans frais</span>
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-8 divide-y divide-slate-200 dark:divide-slate-800">
                {FAQS.map((faq, index) => {
                  const estOuvert = faqOuverte === index;
                  return (
                    <div key={index} className="py-4">
                      <button
                        onClick={() => setFaqOuverte(estOuvert ? null : index)}
                        className="flex w-full items-center justify-between text-left font-semibold text-slate-900 hover:text-[#0052CC] dark:text-white dark:hover:text-sky-400 transition-colors gap-4"
                      >
                        <span className="text-base font-bold">{faq.q}</span>
                        <ChevronDown
                          className={cn(
                            "size-5 shrink-0 text-slate-400 transition-transform duration-200",
                            estOuvert && "rotate-180 text-[#0052CC] dark:text-sky-400",
                          )}
                        />
                      </button>
                      {estOuvert && (
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed pr-4">
                          {faq.r}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          13. FOOTER COMPLET SOMBRE (STYLE NORDVPN)
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-[#070B14] py-16 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <IconeTelora size={28} />
                <span className="font-heading font-bold text-white text-base">
                  Telora
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                La référence de gestion de stock et de caisse pour les magasins
                de téléphones, smartphones et accessoires avec traçabilité unitaire IMEI.
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="size-4 text-emerald-400" /> Données chiffrées
                </span>
                <span>•</span>
                <span>Serveurs Cloud Haute Disponibilité</span>
              </div>
            </div>

            <div>
              <p className="font-bold text-white text-sm mb-3">Produit</p>
              <ul className="space-y-2">
                <li><a href="#fonctionnalites" className="hover:text-white">Traçabilité IMEI</a></li>
                <li><a href="#pourquoi" className="hover:text-white">Caisse Desktop POS</a></li>
                <li><a href="#telechargements" className="hover:text-white">Téléchargements</a></li>
                <li><Link href="/inscription" className="hover:text-white">Essai 30 jours</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-white text-sm mb-3">Ressources</p>
              <ul className="space-y-2">
                <li><Link href="/connexion" className="hover:text-white">Espace Connexion</Link></li>
                <li><Link href="/faq" className="hover:text-white">Aide & Support</Link></li>
                <li><Link href="/securite" className="hover:text-white">Sécurité & 2FA</Link></li>
                <li><Link href="/etudes-de-cas" className="hover:text-white">Témoignages</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-white text-sm mb-3">Légal</p>
              <ul className="space-y-2">
                <li><Link href="/cgu" className="hover:text-white">Conditions (CGU)</Link></li>
                <li><Link href="/confidentialite" className="hover:text-white">Confidentialité</Link></li>
                <li><Link href="/mentions-legales" className="hover:text-white">Mentions Légales</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Gestion des Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row text-xs">
            <p>© {new Date().getFullYear()} Telora. Tous droits réservés.</p>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Orange Money</span>
              <span>•</span>
              <span>MTN MoMo</span>
              <span>•</span>
              <span>Cartes Visa / Mastercard</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  Cookie,
  HelpCircle,
  KeyRound,
  Layers,
  PhoneCall,
  RotateCcw,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { PiedDePageLegal } from "@/components/layout/pied-de-page-legal";
import { IconeTelora } from "@/components/ui/logo-telora";
import { BasculeLangue } from "@/components/bascule-langue";
import { BasculeTheme } from "@/components/bascule-theme";

type CategorieFaq = "toutes" | "general" | "stock" | "abonnement" | "securite" | "cookies";

type QuestionFaq = {
  id: string;
  categorie: CategorieFaq;
  icone: React.ElementType;
  questionFr: string;
  questionEn: string;
  reponseFr: React.ReactNode;
  reponseEn: React.ReactNode;
};

export default function PageFaq() {
  const router = useRouter();
  const { utilisateur } = useAuth();
  const { t, lang } = useI18n();

  const [recherche, setRecherche] = useState("");
  const [categorieActive, setCategorieActive] = useState<CategorieFaq>("toutes");
  const [questionsOuvertes, setQuestionsOuvertes] = useState<Record<string, boolean>>({
    "cookies-1": true,
  });

  // Prise en charge des ancres directes (ex: #cookies)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const ancre = window.location.hash.replace("#", "");
      if (ancre === "cookies") {
        setCategorieActive("cookies");
        setQuestionsOuvertes((p) => ({ ...p, "cookies-1": true, "cookies-2": true }));
      }
    }
  }, []);

  const basculerQuestion = (id: string) => {
    setQuestionsOuvertes((p) => ({ ...p, [id]: !p[id] }));
  };

  const questions: QuestionFaq[] = useMemo(
    () => [
      // --- COOKIES & DONNÉES LOCALES ---
      {
        id: "cookies-1",
        categorie: "cookies",
        icone: Cookie,
        questionFr: "Quels cookies et données locales sont utilisés par l'application ?",
        questionEn: "What cookies and local data are used by the application?",
        reponseFr: (
          <div className="space-y-3 text-sm leading-relaxed text-neutral-300">
            <p>
              Telora n'utilise aucun cookie publicitaire ni aucun traceur tiers de profilage.
            </p>
            <p>Seules les données techniques nécessaires au bon fonctionnement sont conservées sur votre navigateur :</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-400">
              <li>
                <strong className="text-neutral-200">Jeton de session (<code>gestion-stock-token</code>)</strong> :
                Maintient votre connexion sécurisée avec le serveur.
              </li>
              <li>
                <strong className="text-neutral-200">Point de vente (<code>gestion-stock-boutique</code>)</strong> :
                Mémorise la boutique sur laquelle vous travaillez.
              </li>
              <li>
                <strong className="text-neutral-200">Langue (<code>gestion-stock-langue</code>)</strong> :
                Conserve votre choix de langue (Français ou Anglais).
              </li>
              <li>
                <strong className="text-neutral-200">Thème (<code>theme</code>)</strong> :
                Sauvegarde votre préférence d'affichage (sombre ou clair).
              </li>
              <li>
                <strong className="text-neutral-200">Consentement (<code>gestion-stock-cookies-consent</code>)</strong> :
                Enregistre que vous avez validé l'information sur les cookies.
              </li>
            </ul>
          </div>
        ),
        reponseEn: (
          <div className="space-y-3 text-sm leading-relaxed text-neutral-300">
            <p>
              Telora does not use any advertising cookies or third-party tracking scripts.
            </p>
            <p>Only essential technical data is saved locally on your browser:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-400">
              <li>
                <strong className="text-neutral-200">Session token (<code>gestion-stock-token</code>)</strong>:
                Keeps your connection secure with the API.
              </li>
              <li>
                <strong className="text-neutral-200">Active store (<code>gestion-stock-boutique</code>)</strong>:
                Remembers the store location you are currently working on.
              </li>
              <li>
                <strong className="text-neutral-200">Language (<code>gestion-stock-langue</code>)</strong>:
                Saves your language preference (French or English).
              </li>
              <li>
                <strong className="text-neutral-200">Theme (<code>theme</code>)</strong>:
                Saves your display preference (dark or light mode).
              </li>
              <li>
                <strong className="text-neutral-200">Consent (<code>gestion-stock-cookies-consent</code>)</strong>:
                Stores your acknowledgment of the cookie notice.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "cookies-2",
        categorie: "cookies",
        icone: ShieldCheck,
        questionFr: "Comment supprimer ces données de mon navigateur ?",
        questionEn: "How do I remove this data from my browser?",
        reponseFr: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              Pour supprimer votre session, cliquez sur <strong>« Se déconnecter »</strong> dans le menu de votre compte.
              Vous pouvez également effacer les données locales à tout moment dans les paramètres de confidentialité de votre navigateur.
            </p>
          </div>
        ),
        reponseEn: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              To clear your session, click <strong>"Sign out"</strong> in your account menu.
              You can also delete local site data anytime through your browser privacy settings.
            </p>
          </div>
        ),
      },

      // --- STOCK & SCAN IMEI ---
      {
        id: "stock-1",
        categorie: "stock",
        icone: Smartphone,
        questionFr: "Comment fonctionne l'identification automatique par scan IMEI ou code-barres ?",
        questionEn: "How does automatic device identification from IMEI or barcode scan work?",
        reponseFr: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              Chaque téléphone dispose d'un identifiant IMEI unique de 15 chiffres. Les 8 premiers chiffres correspondent au code TAC
              délivré par l'organisme constructeur mondial.
            </p>
            <p>
              Lors de l'entrée en stock, dès que vous scannez le code-barres ou saisissez l'IMEI :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-400">
              <li>L'application identifie la marque, la gamme commerciale et le modèle.</li>
              <li>Si l'appareil existe déjà dans votre catalogue, il est automatiquement sélectionné.</li>
              <li>S'il s'agit d'un nouveau modèle, un bouton vous propose de l'ajouter instantanément à votre catalogue.</li>
            </ul>
          </div>
        ),
        reponseEn: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              Every mobile phone has a unique 15-digit IMEI number. The first 8 digits represent the TAC code
              assigned by the international manufacturer registry.
            </p>
            <p>
              When entering stock, as soon as you scan the barcode or enter the IMEI:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-400">
              <li>The system recognizes the brand, range, and model name.</li>
              <li>If the model exists in your catalog, it is selected automatically.</li>
              <li>If it is a new model, an action button lets you add it to your catalog in one click.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "stock-2",
        categorie: "stock",
        icone: Smartphone,
        questionFr: "Pourquoi un numéro IMEI peut-il être signalé comme invalide ?",
        questionEn: "Why might an IMEI number be reported as invalid?",
        reponseFr: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              Les numéros IMEI obéissent à la formule de contrôle mathématique <strong>Luhn</strong> (modulo 10).
              Le 15ᵉ chiffre permet de valider l'intégrité de la série.
            </p>
            <p className="text-xs text-neutral-400">
              Si un chiffre a été mal lu par le lecteur code-barres ou mal saisi, l'application bloque l'enregistrement pour éviter
              d'intégrer un numéro erroné qui perturberait le suivi ou la vente future.
            </p>
          </div>
        ),
        reponseEn: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              IMEI numbers follow the international <strong>Luhn checksum</strong> algorithm (modulo 10).
              The 15th digit validates the sequence.
            </p>
            <p className="text-xs text-neutral-400">
              If a digit was truncated or mistyped, the application prevents saving to protect your records
              from corrupted numbers that would complicate future transfers and sales.
            </p>
          </div>
        ),
      },

      // --- ABONNEMENT & FACTURATION ---
      {
        id: "abo-1",
        categorie: "abonnement",
        icone: Layers,
        questionFr: "Quelles sont les différences entre l'offre Standard et l'offre Premium ?",
        questionEn: "What are the differences between the Standard and Premium tiers?",
        reponseFr: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              L'offre <strong>Standard</strong> comprend toute la gestion courante : parcs de téléphones, entrées/sorties de stock,
              historique complet des mouvements, gestion des équipes et support multi-boutiques.
            </p>
            <p>
              L'offre <strong>Premium</strong> débloque en plus l'identification automatique ultra-rapide par scan IMEI/code-barres,
              l'importation automatique en un clic de nouveaux modèles dans votre catalogue, et l'accès prioritaire aux futures évolutions.
            </p>
          </div>
        ),
        reponseEn: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              The <strong>Standard</strong> plan covers full day-to-day operations: device inventory, stock arrivals and sales,
              complete movement history, team permissions, and multi-store management.
            </p>
            <p>
              The <strong>Premium</strong> plan adds automatic device identification via barcode/IMEI scanning,
              one-click catalog imports for new devices, and priority access to upcoming platform tools.
            </p>
          </div>
        ),
      },
      {
        id: "abo-2",
        categorie: "abonnement",
        icone: Layers,
        questionFr: "Comment souscrire ou passer à la formule Premium ?",
        questionEn: "How can I subscribe or upgrade to the Premium plan?",
        reponseFr: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              L'activation de la formule Premium est gérée par l'administrateur de votre plateforme.
              Contactez votre responsable commercial ou le support pour faire évoluer votre compte.
            </p>
          </div>
        ),
        reponseEn: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              Premium access is managed through platform administration.
              Contact your account manager or technical support to upgrade your stores.
            </p>
          </div>
        ),
      },

      // --- SÉCURITÉ & ACCÈS ---
      {
        id: "sec-1",
        categorie: "securite",
        icone: KeyRound,
        questionFr: "Comment configurer la double authentification (2FA) ?",
        questionEn: "How do I configure two-factor authentication (2FA)?",
        reponseFr: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              Dans la page <strong>« Mon compte »</strong>, accédez à la section <strong>Double authentification</strong>.
              Scannez le QR code affiché avec votre application d'authentification habituelle (Google Authenticator, Microsoft Authenticator, etc.),
              puis confirmez avec le code à 6 chiffres.
            </p>
            <p className="text-xs text-neutral-400">
              Des codes de secours à usage unique sont générés : conservez-les dans un endroit sûr en cas d'indisponibilité de votre téléphone.
            </p>
          </div>
        ),
        reponseEn: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              From your <strong>"My Account"</strong> page, navigate to the <strong>Two-factor authentication</strong> section.
              Scan the QR code with your mobile authenticator app (Google Authenticator, Microsoft Authenticator, etc.),
              then confirm with the 6-digit code.
            </p>
            <p className="text-xs text-neutral-400">
              Backup codes are generated during setup: keep them in a safe place in case your device is unavailable.
            </p>
          </div>
        ),
      },

      // --- GÉNÉRAL ---
      {
        id: "gen-1",
        categorie: "general",
        icone: HelpCircle,
        questionFr: "Comment fonctionne la gestion multi-boutiques ?",
        questionEn: "How does multi-store management work?",
        reponseFr: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              Le propriétaire peut rattacher ses collaborateurs à des boutiques spécifiques. En haut de l'interface, un sélecteur
              permet d'isoler les données d'un point de vente ou de consulter une synthèse globale de l'ensemble des stocks.
            </p>
          </div>
        ),
        reponseEn: (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-300">
            <p>
              The business owner can assign team members to specific store branches. At the top of the interface,
              a dropdown lets you view a single store location or consolidate metrics across all branches.
            </p>
          </div>
        ),
      },
    ],
    [],
  );

  // Filtrage selon la recherche et la catégorie
  const questionsFiltrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();

    return questions.filter((item) => {
      const correspondCategorie = categorieActive === "toutes" || item.categorie === categorieActive;
      if (!correspondCategorie) return false;

      if (!q) return true;

      const texteFr = (item.questionFr + " " + item.categorie).toLowerCase();
      const texteEn = (item.questionEn + " " + item.categorie).toLowerCase();

      return texteFr.includes(q) || texteEn.includes(q);
    });
  }, [questions, recherche, categorieActive]);

  const categories: { id: CategorieFaq; libelle: string }[] = [
    { id: "toutes", libelle: t("faq.toutesLesCategories") },
    { id: "stock", libelle: t("faq.categories.stock") },
    { id: "abonnement", libelle: t("faq.categories.abonnement") },
    { id: "cookies", libelle: t("faq.categories.cookies") },
    { id: "securite", libelle: t("faq.categories.securite") },
    { id: "general", libelle: t("faq.categories.general") },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-white selection:bg-neutral-800">
      {/* En-tête sobre avec bouton retour */}
      <header className="relative z-20 border-b border-white/5 bg-[#121212]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push(utilisateur ? "/mon-compte" : "/connexion");
              }
            }}
            className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("commun.retour")}</span>
          </button>

          <div className="flex items-center gap-2">
            <IconeTelora size={22} />
            <span className="text-xs font-bold tracking-wider text-white">TELORA</span>
          </div>

          <div className="flex items-center gap-1">
                      <BasculeLangue />
                      <BasculeTheme />
                    </div>
        </div>
      </header>

      {/* Hero Section style Spotify Support avec lueur d'ambiance */}
      <section className="relative overflow-hidden pt-16 pb-14 px-4 sm:px-6">
        {/* Lueur d'ambiance subtile en arrière-plan */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-r from-emerald-600/15 via-teal-500/10 to-blue-600/15 blur-[120px] pointer-events-none rounded-full"
        />

        <div className="relative z-10 mx-auto max-w-2xl text-center space-y-8">
          {/* Titre imposant en typographie audacieuse sans fioriture */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t("faq.titreLigne1")}
            </h1>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t("faq.titreLigne2")}
            </h2>
          </div>

          {/* Boîte de recherche style Spotify Support */}
          <div className="relative mx-auto max-w-xl text-left">
            <div className="rounded-2xl bg-[#1e1e1e]/90 border border-white/10 p-4 shadow-2xl transition-all focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/20">
              <div className="flex items-start gap-3">
                <Search className="h-5 w-5 text-neutral-400 mt-1 shrink-0" />
                <input
                  type="text"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder={t("faq.rechercherPlaceholder")}
                  className="w-full bg-transparent text-white placeholder:text-neutral-400 text-base sm:text-lg outline-none border-none focus:ring-0 p-0"
                />
              </div>

              {/* Bouton "Demander" aligné en bas à droite de la boîte */}
              <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/5">
                {recherche ? (
                  <button
                    onClick={() => setRecherche("")}
                    className="text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    {t("faq.reinitialiserRecherche")}
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  className="rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 text-xs sm:text-sm font-medium px-4 py-1.5 transition-colors"
                >
                  {t("faq.boutonDemander")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation par catégories style Spotify */}
      <main className="relative z-10 mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-2 pb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategorieActive(cat.id)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                categorieActive === cat.id
                  ? "bg-white text-black font-semibold shadow"
                  : "bg-[#1e1e1e] text-neutral-300 hover:bg-[#282828] hover:text-white border border-white/5"
              }`}
            >
              {cat.libelle}
            </button>
          ))}
        </div>

        {/* Liste des questions / réponses */}
        {questionsFiltrees.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm text-neutral-400">{t("faq.aucunResultat")}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRecherche("");
                setCategorieActive("toutes");
              }}
              className="text-xs bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {t("faq.reinitialiserRecherche")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {questionsFiltrees.map((item) => {
              const estOuverte = Boolean(questionsOuvertes[item.id]);

              return (
                <div
                  key={item.id}
                  id={item.id.startsWith("cookies") ? "cookies" : undefined}
                  className={`rounded-2xl transition-all border ${
                    estOuverte
                      ? "border-white/15 bg-[#1e1e1e]"
                      : "border-white/5 bg-[#181818] hover:border-white/10 hover:bg-[#1a1a1a]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => basculerQuestion(item.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                    aria-expanded={estOuverte}
                  >
                    <span className="text-sm sm:text-base font-semibold tracking-tight text-white">
                      {lang === "en" ? item.questionEn : item.questionFr}
                    </span>

                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 ${
                        estOuverte ? "rotate-180 text-white" : ""
                      }`}
                    />
                  </button>

                  {estOuverte && (
                    <div className="px-5 pb-5 pt-1 text-neutral-300 animate-in fade-in-50 duration-200">
                      <div className="border-t border-white/5 pt-4">
                        {lang === "en" ? item.reponseEn : item.reponseFr}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Section Contact & Assistance sobre */}
        <div className="mt-16 text-center border-t border-white/5 pt-8 pb-12 space-y-2">
          <h3 className="text-base font-semibold text-white flex items-center justify-center gap-2">
            <PhoneCall className="h-4 w-4 text-neutral-400" />
            <span>{t("faq.besoinAide")}</span>
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            {t("faq.contactSupport")}
          </p>
        </div>
      </main>

      <PiedDePageLegal complet={true} className="mt-auto" />
    </div>
  );
}

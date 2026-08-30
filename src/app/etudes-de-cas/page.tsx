"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconeTelora } from "@/components/ui/logo-telora";
import { FilAriane } from "@/components/layout/fil-ariane";
import { PromesseDelai } from "@/components/marketing/promesse-delai";
import { CtaSection } from "@/components/marketing/cta-section";
import { CtaMobile } from "@/components/marketing/cta-mobile";
import { PiedDePageLegal } from "@/components/layout/pied-de-page-legal";
import { BasculeLangue } from "@/components/bascule-langue";
import { BasculeTheme } from "@/components/bascule-theme";
import { useI18n } from "@/lib/i18n";

export default function PageEtudesDeCas() {
  const { lang } = useI18n();

  const etudes =
    lang === "en"
      ? [
          {
            id: "ivoire-phone",
            enseigne: "Ivoire Phone",
            ville: "Abidjan, Côte d'Ivoire",
            pointsDeVente: "2 shops (Treichville & Cocody)",
            titre: "“No more staff disputes over who sold which phone”",
            citation:
              "In our two shops, we used to write down sales in physical paper books. At month-end, a device was often missing, or someone mixed up a 128GB with a 256GB phone. Staff members blamed each other. Ever since every IMEI is scanned upon arrival and checked out at point of sale with the seller's name, there is zero ambiguity. Trust is back and I no longer worry when checking stock.",
            gerant: "Mamadou K. — Founder & Shop Owner",
            benefices: [
              "Every sales rep held accountable for their device",
              "Inventory reconciled without closing the shop",
              "Live remote overview without having to be on site",
            ],
            tags: ["Multi-stores", "Team accountability", "IMEI tracking"],
          },
          {
            id: "smarttech-mobile",
            enseigne: "SmartTech Mobile",
            ville: "Douala & Yaoundé, Cameroon",
            pointsDeVente: "3 shops",
            titre: "“I no longer spend my evenings recounting paper notebooks”",
            citation:
              "Before, I had to wait until 8:30 PM for shop managers to close, snap pictures of handwritten pages, and try to calculate cash totals along with Mobile Money receipts. There was always a calculation error or a misplaced slip. With Telora, everything tallies automatically. By 8:05 PM, managers leave on time and I have clear numbers right on my smartphone.",
            gerant: "Diane F. — Retail Network Director",
            benefices: [
              "End of calculation and handwriting mistakes",
              "Clean separation between cash and mobile payments",
              "Saved over an hour every single evening",
            ],
            tags: ["Point of sale", "Mobile Money & Cash", "Remote tracking"],
          },
          {
            id: "gsm-express",
            enseigne: "GSM Express",
            ville: "Paris & Brazzaville",
            pointsDeVente: "Retail & Repair Center",
            titre: "“We look up any sold device in 3 seconds for warranty & support”",
            citation:
              "With pre-owned and new smartphones, customers often come back asking about warranty or receipts. We used to spend 15 minutes digging through binder files. Now, we just scan the IMEI from the box or settings screen: purchase date, invoice, sold price, and warranty status appear instantly. Customers immediately appreciate the professionalism.",
            gerant: "Christian M. — Store Manager",
            benefices: [
              "No more searching through piles of receipts",
              "Prevents disputes on expired warranty claims",
              "Transparent, reassuring experience for customers",
            ],
            tags: ["Customer Support", "Warranty lookup", "New & Pre-owned"],
          },
        ]
      : [
          {
            id: "ivoire-phone",
            enseigne: "Ivoire Phone",
            ville: "Abidjan, Côte d'Ivoire",
            pointsDeVente: "2 boutiques (Treichville & Cocody)",
            titre: "« Fini les disputes d'équipe pour savoir qui a vendu quel téléphone »",
            citation:
              "Dans nos deux boutiques, nous tenions un registre manuscrit. À la fin du mois, il arrivait qu'il manque un appareil ou qu'on confonde un modèle 128 Go et un 256 Go. Les vendeurs se renvoyaient la faute. Depuis que chaque IMEI est enregistré à la livraison et déstocké à la vente avec le nom de la vendeuse, il n'y a plus la moindre contestation. L'ambiance est saine et je n'ai plus la boule au ventre quand je fais l'inventaire.",
            gerant: "Mamadou K. — Fondateur & Propriétaire",
            benefices: [
              "Chaque vendeur responsabilisé sur ses appareils",
              "Inventaire exact sans devoir bloquer la boutique",
              "Contrôle à distance sans être présent sur place",
            ],
            tags: ["Multi-boutiques", "Gestion d'équipe", "Suivi IMEI unitaire"],
          },
          {
            id: "smarttech-mobile",
            enseigne: "SmartTech Mobile",
            ville: "Douala & Yaoundé, Cameroun",
            pointsDeVente: "3 boutiques",
            titre: "« Je ne passe plus mes soirées à recompter des carnets de vente »",
            citation:
              "Auparavant, je devais attendre 20h30 que les gérantes finissent de compter la caisse, m'envoient des photos de leurs cahiers et que je recomptabilise le cash et les paiements Orange Money ou MTN. Il y avait toujours des erreurs d'arrondi ou des ventes mal notées. Avec Telora, le pointage est automatique. À 20h05, les gérantes ont fini leur journée et j'ai le bilan exact sur mon téléphone portable.",
            gerant: "Diane F. — Gérante d'enseigne",
            benefices: [
              "Fin des erreurs de calcul et d'écriture manuscrite",
              "Suivi séparé du cash et des paiements mobiles",
              "Gain de plus d'une heure de travail chaque soir",
            ],
            tags: ["Caisse & Comptoir", "Mobile Money & Espèces", "Gestion à distance"],
          },
          {
            id: "gsm-express",
            enseigne: "GSM Express",
            ville: "Paris & Brazzaville",
            pointsDeVente: "Boutique & Atelier SAV",
            titre: "« On identifie n'importe quel téléphone vendu en 3 secondes pour le SAV »",
            citation:
              "Dans le reconditionné et la téléphonie, les clients reviennent souvent pour une question de garantie ou un accessoire. Avant, il fallait fouiller dans des classeurs de factures papier. Maintenant, on scanne l'IMEI sur la boîte ou dans les réglages du smartphone, et tout l'historique sort : la date exacte d'achat, le prix convenu, la boutique d'origine et la garantie restante. Nos clients voient tout de suite qu'on est sérieux.",
            gerant: "Christian M. — Responsable de magasin",
            benefices: [
              "Fini les recherches interminables dans les classeurs",
              "Évite les abus sur les retours sous garantie",
              "Expérience client transparente et rassurante",
            ],
            tags: ["Service après-vente", "Suivi des garanties", "Neuf & Reconditionné"],
          },
        ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      {/* En-tête avec navigation, changement de langue et de thème */}
      <header className="border-b border-border/40 py-3.5 px-4 sm:px-6 sticky top-0 z-30 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <IconeTelora size={28} />
            <span className="font-heading text-sm font-bold tracking-tight">
              TELORA
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <BasculeLangue />
            <BasculeTheme />
            <div className="hidden sm:flex items-center gap-2 ml-2 border-l border-border/60 pl-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                nativeButton={false}
                render={<Link href="/connexion" />}
              >
                {lang === "en" ? "Sign in" : "Se connecter"}
              </Button>
              <Button
                size="sm"
                className="text-xs bg-primary text-primary-foreground font-medium"
                nativeButton={false}
                render={<Link href="/inscription" />}
              >
                {lang === "en" ? "Free trial" : "Essai gratuit"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-14">
        <FilAriane
          elements={[
            {
              label: lang === "en" ? "Case Studies" : "Études de cas",
              actif: true,
            },
          ]}
        />

        {/* Hero Section humaine et ancrée dans le réel */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
            <Store className="h-3.5 w-3.5" />
            <span>
              {lang === "en"
                ? "Real experiences from phone shop owners"
                : "Retours d'expérience concrets de commerçants"}
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {lang === "en"
              ? "How phone shop owners took back control of their inventory"
              : "Comment des gérants de boutiques de téléphonie ont retrouvé leur sérénité"}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {lang === "en"
              ? "Discover how independent retail stores and multi-shop networks ended unexplained device disappearances, empowered their sales teams and saved precious hours every single evening."
              : "Découvrez comment des propriétaires de boutiques indépendantes et de réseaux de magasins ont mis fin aux disparitions inexpliquées d'appareils, responsabilisé leurs équipes et gagné un temps précieux chaque soir."}
          </p>
        </div>

        {/* 4 Piliers concrets du quotidien */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-6 rounded-2xl border border-border/80 bg-card">
          <div className="space-y-1.5 p-3 rounded-xl bg-background/60">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{lang === "en" ? "Zero ambiguity" : "Zéro litige"}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "en"
                ? "Every single phone is linked to the employee who accepted or sold it."
                : "Chaque téléphone est rattaché à l'employé qui l'a réceptionné ou vendu."}
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-background/60">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {lang === "en" ? "Clean cash closing" : "Caisse nette le soir"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "en"
                ? "Cash and mobile money balances tally with sold items without manual calculations."
                : "Le cash et le mobile money correspondent aux ventes sans calculs interminables."}
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-background/60">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
              <ReceiptText className="h-4 w-4 shrink-0" />
              <span>
                {lang === "en" ? "Quick warranty check" : "SAV & Garantie en 2 clics"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "en"
                ? "Lookup sales date, customer receipt and device history in seconds by IMEI."
                : "Retrouvez la facture, la date d'achat et le client en scannant simplement l'IMEI."}
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-background/60">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
              <Smartphone className="h-4 w-4 shrink-0" />
              <span>
                {lang === "en" ? "Live remote view" : "Pilotage à distance"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "en"
                ? "Check your stock and daily sales across all your shops from your phone."
                : "Suivez vos ventes et stocks dans tous vos magasins depuis votre propre smartphone."}
            </p>
          </div>
        </div>

        {/* Liste des histoires et retours d'expérience */}
        <div className="space-y-8">
          {etudes.map((etude) => (
            <article
              key={etude.id}
              className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 hover:border-border transition-colors shadow-xs"
            >
              {/* En-tête de la boutique */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-bold text-base text-foreground">
                      {etude.enseigne}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-xs text-muted-foreground">
                      {etude.ville}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {etude.pointsDeVente}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {etude.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-0.5 rounded-full border border-border/60 bg-muted/40 text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Récit et impact */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                <div className="lg:col-span-2 space-y-3.5">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    {etude.titre}
                  </h2>

                  <blockquote className="border-l-2 border-primary/60 pl-4 text-sm text-foreground/85 leading-relaxed italic bg-muted/20 py-2 rounded-r-md">
                    {etude.citation}
                  </blockquote>

                  <p className="text-xs font-semibold text-muted-foreground">
                    — {etude.gerant}
                  </p>
                </div>

                {/* Ce que cela a apporté */}
                <div className="bg-background/90 border border-border/70 rounded-xl p-5 space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {lang === "en"
                      ? "Direct everyday improvements:"
                      : "Ce que cela a changé au quotidien :"}
                  </h3>
                  <ul className="space-y-2.5">
                    {etude.benefices.map((benefice) => (
                      <li
                        key={benefice}
                        className="flex items-start gap-2 text-xs sm:text-sm text-foreground leading-snug"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{benefice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Engagements concrets */}
        <PromesseDelai />

        {/* Section d'action finale */}
        <CtaSection />
      </main>

      {/* CTA Mobile sticky */}
      <CtaMobile />

      {/* Pied de page officiel */}
      <PiedDePageLegal className="mt-auto" />
    </div>
  );
}

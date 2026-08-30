import Link from "next/link";
import { ArrowLeft, CheckCircle2, TrendingUp, ShieldCheck, Zap, Store, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconeTelora } from "@/components/ui/logo-telora";
import { FilAriane } from "@/components/layout/fil-ariane";
import { PromesseDelai } from "@/components/marketing/promesse-delai";
import { CtaSection } from "@/components/marketing/cta-section";
import { CtaMobile } from "@/components/marketing/cta-mobile";
import { PiedDePageLegal } from "@/components/layout/pied-de-page-legal";

export const metadata = {
  title: "Études de Cas & Retours d'Expérience",
  description: "Découvrez comment les propriétaires de boutiques de téléphonie éliminent les vols et accélèrent leurs ventes grâce à la traçabilité IMEI Telora.",
};

export default function PageEtudesDeCas() {
  const etudes = [
    {
      id: "galaxy-phone",
      enseigne: "Galaxy Phone",
      ville: "Abidjan, Côte d'Ivoire",
      pointsDeVente: "3 magasins",
      titre: "De 3 vols par mois à zéro perte en 6 mois de traçabilité IMEI",
      citation: "Avant Telora, quand un téléphone manquait en vitrine, personne n'était responsable. Depuis que chaque IMEI est scanné à l'arrivée et à la vente, nous n'avons plus eu un seul centime de perte.",
      gerant: "M. Kouamé — Fondateur",
      chiffres: [
        { valeur: "0 perte", label: "sur les 6 derniers mois" },
        { valeur: "-100%", label: "d'écarts d'inventaire" },
        { valeur: "3 boutiques", label: "pilotées depuis son téléphone" },
      ],
      tags: ["Multi-boutiques", "Anti-vol", "Suivi IMEI unitaire"],
    },
    {
      id: "smarttech-mobile",
      enseigne: "SmartTech Mobile",
      ville: "Douala & Yaoundé, Cameroun",
      pointsDeVente: "4 boutiques",
      titre: "Une clôture de caisse passée de 45 minutes à moins de 3 minutes",
      citation: "Chaque soir, mes vendeuses devaient recompter les téléphones et faire les totaux sur des carnets. Avec la caisse Telora, le bilan des ventes et des stocks est instantané et incontestable.",
      gerant: "Mme Fotso — Gérante d'enseigne",
      chiffres: [
        { valeur: "< 3 min", label: "pour la clôture de caisse" },
        { valeur: "+25%", label: "de chiffre d'affaires suivi" },
        { valeur: "100%", label: "des mouvements tracés" },
      ],
      tags: ["Clôture de caisse", "Vente au comptoir", "Multi-utilisateurs"],
    },
    {
      id: "istore-express",
      enseigne: "iStore Express",
      ville: "Paris & Diaspora",
      pointsDeVente: "Boutique & e-commerce",
      titre: "Arrivage de 50 iPhones enregistré en 8 minutes chrono",
      citation: "La reconnaissance automatique du modèle dès le scan de l'IMEI est magique. Plus besoin de taper manuellement 'iPhone 15 Pro 256Go' : la fiche technique se remplit toute seule.",
      gerant: "Alexandre D. — Responsable des achats",
      chiffres: [
        { valeur: "0.4s", label: "par scan d'appareil" },
        { valeur: "x4", label: "plus rapide pour les arrivages" },
        { valeur: "5 000+", label: "IMEI vérifiés sans erreur" },
      ],
      tags: ["Base TAC mondiale", "Import express", "Douchette & Caméra"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      {/* En-tête de navigation */}
      <header className="border-b border-border/40 py-4 px-6 sticky top-0 z-30 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <IconeTelora size={30} />
            <span className="font-heading text-sm font-bold tracking-tight">TELORA</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              nativeButton={false}
              render={<Link href="/connexion" />}
            >
              Se connecter
            </Button>
            <Button
              size="sm"
              className="text-xs bg-primary text-primary-foreground font-semibold"
              nativeButton={false}
              render={<Link href="/inscription" />}
            >
              Essai gratuit
            </Button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-14 space-y-16">
        <FilAriane elements={[{ label: "Études de cas", actif: true }]} />

        {/* Hero Section */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Retours d'expérience concrets</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Comment les commerces de téléphonie éliminent les disparitions de stock
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Découvrez comment des gérants de boutiques indépendantes et de réseaux multi-magasins ont sécurisé leur inventaire, responsabilisé leurs équipes et automatisé leurs encaissements avec <strong>Telora</strong>.
          </p>
        </div>

        {/* Métriques globales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-2xl border border-border/80 bg-card/60">
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-primary">0%</p>
            <p className="text-xs text-muted-foreground">Écarts de stock après 30 jours</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-primary">0.4s</p>
            <p className="text-xs text-muted-foreground">Temps moyen de scan d'un IMEI</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-primary">15 000+</p>
            <p className="text-xs text-muted-foreground">Smartphones tracés au quotidien</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-primary">&lt; 3 min</p>
            <p className="text-xs text-muted-foreground">Pour clôturer la caisse du soir</p>
          </div>
        </div>

        {/* Liste des études de cas détaillées */}
        <div className="space-y-10">
          {etudes.map((etude) => (
            <article
              key={etude.id}
              className="rounded-2xl border border-border/80 bg-card/40 p-6 sm:p-10 space-y-6 hover:border-primary/40 transition-colors shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    <span className="font-bold text-base text-foreground">{etude.enseigne}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-xs text-muted-foreground">{etude.ville}</span>
                  </div>
                  <span className="text-xs text-primary font-medium">{etude.pointsDeVente}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {etude.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-full border border-border/60 bg-background text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {etude.titre}
                  </h2>

                  <blockquote className="border-l-2 border-primary/60 pl-4 italic text-sm text-foreground/85 leading-relaxed">
                    « {etude.citation} »
                  </blockquote>

                  <p className="text-xs font-semibold text-muted-foreground">
                    — {etude.gerant}
                  </p>
                </div>

                <div className="bg-background/90 border border-border/70 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Résultats clés obtenus :
                  </h3>
                  <div className="space-y-3">
                    {etude.chiffres.map((c) => (
                      <div key={c.label} className="flex items-baseline justify-between border-b border-border/30 pb-2">
                        <span className="text-sm font-semibold text-foreground">{c.label}</span>
                        <span className="text-base font-bold font-mono text-primary">{c.valeur}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Composant des Engagements & Délais */}
        <PromesseDelai />

        {/* Section Appel à l'action */}
        <CtaSection
          titre="Obtenez les mêmes résultats dans vos points de vente"
          sousTitre="Activez votre compte Telora en 2 minutes et commencez à scanner vos premiers téléphones dès aujourd'hui."
          labelBouton="Créer ma boutique gratuitement"
          hrefBouton="/inscription"
        />
      </main>

      {/* CTA Mobile sticky */}
      <CtaMobile />

      {/* Pied de page officiel */}
      <PiedDePageLegal className="mt-auto" />
    </div>
  );
}

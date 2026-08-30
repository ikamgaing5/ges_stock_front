import Link from "next/link";
import { CheckCircle2, ArrowRight, BookOpen, Store, Smartphone, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconeTelora } from "@/components/ui/logo-telora";
import { FilAriane } from "@/components/layout/fil-ariane";
import { PiedDePageLegal } from "@/components/layout/pied-de-page-legal";

export const metadata = {
  title: "Merci pour votre confiance",
  description: "Votre inscription sur Telora est enregistrée. Découvrez vos prochaines étapes pour sécuriser votre stock de téléphones.",
};

export default function PageMerci() {
  const etapes = [
    {
      numero: "01",
      titre: "Validez votre adresse email",
      description: "Un code sécurisé à 6 chiffres vous a été envoyé par email pour activer votre compte.",
      icone: CheckCircle2,
    },
    {
      numero: "02",
      titre: "Configurez votre point de vente",
      description: "Donnez un nom à votre boutique (ex: Magasin Centre, Kiosque Gare) et sélectionnez votre devise.",
      icone: Store,
    },
    {
      numero: "03",
      titre: "Scannez votre premier téléphone",
      description: "Utilisez la caméra de votre smartphone ou une douchette pour lire l'IMEI et enregistrer l'appareil en 2 secondes.",
      icone: Smartphone,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      {/* En-tête de la page */}
      <header className="border-b border-border/40 py-4 px-6">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <IconeTelora size={28} />
            <span className="font-heading text-sm font-bold tracking-tight">TELORA</span>
          </Link>

          <Link
            href="/faq"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Assistance</span>
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto max-w-3xl px-4 py-12 sm:py-16 space-y-10 my-auto">
        <FilAriane elements={[{ label: "Confirmation", actif: true }]} />

        {/* Bloc d'accueil & remerciement */}
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              Merci pour votre confiance !
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Bienvenue sur <strong>Telora</strong>. Votre compte est prêt pour transformer la gestion quotidienne de votre boutique de téléphonie.
            </p>
          </div>
        </div>

        {/* Étapes clés de démarrage */}
        <div className="rounded-2xl border border-border/80 bg-card/50 p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Vos 3 prochaines étapes pour démarrer en toute sérénité :
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {etapes.map((etape) => {
              const Icone = etape.icone;
              return (
                <div
                  key={etape.numero}
                  className="rounded-xl border border-border/60 bg-background/80 p-5 space-y-3 relative shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-primary">
                      {etape.numero}
                    </span>
                    <Icone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {etape.titre}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {etape.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 h-12 shadow-md"
            nativeButton={false}
            render={<Link href="/connexion" />}
          >
            <span>Accéder à mon espace Telora</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2 border-border text-foreground hover:bg-muted h-12 px-6"
            nativeButton={false}
            render={<Link href="/faq" />}
          >
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Guide d'utilisation & FAQ</span>
          </Button>
        </div>
      </main>

      {/* Pied de page officiel */}
      <PiedDePageLegal className="mt-auto" />
    </div>
  );
}

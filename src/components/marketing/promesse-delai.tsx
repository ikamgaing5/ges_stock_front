import React from "react";
import { Clock, ShieldCheck, Zap, Rocket } from "lucide-react";

interface PromesseDelaiProps {
  className?: string;
  titre?: string;
  sousTitre?: string;
}

export function PromesseDelai({
  className = "",
  titre = "Nos Engagements de Rapidité & Délais",
  sousTitre = "Pensé pour le rythme soutenu des boutiques : zéro attente pour vos clients, zéro perte de temps pour vos équipes.",
}: PromesseDelaiProps) {
  const engagements = [
    {
      icone: Zap,
      chrono: "0.4 seconde",
      titre: "Reconnaissance IMEI Instantanée",
      description:
        "Identification automatique de la marque, du modèle et de la fiche technique via la base TAC mondiale.",
      couleur: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    },
    {
      icone: Rocket,
      chrono: "2 minutes chrono",
      titre: "Activation & Première Boutique",
      description:
        "Création de compte, paramétrage de votre boutique et saisie des premiers téléphones en main sans formation complexe.",
      couleur: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    },
    {
      icone: Clock,
      chrono: "< 3 minutes",
      titre: "Clôture de Caisse Quotidienne",
      description:
        "Réconciliation instantanée des entrées de stock, des sorties et du montant d'espèces en caisse chaque soir.",
      couleur: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    },
    {
      icone: ShieldCheck,
      chrono: "< 15 minutes",
      titre: "Réponse Support Client",
      description:
        "Une assistance réactive et disponible 6j/7 pour vous accompagner en cas de besoin sur vos points de vente.",
      couleur: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    },
  ];

  return (
    <section className={`rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-10 backdrop-blur-sm ${className}`}>
      <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {titre}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {sousTitre}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {engagements.map((item) => {
          const Icone = item.icone;
          return (
            <div
              key={item.titre}
              className="rounded-xl border border-border/50 bg-background/80 p-5 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg border ${item.couleur}`}>
                    <Icone className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold font-mono tracking-tight text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                    {item.chrono}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-foreground tracking-tight">
                  {item.titre}
                </h4>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

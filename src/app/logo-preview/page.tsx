"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LogoPreviewPage() {
  const logosAbstraits = [
    {
      id: "concept-1",
      title: "Concept 1 : « Le Nœud de Mobius »",
      inspiration: "Dans l'esprit de Meta & Airbnb",
      description:
        "Un ruban géométrique continu sans fin formant une boucle harmonieuse tripartite. Il symbolise le cycle ininterrompu du stock (Approvisionnement ➔ Traçabilité ➔ Vente), l'interconnexion multi-boutiques et la confiance.",
      image: "/telora-abstract-1.jpg",
      tags: ["Ruban Continu", "Infini & Flux", "Cyan & Indigo Royal"],
    },
    {
      id: "concept-2",
      title: "Concept 2 : « Le Disque d'Ondes »",
      inspiration: "Dans l'esprit de Spotify & Nike",
      description:
        "Une forme circulaire pure et iconique traversée par 3 vagues géométriques rythmées en espace négatif. Une simplicité radicale dessinable de mémoire en un instant, moderne et intemporelle.",
      image: "/telora-abstract-2.jpg",
      tags: ["Cercle Pur", "3 Vagues Géométriques", "Bleu Électrique"],
    },
    {
      id: "concept-3",
      title: "Concept 3 : « L'Élan 'T' en Infini »",
      inspiration: "Dans l'esprit du Swoosh Nike & Meta",
      description:
        "Un trait unique et asymétrique qui naît d'une boucle d'infinité pour se propulser en aile dynamique, esquissant un 'T' majuscule ultra-moderne. Il incarne la vitesse, l'impulsion et la croissance commerciale.",
      image: "/telora-abstract-3.jpg",
      tags: ["Monogramme T Abstrait", "Impulsion & Vélocité", "Émeraude & Saphir"],
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Identité Visuelle Abstraite · Pure Géométrie</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Logos Abstraits & Créatifs pour TELORA
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Inspirés des plus grandes marques (Meta, Spotify, Nike, Adidas) : zéro gadget littéral, pureté géométrique et impact immédiat.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-neutral-700 text-neutral-200 hover:bg-neutral-800"
            nativeButton={false}
            render={<Link href="/connexion" />}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'application
          </Button>
        </div>

        {/* Grille des 3 concepts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {logosAbstraits.map((logo, index) => (
            <div
              key={logo.id}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 flex flex-col justify-between hover:border-primary/50 transition-all shadow-xl hover:shadow-primary/5"
            >
              <div className="space-y-4">
                {/* Cadre de l'image */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800/80 group-hover:scale-[1.02] transition-transform">
                  <img
                    src={logo.image}
                    alt={logo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md border border-neutral-700/60 rounded-md px-2 py-0.5 text-[11px] font-semibold text-neutral-200">
                    Option {index + 1}
                  </div>
                </div>

                {/* Détails */}
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-white tracking-tight">
                    {logo.title}
                  </h2>
                  <p className="text-xs font-medium text-emerald-400">
                    {logo.inspiration}
                  </p>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {logo.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {logo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-neutral-800/80 text-neutral-300 px-2 py-0.5 rounded-full border border-neutral-700/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note informative */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6 text-center text-xs text-neutral-400 space-y-1">
          <p>
            Lequel de ces 3 symboles géométriques correspond le mieux à l'esprit de <strong>TELORA</strong> ?
          </p>
          <p className="text-neutral-500">
            Dès que vous validez votre préféré (<strong>Option 1</strong>, <strong>Option 2</strong> ou <strong>Option 3</strong>), nous générerons la version vectorielle SVG pour l'intégrer directement dans le code source de l'application !
          </p>
        </div>
      </div>
    </div>
  );
}

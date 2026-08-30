"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CtaMobileProps {
  className?: string;
}

/**
 * Barre d'appel à l'action flottante sur mobile (lg:hidden)
 * Permet de convertir les visiteurs sans qu'ils aient besoin de faire défiler toute la page.
 */
export function CtaMobile({ className = "" }: CtaMobileProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 p-3 backdrop-blur-md shadow-2xl lg:hidden ${className}`}
    >
      <div className="container mx-auto max-w-lg flex items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Sécurisez votre stock</span>
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            Essai gratuit · Sans carte bancaire
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            className="h-9 px-3.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shadow-xs"
            nativeButton={false}
            render={<Link href="/inscription" />}
          >
            <span>Démarrer</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2.5 text-xs font-medium border-border"
            nativeButton={false}
            render={<Link href="/connexion" />}
          >
            Connexion
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type ElementFilAriane = {
  label: string;
  href?: string;
  actif?: boolean;
};

interface FilArianeProps {
  elements: ElementFilAriane[];
  className?: string;
  inclureAccueil?: boolean;
}

/**
 * Fil d'Ariane accessible et sémantique avec balisage Schema.org BreadcrumbList.
 */
export function FilAriane({
  elements,
  className = "",
  inclureAccueil = true,
}: FilArianeProps) {
  const domaine = process.env.NEXT_PUBLIC_APP_URL || "https://telora.app";

  const listeComplete: ElementFilAriane[] = inclureAccueil
    ? [{ label: "Accueil", href: "/" }, ...elements]
    : elements;

  // Schéma JSON-LD BreadcrumbList pour le référencement Google
  const schemaBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listeComplete.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${domaine}${item.href}` : undefined,
    })),
  };

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={`flex items-center text-xs text-muted-foreground ${className}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbs) }}
      />
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {listeComplete.map((item, index) => {
          const estDernier = index === listeComplete.length - 1 || item.actif;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5 sm:gap-2">
              {index > 0 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" aria-hidden="true" />
              )}

              {estDernier || !item.href ? (
                <span
                  className="font-medium text-foreground truncate max-w-[200px]"
                  aria-current="page"
                >
                  {index === 0 && inclureAccueil ? (
                    <span className="inline-flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </span>
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors hover:underline underline-offset-4 truncate max-w-[180px]"
                >
                  {index === 0 && inclureAccueil ? (
                    <span className="inline-flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </span>
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

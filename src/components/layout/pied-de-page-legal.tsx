"use client";

import Link from "next/link";
import { IconeTelora } from "@/components/ui/logo-telora";
import { useI18n } from "@/lib/i18n";

export function PiedDePageLegal({
  className = "",
}: {
  className?: string;
  complet?: boolean; // Maintenu pour compatibilité
}) {
  const { lang } = useI18n();

  const liensLegaux = [
    {
      href: "/etudes-de-cas",
      labelFr: "Études de cas",
      labelEn: "Case Studies",
    },
    {
      href: "/faq",
      labelFr: "Assistance",
      labelEn: "Help",
    },
    {
      href: "/legal/mentions-legales",
      labelFr: "Mentions légales",
      labelEn: "Legal",
    },
    {
      href: "/legal/securite",
      labelFr: "Centre de sécurité et de confidentialité",
      labelEn: "Privacy and Safety Center",
    },
    {
      href: "/legal/confidentialite",
      labelFr: "Politique de confidentialité",
      labelEn: "Privacy Policy",
    },
    {
      href: "/legal/cookies",
      labelFr: "Cookies",
      labelEn: "Cookies",
    },
    {
      href: "/legal/cgu",
      labelFr: "Conditions d'utilisation",
      labelEn: "Terms of Service",
    },
    {
      href: "/legal/accessibilite",
      labelFr: "Accessibilité",
      labelEn: "Accessibility",
    },
  ];

  return (
    <footer className={`w-full border-t border-border/40 py-5 text-muted-foreground ${className}`}>
      <div className="container mx-auto max-w-6xl px-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Logo de l'application à l'extrême gauche */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground font-bold hover:opacity-90 transition-opacity"
          >
            <IconeTelora size={24} />
            <span className="font-heading text-xs font-bold tracking-tight">
              TELORA
            </span>
          </Link>
        </div>

        {/* Liens légaux */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-[11px] sm:text-xs">
          {liensLegaux.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className="hover:text-foreground transition-colors"
            >
              {lang === "en" ? lien.labelEn : lien.labelFr}
            </Link>
          ))}
        </div>

        {/* Copyright à l'extrême droite */}
        <p className="text-[11px] sm:text-xs text-muted-foreground/70 shrink-0">
          © 2026 Telora
        </p>
      </div>
    </footer>
  );
}

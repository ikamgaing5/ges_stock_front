import React from "react";

interface LogoTeloraProps extends React.SVGProps<SVGSVGElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  avecTexte?: boolean;
  classNameTexte?: string;
}

const TAILLES = {
  xs: 20,
  sm: 26,
  md: 36,
  lg: 48,
  xl: 64,
};

/**
 * Emblème officiel de TELORA :
 * Le Disque d'Ondes Géométriques (Cercle profond + 3 ondes dynamiques en espace négatif)
 */
export function IconeTelora({
  size = "md",
  className = "",
  ...props
}: Omit<LogoTeloraProps, "avecTexte" | "classNameTexte">) {
  const dimension = typeof size === "number" ? size : TAILLES[size] || 36;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <defs>
        {/* Dégradé du disque de fond (Bleu nuit profond) */}
        <linearGradient id="telora-fond" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B132B" />
          <stop offset="100%" stopColor="#1C2541" />
        </linearGradient>

        {/* Dégradé électrique des 3 ondes (Cyan néon vers bleu azur) */}
        <linearGradient id="telora-ondes" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00A3FF" />
        </linearGradient>

        {/* Masque circulaire pour découper les ondes aux bords du disque */}
        <clipPath id="telora-cercle-clip">
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>

      {/* Disque principal */}
      <circle cx="50" cy="50" r="48" fill="url(#telora-fond)" />

      {/* Groupe des ondes découpées */}
      <g clipPath="url(#telora-cercle-clip)">
        {/* Onde 1 (Supérieure) */}
        <path
          d="M -5 54 C 20 48, 38 18, 64 22 C 82 25, 94 38, 108 36 L 108 24 C 92 25, 80 12, 60 10 C 35 7, 18 36, -5 42 Z"
          fill="url(#telora-ondes)"
        />

        {/* Onde 2 (Centrale) */}
        <path
          d="M -5 74 C 20 68, 38 38, 64 42 C 82 45, 94 58, 108 56 L 108 44 C 92 45, 80 32, 60 30 C 35 27, 18 56, -5 62 Z"
          fill="url(#telora-ondes)"
        />

        {/* Onde 3 (Inférieure) */}
        <path
          d="M -5 94 C 20 88, 38 58, 64 62 C 82 65, 94 78, 108 76 L 108 64 C 92 65, 80 52, 60 50 C 35 47, 18 76, -5 82 Z"
          fill="url(#telora-ondes)"
        />
      </g>

      {/* Bordure subtile extérieure */}
      <circle
        cx="50"
        cy="50"
        r="47.5"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

/**
 * Logo complet TELORA (Icône + Typographie moderne)
 */
export function LogoTelora({
  size = "md",
  avecTexte = true,
  className = "",
  classNameTexte = "",
  ...props
}: LogoTeloraProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <IconeTelora size={size} {...props} />
      {avecTexte && (
        <span
          className={`font-heading font-bold tracking-tight text-foreground ${
            size === "xs"
              ? "text-xs"
              : size === "sm"
              ? "text-sm"
              : size === "lg"
              ? "text-2xl"
              : size === "xl"
              ? "text-3xl"
              : "text-base"
          } ${classNameTexte}`}
        >
          TELORA
        </span>
      )}
    </div>
  );
}

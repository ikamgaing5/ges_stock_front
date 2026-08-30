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
        {/* Dégradé du disque de fond (Bleu saphir riche) */}
        <linearGradient id="telora-fond" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B1B3D" />
          <stop offset="50%" stopColor="#07122A" />
          <stop offset="100%" stopColor="#030814" />
        </linearGradient>

        {/* Dégradé électrique des 3 ondes (Cyan néon vers bleu azur) */}
        <linearGradient id="telora-ondes" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F5FF" />
          <stop offset="50%" stopColor="#00D2FF" />
          <stop offset="100%" stopColor="#0088FF" />
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
          d="M -10 52 C 18 45, 36 12, 65 16 C 84 19, 96 34, 110 32 L 110 18 C 94 20, 80 5, 60 3 C 32 0, 15 32, -10 38 Z"
          fill="url(#telora-ondes)"
        />

        {/* Onde 2 (Centrale) */}
        <path
          d="M -10 74 C 18 67, 36 34, 65 38 C 84 41, 96 56, 110 54 L 110 40 C 94 42, 80 27, 60 25 C 32 22, 15 54, -10 60 Z"
          fill="url(#telora-ondes)"
        />

        {/* Onde 3 (Inférieure) */}
        <path
          d="M -10 96 C 18 89, 36 56, 65 60 C 84 63, 96 78, 110 76 L 110 62 C 94 64, 80 49, 60 47 C 32 44, 15 76, -10 82 Z"
          fill="url(#telora-ondes)"
        />
      </g>

      {/* Anneau extérieur lumineux */}
      <circle
        cx="50"
        cy="50"
        r="47.5"
        stroke="#00D2FF"
        strokeOpacity="0.3"
        strokeWidth="1.5"
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

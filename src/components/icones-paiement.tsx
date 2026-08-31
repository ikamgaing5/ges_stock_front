"use client";

/**
 * Logos officiels des moyens de paiement :
 * - Orange Money : Image officielle (`/om.png`)
 * - MTN MoMo : Image officielle (`/momo.png`)
 * - Carte Bancaire : Logos vectoriels Visa & Mastercard
 */

import Image from "next/image";

export function IconeOrangeMoney({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 overflow-hidden relative rounded-xs ${className}`}>
      <Image
        src="/om.png"
        alt="Orange Money"
        width={48}
        height={48}
        className="w-full h-full object-contain"
        unoptimized
      />
    </span>
  );
}

export function IconeMtnMomo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 overflow-hidden relative rounded-xs ${className}`}>
      <Image
        src="/momo.png"
        alt="MTN Mobile Money"
        width={48}
        height={48}
        className="w-full h-full object-contain"
        unoptimized
      />
    </span>
  );
}

export function IconeCarteBancaire({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cartes bancaires Visa et Mastercard"
    >
      {/* Carte arrière-plan Visa / Mastercard */}
      <rect width="64" height="40" rx="6" fill="#1E293B" />
      
      {/* Deux cercles Mastercard */}
      <circle cx="43" cy="20" r="10" fill="#EB001B" fillOpacity="0.95" />
      <circle cx="53" cy="20" r="10" fill="#F79E1B" fillOpacity="0.95" />
      <path
        d="M48 13.5C50 15.3 51.3 17.5 51.3 20C51.3 22.5 50 24.7 48 26.5C46 24.7 44.7 22.5 44.7 20C44.7 17.5 46 15.3 48 13.5Z"
        fill="#FF5F00"
      />

      {/* Logotype VISA officiel */}
      <text
        x="15"
        y="25"
        fill="#FFFFFF"
        fontFamily="sans-serif"
        fontStyle="italic"
        fontWeight="900"
        fontSize="13"
        letterSpacing="1"
      >
        VISA
      </text>
    </svg>
  );
}

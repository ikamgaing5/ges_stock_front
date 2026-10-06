"use client";

/**
 * Logos officiels des moyens de paiement :
 * - Orange Money : Image officielle (`/om.png`)
 * - MTN MoMo : Image officielle (`/momo.png`)
 * - Visa : Logo vectoriel officiel haute fidélité
 * - Mastercard : Logo vectoriel officiel avec cercles entrelacés
 * - Carte Bancaire : Ensemble vectoriel combiné
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

export function IconeVisa({ className = "h-5 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Visa"
    >
      <rect width="40" height="26" rx="4" fill="#0E4595" />
      <path d="M16.5 18H14.4L15.7 8.5H17.8L16.5 18Z" fill="white" />
      <path
        d="M23.9 8.8C23.5 8.6 22.8 8.4 22 8.4C19.9 8.4 18.4 9.5 18.4 11C18.4 12.2 19.5 12.8 20.3 13.2C21.1 13.6 21.4 13.9 21.4 14.3C21.4 14.9 20.7 15.2 20 15.2C19.2 15.2 18.7 15 18.1 14.7L17.8 14.5L17.4 16.6C18 16.9 19 17.1 20 17.1C22.2 17.1 23.7 16 23.7 14.3C23.7 13 22.8 12.3 21.8 11.8C21.1 11.5 20.7 11.2 20.7 10.8C20.7 10.4 21.2 10 22 10C22.7 10 23.3 10.2 23.7 10.4L23.9 10.5L24.3 8.8H23.9Z"
        fill="white"
      />
      <path
        d="M27.7 8.5H26C25.5 8.5 25.1 8.7 24.9 9.2L21.3 18H23.5L23.9 16.8H26.6L26.9 18H28.8L27.7 8.5ZM24.5 15.1C24.7 14.5 25.6 12.1 25.6 12.1C25.6 12.1 25.8 11.7 25.8 11.4L26 12.1C26 12.1 26.5 14.4 26.6 15.1H24.5Z"
        fill="white"
      />
      <path
        d="M13.2 8.5L11.2 15.1L11 13.9C10.6 12.5 9.4 11 8 10.2L9.8 18H12L15.3 8.5H13.2Z"
        fill="white"
      />
      <path
        d="M9.2 8.5H5.7L5.6 8.7C8.3 9.4 10.6 11.2 11.4 13.5L10.7 9.9C10.5 9 9.9 8.5 9.2 8.5Z"
        fill="#F7B600"
      />
    </svg>
  );
}

export function IconeMastercard({ className = "h-5 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Mastercard"
    >
      <rect width="40" height="26" rx="4" fill="#14171A" />
      <circle cx="15.5" cy="13" r="7.5" fill="#EB001B" />
      <circle cx="24.5" cy="13" r="7.5" fill="#F79E1B" fillOpacity="0.95" />
      <path
        d="M20 7.8C21.6 9.1 22.6 10.9 22.6 13C22.6 15.1 21.6 16.9 20 18.2C18.4 16.9 17.4 15.1 17.4 13C17.4 10.9 18.4 9.1 20 7.8Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

export function IconeCarteBancaires({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cartes bancaires Visa et Mastercard"
    >
      <rect width="64" height="40" rx="6" fill="#1E293B" />
      <circle cx="43" cy="20" r="10" fill="#EB001B" fillOpacity="0.95" />
      <circle cx="53" cy="20" r="10" fill="#F79E1B" fillOpacity="0.95" />
      <path
        d="M48 13.5C50 15.3 51.3 17.5 51.3 20C51.3 22.5 50 24.7 48 26.5C46 24.7 44.7 22.5 44.7 20C44.7 17.5 46 15.3 48 13.5Z"
        fill="#FF5F00"
      />
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

export function IconeCarteBancaire({
  className = "h-6 w-6",
}: {
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden relative rounded-xs ${className}`}
    >
      <Image
        src="/card.png"
        alt="Carte Bancaire"
        width={48}
        height={48}
        className="w-full h-full object-contain"
        unoptimized
      />
    </span>
  );
}

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconeTelora } from "@/components/ui/logo-telora";
import { useI18n } from "@/lib/i18n";
import { BasculeLangue } from "@/components/bascule-langue";
import { BasculeTheme } from "@/components/bascule-theme";

/**
 * Option 1 : Version Simple & Épurée
 * Indique clairement que la page n'existe pas avec un seul bouton de retour à la page précédente.
 * Supporte le bilinguisme (FR/EN) et le mode sombre/clair.
 */
export function Page404Simple() {
  const router = useRouter();
  const { t } = useI18n();

  function retourPagePrecedente() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      {/* Contrôles de langue et de thème discrets en haut à droite */}
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <BasculeLangue />
        <BasculeTheme />
      </div>

      <div className="max-w-md w-full space-y-6">
        {/* Logo Telora discret */}
        <div className="flex justify-center">
          <IconeTelora size={48} />
        </div>

        {/* Message épuré internationalisé */}
        <div className="space-y-2">
          <p className="text-sm font-semibold font-mono tracking-wider text-muted-foreground uppercase">
            {t("page404.badge")}
          </p>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("page404.titre")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("page404.description")}
          </p>
        </div>

        {/* Bouton unique de retour vers la page précédente */}
        <div className="pt-2 flex justify-center">
          <Button
            onClick={retourPagePrecedente}
            size="lg"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("page404.retourPrecedent")}</span>
          </Button>
        </div>

        {/* Lien discret vers l'aide */}
        <div className="flex justify-center pt-2">
          <Link
            href="/faq"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{t("page404.centreAide")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

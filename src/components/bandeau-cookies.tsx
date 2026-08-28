"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const CLE_CONSENTEMENT = "gestion-stock-cookies-consent";

export function BandeauCookies() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consentement = window.localStorage.getItem(CLE_CONSENTEMENT);
    if (!consentement) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  function accepter() {
    window.localStorage.setItem(CLE_CONSENTEMENT, new Date().toISOString());
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label={t("cookies.titre")}
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg md:left-auto md:right-6 md:max-w-md"
    >
      <div className="rounded-xl border border-border/80 bg-background/95 p-4 shadow-lg backdrop-blur-md dark:bg-card/95">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("cookies.titre")}
            </h4>
            <button
              onClick={accepter}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Fermer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-xs text-foreground/80 leading-relaxed">
            {t("cookies.message")}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={accepter}
              className="h-7 px-3 text-xs font-medium"
            >
              {t("cookies.accepter")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              nativeButton={false}
              render={<Link href="/faq#cookies" />}
            >
              {t("cookies.enSavoirPlus")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

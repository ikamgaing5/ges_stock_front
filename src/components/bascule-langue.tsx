"use client";

/**
 * Le bouton qui change de langue (Français / Anglais).
 */

import { useEffect, useState } from "react";
import { Check, Languages } from "lucide-react";
import { useI18n, LANGUES_DISPONIBLES } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BasculeLangue({
  afficheTexte = false,
  taille = "icon",
}: {
  afficheTexte?: boolean;
  taille?: "icon" | "sm" | "default";
}) {
  const { lang, setLang, t } = useI18n();
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    setMonte(true);
  }, []);

  const langueActive = LANGUES_DISPONIBLES.find((l) => l.code === lang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size={taille === "icon" && !afficheTexte ? "icon" : "sm"}
            className={afficheTexte ? "gap-2" : ""}
          />
        }
      >
        <Languages className="h-4 w-4 shrink-0" />
        {afficheTexte && (
          <span className="text-xs font-medium">
            {langueActive?.drapeau} {langueActive?.code.toUpperCase()}
          </span>
        )}
        <span className="sr-only">{t("nav.changerLangue")}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            {t("nav.langue")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {LANGUES_DISPONIBLES.map((option) => (
            <DropdownMenuItem
              key={option.code}
              onClick={() => setLang(option.code)}
            >
              <span className="mr-2 text-base leading-none">
                {option.drapeau}
              </span>
              <span className="flex-1">{option.libelle}</span>
              {monte && lang === option.code && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

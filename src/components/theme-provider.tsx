"use client";

/**
 * Gère le thème clair / sombre.
 *
 * Trois choix sont proposés : clair, sombre, et « système », qui suit le
 * réglage du téléphone ou de l'ordinateur. « Système » est la valeur par
 * défaut : une boutique éclairée au néon et une soirée à la maison
 * n'appellent pas le même affichage, et le système d'exploitation le sait
 * déjà.
 *
 * `attribute="class"` fait poser la classe `dark` sur la balise <html>.
 * C'est ce que guette `@custom-variant dark` dans globals.css, où sont
 * définies les deux palettes.
 *
 * next-themes insère un petit script exécuté AVANT le premier affichage :
 * sans lui, une page sombre apparaîtrait d'abord en blanc pendant une
 * fraction de seconde, ce qui est désagréable la nuit.
 */

import { ThemeProvider as FournisseurNextThemes } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <FournisseurNextThemes
      attribute="class"
      defaultTheme="system"
      enableSystem
      // Coupe les transitions de couleur le temps du basculement : sans
      // cela, chaque élément anime sa couleur séparément et le changement
      // paraît sale.
      disableTransitionOnChange
    >
      {children}
    </FournisseurNextThemes>
  );
}

"use client";

/**
 * Un tiroir latéral (« drawer ») : un panneau pleine hauteur qui glisse
 * depuis le bord gauche de l'écran, avec un voile sombre derrière.
 *
 * C'est la forme attendue d'un menu sur téléphone. Une boîte de dialogue
 * centrée ferait une fenêtre flottante au milieu de l'écran, ce qui ne
 * ressemble pas à un menu.
 *
 * Construit sur la primitive Dialog de Base UI : on récupère gratuitement
 * la fermeture par Échap, le clic sur le voile, le blocage du défilement
 * de la page et le piégeage du focus au clavier. Seul le placement change.
 */

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";

function Tiroir({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="tiroir" {...props} />;
}

function TiroirDeclencheur({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="tiroir-declencheur" {...props} />;
}

function TiroirTitre({ ...props }: DialogPrimitive.Title.Props) {
  return <DialogPrimitive.Title data-slot="tiroir-titre" {...props} />;
}

function TiroirFermer({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="tiroir-fermer" {...props} />;
}

/**
 * Le panneau lui-même.
 *
 * `cote` choisit le bord d'où il arrive. Le menu utilise « gauche » ;
 * l'autre valeur existe pour un futur panneau de filtres.
 */
function TiroirContenu({
  className,
  cote = "gauche",
  children,
  ...props
}: DialogPrimitive.Popup.Props & { cote?: "gauche" | "droite" }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="tiroir-voile"
        className="fixed inset-0 z-50 bg-black/40 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />

      <DialogPrimitive.Popup
        data-slot="tiroir-contenu"
        className={cn(
          // Collé au bord, pleine hauteur. `h-dvh` suit la hauteur réelle
          // du navigateur mobile, barre d'adresse comprise.
          "fixed inset-y-0 z-50 flex h-dvh w-[17rem] max-w-[85vw] flex-col bg-sidebar shadow-xl outline-none duration-250 ease-[cubic-bezier(0.32,0.72,0,1)]",
          cote === "gauche"
            ? "left-0 border-r data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left"
            : "right-0 border-l data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

export { Tiroir, TiroirContenu, TiroirDeclencheur, TiroirFermer, TiroirTitre };

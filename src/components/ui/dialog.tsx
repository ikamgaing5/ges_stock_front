"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

/*
 * Une boîte de dialogue est découpée en trois parties :
 *
 *   ┌─────────────────────────┐
 *   │ DialogHeader            │  fixe : titre et explication
 *   ├─────────────────────────┤
 *   │ DialogCorps             │  DÉFILE si le contenu est trop haut
 *   │   …champs du formulaire │
 *   ├─────────────────────────┤
 *   │ DialogFooter            │  fixe : les boutons restent toujours
 *   └─────────────────────────┘        atteignables
 *
 * C'est ce découpage qui garantit qu'un formulaire long reste utilisable
 * sur un petit écran : sans lui, le bouton de validation se retrouve hors
 * de l'écran, et comme la page derrière est verrouillée, plus personne ne
 * peut valider.
 *
 * Structure attendue dans les pages :
 *
 *   <DialogContent>
 *     <form onSubmit={…} className="flex min-h-0 flex-1 flex-col">
 *       <DialogHeader>…</DialogHeader>
 *       <DialogCorps>…les champs…</DialogCorps>
 *       <DialogFooter>…les boutons…</DialogFooter>
 *     </form>
 *   </DialogContent>
 *
 * Pour une simple confirmation, sans champ à saisir, on se passe du
 * formulaire et du corps : l'en-tête et le pied suffisent.
 */

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/40 duration-150 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 duration-150 outline-none sm:max-w-md",
          // La hauteur ne dépasse jamais l'écran. `dvh` suit la hauteur
          // réellement visible sur mobile, barre d'adresse comprise.
          "max-h-[calc(100dvh-2rem)]",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Fermer</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

/** L'en-tête : titre et explication. Ne défile pas. */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        // `pr-12` réserve la place du bouton de fermeture, pour que le
        // titre ne passe pas dessous.
        "flex shrink-0 flex-col gap-1.5 px-5 pt-5 pr-12 pb-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * Le corps : c'est la seule partie qui défile.
 *
 * `min-h-0` est indispensable : sans lui, un élément flex refuse de
 * devenir plus petit que son contenu, et le défilement ne se déclenche
 * jamais.
 */
function DialogCorps({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-corps"
      className={cn(
        "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 pb-5",
        className
      )}
      {...props}
    />
  )
}

/** Le pied : les boutons. Reste visible quel que soit le défilement. */
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 border-t bg-muted/50 px-5 py-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Fermer
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-snug font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogCorps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}

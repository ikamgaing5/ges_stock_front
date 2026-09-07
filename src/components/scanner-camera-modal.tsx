"use client";

/**
 * Modal et lecteur de codes-barres par caméra mobile et desktop.
 *
 * Utilise la librairie universelle html5-qrcode qui fonctionne
 * sur tous les navigateurs modernes (iOS Safari, Chrome, Firefox, etc.)
 * avec fallback et accélération matérielle.
 *
 * Fonctionnalités :
 * - Prise en charge des caméras arrière / ultra-wide / frontale
 * - Bascule rapide de caméra si plusieurs capteurs sont détectés
 * - Contrôle de la torche / flash (sur mobile compatible)
 * - Viseur graphique unique avec repères et faisceau laser animé
 * - Retours sensoriels : vibration haptique et confirmation sonore
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Flashlight, FlashlightOff, RefreshCw, X, AlertCircle } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import type { CameraDevice } from "html5-qrcode";
import { nettoyerImei } from "@/lib/imei";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

type Props = {
  /** Appelé dès qu'un code valide (14 ou 15 chiffres IMEI ou code-barres) est détecté */
  onDetecte: (code: string) => void;
  onFermer: () => void;
};

export function ScannerCameraModal({ onDetecte, onFermer }: Props) {
  const { t } = useI18n();
  const elementId = "lecteur-camera-conteneur";

  const [appareils, setAppareils] = useState<CameraDevice[]>([]);
  const [indexCamera, setIndexCamera] = useState<number>(0);
  const [initialise, setInitialise] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [flashDisponible, setFlashDisponible] = useState(false);
  const [flashActif, setFlashActif] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const demarrantRef = useRef(false);
  const arreteRef = useRef(false);
  const detecteRef = useRef(false);

  // Vibration haptique sur mobile
  const vibrer = useCallback(() => {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([60, 40, 60]);
      }
    } catch {
      // Ignorer si non supporté
    }
  }, []);

  // Fonction de démarrage unique et sécurisée du scanner
  const demarrerScanner = useCallback(
    async (idCameraSpecifique?: string) => {
      if (demarrantRef.current || arreteRef.current) return;
      demarrantRef.current = true;

      setErreur(null);
      setInitialise(false);

      // 1. Arrêter et détruire toute instance précédente
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch (e) {
          console.warn("Arrêt scanner précédent :", e);
        }
        scannerRef.current = null;
      }

      // 2. Nettoyer le conteneur DOM pour éliminer toute balise vidéo ou canvas orpheline
      const conteneur = document.getElementById(elementId);
      if (conteneur) {
        conteneur.innerHTML = "";
      }

      if (arreteRef.current) {
        demarrantRef.current = false;
        return;
      }

      try {
        const instance = new Html5Qrcode(elementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
          verbose: false,
        });

        scannerRef.current = instance;

        // Privilégier la caméra spécifiée ou la caméra environnement/arrière
        const contrainte: string | MediaTrackConstraints = idCameraSpecifique
          ? idCameraSpecifique
          : { facingMode: "environment" };

        await instance.start(
          contrainte,
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const largeur = Math.floor(Math.min(viewfinderWidth * 0.85, 340));
              const hauteur = Math.floor(Math.min(viewfinderHeight * 0.45, 160));
              return { width: largeur, height: Math.max(hauteur, 110) };
            },
          },
          (codeTexte) => {
            if (arreteRef.current || detecteRef.current) return;
            const imeiNettoye = nettoyerImei(codeTexte);

            if (imeiNettoye.length >= 14) {
              detecteRef.current = true;
              vibrer();
              onDetecte(imeiNettoye.slice(0, 15));
            } else if (codeTexte.trim().length >= 8) {
              detecteRef.current = true;
              vibrer();
              onDetecte(codeTexte.trim());
            }
          },
          () => {
            // Frame ignorée (normal entre deux détections)
          }
        );

        if (arreteRef.current) {
          try {
            await instance.stop();
            instance.clear();
            const el = document.getElementById(elementId);
            if (el) el.innerHTML = "";
          } catch {}
          return;
        }

        setInitialise(true);

        // Une fois la caméra active et l'autorisation accordée, récupérer la liste des capteurs
        Html5Qrcode.getCameras()
          .then((cameras) => {
            if (cameras && cameras.length > 1) {
              setAppareils(cameras);
            }
          })
          .catch(() => {});

        // Détection de la torche / flash
        try {
          const cap = instance.getRunningTrackCameraCapabilities();
          if (cap && typeof cap.torchFeature === "function" && cap.torchFeature().isSupported()) {
            setFlashDisponible(true);
          } else {
            setFlashDisponible(false);
          }
        } catch {
          setFlashDisponible(false);
        }
      } catch (err) {
        console.error("Erreur lancement scanner caméra :", err);
        if (!arreteRef.current) {
          setErreur(t("imei.cameraErreur"));
        }
      } finally {
        demarrantRef.current = false;
      }
    },
    [elementId, onDetecte, t, vibrer]
  );

  // Démarrage initial unique
  useEffect(() => {
    arreteRef.current = false;
    detecteRef.current = false;

    const timer = setTimeout(() => {
      void demarrerScanner();
    }, 60);

    return () => {
      arreteRef.current = true;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current
              .stop()
              .then(() => {
                scannerRef.current?.clear();
                const conteneur = document.getElementById(elementId);
                if (conteneur) conteneur.innerHTML = "";
              })
              .catch(() => {});
          } else {
            scannerRef.current.clear();
            const conteneur = document.getElementById(elementId);
            if (conteneur) conteneur.innerHTML = "";
          }
        } catch {}
      }
    };
  }, [demarrerScanner, elementId]);

  // Basculer vers la caméra suivante
  const basculerCamera = useCallback(() => {
    if (appareils.length <= 1) return;
    const prochainIndex = (indexCamera + 1) % appareils.length;
    setIndexCamera(prochainIndex);
    void demarrerScanner(appareils[prochainIndex].id);
  }, [appareils, demarrerScanner, indexCamera]);

  // Allumer / éteindre le flash / torche
  const toggleFlash = useCallback(async () => {
    if (!scannerRef.current || !flashDisponible) return;
    try {
      const cap = scannerRef.current.getRunningTrackCameraCapabilities();
      if (cap && typeof cap.torchFeature === "function") {
        const nouvelEtat = !flashActif;
        await cap.torchFeature().apply(nouvelEtat);
        setFlashActif(nouvelEtat);
      }
    } catch (e) {
      console.warn("Erreur basculement torche :", e);
    }
  }, [flashActif, flashDisponible]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2.5 sm:p-6 backdrop-blur-sm">
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-2xl border border-border/40 max-h-[92dvh]">
        {/* En-tête avec contrôles */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-semibold tracking-tight text-foreground">
              {t("imei.lectureCodeBarres")}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {flashDisponible && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => void toggleFlash()}
                className={flashActif ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground"}
                title={flashActif ? "Éteindre le flash" : "Allumer le flash"}
              >
                {flashActif ? (
                  <Flashlight className="h-4 w-4 fill-current" />
                ) : (
                  <FlashlightOff className="h-4 w-4" />
                )}
              </Button>
            )}

            {appareils.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={basculerCamera}
                title={t("scanner.basculerCamera")}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onFermer}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t("imei.fermer")}</span>
            </Button>
          </div>
        </div>

        {/* Zone de prévisualisation vidéo */}
        <div className="relative bg-black min-h-[300px] sm:min-h-[360px] max-h-[62dvh] flex-1 flex items-center justify-center overflow-hidden">
          {/* Conteneur DOM pour html5-qrcode : masque le canvas et le viseur par défaut pour laisser place à notre UI */}
          <div
            id={elementId}
            className="w-full h-full relative overflow-hidden flex items-center justify-center [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_canvas]:!hidden [&_#qr-shaded-region]:!hidden"
          />

          {/* Viseur stylisé unique en superposition */}
          {!erreur && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-10">
              {/* Cadre de visée */}
              <div className="relative w-[84%] max-w-[320px] h-[130px] sm:h-[150px] rounded-xl border-2 border-dashed border-white/70 bg-black/20 shadow-inner">
                {/* Coins renforcés pour l'effet scanner pro */}
                <span className="absolute -top-0.5 -left-0.5 h-4 w-4 border-t-2 border-l-2 border-primary rounded-tl-sm" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 border-t-2 border-r-2 border-primary rounded-tr-sm" />
                <span className="absolute -bottom-0.5 -left-0.5 h-4 w-4 border-b-2 border-l-2 border-primary rounded-bl-sm" />
                <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 border-b-2 border-r-2 border-primary rounded-br-sm" />

                {/* Faisceau laser animé de balayage */}
                {initialise && (
                  <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-[scanLaser_2s_ease-in-out_infinite]" />
                )}
              </div>

              <p className="mt-3 text-xs font-medium text-white/90 drop-shadow-md bg-black/70 px-3 py-1 rounded-full backdrop-blur-xs">
                {t("scanner.instruction")}
              </p>
            </div>
          )}

          {/* Affichage d'erreur caméra si refus d'accès ou problème matériel */}
          {erreur && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-card/95">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="font-semibold text-foreground text-sm">{t("imei.camera")}</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">{erreur}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onFermer}
                className="mt-4 text-xs"
              >
                {t("scanner.saisieManuelle")}
              </Button>
            </div>
          )}
        </div>

        {/* Pied d'aide */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/20 border-t text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="h-3.5 w-3.5 text-primary" />
            <span>{t("imei.cadrezCodeBarres")}</span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onFermer}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t("imei.fermer")}
          </Button>
        </div>
      </div>
    </div>
  );
}

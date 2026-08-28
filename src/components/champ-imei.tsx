"use client";

/**
 * Saisie d'un IMEI, pensée pour la boutique.
 *
 * Trois façons de remplir le champ :
 *
 * 1. LECTEUR CODE-BARRES (douchette). Une douchette se comporte comme un
 *    clavier : elle « tape » les chiffres très vite puis envoie Entrée.
 *    On mesure le temps entre les frappes : sous 30 ms de moyenne, c'est
 *    une machine, pas un doigt humain. On le signale et on valide seul.
 *
 * 2. CAMÉRA. Sur les navigateurs qui savent lire un code-barres
 *    (BarcodeDetector, Chrome et Edge notamment), un bouton ouvre la
 *    caméra arrière et lit l'étiquette de la boîte.
 *
 * 3. CLAVIER, tout simplement.
 *
 * Dans les trois cas, la clé de Luhn est vérifiée avant d'appeler
 * `onScanValide` : une saisie incomplète n'atteint jamais le serveur.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CircleCheck, Keyboard, ScanLine, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formaterImei, imeiValide, messageImei, nettoyerImei } from "@/lib/imei";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

/** Au-delà de cette moyenne entre deux frappes, c'est une saisie humaine. */
const SEUIL_DOUCHETTE_MS = 30;

/** Nombre de frappes rapides consécutives avant de conclure à une douchette. */
const FRAPPES_AVANT_DETECTION = 6;

type Props = {
  valeur: string;
  onChange: (imei: string) => void;
  /** Appelé quand 15 chiffres valides sont saisis (scan ou Entrée). */
  onScanValide?: (imei: string) => void;
  label?: string;
  /** Message d'erreur venant du serveur (IMEI déjà pris, par exemple). */
  erreur?: string;
  autoFocus?: boolean;
  /** Vide le champ après chaque scan valide : mode « à la chaîne ». */
  viderApresScan?: boolean;
};

export function ChampImei({
  valeur,
  onChange,
  onScanValide,
  label = "IMEI",
  erreur,
  autoFocus = true,
  viderApresScan = false,
}: Props) {
  const { t, lang } = useI18n();
  const champ = useRef<HTMLInputElement>(null);
  const [douchetteDetectee, setDouchetteDetectee] = useState(false);
  const [retour, setRetour] = useState<"succes" | "erreur" | null>(null);
  const [cameraOuverte, setCameraOuverte] = useState(false);
  const [cameraDisponible, setCameraDisponible] = useState(false);

  // Horodatage des frappes, pour distinguer douchette et clavier.
  const frappes = useRef<number[]>([]);

  const chiffres = nettoyerImei(valeur);
  const complet = chiffres.length === 15;
  const valide = imeiValide(chiffres);
  const avertissement = erreur ?? messageImei(valeur, lang);

  // La lecture par caméra n'existe pas sur tous les navigateurs.
  useEffect(() => {
    setCameraDisponible("BarcodeDetector" in window);
  }, []);

  /** Joue un bip court : en boutique, on entend mieux qu'on ne regarde. */
  const bip = useCallback((reussi: boolean) => {
    try {
      const contexte = new AudioContext();
      const oscillateur = contexte.createOscillator();
      const volume = contexte.createGain();

      oscillateur.connect(volume);
      volume.connect(contexte.destination);
      oscillateur.frequency.value = reussi ? 880 : 220;
      volume.gain.setValueAtTime(0.06, contexte.currentTime);
      volume.gain.exponentialRampToValueAtTime(0.001, contexte.currentTime + 0.18);

      oscillateur.start();
      oscillateur.stop(contexte.currentTime + 0.18);
      setTimeout(() => void contexte.close(), 400);
    } catch {
      // Certains navigateurs refusent le son sans interaction préalable.
      // Ce n'est pas grave : le retour visuel suffit.
    }
  }, []);

  const validerSaisie = useCallback(
    (saisie: string) => {
      const propre = nettoyerImei(saisie);

      if (!imeiValide(propre)) {
        setRetour("erreur");
        bip(false);
        return;
      }

      setRetour("succes");
      bip(true);
      onScanValide?.(propre);

      if (viderApresScan) {
        onChange("");
        champ.current?.focus();
      }
    },
    [bip, onChange, onScanValide, viderApresScan],
  );

  // Le retour visuel s'efface tout seul.
  useEffect(() => {
    if (!retour) return;
    const minuteur = setTimeout(() => setRetour(null), 700);
    return () => clearTimeout(minuteur);
  }, [retour]);

  function surFrappe(evenement: React.KeyboardEvent<HTMLInputElement>) {
    const maintenant = Date.now();

    if (evenement.key === "Enter") {
      // Une douchette termine toujours par Entrée. On ne laisse pas cette
      // touche envoyer le formulaire : on valide l'IMEI d'abord.
      evenement.preventDefault();
      validerSaisie(evenement.currentTarget.value);
      frappes.current = [];
      return;
    }

    if (evenement.key.length === 1) {
      frappes.current.push(maintenant);

      if (frappes.current.length > FRAPPES_AVANT_DETECTION) {
        frappes.current.shift();
      }

      if (frappes.current.length === FRAPPES_AVANT_DETECTION) {
        const ecarts = frappes.current
          .slice(1)
          .map((instant, i) => instant - frappes.current[i]);
        const moyenne = ecarts.reduce((a, b) => a + b, 0) / ecarts.length;

        setDouchetteDetectee(moyenne < SEUIL_DOUCHETTE_MS);
      }
    }
  }

  function surSaisie(saisie: string) {
    const propre = nettoyerImei(saisie).slice(0, 15);
    onChange(propre);

    // Certaines douchettes n'envoient pas Entrée : dès qu'on atteint
    // 15 chiffres valides, on valide de nous-mêmes.
    if (propre.length === 15 && imeiValide(propre)) {
      validerSaisie(propre);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="champ-imei">{label}</Label>

        <div className="flex items-center gap-2">
          {douchetteDetectee && (
            <span className="inline-flex items-center gap-1 text-xs text-statut-ok">
              <ScanLine className="h-3.5 w-3.5" />
              {t("imei.lecteurDetecte")}
            </span>
          )}

          {cameraDisponible && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setCameraOuverte(true)}
            >
              <Camera className="mr-1 h-3.5 w-3.5" />
              {t("imei.camera")}
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <Input
          id="champ-imei"
          ref={champ}
          // `inputMode` fait apparaître le pavé numérique sur mobile.
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={t("imei.placeholder")}
          value={valeur}
          onChange={(e) => surSaisie(e.target.value)}
          onKeyDown={surFrappe}
          className={cn(
            "h-11 pr-10 font-mono text-base tracking-wider chiffres",
            retour === "succes" && "anim-succes border-statut-ok",
            retour === "erreur" && "anim-erreur border-destructive",
            complet && valide && "border-statut-ok",
            complet && !valide && "border-destructive",
          )}
          aria-invalid={Boolean(avertissement) || undefined}
          aria-describedby="aide-imei"
        />

        {complet && valide && (
          <CircleCheck className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-statut-ok" />
        )}
      </div>

      <p id="aide-imei" className="min-h-5 text-xs">
        {avertissement ? (
          <span className="text-destructive">{avertissement}</span>
        ) : complet ? (
          <span className="chiffres font-mono text-muted-foreground">
            {formaterImei(chiffres)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Keyboard className="h-3.5 w-3.5" />
            {t("imei.aideRaccourci")}
          </span>
        )}
      </p>

      {cameraOuverte && (
        <LecteurCamera
          onLu={(code) => {
            setCameraOuverte(false);
            surSaisie(code);
          }}
          onFermer={() => setCameraOuverte(false)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Lecture par la caméra, via l'API BarcodeDetector du navigateur.
 *
 * Cette API n'existe pas partout : le bouton qui ouvre ce composant n'est
 * affiché que si le navigateur la propose. La caméra exige aussi une page
 * en HTTPS, ou en localhost pendant le développement.
 */
function LecteurCamera({
  onLu,
  onFermer,
}: {
  onLu: (code: string) => void;
  onFermer: () => void;
}) {
  const { t } = useI18n();
  const video = useRef<HTMLVideoElement>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let flux: MediaStream | null = null;
    let animation = 0;
    let arrete = false;

    async function demarrer() {
      try {
        flux = await navigator.mediaDevices.getUserMedia({
          // « environment » = caméra arrière sur un téléphone.
          video: { facingMode: "environment" },
        });

        if (arrete) {
          flux.getTracks().forEach((piste) => piste.stop());
          return;
        }

        if (video.current) {
          video.current.srcObject = flux;
          await video.current.play();
        }

        // @ts-expect-error BarcodeDetector n'est pas encore dans les types TS.
        const lecteur = new window.BarcodeDetector({
          formats: ["code_128", "code_39", "ean_13", "itf", "qr_code"],
        });

        const analyser = async () => {
          if (arrete || !video.current) return;

          try {
            const codes = await lecteur.detect(video.current);
            const trouve = codes.find(
              (c: { rawValue: string }) => nettoyerImei(c.rawValue).length >= 14,
            );

            if (trouve) {
              onLu(nettoyerImei(trouve.rawValue));
              return;
            }
          } catch {
            // Une image illisible n'est pas une erreur : on réessaie.
          }

          animation = requestAnimationFrame(analyser);
        };

        animation = requestAnimationFrame(analyser);
      } catch {
        setErreur(t("imei.cameraErreur"));
      }
    }

    void demarrer();

    // Sans ce nettoyage, la caméra resterait allumée après la fermeture.
    return () => {
      arrete = true;
      cancelAnimationFrame(animation);
      flux?.getTracks().forEach((piste) => piste.stop());
    };
  }, [onLu, t]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">{t("imei.lectureCodeBarres")}</p>
          <Button variant="ghost" size="icon-sm" onClick={onFermer}>
            <X className="h-4 w-4" />
            <span className="sr-only">{t("imei.fermer")}</span>
          </Button>
        </div>

        {erreur ? (
          <p className="p-6 text-sm text-destructive">{erreur}</p>
        ) : (
          <div className="relative aspect-[4/3] bg-black">
            <video
              ref={video}
              className="h-full w-full object-cover"
              playsInline
              muted
            />
            {/* Repère de visée : on cadre l'étiquette dans le rectangle. */}
            <div className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-lg border-2 border-white/80" />
          </div>
        )}

        <p className="px-4 py-3 text-xs text-muted-foreground">
          {t("imei.cadrezCodeBarres")}
        </p>
      </div>
    </div>
  );
}

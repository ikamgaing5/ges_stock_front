"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Upload, Trash2, RefreshCw, AlertTriangle, Image as ImageIcon } from "lucide-react";

interface SelecteurLogoProps {
  logoActuelUrl?: string | null;
  fichier: File | null;
  surChangementFichier: (fichier: File | null) => void;
  supprimerLogoExistant?: boolean;
  surChangementSupprimer?: (supprimer: boolean) => void;
  avertissementFacture?: boolean;
  lectureSeule?: boolean;
  className?: string;
}

const TAILLE_MAX_MO = 2;
const TAILLE_MAX_OCTETS = TAILLE_MAX_MO * 1024 * 1024;
const TYPES_ACCEPTES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
const EXTENSIONS_ACCEPTEES = ".png,.jpg,.jpeg,.svg";

export function SelecteurLogo({
  logoActuelUrl,
  fichier,
  surChangementFichier,
  supprimerLogoExistant = false,
  surChangementSupprimer,
  avertissementFacture = true,
  lectureSeule = false,
  className = "",
}: SelecteurLogoProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [apercuUrl, setApercuUrl] = useState<string | null>(null);
  const [estSurvoleDrag, setEstSurvoleDrag] = useState(false);
  const [erreurValidation, setErreurValidation] = useState<string | null>(null);

  // Maintien de l'URL d'aperçu pour le fichier sélectionné
  useEffect(() => {
    if (!fichier) {
      setApercuUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(fichier);
    setApercuUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [fichier]);

  const validerEtTraiterFichier = (nouveauFichier: File) => {
    setErreurValidation(null);

    // Vérification de la taille
    if (nouveauFichier.size > TAILLE_MAX_OCTETS) {
      setErreurValidation(`La taille maximale autorisée est de ${TAILLE_MAX_MO} Mo.`);
      return false;
    }

    // Vérification du type MIME
    const extension = nouveauFichier.name.split(".").pop()?.toLowerCase();
    const typeValide =
      TYPES_ACCEPTES.includes(nouveauFichier.type) ||
      (extension && ["png", "jpg", "jpeg", "svg"].includes(extension));

    if (!typeValide) {
      setErreurValidation("Format invalide. Formats acceptés : PNG, JPG, JPEG, SVG.");
      return false;
    }

    surChangementFichier(nouveauFichier);
    if (surChangementSupprimer && supprimerLogoExistant) {
      surChangementSupprimer(false);
    }
    return true;
  };

  const gererSelectionFichier = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichiers = e.target.files;
    if (fichiers && fichiers.length > 0) {
      validerEtTraiterFichier(fichiers[0]);
    }
    // Réinitialiser la valeur de l'input pour permettre de resélectionner le même fichier si besoin
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const gererDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEstSurvoleDrag(false);

    if (lectureSeule) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validerEtTraiterFichier(e.dataTransfer.files[0]);
    }
  };

  const gererDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!lectureSeule) {
      setEstSurvoleDrag(true);
    }
  };

  const gererDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEstSurvoleDrag(false);
  };

  const gererSuppression = () => {
    setErreurValidation(null);
    if (fichier) {
      surChangementFichier(null);
    } else if (logoActuelUrl && surChangementSupprimer) {
      surChangementSupprimer(true);
    }
  };

  const gererAnnulationSuppression = () => {
    if (surChangementSupprimer) {
      surChangementSupprimer(false);
    }
  };

  // Image à afficher en aperçu
  const imageActiveUrl = apercuUrl || (!supprimerLogoExistant ? logoActuelUrl : null);
  const aUneImage = Boolean(imageActiveUrl);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
          Logo de la boutique <span className="text-xs font-normal text-neutral-500">(facultatif)</span>
        </label>
        <span className="text-xs text-neutral-400">PNG, JPG, SVG • max 2 Mo</span>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={EXTENSIONS_ACCEPTEES}
        onChange={gererSelectionFichier}
        disabled={lectureSeule}
        className="hidden"
      />

      {aUneImage ? (
        <div className="flex items-center gap-4 p-3.5 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl transition-all">
          <div className="relative w-16 h-16 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden flex items-center justify-center p-1 shadow-xs shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageActiveUrl || ""}
              alt="Aperçu du logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {fichier ? fichier.name : "Logo actuel"}
              </span>
              {fichier && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded">
                  {(fichier.size / 1024).toFixed(0)} Ko
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
              {fichier ? "Prêt à être enregistré" : "Visible sur vos factures"}
            </p>
          </div>

          {!lectureSeule && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                title="Remplacer le logo"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Changer</span>
              </button>
              <button
                type="button"
                onClick={gererSuppression}
                title="Supprimer ce logo"
                className="inline-flex items-center justify-center p-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : supprimerLogoExistant ? (
        <div className="flex items-center justify-between p-3.5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-rose-900 dark:text-rose-200">
                Le logo sera supprimé lors de l&apos;enregistrement.
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                Vos prochaines factures n&apos;afficheront aucun logo.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={gererAnnulationSuppression}
            className="text-xs font-medium text-rose-700 hover:text-rose-800 dark:text-rose-300 underline shrink-0 ml-2"
          >
            Annuler
          </button>
        </div>
      ) : (
        <div
          onDragOver={gererDragOver}
          onDragLeave={gererDragLeave}
          onDrop={gererDrop}
          onClick={() => !lectureSeule && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            estSurvoleDrag
              ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 scale-[1.005]"
              : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
          } ${lectureSeule ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            {estSurvoleDrag ? (
              <Upload className="w-5 h-5 animate-bounce" />
            ) : (
              <ImageIcon className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
              <span className="text-amber-600 dark:text-amber-400 font-semibold underline underline-offset-2">
                Cliquez pour importer
              </span>{" "}
              ou glissez-déposez
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              PNG, JPG, JPEG ou SVG jusqu&apos;à 2 Mo
            </p>
          </div>
        </div>
      )}

      {erreurValidation && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{erreurValidation}</span>
        </div>
      )}

      {avertissementFacture && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p>
            <strong className="font-semibold">Note importante :</strong> Le logo est facultatif. Toutefois, sans ce logo, il n&apos;y aura pas de logo sur la facture remise à vos clients.
          </p>
        </div>
      )}
    </div>
  );
}

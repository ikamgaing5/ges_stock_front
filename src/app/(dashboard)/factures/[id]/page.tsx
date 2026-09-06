"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { api, ErreurApi } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { EtatErreur, SqueletteFicheDetail } from "@/components/ui-commun";
import { ModeleFacture } from "@/components/facture/modele-facture";
import { imprimerFacture, genererNomFichierFacture } from "@/lib/impression";
import type { Mouvement } from "@/types";

export default function PageFactureDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useI18n();

  const [mouvement, setMouvement] = useState<Mouvement | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await api.get<{ data: Mouvement }>(`/mouvements/${id}`);
      setMouvement(res.data);
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : t("commun.erreur"));
    } finally {
      setChargement(false);
    }
  }, [id, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  // Synchronise le titre du document pour le nom de fichier PDF
  useEffect(() => {
    if (!mouvement) return;
    const ancienTitre = document.title;
    document.title = genererNomFichierFacture(mouvement.client_nom, mouvement.created_at);
    return () => {
      document.title = ancienTitre;
    };
  }, [mouvement]);

  function lancerImpression() {
    if (!mouvement) return;
    imprimerFacture("facture-imprimable", {
      nomClient: mouvement.client_nom,
      dateIso: mouvement.created_at,
    });
  }

  if (chargement) {
    return <SqueletteFicheDetail />;
  }

  if (erreur || !mouvement) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/factures" />}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("factures.titre")}
        </Button>
        <EtatErreur message={erreur ?? t("commun.aucunResultat")} onReessayer={charger} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barre d'actions supérieure masquée à l'impression */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/factures" />}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("factures.titre")}
        </Button>

        <div className="flex items-center gap-2">
          <Button onClick={lancerImpression} className="gap-2 shadow-sm">
            <Printer className="h-4 w-4" />
            <span>{t("factures.imprimer")}</span>
          </Button>
        </div>
      </div>

      {/* Conteneur imprimable */}
      <div className="flex justify-center p-2 sm:p-6 bg-neutral-100 dark:bg-neutral-900 rounded-xl border print:p-0 print:border-none print:bg-white print:rounded-none">
        <ModeleFacture mouvement={mouvement} />
      </div>
    </div>
  );
}

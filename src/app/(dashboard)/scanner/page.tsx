"use client";

/**
 * Scanner (/scanner).
 *
 * L'écran qu'on laisse ouvert au comptoir : on scanne un IMEI, la fiche
 * de l'appareil s'affiche avec ses actions possibles. C'est le chemin le
 * plus court entre « un client se présente » et « la vente est saisie ».
 */

import { useCallback, useState } from "react";
import Link from "next/link";
import { PackagePlus, ScanLine, SearchX } from "lucide-react";
import { api, ErreurApi } from "@/lib/api";
import { formaterImei } from "@/lib/imei";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { ChampImei } from "@/components/champ-imei";
import { ActionsTelephone } from "@/components/actions-telephone";
import { Apparait, PastilleStatut, TitrePage } from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResultatImei, Telephone } from "@/types";

export default function PageScanner() {
  const { devise, deviseBoutique } = useAuth();
  const { t, formatMontant, libelleEtat, lang } = useI18n();

  const [imei, setImei] = useState("");
  const [appareil, setAppareil] = useState<Telephone | null>(null);
  const [introuvable, setIntrouvable] = useState<string | null>(null);
  const [recherche, setRecherche] = useState(false);

  const chercher = useCallback(
    async (imeiScanne: string) => {
      setRecherche(true);
      setAppareil(null);
      setIntrouvable(null);

      try {
        const reponse = await api.get<ResultatImei>(
          `/telephones/imei/${imeiScanne}`,
        );

        if (reponse.trouve && reponse.data) {
          setAppareil(reponse.data);
        } else {
          setIntrouvable(reponse.message ?? t("scanner.nonTrouve"));
        }
      } catch (e) {
        setIntrouvable(
          e instanceof ErreurApi ? e.message : t("scanner.searchFailed"),
        );
      } finally {
        setRecherche(false);
      }
    },
    [t],
  );

  /** Après une action, on recharge la fiche pour montrer le nouveau statut. */
  const rafraichirFiche = useCallback(() => {
    if (appareil) void chercher(appareil.imei);
  }, [appareil, chercher]);

  return (
    <div className="mx-auto max-w-3xl">
      <TitrePage
        titre={t("scanner.titre")}
        description={t("scanner.description")}
      />

      <Apparait>
        <Card>
          <CardContent className="pt-6">
            <ChampImei
              valeur={imei}
              onChange={setImei}
              onScanValide={(valeur) => void chercher(valeur)}
              label={t("telephones.imei")}
              viderApresScan
            />
          </CardContent>
        </Card>
      </Apparait>

      <div className="mt-6">
        {recherche ? (
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ) : appareil ? (
          <Apparait key={appareil.id}>
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">
                    {appareil.modele?.libelle ?? "Appareil"}
                  </CardTitle>
                  <p className="chiffres mt-1 font-mono text-xs text-muted-foreground">
                    {formaterImei(appareil.imei)}
                  </p>
                </div>
                <PastilleStatut statut={appareil.statut} />
              </CardHeader>

              <CardContent className="space-y-5">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                  <Info
                    libelle={t("telephones.boutique")}
                    valeur={appareil.boutique?.nom ?? "—"}
                  />
                  <Info
                    libelle={t("telephones.couleur")}
                    valeur={appareil.couleur ?? "—"}
                  />
                  <Info
                    libelle={t("commun.etat")}
                    valeur={libelleEtat(appareil.etat)}
                  />
                  <Info
                    libelle={t("telephones.prixVente")}
                    valeur={formatMontant(appareil.prix_vente, devise, appareil.boutique?.devise ?? deviseBoutique)}
                  />
                  {appareil.client_nom && (
                    <Info
                      libelle={t("telephones.clientNom")}
                      valeur={appareil.client_nom}
                    />
                  )}
                </dl>

                <div className="border-t pt-5">
                  <ActionsTelephone
                    telephone={appareil}
                    surSucces={rafraichirFiche}
                  />
                </div>

                <Link
                  href={`/telephones/${appareil.id}`}
                  className="inline-block text-sm font-medium text-primary underline underline-offset-4"
                >
                  {t("scanner.viewDetails")}
                </Link>
              </CardContent>
            </Card>
          </Apparait>
        ) : introuvable ? (
          <Apparait>
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <SearchX className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">
                    {t("scanner.appareilInconnu")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {introuvable}
                  </p>
                </div>
                <Button
                  nativeButton={false}
                  render={<Link href="/telephones/nouveau" />}
                >
                  <PackagePlus className="mr-2 h-4 w-4" />
                  {t("scanner.creerAvecImei")}
                </Button>
              </CardContent>
            </Card>
          </Apparait>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
            <ScanLine className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("scanner.attenteScan")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{libelle}</dt>
      <dd className="mt-0.5 truncate font-medium">{valeur}</dd>
    </div>
  );
}

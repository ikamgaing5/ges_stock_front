"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ErreurApi, enregistrerToken } from "@/lib/api";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function PageInvitation({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { t, lang } = useI18n();

  const [email, setEmail] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [invalide, setInvalide] = useState(false);

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    api
      .get<{ data: { email: string; role: string } }>(`/invitations/${token}`)
      .then((r) => setEmail(r.data.email))
      .catch(() => setInvalide(true))
      .finally(() => setChargement(false));
  }, [token]);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      const reponse = await api.post<{ token: string }>(
        `/invitations/${token}/accepter`,
        {
          name: nom,
          telephone: telephone || null,
          password: motDePasse,
        },
      );
      enregistrerToken(reponse.token);
      toast.success(t("auth.compteActive"));
      router.push("/telephones");
    } catch (err) {
      if (err instanceof ErreurApi) {
        setErreurs(err.parChamp());
        toast.error(err.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  if (chargement) return null;

  if (invalide || !email) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-2 p-4 text-center">
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <BasculeLangue />
          <BasculeTheme />
        </div>
        <p className="text-lg font-medium">
          {t("auth.invitationInvalide")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("auth.invitationInvalideDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <BasculeLangue />
        <BasculeTheme />
      </div>

      <form onSubmit={envoyer} className="w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-xl font-semibold">
            {t("auth.invitationTitre")}
          </h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="i-nom">{t("auth.nomComplet")}</Label>
          <Input
            id="i-nom"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder={t("auth.nomPlaceholder")}
          />
          {erreurs.name && (
            <p className="text-xs text-destructive">{erreurs.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="i-tel">{t("monCompte.telephone")}</Label>
          <Input
            id="i-tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="677 11 22 33"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="i-mdp">{t("auth.motDePasse")}</Label>
          <Input
            id="i-mdp"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />
          {erreurs.password && (
            <p className="text-xs text-destructive">{erreurs.password}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={envoiEnCours}>
          {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("auth.activerCompte")}
        </Button>
      </form>
    </div>
  );
}

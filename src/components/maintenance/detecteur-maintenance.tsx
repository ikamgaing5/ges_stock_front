"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { EcranMaintenance } from "@/components/maintenance/ecran-maintenance";
import type { InfosMaintenance } from "@/types";

export function DetecteurMaintenance({
  children,
}: {
  children: React.ReactNode;
}) {
  const { utilisateur, chargement } = useAuth();
  const chemin = usePathname();

  const [maintenance, setMaintenance] = useState<InfosMaintenance | null>(null);

  // Écouter les événements 503 Maintenance émis par le client API
  useEffect(() => {
    function onMaintenanceEvent(evenement: Event) {
      const e = evenement as CustomEvent<InfosMaintenance>;
      // Si l'utilisateur est admin, ignorer la maintenance
      if (utilisateur?.role === "admin") return;
      if (e.detail && e.detail.active) {
        setMaintenance(e.detail);
      }
    }

    window.addEventListener("telora:maintenance", onMaintenanceEvent);
    return () => {
      window.removeEventListener("telora:maintenance", onMaintenanceEvent);
    };
  }, [utilisateur]);

  // Vérification initiale légère au chargement
  useEffect(() => {
    if (chargement) return;
    // Si l'utilisateur est administrateur ou s'il est sur la page de connexion, ne pas bloquer initialement
    if (utilisateur?.role === "admin") {
      setMaintenance(null);
      return;
    }

    let actif = true;
    api
      .get<InfosMaintenance>("/maintenance/statut")
      .then((res) => {
        if (!actif) return;
        if (res.active && utilisateur?.role !== "admin") {
          setMaintenance(res);
        } else {
          setMaintenance(null);
        }
      })
      .catch(() => {
        // En cas d'erreur de ping silencieuse, ignorer
      });

    return () => {
      actif = false;
    };
  }, [utilisateur, chargement]);

  // Si on est sur une route admin ou si l'utilisateur est admin, ne jamais afficher l'écran de maintenance
  const estPageAdmin = chemin?.startsWith("/admin");
  if (utilisateur?.role === "admin" || estPageAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {maintenance && maintenance.active && (
        <EcranMaintenance
          maintenance={maintenance}
          onMaintenanceTerminee={() => setMaintenance(null)}
        />
      )}
      {children}
    </>
  );
}

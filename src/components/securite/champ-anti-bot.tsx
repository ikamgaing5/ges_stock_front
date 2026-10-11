"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Composant de sécurité invisible :
 * 1. Honeypot (piège à robots / IA) : champ caché qui ne doit JAMAIS être rempli par un humain.
 * 2. Time-trap (mesure du temps de complétion) : vérifie qu'un humain a pris au moins ~1 seconde pour soumettre.
 */
export function ChampAntiBot({
  onChangement,
}: {
  onChangement?: (donnees: { _hp_telora_anti_bot: string; _hp_timestamp: number }) => void;
}) {
  const [timestamp] = useState<number>(() => Date.now());
  const [valeurHoneypot, setValeurHoneypot] = useState("");
  const onChangementRef = useRef(onChangement);

  useEffect(() => {
    onChangementRef.current = onChangement;
  }, [onChangement]);

  return (
    <div
      aria-hidden="true"
      style={{
        opacity: 0,
        position: "absolute",
        top: 0,
        left: 0,
        height: 0,
        width: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* 1. Champ piège invisible */}
      <label htmlFor="_hp_telora_anti_bot">Ne pas remplir ce champ si vous êtes humain</label>
      <input
        type="text"
        name="_hp_telora_anti_bot"
        id="_hp_telora_anti_bot"
        value={valeurHoneypot}
        onChange={(e) => {
          const val = e.target.value;
          setValeurHoneypot(val);
          onChangementRef.current?.({ _hp_telora_anti_bot: val, _hp_timestamp: timestamp });
        }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* 2. Horodatage pour time-trap */}
      <input
        type="hidden"
        name="_hp_timestamp"
        id="_hp_timestamp"
        value={timestamp}
        readOnly
      />
    </div>
  );
}

/**
 * Hook utilitaire pour intégrer les champs anti-bot dans les requêtes API React (state-based).
 */
export function useAntiBot() {
  const [antiBotData, setAntiBotData] = useState(() => ({
    _hp_telora_anti_bot: "",
    _hp_timestamp: Date.now(),
  }));

  const handleChangement = useCallback(
    (data: { _hp_telora_anti_bot: string; _hp_timestamp: number }) => {
      setAntiBotData(data);
    },
    [],
  );

  const ComposantAntiBot = useCallback(
    () => <ChampAntiBot onChangement={handleChangement} />,
    [handleChangement],
  );

  return {
    antiBotData,
    ChampAntiBot: ComposantAntiBot,
  };
}

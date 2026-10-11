"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ContexteSidebarType = {
  ouverte: boolean;
  basculer: () => void;
  setOuverte: (ouverte: boolean) => void;
};

const ContexteSidebar = createContext<ContexteSidebarType>({
  ouverte: true,
  basculer: () => {},
  setOuverte: () => {},
});

export function ContexteSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ouverte, setOuverteState] = useState(true);

  useEffect(() => {
    try {
      const sauvegarde = localStorage.getItem("telora-sidebar-ouverte");
      if (sauvegarde !== null) {
        setOuverteState(sauvegarde === "true");
      }
    } catch {}
  }, []);

  const basculer = () => {
    setOuverteState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("telora-sidebar-ouverte", String(next));
      } catch {}
      return next;
    });
  };

  const setOuverte = (val: boolean) => {
    setOuverteState(val);
    try {
      localStorage.setItem("telora-sidebar-ouverte", String(val));
    } catch {}
  };

  return (
    <ContexteSidebar.Provider value={{ ouverte, basculer, setOuverte }}>
      {children}
    </ContexteSidebar.Provider>
  );
}

export function useSidebar() {
  return useContext(ContexteSidebar);
}

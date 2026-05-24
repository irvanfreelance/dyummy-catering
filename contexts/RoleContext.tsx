"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { RoleKey, DEFAULT_ROLE } from "@/lib/roleConfig";

const STORAGE_KEY = "dyummy_active_role";

interface RoleContextType {
  activeRole: RoleKey;
  setActiveRole: (role: RoleKey) => void;
}

const RoleContext = createContext<RoleContextType>({
  activeRole: DEFAULT_ROLE,
  setActiveRole: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRoleState] = useState<RoleKey>(DEFAULT_ROLE);

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as RoleKey | null;
    if (stored) setActiveRoleState(stored);
  }, []);

  const setActiveRole = (role: RoleKey) => {
    setActiveRoleState(role);
    localStorage.setItem(STORAGE_KEY, role);
  };

  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}

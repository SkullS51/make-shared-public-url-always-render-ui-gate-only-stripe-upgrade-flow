import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

interface MenuContextValue {
  isOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const setMenuOpen = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <MenuContext.Provider value={{ isOpen, setMenuOpen, toggleMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
}

import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useIsomorphicLayoutEffect } from "~/hooks";

import { AntdProvider } from "../AntdProvider";
import "./ThemeProvider.scss";

export interface ThemeData {
  isDark: boolean;
}

export type OOMOLPrefersColorScheme = "auto" | "dark" | "light";

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

export function useDarkMode(
  prefersColorScheme?: OOMOLPrefersColorScheme,
): boolean {
  const [darkMode, setDarkMode] = useState(() =>
    prefersColorScheme === "auto" && prefersDark
      ? prefersDark.matches
      : prefersColorScheme === "dark",
  );

  useEffect(() => {
    if (prefersColorScheme === "auto" && prefersDark) {
      setDarkMode(prefersDark.matches);
      const handler = (event: MediaQueryListEvent): void =>
        setDarkMode(event.matches);
      prefersDark.addEventListener("change", handler);

      return () => prefersDark.removeEventListener("change", handler);
    }
    else {
      setDarkMode(prefersColorScheme === "dark");
    }
  }, [prefersColorScheme]);

  return darkMode;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  prefersColorScheme: OOMOLPrefersColorScheme;
}

const ThemeContext = createContext<ThemeData | null>({ isDark: false });

export const ThemeProvider = ({
  children,
  prefersColorScheme,
}: PropsWithChildren<ThemeProviderProps>): ReactElement => {
  const darkMode = useDarkMode(prefersColorScheme);

  useIsomorphicLayoutEffect(() => {
    document.body.classList.add("oomol-theme-root", "oomol-theme-light");
    document.body.classList.toggle("oomol-theme-dark", darkMode);
  }, [darkMode]);

  const themeValue = useMemo(() => ({ isDark: darkMode }), [darkMode]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <AntdProvider darkMode={darkMode}>{children}</AntdProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeData = (): ThemeData => {
  const data = useContext(ThemeContext);

  if (!data) {
    throw new Error("Must be used within a ThemeProvider");
  }
  return data;
};

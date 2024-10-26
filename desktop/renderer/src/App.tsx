import type { PropsWithChildren } from "react";
import React from "react";
import { useVal } from "use-value-enhancer";
import { AppContextProvider } from "./components/AppContextProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { type AppContext, Routes } from "./routes";

export interface StudioHomeProps {
  appContext: AppContext;
}

export const StudioHome = ({
  appContext,
  children,
}: PropsWithChildren<StudioHomeProps>) => {
  const prefersColorScheme = useVal(appContext.settingStore.prefersColorScheme$);

  return (
    <AppContextProvider context={appContext}>
      <ThemeProvider
        prefersColorScheme={prefersColorScheme}
      >
        <Routes />
        {children}
      </ThemeProvider>
    </AppContextProvider>
  );
};

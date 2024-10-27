import type { PropsWithChildren } from "react";
import React from "react";
import { useVal } from "use-value-enhancer";
import { I18nProvider } from "val-i18n-react";
import { AppContextProvider } from "./components/AppContextProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { useI18nLoader } from "./hooks";
import { type AppContext, Routes } from "./routes";

export interface StudioHomeProps {
  appContext: AppContext;
}

export const StudioHome = ({
  appContext,
  children,
}: PropsWithChildren<StudioHomeProps>) => {
  const prefersColorScheme = useVal(appContext.settingStore.prefersColorScheme$);
  const i18n = useI18nLoader(appContext.settingStore.localLanguage$);

  if (!i18n) {
    return null; // blank page
  }

  return (
    <AppContextProvider context={appContext}>
      <I18nProvider i18n={i18n}>
        <ThemeProvider
          prefersColorScheme={prefersColorScheme}
        >
          <Routes />
          {children}
        </ThemeProvider>
      </I18nProvider>
    </AppContextProvider>
  );
};

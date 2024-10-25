import type { PropsWithChildren } from "react";
import React from "react";
import { AppContextProvider } from "./components/AppContextProvider";
import { type AppContext, Routes } from "./routes";

export interface StudioHomeProps {
  appContext: AppContext;
}

export const StudioHome = ({
  appContext,
  children,
}: PropsWithChildren<StudioHomeProps>) => {
  return (
    <AppContextProvider context={appContext}>
      <Routes />
      {children}
    </AppContextProvider>
  );
};

import { useContext } from "react";
import { useVal } from "use-value-enhancer";

import { AppContextContext } from "~/components/AppContextProvider";

import type { AppContext } from "~/routes";
import type { OSLiteral } from "~/routes/constants";

export const useAppContext = (): Readonly<AppContext> => {
  const appContext = useContext(AppContextContext);
  if (!appContext) {
    throw new Error("AppContextProvider not found");
  }
  return appContext;
};

export const useOS = (): OSLiteral => useVal(useAppContext().os$);

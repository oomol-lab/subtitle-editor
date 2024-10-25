import type { AppContext } from "./routes";
import React from "react";

import { createRoot } from "react-dom/client";
import { StudioHome } from "./App";

const appContext: AppContext = {};

const root = createRoot(document.getElementById("root")!);
root.render(
  <StudioHome
    appContext={appContext}
  />,
);

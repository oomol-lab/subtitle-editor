import type { AppContext } from "./routes";
import React from "react";
import { createRoot } from "react-dom/client";

import { val } from "value-enhancer";
import { StudioHome } from "./App";
import { OS } from "./routes/constants";
import { SettingStore } from "./stores/setting.store";
import "./style.css";

const os$ = val(OS.Windows);
const settingStore = new SettingStore();

const appContext: AppContext = {
  os$,
  settingStore,
};

const root = createRoot(document.getElementById("root")!);
root.render(
  <StudioHome
    appContext={appContext}
  />,
);

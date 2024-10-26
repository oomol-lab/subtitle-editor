import type { ReadonlyVal } from "value-enhancer";
import type { OSLiteral } from "./constants";

import React, { useMemo } from "react";
import {
  createHashRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import type { SettingStore } from "~/stores/setting.store";
import { RoutePath } from "./constants";
import { Home } from "./Home";
import { HomeRoot } from "./HomeRoot";
import { Settings } from "./Settings";

export interface AppContext {
  os$: ReadonlyVal<OSLiteral>;
  settingStore: SettingStore;
};

const createRouter = () =>
  createHashRouter([
    {
      path: RoutePath.Root,
      children: [
        {
          path: RoutePath.Root,
          element: <Navigate to={RoutePath.HomeRoot} replace />,
        },
        {
          path: RoutePath.HomeRoot,
          element: <HomeRoot />,
          children: [
            {
              path: RoutePath.HomeRoot,
              element: <Navigate to={RoutePath.projects} replace />,
            },
            {
              path: RoutePath.projects,
              element: <Home />,
            },
            {
              path: RoutePath.Settings,
              element: <Settings />,
            },
          ],
        },
      ],
    },
  ]);

export const Routes = () => {
  const router = useMemo(createRouter, []);

  return <RouterProvider router={router} />;
};

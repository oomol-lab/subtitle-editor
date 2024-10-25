import React, { useMemo } from "react";
import {
  createHashRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { RoutePath } from "./constants";
import { Home } from "./Home";

export interface AppContext {};

const createRouter = () =>
  createHashRouter([
    {
      path: RoutePath.Root,
      children: [
        {
          path: RoutePath.Root,
          element: <Navigate to={RoutePath.Home} replace />,
        },
        {
          path: RoutePath.Home,
          element: <Home />,
        },
      ],
    },
  ]);

export const Routes = () => {
  const router = useMemo(createRouter, []);

  return <RouterProvider router={router} />;
};

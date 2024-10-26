import type { MappingAlgorithm, ThemeConfig } from "antd";
import type { FC } from "react";
import { ConfigProvider, theme } from "antd";

import React, { useMemo } from "react";

const antdDarkTheme: MappingAlgorithm = (seedToken, mapToken) => ({
  ...theme.darkAlgorithm(seedToken, mapToken),
  colorBgLayout: "#161B22",
});

const antdLightTheme: MappingAlgorithm = seedToken => ({
  ...theme.defaultAlgorithm(seedToken),
  colorBgLayout: "#ecf0f7",
});

export const AntdProvider: FC<{
  darkMode: boolean;
  children: React.ReactNode;
}> = ({ darkMode, children }) => {
  const theme: ThemeConfig = useMemo(
    () => ({
      token: {
        colorPrimary: "#7d7fe9",
      },
      algorithm: darkMode ? antdDarkTheme : antdLightTheme,
      components: {
        Table: {
          cellPaddingInlineSM: 4,
          cellPaddingBlockSM: 5,
          cellFontSizeSM: 12,
        },
      },
    }),
    [darkMode],
  );

  return <ConfigProvider theme={theme}>{children}</ConfigProvider>;
};

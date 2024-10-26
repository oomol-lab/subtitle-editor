import type { FC } from "react";
import type { Val } from "value-enhancer";
import React from "react";
import { useLocation } from "react-router-dom";

import { useVal } from "use-value-enhancer";
import { HomeTitleBarLayout } from "~/components/HomeTitleBar";
import { useIsomorphicLayoutEffect, useOS } from "~/hooks";
import { OS } from "../constants";

export interface HomeRootTitleBarProps {
  titleBar$: Val<React.ReactNode>;
}

const DefaultHomeTitleBar: FC<DefaultHomeTitleBarProps> = () => {
  const os = useOS();
  return (
    <HomeTitleBarLayout
      footer={
        os === OS.Mac && (
          <>
            logo
          </>
        )
      }
    />
  );
};

export const HomeRootTitleBar = ({
  titleBar$,
}: HomeRootTitleBarProps) => {
  const titleBar = useVal(titleBar$, true);
  const location = useLocation();
  useIsomorphicLayoutEffect(
    () => () => {
      titleBar$.set(null);
    },
    [location],
  );
  return <>{titleBar || <DefaultHomeTitleBar />}</>;
};

interface DefaultHomeTitleBarProps {}

import React, { createElement, memo, useMemo } from "react";

import { useLocation, useOutletContext } from "react-router-dom";

import { useIsomorphicLayoutEffect } from "~/hooks";

import type { RouteOutletContext } from "~/typings";
import styles from "./HomeTitleBar.module.scss";

/**
 * Set its children to the title bar.
 */
export const TitleBarSetter = /* @__PURE__ */ memo<React.PropsWithChildren>(
  ({ children }) => {
    const setChild = useOutletContext<RouteOutletContext>();
    useIsomorphicLayoutEffect(() => {
      setChild(children);
    }, [children, setChild]);
    return null;
  },
);

export interface HomeTitleBarProps {
  title?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * A default title bar UI.
 */
export const HomeTitleBarLayout = ({ title, footer }: HomeTitleBarProps) => {
  // TODO: i18n
  // const t = useTranslate();
  const { pathname } = useLocation();
  const routeName: string | undefined = (/^\/home\/([^/]+)/.exec(pathname) || [
    "",
    "",
  ])[1];
  const name = useMemo(() => {
    if (title) {
      return title;
    }
    return routeName && routeName;
  }, [title, routeName]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{name}</h1>
      <div className={styles.footer}>
        {/* {routeName === "community" && <PublishButton />} */}
        {footer}
      </div>
    </div>
  );
};

/**
 * Set a default UI to the title bar.
 */
export const HomeTitleBar = (props: HomeTitleBarProps) => (
  <TitleBarSetter>{createElement(HomeTitleBarLayout, props)}</TitleBarSetter>
);

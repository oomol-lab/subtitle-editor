import type { Val } from "value-enhancer";
import React, { useState } from "react";

import { Outlet } from "react-router-dom";

import { val } from "value-enhancer";
import { useOS } from "~/hooks";
import type { RouteOutletContext } from "~/typings";
import { OS } from "../constants";
import styles from "./HomeRoot.module.scss";
import { HomeRootTitleBar } from "./HomeRootTitleBar";
import { SideNav } from "./SideNav";

export const HomeRoot = () => {
  const os = useOS();
  const [titleBar$] = useState<Val<React.ReactNode>>(val);
  const outletContext: RouteOutletContext = titleBar$.set;

  return (
    <div className={styles.container}>
      <div
        className={`${styles.sidebar} ${
          os === OS.Mac ? styles["sidebar-mac"] : ""
        }`}
      >
        {os !== OS.Mac && (
          <div className={styles["sidebar-header"]}>
            <div className={styles["sidebar-header-box"]}>
              <div className={styles.left}>
                {/* TODO: add Logo */}
              </div>
            </div>
          </div>
        )}
        <div className={styles["sidebar-content"]}>
          <SideNav />
        </div>
      </div>
      <div className={styles.main}>
        <div
          className={`${styles.header} ${
            os === OS.Mac ? styles["header-mac"] : ""
          }`}
        >
          <HomeRootTitleBar
            titleBar$={titleBar$}
          />
        </div>
        <div className={styles.content}>
          <Outlet context={outletContext} />
        </div>
      </div>
    </div>
  );
};

import type { RadioChangeEvent } from "antd";

import type { OOMOLPrefersColorScheme } from "../ThemeProvider";
import { Radio } from "antd";

import React from "react";
import styles from "./AppearancePicker.module.scss";

import autoSVG from "./icons/auto.svg";
import darkSVG from "./icons/dark.svg";
import lightSVG from "./icons/light.svg";

export interface AppearancePickerProps {
  defaultValue: OOMOLPrefersColorScheme;
  changeAppearance: (event: RadioChangeEvent) => void;
}

export const AppearancePicker: React.FC<AppearancePickerProps> = ({
  defaultValue,
  changeAppearance,
}) => {
  // const t = useTranslate();
  return (
    <div className={styles.container}>
      <Radio.Group defaultValue={defaultValue} onChange={changeAppearance}>
        <Radio value="light">
          <div className={styles.options}>
            <img src={lightSVG} />
            {/* <span>{t("settings.theme-light")}</span> */}
            <span>light</span>
          </div>
        </Radio>
        <Radio value="dark">
          <div className={styles.options}>
            <img src={darkSVG} />
            {/* <span>{t("settings.theme-dark")}</span> */}
            <span>dark</span>
          </div>
        </Radio>
        <Radio value="auto">
          <div className={styles.options}>
            <img src={autoSVG} />
            {/* <span>{t("settings.theme-auto")}</span> */}
            <span>auto</span>
          </div>
        </Radio>
      </Radio.Group>
    </div>
  );
};

import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { Radio } from "antd";
import React from "react";
import { useVal } from "use-value-enhancer";
import { useLang, useTranslate } from "val-i18n-react";
import { AppearancePicker } from "~/components/AppearancePicker";
import type { OOMOLPrefersColorScheme } from "~/components/ThemeProvider";
import { useAppContext } from "~/hooks";
import styles from "./index.module.scss";

enum SelectLanguage {
  Chinese = "zh-CN",
  English = "en",
}

type Lang = "en" | "zh-CN";

export const Settings = () => {
  const t = useTranslate();
  const language = useLang();
  const { settingStore } = useAppContext();

  const prefersColorScheme = useVal(settingStore.prefersColorScheme$);

  const changeAppearance = (event: CheckboxChangeEvent) => {
    const prefersColorScheme: OOMOLPrefersColorScheme = event.target.value;
    settingStore.updatePrefersColorScheme(prefersColorScheme);
  };

  const changeLanguage = async (event: CheckboxChangeEvent) => {
    const lang: Lang = event.target.value;
    settingStore.updateLocalLanguage(lang);
  };

  return (
    <div className={styles.container}>
      <p className={styles.label}>{t("settings.appearance")}</p>
      <AppearancePicker
        defaultValue={prefersColorScheme}
        changeAppearance={changeAppearance}
      />
      <div className={styles.languageSetting}>
        <span className={styles.label}>{t("settings.language")}</span>
        <Radio.Group
          defaultValue={
            language === "zh-CN"
              ? SelectLanguage.Chinese
              : SelectLanguage.English
          }
          rootClassName={styles.radioGroup}
          onChange={changeLanguage}
        >
          <Radio value={SelectLanguage.Chinese}>
            <span>{t("settings.chinese")}</span>
          </Radio>
          <Radio value={SelectLanguage.English}>
            <span>English</span>
          </Radio>
        </Radio.Group>
      </div>
    </div>
  );
};

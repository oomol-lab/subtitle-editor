import type { CheckboxChangeEvent } from "antd/es/checkbox";
import React from "react";

import { useVal } from "use-value-enhancer";
import { AppearancePicker } from "~/components/AppearancePicker";
import type { OOMOLPrefersColorScheme } from "~/components/ThemeProvider";
import { useAppContext } from "~/hooks";

import styles from "./index.module.scss";

export const Settings = () => {
  // const t = useTranslate();
  // const language = useLang();
  const { settingStore } = useAppContext();

  const prefersColorScheme = useVal(settingStore.prefersColorScheme$);

  // const [selectLanguage, setSelectLanguage] = useState<Lang>(language as Lang);

  const changeAppearance = (event: CheckboxChangeEvent) => {
    const prefersColorScheme: OOMOLPrefersColorScheme = event.target.value;
    settingStore.updatePrefersColorScheme(prefersColorScheme);
  };

  return (
    <div className={styles.container}>
      {/* <p className={styles.label}>{t("setting.appearance")}</p> */}
      <p className={styles.label}>Appearance</p>
      <AppearancePicker
        defaultValue={prefersColorScheme}
        changeAppearance={changeAppearance}
      />
      {/* <div className={styles.languageSetting}> */}
      {/* <span className={styles.label}>{t("setting.language")}</span> */}
      {/* <Radio.Group
          value={language}
          defaultValue={
            language === "zh-CN"
              ? SelectLanguage.Chinese
              : SelectLanguage.English
          }
          onChange={openRestartModal}
          rootClassName={styles.radioGroup}
        >
          <Radio value={SelectLanguage.Chinese}>
            <span>{t("setting.chinese")}</span>
          </Radio>
          <Radio value={SelectLanguage.English}>
            <span>English</span>
          </Radio>
        </Radio.Group> */}
      {/* </div> */}
    </div>
  );
};

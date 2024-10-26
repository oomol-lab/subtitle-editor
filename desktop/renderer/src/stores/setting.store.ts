import type { Val } from "value-enhancer";
import { val } from "value-enhancer";

import type { OOMOLPrefersColorScheme } from "~/components/ThemeProvider";

export class SettingStore {
  public localLanguage$: Val<string> = val(
    localStorage.getItem("language") ?? "en",
  );

  public prefersColorScheme$: Val<OOMOLPrefersColorScheme> = val(
    (localStorage.getItem("prefersColorScheme") as OOMOLPrefersColorScheme)
    ?? "dark",
  );

  public updateLocalLanguage(language: string): void {
    this.localLanguage$.set(language);
    localStorage.setItem("language", language);
  }

  public updatePrefersColorScheme(
    prefersColorScheme: OOMOLPrefersColorScheme,
  ): void {
    this.prefersColorScheme$.set(prefersColorScheme);
    localStorage.setItem("prefersColorScheme", prefersColorScheme);
  }
}

"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n/config";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      if (!i18n.isInitialized) {
        await i18n.init();
      }

      try {
        const res = await fetch("/api/preferences");
        const { language } = (await res.json()) as { language: string };
        if (language && language !== i18n.language) {
          await i18n.changeLanguage(language);
        }
      } catch {
        // fall back to whatever was already set (localStorage or 'en')
      }

      setReady(true);
    }

    init();
  }, []);

  if (!ready) return null;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

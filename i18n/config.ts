import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

const LANGUAGE_KEY = 'preferred_language';
const resources = {
  en: { translation: enTranslations },
  fr: { translation: frTranslations },
};

if (!i18n.isInitialized) {
  const savedLanguage =
    typeof window !== 'undefined' ? (localStorage.getItem(LANGUAGE_KEY) ?? 'en') : 'en';

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

  i18n.on('languageChanged', (lng) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_KEY, lng);
    }
  });
} else {
  // During Fast Refresh/HMR, i18next stays initialized and would otherwise keep
  // stale resources. Refresh bundles so newly added keys are available immediately.
  i18n.addResourceBundle('en', 'translation', enTranslations, true, true);
  i18n.addResourceBundle('fr', 'translation', frTranslations, true, true);
}

export default i18n;

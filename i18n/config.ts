import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

const LANGUAGE_KEY = 'preferred_language';

if (!i18n.isInitialized) {
  const savedLanguage =
    typeof window !== 'undefined' ? (localStorage.getItem(LANGUAGE_KEY) ?? 'en') : 'en';

  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: enTranslations },
      fr: { translation: frTranslations },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

  i18n.on('languageChanged', (lng) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_KEY, lng);
    }
  });
}

export default i18n;

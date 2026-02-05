# Internationalization (i18n)

This application uses `react-i18next` for multilanguage support.

## Current Languages

- **English (en)** - Default language
- **French (fr)**

## Features

- Language preference is stored in localStorage
- Automatic language detection and persistence
- Easy to add new languages

## Adding a New Language

1. Create a new translation file in `src/i18n/locales/` (e.g., `es.json` for Spanish)
2. Copy the structure from `en.json` or `fr.json`
3. Translate all the values
4. Import and add the new language in `src/i18n/config.js`:

```javascript
import esTranslations from './locales/es.json';

// Add to resources
resources: {
  en: { translation: enTranslations },
  fr: { translation: frTranslations },
  es: { translation: esTranslations } // New language
}
```

5. Update the `LanguageSwitcher` component to include the new language:

```javascript
const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'es', label: 'ES', name: 'Español' } // New language
];
```

## Usage in Components

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
    </div>
  );
}
```

## Translation Keys Structure

- `app.*` - Application-level strings (loading, errors, etc.)
- `nav.*` - Navigation menu items
- `dashboard.*` - Dashboard component strings
- `rgaa.*` - RGAA report strings
- `violations.*` - Violations report strings
- `carbon.*` - Carbon footprint report strings

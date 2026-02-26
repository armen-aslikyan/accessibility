"use client";

import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "EN", name: "English" },
  { code: "fr", label: "FR", name: "Français" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  async function handleChange(code: string) {
    await i18n.changeLanguage(code);
    await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: code }),
    });
  }

  return (
    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
            i18n.language === lang.code
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
          title={lang.name}
          aria-label={`Switch to ${lang.name}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

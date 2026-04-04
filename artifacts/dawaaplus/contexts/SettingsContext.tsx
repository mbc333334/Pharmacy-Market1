import React, { createContext, useContext, useState, useCallback } from "react";
import { LANGUAGES, COUNTRIES, Language, Country } from "@/data/locales";
import { getTranslations, Translations } from "@/constants/translations";

interface SettingsContextType {
  language: Language;
  country: Country;
  setLanguage: (lang: Language) => void;
  setCountry: (country: Country) => void;
  t: Translations;
}

const DEFAULT_LANGUAGE = LANGUAGES.find(l => l.code === "ar")!;
const DEFAULT_COUNTRY = COUNTRIES.find(c => c.code === "IQ")!;

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [country, setCountryState] = useState<Country>(DEFAULT_COUNTRY);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const setCountry = useCallback((c: Country) => {
    setCountryState(c);
  }, []);

  const t = getTranslations(language.code);

  return (
    <SettingsContext.Provider value={{ language, country, setLanguage, setCountry, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

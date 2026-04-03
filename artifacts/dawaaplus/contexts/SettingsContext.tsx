import React, { createContext, useContext, useState, useCallback } from "react";
import { LANGUAGES, COUNTRIES, Language, Country } from "@/data/locales";

interface SettingsContextType {
  language: Language;
  country: Country;
  setLanguage: (lang: Language) => void;
  setCountry: (country: Country) => void;
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

  return (
    <SettingsContext.Provider value={{ language, country, setLanguage, setCountry }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

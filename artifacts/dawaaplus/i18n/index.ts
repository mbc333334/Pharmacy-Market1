import { useSettings } from "@/contexts/SettingsContext";
import { LANGUAGES } from "@/data/locales";
import translations, { LangCode, TranslationKey } from "./translations";

export function useTranslation() {
  const { language, setLanguage } = useSettings();
  const lang = (language?.code ?? "ar") as LangCode;
  const t = (key: TranslationKey): string => {
    return translations[lang]?.[key] ?? translations["ar"][key] ?? key;
  };
  const isRTL = language?.rtl ?? true;
  const setLang = (code: LangCode) => {
    const found = LANGUAGES.find(l => l.code === code);
    if (found) setLanguage(found);
  };
  return { t, lang, isRTL, setLang };
}

export { translations };
export type { LangCode, TranslationKey };

import { useSettings } from "@/contexts/SettingsContext";
import { LANGUAGES } from "@/data/locales";
import translations, { LangCode, TranslationKey } from "./translations";

const SUPPORTED: LangCode[] = ["ar", "ku", "en", "fa", "tr", "fr", "de", "es", "ru", "zh", "ko", "ja", "ur"];
const RTL_CODES = new Set(["ar", "ku", "fa", "ur", "ps", "sd", "ug"]);

export function useTranslation() {
  const { language, setLanguage } = useSettings();
  const rawCode = language?.code ?? "ar";

  const lang: LangCode = SUPPORTED.includes(rawCode as LangCode)
    ? (rawCode as LangCode)
    : RTL_CODES.has(rawCode) ? "ar" : "en";

  const t = (key: TranslationKey): string => {
    return translations[lang]?.[key] ?? translations["en"]?.[key] ?? translations["ar"][key] ?? key;
  };

  const isRTL = RTL_CODES.has(rawCode);

  const setLang = (code: string) => {
    const found = LANGUAGES.find(l => l.code === code);
    if (found) setLanguage(found);
  };

  return { t, lang, isRTL, setLang, rawCode };
}

export { translations, SUPPORTED };
export type { LangCode, TranslationKey };

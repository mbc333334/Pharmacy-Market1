import { useSettings } from "@/contexts/SettingsContext";
import translations, { LangCode, TranslationKey } from "./translations";

export function useTranslation() {
  const { language } = useSettings();
  const lang = (language?.code ?? "ar") as LangCode;
  const t = (key: TranslationKey): string => {
    return translations[lang]?.[key] ?? translations["ar"][key] ?? key;
  };
  const isRTL = language?.rtl ?? true;
  return { t, lang, isRTL };
}

export { translations };
export type { LangCode, TranslationKey };

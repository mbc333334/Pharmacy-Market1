import { useSettings } from "@/contexts/SettingsContext";
import { Translations } from "@/constants/translations";

interface UseTranslationResult {
  t: (key: keyof Translations | string, fallback?: string) => string;
  lang: string;
  isRtl: boolean;
}

export function useTranslation(): UseTranslationResult {
  const { t: translations, language } = useSettings();

  const t = (key: keyof Translations | string, fallback?: string): string => {
    const val = (translations as any)[key];
    if (val !== undefined && val !== null) return String(val);
    if (fallback !== undefined) return fallback;
    return String(key);
  };

  return {
    t,
    lang: language.code,
    isRtl: language.rtl,
  };
}

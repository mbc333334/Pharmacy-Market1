export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

export interface Country {
  code: string;
  name: string;
  nameAr: string;
  flag: string;
  dialCode: string;
}

export const LANGUAGES: Language[] = [
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇮🇶", rtl: true },
  { code: "ku", name: "Kurdish", nativeName: "کوردی", flag: "☀️", rtl: true },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", rtl: false },
];

export const COUNTRIES: Country[] = [
  { code: "IQ", name: "Iraq", nameAr: "العراق", flag: "🇮🇶", dialCode: "+964" },
  { code: "SA", name: "Saudi Arabia", nameAr: "السعودية", flag: "🇸🇦", dialCode: "+966" },
  { code: "AE", name: "UAE", nameAr: "الإمارات", flag: "🇦🇪", dialCode: "+971" },
  { code: "KW", name: "Kuwait", nameAr: "الكويت", flag: "🇰🇼", dialCode: "+965" },
  { code: "JO", name: "Jordan", nameAr: "الأردن", flag: "🇯🇴", dialCode: "+962" },
  { code: "TR", name: "Turkey", nameAr: "تركيا", flag: "🇹🇷", dialCode: "+90" },
  { code: "IR", name: "Iran", nameAr: "إيران", flag: "🇮🇷", dialCode: "+98" },
  { code: "SY", name: "Syria", nameAr: "سوريا", flag: "🇸🇾", dialCode: "+963" },
  { code: "LB", name: "Lebanon", nameAr: "لبنان", flag: "🇱🇧", dialCode: "+961" },
  { code: "EG", name: "Egypt", nameAr: "مصر", flag: "🇪🇬", dialCode: "+20" },
];

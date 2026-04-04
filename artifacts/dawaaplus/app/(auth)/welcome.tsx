import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  Modal, TextInput, ActivityIndicator, ScrollView, Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "@/i18n";
import { LANGUAGES } from "@/data/locales";
import { useAuth } from "@/contexts/AuthContext";

const SUPPORTED_CODES = ["ar", "ku", "en", "fa", "tr", "fr", "de", "es", "ru", "zh", "ko", "ja", "ur"];
const SECRET_TAPS = 7;

const SUPPORTED_LANGS = (LANGUAGES || []).filter(l => l && SUPPORTED_CODES.indexOf(l.code) >= 0);
const OTHER_LANGS     = (LANGUAGES || []).filter(l => l && SUPPORTED_CODES.indexOf(l.code) < 0);

const BASE = "https://d80a945d-15b6-4a6b-b981-dfea2b877e74-00-27jjkp5rhz57t.riker.replit.dev";

// ─────────────────────────────────────────────────────────────
// WEB LANDING PAGE
// ─────────────────────────────────────────────────────────────
function WebLanding() {
  const { language, setLanguage } = useSettings();
  const { t, rawCode } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);
  const [langSearch, setLangSearch] = useState("");

  const allLangs = LANGUAGES || [];
  const currentLang = allLangs.find(l => l.code === rawCode) ?? allLangs[0] ?? { code: "ar", nativeName: "العربية", flag: "🇮🇶", name: "Arabic", rtl: true };
  const isRTL = currentLang.rtl ?? true;

  const q = langSearch.trim().toLowerCase();
  const matchesSearch = (l: typeof allLangs[0]) =>
    !q || (l.nativeName || "").toLowerCase().indexOf(q) >= 0 || (l.name || "").toLowerCase().indexOf(q) >= 0;
  const filteredSupported = SUPPORTED_LANGS.filter(matchesSearch);
  const filteredOthers    = OTHER_LANGS.filter(matchesSearch);

  const openLang = () => { setLangSearch(""); setShowLangModal(true); };
  const open = (url: string) => Linking.openURL(url);

  const portals = [
    { icon: "storefront", color: Colors.primary,   bg: "#E8F7F1", label: "بوابة الصيدليات",  sub: "إدارة مخزونك وطلباتك",       url: `${BASE}/dawaaplus-pharmacies` },
    { icon: "cube",       color: "#0D7A54",         bg: "#E8F5F0", label: "بوابة المذاخر",    sub: "ربط الصيدليات وإدارة التوريد", url: `${BASE}/dawaaplus-warehouses` },
    { icon: "bicycle",    color: "#D69E2E",         bg: "#FFF8E7", label: "بوابة التوصيل",    sub: "تتبع الطلبات والتوصيل",       url: `${BASE}/dawaaplus-delivery` },
    { icon: "shield",     color: "#7C3AED",         bg: "#F5F0FF", label: "لوحة الإدارة",     sub: "إشراف كامل على المنصة",       url: `${BASE}/dawaaplus-web` },
  ];

  const features = [
    { icon: "flash",              color: "#F59E0B", label: "توصيل سريع",        desc: "وصول الدواء لباب منزلك خلال ساعات" },
    { icon: "shield-checkmark",   color: Colors.primary, label: "أدوية أصلية ١٠٠٪", desc: "جميع الأدوية مرخصة ومضمونة الجودة" },
    { icon: "document-text",      color: "#3B82F6", label: "وصفات إلكترونية",   desc: "دعم كامل للوصفات الطبية الرقمية" },
    { icon: "storefront",         color: "#8B5CF6", label: "+٢٤٠٠ صيدلية",       desc: "أكبر شبكة صيدليات في كردستان" },
    { icon: "trending-up",        color: "#EC4899", label: "إدارة ذكية",          desc: "تقارير ومبيعات لحظية لصيدليتك" },
    { icon: "people",             color: "#10B981", label: "دعم ٢٤/٧",             desc: "فريق دعم متاح على مدار الساعة" },
  ];

  const downloads = [
    { icon: "logo-apple",   label: "App Store",      sub: "iOS",            color: "#000" },
    { icon: "logo-google-playstore" as any, label: "Google Play", sub: "Android", color: "#34A853" },
    { icon: "apps",         label: "App Gallery",    sub: "Huawei",         color: "#CF0A2C" },
    { icon: "download",     label: "تنزيل APK",      sub: "Android Direct", color: "#3B82F6" },
  ];

  return (
    <ScrollView style={wStyles.page} showsVerticalScrollIndicator={false}>
      {/* ── NAVBAR ── */}
      <View style={wStyles.nav}>
        <View style={wStyles.navInner}>
          <TouchableOpacity style={wStyles.langPill} onPress={openLang}>
            <Text style={wStyles.langPillFlag}>{currentLang.flag}</Text>
            <Text style={wStyles.langPillText}>{currentLang.nativeName}</Text>
            <Ionicons name="chevron-down" size={13} color="#666" />
          </TouchableOpacity>

          <View style={wStyles.navLinks}>
            {portals.slice(0,3).map(p => (
              <TouchableOpacity key={p.label} onPress={() => open(p.url)}>
                <Text style={wStyles.navLink}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={wStyles.navLogo}>
            <View style={wStyles.navLogoIcon}>
              <Ionicons name="medkit" size={18} color="#fff" />
            </View>
            <Text style={wStyles.navLogoText}>دواء +</Text>
          </View>
        </View>
      </View>

      {/* ── HERO ── */}
      <View style={wStyles.hero}>
        <View style={wStyles.heroContent}>
          {/* Right: text */}
          <View style={wStyles.heroText}>
            <View style={wStyles.heroBadge}>
              <View style={wStyles.heroBadgeDot} />
              <Text style={wStyles.heroBadgeText}>المنصة الأولى للصيدليات في كردستان</Text>
            </View>
            <Text style={wStyles.heroTitle}>صيدليتك{"\n"}بين يديك</Text>
            <Text style={wStyles.heroSub}>
              منصة دواء + تربط الصيدليات والمذاخر وشركات التوصيل في إقليم كردستان والعراق — كل ما تحتاجه في مكان واحد.
            </Text>
            <View style={wStyles.heroActions}>
              <TouchableOpacity style={wStyles.heroBtnPrimary} onPress={() => open(`${BASE}/dawaaplus-pharmacies`)}>
                <Ionicons name="storefront" size={18} color="#fff" />
                <Text style={wStyles.heroBtnPrimaryText}>سجّل صيدليتك</Text>
              </TouchableOpacity>
              <TouchableOpacity style={wStyles.heroBtnSecondary}>
                <Ionicons name="play-circle" size={18} color={Colors.primary} />
                <Text style={wStyles.heroBtnSecondaryText}>شاهد العرض</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Left: phone mockup */}
          <View style={wStyles.heroPhone}>
            <View style={wStyles.phoneMockup}>
              <View style={wStyles.phoneMockupInner}>
                <View style={wStyles.phoneScreen}>
                  <View style={[wStyles.phoneHeader, { backgroundColor: Colors.primary }]}>
                    <Ionicons name="medkit" size={28} color="#fff" />
                    <Text style={wStyles.phoneAppName}>دواء +</Text>
                    <Text style={wStyles.phoneAppSub}>صيدليتك بين يديك</Text>
                  </View>
                  {[
                    { name: "باراسيتامول ٥٠٠mg", price: "٣,٥٠٠ د" },
                    { name: "أوميغا ٣ كبسول",    price: "١٢,٠٠٠ د" },
                    { name: "فيتامين د ٣",        price: "٧,٠٠٠ د" },
                  ].map((item, i) => (
                    <View key={i} style={wStyles.phoneMedRow}>
                      <View style={[wStyles.phoneMedDot, { backgroundColor: i === 0 ? Colors.primary : i === 1 ? "#3B82F6" : "#F59E0B" }]} />
                      <Text style={wStyles.phoneMedName}>{item.name}</Text>
                      <Text style={wStyles.phoneMedPrice}>{item.price}</Text>
                    </View>
                  ))}
                  <View style={wStyles.phoneOrderBtn}>
                    <Text style={wStyles.phoneOrderBtnText}>اطلب الآن</Text>
                  </View>
                </View>
              </View>
            </View>
            {/* Floating badges */}
            <View style={[wStyles.floatBadge, { top: 20, right: -10 }]}>
              <Text style={wStyles.floatBadgeEmoji}>⚡</Text>
              <Text style={wStyles.floatBadgeText}>توصيل سريع</Text>
            </View>
            <View style={[wStyles.floatBadge, { bottom: 40, left: -16 }]}>
              <Text style={wStyles.floatBadgeEmoji}>✅</Text>
              <Text style={wStyles.floatBadgeText}>أدوية مضمونة</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={wStyles.statsRow}>
          {[
            { n: "+٢,٤٠٠", l: "صيدلية نشطة" },
            { n: "+٥٠,٠٠٠", l: "منتج دوائي" },
            { n: "+١٠٠ ألف", l: "عميل" },
            { n: "+٤٠٠", l: "مذخر شريك" },
          ].map((s, i) => (
            <View key={i} style={wStyles.statItem}>
              <Text style={wStyles.statNumber}>{s.n}</Text>
              <Text style={wStyles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── FEATURES ── */}
      <View style={wStyles.section}>
        <Text style={wStyles.sectionLabel}>مميزات المنصة</Text>
        <Text style={wStyles.sectionTitle}>لماذا دواء + ؟</Text>
        <View style={wStyles.featuresGrid}>
          {features.map((f, i) => (
            <View key={i} style={wStyles.featureCard}>
              <View style={[wStyles.featureIconWrap, { backgroundColor: f.color + "18" }]}>
                <Ionicons name={f.icon as any} size={24} color={f.color} />
              </View>
              <Text style={wStyles.featureLabel}>{f.label}</Text>
              <Text style={wStyles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── PORTALS ── */}
      <View style={[wStyles.section, { backgroundColor: "#F8FAFF" }]}>
        <Text style={wStyles.sectionLabel}>بوابات المنصة</Text>
        <Text style={wStyles.sectionTitle}>لكل شريك بوابته</Text>
        <View style={wStyles.portalsGrid}>
          {portals.map((p, i) => (
            <TouchableOpacity key={i} style={wStyles.portalCard} onPress={() => open(p.url)} activeOpacity={0.85}>
              <View style={[wStyles.portalIcon, { backgroundColor: p.bg }]}>
                <Ionicons name={p.icon as any} size={28} color={p.color} />
              </View>
              <Text style={[wStyles.portalLabel, { color: p.color }]}>{p.label}</Text>
              <Text style={wStyles.portalSub}>{p.sub}</Text>
              <View style={[wStyles.portalBtn, { backgroundColor: p.color }]}>
                <Text style={wStyles.portalBtnText}>دخول</Text>
                <Ionicons name="arrow-back" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── DOWNLOAD ── */}
      <View style={wStyles.downloadSection}>
        <View style={wStyles.downloadContent}>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={wStyles.downloadTitle}>حمّل التطبيق الآن</Text>
            <Text style={wStyles.downloadSub}>
              متاح على جميع المتاجر — iOS, Android, وHuawei AppGallery
            </Text>
            <View style={wStyles.downloadBtns}>
              {downloads.map((d, i) => (
                <TouchableOpacity key={i} style={wStyles.downloadBtn} activeOpacity={0.8}>
                  <Ionicons name={d.icon as any} size={20} color={d.color} />
                  <View>
                    <Text style={wStyles.downloadBtnSub}>{d.sub}</Text>
                    <Text style={wStyles.downloadBtnLabel}>{d.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={wStyles.downloadQR}>
            <View style={wStyles.qrBox}>
              <Ionicons name="qr-code" size={64} color={Colors.primary} />
            </View>
            <Text style={wStyles.qrText}>امسح للتنزيل</Text>
          </View>
        </View>
      </View>

      {/* ── FOOTER ── */}
      <View style={wStyles.footer}>
        <View style={wStyles.footerInner}>
          <Text style={wStyles.footerCopy}>© ٢٠٢٥ دواء + — جميع الحقوق محفوظة</Text>
          <View style={wStyles.footerLinks}>
            {portals.map(p => (
              <TouchableOpacity key={p.label} onPress={() => open(p.url)}>
                <Text style={wStyles.footerLink}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={wStyles.footerLogo}>
            <Ionicons name="medkit" size={16} color={Colors.primary} />
            <Text style={wStyles.footerLogoText}>دواء +</Text>
          </View>
        </View>
      </View>

      {/* ── LANGUAGE MODAL ── */}
      <Modal visible={showLangModal} transparent animationType="fade" onRequestClose={() => setShowLangModal(false)}>
        <View style={wStyles.langOverlay}>
          <View style={wStyles.langModal}>
            <View style={wStyles.langModalHeader}>
              <TouchableOpacity onPress={() => setShowLangModal(false)}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
              <Text style={wStyles.langModalTitle}>اختر اللغة</Text>
            </View>
            <View style={wStyles.langSearch}>
              <Ionicons name="search" size={15} color="#999" />
              <TextInput
                style={wStyles.langSearchInput}
                placeholder="بحث..."
                value={langSearch}
                onChangeText={setLangSearch}
                placeholderTextColor="#999"
              />
            </View>
            <ScrollView style={{ maxHeight: 360 }}>
              {filteredSupported.length > 0 && (
                <>
                  <Text style={wStyles.langSection}>مترجمة بالكامل</Text>
                  {filteredSupported.map(lang => (
                    <TouchableOpacity
                      key={lang.code}
                      style={[wStyles.langRow, rawCode === lang.code && wStyles.langRowActive]}
                      onPress={() => { setLanguage(lang); setShowLangModal(false); }}
                    >
                      {rawCode === lang.code
                        ? <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        : <View style={wStyles.langCircle} />}
                      <Text style={wStyles.langNative}>{lang.nativeName}</Text>
                      <Text style={wStyles.langEn}>{lang.name}</Text>
                      <Text style={wStyles.langFlag}>{lang.flag}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
              {filteredOthers.length > 0 && (
                <>
                  <Text style={wStyles.langSection}>لغات أخرى</Text>
                  {filteredOthers.map(lang => (
                    <TouchableOpacity
                      key={lang.code}
                      style={[wStyles.langRow, rawCode === lang.code && wStyles.langRowActive]}
                      onPress={() => { setLanguage(lang); setShowLangModal(false); }}
                    >
                      {rawCode === lang.code
                        ? <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        : <View style={wStyles.langCircle} />}
                      <Text style={wStyles.langNative}>{lang.nativeName}</Text>
                      <Text style={wStyles.langEn}>{lang.name}</Text>
                      <Text style={wStyles.langFlag}>{lang.flag}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// MOBILE WELCOME SCREEN (unchanged)
// ─────────────────────────────────────────────────────────────
export default function WelcomeScreen() {
  if (Platform.OS === "web") return <WebLanding />;
  return <MobileWelcome />;
}

function MobileWelcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useSettings();
  const { t, rawCode } = useTranslation();
  const { loginDemo } = useAuth();

  const [showLangModal, setShowLangModal] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topPad = insets.top;
  const botPad = insets.bottom + 24;

  const handleLogoTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= SECRET_TAPS) {
      tapCount.current = 0;
      setAdminPassword(""); setAdminError("");
      setShowAdminModal(true);
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminPassword) { setAdminError("يرجى إدخال كلمة المرور"); return; }
    setAdminLoading(true);
    await new Promise(r => setTimeout(r, 600));
    loginDemo("admin");
    setAdminLoading(false);
    setShowAdminModal(false);
  };

  const allLangs = LANGUAGES || [];
  const currentLang = allLangs.find(l => l.code === rawCode) ?? allLangs[0] ?? { code: "ar", nativeName: "العربية", flag: "🇮🇶", name: "Arabic", rtl: true };

  const q = langSearch.trim().toLowerCase();
  const matchesSearch = (l: typeof allLangs[0]) =>
    !q || (l.nativeName || "").toLowerCase().indexOf(q) >= 0 || (l.name || "").toLowerCase().indexOf(q) >= 0;
  const filteredSupported = SUPPORTED_LANGS.filter(matchesSearch);
  const filteredOthers    = OTHER_LANGS.filter(matchesSearch);

  const openLang = () => { setLangSearch(""); setShowLangModal(true); };

  return (
    <View style={mStyles.root}>
      {/* Top language button */}
      <View style={[mStyles.topBar, { paddingTop: topPad + 10 }]}>
        <TouchableOpacity style={mStyles.langBtn} onPress={openLang} activeOpacity={0.8}>
          <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.75)" />
          <Text style={mStyles.langBtnText}>{currentLang.nativeName}</Text>
          <Text style={mStyles.langBtnFlag}>{currentLang.flag}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[mStyles.scroll, { paddingTop: topPad + 64 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={mStyles.hero}>
          <TouchableOpacity style={mStyles.logoCircle} onPress={handleLogoTap} activeOpacity={0.9}>
            <Ionicons name="medkit" size={52} color="#fff" />
          </TouchableOpacity>
          <Text style={mStyles.appName}>{t("appName")}</Text>
          <Text style={mStyles.tagline}>{t("appTagline")}</Text>
          <View style={mStyles.statsRow}>
            <StatItem number="+2,400" label={t("pharmacies")} />
            <View style={mStyles.statDiv} />
            <StatItem number="+50,000" label={t("products")} />
            <View style={mStyles.statDiv} />
            <StatItem number="+100k" label={t("customers")} />
          </View>
        </View>

        <View style={[mStyles.card, { paddingBottom: botPad }]}>
          <View style={mStyles.features}>
            <FeatureRow icon="location-outline"         text={t("fastDelivery")} />
            <FeatureRow icon="shield-checkmark-outline" text={t("authenticMeds")} />
            <FeatureRow icon="document-text-outline"    text={t("prescriptionSupport")} />
          </View>
          <TouchableOpacity style={mStyles.loginBtn} onPress={() => router.push("/(auth)/login")}>
            <Text style={mStyles.loginBtnText}>{t("login")}</Text>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={mStyles.registerBtn} onPress={() => router.push("/(auth)/register")}>
            <Text style={mStyles.registerBtnText}>{t("register")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={mStyles.guestBtn} onPress={() => router.replace("/(customer)")}>
            <Ionicons name="eye-outline" size={15} color={Colors.textMuted} />
            <Text style={mStyles.guestBtnText}>تصفح بدون تسجيل</Text>
          </TouchableOpacity>
          <View style={mStyles.dividerRow}>
            <View style={mStyles.divLine} />
            <Text style={mStyles.divText}>للشركاء والمزودين</Text>
            <View style={mStyles.divLine} />
          </View>
          <View style={mStyles.linksGrid}>
            <LinkCard icon="storefront-outline" color={Colors.primary}  label={t("registerPharmacy")} onPress={() => router.push("/(auth)/pharmacy-register")} />
            <LinkCard icon="cube-outline"       color="#0D7A54"          label={t("registerWarehouse")} onPress={() => router.push("/(auth)/warehouse-register")} />
            <LinkCard icon="bicycle-outline"    color="#D69E2E"          label="تسجيل شركة توصيل"       onPress={() => router.push("/(auth)/delivery-register" as any)} />
          </View>
        </View>
      </ScrollView>

      {/* Language modal */}
      <Modal visible={showLangModal} transparent animationType="slide" onRequestClose={() => setShowLangModal(false)}>
        <View style={mStyles.langOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowLangModal(false)} />
          <View style={mStyles.langSheet}>
            <View style={mStyles.sheetHandle} />
            <View style={mStyles.sheetHeader}>
              <TouchableOpacity onPress={() => setShowLangModal(false)} style={mStyles.sheetClose}>
                <Ionicons name="close" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
              <View style={mStyles.sheetTitleWrap}>
                <Ionicons name="globe-outline" size={20} color={Colors.primary} />
                <Text style={mStyles.sheetTitle}>{t("chooseLanguage")}</Text>
              </View>
            </View>
            <View style={mStyles.searchWrap}>
              <Ionicons name="search" size={16} color={Colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={mStyles.searchInput}
                placeholder={t("search")}
                placeholderTextColor={Colors.textMuted}
                value={langSearch}
                onChangeText={setLangSearch}
                autoCorrect={false}
              />
              {langSearch.length > 0 && (
                <TouchableOpacity onPress={() => setLangSearch("")}>
                  <Ionicons name="close-circle" size={17} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {filteredSupported.length > 0 && (
                <>
                  {!langSearch && <View style={mStyles.sectionLabel}><View style={mStyles.sectionDot} /><Text style={mStyles.sectionLabelText}>مترجمة بالكامل</Text></View>}
                  {filteredSupported.map(lang => <LangRow key={lang.code} lang={lang} active={rawCode === lang.code} onPress={() => { setLanguage(lang); setShowLangModal(false); }} />)}
                </>
              )}
              {filteredOthers.length > 0 && (
                <>
                  {!langSearch && <View style={[mStyles.sectionLabel, { marginTop: 8 }]}><View style={[mStyles.sectionDot, { backgroundColor: Colors.textMuted }]} /><Text style={mStyles.sectionLabelText}>لغات أخرى</Text></View>}
                  {filteredOthers.map(lang => <LangRow key={lang.code} lang={lang} active={rawCode === lang.code} onPress={() => { setLanguage(lang); setShowLangModal(false); }} />)}
                </>
              )}
              {filteredSupported.length === 0 && filteredOthers.length === 0 && (
                <View style={mStyles.noResults}>
                  <Ionicons name="search-outline" size={32} color={Colors.textMuted} />
                  <Text style={mStyles.noResultsText}>{t("noResults")}</Text>
                </View>
              )}
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Admin modal */}
      <Modal visible={showAdminModal} transparent animationType="fade" onRequestClose={() => setShowAdminModal(false)}>
        <View style={mStyles.adminOverlay}>
          <View style={mStyles.adminBox}>
            <View style={mStyles.adminHeader}>
              <TouchableOpacity onPress={() => setShowAdminModal(false)}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
              <View style={mStyles.adminLogo}>
                <Ionicons name="shield" size={20} color="#7C3AED" />
              </View>
              <Text style={mStyles.adminTitle}>دخول المدير</Text>
            </View>
            <View style={mStyles.adminInputRow}>
              <TextInput
                style={mStyles.adminInput}
                placeholder="كلمة المرور"
                value={adminPassword}
                onChangeText={v => { setAdminPassword(v); setAdminError(""); }}
                secureTextEntry textAlign="right"
                placeholderTextColor={Colors.textMuted}
              />
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
            </View>
            {adminError ? <Text style={mStyles.adminError}>{adminError}</Text> : null}
            <TouchableOpacity style={[mStyles.adminBtn, { backgroundColor: "#7C3AED" }]} onPress={handleAdminLogin} disabled={adminLoading}>
              {adminLoading ? <ActivityIndicator color="#fff" /> : (
                <><Ionicons name="shield-checkmark" size={18} color="#fff" /><Text style={mStyles.adminBtnText}>دخول</Text></>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function LangRow({ lang, active, onPress }: { lang: typeof LANGUAGES[0]; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[mStyles.langRow, active && mStyles.langRowActive]} onPress={onPress} activeOpacity={0.7}>
      {active ? <Ionicons name="checkmark-circle" size={22} color={Colors.primary} /> : <View style={mStyles.langRowCircle} />}
      <View style={mStyles.langRowInfo}>
        <Text style={[mStyles.langRowNative, active && { color: Colors.primary }]}>{lang.nativeName}</Text>
        <Text style={mStyles.langRowEn}>{lang.name}</Text>
      </View>
      <Text style={mStyles.langRowFlag}>{lang.flag}</Text>
    </TouchableOpacity>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <View style={mStyles.statItem}>
      <Text style={mStyles.statNumber}>{number}</Text>
      <Text style={mStyles.statLabel}>{label}</Text>
    </View>
  );
}

function FeatureRow({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={mStyles.featureRow}>
      <Text style={mStyles.featureText}>{text}</Text>
      <View style={mStyles.featureIcon}>
        <Ionicons name={icon} size={17} color={Colors.primary} />
      </View>
    </View>
  );
}

function LinkCard({ icon, color, label, onPress }: { icon: any; color: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={mStyles.linkCard} onPress={onPress}>
      <View style={[mStyles.linkCardIcon, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[mStyles.linkCardText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── WEB STYLES ───────────────────────────────────────────────────────────────
const wStyles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff" },

  /* Navbar */
  nav: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F0F0F0", paddingVertical: 14 },
  navInner: { maxWidth: 1100, alignSelf: "center", width: "100%", flexDirection: "row", alignItems: "center", paddingHorizontal: 32 },
  navLogo: { flexDirection: "row", alignItems: "center", gap: 8 },
  navLogoIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  navLogoText: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary },
  navLinks: { flex: 1, flexDirection: "row", gap: 24, justifyContent: "center" },
  navLink: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  langPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F5F5F7", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  langPillFlag: { fontSize: 16 },
  langPillText: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary },

  /* Hero */
  hero: { backgroundColor: "#F8FFFC", paddingVertical: 60, paddingHorizontal: 32 },
  heroContent: { maxWidth: 1100, alignSelf: "center", width: "100%", flexDirection: "row", alignItems: "center", gap: 48 },
  heroText: { flex: 1, gap: 16 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-end" },
  heroBadgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  heroBadgeText: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  heroTitle: { fontSize: 52, fontWeight: "900", color: Colors.textPrimary, lineHeight: 62, textAlign: "right" },
  heroSub: { fontSize: 16, color: Colors.textSecondary, lineHeight: 26, textAlign: "right" },
  heroActions: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
  heroBtnPrimary: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", gap: 8 },
  heroBtnPrimaryText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  heroBtnSecondary: { borderWidth: 2, borderColor: Colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", gap: 8 },
  heroBtnSecondaryText: { color: Colors.primary, fontSize: 15, fontWeight: "700" },

  /* Phone mockup */
  heroPhone: { width: 220, alignItems: "center" },
  phoneMockup: { width: 200, borderRadius: 32, backgroundColor: "#1A1A1A", padding: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.2, shadowRadius: 40, elevation: 20 },
  phoneMockupInner: { borderRadius: 26, overflow: "hidden", backgroundColor: "#fff" },
  phoneScreen: { gap: 0 },
  phoneHeader: { paddingVertical: 18, paddingHorizontal: 16, alignItems: "center", gap: 4 },
  phoneAppName: { color: "#fff", fontSize: 18, fontWeight: "800" },
  phoneAppSub: { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  phoneMedRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  phoneMedDot: { width: 8, height: 8, borderRadius: 4 },
  phoneMedName: { flex: 1, fontSize: 11, color: "#333", textAlign: "right" },
  phoneMedPrice: { fontSize: 11, fontWeight: "700", color: Colors.primary },
  phoneOrderBtn: { margin: 10, backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  phoneOrderBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  floatBadge: { position: "absolute", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", gap: 4, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 },
  floatBadgeEmoji: { fontSize: 14 },
  floatBadgeText: { fontSize: 11, fontWeight: "700", color: Colors.textPrimary },

  /* Stats */
  statsRow: { maxWidth: 1100, alignSelf: "center", width: "100%", flexDirection: "row", marginTop: 40, backgroundColor: "#fff", borderRadius: 20, padding: 24, gap: 0, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 4 },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statNumber: { fontSize: 28, fontWeight: "900", color: Colors.primary },
  statLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: "600" },

  /* Section */
  section: { paddingVertical: 60, paddingHorizontal: 32 },
  sectionLabel: { fontSize: 13, color: Colors.primary, fontWeight: "700", textAlign: "center", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  sectionTitle: { fontSize: 36, fontWeight: "800", color: Colors.textPrimary, textAlign: "center", marginBottom: 32 },

  /* Features */
  featuresGrid: { maxWidth: 1100, alignSelf: "center", width: "100%", flexDirection: "row", flexWrap: "wrap", gap: 16 },
  featureCard: { flex: 1, minWidth: 260, backgroundColor: "#fff", borderRadius: 20, padding: 24, gap: 10, borderWidth: 1, borderColor: "#F0F0F0", alignItems: "flex-end" },
  featureIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  featureLabel: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  featureDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, textAlign: "right" },

  /* Portals */
  portalsGrid: { maxWidth: 1100, alignSelf: "center", width: "100%", flexDirection: "row", flexWrap: "wrap", gap: 16 },
  portalCard: { flex: 1, minWidth: 200, backgroundColor: "#fff", borderRadius: 20, padding: 24, gap: 10, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  portalIcon: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  portalLabel: { fontSize: 16, fontWeight: "800" },
  portalSub: { fontSize: 12, color: Colors.textMuted, textAlign: "center" },
  portalBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  portalBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  /* Download */
  downloadSection: { backgroundColor: Colors.primary, paddingVertical: 60, paddingHorizontal: 32 },
  downloadContent: { maxWidth: 1100, alignSelf: "center", width: "100%", flexDirection: "row", gap: 40, alignItems: "center" },
  downloadTitle: { fontSize: 32, fontWeight: "800", color: "#fff", textAlign: "right" },
  downloadSub: { fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 24, textAlign: "right" },
  downloadBtns: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  downloadBtn: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  downloadBtnSub: { fontSize: 10, color: "rgba(255,255,255,0.7)" },
  downloadBtnLabel: { fontSize: 13, fontWeight: "700", color: "#fff" },
  downloadQR: { alignItems: "center", gap: 8 },
  qrBox: { width: 120, height: 120, backgroundColor: "#fff", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  qrText: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: "600" },

  /* Footer */
  footer: { backgroundColor: Colors.textPrimary, paddingVertical: 24, paddingHorizontal: 32 },
  footerInner: { maxWidth: 1100, alignSelf: "center", width: "100%", flexDirection: "row", alignItems: "center" },
  footerLogo: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerLogoText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  footerLinks: { flex: 1, flexDirection: "row", gap: 20, justifyContent: "center" },
  footerLink: { fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: "500" },
  footerCopy: { fontSize: 12, color: "rgba(255,255,255,0.4)" },

  /* Language modal */
  langOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  langModal: { backgroundColor: "#fff", borderRadius: 24, width: 420, maxHeight: 520, overflow: "hidden" },
  langModalHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 20, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  langModalTitle: { flex: 1, fontSize: 17, fontWeight: "800", textAlign: "center" },
  langSearch: { flexDirection: "row", alignItems: "center", gap: 8, margin: 12, backgroundColor: "#F5F5F7", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  langSearchInput: { flex: 1, fontSize: 14, color: "#333", outlineStyle: "none" } as any,
  langSection: { fontSize: 11, fontWeight: "700", color: "#999", paddingHorizontal: 16, paddingVertical: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  langRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12, marginHorizontal: 8, marginVertical: 2 },
  langRowActive: { backgroundColor: Colors.primaryLight },
  langCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#DDD" },
  langNative: { flex: 1, fontSize: 14, fontWeight: "700", color: "#222", textAlign: "right" },
  langEn: { fontSize: 11, color: "#999" },
  langFlag: { fontSize: 22 },
});

// ── MOBILE STYLES ─────────────────────────────────────────────────────────────
const mStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primary },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 20, paddingBottom: 10 },
  langBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 22, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  langBtnFlag: { fontSize: 18 },
  langBtnText: { fontSize: 13, fontWeight: "600", color: "#fff", maxWidth: 80 },

  scroll: { flexGrow: 1 },
  hero: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 28, paddingTop: 16 },
  logoCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  appName: { fontSize: 42, fontWeight: "800", color: "#fff", letterSpacing: -1, marginBottom: 6 },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 20, marginBottom: 18 },
  statsRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, gap: 10, alignSelf: "stretch" },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 16, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2, textAlign: "center" },
  statDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },

  card: { backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 24, paddingHorizontal: 22 },
  features: { gap: 9, marginBottom: 18 },
  featureRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 },
  featureIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center" },
  featureText: { flex: 1, fontSize: 13, color: Colors.textSecondary, textAlign: "right" },

  loginBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 },
  loginBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  registerBtn: { borderWidth: 2, borderColor: Colors.primary, borderRadius: 14, paddingVertical: 12, alignItems: "center", marginBottom: 10 },
  registerBtnText: { fontSize: 15, fontWeight: "700", color: Colors.primary },
  guestBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, marginBottom: 16 },
  guestBtnText: { fontSize: 13, color: Colors.textMuted, fontWeight: "600" },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 11, color: Colors.textMuted, fontWeight: "600" },

  linksGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
  linkCard: { flex: 1, alignItems: "center", gap: 6, backgroundColor: Colors.surfaceAlt, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 6, borderWidth: 1, borderColor: Colors.border },
  linkCardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  linkCardText: { fontSize: 11, fontWeight: "700", textAlign: "center" },

  /* Language sheet */
  langOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  langSheet: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "85%" },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E0E0E0", alignSelf: "center", marginTop: 10, marginBottom: 4 },
  sheetHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  sheetClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
  sheetTitleWrap: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: Colors.textPrimary },
  searchWrap: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginVertical: 12, backgroundColor: "#F5F5F7", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 6 },
  sectionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  sectionLabelText: { fontSize: 11, fontWeight: "700", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  langRow: { flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 12, marginVertical: 3, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 14 },
  langRowActive: { backgroundColor: Colors.primaryLight },
  langRowCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#DDD" },
  langRowInfo: { flex: 1 },
  langRowNative: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  langRowEn: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  langRowFlag: { fontSize: 26 },
  noResults: { alignItems: "center", paddingVertical: 40, gap: 10 },
  noResultsText: { fontSize: 14, color: Colors.textMuted },

  /* Admin */
  adminOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center", padding: 24 },
  adminBox: { backgroundColor: "#fff", borderRadius: 24, padding: 24, width: "100%", maxWidth: 360, gap: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 10 },
  adminHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  adminLogo: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#7C3AED15", alignItems: "center", justifyContent: "center" },
  adminTitle: { flex: 1, fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  adminInputRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14 },
  adminInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: Colors.textPrimary },
  adminError: { fontSize: 12, color: Colors.error, textAlign: "right" },
  adminBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  adminBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

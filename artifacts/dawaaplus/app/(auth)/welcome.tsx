import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  Modal, TextInput, ActivityIndicator, ScrollView,
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

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useSettings();
  const { t, rawCode } = useTranslation();
  const { loginDemo, loginDelivery } = useAuth();

  const [showLangModal, setShowLangModal] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryPass, setDeliveryPass] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 24);

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

  const handleDeliveryLogin = async () => {
    if (!deliveryPhone || !deliveryPass) { setDeliveryError("يرجى إدخال رقم الهاتف وكلمة المرور"); return; }
    setDeliveryLoading(true);
    const ok = await loginDelivery(deliveryPhone, deliveryPass);
    setDeliveryLoading(false);
    if (!ok) { setDeliveryError("رقم الهاتف أو كلمة المرور غير صحيحة"); return; }
    setShowDeliveryModal(false);
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
    <View style={styles.root}>
      {/* ── TOP LANGUAGE BUTTON ── */}
      <View style={[styles.topBar, { paddingTop: topPad + 10 }]}>
        <TouchableOpacity style={styles.langBtn} onPress={openLang} activeOpacity={0.8}>
          <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.75)" />
          <Text style={styles.langBtnText}>{currentLang.nativeName}</Text>
          <Text style={styles.langBtnFlag}>{currentLang.flag}</Text>
        </TouchableOpacity>
      </View>

      {/* ── HERO (scrollable) ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 64 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Logo */}
        <View style={styles.hero}>
          <TouchableOpacity style={styles.logoCircle} onPress={handleLogoTap} activeOpacity={0.9}>
            <Ionicons name="medkit" size={52} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.appName}>{t("appName")}</Text>
          <Text style={styles.tagline}>{t("appTagline")}</Text>

          <View style={styles.statsRow}>
            <StatItem number="+2,400" label={t("pharmacies")} />
            <View style={styles.statDiv} />
            <StatItem number="+50,000" label={t("products")} />
            <View style={styles.statDiv} />
            <StatItem number="+100k" label={t("customers")} />
          </View>
        </View>

        {/* ── BOTTOM CARD ── */}
        <View style={[styles.card, { paddingBottom: botPad }]}>
          {/* Features */}
          <View style={styles.features}>
            <FeatureRow icon="location-outline"         text={t("fastDelivery")} />
            <FeatureRow icon="shield-checkmark-outline" text={t("authenticMeds")} />
            <FeatureRow icon="document-text-outline"   text={t("prescriptionSupport")} />
          </View>

          {/* Login */}
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginBtnText}>{t("login")}</Text>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Register */}
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.registerBtnText}>{t("register")}</Text>
          </TouchableOpacity>

          {/* Browse without registration */}
          <TouchableOpacity style={styles.guestBtn} onPress={() => router.replace("/(customer)")}>
            <Ionicons name="eye-outline" size={15} color={Colors.textMuted} />
            <Text style={styles.guestBtnText}>تصفح بدون تسجيل</Text>
          </TouchableOpacity>

          {/* Business / Partner links */}
          <View style={styles.dividerRow}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>للشركاء والمزودين</Text>
            <View style={styles.divLine} />
          </View>

          <View style={styles.linksGrid}>
            <LinkCard
              icon="storefront-outline"
              color={Colors.primary}
              label={t("registerPharmacy")}
              onPress={() => router.push("/(auth)/pharmacy-register")}
            />
            <LinkCard
              icon="cube-outline"
              color="#0D7A54"
              label={t("registerWarehouse")}
              onPress={() => router.push("/(auth)/warehouse-register")}
            />
            <LinkCard
              icon="bicycle-outline"
              color="#D69E2E"
              label="تسجيل شركة توصيل"
              onPress={() => router.push("/(auth)/delivery-register" as any)}
            />
          </View>

          {/* ── DELIVERY QUICK ACCESS ── */}
          <View style={styles.deliverySection}>
            <View style={styles.deliverySectionHeader}>
              <View style={styles.deliverySectionDot} />
              <Text style={styles.deliverySectionTitle}>شركات التوصيل المسجّلة</Text>
            </View>
            <TouchableOpacity
              style={styles.deliveryLoginBtn}
              onPress={() => { setDeliveryPhone(""); setDeliveryPass(""); setDeliveryError(""); setShowDeliveryModal(true); }}
              activeOpacity={0.85}
            >
              <View style={styles.deliveryLoginLeft}>
                <View style={styles.deliveryLoginIcon}>
                  <Ionicons name="bicycle" size={18} color="#D69E2E" />
                </View>
                <View>
                  <Text style={styles.deliveryLoginLabel}>دخول بوابة التوصيل</Text>
                  <Text style={styles.deliveryLoginSub}>للشركات المسجّلة فقط</Text>
                </View>
              </View>
              <Ionicons name="arrow-back" size={18} color="#D69E2E" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ── LANGUAGE MODAL ── */}
      <Modal visible={showLangModal} transparent animationType="slide" onRequestClose={() => setShowLangModal(false)}>
        <View style={styles.langOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowLangModal(false)} />
          <View style={styles.langSheet}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => setShowLangModal(false)} style={styles.sheetClose}>
                <Ionicons name="close" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.sheetTitleWrap}>
                <Ionicons name="globe-outline" size={20} color={Colors.primary} />
                <Text style={styles.sheetTitle}>{t("chooseLanguage")}</Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={16} color={Colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
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
                  {!langSearch && (
                    <View style={styles.sectionLabel}>
                      <View style={styles.sectionDot} />
                      <Text style={styles.sectionLabelText}>مترجمة بالكامل</Text>
                    </View>
                  )}
                  {filteredSupported.map(lang => (
                    <LangRow
                      key={lang.code}
                      lang={lang}
                      active={rawCode === lang.code}
                      onPress={() => { setLanguage(lang); setShowLangModal(false); }}
                    />
                  ))}
                </>
              )}

              {filteredOthers.length > 0 && (
                <>
                  {!langSearch && (
                    <View style={[styles.sectionLabel, { marginTop: 8 }]}>
                      <View style={[styles.sectionDot, { backgroundColor: Colors.textMuted }]} />
                      <Text style={styles.sectionLabelText}>لغات أخرى</Text>
                    </View>
                  )}
                  {filteredOthers.map(lang => (
                    <LangRow
                      key={lang.code}
                      lang={lang}
                      active={rawCode === lang.code}
                      onPress={() => { setLanguage(lang); setShowLangModal(false); }}
                    />
                  ))}
                </>
              )}

              {filteredSupported.length === 0 && filteredOthers.length === 0 && (
                <View style={styles.noResults}>
                  <Ionicons name="search-outline" size={32} color={Colors.textMuted} />
                  <Text style={styles.noResultsText}>{t("noResults")}</Text>
                </View>
              )}

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── DELIVERY LOGIN MODAL ── */}
      <Modal visible={showDeliveryModal} transparent animationType="slide" onRequestClose={() => setShowDeliveryModal(false)}>
        <View style={styles.langOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDeliveryModal(false)} />
          <View style={styles.deliveryModal}>
            <View style={styles.sheetHandle} />
            <View style={styles.deliveryModalHeader}>
              <TouchableOpacity onPress={() => setShowDeliveryModal(false)} style={styles.sheetClose}>
                <Ionicons name="close" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.sheetTitleWrap}>
                <View style={styles.deliveryModalIcon}>
                  <Ionicons name="bicycle" size={18} color="#D69E2E" />
                </View>
                <Text style={styles.sheetTitle}>دخول شركة التوصيل</Text>
              </View>
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 28, gap: 12 }}>
              <Text style={styles.deliveryModalHint}>أدخل رقم هاتف الشركة وكلمة المرور المسجّلة</Text>

              <View style={styles.deliveryInputRow}>
                <TextInput
                  style={styles.deliveryInput}
                  placeholder="رقم هاتف الشركة"
                  value={deliveryPhone}
                  onChangeText={v => { setDeliveryPhone(v); setDeliveryError(""); }}
                  keyboardType="phone-pad"
                  textAlign="right"
                  placeholderTextColor={Colors.textMuted}
                />
                <Ionicons name="call-outline" size={18} color={Colors.textMuted} />
              </View>

              <View style={styles.deliveryInputRow}>
                <TextInput
                  style={styles.deliveryInput}
                  placeholder="كلمة المرور"
                  value={deliveryPass}
                  onChangeText={v => { setDeliveryPass(v); setDeliveryError(""); }}
                  secureTextEntry
                  textAlign="right"
                  placeholderTextColor={Colors.textMuted}
                />
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
              </View>

              {deliveryError ? <Text style={styles.deliveryError}>{deliveryError}</Text> : null}

              <TouchableOpacity
                style={[styles.deliverySubmitBtn, deliveryLoading && { opacity: 0.7 }]}
                onPress={handleDeliveryLogin}
                disabled={deliveryLoading}
              >
                {deliveryLoading
                  ? <ActivityIndicator color="#fff" />
                  : <><Ionicons name="bicycle" size={18} color="#fff" /><Text style={styles.deliverySubmitText}>دخول</Text></>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.deliveryRegisterLink} onPress={() => { setShowDeliveryModal(false); router.push("/(auth)/delivery-register" as any); }}>
                <Text style={styles.deliveryRegisterLinkText}>شركتك غير مسجّلة؟ <Text style={{ color: "#D69E2E", fontWeight: "700" }}>سجّل الآن</Text></Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── HIDDEN ADMIN MODAL ── */}
      <Modal visible={showAdminModal} transparent animationType="fade" onRequestClose={() => setShowAdminModal(false)}>
        <View style={styles.adminOverlay}>
          <View style={styles.adminBox}>
            <View style={styles.adminHeader}>
              <TouchableOpacity onPress={() => setShowAdminModal(false)}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.adminLogo}>
                <Ionicons name="shield" size={20} color="#7C3AED" />
              </View>
              <Text style={styles.adminTitle}>دخول المدير</Text>
            </View>
            <View style={styles.adminInputRow}>
              <TextInput
                style={styles.adminInput}
                placeholder="كلمة المرور"
                value={adminPassword}
                onChangeText={v => { setAdminPassword(v); setAdminError(""); }}
                secureTextEntry
                textAlign="right"
                placeholderTextColor={Colors.textMuted}
              />
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
            </View>
            {adminError ? <Text style={styles.adminError}>{adminError}</Text> : null}
            <TouchableOpacity
              style={[styles.adminBtn, { backgroundColor: "#7C3AED" }]}
              onPress={handleAdminLogin}
              disabled={adminLoading}
            >
              {adminLoading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="shield-checkmark" size={18} color="#fff" />
                  <Text style={styles.adminBtnText}>دخول</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LangRow({ lang, active, onPress }: {
  lang: typeof LANGUAGES[0]; active: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.langRow, active && styles.langRowActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {active
        ? <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
        : <View style={styles.langRowCircle} />
      }
      <View style={styles.langRowInfo}>
        <Text style={[styles.langRowNative, active && { color: Colors.primary }]}>
          {lang.nativeName}
        </Text>
        <Text style={styles.langRowEn}>{lang.name}</Text>
      </View>
      <Text style={styles.langRowFlag}>{lang.flag}</Text>
    </TouchableOpacity>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FeatureRow({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureText}>{text}</Text>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={17} color={Colors.primary} />
      </View>
    </View>
  );
}

function LinkCard({ icon, color, label, onPress }: { icon: any; color: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.linkCard} onPress={onPress}>
      <View style={[styles.linkCardIcon, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.linkCardText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primary },

  topBar: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: "row", justifyContent: "flex-end",
    paddingHorizontal: 20, paddingBottom: 10,
  },
  langBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 22, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  langBtnFlag: { fontSize: 18 },
  langBtnText: { fontSize: 13, fontWeight: "600", color: "#fff", maxWidth: 80 },

  scroll: { flexGrow: 1 },
  hero: {
    alignItems: "center", paddingHorizontal: 24,
    paddingBottom: 28, paddingTop: 16,
  },
  logoCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  appName: { fontSize: 42, fontWeight: "800", color: "#fff", letterSpacing: -1, marginBottom: 6 },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 20, marginBottom: 18 },
  statsRow: {
    flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, gap: 10, alignSelf: "stretch",
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 16, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2, textAlign: "center" },
  statDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },

  card: {
    backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingTop: 24, paddingHorizontal: 22,
  },
  features: { gap: 9, marginBottom: 18 },
  featureRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 },
  featureIcon: {
    width: 32, height: 32, borderRadius: 9, backgroundColor: Colors.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  featureText: { flex: 1, fontSize: 13, color: Colors.textSecondary, textAlign: "right" },

  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10,
  },
  loginBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  registerBtn: {
    borderWidth: 2, borderColor: Colors.primary, borderRadius: 14,
    paddingVertical: 12, alignItems: "center", marginBottom: 10,
  },
  registerBtnText: { fontSize: 15, fontWeight: "700", color: Colors.primary },

  guestBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 8, marginBottom: 16,
  },
  guestBtnText: { fontSize: 13, color: Colors.textMuted, fontWeight: "600" },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 11, color: Colors.textMuted, fontWeight: "600" },

  linksGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
  linkCard: {
    flex: 1, alignItems: "center", gap: 6,
    backgroundColor: Colors.surfaceAlt, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  linkCardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  linkCardText: { fontSize: 11, fontWeight: "700", textAlign: "center" },

  langOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  langSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: "85%",
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#E0E0E0", alignSelf: "center", marginTop: 10, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  sheetClose: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#F5F5F5",
    alignItems: "center", justifyContent: "center",
  },
  sheetTitleWrap: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: Colors.textPrimary },

  searchWrap: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginVertical: 12,
    backgroundColor: "#F5F5F7", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },

  sectionLabel: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 6,
  },
  sectionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  sectionLabelText: { fontSize: 11, fontWeight: "700", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },

  langRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginHorizontal: 12, marginVertical: 3,
    paddingHorizontal: 14, paddingVertical: 13,
    borderRadius: 14,
  },
  langRowActive: { backgroundColor: Colors.primaryLight },
  langRowCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: "#DDD",
  },
  langRowInfo: { flex: 1 },
  langRowNative: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  langRowEn: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  langRowFlag: { fontSize: 26 },

  noResults: { alignItems: "center", paddingVertical: 40, gap: 10 },
  noResultsText: { fontSize: 14, color: Colors.textMuted },

  adminOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center", padding: 24 },
  adminBox: {
    backgroundColor: "#fff", borderRadius: 24, padding: 24,
    width: "100%", maxWidth: 360, gap: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 10,
  },
  adminHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  adminLogo: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#7C3AED15", alignItems: "center", justifyContent: "center" },
  adminTitle: { flex: 1, fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  adminInputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14,
  },
  adminInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: Colors.textPrimary },
  adminError: { fontSize: 12, color: Colors.error, textAlign: "right" },
  adminBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  adminBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  deliverySection: { marginTop: 14, marginBottom: 4, gap: 8 },
  deliverySectionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  deliverySectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D69E2E" },
  deliverySectionTitle: { fontSize: 11, fontWeight: "700", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  deliveryLoginBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#FFFFF0", borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: "#D69E2E40",
  },
  deliveryLoginLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  deliveryLoginIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#D69E2E18", alignItems: "center", justifyContent: "center",
  },
  deliveryLoginLabel: { fontSize: 14, fontWeight: "700", color: "#92600A" },
  deliveryLoginSub: { fontSize: 11, color: "#B7791F", marginTop: 2 },

  deliveryModal: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  deliveryModalHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  deliveryModalIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: "#D69E2E18", alignItems: "center", justifyContent: "center",
  },
  deliveryModalHint: { fontSize: 13, color: Colors.textMuted, textAlign: "right", marginBottom: 4 },
  deliveryInputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14,
  },
  deliveryInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: Colors.textPrimary },
  deliveryError: { fontSize: 12, color: Colors.error, textAlign: "right" },
  deliverySubmitBtn: {
    backgroundColor: "#D69E2E", borderRadius: 14, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4,
  },
  deliverySubmitText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  deliveryRegisterLink: { alignItems: "center", paddingVertical: 4 },
  deliveryRegisterLinkText: { fontSize: 13, color: Colors.textMuted },
});

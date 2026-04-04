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

const ADMIN_PHONE = "+9647700000001";
const SECRET_TAPS = 7;

// ── Inline flag renderers ────────────────────────────────────────────────
function IraqFlag({ size = 22 }: { size?: number }) {
  const w = Math.round(size * 1.5);
  const s = Math.round(size / 3);
  return (
    <View style={{ width: w, height: size, borderRadius: 3, overflow: "hidden" }}>
      <View style={{ height: s, backgroundColor: "#CE1126" }} />
      <View style={{ height: s, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: s * 0.85, lineHeight: s }}>🌿</Text>
      </View>
      <View style={{ height: s, backgroundColor: "#000000" }} />
    </View>
  );
}

function KurdistanFlag({ size = 22 }: { size?: number }) {
  const w = Math.round(size * 1.5);
  const s = Math.round(size / 3);
  const sun = Math.round(size * 0.55);
  return (
    <View style={{ width: w, height: size, borderRadius: 3, overflow: "hidden" }}>
      <View style={{ height: s, backgroundColor: "#EF2B2D" }} />
      <View style={{ height: s, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
        <View style={{
          width: sun, height: sun, borderRadius: sun / 2,
          backgroundColor: "#F7C847",
          position: "absolute",
        }} />
      </View>
      <View style={{ height: s, backgroundColor: "#007A3D" }} />
    </View>
  );
}

function UKFlag({ size = 22 }: { size?: number }) {
  return <Text style={{ fontSize: size * 0.9, lineHeight: size + 2 }}>🇬🇧</Text>;
}

const MAIN_LANGS = [
  { code: "ar", label: "العربية", Flag: IraqFlag },
  { code: "ku", label: "کوردی",   Flag: KurdistanFlag },
  { code: "en", label: "English",  Flag: UKFlag },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useSettings();
  const { t } = useTranslation();
  const { loginDemo } = useAuth();
  const [showLangModal, setShowLangModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
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

  return (
    <View style={styles.root}>
      {/* ══ FIXED LANGUAGE BAR ══ */}
      <View style={[styles.langBar, { paddingTop: topPad + 10 }]}>
        {MAIN_LANGS.map(({ code, label, Flag }) => {
          const active = language.code === code;
          const lang = LANGUAGES.find(l => l.code === code)!;
          return (
            <TouchableOpacity
              key={code}
              style={[styles.langPill, active && styles.langPillActive]}
              onPress={() => setLanguage(lang)}
              activeOpacity={0.75}
            >
              <Flag size={18} />
              <Text style={[styles.langPillText, active && styles.langPillTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.langMoreBtn} onPress={() => setShowLangModal(true)}>
          <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      {/* ══ HERO (scrollable) ══ */}
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

        {/* ══ BOTTOM CARD ══ */}
        <View style={[styles.card, { paddingBottom: botPad }]}>
          {/* Features */}
          <View style={styles.features}>
            <FeatureRow icon="location-outline"       text={t("fastDelivery")} />
            <FeatureRow icon="shield-checkmark-outline" text={t("authenticMeds")} />
            <FeatureRow icon="document-text-outline"  text={t("prescriptionSupport")} />
          </View>

          {/* Main CTA — Login */}
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginBtnText}>{t("login")}</Text>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Register Customer */}
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
        </View>
      </ScrollView>

      {/* ══ MORE LANGUAGES MODAL ══ */}
      <Modal visible={showLangModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("chooseLanguage")}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langOption, language.code === lang.code && styles.langOptionActive]}
                  onPress={() => { setLanguage(lang); setShowLangModal(false); }}
                >
                  {language.code === lang.code && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                  <View style={styles.langOptionInfo}>
                    <Text style={styles.langOptionName}>{lang.nativeName}</Text>
                    <Text style={styles.langOptionSub}>{lang.name}</Text>
                  </View>
                  <Text style={{ fontSize: 26 }}>{lang.flag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowLangModal(false)}>
              <Text style={styles.modalCloseText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══ HIDDEN ADMIN MODAL ══ */}
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primary },

  /* Language bar */
  langBar: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingHorizontal: 20, paddingBottom: 10,
  },
  langPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 22,
    paddingHorizontal: 11, paddingVertical: 6,
    borderWidth: 1.5, borderColor: "transparent",
  },
  langPillActive: {
    backgroundColor: "#fff", borderColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  langPillText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.9)" },
  langPillTextActive: { color: Colors.primary, fontWeight: "800" },
  langMoreBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },

  /* Scroll + hero */
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

  /* Bottom card */
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

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary, textAlign: "center", marginBottom: 8 },
  langOption: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 12,
    borderRadius: 12, backgroundColor: Colors.surfaceAlt, marginBottom: 6,
  },
  langOptionActive: { backgroundColor: Colors.primaryLight, borderWidth: 1.5, borderColor: Colors.primary },
  langOptionInfo: { flex: 1 },
  langOptionName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  langOptionSub: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  modalClose: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, paddingVertical: 13,
    alignItems: "center", marginTop: 6,
  },
  modalCloseText: { fontSize: 15, fontWeight: "700", color: Colors.textMuted },

  /* Admin */
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
});

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, Modal, TextInput, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "@/i18n";
import { LANGUAGES, Language } from "@/data/locales";
import FlagDisplay from "@/components/FlagDisplay";
import { useAuth } from "@/contexts/AuthContext";

const MAIN_LANGS = LANGUAGES.slice(0, 3); // ar, ku, en

const { height } = Dimensions.get("window");
const ADMIN_PHONE = "+9647700000001";
const SECRET_TAPS = 7;

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

  const handleLogoTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= SECRET_TAPS) {
      tapCount.current = 0;
      setAdminPassword("");
      setAdminError("");
      setShowAdminModal(true);
    } else {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 2000);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminPassword) {
      setAdminError("يرجى إدخال كلمة المرور");
      return;
    }
    setAdminLoading(true);
    await new Promise(r => setTimeout(r, 600));
    loginDemo("admin");
    setAdminLoading(false);
    setShowAdminModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.heroSection, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 40) }]}>
        {/* ── 3 Main Language Pills ── */}
        <View style={styles.langRow}>
          {MAIN_LANGS.map(lang => {
            const active = language.code === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langPill, active && styles.langPillActive]}
                onPress={() => setLanguage(lang)}
                activeOpacity={0.75}
              >
                <FlagDisplay langCode={lang.code} size={16} />
                <Text style={[styles.langPillText, active && styles.langPillTextActive]}>
                  {lang.nativeName}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* More languages button */}
          <TouchableOpacity
            style={styles.langMoreBtn}
            onPress={() => setShowLangModal(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoCircle}
          onPress={handleLogoTap}
          activeOpacity={0.9}
        >
          <Ionicons name="medkit" size={56} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.appName}>{t("appName")}</Text>
        <Text style={styles.tagline}>{t("appTagline")}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>+2,400</Text>
            <Text style={styles.statLabel}>{t("pharmacies")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>+50,000</Text>
            <Text style={styles.statLabel}>{t("products")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>+100k</Text>
            <Text style={styles.statLabel}>{t("customers")}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}>
        <View style={styles.features}>
          <FeatureRow icon="location-outline" text={t("fastDelivery")} />
          <FeatureRow icon="shield-checkmark-outline" text={t("authenticMeds")} />
          <FeatureRow icon="document-text-outline" text={t("prescriptionSupport")} />
        </View>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.loginBtnText}>{t("login")}</Text>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.registerBtnText}>{t("register")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestBtn}
          onPress={() => router.replace("/(customer)")}
        >
          <Ionicons name="eye-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.guestBtnText}>تصفح بدون تسجيل</Text>
        </TouchableOpacity>

        <View style={styles.linksRow}>
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.push("/(auth)/pharmacy-register")}
          >
            <Ionicons name="storefront-outline" size={15} color={Colors.primary} />
            <Text style={styles.linkBtnText}>{t("registerPharmacy")}</Text>
          </TouchableOpacity>

          <View style={styles.linkDivider} />

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.push("/(auth)/warehouse-register")}
          >
            <Ionicons name="cube-outline" size={15} color="#0D7A54" />
            <Text style={[styles.linkBtnText, { color: "#0D7A54" }]}>{t("registerWarehouse")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Modal */}
      <Modal visible={showLangModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("chooseLanguage")}</Text>
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
                <FlagDisplay langCode={lang.code} size={28} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowLangModal(false)}>
              <Text style={styles.modalCloseText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Hidden Admin Login Modal */}
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

            <View style={styles.adminForm}>
              <View style={styles.adminInputRow}>
                <TextInput
                  style={styles.adminInput}
                  placeholder="كلمة المرور"
                  value={adminPassword}
                  onChangeText={t => { setAdminPassword(t); setAdminError(""); }}
                  secureTextEntry
                  textAlign="right"
                  placeholderTextColor={Colors.textMuted}
                />
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
              </View>

              {adminError ? (
                <Text style={styles.adminError}>{adminError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.adminBtn, { backgroundColor: "#7C3AED" }]}
              onPress={handleAdminLogin}
              disabled={adminLoading}
            >
              {adminLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
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

function FeatureRow({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureText}>{text}</Text>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  heroSection: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24,
  },
  langRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "stretch", marginBottom: 20, justifyContent: "center",
  },
  langPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1.5, borderColor: "transparent",
  },
  langPillActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  langPillText: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "600" },
  langPillTextActive: { color: Colors.primary, fontWeight: "800" },
  langMoreBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  appName: {
    fontSize: 44, fontWeight: "800", color: "#fff", letterSpacing: -1, marginBottom: 8,
  },
  tagline: {
    fontSize: 14, color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 22, marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, gap: 12,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2, textAlign: "center" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  bottomSection: {
    backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingTop: 24, paddingHorizontal: 24,
  },
  features: { gap: 10, marginBottom: 20 },
  featureRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 12 },
  featureIcon: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  featureText: { flex: 1, fontSize: 13, color: Colors.textSecondary, textAlign: "right" },
  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10,
  },
  loginBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  registerBtn: {
    borderWidth: 2, borderColor: Colors.primary, borderRadius: 14, paddingVertical: 13,
    alignItems: "center", marginBottom: 16,
  },
  registerBtnText: { fontSize: 15, fontWeight: "700", color: Colors.primary },
  guestBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, marginBottom: 12,
  },
  guestBtnText: { fontSize: 13, color: Colors.textMuted, fontWeight: "600" },
  linksRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16,
  },
  linkBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  linkBtnText: { fontSize: 12, color: Colors.primary, fontWeight: "600" },
  linkDivider: { width: 1, height: 16, backgroundColor: Colors.border },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary, textAlign: "center", marginBottom: 8 },
  langOption: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    borderRadius: 12, backgroundColor: Colors.surfaceAlt,
  },
  langOptionActive: { backgroundColor: Colors.primaryLight, borderWidth: 1.5, borderColor: Colors.primary },
  langOptionInfo: { flex: 1 },
  langOptionName: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  langOptionSub: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  modalClose: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8,
  },
  modalCloseText: { fontSize: 15, fontWeight: "700", color: Colors.textMuted },
  adminOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  adminBox: {
    backgroundColor: "#fff", borderRadius: 24, padding: 24,
    width: "100%", maxWidth: 360, gap: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 10,
  },
  adminHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  adminLogo: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: "#7C3AED15",
    alignItems: "center", justifyContent: "center",
  },
  adminTitle: { flex: 1, fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  adminForm: { gap: 10 },
  adminInputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 14,
  },
  adminInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: Colors.textPrimary },
  adminError: { fontSize: 12, color: Colors.error, textAlign: "right" },
  adminBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  adminBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

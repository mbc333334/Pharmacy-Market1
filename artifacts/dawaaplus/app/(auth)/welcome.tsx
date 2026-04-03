import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "@/i18n";
import { LANGUAGES } from "@/data/locales";

const { height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useSettings();
  const { t } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);

  return (
    <View style={styles.container}>
      <View style={[styles.heroSection, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 40) }]}>
        <TouchableOpacity style={styles.langBtn} onPress={() => setShowLangModal(true)}>
          <Text style={styles.langBtnFlag}>{language.flag}</Text>
          <Text style={styles.langBtnText}>{language.nativeName}</Text>
          <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>

        <View style={styles.logoCircle}>
          <Ionicons name="medkit" size={56} color="#fff" />
        </View>
        <Text style={styles.appName}>{t("appName")}</Text>
        <Text style={styles.tagline}>{t("appTagline")}</Text>

        <View style={styles.langRow}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langPill, language.code === lang.code && styles.langPillActive]}
              onPress={() => setLanguage(lang)}
            >
              <Text style={styles.langPillFlag}>{lang.flag}</Text>
              <Text style={[styles.langPillText, language.code === lang.code && styles.langPillTextActive]}>
                {lang.nativeName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
                <Text style={styles.langOptionFlag}>{lang.flag}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowLangModal(false)}>
              <Text style={styles.modalCloseText}>{t("cancel")}</Text>
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
  langBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    alignSelf: "flex-end", marginBottom: 16,
  },
  langBtnFlag: { fontSize: 16 },
  langBtnText: { fontSize: 13, color: "rgba(255,255,255,0.95)", fontWeight: "600" },
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
  langRow: {
    flexDirection: "row", gap: 8, marginBottom: 20, flexWrap: "wrap", justifyContent: "center",
  },
  langPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1.5, borderColor: "transparent",
  },
  langPillActive: { borderColor: "#fff", backgroundColor: "rgba(255,255,255,0.25)" },
  langPillFlag: { fontSize: 14 },
  langPillText: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  langPillTextActive: { color: "#fff", fontWeight: "800" },
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
  langOptionFlag: { fontSize: 28 },
  modalClose: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8,
  },
  modalCloseText: { fontSize: 15, fontWeight: "700", color: Colors.textMuted },
});

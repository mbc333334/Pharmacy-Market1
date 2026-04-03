import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
  Platform, ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n";

type TabType = "customer" | "pharmacy" | "warehouse";

const ADMIN_PHONE = "+9647700000001";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loginDemo } = useAuth();
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabType>("customer");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!phone || !password) {
      setError(t("enterAllFields"));
      return;
    }
    if (phone === ADMIN_PHONE) {
      setError("");
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      loginDemo("admin");
      setLoading(false);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const ok = await login(phone, password, tab);
      if (!ok) setError(t("wrongCredentials"));
    } catch {
      setError(t("wrongCredentials"));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type: "customer" | "pharmacy" | "warehouse" | "admin") => {
    setDemoLoading(type);
    await new Promise(r => setTimeout(r, 400));
    loginDemo(type);
    setDemoLoading(null);
  };

  const tabs: { key: TabType; icon: any; label: string }[] = [
    { key: "customer", icon: "person-outline", label: t("customer") },
    { key: "pharmacy", icon: "storefront-outline", label: t("pharmacy") },
    { key: "warehouse", icon: "cube-outline", label: t("warehouse") },
  ];

  const activeColor = tab === "warehouse" ? "#0D7A54" : Colors.primary;

  const DEMO_BUTTONS = [
    { type: "customer" as const, label: "دخول سريع — عميل", icon: "person", color: "#3B82F6" },
    { type: "pharmacy" as const, label: "دخول سريع — صيدلي", icon: "storefront", color: Colors.primary },
    { type: "warehouse" as const, label: "دخول سريع — مذخر", icon: "cube", color: "#0D7A54" },
    { type: "admin" as const, label: "دخول سريع — مدير", icon: "shield", color: "#7C3AED" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.logoSmall}>
          <Ionicons name="medkit" size={24} color={Colors.primary} />
          <Text style={styles.logoText}>{t("appName")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t("welcomeBack")}</Text>
        <Text style={styles.subtitle}>{t("loginSubtitle")}</Text>

        {/* Quick Demo Buttons */}
        <View style={styles.demoSection}>
          <View style={styles.demoHeader}>
            <View style={styles.demoLine} />
            <Text style={styles.demoHeaderText}>دخول سريع للتجربة</Text>
            <View style={styles.demoLine} />
          </View>
          <View style={styles.demoGrid}>
            {DEMO_BUTTONS.map(btn => (
              <TouchableOpacity
                key={btn.type}
                style={[styles.demoBtn, { borderColor: btn.color + "40", backgroundColor: btn.color + "10" }]}
                onPress={() => handleDemoLogin(btn.type)}
                disabled={demoLoading !== null}
              >
                {demoLoading === btn.type ? (
                  <ActivityIndicator size="small" color={btn.color} />
                ) : (
                  <Ionicons name={btn.icon as any} size={18} color={btn.color} />
                )}
                <Text style={[styles.demoBtnText, { color: btn.color }]}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>أو سجّل الدخول بحسابك</Text>
          <View style={styles.orLine} />
        </View>

        {/* Tab Selector */}
        <View style={styles.tabs}>
          {tabs.map(tabItem => (
            <TouchableOpacity
              key={tabItem.key}
              style={[styles.tab, tab === tabItem.key && styles.tabActive]}
              onPress={() => setTab(tabItem.key)}
            >
              <Ionicons
                name={tabItem.icon}
                size={15}
                color={tab === tabItem.key
                  ? (tabItem.key === "warehouse" ? "#0D7A54" : Colors.primary)
                  : Colors.textMuted}
              />
              <Text style={[
                styles.tabText,
                tab === tabItem.key && { color: tabItem.key === "warehouse" ? "#0D7A54" : Colors.primary },
              ]}>
                {tabItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t("phone")}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="+964 7XX XXX XXXX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                textAlign="right"
                placeholderTextColor={Colors.textMuted}
              />
              <Ionicons name="call-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t("password")}</Text>
            <View style={styles.inputWrap}>
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.inputIcon}>
                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                textAlign="right"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPass}>
            <Text style={[styles.forgotPassText, { color: activeColor }]}>{t("forgotPassword")}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: activeColor }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.loginBtnText}>{t("login")}</Text>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        {tab === "customer" ? (
          <View style={styles.registerRow}>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerLink}>{t("createAccount")}</Text>
            </TouchableOpacity>
            <Text style={styles.registerRowText}>{t("noAccount")}</Text>
          </View>
        ) : tab === "pharmacy" ? (
          <View style={styles.registerRow}>
            <TouchableOpacity onPress={() => router.push("/(auth)/pharmacy-register")}>
              <Text style={styles.registerLink}>{t("registerNow")}</Text>
            </TouchableOpacity>
            <Text style={styles.registerRowText}>{t("newPharmacy")}</Text>
          </View>
        ) : (
          <View style={styles.registerRow}>
            <TouchableOpacity onPress={() => router.push("/(auth)/warehouse-register")}>
              <Text style={[styles.registerLink, { color: "#0D7A54" }]}>{t("registerNow")}</Text>
            </TouchableOpacity>
            <Text style={styles.registerRowText}>{t("warehouse")} {t("noAccount")}</Text>
          </View>
        )}

        <View style={styles.adminHint}>
          <Ionicons name="shield-outline" size={14} color="#7C3AED" />
          <Text style={styles.adminHintText}>للدخول كمدير: +9647700000001</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surfaceAlt, alignItems: "center", justifyContent: "center",
  },
  logoSmall: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoText: { fontSize: 20, fontWeight: "800", color: Colors.primary },
  content: { padding: 24 },
  title: { fontSize: 26, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: "right", marginBottom: 20 },

  demoSection: { marginBottom: 20 },
  demoHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  demoLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  demoHeaderText: { fontSize: 12, fontWeight: "700", color: Colors.textMuted },
  demoGrid: { gap: 8 },
  demoBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1,
  },
  demoBtnText: { fontSize: 13, fontWeight: "700" },

  orRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { fontSize: 12, fontWeight: "600", color: Colors.textMuted },

  tabs: {
    flexDirection: "row", backgroundColor: Colors.surfaceAlt,
    borderRadius: 14, padding: 4, marginBottom: 20,
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 9, borderRadius: 12, gap: 4,
  },
  tabActive: {
    backgroundColor: Colors.surface,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  tabText: { fontSize: 12, fontWeight: "600", color: Colors.textMuted },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.errorLight, borderRadius: 10, padding: 12, marginBottom: 16, justifyContent: "flex-end",
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1, textAlign: "right" },
  form: { gap: 14, marginBottom: 8 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary, textAlign: "right" },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.textPrimary },
  inputIcon: { paddingHorizontal: 4 },
  forgotPass: { alignSelf: "flex-end", marginBottom: 4 },
  forgotPassText: { fontSize: 13, fontWeight: "600" },
  loginBtn: {
    borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 8, marginBottom: 16,
  },
  loginBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  registerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 },
  registerRowText: { fontSize: 13, color: Colors.textSecondary },
  registerLink: { fontSize: 13, fontWeight: "700", color: Colors.primary },
  adminHint: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, padding: 10, backgroundColor: "#7C3AED10",
    borderRadius: 10, borderWidth: 1, borderColor: "#7C3AED30",
  },
  adminHintText: { fontSize: 12, color: "#7C3AED", fontWeight: "600" },
});

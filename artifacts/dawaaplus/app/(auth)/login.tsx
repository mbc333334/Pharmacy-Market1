import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

type TabType = "customer" | "pharmacy";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [tab, setTab] = useState<TabType>("customer");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!phone || !password) {
      setError("يرجى إدخال جميع الحقول");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(phone, password, tab);
    } catch {
      setError("بيانات الدخول غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.logoSmall}>
          <Ionicons name="medkit" size={24} color={Colors.primary} />
          <Text style={styles.logoText}>دواء+</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>مرحباً بعودتك 👋</Text>
        <Text style={styles.subtitle}>سجّل الدخول للوصول إلى حسابك</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === "pharmacy" && styles.tabActive]}
            onPress={() => setTab("pharmacy")}
          >
            <Ionicons name="storefront-outline" size={16} color={tab === "pharmacy" ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.tabText, tab === "pharmacy" && styles.tabTextActive]}>صيدلية</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "customer" && styles.tabActive]}
            onPress={() => setTab("customer")}
          >
            <Ionicons name="person-outline" size={16} color={tab === "customer" ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.tabText, tab === "customer" && styles.tabTextActive]}>عميل</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              {tab === "pharmacy" ? "رقم الجوال أو رقم الرخصة" : "رقم الجوال"}
            </Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder={tab === "pharmacy" ? "XXXX-XXXX أو +966 5X XXX XXXX" : "+966 5X XXX XXXX"}
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
            <Text style={styles.label}>كلمة المرور</Text>
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
            <Text style={styles.forgotPassText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        {tab === "customer" ? (
          <View style={styles.registerRow}>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerLink}>إنشاء حساب جديد</Text>
            </TouchableOpacity>
            <Text style={styles.registerRowText}>ليس لديك حساب؟</Text>
          </View>
        ) : (
          <View style={styles.registerRow}>
            <TouchableOpacity onPress={() => router.push("/(auth)/pharmacy-register")}>
              <Text style={styles.registerLink}>سجّل صيدليتك الآن</Text>
            </TouchableOpacity>
            <Text style={styles.registerRowText}>صيدلية جديدة؟</Text>
          </View>
        )}

        <View style={styles.demoHint}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.demoHintText}>
            {tab === "customer" ? "أدخل أي رقم وكلمة مرور للتجربة" : "أدخل أي بيانات للتجربة كصيدلية"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center", justifyContent: "center",
  },
  logoSmall: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoText: { fontSize: 20, fontWeight: "800", color: Colors.primary },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 6 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: "right", marginBottom: 24 },
  tabs: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 10, borderRadius: 12, gap: 6,
  },
  tabActive: { backgroundColor: Colors.surface, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: "600", color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.errorLight, borderRadius: 10,
    padding: 12, marginBottom: 16,
    justifyContent: "flex-end",
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1, textAlign: "right" },
  form: { gap: 16, marginBottom: 8 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, textAlign: "right" },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.textPrimary },
  inputIcon: { paddingHorizontal: 4 },
  forgotPass: { alignSelf: "flex-end", marginBottom: 8 },
  forgotPassText: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 8, marginBottom: 20,
  },
  loginBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  registerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 24 },
  registerRowText: { fontSize: 14, color: Colors.textSecondary },
  registerLink: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  demoHint: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.primaryLight, borderRadius: 10, padding: 12,
    justifyContent: "flex-end",
  },
  demoHintText: { fontSize: 12, color: Colors.primary, flex: 1, textAlign: "right" },
});

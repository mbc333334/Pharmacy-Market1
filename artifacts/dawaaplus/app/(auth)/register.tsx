import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform, ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { registerCustomer } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !phone || !password || !confirmPass) {
      setError("يرجى إدخال جميع الحقول");
      return;
    }
    if (password !== confirmPass) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await registerCustomer(name, phone, password);
    } catch {
      setError("حدث خطأ، يرجى المحاولة مجدداً");
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
        <Text style={styles.headerTitle}>حساب عميل جديد</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>إنشاء حسابك 🌿</Text>
        <Text style={styles.subtitle}>انضم إلى أكثر من 100,000 عميل يثقون بنا</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
          </View>
        ) : null}

        <View style={styles.form}>
          {[
            { label: "الاسم الكامل", value: name, setter: setName, placeholder: "محمد أحمد العمري", keyboard: "default" as const },
            { label: "رقم الجوال", value: phone, setter: setPhone, placeholder: "+964 7XX XXX XXXX", keyboard: "phone-pad" as const },
            { label: "كلمة المرور", value: password, setter: setPassword, placeholder: "••••••••", keyboard: "default" as const, secure: true },
            { label: "تأكيد كلمة المرور", value: confirmPass, setter: setConfirmPass, placeholder: "••••••••", keyboard: "default" as const, secure: true },
          ].map((field) => (
            <View key={field.label} style={styles.fieldGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType={field.keyboard}
                  secureTextEntry={field.secure}
                  textAlign="right"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.btnText}>إنشاء الحساب</Text>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginLink}>تسجيل الدخول</Text>
          </TouchableOpacity>
          <Text style={styles.loginRowText}>لديك حساب؟</Text>
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
  headerTitle: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary },
  content: { padding: 24 },
  title: { fontSize: 26, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: "right", marginBottom: 24 },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end",
    backgroundColor: Colors.errorLight, borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1, textAlign: "right" },
  form: { gap: 16, marginBottom: 24 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, textAlign: "right" },
  inputWrap: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14,
  },
  input: { paddingVertical: 14, fontSize: 15, color: Colors.textPrimary },
  btn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20,
  },
  btnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  loginRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  loginRowText: { fontSize: 14, color: Colors.textSecondary },
  loginLink: { fontSize: 14, fontWeight: "700", color: Colors.primary },
});

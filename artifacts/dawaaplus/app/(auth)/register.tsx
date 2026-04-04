import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform, ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

function genOTP() { return String(Math.floor(100000 + Math.random() * 900000)); }

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

  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpCode, setOtpCode] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpErr, setOtpErr] = useState("");
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timer <= 0) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => setTimer(v => v - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timer]);

  const startOtp = () => {
    if (!name || !phone || !password || !confirmPass) { setError("يرجى إدخال جميع الحقول"); return; }
    if (password !== confirmPass) { setError("كلمتا المرور غير متطابقتين"); return; }
    setError("");
    const code = genOTP(); setOtpCode(code); setOtpInput(""); setOtpErr(""); setStep("otp"); setTimer(60);
  };

  const verifyAndRegister = async () => {
    if (otpInput !== otpCode) { setOtpErr("رمز التحقق غير صحيح، حاول مجدداً"); return; }
    setLoading(true);
    try {
      await registerCustomer(name, phone, password);
    } catch {
      setOtpErr("حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = () => {
    const code = genOTP(); setOtpCode(code); setOtpInput(""); setOtpErr(""); setTimer(60);
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

        {step === "otp" ? (
          <>
            <View style={styles.otpNotice}>
              <Text style={styles.otpNoticeLabel}>📱 رمز التحقق التجريبي</Text>
              <Text style={styles.otpCode}>{otpCode}</Text>
              <Text style={styles.otpNoticeHint}>سيُرسَل عبر SMS إلى {phone} في التطبيق الفعلي</Text>
            </View>
            <Text style={styles.label}>أدخل رمز التحقق المكوّن من 6 أرقام</Text>
            <View style={[styles.inputWrap, { marginTop: 6, marginBottom: 6, borderColor: otpErr ? Colors.error : Colors.primary }]}>
              <TextInput
                style={[styles.input, { textAlign: "center", fontSize: 22, letterSpacing: 10, fontWeight: "800" }]}
                placeholder="• • • • • •"
                value={otpInput}
                onChangeText={t => { setOtpErr(""); setOtpInput(t.replace(/\D/g, "").slice(0, 6)); }}
                keyboardType="numeric"
                maxLength={6}
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            {otpErr ? <Text style={styles.errorText}>⚠️ {otpErr}</Text> : null}
            <View style={styles.timerRow}>
              {timer > 0 ? (
                <Text style={styles.timerText}>⏱ إعادة الإرسال بعد {timer}ث</Text>
              ) : (
                <TouchableOpacity onPress={resendOtp}>
                  <Text style={styles.resendLink}>إعادة إرسال الرمز</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={[styles.btn, { marginTop: 8 }]} onPress={verifyAndRegister} disabled={loading || otpInput.length < 6}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.btnText}>تحقق وإنشاء الحساب</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.backRow} onPress={() => setStep("form")}>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              <Text style={styles.backText}>العودة للنموذج</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
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
            <TouchableOpacity style={styles.btn} onPress={startOtp}>
              <Text style={styles.btnText}>📲 إرسال رمز التحقق (OTP)</Text>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.loginRow}>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.loginLink}>تسجيل الدخول</Text>
              </TouchableOpacity>
              <Text style={styles.loginRowText}>لديك حساب؟</Text>
            </View>
          </>
        )}
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
  otpNotice: {
    backgroundColor: "#FFFBEB", borderWidth: 1.5, borderColor: "#F6AD55",
    borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 20,
  },
  otpNoticeLabel: { fontSize: 12, fontWeight: "700", color: "#744210", marginBottom: 6 },
  otpCode: { fontSize: 30, fontWeight: "900", letterSpacing: 8, color: "#744210", marginBottom: 4 },
  otpNoticeHint: { fontSize: 11, color: "#92400E", textAlign: "center" },
  timerRow: { alignItems: "flex-end", marginBottom: 12 },
  timerText: { fontSize: 12, color: Colors.textMuted },
  resendLink: { fontSize: 13, fontWeight: "700", color: Colors.primary, textDecorationLine: "underline" },
  backRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 },
  backText: { fontSize: 13, color: Colors.textMuted },
});

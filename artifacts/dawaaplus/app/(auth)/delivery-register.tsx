import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform, ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const CITIES = ["هەولێر", "سلێمانی", "دهۆک", "کەرکووک", "زاخۆ", "رانیه", "بغداد", "موصل", "بصرة", "نجف"];
const STEPS = ["بيانات المالك", "بيانات الشركة", "المراجعة والإرسال"];

export default function DeliveryRegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [city, setCity] = useState("");
  const [fleetSize, setFleetSize] = useState("");
  const [cityOpen, setCityOpen] = useState(false);

  const nextStep = () => {
    if (step === 0) {
      if (!ownerName || !phone || !password) { setError("يرجى إدخال جميع الحقول"); return; }
    } else if (step === 1) {
      if (!companyName || !licenseNumber || !city) { setError("يرجى إدخال جميع الحقول"); return; }
    }
    setError("");
    setStep(s => Math.min(s + 1, 2));
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
        <View style={styles.successBox}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#D69E2E" />
          </View>
          <Text style={styles.successTitle}>تم إرسال الطلب!</Text>
          <Text style={styles.successSub}>
            سيتم مراجعة طلب تسجيل شركة التوصيل خلال 24-48 ساعة.{"\n"}
            سنتواصل معك على الرقم: {phone}
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(auth)/welcome")}>
            <Text style={styles.backBtnText}>العودة إلى الرئيسية</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 0 ? router.back() : setStep(s => s - 1)}>
          <Ionicons name="arrow-forward" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تسجيل شركة توصيل</Text>
        <View style={[styles.headerBadge, { backgroundColor: "#D69E2E18" }]}>
          <Ionicons name="bicycle" size={16} color="#D69E2E" />
        </View>
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        {STEPS.map((label, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= step && { backgroundColor: "#D69E2E" }]}>
              <Text style={styles.stepDotText}>{i + 1}</Text>
            </View>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && { backgroundColor: "#D69E2E" }]} />}
          </View>
        ))}
      </View>
      <Text style={styles.stepLabel}>{STEPS[step]}</Text>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.formGroup}>
            <Field label="اسم المالك" value={ownerName} onChange={setOwnerName} icon="person-outline" placeholder="الاسم الكامل" />
            <Field label="رقم الهاتف" value={phone} onChange={setPhone} icon="call-outline" placeholder="+964 7XX XXX XXXX" keyboardType="phone-pad" />
            <Field label="كلمة المرور" value={password} onChange={setPassword} icon="lock-closed-outline" placeholder="••••••••" secure />
          </View>
        )}

        {step === 1 && (
          <View style={styles.formGroup}>
            <Field label="اسم الشركة" value={companyName} onChange={setCompanyName} icon="business-outline" placeholder="مثال: شركة الفالكون للتوصيل" />
            <Field label="رقم الترخيص" value={licenseNumber} onChange={setLicenseNumber} icon="document-outline" placeholder="رقم ترخيص الشركة" />
            <Field label="حجم الأسطول (عدد السائقين)" value={fleetSize} onChange={setFleetSize} icon="people-outline" placeholder="مثال: 10" keyboardType="number-pad" />

            {/* City picker */}
            <Text style={styles.fieldLabel}>المدينة الرئيسية</Text>
            <TouchableOpacity style={styles.cityBtn} onPress={() => setCityOpen(!cityOpen)}>
              <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
              <Text style={[styles.cityBtnText, !city && { color: Colors.textMuted }]}>{city || "اختر المدينة"}</Text>
              <Ionicons name={cityOpen ? "chevron-up" : "chevron-down"} size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            {cityOpen && (
              <View style={styles.cityList}>
                {CITIES.map(c => (
                  <TouchableOpacity key={c} style={[styles.cityOption, city === c && styles.cityOptionActive]}
                    onPress={() => { setCity(c); setCityOpen(false); }}>
                    <Text style={[styles.cityOptionText, city === c && { color: "#D69E2E", fontWeight: "700" }]}>{c}</Text>
                    {city === c && <Ionicons name="checkmark" size={16} color="#D69E2E" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {step === 2 && (
          <View style={styles.reviewBox}>
            <Text style={styles.reviewTitle}>مراجعة البيانات</Text>
            <ReviewRow label="اسم المالك" value={ownerName} />
            <ReviewRow label="رقم الهاتف" value={phone} />
            <ReviewRow label="اسم الشركة" value={companyName} />
            <ReviewRow label="رقم الترخيص" value={licenseNumber} />
            <ReviewRow label="المدينة" value={city} />
            {fleetSize ? <ReviewRow label="حجم الأسطول" value={`${fleetSize} سائق`} /> : null}
            <View style={styles.reviewNote}>
              <Ionicons name="information-circle-outline" size={18} color="#D69E2E" />
              <Text style={styles.reviewNoteText}>
                سيتم مراجعة طلبك من قِبل فريق دواء+ وإرسال رد خلال 48 ساعة.
              </Text>
            </View>
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: "#D69E2E" }]}
          onPress={step < 2 ? nextStep : handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name={step < 2 ? "arrow-back" : "checkmark-circle"} size={20} color="#fff" />
              <Text style={styles.nextBtnText}>{step < 2 ? "التالي" : "إرسال الطلب"}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.replace("/(auth)/login")}>
          <Text style={styles.loginLinkText}>لديك حساب؟ تسجيل الدخول</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChange, icon, placeholder, secure, keyboardType }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          textAlign="right"
        />
        <Ionicons name={icon} size={18} color={Colors.textMuted} />
      </View>
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewValue}>{value}</Text>
      <Text style={styles.reviewLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  headerBadge: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 20, paddingHorizontal: 40 },
  stepItem: { flexDirection: "row", alignItems: "center" },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.border, alignItems: "center", justifyContent: "center" },
  stepDotText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  stepLine: { width: 40, height: 2, backgroundColor: Colors.border, marginHorizontal: 4 },
  stepLabel: { fontSize: 14, fontWeight: "700", color: Colors.textSecondary, textAlign: "center", marginTop: 8, marginBottom: 4 },
  form: { flex: 1, paddingHorizontal: 22, paddingTop: 16 },
  formGroup: { gap: 0 },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, textAlign: "right", marginBottom: 6 },
  fieldRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, marginBottom: 14,
  },
  fieldInput: { flex: 1, paddingVertical: 13, fontSize: 14, color: Colors.textPrimary },
  cityBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 4,
  },
  cityBtnText: { flex: 1, fontSize: 14, color: Colors.textPrimary, textAlign: "right" },
  cityList: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 10, overflow: "hidden" },
  cityOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  cityOptionActive: { backgroundColor: "#D69E2E0F" },
  cityOptionText: { fontSize: 14, color: Colors.textPrimary, textAlign: "right" },
  reviewBox: { backgroundColor: Colors.surfaceAlt, borderRadius: 16, padding: 18, gap: 12, marginBottom: 16 },
  reviewTitle: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary, textAlign: "center", marginBottom: 4 },
  reviewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  reviewLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: "600" },
  reviewValue: { fontSize: 13, color: Colors.textPrimary, fontWeight: "700" },
  reviewNote: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginTop: 4, backgroundColor: "#D69E2E0F", borderRadius: 10, padding: 10 },
  reviewNoteText: { flex: 1, fontSize: 12, color: Colors.textSecondary, textAlign: "right", lineHeight: 18 },
  errorText: { fontSize: 13, color: Colors.error, textAlign: "center", marginBottom: 10 },
  nextBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 14, paddingVertical: 15, marginBottom: 12, marginTop: 8,
  },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loginLink: { alignItems: "center", paddingBottom: 32 },
  loginLinkText: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  successBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#D69E2E12", alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 24, fontWeight: "800", color: Colors.textPrimary },
  successSub: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 22 },
  backBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  backBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

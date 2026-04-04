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

const CITIES = ["هەولێر", "سلێمانی", "دهۆک", "کەرکووک", "زاخۆ", "رانیه", "حلبجة", "بغداد", "موصل", "بصرة", "نجف", "کربلاء"];
const STEPS = ["بيانات المالك", "بيانات الصيدلية", "المراجعة والإرسال"];

export default function PharmacyRegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { registerPharmacy } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [otpStep, setOtpStep] = useState<"none"|"otp">("none");
  const [otpCode, setOtpCode] = useState(""); const [otpInput, setOtpInput] = useState(""); const [otpErr, setOtpErr] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(()=>{ if(otpTimer<=0){ if(timerRef.current) clearInterval(timerRef.current); return; } timerRef.current=setInterval(()=>setOtpTimer(v=>v-1),1000); return()=>{ if(timerRef.current) clearInterval(timerRef.current); }; },[otpTimer]);
  function genOTP(){ return String(Math.floor(100000+Math.random()*900000)); }

  const nextStep = () => {
    if (step === 0) {
      if (!ownerName || !phone || !password) { setError("يرجى إدخال جميع الحقول"); return; }
    } else if (step === 1) {
      if (!pharmacyName || !licenseNumber || !city) { setError("يرجى إدخال جميع الحقول"); return; }
    }
    setError("");
    setStep(s => Math.min(s + 1, 2));
  };

  const startOtp = () => {
    const code = genOTP(); setOtpCode(code); setOtpInput(""); setOtpErr(""); setOtpStep("otp"); setOtpTimer(60);
  };
  const verifyAndSubmit = async () => {
    if (otpInput !== otpCode) { setOtpErr("رمز التحقق غير صحيح، حاول مجدداً"); return; }
    setLoading(true);
    try {
      await registerPharmacy({ ownerName, phone, password, pharmacyName, licenseNumber, city, address });
    } catch {
      setOtpErr("حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };
  const resendOtp = () => { const code=genOTP(); setOtpCode(code); setOtpInput(""); setOtpErr(""); setOtpTimer(60); };

  if (otpStep === "otp") {
    return (
      <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0), justifyContent:"center" }]}>
        <ScrollView contentContainerStyle={{ padding: 28 }}>
          <View style={{ alignItems:"center", marginBottom: 20 }}>
            <View style={{ width:60, height:60, borderRadius:18, backgroundColor:"#1A9E6E", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
              <Ionicons name="shield-checkmark-outline" size={30} color="#fff" />
            </View>
            <Text style={{ fontSize:20, fontWeight:"900", color:"#0D7A54" }}>التحقق عبر SMS</Text>
            <Text style={{ fontSize:13, color:"#666", textAlign:"center", marginTop:4 }}>رمز التحقق سيُرسَل إلى {phone}</Text>
          </View>
          <View style={styles.otpNotice}>
            <Text style={styles.otpNoticeLabel}>📱 رمز التحقق التجريبي</Text>
            <Text style={styles.otpCodeText}>{otpCode}</Text>
            <Text style={styles.otpNoticeHint}>سيُرسَل عبر SMS في التطبيق الفعلي</Text>
          </View>
          <Text style={[styles.label, { marginBottom:6 }]}>أدخل رمز التحقق</Text>
          <View style={[styles.inputWrap, { borderColor: otpErr ? "#E53E3E" : "#1A9E6E" }]}>
            <TextInput style={[styles.input, { textAlign:"center", fontSize:22, letterSpacing:10, fontWeight:"800" }]}
              placeholder="• • • • • •" value={otpInput} maxLength={6} keyboardType="numeric"
              onChangeText={t=>{ setOtpErr(""); setOtpInput(t.replace(/\D/g,"").slice(0,6)); }}
              placeholderTextColor="#aaa" />
          </View>
          {otpErr ? <Text style={{ color:"#E53E3E", textAlign:"right", marginTop:4, fontSize:12 }}>⚠️ {otpErr}</Text> : null}
          <View style={{ alignItems:"flex-end", marginVertical:10 }}>
            {otpTimer>0 ? <Text style={{ fontSize:12, color:"#888" }}>⏱ إعادة الإرسال بعد {otpTimer}ث</Text>
              : <TouchableOpacity onPress={resendOtp}><Text style={{ fontSize:13, fontWeight:"700", color:"#1A9E6E", textDecorationLine:"underline" }}>إعادة إرسال الرمز</Text></TouchableOpacity>}
          </View>
          <TouchableOpacity style={[styles.nextBtn, { opacity: otpInput.length<6||loading ? 0.5 : 1 }]}
            onPress={verifyAndSubmit} disabled={otpInput.length<6||loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <>
              <Text style={styles.nextBtnText}>تحقق وإرسال الطلب</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </>}
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems:"center", marginTop:14, flexDirection:"row", justifyContent:"center", gap:6 }} onPress={()=>setOtpStep("none")}>
            <Ionicons name="chevron-forward" size={16} color="#888" />
            <Text style={{ fontSize:13, color:"#888" }}>العودة للمراجعة</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تسجيل صيدلية جديدة</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.stepRow}>
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, i < step && styles.stepDone, i === step && styles.stepActive]}>
                {i < step ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : (
                  <Text style={[styles.stepNum, i === step && styles.stepNumActive]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]} numberOfLines={1}>{s}</Text>
            </View>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineDone]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
          </View>
        ) : null}

        {step === 0 && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>🧑‍⚕️ بيانات المالك</Text>
            <Field label="اسم المالك" value={ownerName} onChangeText={setOwnerName} placeholder="محمد أحمد العمري" />
            <Field label="رقم الهاتف" value={phone} onChangeText={setPhone} placeholder="+964 7XX XXX XXXX" keyboardType="phone-pad" />
            <Field label="كلمة المرور" value={password} onChangeText={setPassword} placeholder="••••••••" secure />
          </View>
        )}

        {step === 1 && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>🏥 بيانات الصيدلية</Text>
            <Field label="اسم الصيدلية" value={pharmacyName} onChangeText={setPharmacyName} placeholder="صيدلية الشفاء" />
            <Field label="رقم الترخيص الصحي *" value={licenseNumber} onChangeText={setLicenseNumber} placeholder="XXXX-XXXX" />
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>المدينة</Text>
              <TouchableOpacity style={styles.cityPicker} onPress={() => setCityOpen(!cityOpen)}>
                <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
                <Text style={[styles.cityText, !city && { color: Colors.textMuted }]}>{city || "اختر المدينة"}</Text>
                <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
              {cityOpen && (
                <View style={styles.cityList}>
                  {CITIES.map(c => (
                    <TouchableOpacity key={c} style={[styles.cityOption, c === city && styles.cityOptionActive]}
                      onPress={() => { setCity(c); setCityOpen(false); }}>
                      {c === city && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                      <Text style={[styles.cityOptionText, c === city && { color: Colors.primary, fontWeight: "700" }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <Field label="العنوان التفصيلي" value={address} onChangeText={setAddress} placeholder="الحي، الشارع..." />
            <View style={styles.uploadBox}>
              <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
              <Text style={styles.uploadTitle}>صورة الترخيص الصحي</Text>
              <Text style={styles.uploadSub}>PDF, JPG — حتى 5MB</Text>
              <TouchableOpacity style={styles.uploadBtn}>
                <Text style={styles.uploadBtnText}>رفع الملف</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>✅ مراجعة البيانات</Text>
            <ReviewRow label="الاسم" value={ownerName} />
            <ReviewRow label="الجوال" value={phone} />
            <ReviewRow label="الصيدلية" value={pharmacyName} />
            <ReviewRow label="الترخيص" value={licenseNumber} />
            <ReviewRow label="المدينة" value={city} />
            {address ? <ReviewRow label="العنوان" value={address} /> : null}

            <View style={styles.termsBox}>
              <Text style={styles.termsText}>
                بالضغط على «إرسال الطلب»، أوافق على{" "}
                <Text style={styles.termsLink}>الشروط والأحكام</Text>{" "}
                و<Text style={styles.termsLink}>سياسة الخصوصية</Text>
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) }]}>
        {step < 2 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
            <Text style={styles.nextBtnText}>التالي</Text>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={startOtp}>
            <Text style={styles.nextBtnText}>📲 إرسال رمز التحقق (OTP)</Text>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, secure }: any) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          textAlign="right"
          placeholderTextColor={Colors.textMuted}
        />
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
  stepRow: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: 20, paddingVertical: 16, gap: 0,
  },
  stepItem: { alignItems: "center", flex: 1 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.border, alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  stepDone: { backgroundColor: Colors.success },
  stepActive: { backgroundColor: Colors.primary },
  stepNum: { fontSize: 12, fontWeight: "700", color: Colors.textMuted },
  stepNumActive: { color: "#fff" },
  stepLabel: { fontSize: 10, color: Colors.textMuted, textAlign: "center" },
  stepLabelActive: { color: Colors.primary, fontWeight: "700" },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.border, marginTop: 13 },
  stepLineDone: { backgroundColor: Colors.success },
  content: { padding: 20, paddingBottom: 100 },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end",
    backgroundColor: Colors.errorLight, borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1, textAlign: "right" },
  form: { gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 4 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, textAlign: "right" },
  inputWrap: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14,
  },
  input: { paddingVertical: 14, fontSize: 15, color: Colors.textPrimary },
  cityPicker: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 8,
  },
  cityText: { flex: 1, fontSize: 15, color: Colors.textPrimary, textAlign: "right" },
  cityList: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    marginTop: 4, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  cityOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "flex-end",
    padding: 14, gap: 8, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cityOptionActive: { backgroundColor: Colors.primaryLight },
  cityOptionText: { fontSize: 15, color: Colors.textPrimary },
  uploadBox: {
    borderWidth: 2, borderStyle: "dashed", borderColor: Colors.primary,
    borderRadius: 14, padding: 24, alignItems: "center", gap: 8,
    backgroundColor: Colors.primaryLight,
  },
  uploadTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },
  uploadSub: { fontSize: 12, color: Colors.textMuted },
  uploadBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 20, marginTop: 4,
  },
  uploadBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  reviewRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  reviewLabel: { fontSize: 14, color: Colors.textMuted, fontWeight: "600" },
  reviewValue: { fontSize: 15, color: Colors.textPrimary, fontWeight: "600" },
  termsBox: {
    backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 16, marginTop: 8,
  },
  termsText: { fontSize: 13, color: Colors.textSecondary, textAlign: "right", lineHeight: 20 },
  termsLink: { color: Colors.primary, fontWeight: "700" },
  footer: {
    padding: 20, backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  nextBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  nextBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  otpNotice: { backgroundColor:"#FFFBEB", borderWidth:1.5, borderColor:"#F6AD55", borderRadius:14, padding:16, alignItems:"center", marginBottom:16 },
  otpNoticeLabel: { fontSize:12, fontWeight:"700", color:"#744210", marginBottom:6 },
  otpCodeText: { fontSize:30, fontWeight:"900", letterSpacing:8, color:"#744210", marginBottom:4 },
  otpNoticeHint: { fontSize:11, color:"#92400E", textAlign:"center" },
  inputWrap: { backgroundColor:Colors.surfaceAlt, borderRadius:12, borderWidth:1.5, borderColor:Colors.border, paddingHorizontal:14 },
  input: { paddingVertical:14, fontSize:15, color:Colors.textPrimary },
  label: { fontSize:14, fontWeight:"600", color:Colors.textPrimary, textAlign:"right" },
});

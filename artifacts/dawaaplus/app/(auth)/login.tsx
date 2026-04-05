import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
  Platform, ScrollView, Modal, KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n";

type TabType = "customer" | "pharmacy" | "warehouse" | "delivery";

const ADMIN_PHONE = "+9647700000001";

const DEMO_ACCOUNTS = [
  {
    type: "customer" as const,
    label: "عميل",
    sub: "تصفح الصيدليات والأدوية",
    icon: "person" as const,
    color: "#3B82F6",
    bg: "#3B82F610",
    border: "#3B82F630",
  },
  {
    type: "pharmacy" as const,
    label: "صيدلية",
    sub: "لوحة تحكم الصيدلية",
    icon: "storefront" as const,
    color: Colors.primary,
    bg: Colors.primaryLight,
    border: Colors.primary + "30",
  },
  {
    type: "warehouse" as const,
    label: "مذخر",
    sub: "إدارة المستودع",
    icon: "cube" as const,
    color: "#0D7A54",
    bg: "#0D7A5410",
    border: "#0D7A5430",
  },
  {
    type: "delivery" as const,
    label: "شركة توصيل",
    sub: "لوحة تحكم التوصيل",
    icon: "bicycle" as const,
    color: "#D69E2E",
    bg: "#D69E2E10",
    border: "#D69E2E30",
  },
];

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loginDemo, loginDelivery } = useAuth();
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabType>("customer");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showFp, setShowFp] = useState(false);
  const [fpStep, setFpStep] = useState<"phone"|"otp"|"pass"|"done">("phone");
  const [fpPhone, setFpPhone] = useState(""); const [fpErr, setFpErr] = useState(""); const [fpId, setFpId] = useState("");
  const [fpOtp, setFpOtp] = useState(""); const [fpOtpIn, setFpOtpIn] = useState(""); const [fpTimer, setFpTimer] = useState(0);
  const [fpNew, setFpNew] = useState(""); const [fpConfirm, setFpConfirm] = useState("");
  const fpTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(() => {
    if (fpTimer <= 0) { if (fpTimerRef.current) { clearInterval(fpTimerRef.current); fpTimerRef.current = null; } return; }
    fpTimerRef.current = setInterval(() => setFpTimer(v => v - 1), 1000);
    return () => { if (fpTimerRef.current) { clearInterval(fpTimerRef.current); fpTimerRef.current = null; } };
  }, [fpTimer]);

  const KNOWN_PHONES: Record<string, Record<string, string>> = {
    pharmacy: { "07501234567":"ph1", "07701234568":"ph2", "07601234569":"ph3", "07801234570":"ph4" },
    warehouse: { "07501111111":"wh1", "07701111112":"wh2", "07601111113":"wh3", "07801111114":"wh4" },
  };

  const genFpOtp = () => String(Math.floor(100000 + Math.random() * 900000));
  const openFp = () => { setFpStep("phone"); setFpPhone(""); setFpErr(""); setFpOtpIn(""); setFpNew(""); setFpConfirm(""); setShowFp(true); };
  const closeFp = () => { setShowFp(false); };
  const sendFpOtp = () => {
    const ph = fpPhone.trim();
    if (!ph) { setFpErr("أدخل رقم الهاتف"); return; }
    if (tab === "customer") {
      const key = `customer_pass_${ph}`;
      const accs: any[] = JSON.parse(typeof localStorage !== "undefined" ? localStorage.getItem("customer_accounts") || "[]" : "[]");
      const found = accs.find((a: any) => a.phone === ph);
      if (!found && !localStorage.getItem(key)) { setFpErr("لا يوجد حساب مسجّل بهذا الرقم"); return; }
      setFpId(ph); setFpErr(""); const code = genFpOtp(); setFpOtp(code); setFpOtpIn(""); setFpTimer(60); setFpStep("otp");
    } else {
      const phones = KNOWN_PHONES[tab] || {};
      const id = phones[ph];
      if (!id) { setFpErr("لا يوجد حساب مسجّل بهذا الرقم"); return; }
      setFpId(id); setFpErr(""); const code = genFpOtp(); setFpOtp(code); setFpOtpIn(""); setFpTimer(60); setFpStep("otp");
    }
  };
  const verifyFpOtp = () => {
    if (fpOtpIn !== fpOtp) { setFpErr("رمز التحقق غير صحيح"); return; }
    setFpErr(""); setFpNew(""); setFpConfirm(""); setFpStep("pass");
  };
  const saveFpPass = () => {
    if (!fpNew || fpNew !== fpConfirm) { setFpErr("كلمتا المرور غير متطابقتين"); return; }
    const key = tab === "customer" ? `customer_pass_${fpId}` : tab === "pharmacy" ? `ph_pass_${fpId}` : `wh_pass_${fpId}`;
    if (typeof localStorage !== "undefined") localStorage.setItem(key, fpNew);
    setFpErr(""); setFpStep("done");
  };

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
      let ok = false;
      if (tab === "delivery") {
        ok = await loginDelivery(phone, password);
      } else {
        ok = await login(phone, password, tab);
      }
      if (!ok) setError(t("wrongCredentials"));
    } catch {
      setError(t("wrongCredentials"));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type: "customer" | "pharmacy" | "warehouse" | "delivery") => {
    setDemoLoading(type);
    await new Promise(r => setTimeout(r, 400));
    loginDemo(type);
    setDemoLoading(null);
  };

  const tabs: { key: TabType; icon: any; label: string }[] = [
    { key: "customer",  icon: "person-outline",    label: t("customer") },
    { key: "pharmacy",  icon: "storefront-outline", label: t("pharmacy") },
    { key: "warehouse", icon: "cube-outline",       label: t("warehouse") },
    { key: "delivery",  icon: "bicycle-outline",    label: "توصيل" },
  ];

  const activeColor =
    tab === "warehouse" ? "#0D7A54" :
    tab === "delivery"  ? "#D69E2E" :
    Colors.primary;

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

        {/* Single combined quick-login card */}
        <View style={styles.demoCard}>
          <View style={styles.demoCardHeader}>
            <Text style={styles.demoCardTitle}>دخول سريع للتجربة</Text>
            <View style={styles.demoCardBadge}>
              <Text style={styles.demoCardBadgeText}>DEMO</Text>
            </View>
          </View>
          <Text style={styles.demoCardSub}>اختر نوع الحساب للدخول مباشرة</Text>

          {DEMO_ACCOUNTS.map((acc, idx) => (
            <React.Fragment key={acc.type}>
              {idx > 0 && <View style={styles.demoSeparator} />}
              <TouchableOpacity
                style={styles.demoRow}
                onPress={() => handleDemoLogin(acc.type)}
                disabled={demoLoading !== null}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={16} color={Colors.textMuted} />
                <View style={styles.demoRowRight}>
                  <Text style={[styles.demoRowLabel, { color: acc.color }]}>{acc.label}</Text>
                  <Text style={styles.demoRowSub}>{acc.sub}</Text>
                </View>
                <View style={[styles.demoIconCircle, { backgroundColor: acc.bg, borderColor: acc.border }]}>
                  {demoLoading === acc.type ? (
                    <ActivityIndicator size="small" color={acc.color} />
                  ) : (
                    <Ionicons name={acc.icon} size={20} color={acc.color} />
                  )}
                </View>
              </TouchableOpacity>
            </React.Fragment>
          ))}
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
                  ? (tabItem.key === "warehouse" ? "#0D7A54" : tabItem.key === "delivery" ? "#D69E2E" : Colors.primary)
                  : Colors.textMuted}
              />
              <Text style={[
                styles.tabText,
                tab === tabItem.key && { color: tabItem.key === "warehouse" ? "#0D7A54" : tabItem.key === "delivery" ? "#D69E2E" : Colors.primary },
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

          <TouchableOpacity style={styles.forgotPass} onPress={openFp}>
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
          <>
            <View style={styles.registerRow}>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.registerLink}>{t("createAccount")}</Text>
              </TouchableOpacity>
              <Text style={styles.registerRowText}>{t("noAccount")}</Text>
            </View>
            <TouchableOpacity style={styles.guestBtn} onPress={() => router.replace("/(customer)")}>
              <Ionicons name="eye-outline" size={15} color={Colors.textMuted} />
              <Text style={styles.guestBtnText}>تصفح بدون تسجيل</Text>
            </TouchableOpacity>
          </>
        ) : tab === "pharmacy" ? (
          <View style={styles.registerRow}>
            <TouchableOpacity onPress={() => router.push("/(auth)/pharmacy-register")}>
              <Text style={styles.registerLink}>{t("registerNow")}</Text>
            </TouchableOpacity>
            <Text style={styles.registerRowText}>{t("newPharmacy")}</Text>
          </View>
        ) : tab === "warehouse" ? (
          <View style={styles.registerRow}>
            <TouchableOpacity onPress={() => router.push("/(auth)/warehouse-register")}>
              <Text style={[styles.registerLink, { color: "#0D7A54" }]}>{t("registerNow")}</Text>
            </TouchableOpacity>
            <Text style={styles.registerRowText}>{t("warehouse")} {t("noAccount")}</Text>
          </View>
        ) : (
          <View style={styles.registerRow}>
            <TouchableOpacity onPress={() => router.push("/(auth)/delivery-register" as any)}>
              <Text style={[styles.registerLink, { color: "#D69E2E" }]}>سجّل شركتك الآن</Text>
            </TouchableOpacity>
            <Text style={styles.registerRowText}>شركتك غير مسجّلة؟</Text>
          </View>
        )}

      </ScrollView>

      <Modal visible={showFp} transparent animationType="slide" onRequestClose={closeFp}>
        <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={{ flex:1 }}>
          <TouchableOpacity style={fpS.overlay} activeOpacity={1} onPress={closeFp}>
            <TouchableOpacity activeOpacity={1} style={fpS.sheet} onPress={()=>{}}>
              <View style={fpS.handle} />
              <View style={fpS.headerRow}>
                <TouchableOpacity onPress={closeFp}><Ionicons name="close-circle" size={26} color={Colors.textMuted} /></TouchableOpacity>
                <View style={{ flex:1, alignItems:"flex-end" }}>
                  <Text style={fpS.title}>🔐 نسيت كلمة المرور؟</Text>
                  <Text style={fpS.sub}>سنساعدك في استعادة حسابك</Text>
                </View>
              </View>

              {fpStep==="phone" && <>
                <Text style={fpS.lbl}>رقم الهاتف المسجّل</Text>
                <TextInput style={fpS.inp} placeholder="07xxxxxxxxx" value={fpPhone} onChangeText={t=>{setFpErr("");setFpPhone(t);}}
                  keyboardType="phone-pad" textAlign="right" placeholderTextColor={Colors.textMuted} />
                {fpErr ? <Text style={fpS.err}>⚠️ {fpErr}</Text> : null}
                <TouchableOpacity style={[fpS.btn,{backgroundColor:activeColor}]} onPress={sendFpOtp}>
                  <Ionicons name="send-outline" size={18} color="#fff" />
                  <Text style={fpS.btnTxt}>📲 إرسال رمز التحقق</Text>
                </TouchableOpacity>
              </>}

              {fpStep==="otp" && <>
                <View style={fpS.otpBox}>
                  <Text style={fpS.otpLbl}>📱 رمز التحقق التجريبي</Text>
                  <Text style={fpS.otpCode}>{fpOtp}</Text>
                  <Text style={fpS.otpHnt}>سيُرسَل عبر SMS في التطبيق الفعلي</Text>
                </View>
                <Text style={fpS.lbl}>أدخل رمز التحقق المكوّن من 6 أرقام</Text>
                <TextInput style={[fpS.inp,{textAlign:"center",fontSize:22,letterSpacing:10,fontWeight:"800"}]}
                  placeholder="• • • • • •" value={fpOtpIn} maxLength={6} keyboardType="numeric"
                  onChangeText={t=>{setFpErr("");setFpOtpIn(t.replace(/[^0-9]/g,"").slice(0,6));}}
                  placeholderTextColor={Colors.textMuted} />
                {fpErr ? <Text style={fpS.err}>⚠️ {fpErr}</Text> : null}
                <View style={{alignItems:"flex-end",marginVertical:8}}>
                  {fpTimer>0 ? <Text style={fpS.timer}>⏱ إعادة الإرسال بعد {fpTimer}ث</Text>
                    : <TouchableOpacity onPress={()=>{const c=genFpOtp();setFpOtp(c);setFpOtpIn("");setFpErr("");setFpTimer(60);}}>
                        <Text style={[fpS.resend,{color:activeColor}]}>إعادة إرسال الرمز</Text>
                      </TouchableOpacity>}
                </View>
                <TouchableOpacity style={[fpS.btn,{backgroundColor:activeColor,opacity:fpOtpIn.length<6?0.4:1}]}
                  onPress={verifyFpOtp} disabled={fpOtpIn.length<6}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={fpS.btnTxt}>✅ تحقق من الرمز</Text>
                </TouchableOpacity>
                <TouchableOpacity style={fpS.backRow} onPress={()=>{setFpStep("phone");setFpErr("");}}>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  <Text style={fpS.backTxt}>العودة</Text>
                </TouchableOpacity>
              </>}

              {fpStep==="pass" && <>
                <Text style={fpS.lbl}>كلمة المرور الجديدة</Text>
                <TextInput style={fpS.inp} placeholder="••••••••" secureTextEntry value={fpNew}
                  onChangeText={t=>{setFpErr("");setFpNew(t);}} textAlign="right" placeholderTextColor={Colors.textMuted} />
                <Text style={fpS.lbl}>تأكيد كلمة المرور</Text>
                <TextInput style={[fpS.inp,{borderColor:fpConfirm&&fpConfirm!==fpNew?"#E53E3E":Colors.border}]}
                  placeholder="••••••••" secureTextEntry value={fpConfirm}
                  onChangeText={t=>{setFpErr("");setFpConfirm(t);}} textAlign="right" placeholderTextColor={Colors.textMuted} />
                {fpErr ? <Text style={fpS.err}>⚠️ {fpErr}</Text> : null}
                <TouchableOpacity style={[fpS.btn,{backgroundColor:activeColor,opacity:(!fpNew||fpNew!==fpConfirm)?0.4:1}]}
                  onPress={saveFpPass} disabled={!fpNew||fpNew!==fpConfirm}>
                  <Ionicons name="lock-closed-outline" size={18} color="#fff" />
                  <Text style={fpS.btnTxt}>🔒 حفظ كلمة المرور الجديدة</Text>
                </TouchableOpacity>
              </>}

              {fpStep==="done" && <View style={{alignItems:"center",paddingVertical:20}}>
                <Ionicons name="checkmark-circle" size={64} color="#38A169" />
                <Text style={{fontSize:18,fontWeight:"900",color:"#38A169",marginTop:12,marginBottom:8}}>تم تغيير كلمة المرور!</Text>
                <Text style={{fontSize:13,color:Colors.textMuted,marginBottom:20,textAlign:"center"}}>يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</Text>
                <TouchableOpacity style={[fpS.btn,{backgroundColor:activeColor}]} onPress={closeFp}>
                  <Text style={fpS.btnTxt}>العودة لتسجيل الدخول</Text>
                </TouchableOpacity>
              </View>}
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const fpS = StyleSheet.create({
  overlay: { flex:1, backgroundColor:"rgba(0,0,0,0.5)", justifyContent:"flex-end" },
  sheet: { backgroundColor:"#fff", borderTopLeftRadius:24, borderTopRightRadius:24, padding:24, paddingBottom:40 },
  handle: { width:40, height:4, backgroundColor:"#e2e8f0", borderRadius:2, alignSelf:"center", marginBottom:16 },
  headerRow: { flexDirection:"row", alignItems:"center", gap:12, marginBottom:20 },
  title: { fontSize:17, fontWeight:"900", color:"#1a202c" },
  sub: { fontSize:12, color:"#718096" },
  lbl: { fontSize:13, fontWeight:"700", color:"#1a202c", textAlign:"right", marginBottom:6 },
  inp: { borderWidth:1.5, borderColor:Colors.border, borderRadius:12, padding:12, fontSize:15, marginBottom:10, backgroundColor:"#f7fafc" },
  err: { fontSize:12, color:"#E53E3E", textAlign:"right", marginBottom:8 },
  btn: { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8, borderRadius:14, padding:14, marginTop:6 },
  btnTxt: { fontSize:15, fontWeight:"800", color:"#fff" },
  otpBox: { backgroundColor:"#FFFBEB", borderWidth:1.5, borderColor:"#F6AD55", borderRadius:14, padding:14, alignItems:"center", marginBottom:14 },
  otpLbl: { fontSize:11, fontWeight:"700", color:"#744210", marginBottom:4 },
  otpCode: { fontSize:28, fontWeight:"900", letterSpacing:8, color:"#744210" },
  otpHnt: { fontSize:10, color:"#92400E", marginTop:4, textAlign:"center" },
  timer: { fontSize:12, color:Colors.textMuted },
  resend: { fontSize:13, fontWeight:"700", textDecorationLine:"underline" },
  backRow: { flexDirection:"row", justifyContent:"center", alignItems:"center", gap:4, marginTop:12 },
  backTxt: { fontSize:13, color:Colors.textMuted },
});

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

  demoCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  demoCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 4 },
  demoCardTitle: { fontSize: 14, fontWeight: "800", color: Colors.textPrimary },
  demoCardBadge: {
    backgroundColor: Colors.primary + "20", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  demoCardBadgeText: { fontSize: 10, fontWeight: "800", color: Colors.primary, letterSpacing: 0.5 },
  demoCardSub: { fontSize: 12, color: Colors.textMuted, textAlign: "right", marginBottom: 14 },
  demoRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 10,
  },
  demoSeparator: { height: 1, backgroundColor: Colors.border, marginHorizontal: 0 },
  demoIconCircle: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  demoRowRight: { flex: 1, alignItems: "flex-end" },
  demoRowLabel: { fontSize: 14, fontWeight: "700" },
  demoRowSub: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },

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
});

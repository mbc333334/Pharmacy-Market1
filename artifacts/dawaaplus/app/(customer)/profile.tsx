import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
  Modal, TextInput, KeyboardAvoidingView, Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { LANGUAGES, COUNTRIES } from "@/data/locales";
import { LanguageSelector, CountrySelector } from "@/components/LocaleSelector";

function savePassword(userId: string, pass: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(`customer_pass_${userId}`, pass);
  }
}

const ORDERS = [
  { id: "ORD-2024-089", date: "28 مارس 2024", items: 3, total: 88.98, status: "مكتمل" as const },
  { id: "ORD-2024-075", date: "20 مارس 2024", items: 1, total: 45.00, status: "مكتمل" as const },
  { id: "ORD-2024-061", date: "10 مارس 2024", items: 2, total: 56.50, status: "مكتمل" as const },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, country, setLanguage, setCountry } = useSettings();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [showLanguage, setShowLanguage] = useState(false);
  const [showCountry, setShowCountry] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [pf, setPf] = useState({ newPass: "", confirmPass: "" });
  const [pErr, setPErr] = useState("");
  const [pSaved, setPSaved] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passModalStep, setPassModalStep] = useState<"form"|"otp"|"done">("form");
  const [passOtpCode, setPassOtpCode] = useState(""); const [passOtpInput, setPassOtpInput] = useState(""); const [passOtpErr, setPassOtpErr] = useState("");
  const [passOtpTimer, setPassOtpTimer] = useState(0);
  const passTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  React.useEffect(()=>{ if(passOtpTimer<=0){ if(passTimerRef.current) clearInterval(passTimerRef.current); return; } passTimerRef.current=setInterval(()=>setPassOtpTimer(v=>v-1),1000); return()=>{ if(passTimerRef.current) clearInterval(passTimerRef.current); }; },[passOtpTimer]);
  function genPassOTP(){ return String(Math.floor(100000+Math.random()*900000)); }

  const openPassModal = () => { setPf({ newPass: "", confirmPass: "" }); setPErr(""); setPSaved(false); setPassModalStep("form"); setPassOtpInput(""); setPassOtpErr(""); setShowPassModal(true); };
  const closePassModal = () => setShowPassModal(false);
  const sendPassOtp = () => {
    if (!pf.newPass.trim()) { setPErr("أدخل كلمة المرور الجديدة"); return; }
    if (pf.newPass.length < 4) { setPErr("يجب أن تكون 4 أحرف على الأقل"); return; }
    if (pf.newPass !== pf.confirmPass) { setPErr("كلمتا المرور غير متطابقتين"); return; }
    const code = genPassOTP(); setPassOtpCode(code); setPassOtpInput(""); setPassOtpErr(""); setPassModalStep("otp"); setPassOtpTimer(60);
  };
  const verifyPassOtp = () => {
    if (passOtpInput !== passOtpCode) { setPassOtpErr("رمز التحقق غير صحيح، حاول مجدداً"); return; }
    if (user?.id) savePassword(user.id, pf.newPass.trim());
    setPassModalStep("done");
    setTimeout(() => { closePassModal(); setPassModalStep("form"); }, 1800);
  };
  const resendPassOtp = () => { const code=genPassOTP(); setPassOtpCode(code); setPassOtpInput(""); setPassOtpErr(""); setPassOtpTimer(60); };
  const submitPass = sendPassOtp;

  const initials = user?.name?.split(" ").slice(0, 2).map(n => n[0]).join("") ?? "م";

  // ── Guest View ──────────────────────────────────────────────
  if (!user) {
    return (
      <ScrollView
        style={[styles.container, { paddingTop: topInset }]}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.guestHero}>
          <View style={styles.guestAvatarWrap}>
            <View style={styles.guestAvatar}>
              <Ionicons name="person-outline" size={44} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.guestTitle}>مرحباً بك في دواء+</Text>
          <Text style={styles.guestSub}>
            سجّل دخولك أو أنشئ حساباً مجانياً لتتمتع بتجربة شراء كاملة وتتبع طلباتك
          </Text>
          <View style={styles.guestBtnGroup}>
            <TouchableOpacity
              style={styles.guestLoginBtn}
              onPress={() => router.push("/(auth)/login")}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.guestLoginBtnText}>تسجيل الدخول</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.guestRegisterBtn}
              onPress={() => router.push("/(auth)/register")}
            >
              <Ionicons name="person-add-outline" size={20} color={Colors.primary} />
              <Text style={styles.guestRegisterBtnText}>إنشاء حساب مجاني</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.guestPerksCard}>
          <Text style={styles.guestPerksTitle}>مزايا التسجيل</Text>
          {[
            { icon: "cube-outline", text: "تتبع طلباتك في الوقت الفعلي", color: Colors.primary },
            { icon: "heart-outline", text: "حفظ قائمة أدويتك المفضلة", color: Colors.error },
            { icon: "location-outline", text: "إدارة عناوين التوصيل بسهولة", color: "#3182CE" },
            { icon: "notifications-outline", text: "إشعارات عند وصول طلبك", color: "#D69E2E" },
            { icon: "pricetag-outline", text: "عروض وخصومات حصرية للأعضاء", color: "#0D7A54" },
          ].map(perk => (
            <View key={perk.text} style={styles.guestPerkRow}>
              <Text style={styles.guestPerkText}>{perk.text}</Text>
              <View style={[styles.guestPerkIcon, { backgroundColor: perk.color + "18" }]}>
                <Ionicons name={perk.icon as any} size={18} color={perk.color} />
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>اللغة والمنطقة</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.localeRow} onPress={() => setShowLanguage(true)}>
              <Ionicons name="chevron-back" size={16} color={Colors.textMuted} />
              <View style={styles.localeRight}>
                <Text style={styles.localeValue}>{language.flag} {language.nativeName}</Text>
                <Text style={styles.localeLabel}>اللغة</Text>
              </View>
              <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="language-outline" size={18} color={Colors.primary} />
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.localeRow} onPress={() => setShowCountry(true)}>
              <Ionicons name="chevron-back" size={16} color={Colors.textMuted} />
              <View style={styles.localeRight}>
                <Text style={styles.localeValue}>{country.flag} {country.nameAr}</Text>
                <Text style={styles.localeLabel}>البلد ({country.dialCode})</Text>
              </View>
              <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="globe-outline" size={18} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <LanguageSelector
          visible={showLanguage}
          onClose={() => setShowLanguage(false)}
          data={LANGUAGES}
          selected={language}
          onSelect={setLanguage}
        />
        <CountrySelector
          visible={showCountry}
          onClose={() => setShowCountry(false)}
          data={COUNTRIES}
          selected={country}
          onSelect={setCountry}
        />
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { paddingTop: topInset }]}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
            <Text style={styles.editBtnText}>تعديل</Text>
          </TouchableOpacity>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profilePhone}>{user?.phone}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="cube-outline" value="24" label="طلباتي" color="#3182CE" />
          <StatCard icon="document-text-outline" value="8" label="وصفاتي" color="#805AD5" />
          <StatCard icon="location-outline" value="3" label="عناويني" color={Colors.primary} />
        </View>

        {/* Last Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آخر الطلبات</Text>
          <View style={styles.card}>
            {ORDERS.map((order, idx) => (
              <React.Fragment key={order.id}>
                <TouchableOpacity style={styles.orderRow}>
                  <View style={[styles.orderStatus, { backgroundColor: Colors.successLight }]}>
                    <Text style={[styles.orderStatusText, { color: Colors.success }]}>{order.status}</Text>
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderTotal}>{order.total.toFixed(2)} د.ع</Text>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderDate}>{order.date} • {order.items} منتجات</Text>
                  </View>
                  <View style={[styles.orderIcon, { backgroundColor: Colors.primaryLight }]}>
                    <Ionicons name="cube-outline" size={20} color={Colors.primary} />
                  </View>
                </TouchableOpacity>
                {idx < ORDERS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Language & Country */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اللغة والمنطقة</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.localeRow} onPress={() => setShowLanguage(true)}>
              <Ionicons name="chevron-back" size={16} color={Colors.textMuted} />
              <View style={styles.localeRight}>
                <Text style={styles.localeValue}>{language.flag} {language.nativeName}</Text>
                <Text style={styles.localeLabel}>اللغة</Text>
              </View>
              <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="language-outline" size={18} color={Colors.primary} />
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.localeRow} onPress={() => setShowCountry(true)}>
              <Ionicons name="chevron-back" size={16} color={Colors.textMuted} />
              <View style={styles.localeRight}>
                <Text style={styles.localeValue}>{country.flag} {country.nameAr}</Text>
                <Text style={styles.localeLabel}>البلد ({country.dialCode})</Text>
              </View>
              <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="globe-outline" size={18} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <MenuSection title="حسابي" items={[
          { icon: "location-outline", label: "عناوين التوصيل" },
          { icon: "card-outline", label: "طرق الدفع" },
          { icon: "heart-outline", label: "المفضلة" },
        ]} />

        <MenuSection title="الإعدادات" items={[
          { icon: "notifications-outline", label: "الإشعارات" },
        ]} />

        {/* Password Change */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.passChangeBtn} onPress={openPassModal} activeOpacity={0.8}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="key-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.passChangeBtnTitle}>تغيير كلمة المرور</Text>
              <Text style={styles.passChangeBtnSub}>تحديث كلمة المرور لحسابك</Text>
            </View>
            <Ionicons name="chevron-back" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <MenuSection title="المساعدة" items={[
          { icon: "chatbubble-outline", label: "تواصل معنا" },
          { icon: "star-outline", label: "قيّم التطبيق" },
          { icon: "document-text-outline", label: "الشروط والأحكام" },
        ]} />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </ScrollView>

      <LanguageSelector
        visible={showLanguage}
        onClose={() => setShowLanguage(false)}
        data={LANGUAGES}
        selected={language}
        onSelect={setLanguage}
      />
      <CountrySelector
        visible={showCountry}
        onClose={() => setShowCountry(false)}
        data={COUNTRIES}
        selected={country}
        onSelect={setCountry}
      />

      {/* Password Change Modal */}
      <Modal visible={showPassModal} transparent animationType="slide" onRequestClose={closePassModal}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={closePassModal}>
            <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight, width: 44, height: 44, borderRadius: 14 }]}>
                  <Ionicons name="key-outline" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.modalTitle}>تغيير كلمة المرور</Text>
                  <Text style={styles.modalSub}>{user?.name}</Text>
                </View>
                <TouchableOpacity onPress={closePassModal}>
                  <Ionicons name="close-circle" size={26} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {passModalStep === "done" ? (
                <View style={styles.savedBox}>
                  <Ionicons name="checkmark-circle" size={40} color={Colors.success} />
                  <Text style={styles.savedText}>تم تغيير كلمة المرور بنجاح!</Text>
                </View>
              ) : passModalStep === "otp" ? (
                <>
                  <View style={styles.otpNoticeBox}>
                    <Text style={styles.otpNoticeLbl}>📱 رمز التحقق التجريبي</Text>
                    <Text style={styles.otpCodeDisplay}>{passOtpCode}</Text>
                    <Text style={styles.otpNoticeHnt}>سيُرسَل عبر SMS في التطبيق الفعلي</Text>
                  </View>
                  <Text style={styles.inputLabel}>أدخل رمز التحقق المكوّن من 6 أرقام</Text>
                  <TextInput
                    value={passOtpInput}
                    onChangeText={t => { setPassOtpErr(""); setPassOtpInput(t.replace(/\D/g, "").slice(0, 6)); }}
                    placeholder="• • • • • •"
                    placeholderTextColor={Colors.textMuted}
                    style={[styles.input, { textAlign: "center", fontSize: 22, letterSpacing: 10, fontWeight: "800", marginTop: 8, borderColor: passOtpErr ? Colors.error : Colors.primary }]}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  {passOtpErr !== "" && <Text style={styles.errText}>⚠️ {passOtpErr}</Text>}
                  <View style={{ alignItems: "flex-end", marginVertical: 10 }}>
                    {passOtpTimer > 0 ? (
                      <Text style={styles.timerTxt}>⏱ إعادة الإرسال بعد {passOtpTimer}ث</Text>
                    ) : (
                      <TouchableOpacity onPress={resendPassOtp}>
                        <Text style={styles.resendLnk}>إعادة إرسال الرمز</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.submitBtn, passOtpInput.length < 6 && { opacity: 0.4 }]}
                    onPress={verifyPassOtp}
                    disabled={passOtpInput.length < 6}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                    <Text style={styles.submitBtnText}>تحقق وتغيير كلمة المرور</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ alignItems:"center", marginTop:12, flexDirection:"row", justifyContent:"center", gap:6 }} onPress={()=>setPassModalStep("form")}>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                    <Text style={{ fontSize:13, color:Colors.textMuted }}>العودة لتعديل كلمة المرور</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>كلمة المرور الجديدة</Text>
                    <View style={styles.inputRow}>
                      <TouchableOpacity onPress={() => setShowNewPass(v => !v)} style={styles.eyeBtn}>
                        <Ionicons name={showNewPass ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textMuted} />
                      </TouchableOpacity>
                      <TextInput
                        value={pf.newPass}
                        onChangeText={t => setPf(p => ({ ...p, newPass: t }))}
                        secureTextEntry={!showNewPass}
                        placeholder="••••••••"
                        placeholderTextColor={Colors.textMuted}
                        style={styles.input}
                        textAlign="right"
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>تأكيد كلمة المرور</Text>
                    <TextInput
                      value={pf.confirmPass}
                      onChangeText={t => { setPErr(""); setPf(p => ({ ...p, confirmPass: t })); }}
                      secureTextEntry
                      placeholder="••••••••"
                      placeholderTextColor={Colors.textMuted}
                      style={[styles.input, pf.confirmPass && pf.confirmPass !== pf.newPass && { borderColor: Colors.error }]}
                      textAlign="right"
                    />
                    {pf.confirmPass !== "" && pf.confirmPass !== pf.newPass && (
                      <Text style={styles.mismatchText}>⚠️ كلمتا المرور غير متطابقتين</Text>
                    )}
                  </View>
                  {pErr !== "" && <Text style={styles.errText}>{pErr}</Text>}
                  <TouchableOpacity
                    style={[styles.submitBtn, (!pf.newPass || pf.newPass !== pf.confirmPass) && { opacity: 0.4 }]}
                    onPress={submitPass}
                    disabled={!pf.newPass || pf.newPass !== pf.confirmPass}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="send-outline" size={18} color="#fff" />
                    <Text style={styles.submitBtnText}>📲 إرسال رمز التحقق (OTP)</Text>
                  </TouchableOpacity>
                </>
              )}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function StatCard({ icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuSection({ title, items }: { title: string; items: { icon: any; label: string }[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {items.map((item, idx) => (
          <React.Fragment key={item.label}>
            <TouchableOpacity style={styles.menuRow}>
              <Ionicons name="chevron-back" size={16} color={Colors.textMuted} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name={item.icon} size={18} color={Colors.primary} />
              </View>
            </TouchableOpacity>
            {idx < items.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileHeader: {
    alignItems: "center", padding: 24,
    backgroundColor: Colors.surface, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start", marginBottom: 16,
    backgroundColor: Colors.primaryLight, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  editBtnText: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  avatarWrap: { marginBottom: 12, position: "relative" },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#fff" },
  avatarBadge: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: Colors.surface, borderRadius: 10,
  },
  profileName: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary, marginBottom: 4 },
  profilePhone: { fontSize: 14, color: Colors.textMuted },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14,
    padding: 14, alignItems: "center", gap: 4, borderTopWidth: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  statValue: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textMuted },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 10 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  orderRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  orderIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  orderInfo: { flex: 1 },
  orderId: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  orderDate: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  orderTotal: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  orderStatus: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  orderStatusText: { fontSize: 11, fontWeight: "600" },
  localeRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  localeRight: { flex: 1, alignItems: "flex-end" },
  localeLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  localeValue: { fontSize: 15, fontWeight: "600", color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
  menuRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  menuIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary, textAlign: "right", fontWeight: "500" },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginHorizontal: 16, marginBottom: 24, gap: 8,
    backgroundColor: Colors.errorLight, borderRadius: 14, padding: 16,
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: Colors.error },
  guestHero: {
    backgroundColor: Colors.surface, padding: 28, alignItems: "center", gap: 12,
    marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  guestAvatarWrap: { marginBottom: 4 },
  guestAvatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.primary + "30",
  },
  guestTitle: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, textAlign: "center" },
  guestSub: { fontSize: 14, color: Colors.textMuted, textAlign: "center", lineHeight: 22, paddingHorizontal: 8 },
  guestBtnGroup: { width: "100%", gap: 10, marginTop: 4 },
  guestLoginBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  guestLoginBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  guestRegisterBtn: {
    borderWidth: 2, borderColor: Colors.primary, borderRadius: 14, paddingVertical: 13,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  guestRegisterBtnText: { fontSize: 15, fontWeight: "700", color: Colors.primary },
  guestPerksCard: {
    backgroundColor: Colors.surface, marginHorizontal: 16, borderRadius: 18,
    padding: 20, gap: 4, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  guestPerksTitle: {
    fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 10,
  },
  guestPerkRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  guestPerkIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  guestPerkText: { flex: 1, fontSize: 14, color: Colors.textSecondary, textAlign: "right", fontWeight: "500" },
  passChangeBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface,
    marginHorizontal: 16, borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  passChangeBtnTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  passChangeBtnSub: { fontSize: 12, color: Colors.textMuted, textAlign: "right", marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 20,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: "center", marginBottom: 20 },
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: Colors.textPrimary, textAlign: "right" },
  modalSub: { fontSize: 12, color: Colors.textMuted, textAlign: "right", marginTop: 2 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: "700", color: Colors.textMuted, textAlign: "right", marginBottom: 6 },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    padding: 12, fontSize: 15, color: Colors.textPrimary, textAlign: "right",
    backgroundColor: Colors.background,
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 4 },
  savedBox: { alignItems: "center", paddingVertical: 30, gap: 12 },
  savedText: { fontSize: 16, fontWeight: "800", color: Colors.success },
  errText: { fontSize: 12, color: Colors.error, textAlign: "right", marginBottom: 10, fontWeight: "600" },
  mismatchText: { fontSize: 11, color: Colors.error, textAlign: "right", marginTop: 4, fontWeight: "600" },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, padding: 15, marginTop: 6,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  submitBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  otpNoticeBox: { backgroundColor:"#FFFBEB", borderWidth:1.5, borderColor:"#F6AD55", borderRadius:14, padding:16, alignItems:"center", marginBottom:14 },
  otpNoticeLbl: { fontSize:12, fontWeight:"700", color:"#744210", marginBottom:6 },
  otpCodeDisplay: { fontSize:30, fontWeight:"900", letterSpacing:8, color:"#744210", marginBottom:4 },
  otpNoticeHnt: { fontSize:11, color:"#92400E", textAlign:"center" },
  timerTxt: { fontSize:12, color:Colors.textMuted },
  resendLnk: { fontSize:13, fontWeight:"700", color:Colors.primary, textDecorationLine:"underline" },
});

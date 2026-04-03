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

export default function WarehouseRegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { registerWarehouse } = useAuth();
  const { t } = useTranslation();

  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!ownerName || !phone || !warehouseName || !licenseNumber || !city || !address || !password || !confirmPass) {
      setError(t("enterAllFields"));
      return;
    }
    if (password !== confirmPass) {
      setError(t("passwordMismatch"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      await registerWarehouse({ ownerName, phone, warehouseName, licenseNumber, city, address, password });
    } catch {
      setError("حدث خطأ، يرجى المحاولة مرة أخرى");
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
          <Ionicons name="cube" size={24} color="#0D7A54" />
          <Text style={styles.logoText}>{t("warehouse")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Ionicons name="cube" size={32} color="#0D7A54" />
          <Text style={styles.title}>{t("registerWarehouse")}</Text>
        </View>
        <Text style={styles.subtitle}>
          {t("linkedPharmacies")} — المخازن مرتبطة بالصيدليات الشريكة فقط
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.sectionLabel}>
          <Ionicons name="person-outline" size={16} color="#0D7A54" />
          <Text style={styles.sectionLabelText}>معلومات المالك</Text>
        </View>

        <Field label={t("ownerName")} value={ownerName} onChangeText={setOwnerName} icon="person-outline" placeholder="الاسم الكامل للمالك" />
        <Field label={t("phone")} value={phone} onChangeText={setPhone} icon="call-outline" placeholder="+964 7XX XXX XXXX" keyboard="phone-pad" />

        <View style={styles.sectionLabel}>
          <Ionicons name="cube-outline" size={16} color="#0D7A54" />
          <Text style={styles.sectionLabelText}>معلومات المذخر</Text>
        </View>

        <Field label={t("warehouseName")} value={warehouseName} onChangeText={setWarehouseName} icon="cube-outline" placeholder="اسم المذخر الرسمي" />
        <Field label={t("licenseNumber")} value={licenseNumber} onChangeText={setLicenseNumber} icon="document-text-outline" placeholder="WH-XXXX-XXXX" />
        <Field label={t("city")} value={city} onChangeText={setCity} icon="location-outline" placeholder="المدينة (هەولێر، سلێمانی...)" />
        <Field label={t("address")} value={address} onChangeText={setAddress} icon="map-outline" placeholder="العنوان التفصيلي" />

        <View style={styles.sectionLabel}>
          <Ionicons name="lock-closed-outline" size={16} color="#0D7A54" />
          <Text style={styles.sectionLabelText}>كلمة المرور</Text>
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
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("confirmPassword")}</Text>
          <View style={styles.inputWrap}>
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.inputIcon}>
              <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry={!showPass}
              textAlign="right"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={18} color="#0D7A54" />
          <Text style={styles.noticeText}>
            المخازن المسجلة مرتبطة فقط بالصيدليات المشاركة في المنصة. سيتم مراجعة طلبك وإرسال تأكيد خلال 24 ساعة.
          </Text>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>{t("registerWarehouse")}</Text>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChangeText, icon, placeholder, keyboard }: {
  label: string; value: string; onChangeText: (v: string) => void;
  icon: any; placeholder: string; keyboard?: any;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          textAlign="right"
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboard}
        />
        <Ionicons name={icon} size={20} color={Colors.textMuted} style={styles.inputIcon} />
      </View>
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
  logoText: { fontSize: 18, fontWeight: "800", color: "#0D7A54" },
  content: { padding: 24, paddingBottom: 40 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6, justifyContent: "flex-end" },
  title: { fontSize: 24, fontWeight: "800", color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: "right", marginBottom: 20 },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.errorLight, borderRadius: 10, padding: 12, marginBottom: 16, justifyContent: "flex-end",
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1, textAlign: "right" },
  sectionLabel: {
    flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "flex-end",
    marginTop: 16, marginBottom: 8,
  },
  sectionLabelText: { fontSize: 14, fontWeight: "700", color: "#0D7A54" },
  fieldGroup: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary, textAlign: "right", marginBottom: 6 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 14, color: Colors.textPrimary },
  inputIcon: { paddingHorizontal: 4 },
  noticeBox: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: "#E8F5E9", borderRadius: 12, padding: 14, marginBottom: 20,
  },
  noticeText: { flex: 1, fontSize: 12, color: "#0D7A54", textAlign: "right", lineHeight: 18 },
  submitBtn: {
    backgroundColor: "#0D7A54", borderRadius: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});

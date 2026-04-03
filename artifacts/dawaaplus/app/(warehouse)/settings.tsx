import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Switch, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "@/i18n";
import { LANGUAGES } from "@/data/locales";

export default function WarehouseSettings() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useSettings();
  const { t } = useTranslation();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [notifications, setNotifications] = useState(true);
  const [autoOrders, setAutoOrders] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);

  const wh = user?.warehouse;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("warehouseSettings")}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{wh?.warehouseName?.[0] ?? "ك"}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{wh?.warehouseName}</Text>
            <Text style={styles.profileSub}>{user?.name}</Text>
            <View style={styles.warehouseBadge}>
              <Ionicons name="cube" size={12} color="#0D7A54" />
              <Text style={styles.warehouseBadgeText}>{t("warehouse")}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={18} color="#0D7A54" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("warehouseSettings")}</Text>
          <View style={styles.card}>
            <InfoRow icon="business-outline" label={t("warehouseName")} value={wh?.warehouseName ?? "-"} />
            <View style={styles.divider} />
            <InfoRow icon="location-outline" label={t("city")} value={wh?.city ?? "-"} />
            <View style={styles.divider} />
            <InfoRow icon="map-outline" label={t("address")} value={wh?.address ?? "-"} />
            <View style={styles.divider} />
            <InfoRow icon="document-text-outline" label={t("licenseNumber")} value={wh?.licenseNumber ?? "-"} />
            <View style={styles.divider} />
            <InfoRow icon="call-outline" label={t("phone")} value={user?.phone ?? "-"} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("language")}</Text>
          <TouchableOpacity style={styles.card} onPress={() => setShowLangModal(true)}>
            <View style={styles.langRow}>
              <Ionicons name="chevron-back" size={18} color={Colors.textMuted} />
              <View style={styles.langInfo}>
                <Text style={styles.langName}>{language.nativeName}</Text>
                <Text style={styles.langCode}>{language.name}</Text>
              </View>
              <Text style={styles.langFlag}>{language.flag}</Text>
              <Ionicons name="language-outline" size={22} color="#0D7A54" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإشعارات</Text>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: "#0D7A54" }} />
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>إشعارات الطلبات</Text>
                <Text style={styles.switchSub}>تنبيهات فورية عند وصول طلب جديد</Text>
              </View>
              <Ionicons name="notifications-outline" size={22} color="#0D7A54" />
            </View>
            <View style={styles.divider} />
            <View style={styles.switchRow}>
              <Switch value={autoOrders} onValueChange={setAutoOrders} trackColor={{ true: "#0D7A54" }} />
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>قبول تلقائي للطلبات</Text>
                <Text style={styles.switchSub}>قبول الطلبات الصغيرة تلقائياً</Text>
              </View>
              <Ionicons name="flash-outline" size={22} color="#0D7A54" />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>{t("logout")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
                {language.code === lang.code && <Ionicons name="checkmark" size={18} color="#0D7A54" />}
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

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoValue}>{value}</Text>
      <View style={styles.infoLabel}>
        <Text style={styles.infoLabelText}>{label}</Text>
      </View>
      <Ionicons name={icon} size={20} color="#0D7A54" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: "#0D7A54", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  profileCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surface, margin: 16, borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "#0D7A54", alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 26, fontWeight: "800", color: "#fff" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  profileSub: { fontSize: 13, color: Colors.textSecondary, textAlign: "right" },
  warehouseBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#E8F5E9", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: "flex-end", marginTop: 4,
  },
  warehouseBadgeText: { fontSize: 11, fontWeight: "700", color: "#0D7A54" },
  editBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#E8F5E9", alignItems: "center", justifyContent: "center",
  },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: Colors.textMuted, marginBottom: 8, textAlign: "right" },
  card: {
    backgroundColor: Colors.surface, borderRadius: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  infoRow: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
  },
  infoValue: { flex: 1, fontSize: 14, color: Colors.textPrimary, textAlign: "right" },
  infoLabel: { alignItems: "flex-end" },
  infoLabelText: { fontSize: 11, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
  langRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  langInfo: { flex: 1 },
  langName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  langCode: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  langFlag: { fontSize: 24 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  switchInfo: { flex: 1 },
  switchLabel: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  switchSub: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.errorLight, borderRadius: 14, paddingVertical: 14,
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: Colors.error },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary, textAlign: "center", marginBottom: 8 },
  langOption: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    borderRadius: 12, backgroundColor: Colors.surfaceAlt,
  },
  langOptionActive: { backgroundColor: "#E8F5E9", borderWidth: 1.5, borderColor: "#0D7A54" },
  langOptionInfo: { flex: 1 },
  langOptionName: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  langOptionSub: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  langOptionFlag: { fontSize: 28 },
  modalClose: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8,
  },
  modalCloseText: { fontSize: 15, fontWeight: "700", color: Colors.textMuted },
});

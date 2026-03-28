import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function PharmacySettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const pharmacy = user?.pharmacy;
  const initials = pharmacy?.pharmacyName?.[0] ?? "ص";

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topInset }]}
      contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* Pharmacy Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
          <Text style={styles.editBtnText}>تعديل</Text>
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.pharmacyName}>{pharmacy?.pharmacyName}</Text>
        <Text style={styles.pharmacyCity}>{pharmacy?.city} • ترخيص: {pharmacy?.licenseNumber}</Text>
        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
          <Text style={styles.verifiedText}>صيدلية موثّقة</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <StatBox label="المبيعات الشهرية" value="4,820 ر.س" icon="trending-up" color={Colors.primary} />
        <StatBox label="معدل التقييم" value="4.8 / 5" icon="star" color="#D69E2E" />
      </View>

      <MenuSection title="الصيدلية" items={[
        { icon: "storefront-outline", label: "معلومات الصيدلية" },
        { icon: "time-outline", label: "ساعات العمل" },
        { icon: "location-outline", label: "العنوان والخريطة" },
        { icon: "images-outline", label: "صور الصيدلية" },
      ]} />

      <MenuSection title="الحساب والمدفوعات" items={[
        { icon: "card-outline", label: "بيانات الحساب البنكي" },
        { icon: "receipt-outline", label: "سجل المدفوعات" },
        { icon: "document-text-outline", label: "الفواتير والتقارير" },
      ]} />

      <MenuSection title="الإشعارات" items={[
        { icon: "notifications-outline", label: "إشعارات الطلبات الجديدة" },
        { icon: "alert-circle-outline", label: "تنبيهات المخزون" },
        { icon: "megaphone-outline", label: "العروض والإعلانات" },
      ]} />

      <MenuSection title="الدعم والمساعدة" items={[
        { icon: "chatbubble-outline", label: "تواصل مع الدعم" },
        { icon: "book-outline", label: "دليل البائع" },
        { icon: "star-outline", label: "قيّم تجربتك" },
        { icon: "shield-outline", label: "الشروط وسياسة الخصوصية" },
      ]} />

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
      </TouchableOpacity>

      <Text style={styles.version}>دواء+ • الإصدار 1.0.0</Text>
    </ScrollView>
  );
}

function StatBox({ label, value, icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <View style={[styles.statBox, { borderTopColor: color }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
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
    alignItems: "center", padding: 24, paddingTop: 16,
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
  avatar: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: "800", color: "#fff" },
  pharmacyName: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, marginBottom: 4 },
  pharmacyCity: { fontSize: 13, color: Colors.textMuted, marginBottom: 10 },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.primaryLight, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  verifiedText: { fontSize: 12, color: Colors.primary, fontWeight: "700" },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  statBox: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14,
    padding: 14, alignItems: "center", gap: 4, borderTopWidth: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  statValue: { fontSize: 16, fontWeight: "800" },
  statLabel: { fontSize: 11, color: Colors.textMuted, textAlign: "center" },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 10 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  menuRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  menuIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary, textAlign: "right", fontWeight: "500" },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginHorizontal: 16, marginBottom: 12, gap: 8,
    backgroundColor: Colors.errorLight, borderRadius: 14, padding: 16,
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: Colors.error },
  version: { fontSize: 12, color: Colors.textMuted, textAlign: "center", paddingBottom: 8 },
});

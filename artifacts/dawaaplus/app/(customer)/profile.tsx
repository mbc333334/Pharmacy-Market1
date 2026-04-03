import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { LANGUAGES, COUNTRIES } from "@/data/locales";
import { LanguageSelector, CountrySelector } from "@/components/LocaleSelector";

const ORDERS = [
  { id: "ORD-2024-089", date: "28 مارس 2024", items: 3, total: 88.98, status: "مكتمل" as const },
  { id: "ORD-2024-075", date: "20 مارس 2024", items: 1, total: 45.00, status: "مكتمل" as const },
  { id: "ORD-2024-061", date: "10 مارس 2024", items: 2, total: 56.50, status: "مكتمل" as const },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { language, country, setLanguage, setCountry } = useSettings();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [showLanguage, setShowLanguage] = useState(false);
  const [showCountry, setShowCountry] = useState(false);

  const initials = user?.name?.split(" ").slice(0, 2).map(n => n[0]).join("") ?? "م";

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
          { icon: "lock-closed-outline", label: "الأمان والخصوصية" },
        ]} />

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
});

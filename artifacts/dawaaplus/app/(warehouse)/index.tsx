import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n";
import { router } from "expo-router";
import LanguageButton from "@/components/LanguageButton";
import DashboardStatCard from "@/components/DashboardStatCard";

const SAMPLE_LINKED = [
  { id: "1", name: "دەرمانخانەی شیفا", city: "هەولێر", orders: 12, status: "active" },
  { id: "2", name: "دەرمانخانەی ئارام", city: "سلێمانی", orders: 8, status: "active" },
  { id: "3", name: "دەرمانخانەی نوێ", city: "دهۆک", orders: 5, status: "active" },
];

const SAMPLE_ORDERS = [
  { id: "WO-001", pharmacy: "دەرمانخانەی شیفا", items: 15, total: 850000, status: "new", time: new Date(Date.now() - 3600000).toISOString() },
  { id: "WO-002", pharmacy: "دەرمانخانەی ئارام", items: 8, total: 420000, status: "processing", time: new Date(Date.now() - 7200000).toISOString() },
  { id: "WO-003", pharmacy: "دەرمانخانەی نوێ", items: 22, total: 1100000, status: "completed", time: new Date(Date.now() - 86400000).toISOString() },
];

export default function WarehouseDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useTranslation();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const wh = user?.warehouse;
  const initials = wh?.warehouseName?.[0] ?? "ك";
  const newOrders = SAMPLE_ORDERS.filter(o => o.status === "new").length;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topInset }]}
      contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {newOrders > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
          <LanguageButton iconColor="#fff" />
        </View>
        <View>
          <Text style={styles.headerGreeting}>{t("hello")}، {wh?.warehouseName} 👋</Text>
          <Text style={styles.headerSub}>{wh?.city} • {t("license")}: {wh?.licenseNumber}</Text>
        </View>
      </View>

      <View style={styles.warehouseBadge}>
        <Ionicons name="cube" size={14} color="#0D7A54" />
        <Text style={styles.warehouseBadgeText}>{t("warehouse")}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
        <StatCard icon="layers" value={String(wh?.totalProducts || 1250)} label={t("totalStock")} color="#0D7A54" />
        <StatCard icon="storefront" value={String(wh?.linkedPharmacies?.length || 3)} label={t("linkedPharmacies")} color={Colors.primary} />
        <StatCard icon="cube" value={String(SAMPLE_ORDERS.length)} label={t("warehouseOrders")} color="#3182CE" badge={newOrders > 0 ? newOrders : undefined} />
        <StatCard icon="star" value="4.9" label={t("rating")} color="#805AD5" />
      </ScrollView>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 {t("quickActions")}</Text>
        <View style={styles.actionsGrid}>
          <QuickAction icon="add-circle" label={t("addMedicine")} color="#0D7A54" onPress={() => {}} />
          <QuickAction icon="layers" label={t("manageInventory")} color="#3182CE" onPress={() => router.push("/(warehouse)/inventory")} />
          <QuickAction icon="cube" label={t("pendingOrders")} color="#DD6B20" badge={newOrders} onPress={() => router.push("/(warehouse)/orders")} />
          <QuickAction icon="storefront" label={t("linkedPharmacies")} color="#805AD5" onPress={() => router.push("/(warehouse)/pharmacies")} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => router.push("/(warehouse)/pharmacies")}>
            <Text style={styles.sectionMore}>{t("viewAll")}</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>🏪 {t("linkedPharmacies")}</Text>
        </View>
        <View style={styles.card}>
          {SAMPLE_LINKED.map((ph, idx) => (
            <React.Fragment key={ph.id}>
              <TouchableOpacity style={styles.pharmacyRow}>
                <View style={styles.pharmacyStatusDot} />
                <View style={styles.pharmacyInfo}>
                  <Text style={styles.pharmacyName}>{ph.name}</Text>
                  <Text style={styles.pharmacyCity}>{ph.city}</Text>
                </View>
                <View style={styles.pharmacyOrders}>
                  <Text style={styles.pharmacyOrderCount}>{ph.orders}</Text>
                  <Text style={styles.pharmacyOrderLabel}>{t("orders")}</Text>
                </View>
              </TouchableOpacity>
              {idx < SAMPLE_LINKED.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => router.push("/(warehouse)/orders")}>
            <Text style={styles.sectionMore}>{t("viewAll")}</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>📋 {t("recentOrders")}</Text>
        </View>
        <View style={styles.card}>
          {SAMPLE_ORDERS.map((order, idx) => (
            <React.Fragment key={order.id}>
              <TouchableOpacity style={styles.orderRow}>
                <StatusBadge status={order.status} t={t} />
                <View style={styles.orderInfo}>
                  <Text style={styles.orderPharmacy}>{order.pharmacy}</Text>
                  <Text style={styles.orderId}>{order.id} • {order.items} صنف</Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderTotal}>{(order.total / 1000).toFixed(0)}K د.ع</Text>
                  <Text style={styles.orderTime}>{formatTime(order.time)}</Text>
                </View>
              </TouchableOpacity>
              {idx < SAMPLE_ORDERS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const StatCard = DashboardStatCard;

function QuickAction({ icon, label, color, badge, onPress }: { icon: any; label: string; color: string; badge?: number; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.action, { backgroundColor: color + "15" }]} onPress={onPress}>
      {badge ? (
        <View style={styles.actionBadge}>
          <Text style={styles.actionBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name={icon} size={28} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatusBadge({ status, t }: { status: string; t: (k: any) => string }) {
  const map: Record<string, { bg: string; color: string; key: any }> = {
    new: { bg: "#FFF3E0", color: "#DD6B20", key: "new" },
    processing: { bg: "#EBF8FF", color: "#3182CE", key: "processing" },
    completed: { bg: Colors.successLight, color: Colors.success, key: "completed" },
    cancelled: { bg: Colors.errorLight, color: Colors.error, key: "cancelled" },
  };
  const s = map[status] ?? map.completed;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{t(s.key)}</Text>
    </View>
  );
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} دق`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} س`;
  return `${Math.floor(hrs / 24)} ي`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    backgroundColor: "#0D7A54", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
  },
  headerGreeting: { fontSize: 18, fontWeight: "800", color: "#fff", textAlign: "right" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", textAlign: "right", marginTop: 2 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: "#fff" },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center",
  },
  notifDot: {
    position: "absolute", top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.accent, borderWidth: 1.5, borderColor: "#0D7A54",
  },
  warehouseBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "center", marginTop: -12,
    backgroundColor: "#E8F5E9", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 2, borderColor: "#0D7A54",
  },
  warehouseBadgeText: { fontSize: 13, fontWeight: "700", color: "#0D7A54" },
  statsRow: { paddingHorizontal: 16, paddingVertical: 16, gap: 12, marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 10 },
  sectionMore: { fontSize: 13, color: "#0D7A54", fontWeight: "600" },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  action: { width: "47%", borderRadius: 16, padding: 16, alignItems: "center", gap: 8, position: "relative" },
  actionBadge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: Colors.error, borderRadius: 10,
    minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
  },
  actionBadgeText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  actionLabel: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  pharmacyRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  pharmacyStatusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#0D7A54" },
  pharmacyInfo: { flex: 1 },
  pharmacyName: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  pharmacyCity: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  pharmacyOrders: { alignItems: "center" },
  pharmacyOrderCount: { fontSize: 18, fontWeight: "800", color: "#0D7A54" },
  pharmacyOrderLabel: { fontSize: 10, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
  orderRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  orderRight: { alignItems: "flex-start" },
  orderInfo: { flex: 1 },
  orderPharmacy: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  orderId: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  orderTotal: { fontSize: 14, fontWeight: "700", color: "#0D7A54" },
  orderTime: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: "600" },
});

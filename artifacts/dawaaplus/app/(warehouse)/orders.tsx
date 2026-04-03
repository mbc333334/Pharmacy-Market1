import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useTranslation } from "@/i18n";

const ORDERS = [
  {
    id: "WO-001", pharmacy: "دەرمانخانەی شیفا", city: "هەولێر",
    items: [
      { name: "ئەسپرین 100mg", qty: 100, price: 2500 },
      { name: "باراسيتامول 500mg", qty: 200, price: 1500 },
    ],
    total: 550000, status: "new",
    time: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "WO-002", pharmacy: "دەرمانخانەی ئارام", city: "سلێمانی",
    items: [
      { name: "ئاموكسيسيلين 500mg", qty: 50, price: 8000 },
    ],
    total: 400000, status: "processing",
    time: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "WO-003", pharmacy: "دەرمانخانەی نوێ", city: "دهۆک",
    items: [
      { name: "ئۆميپرازول 20mg", qty: 80, price: 5000 },
      { name: "ئیبوبروفێن 400mg", qty: 120, price: 3000 },
    ],
    total: 760000, status: "completed",
    time: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "WO-004", pharmacy: "دەرمانخانەی شیفا", city: "هەولێر",
    items: [
      { name: "مێتفۆرمین 500mg", qty: 60, price: 4500 },
    ],
    total: 270000, status: "new",
    time: new Date(Date.now() - 1800000).toISOString(),
  },
];

type FilterType = "all" | "new" | "processing" | "completed";

export default function WarehouseOrders() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all" ? ORDERS : ORDERS.filter(o => o.status === filter);

  const tabs: { key: FilterType; label: string }[] = [
    { key: "all", label: t("viewAll") },
    { key: "new", label: t("new") },
    { key: "processing", label: t("processing") },
    { key: "completed", label: t("completed") },
  ];

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("warehouseOrders")}</Text>
        <Text style={styles.orderCount}>{ORDERS.filter(o => o.status === "new").length} {t("new")}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, filter === tab.key && styles.tabActive]}
            onPress={() => setFilter(tab.key)}
          >
            <Text style={[styles.tabText, filter === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        {filtered.map(order => (
          <TouchableOpacity key={order.id} style={styles.orderCard}>
            <View style={styles.orderTop}>
              <StatusBadge status={order.status} t={t} />
              <View style={styles.orderMeta}>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.orderPharmacy}>{order.pharmacy}</Text>
                <Text style={styles.orderCity}>{order.city} • {formatTime(order.time)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.orderItems}>
              {order.items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <Text style={styles.itemTotal}>{(item.qty * item.price).toLocaleString()} د.ع</Text>
                  <Text style={styles.itemName}>{item.name} × {item.qty}</Text>
                </View>
              ))}
            </View>
            <View style={styles.orderFooter}>
              {order.status === "new" && (
                <TouchableOpacity style={styles.acceptBtn}>
                  <Text style={styles.acceptBtnText}>✓ قبول الطلب</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.orderTotal}>{order.total.toLocaleString()} د.ع</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
  if (mins < 60) return `منذ ${mins} دق`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} س`;
  return `منذ ${Math.floor(hrs / 24)} ي`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#0D7A54", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  orderCount: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 4,
    fontSize: 13, fontWeight: "700", color: "#fff",
  },
  tabsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surfaceAlt },
  tabActive: { backgroundColor: "#0D7A54" },
  tabText: { fontSize: 13, fontWeight: "600", color: Colors.textMuted },
  tabTextActive: { color: "#fff" },
  orderCard: {
    backgroundColor: Colors.surface, marginHorizontal: 16, marginBottom: 12, borderRadius: 14,
    padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  orderTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  orderMeta: { flex: 1 },
  orderId: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  orderPharmacy: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  orderCity: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  orderItems: { gap: 4 },
  itemRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  itemName: { fontSize: 13, color: Colors.textSecondary, textAlign: "right" },
  itemTotal: { fontSize: 12, fontWeight: "600", color: Colors.textPrimary },
  orderFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  orderTotal: { fontSize: 16, fontWeight: "800", color: "#0D7A54" },
  acceptBtn: { backgroundColor: "#0D7A54", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  acceptBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: "600" },
});

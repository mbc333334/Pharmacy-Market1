import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { SAMPLE_ORDERS, PharmacyOrder } from "@/data/sampleData";

const TABS = [
  { key: "new", label: "جديد" },
  { key: "processing", label: "قيد التجهيز" },
  { key: "completed", label: "مكتمل" },
];

export default function PharmacyOrdersScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("new");
  const [orders, setOrders] = useState<PharmacyOrder[]>(SAMPLE_ORDERS);
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filtered = orders.filter(o => o.status === activeTab);

  const updateStatus = (orderId: string, status: PharmacyOrder["status"]) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الطلبات 📦</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => {
          const count = orders.filter(o => o.status === tab.key).length;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              {count > 0 && (
                <View style={[styles.tabBadge, activeTab === tab.key && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, activeTab === tab.key && { color: "#fff" }]}>{count}</Text>
                </View>
              )}
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onAccept={activeTab === "new" ? () => updateStatus(item.id, "processing") : undefined}
            onComplete={activeTab === "processing" ? () => updateStatus(item.id, "completed") : undefined}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>لا يوجد طلبات {TABS.find(t => t.key === activeTab)?.label}</Text>
          </View>
        )}
      />
    </View>
  );
}

function OrderCard({
  order, onAccept, onComplete,
}: {
  order: PharmacyOrder;
  onAccept?: () => void;
  onComplete?: () => void;
}) {
  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    new: { bg: Colors.accentLight, color: Colors.warning, label: "طلب جديد" },
    processing: { bg: "#EBF8FF", color: "#3182CE", label: "قيد التجهيز" },
    completed: { bg: Colors.successLight, color: Colors.success, label: "مكتمل" },
  };
  const sc = statusColors[order.status];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
        </View>
        <View>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.customerRow}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>{order.customerName[0]}</Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <Text style={styles.customerAddress} numberOfLines={1}>{order.address}</Text>
        </View>
      </View>

      <View style={styles.itemsSection}>
        {order.items.map(item => (
          <View key={item.medicineId} style={styles.itemRow}>
            <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)} ر.س</Text>
            <Text style={styles.itemName}>{item.name} × {item.quantity}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalValue}>{order.total.toFixed(2)} ر.س</Text>
          <Text style={styles.totalLabel}>الإجمالي</Text>
        </View>
      </View>

      {(onAccept || onComplete) && (
        <View style={styles.actions}>
          {onAccept && (
            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.acceptBtnText}>قبول الطلب</Text>
            </TouchableOpacity>
          )}
          {onComplete && (
            <TouchableOpacity style={styles.completeBtn} onPress={onComplete}>
              <Ionicons name="checkmark-done" size={18} color="#fff" />
              <Text style={styles.completeBtnText}>تم التسليم</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.cancelBtn}>
            <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  return `منذ ${Math.floor(hrs / 24)} يوم`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  tabs: {
    flexDirection: "row", backgroundColor: Colors.surface,
    paddingHorizontal: 16, paddingBottom: 0,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1, paddingVertical: 14, alignItems: "center", justifyContent: "center",
    borderBottomWidth: 2, borderBottomColor: "transparent", position: "relative",
    flexDirection: "row", gap: 6,
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: "600", color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },
  tabBadge: {
    backgroundColor: Colors.border, borderRadius: 10,
    minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
  },
  tabBadgeActive: { backgroundColor: Colors.primary },
  tabBadgeText: { fontSize: 10, fontWeight: "800", color: Colors.textMuted },
  list: { padding: 16, gap: 14, paddingBottom: 120 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 12, fontWeight: "700" },
  orderId: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  orderTime: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  customerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "flex-end",
    padding: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  customerInfo: { alignItems: "flex-end" },
  customerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center",
  },
  customerAvatarText: { fontSize: 16, fontWeight: "800", color: Colors.primary },
  customerName: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  customerAddress: { fontSize: 12, color: Colors.textMuted, maxWidth: 200 },
  itemsSection: { padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 6 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemName: { fontSize: 13, color: Colors.textSecondary, flex: 1, textAlign: "right" },
  itemPrice: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary },
  totalRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 6, paddingTop: 8,
  },
  totalLabel: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  totalValue: { fontSize: 16, fontWeight: "800", color: Colors.primary },
  actions: { flexDirection: "row", padding: 12, gap: 8 },
  acceptBtn: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  acceptBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  completeBtn: {
    flex: 1, backgroundColor: Colors.success, borderRadius: 12,
    paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  completeBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  cancelBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.errorLight, alignItems: "center", justifyContent: "center",
  },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: Colors.textMuted },
});

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { SAMPLE_ORDERS } from "@/data/sampleData";

export default function PharmacyDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const pharmacy = user?.pharmacy;
  const initials = pharmacy?.pharmacyName?.[0] ?? "ص";

  const newOrders = SAMPLE_ORDERS.filter(o => o.status === "new").length;
  const todayRevenue = SAMPLE_ORDERS.reduce((s, o) => s + o.total, 0);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topInset }]}
      contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {newOrders > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.headerGreeting}>مرحباً، {pharmacy?.pharmacyName} 👋</Text>
          <Text style={styles.headerSub}>{pharmacy?.city} • رخصة: {pharmacy?.licenseNumber}</Text>
        </View>
      </View>

      {/* Stats Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
        <StatCard icon="medkit" value={String(pharmacy?.totalMedicines || 247)} label="منتج نشط" color={Colors.primary} />
        <StatCard icon="cube" value={String(SAMPLE_ORDERS.length)} label="طلبات اليوم" color="#3182CE" badge={newOrders > 0 ? newOrders : undefined} />
        <StatCard icon="cash" value={`${todayRevenue.toFixed(0)} ر.س`} label="مبيعات الشهر" color="#D69E2E" />
        <StatCard icon="star" value="4.8" label="التقييم" color="#805AD5" />
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
        <View style={styles.actionsGrid}>
          <QuickAction icon="add-circle" label="إضافة دواء" color={Colors.primary} />
          <QuickAction icon="list" label="إدارة المخزون" color="#3182CE" />
          <QuickAction icon="cube" label="الطلبات المعلقة" color="#DD6B20" badge={newOrders} />
          <QuickAction icon="bar-chart" label="تقرير المبيعات" color="#805AD5" />
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity>
            <Text style={styles.sectionMore}>عرض الكل</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>آخر الطلبات</Text>
        </View>
        <View style={styles.card}>
          {SAMPLE_ORDERS.map((order, idx) => (
            <React.Fragment key={order.id}>
              <TouchableOpacity style={styles.orderRow}>
                <View style={styles.orderStatus}>
                  <StatusBadge status={order.status} />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderName}>{order.customerName}</Text>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderItems} numberOfLines={1}>
                    {order.items.map(i => i.name).join("، ")}
                  </Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderTotal}>{order.total.toFixed(2)} ر.س</Text>
                  <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
                </View>
              </TouchableOpacity>
              {idx < SAMPLE_ORDERS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Low Stock Alert */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ تنبيهات المخزون</Text>
        <View style={styles.card}>
          <AlertRow name="أسبرين 100mg" stock={3} critical />
          <View style={styles.divider} />
          <AlertRow name="أموكسيسيلين 500mg" stock={8} />
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, value, label, color, badge }: { icon: any; value: string; label: string; color: string; badge?: number }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      {badge ? (
        <View style={[styles.statBadge, { backgroundColor: Colors.error }]}>
          <Text style={styles.statBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, badge }: { icon: any; label: string; color: string; badge?: number }) {
  return (
    <TouchableOpacity style={[styles.action, { backgroundColor: color + "15" }]}>
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    new: { bg: Colors.accentLight, color: Colors.warning, label: "جديد" },
    processing: { bg: "#EBF8FF", color: "#3182CE", label: "قيد التجهيز" },
    completed: { bg: Colors.successLight, color: Colors.success, label: "مكتمل" },
    cancelled: { bg: Colors.errorLight, color: Colors.error, label: "ملغي" },
  };
  const s = map[status] ?? map.completed;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

function AlertRow({ name, stock, critical }: { name: string; stock: number; critical?: boolean }) {
  return (
    <View style={styles.alertRow}>
      <View style={[styles.alertBadge, { backgroundColor: critical ? Colors.errorLight : Colors.warningLight }]}>
        <Text style={[styles.alertBadgeText, { color: critical ? Colors.error : Colors.warning }]}>
          {stock} متبقي
        </Text>
      </View>
      <View style={styles.alertInfo}>
        <Text style={styles.alertName}>{name}</Text>
        <Text style={[styles.alertWarn, { color: critical ? Colors.error : Colors.warning }]}>
          {critical ? "مخزون منخفض جداً ⚠️" : "مخزون منخفض"}
        </Text>
      </View>
      <Ionicons name="warning-outline" size={22} color={critical ? Colors.error : Colors.warning} />
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
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    backgroundColor: Colors.primary, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
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
    backgroundColor: Colors.accent, borderWidth: 1.5, borderColor: Colors.primary,
  },
  statsRow: {
    paddingHorizontal: 16, paddingVertical: 16, gap: 12,
    marginTop: -8,
  },
  statCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 16, width: 120, alignItems: "center", gap: 6,
    borderTopWidth: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    position: "relative",
  },
  statBadge: {
    position: "absolute", top: -6, right: -6,
    borderRadius: 10, minWidth: 20, height: 20,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
    borderWidth: 2, borderColor: Colors.surface,
  },
  statBadgeText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  statValue: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textMuted, textAlign: "center" },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 10 },
  sectionMore: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  action: {
    width: "47%", borderRadius: 16, padding: 16,
    alignItems: "center", gap: 8, position: "relative",
  },
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
  orderRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  orderRight: { alignItems: "flex-start" },
  orderInfo: { flex: 1 },
  orderName: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  orderId: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  orderItems: { fontSize: 11, color: Colors.textSecondary, textAlign: "right" },
  orderTotal: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  orderTime: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  orderStatus: { alignItems: "center" },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
  alertRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  alertInfo: { flex: 1 },
  alertName: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  alertWarn: { fontSize: 12, textAlign: "right" },
  alertBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  alertBadgeText: { fontSize: 12, fontWeight: "700" },
});

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_SUBSCRIBERS, DEMO_ADS } from "@/data/subscriptionData";
import { usePlatformDelivery } from "@/contexts/PlatformDeliveryContext";
import { useOrders } from "@/contexts/OrdersContext";

const ADMIN_COLOR = "#7C3AED";

function StatCard({ icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { deliveryCompanies, getPendingCount } = usePlatformDelivery();
  const { customerOrders, warehouseOrders } = useOrders();

  const pharmacies = DEMO_SUBSCRIBERS.filter(s => s.type === "pharmacy");
  const warehouses = DEMO_SUBSCRIBERS.filter(s => s.type === "warehouse");
  const activePharmacies = pharmacies.filter(s => s.status === "active");
  const activeWarehouses = warehouses.filter(s => s.status === "active");
  const subRevenue = DEMO_SUBSCRIBERS.filter(s => s.status === "active").reduce((acc, s) => acc + s.revenue, 0);
  const deliveryRevenue = deliveryCompanies.filter(c => c.status === "approved").reduce((acc, c) => acc + c.monthlyFee, 0);
  const ordersRevenue = customerOrders.reduce((acc, o) => acc + o.total + o.deliveryFee, 0);
  const totalRevenue = subRevenue + deliveryRevenue + ordersRevenue;
  const activeAds = DEMO_ADS.filter(a => a.status === "active");
  const pendingDelivery = getPendingCount();
  const approvedDelivery = deliveryCompanies.filter(c => c.status === "approved").length;

  const premiumCount = DEMO_SUBSCRIBERS.filter(s => s.plan === "premium" && s.status === "active").length;
  const standardCount = DEMO_SUBSCRIBERS.filter(s => s.plan === "standard" && s.status === "active").length;

  // Real orders stats
  const totalOrders = customerOrders.length + warehouseOrders.length;
  const pendingOrders = customerOrders.filter(o => o.status === "new" || o.status === "processing").length;
  const completedOrders = customerOrders.filter(o => o.status === "completed").length;
  const guestOrders = customerOrders.filter(o => o.customerId === "guest").length;

  // Payment method breakdown
  const walletOrders = customerOrders.filter(o =>
    !["cod", "card", "whatsapp"].includes(o.paymentMethod)).length;
  const cardOrders = customerOrders.filter(o => o.paymentMethod === "card").length;
  const codOrders = customerOrders.filter(o => o.paymentMethod === "cod").length;

  const recentActivity = [
    ...customerOrders.slice(-3).reverse().map(o => ({
      icon: "cart",
      text: `طلب جديد من ${o.customerName} — ${o.total.toLocaleString()} د.ع`,
      time: "مؤخراً",
      color: Colors.primary,
    })),
    { icon: "storefront", text: "دەرمانخانەی شیفا اشتركت في الباقة المميزة", time: "منذ ساعتين", color: Colors.primary },
    { icon: "megaphone", text: "إعلان جديد تمت الموافقة عليه", time: "منذ أمس", color: ADMIN_COLOR },
  ].slice(0, 5);

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Text style={styles.headerTitle}>لوحة الإدارة</Text>
          <Text style={styles.headerSub}>مرحباً، {user?.name}</Text>
        </View>
        <View style={[styles.adminAvatar, { backgroundColor: ADMIN_COLOR }]}>
          <Ionicons name="shield" size={22} color="#fff" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Revenue Banner */}
        <View style={[styles.revenueBanner, { backgroundColor: ADMIN_COLOR }]}>
          <View>
            <Text style={styles.revenueSub}>إجمالي إيرادات التطبيق</Text>
            <Text style={styles.revenueValue}>{totalRevenue.toLocaleString()} د.ع</Text>
            <Text style={styles.revenuePeriod}>الشهر الحالي</Text>
          </View>
          <Ionicons name="trending-up" size={48} color="#ffffff30" />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="storefront" label="الصيدليات النشطة" value={`${activePharmacies.length}`} sub={`إجمالي: ${pharmacies.length}`} color={Colors.primary} />
          <StatCard icon="cube" label="المذاخر النشطة" value={`${activeWarehouses.length}`} sub={`إجمالي: ${warehouses.length}`} color="#0D7A54" />
          <StatCard icon="car" label="شركات توصيل معتمدة" value={`${approvedDelivery}`} sub={pendingDelivery > 0 ? `${pendingDelivery} طلبات بانتظار الموافقة` : "لا طلبات معلقة"} color="#059669" />
          <StatCard icon="megaphone" label="إعلانات نشطة" value={`${activeAds.length}`} sub={`إجمالي: ${DEMO_ADS.length}`} color={ADMIN_COLOR} />
        </View>

        {/* Orders Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إحصائيات الطلبات</Text>
          <View style={styles.statsGrid}>
            <StatCard icon="bag-handle" label="إجمالي الطلبات" value={`${totalOrders}`} sub={`${pendingOrders} قيد التنفيذ`} color={Colors.primary} />
            <StatCard icon="checkmark-circle" label="طلبات مكتملة" value={`${completedOrders}`} sub={`${guestOrders} طلب ضيف`} color="#059669" />
          </View>

          {/* Payment Method Breakdown */}
          <Text style={[styles.sectionTitle, { fontSize: 13, marginTop: 12, marginBottom: 8 }]}>وسائل الدفع المستخدمة</Text>
          {[
            { label: "الدفع عند الاستلام (كاش)", count: codOrders, color: "#0D7A54", icon: "cash" },
            { label: "البطاقة المصرفية", count: cardOrders, color: Colors.primary, icon: "card" },
            { label: "المحافظ الإلكترونية العراقية", count: walletOrders, color: "#D69E2E", icon: "wallet" },
            { label: "واتساب", count: customerOrders.filter(o => o.paymentMethod === "whatsapp").length, color: "#25D366", icon: "logo-whatsapp" },
          ].map(item => (
            <View key={item.label} style={styles.payRow}>
              <Text style={styles.payCount}>{item.count}</Text>
              <View style={styles.payBarBg}>
                <View style={[
                  styles.payBar,
                  {
                    width: totalOrders > 0 ? `${Math.round(item.count / Math.max(totalOrders, 1) * 100)}%` as any : "0%",
                    backgroundColor: item.color,
                  }
                ]} />
              </View>
              <View style={[styles.payDot, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon as any} size={14} color={item.color} />
              </View>
              <Text style={styles.payLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Plan Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توزيع الباقات</Text>
          <View style={styles.planBreakdown}>
            {[
              { label: "مميز", color: "#7C3AED", count: premiumCount, percent: Math.round(premiumCount / DEMO_SUBSCRIBERS.length * 100) },
              { label: "أساسي", color: Colors.primary, count: standardCount, percent: Math.round(standardCount / DEMO_SUBSCRIBERS.length * 100) },
              { label: "مجاني", color: "#6B7280", count: DEMO_SUBSCRIBERS.filter(s => s.plan === "free").length, percent: Math.round(DEMO_SUBSCRIBERS.filter(s => s.plan === "free").length / DEMO_SUBSCRIBERS.length * 100) },
            ].map(plan => (
              <View key={plan.label} style={styles.planRow}>
                <Text style={styles.planPercent}>{plan.percent}%</Text>
                <View style={styles.planBarBg}>
                  <View style={[styles.planBar, { width: `${plan.percent}%` as any, backgroundColor: plan.color }]} />
                </View>
                <View style={[styles.planDot, { backgroundColor: plan.color }]} />
                <Text style={styles.planLabel}>{plan.label} ({plan.count})</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آخر النشاطات</Text>
          <View style={styles.activityList}>
            {recentActivity.map((item, i) => (
              <View key={i} style={styles.activityItem}>
                <Text style={styles.activityTime}>{item.time}</Text>
                <Text style={styles.activityText} numberOfLines={2}>{item.text}</Text>
                <View style={[styles.activityIcon, { backgroundColor: item.color + "15" }]}>
                  <Ionicons name={item.icon as any} size={16} color={item.color} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: "add-circle", label: "إضافة باقة", color: ADMIN_COLOR },
              { icon: "megaphone", label: "إضافة إعلان", color: Colors.primary },
              { icon: "ban", label: "إيقاف مشترك", color: Colors.error },
              { icon: "download", label: "تصدير تقرير", color: "#0D7A54" },
            ].map(item => (
              <TouchableOpacity key={item.label} style={styles.quickItem}>
                <View style={[styles.quickIcon, { backgroundColor: item.color + "15" }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logoutBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerRight: { flex: 1, alignItems: "flex-end", marginHorizontal: 12 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  headerSub: { fontSize: 13, color: Colors.textSecondary },
  adminAvatar: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 16 },
  revenueBanner: {
    borderRadius: 20, padding: 24,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  revenueSub: { color: "#ffffff90", fontSize: 13, marginBottom: 4, textAlign: "right" },
  revenueValue: { color: "#fff", fontSize: 28, fontWeight: "900", textAlign: "right" },
  revenuePeriod: { color: "#ffffffb0", fontSize: 12, textAlign: "right", marginTop: 2 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    flex: 1, minWidth: "45%", backgroundColor: Colors.surface,
    borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12,
    borderLeftWidth: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statInfo: { flex: 1 },
  statValue: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  statLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: "right" },
  statSub: { fontSize: 10, color: Colors.textMuted, textAlign: "right", marginTop: 1 },
  section: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 14 },
  planBreakdown: { gap: 12 },
  planRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  planDot: { width: 8, height: 8, borderRadius: 4 },
  planLabel: { fontSize: 12, color: Colors.textSecondary, minWidth: 80, textAlign: "right" },
  planBarBg: { flex: 1, height: 8, backgroundColor: Colors.surfaceAlt, borderRadius: 4, overflow: "hidden" },
  planBar: { height: "100%", borderRadius: 4 },
  planPercent: { fontSize: 11, color: Colors.textMuted, minWidth: 30, textAlign: "right" },
  activityList: { gap: 12 },
  activityItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  activityIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  activityText: { flex: 1, fontSize: 13, color: Colors.textPrimary, textAlign: "right", lineHeight: 18 },
  activityTime: { fontSize: 11, color: Colors.textMuted, flexShrink: 0 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickItem: { flex: 1, minWidth: "45%", alignItems: "center", gap: 8, padding: 14, backgroundColor: Colors.surfaceAlt, borderRadius: 14 },
  quickIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 12, fontWeight: "600", color: Colors.textPrimary, textAlign: "center" },
  payRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  payDot: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  payLabel: { fontSize: 12, color: Colors.textSecondary, flex: 1, textAlign: "right" },
  payBarBg: { width: 80, height: 6, backgroundColor: Colors.surfaceAlt, borderRadius: 3, overflow: "hidden" },
  payBar: { height: "100%", borderRadius: 3 },
  payCount: { fontSize: 13, fontWeight: "800", color: Colors.textPrimary, minWidth: 20, textAlign: "left" },
});

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { usePlatformDelivery, FinancialTransaction } from "@/contexts/PlatformDeliveryContext";
import { DEMO_SUBSCRIBERS } from "@/data/subscriptionData";

const ADMIN_COLOR = "#7C3AED";

type TxFilter = "all" | "subscription" | "delivery_fee" | "ad_fee";
type StatusFilter = "all" | "completed" | "pending" | "failed";

function TxIcon({ type }: { type: FinancialTransaction["type"] }) {
  const map = {
    subscription: { icon: "card", color: ADMIN_COLOR },
    delivery_fee: { icon: "car", color: "#059669" },
    ad_fee: { icon: "megaphone", color: "#E48900" },
    refund: { icon: "refresh", color: Colors.error },
  };
  const m = map[type];
  return (
    <View style={[styles.txIcon, { backgroundColor: m.color + "15" }]}>
      <Ionicons name={m.icon as any} size={18} color={m.color} />
    </View>
  );
}

function StatusChip({ status }: { status: FinancialTransaction["status"] }) {
  const map = {
    completed: { label: "مكتمل", bg: "#D1FAE5", color: "#059669" },
    pending: { label: "معلق", bg: "#FEF3C7", color: "#D97706" },
    failed: { label: "فاشل", bg: "#FEE2E2", color: "#DC2626" },
  };
  const s = map[status];
  return (
    <View style={[styles.statusChip, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusChipText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

export default function AdminFinance() {
  const insets = useSafeAreaInsets();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const { transactions, deliveryCompanies, getTotalRevenue, getMonthlyRevenue } = usePlatformDelivery();

  const [txFilter, setTxFilter] = useState<TxFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const totalRevenue = getTotalRevenue();
  const monthlyRevenue = getMonthlyRevenue();

  const activePharmacies = DEMO_SUBSCRIBERS.filter(s => s.type === "pharmacy" && s.status === "active").length;
  const activeWarehouses = DEMO_SUBSCRIBERS.filter(s => s.type === "warehouse" && s.status === "active").length;
  const subRevenue = DEMO_SUBSCRIBERS.filter(s => s.status === "active").reduce((acc, s) => acc + s.revenue, 0);
  const deliveryRevenue = deliveryCompanies.filter(c => c.status === "approved").reduce((acc, c) => acc + c.monthlyFee, 0);
  const pendingRevenue = transactions.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const failedRevenue = transactions.filter(t => t.status === "failed").reduce((s, t) => s + t.amount, 0);

  const filtered = transactions.filter(t => {
    if (txFilter !== "all" && t.type !== txFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <Text style={styles.headerTitle}>اللوحة المالية</Text>
          <Text style={styles.headerSub}>جميع الإيرادات والمعاملات المالية للمنصة</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: ADMIN_COLOR }]}>
          <Ionicons name="cash" size={22} color="#fff" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Revenue Summary Cards */}
        <View style={styles.summarySection}>
          <View style={[styles.totalCard, { backgroundColor: ADMIN_COLOR }]}>
            <View style={styles.totalCardLeft}>
              <Text style={styles.totalCardLabel}>إجمالي الإيرادات</Text>
              <Text style={styles.totalCardNum}>{(totalRevenue + subRevenue).toLocaleString()}</Text>
              <Text style={styles.totalCardCurrency}>د.ع</Text>
            </View>
            <Ionicons name="trending-up" size={48} color="rgba(255,255,255,0.3)" />
          </View>

          <View style={styles.subCardsRow}>
            <View style={styles.subCard}>
              <Ionicons name="card-outline" size={20} color={ADMIN_COLOR} />
              <Text style={[styles.subCardNum, { color: ADMIN_COLOR }]}>{subRevenue.toLocaleString()}</Text>
              <Text style={styles.subCardLabel}>اشتراكات</Text>
            </View>
            <View style={styles.subCard}>
              <Ionicons name="car-outline" size={20} color="#059669" />
              <Text style={[styles.subCardNum, { color: "#059669" }]}>{deliveryRevenue.toLocaleString()}</Text>
              <Text style={styles.subCardLabel}>رسوم توصيل</Text>
            </View>
            <View style={styles.subCard}>
              <Ionicons name="time-outline" size={20} color="#D97706" />
              <Text style={[styles.subCardNum, { color: "#D97706" }]}>{pendingRevenue.toLocaleString()}</Text>
              <Text style={styles.subCardLabel}>معلق</Text>
            </View>
            <View style={styles.subCard}>
              <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
              <Text style={[styles.subCardNum, { color: Colors.error }]}>{failedRevenue.toLocaleString()}</Text>
              <Text style={styles.subCardLabel}>فاشل</Text>
            </View>
          </View>
        </View>

        {/* Breakdown Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل المصادر</Text>
          <View style={styles.breakdownCard}>
            {[
              { icon: "storefront", label: "الصيدليات النشطة", value: `${activePharmacies} صيدلية`, color: Colors.primary },
              { icon: "cube", label: "المذاخر النشطة", value: `${activeWarehouses} مذخر`, color: "#0D7A54" },
              { icon: "car", label: "شركات توصيل معتمدة", value: `${deliveryCompanies.filter(c => c.status === "approved").length} شركة`, color: "#059669" },
              { icon: "cash", label: "إيرادات الشهر الحالي", value: `${monthlyRevenue.toLocaleString()} د.ع`, color: ADMIN_COLOR },
            ].map(item => (
              <View key={item.label} style={styles.breakdownRow}>
                <Text style={[styles.breakdownValue, { color: item.color }]}>{item.value}</Text>
                <View style={styles.breakdownLabelRow}>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Companies Financials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المالية — شركات التوصيل</Text>
          {deliveryCompanies.map(c => (
            <View key={c.id} style={styles.companyFinCard}>
              <View style={styles.companyFinRight}>
                <Text style={styles.companyFinName}>{c.name}</Text>
                <Text style={styles.companyFinSub}>{c.cities.slice(0, 2).join("، ")}</Text>
              </View>
              <View style={styles.companyFinLeft}>
                <Text style={[styles.companyFinAmount, { color: ADMIN_COLOR }]}>
                  {c.monthlyFee.toLocaleString()} د.ع
                </Text>
                <View style={[styles.payBadge, {
                  backgroundColor:
                    c.paymentStatus === "paid" ? "#D1FAE5" :
                    c.paymentStatus === "overdue" ? "#FEE2E2" : "#FEF3C7"
                }]}>
                  <Text style={[styles.payBadgeText, {
                    color:
                      c.paymentStatus === "paid" ? "#059669" :
                      c.paymentStatus === "overdue" ? "#DC2626" : "#D97706"
                  }]}>
                    {c.paymentStatus === "paid" ? "مدفوع" : c.paymentStatus === "overdue" ? "متأخر" : "معلق"}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سجل المعاملات</Text>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterRow}>
              {([
                { key: "all", label: "الكل" },
                { key: "subscription", label: "اشتراكات" },
                { key: "delivery_fee", label: "توصيل" },
                { key: "ad_fee", label: "إعلانات" },
              ] as { key: TxFilter; label: string }[]).map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterPill, txFilter === f.key && styles.filterPillActive]}
                  onPress={() => setTxFilter(f.key)}
                >
                  <Text style={[styles.filterPillText, txFilter === f.key && styles.filterPillTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.filterDivider} />
              {([
                { key: "all", label: "الكل" },
                { key: "completed", label: "مكتمل" },
                { key: "pending", label: "معلق" },
                { key: "failed", label: "فاشل" },
              ] as { key: StatusFilter; label: string }[]).map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterPill, statusFilter === f.key && styles.filterPillStatus]}
                  onPress={() => setStatusFilter(f.key)}
                >
                  <Text style={[styles.filterPillText, statusFilter === f.key && styles.filterPillTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {filtered.map(tx => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txLeft}>
                <StatusChip status={tx.status} />
                <Text style={[styles.txAmount, {
                  color: tx.status === "failed" ? Colors.error : ADMIN_COLOR
                }]}>{tx.status === "failed" ? "-" : "+"}{tx.amount.toLocaleString()} د.ع</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txName}>{tx.entityName}</Text>
                <Text style={styles.txDesc}>{tx.description}</Text>
                <Text style={styles.txDate}>{new Date(tx.date).toLocaleDateString("ar-IQ")}</Text>
              </View>
              <TxIcon type={tx.type} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surface, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerRight: { gap: 2 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  headerSub: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  headerIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  summarySection: { padding: 16, gap: 10 },
  totalCard: { borderRadius: 20, padding: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalCardLeft: { gap: 4 },
  totalCardLabel: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.8)", textAlign: "right" },
  totalCardNum: { fontSize: 36, fontWeight: "900", color: "#fff", textAlign: "right" },
  totalCardCurrency: { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.7)", textAlign: "right" },
  subCardsRow: { flexDirection: "row", gap: 10 },
  subCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 12, alignItems: "center", gap: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  subCardNum: { fontSize: 16, fontWeight: "800" },
  subCardLabel: { fontSize: 10, color: Colors.textMuted, textAlign: "center" },
  section: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  breakdownCard: { backgroundColor: Colors.surface, borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  breakdownRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  breakdownLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: "600" },
  breakdownValue: { fontSize: 14, fontWeight: "800" },
  companyFinCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: Colors.surface, borderRadius: 14, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  companyFinRight: { flex: 1, gap: 3 },
  companyFinName: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  companyFinSub: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  companyFinLeft: { alignItems: "flex-end", gap: 6 },
  companyFinAmount: { fontSize: 14, fontWeight: "800" },
  payBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  payBadgeText: { fontSize: 11, fontWeight: "700" },
  filterScroll: { marginBottom: 4 },
  filterRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  filterPill: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterPillActive: { backgroundColor: ADMIN_COLOR, borderColor: ADMIN_COLOR },
  filterPillStatus: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterPillText: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary },
  filterPillTextActive: { color: "#fff" },
  filterDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 4 },
  txRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.surface, borderRadius: 14, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  txIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  txRight: { flex: 1, gap: 2 },
  txLeft: { alignItems: "flex-end", gap: 4, minWidth: 90 },
  txName: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  txDesc: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  txDate: { fontSize: 11, color: Colors.textSecondary, textAlign: "right" },
  txAmount: { fontSize: 14, fontWeight: "800" },
  statusChip: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  statusChipText: { fontSize: 10, fontWeight: "700" },
});

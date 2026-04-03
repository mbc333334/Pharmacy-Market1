import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import {
  PHARMACY_PLANS, WAREHOUSE_PLANS, DEMO_SUBSCRIBERS, Plan, PlanId,
} from "@/data/subscriptionData";

const ADMIN_COLOR = "#7C3AED";

type FilterTab = "all" | "pharmacy" | "warehouse";
type PlanFilter = "all" | PlanId;

const PLAN_COLORS: Record<PlanId, string> = {
  free: "#6B7280",
  standard: Colors.primary,
  premium: "#7C3AED",
};

const PLAN_LABELS: Record<PlanId, string> = {
  free: "مجاني",
  standard: "أساسي",
  premium: "مميز",
};

const STATUS_COLORS: Record<string, string> = {
  active: "#10B981",
  expired: Colors.error,
  pending: "#F59E0B",
};

const STATUS_LABELS: Record<string, string> = {
  active: "نشط",
  expired: "منتهي",
  pending: "معلّق",
};

function PlanCard({ plan, isSelected, onSelect }: { plan: Plan; isSelected: boolean; onSelect: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.planCard, isSelected && { borderColor: plan.color, borderWidth: 2 }]}
      onPress={onSelect}
    >
      <View style={[styles.planBadge, { backgroundColor: plan.color }]}>
        {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
        {!isSelected && <Ionicons name="ellipse" size={8} color="#ffffff80" />}
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text style={[styles.planName, { color: plan.color }]}>{plan.nameAr}</Text>
        <Text style={styles.planPrice}>{plan.priceLabel}</Text>
        {plan.features.slice(0, 2).map((f, i) => (
          <Text key={i} style={styles.planFeature}>• {f}</Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function AdminSubscriptions() {
  const insets = useSafeAreaInsets();
  const [filterType, setFilterType] = useState<FilterTab>("all");
  const [filterPlan, setFilterPlan] = useState<PlanFilter>("all");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<typeof DEMO_SUBSCRIBERS[0] | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlanId>("free");

  const filtered = DEMO_SUBSCRIBERS.filter(s => {
    if (filterType !== "all" && s.type !== filterType) return false;
    if (filterPlan !== "all" && s.plan !== filterPlan) return false;
    return true;
  });

  const totalRevenue = DEMO_SUBSCRIBERS.reduce((a, s) => a + s.revenue, 0);
  const activeCount = DEMO_SUBSCRIBERS.filter(s => s.status === "active").length;

  const handleEditPlan = (sub: typeof DEMO_SUBSCRIBERS[0]) => {
    setSelectedSubscriber(sub);
    setEditingPlan(sub.plan);
    setShowPlanModal(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.header}>
        <View />
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.headerTitle}>إدارة الاشتراكات</Text>
          <Text style={styles.headerSub}>{activeCount} مشترك نشط</Text>
        </View>
        <View style={[styles.adminIcon, { backgroundColor: ADMIN_COLOR }]}>
          <Ionicons name="card" size={18} color="#fff" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Revenue Summary */}
        <View style={styles.summaryRow}>
          {[
            { label: "إجمالي الإيرادات", value: `${totalRevenue.toLocaleString()} د.ع`, color: ADMIN_COLOR },
            { label: "المشتركون الفعّالون", value: `${activeCount}`, color: "#10B981" },
            { label: "المشتركون المنتهون", value: `${DEMO_SUBSCRIBERS.filter(s => s.status === "expired").length}`, color: Colors.error },
          ].map(item => (
            <View key={item.label} style={[styles.summaryCard, { borderTopColor: item.color }]}>
              <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Plans overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>باقات الصيدليات</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {PHARMACY_PLANS.map(plan => (
                <View key={plan.id} style={styles.miniPlan}>
                  <View style={[styles.miniPlanColor, { backgroundColor: plan.color }]} />
                  <Text style={styles.miniPlanName}>{plan.nameAr}</Text>
                  <Text style={styles.miniPlanPrice}>{plan.priceLabel}</Text>
                  <Text style={styles.miniPlanCount}>
                    {DEMO_SUBSCRIBERS.filter(s => s.type === "pharmacy" && s.plan === plan.id).length} مشترك
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>باقات المذاخر</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {WAREHOUSE_PLANS.map(plan => (
                <View key={plan.id} style={styles.miniPlan}>
                  <View style={[styles.miniPlanColor, { backgroundColor: plan.color }]} />
                  <Text style={styles.miniPlanName}>{plan.nameAr}</Text>
                  <Text style={styles.miniPlanPrice}>{plan.priceLabel}</Text>
                  <Text style={styles.miniPlanCount}>
                    {DEMO_SUBSCRIBERS.filter(s => s.type === "warehouse" && s.plan === plan.id).length} مشترك
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(["all", "pharmacy", "warehouse"] as FilterTab[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filterType === f && { backgroundColor: ADMIN_COLOR }]}
              onPress={() => setFilterType(f)}
            >
              <Text style={[styles.filterBtnText, filterType === f && { color: "#fff" }]}>
                {f === "all" ? "الكل" : f === "pharmacy" ? "صيدليات" : "مذاخر"}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={{ flex: 1 }} />
          {(["all", "free", "standard", "premium"] as PlanFilter[]).map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.filterBtn, filterPlan === p && { backgroundColor: p === "all" ? ADMIN_COLOR : PLAN_COLORS[p as PlanId] }]}
              onPress={() => setFilterPlan(p)}
            >
              <Text style={[styles.filterBtnText, filterPlan === p && { color: "#fff" }]}>
                {p === "all" ? "الكل" : PLAN_LABELS[p as PlanId]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subscriber List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>قائمة المشتركين ({filtered.length})</Text>
          <View style={{ gap: 10 }}>
            {filtered.map(sub => (
              <View key={sub.id} style={styles.subCard}>
                <TouchableOpacity style={styles.subEditBtn} onPress={() => handleEditPlan(sub)}>
                  <Ionicons name="create-outline" size={16} color={ADMIN_COLOR} />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: "flex-end", gap: 4 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[sub.status] }]} />
                    <Text style={[styles.statusText, { color: STATUS_COLORS[sub.status] }]}>{STATUS_LABELS[sub.status]}</Text>
                    <View style={[styles.planTag, { backgroundColor: PLAN_COLORS[sub.plan] + "20" }]}>
                      <Text style={[styles.planTagText, { color: PLAN_COLORS[sub.plan] }]}>{PLAN_LABELS[sub.plan]}</Text>
                    </View>
                    <Text style={styles.subName}>{sub.name}</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <Text style={styles.subMeta}>{sub.revenue.toLocaleString()} د.ع/شهر</Text>
                    <Text style={styles.subMeta}>{sub.city}</Text>
                    <Text style={styles.subMeta}>{sub.type === "pharmacy" ? "صيدلية" : "مذخر"}</Text>
                  </View>
                  {sub.expiry ? (
                    <Text style={styles.subExpiry}>ينتهي: {sub.expiry}</Text>
                  ) : (
                    <Text style={styles.subExpiry}>مجاني — بدون انتهاء</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Edit Plan Modal */}
      <Modal visible={showPlanModal} transparent animationType="slide" onRequestClose={() => setShowPlanModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPlanModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>تعديل باقة {selectedSubscriber?.name}</Text>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {(selectedSubscriber?.type === "pharmacy" ? PHARMACY_PLANS : WAREHOUSE_PLANS).map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isSelected={editingPlan === plan.id}
                  onSelect={() => setEditingPlan(plan.id)}
                />
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalSave, { backgroundColor: ADMIN_COLOR }]}
              onPress={() => setShowPlanModal(false)}
            >
              <Text style={styles.modalSaveText}>حفظ التغييرات</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  adminIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  headerSub: { fontSize: 12, color: Colors.textSecondary },
  content: { padding: 16, gap: 16 },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    alignItems: "flex-end", borderTopWidth: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  summaryValue: { fontSize: 18, fontWeight: "900" },
  summaryLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: "right", marginTop: 2 },
  section: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 12 },
  miniPlan: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 12, minWidth: 120, alignItems: "flex-end", gap: 4,
  },
  miniPlanColor: { width: 24, height: 4, borderRadius: 2, alignSelf: "flex-end" },
  miniPlanName: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary },
  miniPlanPrice: { fontSize: 11, color: Colors.textSecondary },
  miniPlanCount: { fontSize: 11, color: Colors.textMuted },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterBtnText: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary },
  subCard: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 14, padding: 14,
    flexDirection: "row", alignItems: "flex-start", gap: 10,
  },
  subEditBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: ADMIN_COLOR + "15",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  subName: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  subMeta: { fontSize: 12, color: Colors.textSecondary },
  subExpiry: { fontSize: 11, color: Colors.textMuted },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "700" },
  planTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  planTagText: { fontSize: 11, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "#00000060", justifyContent: "flex-end" },
  modalBox: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  planCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surfaceAlt, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  planBadge: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  planName: { fontSize: 15, fontWeight: "800" },
  planPrice: { fontSize: 13, color: Colors.textSecondary, textAlign: "right" },
  planFeature: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  modalSave: {
    borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 16,
  },
  modalSaveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

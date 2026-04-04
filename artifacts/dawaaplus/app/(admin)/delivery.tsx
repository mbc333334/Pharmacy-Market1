import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert, TextInput, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { usePlatformDelivery, PlatformDeliveryCompany, DeliveryStatus } from "@/contexts/PlatformDeliveryContext";

const ADMIN_COLOR = "#7C3AED";

type FilterTab = "all" | "pending" | "approved" | "suspended";

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Ionicons
          key={s}
          name={s <= Math.round(rating) ? "star" : "star-outline"}
          size={size}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const map: Record<DeliveryStatus, { label: string; bg: string; color: string }> = {
    pending: { label: "قيد المراجعة", bg: "#FEF3C7", color: "#D97706" },
    approved: { label: "معتمد", bg: "#D1FAE5", color: "#059669" },
    suspended: { label: "موقوف", bg: "#FEE2E2", color: "#DC2626" },
  };
  const s = map[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusBadgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

export default function AdminDelivery() {
  const insets = useSafeAreaInsets();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const { deliveryCompanies, approveCompany, suspendCompany, getPendingCount } = usePlatformDelivery();

  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [selected, setSelected] = useState<PlatformDeliveryCompany | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const pending = getPendingCount();

  const filtered = deliveryCompanies.filter(c => {
    if (filterTab === "all") return true;
    return c.status === filterTab;
  });

  const handleApprove = (company: PlatformDeliveryCompany) => {
    Alert.alert(
      "تأكيد الاعتماد",
      `هل تريد اعتماد شركة "${company.name}" في المنصة؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "نعم، اعتمد",
          onPress: () => {
            approveCompany(company.id);
            setSelected(prev => prev?.id === company.id ? { ...prev, status: "approved" } : prev);
            Alert.alert("تم الاعتماد ✅", `تم اعتماد "${company.name}" وستظهر للصيادلة والمذاخر`);
          },
        },
      ]
    );
  };

  const handleSuspend = () => {
    if (!selected) return;
    suspendCompany(selected.id, suspendReason || "إيقاف من قِبل الإدارة");
    setSelected(prev => prev ? { ...prev, status: "suspended", notes: suspendReason } : prev);
    setShowSuspendModal(false);
    setSuspendReason("");
    Alert.alert("تم الإيقاف", `تم إيقاف "${selected.name}" مؤقتاً`);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <Text style={styles.headerTitle}>شركات التوصيل</Text>
          <Text style={styles.headerSub}>إدارة وقبول شركات التوصيل في المنصة</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: ADMIN_COLOR }]}>
          <Ionicons name="car" size={22} color="#fff" />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: ADMIN_COLOR }]}>{deliveryCompanies.length}</Text>
          <Text style={styles.statLabel}>إجمالي</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#059669" }]}>{deliveryCompanies.filter(c => c.status === "approved").length}</Text>
          <Text style={styles.statLabel}>معتمد</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#D97706" }]}>{pending}</Text>
          <Text style={styles.statLabel}>قيد المراجعة</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: Colors.error }]}>{deliveryCompanies.filter(c => c.status === "suspended").length}</Text>
          <Text style={styles.statLabel}>موقوف</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {([
          { key: "all", label: "الكل" },
          { key: "pending", label: `مراجعة${pending > 0 ? ` (${pending})` : ""}` },
          { key: "approved", label: "معتمد" },
          { key: "suspended", label: "موقوف" },
        ] as { key: FilterTab; label: string }[]).map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filterTab === f.key && styles.filterTabActive]}
            onPress={() => setFilterTab(f.key)}
          >
            <Text style={[styles.filterTabText, filterTab === f.key && styles.filterTabTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.list}>
          {filtered.map(company => (
            <TouchableOpacity
              key={company.id}
              style={[styles.companyCard, selected?.id === company.id && styles.companyCardSelected]}
              onPress={() => setSelected(selected?.id === company.id ? null : company)}
              activeOpacity={0.85}
            >
              <View style={styles.companyTop}>
                <StatusBadge status={company.status} />
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{company.name}</Text>
                  <Text style={styles.companyMeta}>{company.ownerName} · {company.phone}</Text>
                  <View style={styles.companyRow}>
                    <Text style={styles.companyCities}>{company.cities.join("، ")}</Text>
                    <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                  </View>
                </View>
              </View>

              {company.status === "approved" && (
                <View style={styles.companyStats}>
                  <View style={styles.companyStatItem}>
                    <StarDisplay rating={company.rating} />
                    <Text style={styles.companyStatNum}>{company.rating.toFixed(1)}</Text>
                  </View>
                  <View style={styles.companyStatItem}>
                    <Ionicons name="cube-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.companyStatNum}>{company.totalDeliveries.toLocaleString()}</Text>
                  </View>
                  <View style={styles.companyStatItem}>
                    <Ionicons name="storefront-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.companyStatNum}>{company.activePharmacies}</Text>
                  </View>
                </View>
              )}

              {/* Expanded Detail */}
              {selected?.id === company.id && (
                <View style={styles.expandedSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailValue}>{company.email}</Text>
                    <Text style={styles.detailLabel}>البريد الإلكتروني</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailValue}>{company.vehicleTypes.join("، ")}</Text>
                    <Text style={styles.detailLabel}>أنواع المركبات</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailValue}>{new Date(company.registrationDate).toLocaleDateString("ar-IQ")}</Text>
                    <Text style={styles.detailLabel}>تاريخ التسجيل</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailValue, {
                      color: company.paymentStatus === "paid" ? Colors.success :
                             company.paymentStatus === "overdue" ? Colors.error : Colors.warning
                    }]}>
                      {company.paymentStatus === "paid" ? "مدفوع" : company.paymentStatus === "overdue" ? "متأخر" : "معلق"}
                    </Text>
                    <Text style={styles.detailLabel}>حالة الدفع الشهري</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailValue, { color: ADMIN_COLOR }]}>{company.monthlyFee.toLocaleString()} د.ع</Text>
                    <Text style={styles.detailLabel}>الرسوم الشهرية</Text>
                  </View>
                  {company.notes && (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesText}>{company.notes}</Text>
                      <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionRow}>
                    {company.status === "pending" && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: "#059669" }]}
                        onPress={() => handleApprove(company)}
                      >
                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        <Text style={styles.actionBtnText}>اعتماد الشركة</Text>
                      </TouchableOpacity>
                    )}
                    {company.status === "approved" && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: Colors.error }]}
                        onPress={() => { setShowSuspendModal(true); }}
                      >
                        <Ionicons name="ban-outline" size={18} color="#fff" />
                        <Text style={styles.actionBtnText}>إيقاف مؤقت</Text>
                      </TouchableOpacity>
                    )}
                    {company.status === "suspended" && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: "#059669" }]}
                        onPress={() => handleApprove(company)}
                      >
                        <Ionicons name="refresh-circle-outline" size={18} color="#fff" />
                        <Text style={styles.actionBtnText}>إعادة التفعيل</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.actionBtnOutline}>
                      <Ionicons name="chatbubble-outline" size={18} color={ADMIN_COLOR} />
                      <Text style={[styles.actionBtnText, { color: ADMIN_COLOR }]}>تواصل</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Suspend Modal */}
      <Modal visible={showSuspendModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>سبب الإيقاف</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="اذكر سبب الإيقاف..."
              value={suspendReason}
              onChangeText={setSuspendReason}
              multiline
              numberOfLines={4}
              textAlign="right"
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowSuspendModal(false)}>
                <Text style={styles.modalCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: Colors.error }]} onPress={handleSuspend}>
                <Text style={styles.modalConfirmText}>تأكيد الإيقاف</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: Colors.surface, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerRight: { gap: 2 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  headerSub: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  headerIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 12, alignItems: "center", gap: 4 },
  statNum: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, color: Colors.textMuted, textAlign: "center" },
  filterTabs: { flexDirection: "row", backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterTab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 3, borderBottomColor: "transparent" },
  filterTabActive: { borderBottomColor: ADMIN_COLOR },
  filterTabText: { fontSize: 12, fontWeight: "600", color: Colors.textMuted },
  filterTabTextActive: { color: ADMIN_COLOR, fontWeight: "700" },
  list: { padding: 16, gap: 12 },
  companyCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1.5, borderColor: "transparent", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  companyCardSelected: { borderColor: ADMIN_COLOR + "50", backgroundColor: "#F5F3FF" },
  companyTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  companyInfo: { flex: 1, gap: 3 },
  companyName: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  companyMeta: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 4, justifyContent: "flex-end" },
  companyCities: { fontSize: 11, color: Colors.textSecondary, textAlign: "right" },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  companyStats: { flexDirection: "row", justifyContent: "space-around", backgroundColor: Colors.background, borderRadius: 10, padding: 10 },
  companyStatItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  companyStatNum: { fontSize: 13, fontWeight: "700", color: Colors.textSecondary },
  expandedSection: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 14, gap: 10 },
  detailRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  detailLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: "600" },
  detailValue: { fontSize: 13, color: Colors.textPrimary, fontWeight: "700", textAlign: "right", flex: 1, marginRight: 8 },
  notesBox: { flexDirection: "row", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 10, padding: 10, alignItems: "flex-start" },
  notesText: { flex: 1, fontSize: 12, color: Colors.error, textAlign: "right", lineHeight: 18 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 12 },
  actionBtnOutline: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 12, borderWidth: 1.5, borderColor: ADMIN_COLOR },
  actionBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalCard: { backgroundColor: "#fff", borderRadius: 20, padding: 24, width: "100%", gap: 16 },
  modalTitle: { fontSize: 17, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  modalInput: { backgroundColor: Colors.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, fontSize: 14, color: Colors.textPrimary, minHeight: 100, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", gap: 10 },
  modalCancelBtn: { flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, paddingVertical: 13, alignItems: "center" },
  modalCancelText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  modalConfirmBtn: { flex: 2, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  modalConfirmText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});

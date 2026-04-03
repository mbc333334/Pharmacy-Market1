import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal, TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { DEMO_OFFERS, PharmacyOffer, PHARMACY_PLANS } from "@/data/subscriptionData";
import { useAuth } from "@/contexts/AuthContext";

const MEDICINE_OPTIONS = [
  "أموكسيسيلين 500mg", "باراسيتامول 500mg", "إيبوبروفين 400mg",
  "فيتامين سي 1000mg", "أوميبرازول 20mg", "ميترونيدازول 250mg",
  "كلاريثرومايسين 500mg", "سيتيريزين 10mg", "ميتفورمين 500mg",
];

function OfferCard({ offer, onDelete }: { offer: PharmacyOffer; onDelete: () => void }) {
  const isExpired = offer.status === "expired";
  return (
    <View style={[styles.offerCard, isExpired && styles.offerCardExpired]}>
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Ionicons name="trash-outline" size={16} color={isExpired ? Colors.textMuted : Colors.error} />
      </TouchableOpacity>

      <View style={{ flex: 1, gap: 8, alignItems: "flex-end" }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {isExpired ? (
            <View style={styles.expiredTag}>
              <Text style={styles.expiredTagText}>منتهي</Text>
            </View>
          ) : (
            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>نشط</Text>
            </View>
          )}
          <Text style={styles.offerMedicine}>{offer.medicineName}</Text>
        </View>

        {/* Pricing */}
        <View style={styles.priceRow}>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.discountedPrice}>{offer.discountedPrice.toLocaleString()} د.ع</Text>
            <Text style={styles.originalPrice}>{offer.originalPrice.toLocaleString()} د.ع</Text>
          </View>
          <View style={[styles.discountBadge, { backgroundColor: isExpired ? "#6B728020" : Colors.errorLight }]}>
            <Text style={[styles.discountBadgeText, { color: isExpired ? "#6B7280" : Colors.error }]}>
              -{offer.discountPercent}%
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end" }}>
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>{offer.views.toLocaleString()}</Text>
            <Ionicons name="eye-outline" size={13} color={Colors.textMuted} />
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>حتى: {offer.validUntil}</Text>
            <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function PharmacyOffers() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [offers, setOffers] = useState<PharmacyOffer[]>(DEMO_OFFERS);
  const [showModal, setShowModal] = useState(false);
  const [showMedSelect, setShowMedSelect] = useState(false);
  const [selectedMed, setSelectedMed] = useState("");
  const [discount, setDiscount] = useState("20");
  const [validUntil, setValidUntil] = useState("2026-06-30");
  const [originalPrice, setOriginalPrice] = useState("15000");

  const plan = user?.pharmacy?.subscription ?? "free";
  const planDetails = PHARMACY_PLANS.find(p => p.id === plan);
  const canCreateOffers = plan !== "free";
  const activeOffers = offers.filter(o => o.status === "active");
  const expiredOffers = offers.filter(o => o.status === "expired");

  const handleCreateOffer = () => {
    if (!selectedMed || !discount || !originalPrice) return;
    const orig = parseInt(originalPrice);
    const disc = parseInt(discount);
    const discounted = Math.round(orig * (1 - disc / 100));
    const newOffer: PharmacyOffer = {
      id: Date.now().toString(),
      medicineName: selectedMed,
      originalPrice: orig,
      discountPercent: disc,
      discountedPrice: discounted,
      validUntil,
      status: "active",
      views: 0,
    };
    setOffers(prev => [newOffer, ...prev]);
    setSelectedMed("");
    setDiscount("20");
    setOriginalPrice("15000");
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.header}>
        {canCreateOffers ? (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: Colors.primary }]}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>إضافة عرض</Text>
          </TouchableOpacity>
        ) : <View />}
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.headerTitle}>العروض الترويجية</Text>
          <Text style={styles.headerSub}>{activeOffers.length} عرض نشط</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: Colors.primary }]}>
          <Ionicons name="pricetag" size={18} color="#fff" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Plan Status */}
        <View style={[styles.planBanner, {
          backgroundColor: canCreateOffers ? Colors.primaryLight : "#F59E0B15",
          borderColor: canCreateOffers ? Colors.primary + "30" : "#F59E0B40",
        }]}>
          <View style={{ flex: 1, alignItems: "flex-end", gap: 4 }}>
            <Text style={[styles.planBannerTitle, { color: canCreateOffers ? Colors.primary : "#F59E0B" }]}>
              {canCreateOffers ? `باقتك: ${planDetails?.nameAr}` : "الباقة المجانية — ترقية مطلوبة"}
            </Text>
            <Text style={styles.planBannerSub}>
              {canCreateOffers
                ? `يمكنك إنشاء عروض ترويجية وجذب عملاء أكثر`
                : `ترقّ إلى الباقة الأساسية (25,000 د.ع/شهر) لفتح ميزة العروض`}
            </Text>
          </View>
          <Ionicons
            name={canCreateOffers ? "checkmark-circle" : "lock-closed"}
            size={28}
            color={canCreateOffers ? Colors.primary : "#F59E0B"}
          />
        </View>

        {!canCreateOffers && (
          <TouchableOpacity style={styles.upgradeBtn}>
            <Ionicons name="arrow-up-circle" size={18} color="#fff" />
            <Text style={styles.upgradeBtnText}>ترقية إلى الباقة الأساسية</Text>
          </TouchableOpacity>
        )}

        {/* Stats */}
        {canCreateOffers && (
          <View style={styles.statsRow}>
            {[
              { label: "عروض نشطة", value: `${activeOffers.length}`, color: Colors.primary },
              { label: "إجمالي المشاهدات", value: `${offers.reduce((a, o) => a + o.views, 0).toLocaleString()}`, color: "#7C3AED" },
              { label: "عروض منتهية", value: `${expiredOffers.length}`, color: Colors.textMuted },
            ].map(item => (
              <View key={item.label} style={[styles.statCard, { borderTopColor: item.color }]}>
                <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Active Offers */}
        {activeOffers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>العروض النشطة ({activeOffers.length})</Text>
            {activeOffers.map(offer => (
              <OfferCard key={offer.id} offer={offer} onDelete={() => handleDelete(offer.id)} />
            ))}
          </View>
        )}

        {/* Expired Offers */}
        {expiredOffers.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.textMuted }]}>العروض المنتهية ({expiredOffers.length})</Text>
            {expiredOffers.map(offer => (
              <OfferCard key={offer.id} offer={offer} onDelete={() => handleDelete(offer.id)} />
            ))}
          </View>
        )}

        {offers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>لا توجد عروض حالياً</Text>
            <Text style={styles.emptySub}>أضف أول عرض لجذب المزيد من العملاء</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Offer Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>إضافة عرض جديد</Text>
            </View>

            {/* Medicine Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>اختر الدواء</Text>
              <TouchableOpacity
                style={styles.medicineSelect}
                onPress={() => setShowMedSelect(!showMedSelect)}
              >
                <Ionicons name={showMedSelect ? "chevron-up" : "chevron-down"} size={16} color={Colors.textMuted} />
                <Text style={[styles.medicineSelectText, !selectedMed && { color: Colors.textMuted }]}>
                  {selectedMed || "اختر دواءً من القائمة..."}
                </Text>
              </TouchableOpacity>
              {showMedSelect && (
                <View style={styles.medicineDropdown}>
                  {MEDICINE_OPTIONS.map(med => (
                    <TouchableOpacity
                      key={med}
                      style={[styles.medOption, selectedMed === med && { backgroundColor: Colors.primaryLight }]}
                      onPress={() => { setSelectedMed(med); setShowMedSelect(false); }}
                    >
                      <Text style={[styles.medOptionText, selectedMed === med && { color: Colors.primary }]}>{med}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Price & Discount */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>السعر الأصلي (د.ع)</Text>
                <TextInput
                  style={styles.formInput}
                  value={originalPrice}
                  onChangeText={setOriginalPrice}
                  keyboardType="numeric"
                  textAlign="right"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>نسبة الخصم (%)</Text>
                <TextInput
                  style={styles.formInput}
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="numeric"
                  textAlign="right"
                  placeholder="20"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {/* Preview */}
            {originalPrice && discount && (
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>السعر بعد الخصم:</Text>
                <Text style={styles.previewPrice}>
                  {Math.round(parseInt(originalPrice || "0") * (1 - parseInt(discount || "0") / 100)).toLocaleString()} د.ع
                </Text>
              </View>
            )}

            {/* Valid Until */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>صالح حتى تاريخ</Text>
              <TextInput
                style={styles.formInput}
                value={validUntil}
                onChangeText={setValidUntil}
                placeholder="YYYY-MM-DD"
                textAlign="right"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <TouchableOpacity
              style={[styles.modalSave, { backgroundColor: selectedMed ? Colors.primary : Colors.border }]}
              onPress={handleCreateOffer}
              disabled={!selectedMed}
            >
              <Ionicons name="pricetag" size={18} color="#fff" />
              <Text style={styles.modalSaveText}>إضافة العرض</Text>
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
  headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  headerSub: { fontSize: 12, color: Colors.textSecondary },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  content: { padding: 16, gap: 16 },
  planBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 16, padding: 16, borderWidth: 1,
  },
  planBannerTitle: { fontSize: 14, fontWeight: "800" },
  planBannerSub: { fontSize: 12, color: Colors.textSecondary, textAlign: "right", lineHeight: 18 },
  upgradeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#F59E0B", borderRadius: 14, paddingVertical: 14,
  },
  upgradeBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 12,
    alignItems: "flex-end", borderTopWidth: 3,
  },
  statValue: { fontSize: 18, fontWeight: "900" },
  statLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: "right" },
  section: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 4 },
  offerCard: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 14, padding: 14,
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  offerCardExpired: { opacity: 0.7 },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.errorLight,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  offerMedicine: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  activeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: "#10B98120" },
  activeTagText: { fontSize: 10, fontWeight: "800", color: "#10B981" },
  expiredTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: Colors.surfaceAlt },
  expiredTagText: { fontSize: 10, fontWeight: "800", color: Colors.textMuted },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  discountedPrice: { fontSize: 18, fontWeight: "900", color: Colors.textPrimary },
  originalPrice: { fontSize: 12, color: Colors.textMuted, textDecorationLine: "line-through" },
  discountBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  discountBadgeText: { fontSize: 14, fontWeight: "900" },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statItemValue: { fontSize: 12, color: Colors.textSecondary },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "#00000060", justifyContent: "flex-end" },
  modalBox: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 16, maxHeight: "90%",
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  formGroup: { gap: 6 },
  formLabel: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary, textAlign: "right" },
  formInput: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary,
  },
  medicineSelect: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  medicineSelectText: { flex: 1, fontSize: 14, color: Colors.textPrimary, textAlign: "right" },
  medicineDropdown: {
    backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    maxHeight: 200, overflow: "scroll" as any,
  },
  medOption: { paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.border },
  medOptionText: { fontSize: 13, color: Colors.textPrimary, textAlign: "right" },
  previewBox: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 12,
  },
  previewLabel: { fontSize: 13, color: Colors.textSecondary },
  previewPrice: { fontSize: 18, fontWeight: "900", color: Colors.primary },
  modalSave: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 14, paddingVertical: 14,
  },
  modalSaveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

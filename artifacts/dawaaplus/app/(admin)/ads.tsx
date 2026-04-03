import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal, TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { DEMO_ADS, Advertisement } from "@/data/subscriptionData";

const ADMIN_COLOR = "#7C3AED";

const TARGET_LABELS: Record<string, string> = {
  all: "الجميع",
  customers: "العملاء فقط",
  pharmacies: "الصيدليات فقط",
};

const PLACEMENT_LABELS: Record<string, string> = {
  home: "الصفحة الرئيسية",
  search: "نتائج البحث",
  product: "صفحة المنتج",
};

function AdCard({ ad, onToggle }: { ad: Advertisement; onToggle: () => void }) {
  return (
    <View style={[styles.adCard, { borderLeftColor: ad.bgColor }]}>
      <View style={styles.adHeader}>
        <TouchableOpacity
          style={[styles.toggleBtn, { backgroundColor: ad.status === "active" ? "#10B981" : "#F59E0B" }]}
          onPress={onToggle}
        >
          <Ionicons name={ad.status === "active" ? "pause" : "play"} size={14} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "flex-end", gap: 3 }}>
          <Text style={styles.adTitle}>{ad.title}</Text>
          <Text style={styles.adSub}>{ad.subtitle}</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <View style={[styles.adTag, { backgroundColor: ad.bgColor + "20" }]}>
              <Text style={[styles.adTagText, { color: ad.bgColor }]}>{TARGET_LABELS[ad.target]}</Text>
            </View>
            <View style={styles.adTag}>
              <Text style={styles.adTagText}>{PLACEMENT_LABELS[ad.placement]}</Text>
            </View>
            <View style={[styles.adTag, { backgroundColor: ad.status === "active" ? "#10B98120" : "#F59E0B20" }]}>
              <Text style={[styles.adTagText, { color: ad.status === "active" ? "#10B981" : "#F59E0B" }]}>
                {ad.status === "active" ? "نشط" : "موقوف"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.adStats}>
        {[
          { icon: "eye-outline", value: ad.views.toLocaleString(), label: "مشاهدة" },
          { icon: "hand-left-outline", value: ad.clicks.toLocaleString(), label: "نقرة" },
          { icon: "trending-up-outline", value: `${Math.round(ad.clicks / ad.views * 100)}%`, label: "CTR" },
        ].map(stat => (
          <View key={stat.label} style={styles.adStat}>
            <Text style={styles.adStatValue}>{stat.value}</Text>
            <Text style={styles.adStatLabel}>{stat.label}</Text>
            <Ionicons name={stat.icon as any} size={13} color={Colors.textMuted} />
          </View>
        ))}
      </View>

      <View style={styles.adDateRow}>
        <Text style={styles.adDate}>حتى: {ad.until}</Text>
        <Text style={styles.adDate}>من: {ad.since}</Text>
        <Text style={styles.adCreator}>بواسطة: {ad.createdBy}</Text>
      </View>
    </View>
  );
}

export default function AdminAds() {
  const insets = useSafeAreaInsets();
  const [ads, setAds] = useState<Advertisement[]>(DEMO_ADS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState<"all" | "customers" | "pharmacies">("all");
  const [newPlacement, setNewPlacement] = useState<"home" | "search" | "product">("home");

  const toggleAd = (id: string) => {
    setAds(prev => prev.map(a => a.id === id
      ? { ...a, status: a.status === "active" ? "paused" : "active" }
      : a
    ));
  };

  const totalViews = ads.reduce((a, ad) => a + ad.views, 0);
  const totalClicks = ads.reduce((a, ad) => a + ad.clicks, 0);
  const activeAds = ads.filter(a => a.status === "active");

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: ADMIN_COLOR }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>إعلان جديد</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.headerTitle}>إدارة الإعلانات</Text>
          <Text style={styles.headerSub}>{activeAds.length} إعلان نشط</Text>
        </View>
        <View style={[styles.adminIcon, { backgroundColor: ADMIN_COLOR }]}>
          <Ionicons name="megaphone" size={18} color="#fff" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "إجمالي المشاهدات", value: totalViews.toLocaleString(), color: Colors.primary },
            { label: "إجمالي النقرات", value: totalClicks.toLocaleString(), color: ADMIN_COLOR },
            { label: "معدل النقر (CTR)", value: `${totalViews > 0 ? Math.round(totalClicks / totalViews * 100) : 0}%`, color: "#F59E0B" },
          ].map(item => (
            <View key={item.label} style={[styles.statCard, { borderTopColor: item.color }]}>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Ads List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>جميع الإعلانات</Text>
          {ads.map(ad => (
            <AdCard key={ad.id} ad={ad} onToggle={() => toggleAd(ad.id)} />
          ))}
        </View>

        {/* Pricing Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أسعار الإعلانات للصيادلة والمذاخر</Text>
          {[
            { plan: "أساسي", ads: "1 إعلان/شهر", price: "مشمول في الباقة", color: Colors.primary },
            { plan: "مميز", ads: "3 إعلانات/شهر", price: "مشمول في الباقة", color: ADMIN_COLOR },
            { plan: "إضافي", ads: "إعلان زيادة", price: "15,000 د.ع / إعلان", color: "#F59E0B" },
          ].map(item => (
            <View key={item.plan} style={styles.pricingRow}>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.pricingPlan}>{item.plan}</Text>
                <Text style={styles.pricingAds}>{item.ads}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Text style={[styles.pricingPrice, { color: item.color }]}>{item.price}</Text>
              <View style={[styles.pricingDot, { backgroundColor: item.color }]} />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Create Ad Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>إنشاء إعلان جديد</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>عنوان الإعلان</Text>
              <TextInput
                style={styles.formInput}
                placeholder="مثال: خصم 30% على الأدوية..."
                value={newTitle}
                onChangeText={setNewTitle}
                textAlign="right"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>الجمهور المستهدف</Text>
              <View style={styles.optionRow}>
                {(["all", "customers", "pharmacies"] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.optionBtn, newTarget === t && { backgroundColor: ADMIN_COLOR }]}
                    onPress={() => setNewTarget(t)}
                  >
                    <Text style={[styles.optionBtnText, newTarget === t && { color: "#fff" }]}>{TARGET_LABELS[t]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>موقع الإعلان</Text>
              <View style={styles.optionRow}>
                {(["home", "search", "product"] as const).map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.optionBtn, newPlacement === p && { backgroundColor: ADMIN_COLOR }]}
                    onPress={() => setNewPlacement(p)}
                  >
                    <Text style={[styles.optionBtnText, newPlacement === p && { color: "#fff" }]}>{PLACEMENT_LABELS[p]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalSave, { backgroundColor: ADMIN_COLOR }]}
              onPress={() => {
                setShowCreateModal(false);
                setNewTitle("");
              }}
            >
              <Text style={styles.modalSaveText}>إنشاء الإعلان</Text>
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
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  content: { padding: 16, gap: 16 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 12,
    alignItems: "flex-end", borderTopWidth: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontSize: 18, fontWeight: "900" },
  statLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: "right" },
  section: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 4 },
  adCard: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 14, padding: 14,
    gap: 10, borderLeftWidth: 4,
  },
  adHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  toggleBtn: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  adTitle: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  adSub: { fontSize: 12, color: Colors.textSecondary, textAlign: "right" },
  adTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: Colors.surfaceAlt },
  adTagText: { fontSize: 10, fontWeight: "700", color: Colors.textMuted },
  adStats: { flexDirection: "row", justifyContent: "flex-end", gap: 16 },
  adStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  adStatValue: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary },
  adStatLabel: { fontSize: 11, color: Colors.textMuted },
  adDateRow: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
  adDate: { fontSize: 10, color: Colors.textMuted },
  adCreator: { fontSize: 10, color: Colors.textMuted },
  pricingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pricingDot: { width: 10, height: 10, borderRadius: 5 },
  pricingPlan: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  pricingAds: { fontSize: 11, color: Colors.textSecondary },
  pricingPrice: { fontSize: 13, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "#00000060", justifyContent: "flex-end" },
  modalBox: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  formGroup: { gap: 6 },
  formLabel: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary, textAlign: "right" },
  formInput: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary,
  },
  optionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  optionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border },
  optionBtnText: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary },
  modalSave: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  modalSaveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

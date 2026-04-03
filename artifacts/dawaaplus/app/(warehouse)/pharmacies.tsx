import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useTranslation } from "@/i18n";

const LINKED_PHARMACIES = [
  {
    id: "1", name: "دەرمانخانەی شیفا", city: "هەولێر", address: "ناوەندی شار، شەقامی ١٠٠ مەتری",
    phone: "+9647501234567", licenseNumber: "PH-2020-001",
    orders: 45, totalPurchased: 12500000, status: "active", joinedDate: "2024-01",
    contact: "محمد صالح",
  },
  {
    id: "2", name: "دەرمانخانەی ئارام", city: "سلێمانی", address: "شەقامی سالم",
    phone: "+9647701234568", licenseNumber: "PH-2021-023",
    orders: 28, totalPurchased: 8200000, status: "active", joinedDate: "2024-03",
    contact: "كريم أحمد",
  },
  {
    id: "3", name: "دەرمانخانەی نوێ", city: "دهۆک", address: "ناوچەی بازار",
    phone: "+9647501234569", licenseNumber: "PH-2022-015",
    orders: 19, totalPurchased: 5600000, status: "active", joinedDate: "2024-06",
    contact: "ئاڤین حسین",
  },
];

export default function LinkedPharmacies() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("linkedPharmacies")}</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard label={t("linkedPharmacies")} value={String(LINKED_PHARMACIES.length)} color="#0D7A54" />
        <SummaryCard label="إجمالي الطلبات" value={String(LINKED_PHARMACIES.reduce((s, p) => s + p.orders, 0))} color={Colors.primary} />
        <SummaryCard label="المبيعات الكلية" value={`${(LINKED_PHARMACIES.reduce((s, p) => s + p.totalPurchased, 0) / 1000000).toFixed(1)}M`} color="#805AD5" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 + insets.bottom, gap: 12 }}>
        {LINKED_PHARMACIES.map(ph => (
          <TouchableOpacity key={ph.id} style={styles.pharmacyCard}>
            <View style={styles.cardTop}>
              <View style={styles.statusDot} />
              <View style={styles.pharmacyInfo}>
                <Text style={styles.pharmacyName}>{ph.name}</Text>
                <Text style={styles.pharmacyCity}>
                  <Ionicons name="location-outline" size={12} color={Colors.textMuted} /> {ph.city} — {ph.address}
                </Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>✓ نشط</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>{ph.orders}</Text>
                <Text style={styles.detailLabel}>{t("orders")}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>{(ph.totalPurchased / 1000).toFixed(0)}K</Text>
                <Text style={styles.detailLabel}>د.ع</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>{ph.joinedDate}</Text>
                <Text style={styles.detailLabel}>تاريخ الانضمام</Text>
              </View>
            </View>

            <View style={styles.cardBottom}>
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.contactText}>{ph.phone}</Text>
              </View>
              <View style={styles.licenseRow}>
                <Ionicons name="document-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.contactText}>{ph.licenseNumber}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.orderBtn}>
              <Ionicons name="cube-outline" size={16} color="#0D7A54" />
              <Text style={styles.orderBtnText}>إنشاء طلب جديد</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.summaryCard, { borderTopColor: color }]}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#0D7A54", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  addBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
  },
  summaryRow: { flexDirection: "row", gap: 10, padding: 16 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
    alignItems: "center", borderTopWidth: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  summaryValue: { fontSize: 20, fontWeight: "800" },
  summaryLabel: { fontSize: 10, color: Colors.textMuted, textAlign: "center", marginTop: 2 },
  pharmacyCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#0D7A54", marginTop: 4 },
  pharmacyInfo: { flex: 1 },
  pharmacyName: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  pharmacyCity: { fontSize: 12, color: Colors.textMuted, textAlign: "right", marginTop: 2 },
  activeBadge: {
    backgroundColor: "#E8F5E9", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  activeBadgeText: { fontSize: 11, fontWeight: "700", color: "#0D7A54" },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  detailsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  detailItem: { alignItems: "center" },
  detailValue: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  detailLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  cardBottom: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  licenseRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  contactText: { fontSize: 12, color: Colors.textSecondary },
  orderBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "#E8F5E9", borderRadius: 10, paddingVertical: 10, marginTop: 12,
  },
  orderBtnText: { fontSize: 14, fontWeight: "700", color: "#0D7A54" },
});

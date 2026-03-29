import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Platform, ScrollView, TextInput, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import {
  RAWAKID, RAWAKID_CITIES, RawkadMedicine,
  getDaysColor, getDaysLabel,
} from "@/data/rawakidData";
import { useSettings } from "@/contexts/SettingsContext";

type SortMode = "urgent" | "discount" | "city";

export default function RawakidScreen() {
  const insets = useSafeAreaInsets();
  const { country } = useSettings();
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("urgent");
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filtered = useMemo(() => {
    let list = [...RAWAKID];
    if (selectedCity !== "الكل") list = list.filter(r => r.city === selectedCity);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q) ||
        r.category.includes(query) ||
        r.pharmacyName.includes(query)
      );
    }
    if (sort === "urgent") list.sort((a, b) => a.daysLeft - b.daysLeft);
    else if (sort === "discount") list.sort((a, b) => b.discountPercent - a.discountPercent);
    else if (sort === "city") list.sort((a, b) => a.city.localeCompare(b.city));
    return list;
  }, [selectedCity, query, sort]);

  const urgentCount = RAWAKID.filter(r => r.daysLeft <= 60).length;

  const openWhatsApp = (medicine: RawkadMedicine) => {
    const text = encodeURIComponent(
      `مرحباً ${medicine.ownerName}،\nرأيت عرض "${medicine.name}" (${medicine.brand}) على تطبيق دواء+.\n` +
      `الكمية: ${medicine.quantity} علبة | السعر المعروض: ${medicine.discountedPrice.toLocaleString("ar")} د.ع\n` +
      `هل ما زال العرض متاحاً؟`
    );
    const url = `https://wa.me/${medicine.whatsapp}?text=${text}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("تنبيه", "تأكد من تثبيت واتساب على جهازك")
    );
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const callPhone = (medicine: RawkadMedicine) => {
    Linking.openURL(`tel:+${medicine.whatsapp}`).catch(() => {});
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          {urgentCount > 0 && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>{urgentCount} عاجل</Text>
            </View>
          )}
          <View>
            <Text style={styles.headerTitle}>سوق الرواكد 🔖</Text>
            <Text style={styles.headerSub}>أدوية مقاربة الانتهاء بأسعار مخفضة</Text>
          </View>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.statNum}>{RAWAKID.length}</Text>
          <Text style={styles.statLabel}>عرض متاح</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="بحث بالاسم أو الصيدلية..."
            value={query}
            onChangeText={setQuery}
            textAlign="right"
            placeholderTextColor={Colors.textMuted}
          />
          <Ionicons name="search" size={17} color={Colors.textMuted} style={{ marginHorizontal: 8 }} />
        </View>
      </View>

      {/* City Filter */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cityRow}
        >
          {RAWAKID_CITIES.map(city => (
            <TouchableOpacity
              key={city}
              style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}
              onPress={() => setSelectedCity(city)}
            >
              <Text style={[styles.cityChipText, selectedCity === city && styles.cityChipTextActive]}>
                {city === "الكل" ? "🌍 الكل" : `📍 ${city}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Tabs */}
      <View style={styles.sortRow}>
        <SortChip label="الأقل خطورة" value="city" active={sort} onPress={setSort} icon="location-outline" />
        <SortChip label="الأعلى خصم" value="discount" active={sort} onPress={setSort} icon="pricetag-outline" />
        <SortChip label="الأكثر إلحاحاً" value="urgent" active={sort} onPress={setSort} icon="time-outline" />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={r => r.id}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>لا توجد نتائج</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <RawkadCard
            medicine={item}
            onWhatsApp={() => openWhatsApp(item)}
            onCall={() => callPhone(item)}
          />
        )}
      />
    </View>
  );
}

function SortChip({
  label, value, active, onPress, icon,
}: {
  label: string; value: SortMode; active: SortMode;
  onPress: (v: SortMode) => void; icon: any;
}) {
  const isActive = active === value;
  return (
    <TouchableOpacity
      style={[styles.sortChip, isActive && styles.sortChipActive]}
      onPress={() => onPress(value)}
    >
      <Ionicons name={icon} size={13} color={isActive ? "#fff" : Colors.textMuted} />
      <Text style={[styles.sortChipText, isActive && styles.sortChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function RawkadCard({
  medicine, onWhatsApp, onCall,
}: {
  medicine: RawkadMedicine;
  onWhatsApp: () => void;
  onCall: () => void;
}) {
  const urgencyColor = getDaysColor(medicine.daysLeft);
  const urgencyLabel = getDaysLabel(medicine.daysLeft);
  const saving = medicine.originalPrice - medicine.discountedPrice;

  return (
    <View style={styles.card}>
      {/* Top Row */}
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <View style={[styles.discountBadge]}>
            <Text style={styles.discountPct}>{medicine.discountPercent}%</Text>
            <Text style={styles.discountOff}>خصم</Text>
          </View>
          <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor + "18", borderColor: urgencyColor + "40" }]}>
            <View style={[styles.urgencyDot, { backgroundColor: urgencyColor }]} />
            <Text style={[styles.urgencyLabel, { color: urgencyColor }]}>{urgencyLabel}</Text>
          </View>
        </View>

        <View style={styles.cardTopRight}>
          {medicine.requiresPrescription && (
            <View style={styles.rxBadge}><Text style={styles.rxText}>Rx</Text></View>
          )}
          <Text style={styles.cardName}>{medicine.name}</Text>
          <Text style={styles.cardBrand}>{medicine.brand} • {medicine.category}</Text>
        </View>

        <View style={[styles.cardIcon, { backgroundColor: medicine.color + "18" }]}>
          <Ionicons name="medkit" size={26} color={medicine.color} />
        </View>
      </View>

      {/* Expiry Countdown */}
      <View style={[styles.expiryRow, { borderColor: urgencyColor + "30", backgroundColor: urgencyColor + "08" }]}>
        <Text style={[styles.expiryDays, { color: urgencyColor }]}>
          ⏰ {medicine.daysLeft} يوم متبقّي
        </Text>
        <Text style={styles.expiryDate}>ينتهي: {medicine.expiryDate}</Text>
      </View>

      {/* Price + Quantity */}
      <View style={styles.priceRow}>
        <View style={styles.qtyBox}>
          <Text style={styles.qtyNum}>{medicine.quantity.toLocaleString("ar")}</Text>
          <Text style={styles.qtyLabel}>علبة متاحة</Text>
        </View>
        <View style={styles.savingBox}>
          <Text style={styles.savingNum}>وفّر {saving.toLocaleString("ar")} د.ع</Text>
        </View>
        <View style={styles.priceBox}>
          <Text style={styles.originalPrice}>{medicine.originalPrice.toLocaleString("ar")}</Text>
          <Text style={styles.discountedPrice}>{medicine.discountedPrice.toLocaleString("ar")} <Text style={styles.currency}>د.ع</Text></Text>
        </View>
      </View>

      {/* Pharmacy Info + Barcode */}
      <View style={styles.pharmacyRow}>
        {medicine.barcode && (
          <View style={styles.barcodeTag}>
            <Ionicons name="barcode-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.barcodeText}>{medicine.barcode}</Text>
          </View>
        )}
        <View style={styles.pharmacyInfo}>
          <Ionicons name="storefront-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.pharmacyText}>{medicine.pharmacyName} — {medicine.city}، {medicine.district}</Text>
        </View>
      </View>

      {medicine.notes && (
        <View style={styles.notesBox}>
          <Ionicons name="information-circle-outline" size={13} color={Colors.primary} />
          <Text style={styles.notesText}>{medicine.notes}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.callBtn} onPress={onCall}>
          <Ionicons name="call-outline" size={18} color={Colors.primary} />
          <Text style={styles.callBtnText}>اتصال</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.whatsappBtn} onPress={onWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.whatsappBtnText}>واتساب الصيدلاني</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surface, paddingHorizontal: 20,
    paddingTop: 14, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerRight: { gap: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  headerSub: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  urgentBadge: {
    backgroundColor: "#FFF5F5", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: "#FEB2B2",
    alignSelf: "flex-end",
  },
  urgentBadgeText: { fontSize: 10, fontWeight: "700", color: Colors.error },
  headerStats: { alignItems: "center" },
  statNum: { fontSize: 24, fontWeight: "900", color: Colors.primary },
  statLabel: { fontSize: 10, color: Colors.textMuted },
  searchRow: { paddingHorizontal: 14, paddingVertical: 10 },
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 4,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary },
  cityRow: { paddingHorizontal: 14, gap: 8, paddingBottom: 10 },
  cityChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  cityChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  cityChipText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  cityChipTextActive: { color: "#fff" },
  sortRow: { flexDirection: "row", paddingHorizontal: 14, gap: 8, paddingBottom: 10 },
  sortChip: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    paddingVertical: 7, backgroundColor: Colors.surface,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
  },
  sortChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortChipText: { fontSize: 11, fontWeight: "600", color: Colors.textMuted },
  sortChipTextActive: { color: "#fff" },
  list: { padding: 14, gap: 14 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: Colors.textMuted },
  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    overflow: "hidden", gap: 0,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 10 },
  cardIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardTopRight: { flex: 1, alignItems: "flex-end", gap: 3 },
  cardName: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  cardBrand: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  cardTopLeft: { alignItems: "center", gap: 6 },
  discountBadge: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 5, alignItems: "center",
  },
  discountPct: { fontSize: 18, fontWeight: "900", color: "#fff", lineHeight: 20 },
  discountOff: { fontSize: 9, color: "rgba(255,255,255,0.85)", fontWeight: "700" },
  urgencyBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4,
    borderWidth: 1,
  },
  urgencyDot: { width: 6, height: 6, borderRadius: 3 },
  urgencyLabel: { fontSize: 10, fontWeight: "700" },
  rxBadge: { backgroundColor: "#805AD5", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  rxText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  expiryRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 8,
    borderTopWidth: 1, borderBottomWidth: 1,
  },
  expiryDays: { fontSize: 13, fontWeight: "800" },
  expiryDate: { fontSize: 11, color: Colors.textMuted },
  priceRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  priceBox: { alignItems: "flex-end" },
  originalPrice: {
    fontSize: 12, color: Colors.textMuted,
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
  },
  discountedPrice: { fontSize: 20, fontWeight: "900", color: Colors.primary },
  currency: { fontSize: 12, fontWeight: "600" },
  savingBox: {
    flex: 1, backgroundColor: Colors.primaryLight, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6, alignItems: "center",
  },
  savingNum: { fontSize: 11, fontWeight: "700", color: Colors.primary },
  qtyBox: { alignItems: "center" },
  qtyNum: { fontSize: 18, fontWeight: "900", color: Colors.textPrimary },
  qtyLabel: { fontSize: 10, color: Colors.textMuted },
  pharmacyRow: {
    paddingHorizontal: 14, paddingBottom: 10, gap: 5, alignItems: "flex-end",
  },
  pharmacyInfo: { flexDirection: "row", alignItems: "center", gap: 5 },
  pharmacyText: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  barcodeTag: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.surfaceAlt, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: "flex-end",
  },
  barcodeText: { fontSize: 10, color: Colors.textMuted, letterSpacing: 0.5 },
  notesBox: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.primaryLight, paddingHorizontal: 14, paddingVertical: 8,
    marginHorizontal: 14, marginBottom: 10, borderRadius: 10,
  },
  notesText: { fontSize: 12, color: Colors.primary, textAlign: "right", flex: 1 },
  actionRow: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4,
  },
  whatsappBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#25D366", borderRadius: 12, paddingVertical: 12,
    shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  whatsappBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  callBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: Colors.primaryLight, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 18,
    borderWidth: 1, borderColor: Colors.primary + "40",
  },
  callBtnText: { color: Colors.primary, fontWeight: "700", fontSize: 14 },
});

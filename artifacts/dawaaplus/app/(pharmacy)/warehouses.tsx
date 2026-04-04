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
  WAREHOUSE_MARKET, WAREHOUSE_CITIES, WarehouseMarket, WarehouseMed,
  getPlanColor, getPlanLabel,
} from "@/data/warehouseMarketData";

type SortMode = "rating" | "delivery" | "city";

export default function WarehousesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("rating");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filtered = useMemo(() => {
    let list = [...WAREHOUSE_MARKET];
    if (selectedCity !== "الكل") list = list.filter(w => w.city === selectedCity);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.city.includes(query) ||
        w.ownerName.includes(query) ||
        w.specialties.some(s => s.includes(query)) ||
        w.medicines.some(m =>
          m.name.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q)
        )
      );
    }
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "delivery") list.sort((a, b) => a.deliveryDays - b.deliveryDays);
    else if (sort === "city") list.sort((a, b) => a.city.localeCompare(b.city));
    return list;
  }, [selectedCity, query, sort]);

  const totalProducts = WAREHOUSE_MARKET.reduce((s, w) => s + w.productsCount, 0);
  const premiumCount = WAREHOUSE_MARKET.filter(w => w.plan === "premium").length;

  const openWhatsApp = (wh: WarehouseMarket, med?: WarehouseMed) => {
    const text = med
      ? encodeURIComponent(
          `مرحباً ${wh.ownerName}،\nرأيت "${med.name}" (${med.brand}) في قائمة مذخركم على دواء+.\n` +
          `الكمية المطلوبة: ${med.minOrder} علبة أو أكثر | السعر: ${med.unitPrice.toLocaleString("ar")} د.ع\n` +
          `هل المنتج متوفر؟`
        )
      : encodeURIComponent(
          `مرحباً ${wh.ownerName}،\nوجدت مذخركم "${wh.name}" على تطبيق دواء+.\n` +
          `أريد الاستفسار عن الأدوية المتوفرة وشروط الطلب.`
        );
    const url = `https://wa.me/${wh.whatsapp}?text=${text}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("تنبيه", "تأكد من تثبيت واتساب على جهازك")
    );
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const callPhone = (wh: WarehouseMarket) => {
    Linking.openURL(`tel:${wh.phone}`).catch(() => {});
  };

  const renderWarehouse = ({ item }: { item: WarehouseMarket }) => {
    const isExpanded = expandedId === item.id;
    const planColor = getPlanColor(item.plan);
    const planLabel = getPlanLabel(item.plan);

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <TouchableOpacity
              style={styles.waBtn}
              onPress={() => openWhatsApp(item)}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => callPhone(item)}
            >
              <Ionicons name="call-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.cardHeaderRight}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.planBadge, { backgroundColor: planColor + "20", borderColor: planColor }]}>
                <Text style={[styles.planBadgeText, { color: planColor }]}>{planLabel}</Text>
              </View>
              <Text style={styles.cardName}>{item.name}</Text>
            </View>
            <View style={styles.cityRow}>
              <Text style={styles.cityText}>
                <Ionicons name="location-outline" size={12} color={Colors.textMuted} /> {item.city} — {item.district}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({item.reviewCount} تقييم)</Text>
              <View style={styles.dot} />
              <Ionicons name="cube-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.prodCount}>{item.productsCount.toLocaleString("ar")} منتج</Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatChip
            icon="time-outline"
            label={`${item.deliveryDays === 1 ? "يوم واحد" : `${item.deliveryDays} أيام`}`}
            sub="التوصيل"
            color="#3182CE"
          />
          <StatChip
            icon="cash-outline"
            label={`${(item.minOrderTotal / 1000).toFixed(0)}K د.ع`}
            sub="أقل طلب"
            color={Colors.primary}
          />
          <StatChip
            icon="call-outline"
            label={item.ownerName.split(" ")[0]}
            sub="المسؤول"
            color="#805AD5"
          />
        </View>

        {/* Specialties */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtiesScroll}>
          {item.specialties.map(s => (
            <View key={s} style={styles.specialtyChip}>
              <Text style={styles.specialtyText}>{s}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Medicines Toggle */}
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={Colors.primary}
          />
          <Text style={styles.toggleText}>
            {isExpanded ? "إخفاء الأدوية" : `عرض ${item.medicines.length} منتجات`}
          </Text>
        </TouchableOpacity>

        {/* Medicines List */}
        {isExpanded && (
          <View style={styles.medsContainer}>
            {item.medicines.map((med, idx) => (
              <View key={med.id}>
                <View style={styles.medRow}>
                  <TouchableOpacity
                    style={styles.medWaBtn}
                    onPress={() => openWhatsApp(item, med)}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                    <Text style={styles.medWaText}>طلب</Text>
                  </TouchableOpacity>
                  <View style={styles.medInfo}>
                    <View style={styles.medNameRow}>
                      {med.requiresPrescription && (
                        <View style={styles.rxBadge}>
                          <Text style={styles.rxText}>Rx</Text>
                        </View>
                      )}
                      <Text style={styles.medName}>{med.name}</Text>
                    </View>
                    <Text style={styles.medBrand}>
                      {med.brand} — {med.form} — {med.category}
                    </Text>
                    <View style={styles.medPriceRow}>
                      <Text style={styles.stockText}>
                        <Ionicons name="cube-outline" size={11} color={Colors.textMuted} /> {med.stock} علبة
                      </Text>
                      <Text style={styles.minOrderText}>أقل طلب: {med.minOrder}</Text>
                      <Text style={styles.medPrice}>{med.unitPrice.toLocaleString("ar")} د.ع</Text>
                    </View>
                  </View>
                </View>
                {idx < item.medicines.length - 1 && <View style={styles.medDivider} />}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerStats}>
          <Text style={styles.statNum}>{WAREHOUSE_MARKET.length}</Text>
          <Text style={styles.statLabel}>مذخر</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerTitle}>منصة المذاخر 🏭</Text>
          <Text style={styles.headerSub}>اطلب مباشرة من المذاخر المرخصة</Text>
        </View>
      </View>

      {/* Stats Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerItem}>
          <Text style={styles.bannerNum}>{totalProducts.toLocaleString("ar")}</Text>
          <Text style={styles.bannerLabel}>منتج متوفر</Text>
        </View>
        <View style={styles.bannerDivider} />
        <View style={styles.bannerItem}>
          <Text style={styles.bannerNum}>{premiumCount}</Text>
          <Text style={styles.bannerLabel}>مذخر مميز</Text>
        </View>
        <View style={styles.bannerDivider} />
        <View style={styles.bannerItem}>
          <Text style={styles.bannerNum}>WhatsApp</Text>
          <Text style={styles.bannerLabel}>تواصل مباشر</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن مذخر أو دواء..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort Chips */}
      <View style={styles.sortRow}>
        {(["rating", "delivery", "city"] as SortMode[]).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.sortChip, sort === s && styles.sortChipActive]}
            onPress={() => setSort(s)}
          >
            <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>
              {s === "rating" ? "⭐ الأعلى تقييماً" : s === "delivery" ? "🚀 أسرع توصيل" : "📍 المدينة"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* City Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.citiesRow}
        style={styles.citiesScroll}
      >
        {WAREHOUSE_CITIES.map(city => (
          <TouchableOpacity
            key={city}
            style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}
            onPress={() => setSelectedCity(city)}
          >
            <Text style={[styles.cityChipText, selectedCity === city && styles.cityChipTextActive]}>
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultRow}>
        <Text style={styles.resultText}>{filtered.length} مذخر</Text>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={w => w.id}
        renderItem={renderWarehouse}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 + insets.bottom, gap: 14 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>لا توجد مذاخر مطابقة</Text>
          </View>
        }
      />
    </View>
  );
}

function StatChip({ icon, label, sub, color }: { icon: any; label: string; sub: string; color: string }) {
  return (
    <View style={[styles.statChip, { borderColor: color + "30", backgroundColor: color + "10" }]}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.statChipValue, { color }]}>{label}</Text>
      <Text style={styles.statChipSub}>{sub}</Text>
    </View>
  );
}

const WH_COLOR = "#0D7A54";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: WH_COLOR, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  headerRight: { alignItems: "flex-end" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  headerStats: { alignItems: "center" },
  statNum: { fontSize: 28, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)" },

  banner: {
    flexDirection: "row", backgroundColor: "#fff",
    marginHorizontal: 16, marginTop: -12,
    borderRadius: 16, paddingVertical: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  bannerItem: { flex: 1, alignItems: "center" },
  bannerNum: { fontSize: 14, fontWeight: "800", color: WH_COLOR },
  bannerLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  bannerDivider: { width: 1, backgroundColor: Colors.border },

  searchRow: { paddingHorizontal: 16, paddingTop: 12 },
  searchBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchIcon: { marginLeft: 8 },
  searchInput: { flex: 1, textAlign: "right", fontSize: 14, color: Colors.textPrimary, paddingHorizontal: 8 },

  sortRow: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  sortChipActive: { backgroundColor: WH_COLOR, borderColor: WH_COLOR },
  sortText: { fontSize: 12, color: Colors.textSecondary },
  sortTextActive: { color: "#fff", fontWeight: "700" },

  citiesScroll: { maxHeight: 48, marginTop: 8 },
  citiesRow: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  cityChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  cityChipActive: { backgroundColor: WH_COLOR, borderColor: WH_COLOR },
  cityChipText: { fontSize: 13, color: Colors.textSecondary },
  cityChipTextActive: { color: "#fff", fontWeight: "700" },

  resultRow: { paddingHorizontal: 20, paddingVertical: 8 },
  resultText: { fontSize: 13, color: Colors.textMuted },

  card: {
    backgroundColor: Colors.surface, borderRadius: 18, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardHeader: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    padding: 14,
  },
  cardHeaderRight: { flex: 1, alignItems: "flex-end" },
  cardHeaderLeft: { flexDirection: "column", gap: 8, alignItems: "center" },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  cardName: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  planBadge: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  planBadgeText: { fontSize: 11, fontWeight: "700" },
  cityRow: { marginTop: 4 },
  cityText: { fontSize: 12, color: Colors.textMuted },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  ratingText: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary },
  ratingCount: { fontSize: 11, color: Colors.textMuted },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  prodCount: { fontSize: 12, color: Colors.textMuted },

  waBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#25D36620", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#25D36640",
  },
  callBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + "15", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.primary + "30",
  },

  statsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 14, paddingBottom: 10 },
  statChip: {
    flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 6, paddingHorizontal: 8,
    alignItems: "center", gap: 2,
  },
  statChipValue: { fontSize: 12, fontWeight: "800" },
  statChipSub: { fontSize: 10, color: Colors.textMuted },

  specialtiesScroll: { paddingHorizontal: 14, marginBottom: 10 },
  specialtyChip: {
    backgroundColor: WH_COLOR + "15", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, marginLeft: 6,
  },
  specialtyText: { fontSize: 12, color: WH_COLOR, fontWeight: "600" },

  toggleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  toggleText: { fontSize: 13, color: Colors.primary, fontWeight: "600" },

  medsContainer: { borderTopWidth: 1, borderTopColor: Colors.border },
  medRow: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },
  medInfo: { flex: 1, alignItems: "flex-end" },
  medNameRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "flex-end" },
  medName: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  medBrand: { fontSize: 11, color: Colors.textMuted, textAlign: "right", marginTop: 2 },
  medPriceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, justifyContent: "flex-end" },
  medPrice: { fontSize: 13, fontWeight: "800", color: WH_COLOR },
  minOrderText: { fontSize: 11, color: Colors.textSecondary },
  stockText: { fontSize: 11, color: Colors.textMuted },
  rxBadge: {
    backgroundColor: "#EBF8FF", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2,
  },
  rxText: { fontSize: 10, fontWeight: "800", color: "#3182CE" },
  medWaBtn: {
    alignItems: "center", justifyContent: "center", gap: 3,
    backgroundColor: "#25D36615", borderRadius: 10, padding: 8,
    borderWidth: 1, borderColor: "#25D36630",
  },
  medWaText: { fontSize: 10, color: "#25D366", fontWeight: "700" },
  medDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },

  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: Colors.textMuted },
});

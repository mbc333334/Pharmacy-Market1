import { Ionicons } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView, Platform, Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { PHARMACIES_DATA, PharmacyProfile, IRAQ_CITIES } from "@/data/pharmaciesData";

type SortKey = "rating" | "delivery" | "name" | "medicines";

export default function PharmaciesScreen() {
  const insets = useSafeAreaInsets();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [sortBy, setSortBy] = useState<SortKey>("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyProfile | null>(null);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);

  const cities = ["الكل", ...IRAQ_CITIES.filter(c => PHARMACIES_DATA.some(p => p.city === c))];

  const filtered = useMemo(() => {
    let list = PHARMACIES_DATA.filter(p => {
      const q = query.toLowerCase();
      const matchQuery = !query || p.name.toLowerCase().includes(q) || p.nameAr.includes(query) || p.city.includes(query) || p.district.includes(query);
      const matchCity = selectedCity === "الكل" || p.city === selectedCity;
      const matchDelivery = !deliveryOnly || p.deliveryAvailable;
      const matchOpen = !openOnly || p.isOpen;
      return matchQuery && matchCity && matchDelivery && matchOpen;
    });

    list.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "delivery") return (a.deliveryAvailable ? 0 : 1) - (b.deliveryAvailable ? 0 : 1);
      if (sortBy === "medicines") return b.medicineCount - a.medicineCount;
      if (sortBy === "name") return a.nameAr.localeCompare(b.nameAr, "ar");
      return 0;
    });
    return list;
  }, [query, selectedCity, sortBy, deliveryOnly, openOnly]);

  const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
    { key: "rating", label: "التقييم", icon: "star" },
    { key: "delivery", label: "التوصيل", icon: "bicycle" },
    { key: "medicines", label: "المنتجات", icon: "medkit" },
    { key: "name", label: "الاسم", icon: "text" },
  ];

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[styles.filterIconBtn, showFilters && styles.filterIconBtnActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options" size={20} color={showFilters ? Colors.primary : Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>الصيدليات</Text>
            <Text style={styles.subtitle}>{filtered.length} صيدلية متاحة</Text>
          </View>
          <Ionicons name="storefront" size={28} color={Colors.primary} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث بالاسم أو المنطقة أو المدينة..."
            value={query}
            onChangeText={setQuery}
            textAlign="right"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginHorizontal: 8 }} />
        </View>

        {/* Sort Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortChip, sortBy === opt.key && styles.sortChipActive]}
              onPress={() => setSortBy(opt.key)}
            >
              <Ionicons
                name={opt.icon as any}
                size={12}
                color={sortBy === opt.key ? "#fff" : Colors.textMuted}
              />
              <Text style={[styles.sortChipText, sortBy === opt.key && styles.sortChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filters panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            {/* Toggle filters */}
            <View style={styles.toggleFilters}>
              <TouchableOpacity
                style={[styles.toggleChip, openOnly && styles.toggleChipActive]}
                onPress={() => setOpenOnly(!openOnly)}
              >
                <View style={[styles.toggleDot, openOnly && styles.toggleDotActive]} />
                <Text style={[styles.toggleChipText, openOnly && styles.toggleChipTextActive]}>
                  مفتوح الآن
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleChip, deliveryOnly && styles.toggleChipActive]}
                onPress={() => setDeliveryOnly(!deliveryOnly)}
              >
                <View style={[styles.toggleDot, deliveryOnly && styles.toggleDotActive]} />
                <Text style={[styles.toggleChipText, deliveryOnly && styles.toggleChipTextActive]}>
                  يوصّل للمنزل
                </Text>
              </TouchableOpacity>
            </View>

            {/* City Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityRow}>
              {cities.map(city => (
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
          </View>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PharmacyCard
            pharmacy={item}
            onPress={() => setSelectedPharmacy(item)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="storefront-outline" size={52} color={Colors.border} />
            <Text style={styles.emptyText}>لا توجد صيدليات مطابقة</Text>
            <Text style={styles.emptySubText}>جرّب تغيير خيارات البحث</Text>
          </View>
        )}
      />

      {/* Detail Modal */}
      {selectedPharmacy && (
        <PharmacyDetailModal
          pharmacy={selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
        />
      )}
    </View>
  );
}

function PharmacyCard({ pharmacy, onPress }: { pharmacy: PharmacyProfile; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={styles.cardBadges}>
          {pharmacy.plan === "premium" && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={9} color="#F59E0B" />
              <Text style={styles.premiumBadgeText}>مميّز</Text>
            </View>
          )}
          <View style={[styles.statusDot, { backgroundColor: pharmacy.isOpen ? Colors.success : Colors.error }]} />
          <Text style={[styles.statusText, { color: pharmacy.isOpen ? Colors.success : Colors.error }]}>
            {pharmacy.isOpen ? `مفتوح — حتى ${pharmacy.openUntil}` : `مغلق — يفتح ${pharmacy.openUntil}`}
          </Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <View style={[styles.cardIconWrap, { backgroundColor: pharmacy.color + "18" }]}>
            <Ionicons name="storefront" size={28} color={pharmacy.color} />
          </View>
          <View style={styles.cardNames}>
            <Text style={styles.cardName}>{pharmacy.name}</Text>
            <Text style={styles.cardNameAr}>{pharmacy.nameAr}</Text>
          </View>
        </View>
      </View>

      {/* Location */}
      <View style={styles.cardLocation}>
        <View style={styles.cardLocationLeft}>
          {pharmacy.deliveryAvailable && (
            <View style={styles.deliveryBadge}>
              <Ionicons name="bicycle" size={11} color={Colors.primary} />
              <Text style={styles.deliveryBadgeText}>{pharmacy.deliveryTime}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardLocationRight}>
          <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.cardAddress} numberOfLines={1}>
            {pharmacy.district}، {pharmacy.city}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Ionicons name="medkit-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.statText}>{pharmacy.medicineCount} منتج</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="chatbubble-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.statText}>{pharmacy.reviews} تقييم</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="star" size={13} color="#F59E0B" />
          <Text style={styles.statText}>{pharmacy.rating}</Text>
        </View>
        <View style={styles.viewBtn}>
          <Text style={styles.viewBtnText}>عرض التفاصيل</Text>
          <Ionicons name="arrow-back" size={13} color={Colors.primary} />
        </View>
      </View>

      {/* Specialties */}
      {pharmacy.specialties.length > 0 && (
        <View style={styles.specialtyRow}>
          {pharmacy.specialties.slice(0, 3).map((s, i) => (
            <View key={i} style={styles.specialtyChip}>
              <Text style={styles.specialtyText}>{s}</Text>
            </View>
          ))}
          {pharmacy.specialties.length > 3 && (
            <Text style={styles.moreSpecialties}>+{pharmacy.specialties.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

function PharmacyDetailModal({ pharmacy, onClose }: { pharmacy: PharmacyProfile; onClose: () => void }) {
  const insets = useSafeAreaInsets();

  const openWhatsApp = (msg?: string) => {
    const text = msg ?? `مرحباً صيدلية ${pharmacy.nameAr}، أريد الاستفسار عن الأدوية المتوفرة`;
    Linking.openURL(`https://wa.me/${pharmacy.whatsapp}?text=${encodeURIComponent(text)}`);
  };

  const callPharmacy = () => Linking.openURL(`tel:${pharmacy.phone}`);

  const openMap = () => Linking.openURL(pharmacy.mapUrl);

  const sendEmail = () => {
    if (pharmacy.email) Linking.openURL(`mailto:${pharmacy.email}`);
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.detailModal, { paddingTop: insets.top + 16 }]}>
        {/* Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle}>تفاصيل الصيدلية</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailBody}>
          {/* Hero */}
          <View style={[styles.detailHero, { backgroundColor: pharmacy.color + "15" }]}>
            <View style={[styles.detailHeroIcon, { backgroundColor: pharmacy.color + "25" }]}>
              <Ionicons name="storefront" size={52} color={pharmacy.color} />
            </View>
            {pharmacy.plan === "premium" && (
              <View style={styles.detailPremiumBadge}>
                <Ionicons name="star" size={11} color="#F59E0B" />
                <Text style={styles.detailPremiumText}>صيدلية مميّزة</Text>
              </View>
            )}
            <Text style={styles.detailName}>{pharmacy.name}</Text>
            <Text style={styles.detailNameAr}>{pharmacy.nameAr}</Text>
            <View style={styles.detailRatingRow}>
              <Text style={styles.detailReviews}>({pharmacy.reviews} تقييم)</Text>
              <Text style={styles.detailRating}>⭐ {pharmacy.rating}</Text>
            </View>
          </View>

          {/* Status */}
          <View style={[styles.statusCard, { borderColor: pharmacy.isOpen ? Colors.success + "60" : Colors.error + "60" }]}>
            <View style={[styles.statusIndicator, { backgroundColor: pharmacy.isOpen ? Colors.success : Colors.error }]}>
              <Ionicons name={pharmacy.isOpen ? "checkmark" : "close"} size={14} color="#fff" />
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusLabel, { color: pharmacy.isOpen ? Colors.success : Colors.error }]}>
                {pharmacy.isOpen ? "مفتوح الآن" : "مغلق حالياً"}
              </Text>
              <Text style={styles.statusDetail}>
                {pharmacy.isOpen ? `يُغلق الساعة ${pharmacy.openUntil}` : `يفتح ${pharmacy.openUntil}`}
              </Text>
            </View>
            <View style={styles.statusRight}>
              <Text style={styles.statusHours}>{pharmacy.workingHours}</Text>
              <Text style={styles.statusDays}>{pharmacy.workingDays}</Text>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>الموقع الجغرافي</Text>
            </View>

            <Text style={styles.addressFull}>{pharmacy.address}</Text>

            <View style={styles.coordRow}>
              <Text style={styles.coordText}>
                {pharmacy.lat.toFixed(4)}°N, {pharmacy.lng.toFixed(4)}°E
              </Text>
              <Ionicons name="navigate" size={12} color={Colors.textMuted} />
            </View>

            {/* Map Placeholder */}
            <TouchableOpacity style={styles.mapPlaceholder} onPress={openMap}>
              <View style={styles.mapGrid}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <View key={i} style={styles.mapCell} />
                ))}
              </View>
              <View style={styles.mapPin}>
                <Ionicons name="location" size={32} color={Colors.error} />
              </View>
              <View style={styles.mapOverlay}>
                <Ionicons name="map" size={18} color="#fff" />
                <Text style={styles.mapOverlayText}>افتح في خرائط جوجل</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.openMapBtn} onPress={openMap}>
              <Ionicons name="navigate-outline" size={18} color={Colors.primary} />
              <Text style={styles.openMapBtnText}>الحصول على الاتجاهات</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Methods */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>طرق التواصل</Text>
            </View>

            <TouchableOpacity style={styles.contactRow} onPress={() => openWhatsApp()}>
              <View style={styles.contactRowRight}>
                <Text style={styles.contactRowTitle}>واتساب</Text>
                <Text style={styles.contactRowSub}>تحدّث مع الصيدلي مباشرةً</Text>
              </View>
              <View style={[styles.contactRowIcon, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="logo-whatsapp" size={26} color="#25D366" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => openWhatsApp(`مرحباً، أريد الاستفسار عن الأدوية المتوفرة في ${pharmacy.nameAr} وأسعارها`)}
            >
              <View style={styles.contactRowRight}>
                <Text style={styles.contactRowTitle}>استفسار عن الأدوية</Text>
                <Text style={styles.contactRowSub}>رسالة جاهزة للإرسال</Text>
              </View>
              <View style={[styles.contactRowIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="chatbubble-ellipses" size={24} color={Colors.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactRow} onPress={callPharmacy}>
              <View style={styles.contactRowRight}>
                <Text style={styles.contactRowTitle}>مكالمة هاتفية</Text>
                <Text style={styles.contactRowSub}>{pharmacy.phone}</Text>
              </View>
              <View style={[styles.contactRowIcon, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="call" size={24} color="#2563EB" />
              </View>
            </TouchableOpacity>

            {pharmacy.email && (
              <TouchableOpacity style={[styles.contactRow, { borderBottomWidth: 0 }]} onPress={sendEmail}>
                <View style={styles.contactRowRight}>
                  <Text style={styles.contactRowTitle}>البريد الإلكتروني</Text>
                  <Text style={styles.contactRowSub}>{pharmacy.email}</Text>
                </View>
                <View style={[styles.contactRowIcon, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="mail" size={24} color="#D97706" />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Info Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>معلومات الصيدلية</Text>
            </View>

            <View style={styles.infoGrid}>
              <InfoItem icon="medkit-outline" label="عدد المنتجات" value={`${pharmacy.medicineCount} منتج`} />
              <InfoItem
                icon={pharmacy.deliveryAvailable ? "bicycle" : "close-circle-outline"}
                label="التوصيل"
                value={pharmacy.deliveryAvailable ? pharmacy.deliveryTime! : "غير متاح"}
                color={pharmacy.deliveryAvailable ? Colors.success : Colors.error}
              />
              {pharmacy.minOrder && (
                <InfoItem icon="cash-outline" label="الحد الأدنى للطلب" value={`${pharmacy.minOrder.toLocaleString()} د.ع`} />
              )}
              <InfoItem icon="time-outline" label="ساعات العمل" value={pharmacy.workingHours} />
              <InfoItem icon="calendar-outline" label="أيام العمل" value={pharmacy.workingDays} />
              <InfoItem
                icon="ribbon-outline"
                label="خطة الاشتراك"
                value={pharmacy.plan === "premium" ? "مميّز" : pharmacy.plan === "standard" ? "أساسي" : "مجاني"}
              />
            </View>
          </View>

          {/* Specialties */}
          {pharmacy.specialties.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sparkles" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>التخصصات</Text>
              </View>
              <View style={styles.specialtyGrid}>
                {pharmacy.specialties.map((s, i) => (
                  <View key={i} style={styles.specialtyFullChip}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <Text style={styles.specialtyFullText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Badges */}
          {pharmacy.badges.length > 0 && (
            <View style={styles.badgesRow}>
              {pharmacy.badges.map((b, i) => (
                <View key={i} style={styles.badgeChip}>
                  <Ionicons name="medal-outline" size={12} color="#F59E0B" />
                  <Text style={styles.badgeChipText}>{b}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Quick Action Buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: "#25D366" }]}
              onPress={() => openWhatsApp()}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              <Text style={styles.quickBtnText}>واتساب</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: "#2563EB" }]}
              onPress={callPharmacy}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.quickBtnText}>اتصال</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: Colors.error }]}
              onPress={openMap}
            >
              <Ionicons name="location" size={20} color="#fff" />
              <Text style={styles.quickBtnText}>الموقع</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function InfoItem({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoItemRight}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, color ? { color } : {}]}>{value}</Text>
      </View>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={18} color={Colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.surface, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 12,
  },
  titleWrap: { flex: 1, alignItems: "flex-end", marginRight: 10 },
  title: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  filterIconBtn: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: Colors.surfaceAlt, alignItems: "center", justifyContent: "center",
  },
  filterIconBtnActive: { backgroundColor: Colors.primaryLight },

  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surfaceAlt, borderRadius: 13,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 4,
    marginBottom: 10,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary },

  sortRow: { gap: 8, paddingBottom: 10, paddingTop: 2 },
  sortChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: Colors.surfaceAlt, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  sortChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortChipText: { fontSize: 12, fontWeight: "600", color: Colors.textMuted },
  sortChipTextActive: { color: "#fff" },

  filtersPanel: { paddingBottom: 10, gap: 10 },
  toggleFilters: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  toggleChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceAlt,
  },
  toggleChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  toggleChipText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  toggleChipTextActive: { color: Colors.primary },
  toggleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  toggleDotActive: { backgroundColor: Colors.primary },

  cityRow: { gap: 8, paddingBottom: 4 },
  cityChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surfaceAlt, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  cityChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  cityChipText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  cityChipTextActive: { color: "#fff" },

  list: { padding: 16, gap: 14, paddingBottom: 100 },

  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    padding: 16, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  cardTop: { flexDirection: "column", gap: 10 },
  cardHeaderRight: { flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "flex-end" },
  cardIconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cardNames: { alignItems: "flex-end" },
  cardName: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  cardNameAr: { fontSize: 13, fontWeight: "500", color: Colors.textSecondary, marginTop: 2 },
  cardBadges: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end" },
  premiumBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FEF3C7", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: "#F59E0B40",
  },
  premiumBadgeText: { fontSize: 10, fontWeight: "700", color: "#92400E" },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 11, fontWeight: "600" },

  cardLocation: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardLocationRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardLocationLeft: {},
  cardAddress: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  deliveryBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.primaryLight, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  deliveryBadgeText: { fontSize: 11, fontWeight: "600", color: Colors.primary },

  cardStats: { flexDirection: "row", alignItems: "center", gap: 8 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, color: Colors.textMuted, fontWeight: "500" },
  statDivider: { width: 1, height: 12, backgroundColor: Colors.border },
  viewBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginLeft: "auto",
  },
  viewBtnText: { fontSize: 12, color: Colors.primary, fontWeight: "700" },

  specialtyRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },
  specialtyChip: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  specialtyText: { fontSize: 11, color: Colors.textSecondary, fontWeight: "500" },
  moreSpecialties: { fontSize: 11, color: Colors.textMuted, alignSelf: "center" },

  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: "700", color: Colors.textSecondary },
  emptySubText: { fontSize: 14, color: Colors.textMuted },

  detailModal: { flex: 1, backgroundColor: Colors.surface },
  detailHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  detailHeaderTitle: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceAlt, alignItems: "center", justifyContent: "center",
  },
  detailBody: { padding: 20, gap: 16, paddingBottom: 60 },

  detailHero: {
    alignItems: "center", borderRadius: 20, padding: 24, gap: 8,
  },
  detailHeroIcon: {
    width: 88, height: 88, borderRadius: 24,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  detailPremiumBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#FEF3C7", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  detailPremiumText: { fontSize: 11, fontWeight: "700", color: "#92400E" },
  detailName: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary },
  detailNameAr: { fontSize: 15, color: Colors.textSecondary },
  detailRatingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  detailRating: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  detailReviews: { fontSize: 13, color: Colors.textMuted },

  statusCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.background, borderRadius: 14, padding: 14,
    borderWidth: 1.5,
  },
  statusIndicator: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 14, fontWeight: "700" },
  statusDetail: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusRight: { alignItems: "flex-end" },
  statusHours: { fontSize: 12, fontWeight: "600", color: Colors.textPrimary, textAlign: "right" },
  statusDays: { fontSize: 11, color: Colors.textMuted, marginTop: 2, textAlign: "right" },

  sectionCard: {
    backgroundColor: Colors.background, borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },

  addressFull: { fontSize: 14, color: Colors.textSecondary, textAlign: "right", lineHeight: 22 },
  coordRow: {
    flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "flex-end",
    backgroundColor: Colors.surfaceAlt, borderRadius: 10, padding: 8,
  },
  coordText: { fontSize: 12, fontFamily: "monospace", color: Colors.textMuted },

  mapPlaceholder: {
    height: 160, borderRadius: 14, overflow: "hidden",
    backgroundColor: "#E8F0FE", alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  mapGrid: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: "row", flexWrap: "wrap",
  },
  mapCell: {
    width: "33.33%", height: "33.33%",
    borderWidth: 0.5, borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "#E8F0FE",
  },
  mapPin: {
    position: "absolute",
    alignItems: "center", justifyContent: "center",
  },
  mapOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.5)", paddingVertical: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  mapOverlayText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  openMapBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.primaryLight, borderRadius: 12, paddingVertical: 12,
  },
  openMapBtnText: { fontSize: 14, fontWeight: "700", color: Colors.primary },

  contactRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  contactRowIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  contactRowRight: { flex: 1, alignItems: "flex-end" },
  contactRowTitle: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  contactRowSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  infoGrid: { gap: 0 },
  infoItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  infoIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center",
  },
  infoItemRight: { flex: 1, alignItems: "flex-end" },
  infoLabel: { fontSize: 12, color: Colors.textMuted },
  infoValue: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, marginTop: 2 },

  specialtyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" },
  specialtyFullChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.successLight, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  specialtyFullText: { fontSize: 13, fontWeight: "600", color: Colors.success },

  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" },
  badgeChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#FEF3C7", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#F59E0B40",
  },
  badgeChipText: { fontSize: 12, fontWeight: "700", color: "#92400E" },

  quickActions: { flexDirection: "row", gap: 10 },
  quickBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 14, paddingVertical: 14,
  },
  quickBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});

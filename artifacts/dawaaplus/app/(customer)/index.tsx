import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { CATEGORIES, SAMPLE_MEDICINES, Medicine } from "@/data/sampleData";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem, isInCart, totalItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const firstName = user?.name?.split(" ")[0] ?? "عزيزي";
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filtered = selectedCategory === "all"
    ? SAMPLE_MEDICINES
    : SAMPLE_MEDICINES.filter(m => m.categoryId === selectedCategory);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/(customer)/cart")}>
            <Ionicons name="cart-outline" size={22} color={Colors.textPrimary} />
            {totalItems > 0 && <View style={styles.cartDot} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.greeting}>أهلاً، {firstName} 👋</Text>
          <Text style={styles.subGreeting}>تسوّق الأدوية بثقة وسهولة</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/(customer)/browse")}
        >
          <Text style={styles.searchPlaceholder}>ابحث عن دواء أو منتج...</Text>
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Promo Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <TouchableOpacity style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>تسوق الآن</Text>
            </TouchableOpacity>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>SUGAR20</Text>
            </View>
            <Text style={styles.bannerSub}>استخدم كود الخصم</Text>
            <Text style={styles.bannerTitle}>خصم 20%{"\n"}على مستلزمات السكر</Text>
            <Text style={styles.bannerEmoji}>🎁</Text>
          </View>
          <View style={styles.bannerDeco}>
            <Ionicons name="medkit" size={80} color="rgba(255,255,255,0.15)" />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>عرض الكل</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>الأقسام</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, selectedCategory === cat.id && styles.catPillActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={selectedCategory === cat.id ? "#fff" : cat.color}
                />
                <Text style={[styles.catText, selectedCategory === cat.id && styles.catTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>عرض الكل</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>عروض اليوم</Text>
          </View>
          <View style={styles.grid}>
            {filtered.map(med => (
              <MedicineCard
                key={med.id}
                medicine={med}
                inCart={isInCart(med.id)}
                onAdd={() => addItem({
                  medicineId: med.id,
                  name: med.name,
                  brand: med.brand,
                  price: med.price,
                  pharmacyId: med.pharmacyId,
                  pharmacyName: med.pharmacyName,
                  requiresPrescription: med.requiresPrescription,
                  color: med.color,
                })}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MedicineCard({ medicine, inCart, onAdd }: { medicine: Medicine; inCart: boolean; onAdd: () => void }) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardImage, { backgroundColor: medicine.color + "15" }]}>
        <Ionicons name="medkit" size={36} color={medicine.color} />
        {medicine.requiresPrescription && (
          <View style={styles.rxBadge}>
            <Text style={styles.rxText}>Rx</Text>
          </View>
        )}
        {medicine.originalPrice && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              -{Math.round((1 - medicine.price / medicine.originalPrice) * 100)}%
            </Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>{medicine.name}</Text>
        <Text style={styles.cardBrand}>{medicine.brand}</Text>
        <View style={styles.cardRating}>
          <Text style={styles.cardReviews}>({medicine.reviews})</Text>
          <Text style={styles.cardStar}>⭐ {medicine.rating}</Text>
        </View>
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[styles.addBtn, inCart && styles.addBtnDone]}
            onPress={onAdd}
            disabled={inCart}
          >
            <Ionicons name={inCart ? "checkmark" : "add"} size={16} color="#fff" />
          </TouchableOpacity>
          <View>
            {medicine.originalPrice && (
              <Text style={styles.originalPrice}>{medicine.originalPrice.toFixed(2)} ر.س</Text>
            )}
            <Text style={styles.cardPrice}>{medicine.price.toFixed(2)} ر.س</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  greeting: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  subGreeting: { fontSize: 13, color: Colors.textSecondary, textAlign: "right", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cartDot: {
    position: "absolute", top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error,
    borderWidth: 1.5, borderColor: Colors.surface,
  },
  searchBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 14,
    marginHorizontal: 20, marginVertical: 12,
    paddingLeft: 16, paddingRight: 4, paddingVertical: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: Colors.textMuted, textAlign: "right" },
  searchIcon: {
    width: 40, height: 40, borderRadius: 11,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
  },
  banner: {
    marginHorizontal: 20, borderRadius: 20, overflow: "hidden",
    backgroundColor: Colors.primary, marginBottom: 8,
  },
  bannerContent: { padding: 20, zIndex: 1 },
  bannerDeco: { position: "absolute", right: -10, bottom: -10 },
  bannerEmoji: { fontSize: 28, marginBottom: 4 },
  bannerTitle: { fontSize: 20, fontWeight: "800", color: "#fff", textAlign: "right", lineHeight: 26, marginBottom: 6 },
  bannerSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", textAlign: "right", marginBottom: 6 },
  bannerBadge: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6,
  },
  bannerBadgeText: { fontSize: 12, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  bannerBtn: {
    alignSelf: "flex-end",
    backgroundColor: Colors.accent, borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 16,
  },
  bannerBtnText: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary },
  section: { marginTop: 16, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  sectionMore: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  catList: { paddingRight: 4, gap: 8, paddingBottom: 4 },
  catPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  catPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  catTextActive: { color: "#fff" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "47.5%",
    backgroundColor: Colors.surface, borderRadius: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    overflow: "hidden",
  },
  cardImage: {
    height: 100, alignItems: "center", justifyContent: "center",
  },
  rxBadge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: Colors.primary, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  rxText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  discountBadge: {
    position: "absolute", top: 8, right: 8,
    backgroundColor: Colors.error, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, textAlign: "right", marginBottom: 2, lineHeight: 18 },
  cardBrand: { fontSize: 11, color: Colors.textMuted, textAlign: "right", marginBottom: 4 },
  cardRating: { flexDirection: "row", justifyContent: "flex-end", gap: 4, marginBottom: 8 },
  cardStar: { fontSize: 11, color: Colors.textSecondary },
  cardReviews: { fontSize: 11, color: Colors.textMuted },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardPrice: { fontSize: 14, fontWeight: "800", color: Colors.primary, textAlign: "right" },
  originalPrice: { fontSize: 11, color: Colors.textMuted, textDecorationLine: "line-through", textAlign: "right" },
  addBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
  },
  addBtnDone: { backgroundColor: Colors.success },
});

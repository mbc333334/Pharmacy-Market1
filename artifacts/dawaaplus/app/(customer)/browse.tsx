import { Ionicons } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Platform, Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useCart } from "@/contexts/CartContext";
import { CATEGORIES, SAMPLE_MEDICINES, Medicine } from "@/data/sampleData";

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const { addItem, isInCart } = useCart();
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  const filtered = useMemo(() => {
    return SAMPLE_MEDICINES.filter(m => {
      const matchQuery = !query || m.name.includes(query) || m.brand.includes(query);
      const matchCat = selectedCat === "all" || m.categoryId === selectedCat;
      return matchQuery && matchCat;
    });
  }, [query, selectedCat]);

  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.title}>تصفح الأدوية</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث بالاسم أو العلامة التجارية..."
              value={query}
              onChangeText={setQuery}
              textAlign="right"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="search"
            />
            <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginHorizontal: 8 }} />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={c => c.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[styles.catChip, selectedCat === cat.id && styles.catChipActive]}
              onPress={() => setSelectedCat(cat.id)}
            >
              <Text style={[styles.catText, selectedCat === cat.id && styles.catTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.resultCount}>{filtered.length} منتج متاح</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MedicineRow
            medicine={item}
            inCart={isInCart(item.id)}
            onAdd={() => addItem({
              medicineId: item.id,
              name: item.name,
              brand: item.brand,
              price: item.price,
              pharmacyId: item.pharmacyId,
              pharmacyName: item.pharmacyName,
              requiresPrescription: item.requiresPrescription,
              color: item.color,
            })}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>لم يتم العثور على نتائج</Text>
            <Text style={styles.emptySubText}>جرّب كلمة بحث أخرى</Text>
          </View>
        )}
      />
    </View>
  );
}

function MedicineRow({ medicine, inCart, onAdd }: { medicine: Medicine; inCart: boolean; onAdd: () => void }) {
  const openWhatsApp = () => {
    const msg = encodeURIComponent(`مرحباً، أريد الاستفسار عن ${medicine.name} - ${medicine.brand}`);
    Linking.openURL(`https://wa.me/9647701234567?text=${msg}`);
  };

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <TouchableOpacity
          style={[styles.addBtn, inCart && styles.addBtnDone]}
          onPress={onAdd}
          disabled={inCart}
        >
          <Ionicons name={inCart ? "checkmark" : "add"} size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.whatsappBtn} onPress={openWhatsApp}>
          <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
        </TouchableOpacity>
        <View style={styles.priceCol}>
          <Text style={styles.rowPrice}>{medicine.price.toFixed(2)} د.ع</Text>
          {medicine.originalPrice && (
            <Text style={styles.originalPrice}>{medicine.originalPrice.toFixed(2)}</Text>
          )}
        </View>
      </View>

      <View style={styles.rowContent}>
        <View style={styles.rowNameRow}>
          {medicine.requiresPrescription && (
            <View style={styles.rxBadge}><Text style={styles.rxText}>Rx</Text></View>
          )}
          <Text style={styles.rowName} numberOfLines={1}>{medicine.name}</Text>
        </View>
        <Text style={styles.rowBrand}>{medicine.brand} • {medicine.pharmacyName}</Text>
        <Text style={styles.rowDesc} numberOfLines={2}>{medicine.description}</Text>
        <View style={styles.rowMeta}>
          <View style={[styles.stockBadge, { backgroundColor: medicine.stock > 20 ? Colors.successLight : Colors.warningLight }]}>
            <Text style={[styles.stockText, { color: medicine.stock > 20 ? Colors.success : Colors.warning }]}>
              {medicine.stock > 20 ? "متوفر" : `باقي ${medicine.stock}`}
            </Text>
          </View>
          <Text style={styles.rowRating}>⭐ {medicine.rating} ({medicine.reviews})</Text>
        </View>
      </View>

      <View style={[styles.rowIcon, { backgroundColor: medicine.color + "18" }]}>
        <Ionicons name="medkit" size={28} color={medicine.color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  title: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 12 },
  searchRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  searchWrap: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 4,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary },
  filterBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center",
  },
  catList: { paddingBottom: 8, gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surfaceAlt, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  catTextActive: { color: "#fff" },
  resultCount: { fontSize: 12, color: Colors.textMuted, textAlign: "right", paddingBottom: 8, paddingTop: 4 },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 14, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  rowIcon: { width: 60, height: 60, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rowContent: { flex: 1 },
  rowNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 2 },
  rowName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right", flex: 1 },
  rowBrand: { fontSize: 12, color: Colors.textMuted, textAlign: "right", marginBottom: 4 },
  rowDesc: { fontSize: 12, color: Colors.textSecondary, textAlign: "right", lineHeight: 18, marginBottom: 6 },
  rowMeta: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  stockBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  stockText: { fontSize: 11, fontWeight: "600" },
  rowRating: { fontSize: 11, color: Colors.textSecondary },
  rxBadge: { backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  rxText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  rowLeft: { alignItems: "center", gap: 8 },
  priceCol: { alignItems: "center" },
  rowPrice: { fontSize: 14, fontWeight: "800", color: Colors.primary, textAlign: "center" },
  originalPrice: { fontSize: 10, color: Colors.textMuted, textDecorationLine: "line-through" },
  addBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
  },
  addBtnDone: { backgroundColor: Colors.success },
  whatsappBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "#E8F5E9", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#25D36630",
  },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: "700", color: Colors.textSecondary },
  emptySubText: { fontSize: 14, color: Colors.textMuted },
});

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useTranslation } from "@/i18n";

const INVENTORY = [
  { id: "1", name: "ئەسپرین 100mg", nameEn: "Aspirin 100mg", category: "مسكنات", stock: 500, minStock: 50, price: 2500, unit: "حبة", expiryDate: "2026-06" },
  { id: "2", name: "ئاموكسيسيلين 500mg", nameEn: "Amoxicillin 500mg", category: "مضادات حيوية", stock: 200, minStock: 30, price: 8000, unit: "كبسولة", expiryDate: "2025-12" },
  { id: "3", name: "باراسيتامول 500mg", nameEn: "Paracetamol 500mg", category: "مسكنات", stock: 1000, minStock: 100, price: 1500, unit: "حبة", expiryDate: "2026-08" },
  { id: "4", name: "ئۆميپرازول 20mg", nameEn: "Omeprazole 20mg", category: "الجهاز الهضمي", stock: 15, minStock: 20, price: 5000, unit: "كبسولة", expiryDate: "2025-11" },
  { id: "5", name: "ئیبوبروفێن 400mg", nameEn: "Ibuprofen 400mg", category: "مسكنات", stock: 350, minStock: 40, price: 3000, unit: "حبة", expiryDate: "2026-03" },
  { id: "6", name: "مێتفۆرمین 500mg", nameEn: "Metformin 500mg", category: "السكري", stock: 8, minStock: 25, price: 4500, unit: "حبة", expiryDate: "2025-10" },
];

export default function WarehouseInventory() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [search, setSearch] = useState("");

  const filtered = INVENTORY.filter(item =>
    item.name.includes(search) || item.nameEn.toLowerCase().includes(search.toLowerCase()) || item.category.includes(search)
  );
  const lowStock = INVENTORY.filter(i => i.stock < i.minStock).length;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("myInventory")}</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {lowStock > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={18} color="#DD6B20" />
          <Text style={styles.alertText}>{lowStock} {t("lowStock")}</Text>
        </View>
      )}

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("search")}
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        {filtered.map((item, idx) => {
          const isLow = item.stock < item.minStock;
          return (
            <TouchableOpacity key={item.id} style={styles.itemCard}>
              <View style={styles.itemRight}>
                <View style={[styles.categoryBadge, { backgroundColor: isLow ? Colors.errorLight : "#E8F5E9" }]}>
                  <Text style={[styles.categoryText, { color: isLow ? Colors.error : "#0D7A54" }]}>{item.category}</Text>
                </View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemNameEn}>{item.nameEn}</Text>
                <Text style={styles.itemExpiry}>⏱ {item.expiryDate}</Text>
              </View>
              <View style={styles.itemLeft}>
                <View style={[styles.stockBadge, { backgroundColor: isLow ? Colors.errorLight : Colors.primaryLight }]}>
                  <Text style={[styles.stockCount, { color: isLow ? Colors.error : Colors.primary }]}>{item.stock}</Text>
                  <Text style={[styles.stockUnit, { color: isLow ? Colors.error : Colors.primary }]}>{item.unit}</Text>
                </View>
                <Text style={styles.itemPrice}>{item.price.toLocaleString()} د.ع</Text>
                {isLow && (
                  <View style={styles.lowBadge}>
                    <Ionicons name="warning-outline" size={12} color={Colors.error} />
                    <Text style={styles.lowText}>{t("criticalStock")}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  alertBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FFF3E0", paddingHorizontal: 16, paddingVertical: 10,
  },
  alertText: { fontSize: 13, color: "#DD6B20", fontWeight: "600" },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surface, margin: 16, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, textAlign: "right" },
  itemCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, marginHorizontal: 16, marginBottom: 10,
    borderRadius: 14, padding: 14, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  itemRight: { flex: 1, gap: 3 },
  itemLeft: { alignItems: "center", gap: 6 },
  categoryBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-end" },
  categoryText: { fontSize: 10, fontWeight: "700" },
  itemName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  itemNameEn: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  itemExpiry: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  stockBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignItems: "center" },
  stockCount: { fontSize: 20, fontWeight: "800" },
  stockUnit: { fontSize: 10 },
  itemPrice: { fontSize: 12, fontWeight: "700", color: Colors.textSecondary },
  lowBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  lowText: { fontSize: 9, color: Colors.error, fontWeight: "700" },
});

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView, Platform, Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { SAMPLE_MEDICINES, Medicine, CATEGORIES } from "@/data/sampleData";

export default function PharmacyMedicinesScreen() {
  const insets = useSafeAreaInsets();
  const [medicines, setMedicines] = useState<Medicine[]>(SAMPLE_MEDICINES.slice(0, 3));
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filtered = medicines.filter(m => !query || m.name.includes(query) || m.brand.includes(query));

  const handleAddMedicine = (med: Partial<Medicine>) => {
    const newMed: Medicine = {
      id: Date.now().toString(),
      name: med.name ?? "",
      brand: med.brand ?? "",
      categoryId: med.categoryId ?? "1",
      category: med.category ?? "مسكنات",
      price: med.price ?? 0,
      stock: med.stock ?? 0,
      requiresPrescription: med.requiresPrescription ?? false,
      description: med.description ?? "",
      pharmacyId: "my-pharmacy",
      pharmacyName: "صيدليتي",
      pharmacyCity: "الرياض",
      rating: 0,
      reviews: 0,
      color: "#1A9E6E",
    };
    setMedicines(prev => [newMed, ...prev]);
    setShowAdd(false);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>{medicines.length} منتج مسجّل</Text>
        <Text style={styles.headerTitle}>أدويتي 💊</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="بحث بالاسم..."
            value={query}
            onChangeText={setQuery}
            textAlign="right"
            placeholderTextColor={Colors.textMuted}
          />
          <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginHorizontal: 8 }} />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PharmacyMedRow medicine={item} onDelete={() =>
          setMedicines(prev => prev.filter(m => m.id !== item.id))
        } />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="medkit-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>لا يوجد أدوية مسجّلة</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAdd(true)}>
              <Text style={styles.emptyBtnText}>إضافة دواء جديد</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 88 + insets.bottom + (Platform.OS === "web" ? 34 : 0) }]}
        onPress={() => setShowAdd(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Medicine Modal */}
      <AddMedicineModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAddMedicine}
      />
    </View>
  );
}

function PharmacyMedRow({ medicine, onDelete }: { medicine: Medicine; onDelete: () => void }) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Ionicons name="trash-outline" size={16} color={Colors.error} />
      </TouchableOpacity>
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          {medicine.requiresPrescription && (
            <View style={styles.rxBadge}><Text style={styles.rxText}>Rx</Text></View>
          )}
          <Text style={styles.rowName}>{medicine.name}</Text>
        </View>
        <Text style={styles.rowBrand}>{medicine.brand} • {medicine.category}</Text>
        <View style={styles.rowFooter}>
          <View style={[styles.stockBadge, medicine.stock < 10 && styles.stockLow]}>
            <Text style={[styles.stockText, medicine.stock < 10 && styles.stockTextLow]}>
              {medicine.stock} في المخزون
            </Text>
          </View>
          <Text style={styles.rowPrice}>{medicine.price.toFixed(2)} ر.س</Text>
        </View>
      </View>
      <View style={[styles.rowIcon, { backgroundColor: medicine.color + "18" }]}>
        <Ionicons name="medkit" size={28} color={medicine.color} />
      </View>
    </View>
  );
}

function AddMedicineModal({
  visible, onClose, onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Partial<Medicine>) => void;
}) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [description, setDescription] = useState("");
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [active, setActive] = useState(true);

  const handleSave = () => {
    if (!name || !price || !stock) return;
    onSave({
      name, brand,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      categoryId: category.id,
      category: category.name,
      description,
      requiresPrescription,
    });
    setName(""); setBrand(""); setPrice(""); setStock(""); setDescription("");
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modal, { paddingTop: insets.top + 16 }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>نشر</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>إضافة دواء جديد</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
          <ModalField label="اسم الدواء *" value={name} onChangeText={setName} placeholder="باراسيتامول 500mg" />
          <ModalField label="العلامة التجارية" value={brand} onChangeText={setBrand} placeholder="بانادول" />

          <Text style={styles.modalLabel}>الفئة العلاجية</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
            {CATEGORIES.slice(1).map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, cat.id === category.id && styles.catChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catChipText, cat.id === category.id && { color: "#fff" }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.rowFields}>
            <ModalField label="السعر (ر.س) *" value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" style={{ flex: 1 }} />
            <ModalField label="الكمية المتوفرة *" value={stock} onChangeText={setStock} placeholder="0" keyboardType="number-pad" style={{ flex: 1 }} />
          </View>

          <ModalField label="الوصف" value={description} onChangeText={setDescription} placeholder="الاستخدامات والتحذيرات..." multiline />

          <View style={styles.toggleRow}>
            <Switch value={requiresPrescription} onValueChange={setRequiresPrescription} trackColor={{ true: Colors.primary }} />
            <Text style={styles.toggleLabel}>يحتاج وصفة طبية (Rx)</Text>
          </View>
          <View style={styles.toggleRow}>
            <Switch value={active} onValueChange={setActive} trackColor={{ true: Colors.primary }} />
            <Text style={styles.toggleLabel}>متاح للبيع الآن</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ModalField({ label, value, onChangeText, placeholder, keyboardType, multiline, style }: any) {
  return (
    <View style={[styles.fieldGroup, style]}>
      <Text style={styles.modalLabel}>{label}</Text>
      <TextInput
        style={[styles.modalInput, multiline && { height: 80, textAlignVertical: "top" }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlign="right"
        placeholderTextColor={Colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  headerSub: { fontSize: 13, color: Colors.textMuted, textAlign: "right" },
  searchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 4,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary },
  list: { padding: 16, gap: 12, paddingBottom: 120 },
  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 14, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  rowIcon: { width: 56, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rowContent: { flex: 1 },
  rowTop: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 6, marginBottom: 2 },
  rowName: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right", flex: 1 },
  rowBrand: { fontSize: 12, color: Colors.textMuted, textAlign: "right", marginBottom: 6 },
  rowFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowPrice: { fontSize: 15, fontWeight: "800", color: Colors.primary },
  rxBadge: { backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  rxText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  stockBadge: { backgroundColor: Colors.successLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  stockLow: { backgroundColor: Colors.errorLight },
  stockText: { fontSize: 11, fontWeight: "600", color: Colors.success },
  stockTextLow: { color: Colors.error },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.errorLight, alignItems: "center", justifyContent: "center",
  },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: Colors.textMuted },
  emptyBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  emptyBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  fab: {
    position: "absolute", right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  modal: { flex: 1, backgroundColor: Colors.surface },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  saveBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  modalContent: { padding: 20, gap: 4, paddingBottom: 60 },
  fieldGroup: { marginBottom: 12 },
  modalLabel: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, textAlign: "right", marginBottom: 6 },
  modalInput: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary,
  },
  rowFields: { flexDirection: "row", gap: 12 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.surfaceAlt, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  toggleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "flex-end",
    gap: 10, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  toggleLabel: { fontSize: 15, color: Colors.textPrimary, fontWeight: "500" },
});

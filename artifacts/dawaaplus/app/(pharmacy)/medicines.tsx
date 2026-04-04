import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView, Platform, Switch, Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { SAMPLE_MEDICINES, Medicine, CATEGORIES } from "@/data/sampleData";
import BarcodeScanner, { ScannedMedicine, lookupBarcode } from "@/components/BarcodeScanner";

export default function PharmacyMedicinesScreen() {
  const insets = useSafeAreaInsets();
  const [medicines, setMedicines] = useState<Medicine[]>(SAMPLE_MEDICINES.slice(0, 3));
  const [query, setQuery] = useState("");
  const [showChooser, setShowChooser] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<Medicine> & { barcode?: string }>({});
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filtered = medicines.filter(m => !query || m.name.includes(query) || m.brand.includes(query));

  const handleAddMedicine = (med: Partial<Medicine> & { barcode?: string }) => {
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
      pharmacyCity: "هەولێر",
      rating: 0,
      reviews: 0,
      color: "#1A9E6E",
    };
    setMedicines(prev => [newMed, ...prev]);
    setShowAdd(false);
    setPrefillData({});
  };

  const handleFabPress = () => setShowChooser(true);

  const handleChooseManual = () => {
    setShowChooser(false);
    setPrefillData({});
    setShowAdd(true);
  };

  const handleChooseBarcode = () => {
    setShowChooser(false);
    setShowScanner(true);
  };

  const handleScanned = (result: ScannedMedicine) => {
    setShowScanner(false);
    setPrefillData({
      name: result.name ?? "",
      brand: result.brand ?? "",
      category: result.category ?? "",
      barcode: result.barcode,
    });
    setShowAdd(true);
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
            placeholder="بحث بالاسم أو العلامة التجارية..."
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
            <TouchableOpacity style={styles.emptyBtn} onPress={handleFabPress}>
              <Text style={styles.emptyBtnText}>إضافة دواء جديد</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 88 + insets.bottom + (Platform.OS === "web" ? 34 : 0) }]}
        onPress={handleFabPress}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Method Chooser Sheet */}
      <MethodChooser
        visible={showChooser}
        onClose={() => setShowChooser(false)}
        onManual={handleChooseManual}
        onBarcode={handleChooseBarcode}
      />

      {/* Add Medicine Form */}
      <AddMedicineModal
        visible={showAdd}
        onClose={() => { setShowAdd(false); setPrefillData({}); }}
        onSave={handleAddMedicine}
        prefill={prefillData}
      />

      {/* Barcode Scanner */}
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScanned={handleScanned}
      />
    </View>
  );
}

function MethodChooser({
  visible, onClose, onManual, onBarcode,
}: {
  visible: boolean;
  onClose: () => void;
  onManual: () => void;
  onBarcode: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.chooserOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={[styles.chooserSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.chooserHandle} />
            <Text style={styles.chooserTitle}>إضافة دواء جديد</Text>
            <Text style={styles.chooserSub}>اختر طريقة الإضافة</Text>

            <TouchableOpacity style={styles.chooserOption} onPress={onBarcode}>
              <View style={styles.chooserTextWrap}>
                <Text style={styles.chooserOptionTitle}>مسح الباركود</Text>
                <Text style={styles.chooserOptionSub}>
                  امسح الباركود على عبوة الدواء لجلب البيانات تلقائياً
                </Text>
              </View>
              <View style={[styles.chooserIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="scan" size={28} color={Colors.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.chooserOption} onPress={onManual}>
              <View style={styles.chooserTextWrap}>
                <Text style={styles.chooserOptionTitle}>إدخال يدوي</Text>
                <Text style={styles.chooserOptionSub}>
                  أدخل بيانات الدواء يدوياً: الاسم والسعر والكمية
                </Text>
              </View>
              <View style={[styles.chooserIcon, { backgroundColor: "#F0F9FF" }]}>
                <Ionicons name="create-outline" size={28} color="#0369A1" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.chooserCancel} onPress={onClose}>
              <Text style={styles.chooserCancelText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
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
          <Text style={styles.rowPrice}>{medicine.price.toFixed(0)} د.ع</Text>
        </View>
      </View>
      <View style={[styles.rowIcon, { backgroundColor: medicine.color + "18" }]}>
        <Ionicons name="medkit" size={28} color={medicine.color} />
      </View>
    </View>
  );
}

function AddMedicineModal({
  visible, onClose, onSave, prefill,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Partial<Medicine> & { barcode?: string }) => void;
  prefill: Partial<Medicine> & { barcode?: string };
}) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(prefill.name ?? "");
  const [brand, setBrand] = useState(prefill.brand ?? "");
  const [barcode, setBarcode] = useState(prefill.barcode ?? "");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState(
    prefill.category
      ? (CATEGORIES.find(c => c.name === prefill.category) ?? CATEGORIES[1])
      : CATEGORIES[1]
  );
  const [description, setDescription] = useState("");
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [active, setActive] = useState(true);
  const [showInlineScanner, setShowInlineScanner] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setName(prefill.name ?? "");
      setBrand(prefill.brand ?? "");
      setBarcode(prefill.barcode ?? "");
      setCategory(
        prefill.category
          ? (CATEGORIES.find(c => c.name === prefill.category) ?? CATEGORIES[1])
          : CATEGORIES[1]
      );
      setPrice("");
      setStock("");
      setDescription("");
      setRequiresPrescription(false);
    }
  }, [visible, prefill]);

  const resetForm = () => {
    setName(""); setBrand(""); setBarcode(""); setPrice("");
    setStock(""); setDescription(""); setRequiresPrescription(false);
    setCategory(CATEGORIES[1]);
  };

  const handleSave = () => {
    if (!name.trim() || !price || !stock) return;
    onSave({
      name: name.trim(), brand: brand.trim(), barcode,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      categoryId: category.id,
      category: category.name,
      description: description.trim(),
      requiresPrescription,
    });
    resetForm();
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleInlineScanned = (result: ScannedMedicine) => {
    setShowInlineScanner(false);
    setBarcode(result.barcode);
    if (result.name && !name) setName(result.name);
    if (result.brand && !brand) setBrand(result.brand);
    if (result.category) {
      const found = CATEGORIES.find(c => c.name === result.category);
      if (found) setCategory(found);
    }
  };

  const isValid = name.trim() && price && stock;

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { paddingTop: insets.top + 16 }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!isValid}
            >
              <Text style={styles.saveBtnText}>نشر الدواء</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>إضافة دواء جديد</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtnSmall}>
              <Ionicons name="close" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>

            {/* Barcode section */}
            <View style={styles.barcodeSection}>
              <Text style={styles.sectionLabel}>الباركود</Text>
              {barcode ? (
                <View style={styles.barcodeResult}>
                  <TouchableOpacity onPress={() => setBarcode("")} style={styles.barcodeClear}>
                    <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text style={styles.barcodeValue}>{barcode}</Text>
                    <Text style={styles.barcodeLabel}>تم الجلب عبر الماسح</Text>
                  </View>
                  <Ionicons name="barcode" size={30} color={Colors.primary} />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => setShowInlineScanner(true)}
                >
                  <Ionicons name="scan" size={20} color="#fff" />
                  <Text style={styles.scanButtonText}>مسح الباركود</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>بيانات الدواء</Text>

            <ModalField
              label="الاسم العلمي للدواء *"
              value={name}
              onChangeText={setName}
              placeholder="مثال: Paracetamol 500mg"
            />
            <ModalField
              label="العلامة التجارية"
              value={brand}
              onChangeText={setBrand}
              placeholder="مثال: بانادول"
            />

            <Text style={styles.fieldLabel}>الفئة العلاجية</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catScroll}
            >
              {CATEGORIES.slice(1).map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, cat.id === category.id && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catChipText, cat.id === category.id && { color: "#fff" }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>السعر والمخزون</Text>

            <View style={styles.rowFields}>
              <ModalField
                label="السعر (د.ع) *"
                value={price}
                onChangeText={setPrice}
                placeholder="5000"
                keyboardType="decimal-pad"
                style={{ flex: 1 }}
              />
              <ModalField
                label="الكمية المتوفرة *"
                value={stock}
                onChangeText={setStock}
                placeholder="100"
                keyboardType="number-pad"
                style={{ flex: 1 }}
              />
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>معلومات إضافية</Text>

            <ModalField
              label="الوصف والتحذيرات"
              value={description}
              onChangeText={setDescription}
              placeholder="الاستخدامات والجرعات والتحذيرات..."
              multiline
            />

            <View style={styles.toggleRow}>
              <Switch
                value={requiresPrescription}
                onValueChange={setRequiresPrescription}
                trackColor={{ true: Colors.primary }}
                thumbColor="#fff"
              />
              <View style={styles.toggleLabelWrap}>
                <Text style={styles.toggleLabel}>يحتاج وصفة طبية (Rx)</Text>
                <Text style={styles.toggleSub}>لن يُباع للعميل بدون وصفة</Text>
              </View>
            </View>

            <View style={styles.toggleRow}>
              <Switch
                value={active}
                onValueChange={setActive}
                trackColor={{ true: Colors.primary }}
                thumbColor="#fff"
              />
              <View style={styles.toggleLabelWrap}>
                <Text style={styles.toggleLabel}>متاح للبيع الآن</Text>
                <Text style={styles.toggleSub}>سيظهر في قائمة أدويتك للعملاء</Text>
              </View>
            </View>

            {!isValid && (
              <View style={styles.validationHint}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.validationText}>* الاسم والسعر والكمية حقول إلزامية</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      <BarcodeScanner
        visible={showInlineScanner}
        onClose={() => setShowInlineScanner(false)}
        onScanned={handleInlineScanned}
      />
    </>
  );
}

function ModalField({ label, value, onChangeText, placeholder, keyboardType, multiline, style }: any) {
  return (
    <View style={[styles.fieldGroup, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.modalInput, multiline && { height: 90, textAlignVertical: "top" }]}
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
  list: { padding: 16, gap: 12, paddingBottom: 140 },

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
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },

  chooserOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  chooserSheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, gap: 14,
  },
  chooserHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: "center", marginBottom: 4,
  },
  chooserTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  chooserSub: { fontSize: 13, color: Colors.textMuted, textAlign: "right", marginTop: -8 },
  chooserOption: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: Colors.background, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },
  chooserTextWrap: { flex: 1, alignItems: "flex-end" },
  chooserOptionTitle: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary },
  chooserOptionSub: { fontSize: 12, color: Colors.textMuted, textAlign: "right", lineHeight: 18, marginTop: 3 },
  chooserIcon: {
    width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center",
  },
  chooserCancel: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 14,
    paddingVertical: 14, alignItems: "center",
  },
  chooserCancelText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary },

  modal: { flex: 1, backgroundColor: Colors.surface },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  saveBtnDisabled: { backgroundColor: Colors.border },
  saveBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  closeBtnSmall: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceAlt, alignItems: "center", justifyContent: "center",
  },
  modalContent: { padding: 20, gap: 2, paddingBottom: 60 },

  sectionLabel: {
    fontSize: 13, fontWeight: "700", color: Colors.textMuted,
    textAlign: "right", marginBottom: 10, letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  barcodeSection: { gap: 8, marginBottom: 4 },
  scanButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  scanButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  barcodeResult: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.primaryLight, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.primary + "50",
  },
  barcodeClear: { padding: 2 },
  barcodeValue: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, letterSpacing: 1.5 },
  barcodeLabel: { fontSize: 11, color: Colors.primary, marginTop: 2 },

  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },

  fieldGroup: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, textAlign: "right", marginBottom: 6 },
  modalInput: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary,
  },
  catScroll: { gap: 8, paddingBottom: 12 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.surfaceAlt, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },

  rowFields: { flexDirection: "row", gap: 12 },

  toggleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "flex-end",
    gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  toggleLabelWrap: { alignItems: "flex-end" },
  toggleLabel: { fontSize: 15, color: Colors.textPrimary, fontWeight: "600" },
  toggleSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  validationHint: {
    flexDirection: "row", alignItems: "center", justifyContent: "flex-end",
    gap: 6, marginTop: 8,
  },
  validationText: { fontSize: 12, color: Colors.textMuted },
});

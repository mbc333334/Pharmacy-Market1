import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert, TextInput, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useTranslation } from "@/i18n";
import BarcodeScanner, { ScannedMedicine } from "@/components/BarcodeScanner";

type ImportTab = "barcode" | "database";
type DbType = "csv" | "api" | "mysql" | "postgres";

interface ScannedItem {
  barcode: string;
  name: string;
  brand: string;
  quantity: string;
  price: string;
  promoted: boolean;
}

const DB_TYPES: { key: DbType; icon: any; label: string; color: string }[] = [
  { key: "csv", icon: "document-text-outline", label: "CSV / Excel", color: "#0D7A54" },
  { key: "api", icon: "cloud-outline", label: "REST API", color: Colors.primary },
  { key: "mysql", icon: "server-outline", label: "MySQL", color: "#E48900" },
  { key: "postgres", icon: "layers-outline", label: "PostgreSQL", color: "#336791" },
];

export default function WarehouseImport() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [activeTab, setActiveTab] = useState<ImportTab>("barcode");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [editingItem, setEditingItem] = useState<ScannedItem | null>(null);

  const [selectedDb, setSelectedDb] = useState<DbType>("csv");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [importing, setImporting] = useState(false);
  const [promoted, setPromoted] = useState(false);

  const handleScanned = (result: ScannedMedicine) => {
    setScannerOpen(false);
    const item: ScannedItem = {
      barcode: result.barcode,
      name: result.name ?? result.barcode,
      brand: result.brand ?? "",
      quantity: "100",
      price: "5000",
      promoted: false,
    };
    setEditingItem(item);
  };

  const confirmItem = () => {
    if (!editingItem) return;
    setScannedItems(prev => {
      const exists = prev.find(i => i.barcode === editingItem.barcode);
      if (exists) return prev.map(i => i.barcode === editingItem.barcode ? editingItem : i);
      return [editingItem, ...prev];
    });
    setEditingItem(null);
  };

  const promoteAll = () => {
    setScannedItems(prev => prev.map(i => ({ ...i, promoted: true })));
    setPromoted(true);
    Alert.alert(
      "تمت الترويج ✅",
      `تم إرسال ${scannedItems.length} منتج لجميع الصيدليات المشاركة`,
    );
  };

  const handleDatabaseImport = async () => {
    setImporting(true);
    await new Promise(r => setTimeout(r, 2000));
    setImporting(false);
    const mockImported: ScannedItem[] = [
      { barcode: "5900000000001", name: "باراسیتامول 500mg", brand: "Panadol", quantity: "1000", price: "1500", promoted: false },
      { barcode: "5900000000002", name: "أموكسيسيلين 500mg", brand: "Amoxil", quantity: "500", price: "8000", promoted: false },
      { barcode: "5900000000003", name: "أسبرين 100mg", brand: "Aspirin Bayer", quantity: "800", price: "2500", promoted: false },
      { barcode: "5900000000004", name: "أوميبرازول 20mg", brand: "Omeprazole", quantity: "300", price: "5000", promoted: false },
      { barcode: "5900000000005", name: "إيبوبروفين 400mg", brand: "Advil", quantity: "600", price: "3000", promoted: false },
    ];
    setScannedItems(mockImported);
    Alert.alert("تم الاستيراد ✅", `تم استيراد ${mockImported.length} منتج بنجاح من قاعدة البيانات`);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>استيراد المنتجات</Text>
        {scannedItems.length > 0 && (
          <TouchableOpacity style={styles.promoteBtn} onPress={promoteAll}>
            <Ionicons name="megaphone-outline" size={16} color="#fff" />
            <Text style={styles.promoteBtnText}>ترويج ({scannedItems.length})</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "barcode" && styles.tabActive]}
          onPress={() => setActiveTab("barcode")}
        >
          <Ionicons name="barcode-outline" size={18} color={activeTab === "barcode" ? "#0D7A54" : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === "barcode" && styles.tabTextActive]}>باركود</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "database" && styles.tabActive]}
          onPress={() => setActiveTab("database")}
        >
          <Ionicons name="server-outline" size={18} color={activeTab === "database" ? "#0D7A54" : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === "database" && styles.tabTextActive]}>قاعدة بيانات</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        {activeTab === "barcode" ? (
          <View style={styles.section}>
            <TouchableOpacity style={styles.scanButton} onPress={() => setScannerOpen(true)}>
              <Ionicons name="scan-outline" size={36} color="#fff" />
              <Text style={styles.scanButtonText}>مسح باركود الدواء</Text>
              <Text style={styles.scanButtonSub}>وجّه الكاميرا نحو العبوة</Text>
            </TouchableOpacity>

            {editingItem && (
              <View style={styles.editCard}>
                <Text style={styles.editCardTitle}>تفاصيل الدواء المُسحوب</Text>
                <View style={styles.editRow}>
                  <Text style={styles.editLabel}>الباركود</Text>
                  <Text style={styles.editValue}>{editingItem.barcode}</Text>
                </View>
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>اسم الدواء</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editingItem.name}
                    onChangeText={v => setEditingItem(e => e ? { ...e, name: v } : e)}
                    textAlign="right"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>العلامة التجارية</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editingItem.brand}
                    onChangeText={v => setEditingItem(e => e ? { ...e, brand: v } : e)}
                    textAlign="right"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <View style={styles.editRow}>
                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>السعر (د.ع)</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editingItem.price}
                      onChangeText={v => setEditingItem(e => e ? { ...e, price: v } : e)}
                      keyboardType="numeric"
                      textAlign="right"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>الكمية</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editingItem.quantity}
                      onChangeText={v => setEditingItem(e => e ? { ...e, quantity: v } : e)}
                      keyboardType="numeric"
                      textAlign="right"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingItem(null)}>
                    <Text style={styles.cancelBtnText}>إلغاء</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={confirmItem}>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.confirmBtnText}>إضافة للمذخر</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {scannedItems.length > 0 && (
              <View style={styles.itemsList}>
                <View style={styles.itemsHeader}>
                  <TouchableOpacity
                    style={[styles.promoteAllBtn, promoted && styles.promoteAllBtnDone]}
                    onPress={promoteAll}
                    disabled={promoted}
                  >
                    <Ionicons name="megaphone-outline" size={16} color={promoted ? Colors.success : "#fff"} />
                    <Text style={[styles.promoteAllBtnText, promoted && { color: Colors.success }]}>
                      {promoted ? "تمت الترويج ✓" : "ترويج للصيدليات"}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.itemsTitle}>{scannedItems.length} منتج مضاف</Text>
                </View>
                {scannedItems.map(item => (
                  <View key={item.barcode} style={styles.itemCard}>
                    <View style={styles.itemRight}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemBrand}>{item.brand} • {item.barcode}</Text>
                    </View>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemPrice}>{parseInt(item.price).toLocaleString()} د.ع</Text>
                      <Text style={styles.itemQty}>كمية: {item.quantity}</Text>
                      {item.promoted && (
                        <View style={styles.promotedBadge}>
                          <Text style={styles.promotedBadgeText}>مُروَّج ✓</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اختر نوع قاعدة البيانات</Text>
            <View style={styles.dbGrid}>
              {DB_TYPES.map(db => (
                <TouchableOpacity
                  key={db.key}
                  style={[styles.dbCard, selectedDb === db.key && { borderColor: db.color, backgroundColor: db.color + "12" }]}
                  onPress={() => setSelectedDb(db.key)}
                >
                  <Ionicons name={db.icon} size={28} color={selectedDb === db.key ? db.color : Colors.textMuted} />
                  <Text style={[styles.dbLabel, selectedDb === db.key && { color: db.color }]}>{db.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {(selectedDb === "api") && (
              <View style={styles.connectionForm}>
                <Text style={styles.formTitle}>إعدادات الاتصال بـ API</Text>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>رابط API</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="https://api.example.com/medicines"
                    value={apiUrl}
                    onChangeText={setApiUrl}
                    textAlign="right"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>مفتاح API</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Bearer eyJ..."
                    value={apiKey}
                    onChangeText={setApiKey}
                    textAlign="right"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry
                  />
                </View>
              </View>
            )}

            {(selectedDb === "mysql" || selectedDb === "postgres") && (
              <View style={styles.connectionForm}>
                <Text style={styles.formTitle}>إعدادات قاعدة البيانات</Text>
                {["المضيف (Host)", "المنفذ (Port)", "اسم قاعدة البيانات", "اسم المستخدم", "كلمة المرور"].map(field => (
                  <View key={field} style={styles.formField}>
                    <Text style={styles.formLabel}>{field}</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder={field}
                      textAlign="right"
                      placeholderTextColor={Colors.textMuted}
                      secureTextEntry={field === "كلمة المرور"}
                    />
                  </View>
                ))}
              </View>
            )}

            {selectedDb === "csv" && (
              <View style={styles.csvBox}>
                <Ionicons name="cloud-upload-outline" size={48} color="#0D7A54" />
                <Text style={styles.csvTitle}>رفع ملف CSV أو Excel</Text>
                <Text style={styles.csvSub}>اسحب الملف هنا أو اضغط لاختيار ملف من جهازك</Text>
                <TouchableOpacity style={styles.csvBtn} onPress={handleDatabaseImport}>
                  <Ionicons name="folder-open-outline" size={18} color="#fff" />
                  <Text style={styles.csvBtnText}>اختيار ملف</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.importBtn, importing && styles.importBtnDisabled]}
              onPress={handleDatabaseImport}
              disabled={importing}
            >
              {importing ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.importBtnText}>جارٍ الاستيراد...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-download-outline" size={20} color="#fff" />
                  <Text style={styles.importBtnText}>استيراد الآن</Text>
                </>
              )}
            </TouchableOpacity>

            {scannedItems.length > 0 && (
              <View style={styles.itemsList}>
                <View style={styles.itemsHeader}>
                  <TouchableOpacity
                    style={[styles.promoteAllBtn, promoted && styles.promoteAllBtnDone]}
                    onPress={promoteAll}
                    disabled={promoted}
                  >
                    <Ionicons name="megaphone-outline" size={16} color={promoted ? Colors.success : "#fff"} />
                    <Text style={[styles.promoteAllBtnText, promoted && { color: Colors.success }]}>
                      {promoted ? "تمت الترويج ✓" : "ترويج للصيدليات"}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.itemsTitle}>{scannedItems.length} منتج مستورد</Text>
                </View>
                {scannedItems.map(item => (
                  <View key={item.barcode} style={styles.itemCard}>
                    <View style={styles.itemRight}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemBrand}>{item.brand}</Text>
                    </View>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemPrice}>{parseInt(item.price).toLocaleString()} د.ع</Text>
                      <Text style={styles.itemQty}>كمية: {item.quantity}</Text>
                      {item.promoted && (
                        <View style={styles.promotedBadge}>
                          <Text style={styles.promotedBadgeText}>مُروَّج ✓</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <BarcodeScanner
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanned={handleScanned}
      />
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
  promoteBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  promoteBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  tabs: {
    flexDirection: "row", backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14,
    borderBottomWidth: 3, borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#0D7A54" },
  tabText: { fontSize: 14, fontWeight: "600", color: Colors.textMuted },
  tabTextActive: { color: "#0D7A54", fontWeight: "700" },
  section: { padding: 16, gap: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  scanButton: {
    backgroundColor: "#0D7A54", borderRadius: 20,
    padding: 32, alignItems: "center", gap: 10,
    shadowColor: "#0D7A54", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  scanButtonText: { fontSize: 18, fontWeight: "800", color: "#fff" },
  scanButtonSub: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  editCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
    borderWidth: 2, borderColor: "#0D7A54",
  },
  editCardTitle: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  editRow: { flexDirection: "row", gap: 10 },
  editField: { flex: 1, gap: 4 },
  editLabel: { fontSize: 12, fontWeight: "600", color: Colors.textMuted, textAlign: "right" },
  editValue: { fontSize: 14, color: Colors.textPrimary, textAlign: "right" },
  editInput: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary,
  },
  editActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 12, alignItems: "center",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  confirmBtn: {
    flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: "#0D7A54", borderRadius: 12, paddingVertical: 12,
  },
  confirmBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  itemsList: { gap: 8 },
  itemsHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 4,
  },
  itemsTitle: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  promoteAllBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#0D7A54", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  promoteAllBtnDone: { backgroundColor: Colors.successLight },
  promoteAllBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  itemCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12, gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  itemRight: { flex: 1, gap: 3 },
  itemLeft: { alignItems: "flex-end", gap: 4 },
  itemName: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  itemBrand: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  itemPrice: { fontSize: 13, fontWeight: "800", color: "#0D7A54" },
  itemQty: { fontSize: 11, color: Colors.textSecondary },
  promotedBadge: {
    backgroundColor: "#E8F5E9", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  promotedBadgeText: { fontSize: 10, fontWeight: "700", color: "#0D7A54" },
  dbGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  dbCard: {
    width: "47%", borderRadius: 14, borderWidth: 2,
    borderColor: Colors.border, padding: 16,
    alignItems: "center", gap: 8,
    backgroundColor: Colors.surface,
  },
  dbLabel: { fontSize: 13, fontWeight: "700", color: Colors.textMuted, textAlign: "center" },
  connectionForm: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  formTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right", marginBottom: 4 },
  formField: { gap: 6 },
  formLabel: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, textAlign: "right" },
  formInput: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary,
  },
  csvBox: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 24,
    alignItems: "center", gap: 12,
    borderWidth: 2, borderStyle: "dashed", borderColor: "#0D7A54",
  },
  csvTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  csvSub: { fontSize: 13, color: Colors.textMuted, textAlign: "center", lineHeight: 20 },
  csvBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#0D7A54", borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10, marginTop: 4,
  },
  csvBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  importBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#0D7A54", borderRadius: 14,
    paddingVertical: 16,
  },
  importBtnDisabled: { backgroundColor: Colors.textMuted },
  importBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});

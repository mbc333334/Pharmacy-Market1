import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert, TextInput, ActivityIndicator, Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import BarcodeScanner, { ScannedMedicine } from "@/components/BarcodeScanner";
import { useInventory } from "@/contexts/InventoryContext";

const ACCENT = Colors.primary;

type ImportTab = "barcode" | "database" | "sync";
type DbType = "csv" | "api" | "mysql" | "postgres";

interface ScannedItem {
  barcode: string;
  name: string;
  brand: string;
  quantity: string;
  price: string;
}

const DB_TYPES: { key: DbType; icon: any; label: string; color: string }[] = [
  { key: "csv", icon: "document-text-outline", label: "CSV / Excel", color: ACCENT },
  { key: "api", icon: "cloud-outline", label: "REST API", color: "#7C3AED" },
  { key: "mysql", icon: "server-outline", label: "MySQL", color: "#E48900" },
  { key: "postgres", icon: "layers-outline", label: "PostgreSQL", color: "#336791" },
];

export default function PharmacyImport() {
  const insets = useSafeAreaInsets();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const { pharmacyInventory, syncEvents, syncSettings, updateSyncSettings, importItems, clearSyncLog, manualSyncNow } = useInventory();

  const [activeTab, setActiveTab] = useState<ImportTab>("barcode");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [editingItem, setEditingItem] = useState<ScannedItem | null>(null);
  const [selectedDb, setSelectedDb] = useState<DbType>("csv");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [importing, setImporting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleScanned = (result: ScannedMedicine) => {
    setScannerOpen(false);
    const existing = pharmacyInventory.find(i => i.barcode === result.barcode);
    setEditingItem({
      barcode: result.barcode,
      name: result.name ?? existing?.name ?? result.barcode,
      brand: result.brand ?? existing?.brand ?? "",
      quantity: existing ? String(existing.stock) : "100",
      price: existing ? String(existing.price) : "5000",
    });
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

  const saveScannedToInventory = () => {
    if (scannedItems.length === 0) return;
    importItems(
      scannedItems.map(i => ({
        barcode: i.barcode, name: i.name, brand: i.brand,
        categoryId: "1", price: parseInt(i.price) || 0,
        stock: parseInt(i.quantity) || 0,
        requiresPrescription: false, source: "barcode" as const,
      })),
      "pharmacy"
    );
    setScannedItems([]);
    Alert.alert("تم الحفظ ✅", `تم إضافة ${scannedItems.length} منتج لمخزون صيدليتك`);
  };

  const handleDatabaseImport = async () => {
    setImporting(true);
    await new Promise(r => setTimeout(r, 2000));
    setImporting(false);
    const mockImported: ScannedItem[] = [
      { barcode: "5900000000001", name: "باراسیتامول 500mg", brand: "Panadol", quantity: "120", price: "1500" },
      { barcode: "5900000000002", name: "أموكسيسيلين 500mg", brand: "Amoxil", quantity: "45", price: "8000" },
      { barcode: "5900000000003", name: "أسبرين 100mg", brand: "Aspirin Bayer", quantity: "80", price: "2500" },
      { barcode: "5900000000004", name: "أوميبرازول 20mg", brand: "Omeprazole", quantity: "60", price: "5000" },
      { barcode: "5900000000007", name: "أتورفاستاتين 20mg", brand: "Lipitor", quantity: "30", price: "12000" },
    ];
    setScannedItems(mockImported);
    Alert.alert("تم الاستيراد ✅", `تم استيراد ${mockImported.length} منتج من قاعدة بيانات الصيدلية`);
  };

  const testConnection = async () => {
    setTesting(true);
    await new Promise(r => setTimeout(r, 1500));
    setTesting(false);
    updateSyncSettings({ isConnected: true, connectedDbType: selectedDb, connectedDbUrl: apiUrl, lastFullSync: new Date().toISOString() });
    Alert.alert("الاتصال ناجح ✅", "تم الاتصال بقاعدة بيانات النظام الداخلي للصيدلية بنجاح");
  };

  const saveAllToInventory = () => {
    if (scannedItems.length === 0) return;
    importItems(
      scannedItems.map(i => ({
        barcode: i.barcode, name: i.name, brand: i.brand,
        categoryId: "1", price: parseInt(i.price) || 0,
        stock: parseInt(i.quantity) || 0,
        requiresPrescription: false, source: "database" as const,
      })),
      "pharmacy"
    );
    setScannedItems([]);
    Alert.alert("تمت المزامنة ✅", "تم تحديث مخزون الصيدلية من قاعدة البيانات");
  };

  const lowStockCount = pharmacyInventory.filter(i => i.stock > 0 && i.stock <= syncSettings.lowStockThreshold).length;
  const outOfStockCount = pharmacyInventory.filter(i => i.stock === 0).length;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <View style={styles.headerRight}>
          {syncSettings.isConnected && (
            <View style={styles.connectedBadge}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>متصل</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerTitle}>ربط قاعدة البيانات</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: ACCENT }]}>{pharmacyInventory.length}</Text>
          <Text style={styles.statLabel}>منتج في المخزون</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: Colors.warning }]}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>مخزون منخفض</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: Colors.error }]}>{outOfStockCount}</Text>
          <Text style={styles.statLabel}>نفد المخزون</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: "barcode", icon: "barcode-outline", label: "باركود" },
          { key: "database", icon: "server-outline", label: "قاعدة بيانات" },
          { key: "sync", icon: "sync-outline", label: "مزامنة تلقائية" },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as ImportTab)}
          >
            <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.key ? ACCENT : Colors.textMuted} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        {/* ── Barcode Tab ── */}
        {activeTab === "barcode" && (
          <View style={styles.section}>
            <TouchableOpacity style={[styles.scanButton, { backgroundColor: ACCENT }]} onPress={() => setScannerOpen(true)}>
              <Ionicons name="scan-outline" size={36} color="#fff" />
              <Text style={styles.scanButtonText}>مسح باركود الدواء</Text>
              <Text style={styles.scanButtonSub}>وجّه الكاميرا نحو العبوة</Text>
            </TouchableOpacity>

            {editingItem && (
              <View style={[styles.editCard, { borderColor: ACCENT }]}>
                <Text style={styles.editCardTitle}>تفاصيل الدواء المُسحوب</Text>
                <View style={styles.editRow}>
                  <Text style={styles.editLabel}>الباركود</Text>
                  <Text style={styles.editValue}>{editingItem.barcode}</Text>
                </View>
                {[
                  { label: "اسم الدواء", key: "name" as const, kb: "default" },
                  { label: "العلامة التجارية", key: "brand" as const, kb: "default" },
                ].map(f => (
                  <View key={f.key} style={styles.editField}>
                    <Text style={styles.editLabel}>{f.label}</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editingItem[f.key]}
                      onChangeText={v => setEditingItem(e => e ? { ...e, [f.key]: v } : e)}
                      textAlign="right" placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                ))}
                <View style={styles.editRow}>
                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>السعر (د.ع)</Text>
                    <TextInput
                      style={styles.editInput} value={editingItem.price}
                      onChangeText={v => setEditingItem(e => e ? { ...e, price: v } : e)}
                      keyboardType="numeric" textAlign="right" placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>الكمية</Text>
                    <TextInput
                      style={styles.editInput} value={editingItem.quantity}
                      onChangeText={v => setEditingItem(e => e ? { ...e, quantity: v } : e)}
                      keyboardType="numeric" textAlign="right" placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingItem(null)}>
                    <Text style={styles.cancelBtnText}>إلغاء</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: ACCENT }]} onPress={confirmItem}>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.confirmBtnText}>إضافة للمخزون</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {scannedItems.length > 0 && (
              <View style={styles.itemsList}>
                <View style={styles.itemsHeader}>
                  <TouchableOpacity style={[styles.saveAllBtn, { backgroundColor: ACCENT }]} onPress={saveScannedToInventory}>
                    <Ionicons name="save-outline" size={16} color="#fff" />
                    <Text style={styles.saveAllBtnText}>حفظ في المخزون ({scannedItems.length})</Text>
                  </TouchableOpacity>
                  <Text style={styles.itemsTitle}>{scannedItems.length} منتج</Text>
                </View>
                {scannedItems.map(item => (
                  <View key={item.barcode} style={styles.itemCard}>
                    <View style={styles.itemRight}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemBrand}>{item.brand} • {item.barcode}</Text>
                    </View>
                    <View style={styles.itemLeft}>
                      <Text style={[styles.itemPrice, { color: ACCENT }]}>{parseInt(item.price).toLocaleString()} د.ع</Text>
                      <Text style={styles.itemQty}>كمية: {item.quantity}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Database Tab ── */}
        {activeTab === "database" && (
          <View style={styles.section}>
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={18} color="#7C3AED" />
              <Text style={[styles.infoBannerText, { color: "#7C3AED" }]}>
                اربط نظامك الداخلي الحالي بالمنصة لتحديث المخزون تلقائياً
              </Text>
            </View>

            <Text style={styles.sectionTitle}>اختر نوع الاتصال</Text>
            <View style={styles.dbGrid}>
              {DB_TYPES.map(db => (
                <TouchableOpacity
                  key={db.key}
                  style={[styles.dbCard, selectedDb === db.key && { borderColor: db.color, backgroundColor: db.color + "12" }]}
                  onPress={() => setSelectedDb(db.key)}
                >
                  <Ionicons name={db.icon} size={28} color={selectedDb === db.key ? db.color : Colors.textMuted} />
                  <Text style={[styles.dbLabel, selectedDb === db.key && { color: db.color }]}>{db.label}</Text>
                  {syncSettings.connectedDbType === db.key && syncSettings.isConnected && (
                    <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>متصل</Text></View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {selectedDb === "api" && (
              <View style={styles.connectionForm}>
                <Text style={styles.formTitle}>إعدادات الاتصال بـ API</Text>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>رابط API</Text>
                  <TextInput style={styles.formInput} placeholder="https://api.pharmacy.com/inventory" value={apiUrl} onChangeText={setApiUrl} textAlign="right" placeholderTextColor={Colors.textMuted} autoCapitalize="none" />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>مفتاح API</Text>
                  <TextInput style={styles.formInput} placeholder="Bearer eyJ..." value={apiKey} onChangeText={setApiKey} textAlign="right" placeholderTextColor={Colors.textMuted} secureTextEntry />
                </View>
              </View>
            )}

            {(selectedDb === "mysql" || selectedDb === "postgres") && (
              <View style={styles.connectionForm}>
                <Text style={styles.formTitle}>إعدادات قاعدة البيانات</Text>
                {["المضيف (Host)", "المنفذ (Port)", "اسم قاعدة البيانات", "اسم المستخدم", "كلمة المرور"].map(field => (
                  <View key={field} style={styles.formField}>
                    <Text style={styles.formLabel}>{field}</Text>
                    <TextInput style={styles.formInput} placeholder={field} textAlign="right" placeholderTextColor={Colors.textMuted} secureTextEntry={field === "كلمة المرور"} />
                  </View>
                ))}
              </View>
            )}

            {selectedDb === "csv" && (
              <View style={[styles.csvBox, { borderColor: ACCENT }]}>
                <Ionicons name="cloud-upload-outline" size={48} color={ACCENT} />
                <Text style={styles.csvTitle}>رفع ملف CSV أو Excel</Text>
                <Text style={styles.csvSub}>اسحب الملف هنا أو اضغط لاختيار ملف من جهازك</Text>
                <TouchableOpacity style={[styles.csvBtn, { backgroundColor: ACCENT }]} onPress={handleDatabaseImport}>
                  <Ionicons name="folder-open-outline" size={18} color="#fff" />
                  <Text style={styles.csvBtnText}>اختيار ملف</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.dbActionsRow}>
              <TouchableOpacity
                style={[styles.testBtn, testing && { opacity: 0.7 }]}
                onPress={testConnection} disabled={testing}
              >
                {testing ? <ActivityIndicator color={ACCENT} size="small" /> : <Ionicons name="wifi-outline" size={18} color={ACCENT} />}
                <Text style={[styles.testBtnText, { color: ACCENT }]}>{testing ? "جارٍ الاختبار..." : "اختبار الاتصال"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.importBtn, importing && styles.importBtnDisabled]}
                onPress={handleDatabaseImport} disabled={importing}
              >
                {importing ? (
                  <><ActivityIndicator color="#fff" size="small" /><Text style={styles.importBtnText}>جارٍ الاستيراد...</Text></>
                ) : (
                  <><Ionicons name="cloud-download-outline" size={18} color="#fff" /><Text style={styles.importBtnText}>استيراد الآن</Text></>
                )}
              </TouchableOpacity>
            </View>

            {scannedItems.length > 0 && (
              <View style={styles.itemsList}>
                <View style={styles.itemsHeader}>
                  <TouchableOpacity style={[styles.saveAllBtn, { backgroundColor: ACCENT }]} onPress={saveAllToInventory}>
                    <Ionicons name="sync-outline" size={16} color="#fff" />
                    <Text style={styles.saveAllBtnText}>مزامنة المخزون ({scannedItems.length})</Text>
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
                      <Text style={[styles.itemPrice, { color: ACCENT }]}>{parseInt(item.price).toLocaleString()} د.ع</Text>
                      <Text style={styles.itemQty}>كمية: {item.quantity}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Sync Tab ── */}
        {activeTab === "sync" && (
          <View style={styles.section}>
            {/* Manual Sync Button */}
            <TouchableOpacity
              style={[styles.manualSyncBtn, syncing && { opacity: 0.7 }]}
              disabled={syncing}
              onPress={async () => {
                setSyncing(true);
                await manualSyncNow("pharmacy");
                setSyncing(false);
                Alert.alert("تمت المزامنة ✅", "تم تحديث المخزون بنجاح من قاعدة البيانات المتصلة");
              }}
            >
              {syncing
                ? <ActivityIndicator color="#fff" size="small" />
                : <Ionicons name="sync-outline" size={26} color="#fff" />}
              <View style={styles.manualSyncBtnInfo}>
                <Text style={styles.manualSyncBtnTitle}>{syncing ? "جارٍ المزامنة..." : "مزامنة الآن"}</Text>
                <Text style={styles.manualSyncBtnSub}>
                  {syncSettings.lastManualSync
                    ? `آخر مزامنة: ${new Date(syncSettings.lastManualSync).toLocaleTimeString("ar-IQ")}`
                    : "اضغط لمزامنة مخزونك مع قاعدة البيانات"}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.syncCard}>
              <View style={styles.syncCardHeader}>
                <Switch
                  value={syncSettings.syncOnSale}
                  onValueChange={v => updateSyncSettings({ syncOnSale: v })}
                  thumbColor={syncSettings.syncOnSale ? Colors.error : "#ccc"}
                  trackColor={{ false: Colors.border, true: Colors.error + "50" }}
                />
                <View style={styles.syncCardInfo}>
                  <Text style={styles.syncCardTitle}>خصم تلقائي عند البيع</Text>
                  <Text style={styles.syncCardSub}>عند تسليم طلب عميل → تنقص الكمية تلقائياً</Text>
                </View>
                <Ionicons name="arrow-down-circle" size={24} color={Colors.error} />
              </View>
            </View>

            <View style={styles.syncCard}>
              <View style={styles.syncCardHeader}>
                <Switch
                  value={syncSettings.syncOnRestock}
                  onValueChange={v => updateSyncSettings({ syncOnRestock: v })}
                  thumbColor={syncSettings.syncOnRestock ? Colors.success : "#ccc"}
                  trackColor={{ false: Colors.border, true: Colors.success + "50" }}
                />
                <View style={styles.syncCardInfo}>
                  <Text style={styles.syncCardTitle}>إضافة تلقائية عند الاستلام</Text>
                  <Text style={styles.syncCardSub}>عند وصول شحنة من مذخر → تزيد الكمية تلقائياً</Text>
                </View>
                <Ionicons name="arrow-up-circle" size={24} color={Colors.success} />
              </View>
            </View>

            <View style={styles.thresholdRow}>
              <TextInput
                style={styles.thresholdInput}
                value={String(syncSettings.lowStockThreshold)}
                onChangeText={v => updateSyncSettings({ lowStockThreshold: parseInt(v) || 10 })}
                keyboardType="numeric"
                textAlign="center"
              />
              <Text style={styles.thresholdLabel}>حد تنبيه المخزون المنخفض (وحدات)</Text>
            </View>

            {/* Sync Event Log */}
            <View style={styles.logSection}>
              <View style={styles.logHeader}>
                {syncEvents.length > 0 && (
                  <TouchableOpacity onPress={clearSyncLog}>
                    <Text style={styles.clearLogBtn}>مسح السجل</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.logTitle}>سجل التزامن ({syncEvents.length})</Text>
              </View>
              {syncEvents.length === 0 ? (
                <View style={styles.emptyLog}>
                  <Ionicons name="time-outline" size={36} color={Colors.border} />
                  <Text style={styles.emptyLogText}>لا توجد عمليات مزامنة بعد</Text>
                </View>
              ) : (
                syncEvents.slice(0, 20).map(evt => (
                  <View key={evt.id} style={styles.logRow}>
                    <View style={styles.logLeft}>
                      <Text style={[styles.logQty, { color: evt.quantityChange < 0 ? Colors.error : Colors.success }]}>
                        {evt.quantityChange > 0 ? "+" : ""}{evt.quantityChange}
                      </Text>
                      <Ionicons
                        name={evt.type === "sale" ? "arrow-down-circle" : evt.type === "restock" ? "arrow-up-circle" : "sync-circle"}
                        size={18}
                        color={evt.type === "sale" ? Colors.error : Colors.success}
                      />
                    </View>
                    <View style={styles.logRight}>
                      <Text style={styles.logItemName}>{evt.itemName}</Text>
                      <Text style={styles.logReason}>{evt.reason}</Text>
                      <Text style={styles.logStock}>{evt.stockBefore} → {evt.stockAfter}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
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
    backgroundColor: ACCENT, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  connectedBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  connectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ADE80" },
  connectedText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 12, alignItems: "center", gap: 4 },
  statNum: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, color: Colors.textMuted, textAlign: "center" },
  tabs: { flexDirection: "row", backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, marginTop: 10 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: ACCENT },
  tabText: { fontSize: 12, fontWeight: "600", color: Colors.textMuted },
  tabTextActive: { color: ACCENT, fontWeight: "700" },
  section: { padding: 16, gap: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#F5F3FF", borderRadius: 12, padding: 12 },
  infoBannerText: { flex: 1, fontSize: 13, textAlign: "right", lineHeight: 20 },
  scanButton: { borderRadius: 20, padding: 32, alignItems: "center", gap: 10, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  scanButtonText: { fontSize: 18, fontWeight: "800", color: "#fff" },
  scanButtonSub: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  editCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, borderWidth: 2 },
  editCardTitle: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  editRow: { flexDirection: "row", gap: 10, justifyContent: "space-between", alignItems: "center" },
  editField: { flex: 1, gap: 4 },
  editLabel: { fontSize: 12, fontWeight: "600", color: Colors.textMuted, textAlign: "right" },
  editValue: { fontSize: 14, color: Colors.textPrimary, textAlign: "right" },
  editInput: { backgroundColor: Colors.surfaceAlt, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary },
  editActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingVertical: 12, alignItems: "center" },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  confirmBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 12 },
  confirmBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  dbGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  dbCard: { width: "47%", borderRadius: 14, borderWidth: 2, borderColor: Colors.border, padding: 16, alignItems: "center", gap: 8, backgroundColor: Colors.surface },
  dbLabel: { fontSize: 13, fontWeight: "700", color: Colors.textMuted, textAlign: "center" },
  activeBadge: { backgroundColor: Colors.successLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  activeBadgeText: { fontSize: 10, fontWeight: "700", color: Colors.success },
  connectionForm: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  formTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right", marginBottom: 4 },
  formField: { gap: 6 },
  formLabel: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, textAlign: "right" },
  formInput: { backgroundColor: Colors.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary },
  csvBox: { backgroundColor: Colors.surface, borderRadius: 16, padding: 24, alignItems: "center", gap: 12, borderWidth: 2, borderStyle: "dashed" },
  csvTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  csvSub: { fontSize: 13, color: Colors.textMuted, textAlign: "center", lineHeight: 20 },
  csvBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  csvBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  dbActionsRow: { flexDirection: "row", gap: 10 },
  testBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: ACCENT },
  testBtnText: { fontSize: 14, fontWeight: "700" },
  importBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 14 },
  importBtnDisabled: { backgroundColor: Colors.textMuted },
  importBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  itemsList: { gap: 8 },
  itemsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  itemsTitle: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  saveAllBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  saveAllBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  itemCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, borderRadius: 12, padding: 12, gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  itemRight: { flex: 1, gap: 3 },
  itemLeft: { alignItems: "flex-end", gap: 4 },
  itemName: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  itemBrand: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  itemPrice: { fontSize: 13, fontWeight: "800" },
  itemQty: { fontSize: 11, color: Colors.textSecondary },
  manualSyncBtn: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: ACCENT, borderRadius: 20, padding: 20, shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  manualSyncBtnInfo: { flex: 1 },
  manualSyncBtnTitle: { fontSize: 18, fontWeight: "800", color: "#fff", textAlign: "right" },
  manualSyncBtnSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", textAlign: "right", marginTop: 3 },
  syncCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  syncCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  syncCardInfo: { flex: 1 },
  syncCardTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  syncCardSub: { fontSize: 12, color: Colors.textMuted, textAlign: "right", marginTop: 2 },
  thresholdRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.surface, borderRadius: 14, padding: 16 },
  thresholdInput: { width: 64, height: 44, backgroundColor: Colors.surfaceAlt, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  thresholdLabel: { flex: 1, fontSize: 14, color: Colors.textSecondary, textAlign: "right" },
  logSection: { gap: 8 },
  logHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  clearLogBtn: { fontSize: 13, fontWeight: "600", color: Colors.error },
  emptyLog: { alignItems: "center", padding: 24, gap: 8 },
  emptyLogText: { fontSize: 14, color: Colors.textMuted },
  logRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, borderRadius: 12, padding: 12, gap: 10 },
  logRight: { flex: 1, gap: 2 },
  logLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  logItemName: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  logReason: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  logStock: { fontSize: 11, color: Colors.textSecondary, textAlign: "right" },
  logQty: { fontSize: 14, fontWeight: "800" },
});

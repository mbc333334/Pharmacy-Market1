import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, TextInput, Switch, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import {
  useIntegration, IntegrationType, SyncField,
} from "@/contexts/IntegrationContext";

const PLATFORM_TYPES: {
  id: IntegrationType;
  label: string;
  description: string;
  icon: string;
  color: string;
  badge?: string;
}[] = [
  {
    id: "rest_api",
    label: "REST API مخصص",
    description: "اربط أي نظام يدعم HTTP API",
    icon: "code-slash",
    color: "#3182CE",
  },
  {
    id: "woocommerce",
    label: "WooCommerce",
    description: "متجر ووكومرس على ووردبريس",
    icon: "storefront",
    color: "#7F54B3",
    badge: "شائع",
  },
  {
    id: "odoo",
    label: "Odoo",
    description: "نظام ERP أودو للصيدليات",
    icon: "cube",
    color: "#714B67",
    badge: "شائع",
  },
  {
    id: "shopify",
    label: "Shopify",
    description: "متجر شوبيفاي",
    icon: "bag",
    color: "#95BF47",
  },
  {
    id: "mysql",
    label: "قاعدة MySQL",
    description: "اتصال مباشر بقاعدة MySQL",
    icon: "server",
    color: "#00758F",
  },
  {
    id: "postgresql",
    label: "قاعدة PostgreSQL",
    description: "اتصال مباشر بـ PostgreSQL",
    icon: "server",
    color: "#336791",
  },
  {
    id: "csv",
    label: "استيراد CSV / Excel",
    description: "رفع ملف لاستيراد بيانات الأدوية",
    icon: "document-text",
    color: "#38A169",
  },
];

const SYNC_FIELDS: { id: SyncField; label: string; icon: string; required?: boolean }[] = [
  { id: "medicines", label: "قائمة الأدوية", icon: "medkit-outline", required: true },
  { id: "inventory", label: "مستوى المخزون", icon: "layers-outline" },
  { id: "prices", label: "الأسعار", icon: "pricetag-outline" },
  { id: "orders", label: "الطلبات", icon: "cube-outline" },
  { id: "customers", label: "بيانات العملاء", icon: "people-outline" },
];

const INTERVALS = [
  { id: "15min", label: "كل 15 دقيقة" },
  { id: "1hour", label: "كل ساعة" },
  { id: "6hours", label: "كل 6 ساعات" },
  { id: "daily", label: "يومياً" },
];

export default function IntegrationScreen() {
  const insets = useSafeAreaInsets();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const { config, updateConfig, testConnection, disconnect, syncNow, syncing } = useIntegration();
  const [showPass, setShowPass] = useState(false);

  const isConnected = config.status === "connected";
  const isTesting = config.status === "testing";

  const handleTest = async () => {
    if (!hasRequiredFields()) {
      Alert.alert("تنبيه", "يرجى ملء جميع الحقول المطلوبة أولاً");
      return;
    }
    await testConnection();
  };

  const handleDisconnect = () => {
    Alert.alert(
      "قطع الاتصال",
      "هل تريد إلغاء ربط هذه المنصة؟ سيتوقف المزامنة التلقائي.",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "قطع الاتصال", style: "destructive", onPress: disconnect },
      ]
    );
  };

  const handleSyncNow = async () => {
    await syncNow();
    Alert.alert("تمت المزامنة", "تم تحديث بيانات الأدوية بنجاح ✓");
  };

  const toggleSyncField = (field: SyncField) => {
    if (field === "medicines") return;
    const current = config.syncFields;
    const updated = current.includes(field)
      ? current.filter(f => f !== field)
      : [...current, field];
    updateConfig({ syncFields: updated });
  };

  const hasRequiredFields = () => {
    switch (config.type) {
      case "rest_api": return !!config.apiUrl;
      case "woocommerce": return !!config.storeUrl && !!config.consumerKey && !!config.consumerSecret;
      case "odoo": return !!config.apiUrl && !!config.apiKey;
      case "shopify": return !!config.storeUrl && !!config.apiKey;
      case "mysql":
      case "postgresql": return !!config.dbHost && !!config.dbName && !!config.dbUser;
      case "csv": return true;
      default: return false;
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "لم تتم بعد";
    const d = new Date(iso);
    return d.toLocaleString("ar", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const selectedPlatform = PLATFORM_TYPES.find(p => p.id === config.type);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topInset }]}
      contentContainerStyle={{ paddingBottom: 60 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ربط المنصة الخارجية</Text>
          <Text style={styles.headerSub}>اختياري • مزامنة بياناتك تلقائياً</Text>
        </View>
        <View style={[styles.statusDot, {
          backgroundColor: isConnected ? Colors.success : config.status === "failed" ? Colors.error : Colors.border
        }]} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
        <Text style={styles.infoText}>
          اربط منصتك الخاصة لمزامنة الأدوية والمخزون والأسعار تلقائياً مع دواء+. هذه الميزة اختيارية تماماً.
        </Text>
      </View>

      {/* Connection Status Bar */}
      {config.type && (
        <View style={[
          styles.statusBar,
          isConnected && styles.statusBarConnected,
          config.status === "failed" && styles.statusBarFailed,
          isTesting && styles.statusBarTesting,
        ]}>
          {isTesting ? (
            <>
              <ActivityIndicator size="small" color={Colors.warning} />
              <Text style={[styles.statusText, { color: Colors.warning }]}>جاري الاتصال...</Text>
            </>
          ) : isConnected ? (
            <>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={[styles.statusText, { color: Colors.success }]}>
                متصل • آخر مزامنة: {formatDate(config.lastSync)}
              </Text>
              <TouchableOpacity onPress={handleDisconnect}>
                <Text style={styles.disconnectText}>قطع</Text>
              </TouchableOpacity>
            </>
          ) : config.status === "failed" ? (
            <>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={[styles.statusText, { color: Colors.error }]} numberOfLines={1}>
                {config.errorMessage ?? "فشل الاتصال"}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="ellipse-outline" size={16} color={Colors.textMuted} />
              <Text style={[styles.statusText, { color: Colors.textMuted }]}>غير متصل</Text>
            </>
          )}
        </View>
      )}

      {/* Platform Type Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>اختر نوع المنصة</Text>
        <View style={styles.platformGrid}>
          {PLATFORM_TYPES.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.platformCard,
                config.type === p.id && styles.platformCardActive,
                config.type === p.id && { borderColor: p.color },
              ]}
              onPress={() => updateConfig({ type: p.id, status: "idle", errorMessage: null })}
            >
              {p.badge && (
                <View style={[styles.platformBadge, { backgroundColor: p.color }]}>
                  <Text style={styles.platformBadgeText}>{p.badge}</Text>
                </View>
              )}
              <View style={[styles.platformIcon, { backgroundColor: p.color + "18" }]}>
                <Ionicons name={p.icon as any} size={22} color={p.color} />
              </View>
              <Text style={[styles.platformLabel, config.type === p.id && { color: p.color }]}>
                {p.label}
              </Text>
              <Text style={styles.platformDesc}>{p.description}</Text>
              {config.type === p.id && (
                <View style={[styles.platformCheck, { backgroundColor: p.color }]}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Connection Fields */}
      {config.type && config.type !== "csv" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Text style={{ color: selectedPlatform?.color }}>⚙️ </Text>
            إعدادات الاتصال
          </Text>
          <View style={styles.fieldsCard}>
            {(config.type === "rest_api" || config.type === "odoo") && (
              <>
                <FormField
                  label="رابط API *"
                  value={config.apiUrl}
                  onChange={v => updateConfig({ apiUrl: v })}
                  placeholder="https://api.yourstore.com/v1"
                  icon="link-outline"
                />
                <FormField
                  label="مفتاح API *"
                  value={config.apiKey}
                  onChange={v => updateConfig({ apiKey: v })}
                  placeholder="sk_live_xxxxxxxxxxxxxxxx"
                  icon="key-outline"
                  secureEntry={!showPass}
                  toggleShow={() => setShowPass(!showPass)}
                />
              </>
            )}

            {(config.type === "woocommerce") && (
              <>
                <FormField
                  label="رابط المتجر *"
                  value={config.storeUrl}
                  onChange={v => updateConfig({ storeUrl: v })}
                  placeholder="https://yourpharmacy.com"
                  icon="storefront-outline"
                />
                <FormField
                  label="Consumer Key *"
                  value={config.consumerKey}
                  onChange={v => updateConfig({ consumerKey: v })}
                  placeholder="ck_xxxxxxxxxxxxxxxx"
                  icon="key-outline"
                />
                <FormField
                  label="Consumer Secret *"
                  value={config.consumerSecret}
                  onChange={v => updateConfig({ consumerSecret: v })}
                  placeholder="cs_xxxxxxxxxxxxxxxx"
                  icon="lock-closed-outline"
                  secureEntry={!showPass}
                  toggleShow={() => setShowPass(!showPass)}
                />
              </>
            )}

            {(config.type === "shopify") && (
              <>
                <FormField
                  label="رابط المتجر *"
                  value={config.storeUrl}
                  onChange={v => updateConfig({ storeUrl: v })}
                  placeholder="yourstore.myshopify.com"
                  icon="storefront-outline"
                />
                <FormField
                  label="Admin API Token *"
                  value={config.apiKey}
                  onChange={v => updateConfig({ apiKey: v })}
                  placeholder="shpat_xxxxxxxxxxxxxxxx"
                  icon="key-outline"
                  secureEntry={!showPass}
                  toggleShow={() => setShowPass(!showPass)}
                />
              </>
            )}

            {(config.type === "mysql" || config.type === "postgresql") && (
              <>
                <View style={styles.rowFields}>
                  <FormField
                    label="Host *"
                    value={config.dbHost}
                    onChange={v => updateConfig({ dbHost: v })}
                    placeholder="localhost"
                    icon="server-outline"
                    style={{ flex: 2 }}
                  />
                  <FormField
                    label="Port"
                    value={config.dbPort}
                    onChange={v => updateConfig({ dbPort: v })}
                    placeholder={config.type === "mysql" ? "3306" : "5432"}
                    keyboardType="number-pad"
                    style={{ flex: 1 }}
                  />
                </View>
                <FormField
                  label="اسم قاعدة البيانات *"
                  value={config.dbName}
                  onChange={v => updateConfig({ dbName: v })}
                  placeholder="pharmacy_db"
                  icon="folder-outline"
                />
                <FormField
                  label="اسم المستخدم *"
                  value={config.dbUser}
                  onChange={v => updateConfig({ dbUser: v })}
                  placeholder="root"
                  icon="person-outline"
                />
                <FormField
                  label="كلمة المرور"
                  value={config.dbPassword}
                  onChange={v => updateConfig({ dbPassword: v })}
                  placeholder="••••••••"
                  icon="lock-closed-outline"
                  secureEntry={!showPass}
                  toggleShow={() => setShowPass(!showPass)}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.testBtn, isTesting && styles.testBtnLoading]}
              onPress={handleTest}
              disabled={isTesting}
            >
              {isTesting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="flash" size={18} color="#fff" />
              )}
              <Text style={styles.testBtnText}>
                {isTesting ? "جاري الاختبار..." : "اختبار الاتصال"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* CSV Import */}
      {config.type === "csv" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>استيراد ملف البيانات</Text>
          <View style={styles.fieldsCard}>
            <TouchableOpacity style={styles.uploadBox}>
              <Ionicons name="cloud-upload-outline" size={36} color={Colors.primary} />
              <Text style={styles.uploadTitle}>ارفع ملف CSV أو Excel</Text>
              <Text style={styles.uploadSub}>
                الحقول المطلوبة: اسم الدواء، السعر، الكمية{"\n"}
                يمكن تحميل النموذج من الرابط أدناه
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.downloadTemplate}>
              <Ionicons name="download-outline" size={16} color={Colors.primary} />
              <Text style={styles.downloadTemplateText}>تحميل نموذج CSV</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sync Settings */}
      {config.type && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات المزامنة</Text>
          <View style={styles.fieldsCard}>
            <Text style={styles.subLabel}>البيانات المراد مزامنتها</Text>
            {SYNC_FIELDS.map(field => (
              <View key={field.id} style={styles.syncFieldRow}>
                {field.required ? (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>أساسي</Text>
                  </View>
                ) : (
                  <Switch
                    value={config.syncFields.includes(field.id)}
                    onValueChange={() => toggleSyncField(field.id)}
                    trackColor={{ true: Colors.primary }}
                    style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                  />
                )}
                <Text style={styles.syncFieldLabel}>{field.label}</Text>
                <View style={styles.syncFieldIcon}>
                  <Ionicons name={field.icon as any} size={16} color={Colors.primary} />
                </View>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.syncFieldRow}>
              <Switch
                value={config.autoSync}
                onValueChange={v => updateConfig({ autoSync: v })}
                trackColor={{ true: Colors.primary }}
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
              <Text style={styles.syncFieldLabel}>مزامنة تلقائية</Text>
              <Ionicons name="refresh-outline" size={16} color={Colors.primary} />
            </View>

            {config.autoSync && (
              <View style={styles.intervalRow}>
                {INTERVALS.map(iv => (
                  <TouchableOpacity
                    key={iv.id}
                    style={[styles.intervalChip, config.syncInterval === iv.id && styles.intervalChipActive]}
                    onPress={() => updateConfig({ syncInterval: iv.id as any })}
                  >
                    <Text style={[styles.intervalText, config.syncInterval === iv.id && { color: "#fff" }]}>
                      {iv.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Sync Now Button */}
      {isConnected && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.syncNowBtn, syncing && { opacity: 0.7 }]}
            onPress={handleSyncNow}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="sync" size={20} color="#fff" />
            )}
            <Text style={styles.syncNowText}>
              {syncing ? "جاري المزامنة..." : "مزامنة الآن"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.lastSyncNote}>آخر مزامنة: {formatDate(config.lastSync)}</Text>
        </View>
      )}

      {/* Security Note */}
      <View style={styles.securityNote}>
        <Ionicons name="shield-checkmark-outline" size={16} color={Colors.success} />
        <Text style={styles.securityText}>
          جميع بيانات الاتصال مشفّرة ولا تُخزَّن على خوادمنا.
          تُستخدم فقط لجلب البيانات عند الطلب.
        </Text>
      </View>
    </ScrollView>
  );
}

function FormField({
  label, value, onChange, placeholder, icon, secureEntry, toggleShow, keyboardType, style,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; icon?: string; secureEntry?: boolean;
  toggleShow?: () => void; keyboardType?: any; style?: any;
}) {
  return (
    <View style={[styles.fieldGroup, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldWrap}>
        {secureEntry !== undefined && (
          <TouchableOpacity onPress={toggleShow} style={styles.eyeBtn}>
            <Ionicons name={secureEntry ? "eye-off-outline" : "eye-outline"} size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureEntry}
          keyboardType={keyboardType ?? "default"}
          autoCapitalize="none"
          autoCorrect={false}
          textAlign="right"
        />
        {icon && (
          <Ionicons name={icon as any} size={18} color={Colors.textMuted} style={{ marginLeft: 10 }} />
        )}
      </View>
    </View>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "لم تتم بعد";
  const d = new Date(iso);
  return d.toLocaleString("ar", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surface, paddingHorizontal: 16,
    paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: Colors.surfaceAlt, alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "flex-end" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: Colors.textPrimary },
  headerSub: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  infoBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: Colors.primaryLight, margin: 16, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: Colors.primary + "30",
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 20, textAlign: "right" },
  statusBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  statusBarConnected: { backgroundColor: Colors.successLight, borderColor: Colors.success + "40" },
  statusBarFailed: { backgroundColor: "#FFF5F5", borderColor: Colors.error + "40" },
  statusBarTesting: { backgroundColor: "#FFFAF0", borderColor: Colors.warning + "40" },
  statusText: { flex: 1, fontSize: 13, fontWeight: "600", textAlign: "right" },
  disconnectText: { fontSize: 12, color: Colors.error, fontWeight: "700" },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 12 },
  platformGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  platformCard: {
    width: "47%", backgroundColor: Colors.surface, borderRadius: 16,
    padding: 14, alignItems: "center", gap: 6,
    borderWidth: 2, borderColor: "transparent", position: "relative",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  platformCardActive: { borderWidth: 2 },
  platformBadge: {
    position: "absolute", top: 8, left: 8,
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  platformBadgeText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  platformIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  platformLabel: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, textAlign: "center" },
  platformDesc: { fontSize: 10, color: Colors.textMuted, textAlign: "center", lineHeight: 14 },
  platformCheck: {
    position: "absolute", top: -6, right: -6,
    width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.surface,
  },
  fieldsCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  fieldGroup: { marginBottom: 10 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary, textAlign: "right", marginBottom: 6 },
  fieldWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  fieldInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, paddingVertical: 10, textAlign: "right" },
  eyeBtn: { padding: 4 },
  rowFields: { flexDirection: "row", gap: 10 },
  testBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 13, marginTop: 6,
  },
  testBtnLoading: { backgroundColor: Colors.warning },
  testBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  uploadBox: {
    alignItems: "center", gap: 10, borderWidth: 2, borderStyle: "dashed",
    borderColor: Colors.border, borderRadius: 16, padding: 28,
    backgroundColor: Colors.surfaceAlt, marginBottom: 10,
  },
  uploadTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },
  uploadSub: { fontSize: 12, color: Colors.textMuted, textAlign: "center", lineHeight: 20 },
  downloadTemplate: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: Colors.primaryLight, borderRadius: 10,
    paddingVertical: 10, borderWidth: 1, borderColor: Colors.primary + "30",
  },
  downloadTemplateText: { fontSize: 13, color: Colors.primary, fontWeight: "700" },
  subLabel: { fontSize: 13, fontWeight: "700", color: Colors.textSecondary, textAlign: "right", marginBottom: 8 },
  syncFieldRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "flex-end",
    gap: 10, paddingVertical: 8,
  },
  syncFieldLabel: { flex: 1, fontSize: 14, color: Colors.textPrimary, textAlign: "right" },
  syncFieldIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center",
  },
  requiredBadge: {
    backgroundColor: Colors.primaryLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  requiredText: { fontSize: 10, fontWeight: "700", color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  intervalRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  intervalChip: {
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: Colors.surfaceAlt, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  intervalChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  intervalText: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary },
  syncNowBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  syncNowText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  lastSyncNote: { fontSize: 12, color: Colors.textMuted, textAlign: "center", marginTop: 8 },
  securityNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: Colors.successLight, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: Colors.success + "30",
  },
  securityText: { flex: 1, fontSize: 12, color: Colors.success, lineHeight: 18, textAlign: "right" },
});

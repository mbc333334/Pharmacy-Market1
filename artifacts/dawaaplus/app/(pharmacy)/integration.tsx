import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
  TextInput, ActivityIndicator, Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useIntegration, IntegrationType } from "@/contexts/IntegrationContext";
import { useTranslation } from "@/i18n";

const INTEGRATION_OPTIONS: { type: IntegrationType; label: string; labelEn: string; icon: any; color: string; desc: string }[] = [
  { type: "csv", label: "Excel / CSV", labelEn: "Excel / CSV", icon: "document-text", color: "#22543D", desc: "استيراد قائمة الأدوية من ملف Excel أو CSV" },
  { type: "rest_api", label: "REST API", labelEn: "REST API", icon: "cloud", color: "#2C5282", desc: "ربط نظامك الإلكتروني عبر API" },
  { type: "mysql", label: "MySQL / MariaDB", labelEn: "MySQL", icon: "server", color: "#702459", desc: "ربط مباشر بقاعدة بيانات MySQL" },
  { type: "postgresql", label: "PostgreSQL", labelEn: "PostgreSQL", icon: "server", color: "#2A4365", desc: "ربط مباشر بقاعدة بيانات PostgreSQL" },
  { type: "woocommerce", label: "WooCommerce", labelEn: "WooCommerce", icon: "cart", color: "#553C9A", desc: "ربط متجر WooCommerce" },
  { type: "odoo", label: "Odoo ERP", labelEn: "Odoo", icon: "grid", color: "#744210", desc: "تكامل مع نظام Odoo للإدارة" },
];

const SYNC_FIELDS = [
  { key: "medicines", label: "الأدوية وتفاصيلها" },
  { key: "prices", label: "الأسعار وخصومات" },
  { key: "inventory", label: "كميات المخزون" },
  { key: "orders", label: "الطلبات" },
];

export default function IntegrationScreen() {
  const insets = useSafeAreaInsets();
  const { config, updateConfig, testConnection, disconnect, syncNow, syncing } = useIntegration();
  const { t } = useTranslation();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [step, setStep] = useState<"choose" | "configure" | "connected">(
    config.status === "connected" ? "connected" : "choose"
  );
  const [selectedType, setSelectedType] = useState<IntegrationType>(config.type);

  const handleSelectType = (type: IntegrationType) => {
    setSelectedType(type);
    updateConfig({ type });
    setStep("configure");
  };

  const handleTest = async () => {
    await testConnection();
    if (config.apiUrl || config.dbHost || config.storeUrl || config.type === "csv") {
      setStep("connected");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setSelectedType(null);
    setStep("choose");
  };

  const toggleSyncField = (field: string) => {
    const current = config.syncFields as string[];
    const updated = current.includes(field)
      ? current.filter(f => f !== field)
      : [...current, field];
    updateConfig({ syncFields: updated as any });
  };

  const statusColors = {
    idle: Colors.textMuted,
    testing: Colors.warning,
    connected: Colors.success,
    failed: Colors.error,
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("integrationTitle")}</Text>
        {config.status === "connected" && (
          <View style={styles.connectedBadge}>
            <View style={styles.connectedDot} />
            <Text style={styles.connectedBadgeText}>{t("connected")}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        {step === "choose" && (
          <>
            <View style={styles.heroBanner}>
              <Ionicons name="flash" size={32} color={Colors.primary} />
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>{t("integrationTitle")}</Text>
                <Text style={styles.heroSubtitle}>{t("integrationSubtitle")}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>اختر طريقة الربط</Text>
            <View style={styles.optionsGrid}>
              {INTEGRATION_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.type}
                  style={[styles.optionCard, { borderTopColor: opt.color }]}
                  onPress={() => handleSelectType(opt.type)}
                >
                  <Ionicons name={opt.icon} size={28} color={opt.color} />
                  <Text style={[styles.optionLabel, { color: opt.color }]}>{opt.label}</Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === "configure" && (
          <>
            <TouchableOpacity style={styles.backRow} onPress={() => setStep("choose")}>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
              <Text style={styles.backRowText}>اختيار طريقة مختلفة</Text>
            </TouchableOpacity>

            {selectedType === "csv" && <CSVSection />}
            {selectedType === "rest_api" && (
              <APISection config={config} updateConfig={updateConfig} />
            )}
            {(selectedType === "mysql" || selectedType === "postgresql") && (
              <DBSection config={config} updateConfig={updateConfig} type={selectedType} />
            )}
            {(selectedType === "woocommerce") && (
              <WooSection config={config} updateConfig={updateConfig} />
            )}
            {selectedType === "odoo" && (
              <APISection config={config} updateConfig={updateConfig} />
            )}

            <Text style={styles.sectionTitle}>{t("syncFields")}</Text>
            <View style={styles.card}>
              {SYNC_FIELDS.map((field, i) => (
                <React.Fragment key={field.key}>
                  <View style={styles.switchRow}>
                    <Switch
                      value={(config.syncFields as string[]).includes(field.key)}
                      onValueChange={() => toggleSyncField(field.key)}
                      trackColor={{ true: Colors.primary }}
                    />
                    <Text style={styles.switchLabel}>{field.label}</Text>
                  </View>
                  {i < SYNC_FIELDS.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t("autoSync")}</Text>
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <Switch
                  value={config.autoSync}
                  onValueChange={v => updateConfig({ autoSync: v })}
                  trackColor={{ true: Colors.primary }}
                />
                <Text style={styles.switchLabel}>{t("autoSync")}</Text>
              </View>
              {config.autoSync && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.intervalRow}>
                    {(["15min", "1hour", "6hours", "daily"] as const).map(interval => (
                      <TouchableOpacity
                        key={interval}
                        style={[styles.intervalBtn, config.syncInterval === interval && styles.intervalBtnActive]}
                        onPress={() => updateConfig({ syncInterval: interval })}
                      >
                        <Text style={[styles.intervalText, config.syncInterval === interval && styles.intervalTextActive]}>
                          {interval === "15min" ? "15 دق" : interval === "1hour" ? "ساعة" : interval === "6hours" ? "6 ساعات" : "يومي"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>

            {config.errorMessage && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={styles.errorText}>{config.errorMessage}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTest}
              disabled={config.status === "testing"}
            >
              {config.status === "testing" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="flash" size={20} color="#fff" />
                  <Text style={styles.testBtnText}>{t("testConnection")}</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {step === "connected" && (
          <>
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
              <Text style={styles.successTitle}>{t("connected")} ✓</Text>
              <Text style={styles.successSub}>تم ربط قاعدة بيانات صيدليتك بنجاح</Text>
              {config.lastSync && (
                <Text style={styles.lastSyncText}>
                  {t("lastSync")}: {new Date(config.lastSync).toLocaleString("ar")}
                </Text>
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{INTEGRATION_OPTIONS.find(o => o.type === config.type)?.label ?? config.type}</Text>
                <Text style={styles.infoLabel}>نوع الاتصال</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{config.syncFields.join("، ")}</Text>
                <Text style={styles.infoLabel}>{t("syncFields")}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{config.autoSync ? `كل ${config.syncInterval}` : "يدوي"}</Text>
                <Text style={styles.infoLabel}>{t("autoSync")}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.syncBtn}
              onPress={syncNow}
              disabled={syncing}
            >
              {syncing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.syncBtnText}>{t("syncNow")}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
              <Ionicons name="unlink-outline" size={18} color={Colors.error} />
              <Text style={styles.disconnectText}>{t("disconnect")}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function CSVSection() {
  return (
    <View style={styles.csvSection}>
      <View style={styles.csvDropZone}>
        <Ionicons name="cloud-upload-outline" size={48} color={Colors.primary} />
        <Text style={styles.csvDropText}>اسحب ملف Excel أو CSV هنا</Text>
        <Text style={styles.csvDropSub}>أو</Text>
        <TouchableOpacity style={styles.csvBrowseBtn}>
          <Ionicons name="folder-open-outline" size={18} color={Colors.primary} />
          <Text style={styles.csvBrowseText}>تصفح الملفات</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.csvHintBox}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
        <Text style={styles.csvHintText}>
          يجب أن يحتوي الملف على: اسم الدواء، الباركود، السعر، الكمية، تاريخ الانتهاء
        </Text>
      </View>
      <TouchableOpacity style={styles.csvTemplateBtn}>
        <Ionicons name="download-outline" size={16} color={Colors.primary} />
        <Text style={styles.csvTemplateText}>تنزيل قالب Excel الجاهز</Text>
      </TouchableOpacity>
    </View>
  );
}

function APISection({ config, updateConfig }: { config: any; updateConfig: any }) {
  return (
    <View style={styles.configSection}>
      <ConfigField
        label="رابط API"
        value={config.apiUrl}
        onChangeText={v => updateConfig({ apiUrl: v })}
        placeholder="https://api.yourpharmacy.com"
        icon="link-outline"
      />
      <ConfigField
        label="مفتاح API"
        value={config.apiKey}
        onChangeText={v => updateConfig({ apiKey: v })}
        placeholder="sk_live_xxxxxxxxxxxxxxxx"
        icon="key-outline"
        secure
      />
    </View>
  );
}

function DBSection({ config, updateConfig, type }: { config: any; updateConfig: any; type: string }) {
  return (
    <View style={styles.configSection}>
      <ConfigField label="اسم المضيف (Host)" value={config.dbHost} onChangeText={v => updateConfig({ dbHost: v })} placeholder="localhost أو IP" icon="server-outline" />
      <ConfigField label="المنفذ (Port)" value={config.dbPort} onChangeText={v => updateConfig({ dbPort: v })} placeholder={type === "postgresql" ? "5432" : "3306"} icon="link-outline" keyboard="numeric" />
      <ConfigField label="اسم قاعدة البيانات" value={config.dbName} onChangeText={v => updateConfig({ dbName: v })} placeholder="pharmacy_db" icon="archive-outline" />
      <ConfigField label="اسم المستخدم" value={config.dbUser} onChangeText={v => updateConfig({ dbUser: v })} placeholder="root" icon="person-outline" />
      <ConfigField label="كلمة المرور" value={config.dbPassword} onChangeText={v => updateConfig({ dbPassword: v })} placeholder="••••••••" icon="lock-closed-outline" secure />
    </View>
  );
}

function WooSection({ config, updateConfig }: { config: any; updateConfig: any }) {
  return (
    <View style={styles.configSection}>
      <ConfigField label="رابط المتجر" value={config.storeUrl} onChangeText={v => updateConfig({ storeUrl: v })} placeholder="https://mystore.com" icon="storefront-outline" />
      <ConfigField label="Consumer Key" value={config.consumerKey} onChangeText={v => updateConfig({ consumerKey: v })} placeholder="ck_xxxxxxxx" icon="key-outline" />
      <ConfigField label="Consumer Secret" value={config.consumerSecret} onChangeText={v => updateConfig({ consumerSecret: v })} placeholder="cs_xxxxxxxx" icon="lock-closed-outline" secure />
    </View>
  );
}

function ConfigField({ label, value, onChangeText, placeholder, icon, secure, keyboard }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; icon: any; secure?: boolean; keyboard?: any;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          keyboardType={keyboard}
          textAlign="right"
        />
        <Ionicons name={icon} size={18} color={Colors.textMuted} style={styles.inputIcon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.primary, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "800", color: "#fff", textAlign: "right" },
  connectedBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  connectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#68D391" },
  connectedBadgeText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  heroBanner: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: Colors.primaryLight, margin: 16, borderRadius: 16, padding: 16,
  },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 17, fontWeight: "800", color: Colors.primary, textAlign: "right" },
  heroSubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: "right", marginTop: 3 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: Colors.textMuted, paddingHorizontal: 16, marginTop: 12, marginBottom: 8, textAlign: "right" },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 10 },
  optionCard: {
    width: "47%", backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    alignItems: "center", gap: 8, borderTopWidth: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  optionLabel: { fontSize: 14, fontWeight: "800" },
  optionDesc: { fontSize: 11, color: Colors.textMuted, textAlign: "center", lineHeight: 16 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  backRowText: { fontSize: 14, color: Colors.primary, fontWeight: "600" },
  csvSection: { paddingHorizontal: 16, gap: 12 },
  csvDropZone: {
    borderWidth: 2, borderColor: Colors.primary, borderStyle: "dashed",
    borderRadius: 16, padding: 28, alignItems: "center", gap: 8,
    backgroundColor: Colors.primaryLight,
  },
  csvDropText: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  csvDropSub: { fontSize: 13, color: Colors.textMuted },
  csvBrowseBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10,
  },
  csvBrowseText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  csvHintBox: {
    flexDirection: "row", gap: 8,
    backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 12,
  },
  csvHintText: { flex: 1, fontSize: 12, color: Colors.primary, textAlign: "right", lineHeight: 18 },
  csvTemplateBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12, paddingVertical: 12,
  },
  csvTemplateText: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  configSection: { paddingHorizontal: 16, gap: 10 },
  fieldGroup: { gap: 5 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary, textAlign: "right" },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary },
  inputIcon: { paddingHorizontal: 4 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 14, marginHorizontal: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  switchLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: Colors.textPrimary, textAlign: "right" },
  intervalRow: { flexDirection: "row", gap: 8, padding: 14 },
  intervalBtn: { flex: 1, borderRadius: 10, paddingVertical: 8, backgroundColor: Colors.surfaceAlt, alignItems: "center" },
  intervalBtnActive: { backgroundColor: Colors.primary },
  intervalText: { fontSize: 12, fontWeight: "600", color: Colors.textMuted },
  intervalTextActive: { color: "#fff" },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.errorLight, borderRadius: 12, margin: 16, padding: 14, justifyContent: "flex-end",
  },
  errorText: { flex: 1, fontSize: 13, color: Colors.error, textAlign: "right" },
  testBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.primary, borderRadius: 14, margin: 16, paddingVertical: 15,
  },
  testBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  successBanner: {
    alignItems: "center", padding: 28, gap: 8,
    backgroundColor: Colors.successLight, margin: 16, borderRadius: 16,
  },
  successTitle: { fontSize: 22, fontWeight: "800", color: Colors.success },
  successSub: { fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
  lastSyncText: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  infoValue: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, textAlign: "right" },
  infoLabel: { fontSize: 12, color: Colors.textMuted },
  syncBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.success, borderRadius: 14, margin: 16, marginBottom: 8, paddingVertical: 14,
  },
  syncBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  disconnectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderWidth: 1.5, borderColor: Colors.error, borderRadius: 14, marginHorizontal: 16, paddingVertical: 12, marginBottom: 16,
  },
  disconnectText: { fontSize: 14, fontWeight: "700", color: Colors.error },
});

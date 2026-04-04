import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Switch, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { usePaymentMethods, PaymentMethodConfig } from "@/contexts/PaymentMethodsContext";
import { PaymentMethod } from "@/contexts/OrdersContext";

const ADMIN_COLOR = "#7C3AED";

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  cash:   { label: "الدفع النقدي",              icon: "cash-outline",           color: "#0D7A54" },
  card:   { label: "البطاقات المصرفية",         icon: "card-outline",           color: "#1A9E6E" },
  wallet: { label: "المحافظ الإلكترونية العراقية", icon: "wallet-outline",        color: "#D69E2E" },
  social: { label: "التواصل الاجتماعي",         icon: "chatbubble-ellipses-outline", color: "#25D366" },
};

export default function AdminPaymentsScreen() {
  const insets = useSafeAreaInsets();
  const { methods, toggleMethod, enabledCount } = usePaymentMethods();
  const [saving, setSaving] = useState<PaymentMethod | null>(null);

  const categories = ["cash", "card", "wallet", "social"] as const;

  const handleToggle = async (method: PaymentMethodConfig) => {
    setSaving(method.id);
    await new Promise(r => setTimeout(r, 300));
    toggleMethod(method.id);
    setSaving(null);
  };

  const handleEnableAll = () => {
    Alert.alert(
      "تفعيل جميع وسائل الدفع",
      "هل تريد تفعيل جميع وسائل الدفع؟ ستظهر للعملاء فوراً.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تفعيل الكل",
          onPress: () => methods.forEach(m => !m.enabled && toggleMethod(m.id)),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <Text style={styles.headerTitle}>إدارة وسائل الدفع</Text>
          <Text style={styles.headerSub}>تحكم بما يراه الزبون عند الدفع</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: ADMIN_COLOR }]}>
          <Ionicons name="wallet" size={20} color="#fff" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Summary Banner */}
        <View style={[styles.banner, { backgroundColor: ADMIN_COLOR }]}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerNum}>{enabledCount}</Text>
            <Text style={styles.bannerSub}>من {methods.length} وسيلة مفعّلة</Text>
          </View>
          <View style={styles.bannerInfo}>
            <Ionicons name="checkmark-circle" size={18} color="#ffffff90" />
            <Text style={styles.bannerInfoText}>مرئية للزبون الآن</Text>
          </View>
          <TouchableOpacity style={styles.bannerBtn} onPress={handleEnableAll}>
            <Text style={styles.bannerBtnText}>تفعيل الكل</Text>
          </TouchableOpacity>
        </View>

        {/* Live Preview Badge */}
        <View style={styles.previewNote}>
          <Ionicons name="eye-outline" size={15} color={ADMIN_COLOR} />
          <Text style={styles.previewNoteText}>
            التغييرات تُطبّق فوراً على سلة الزبون — لا يحتاج إعادة تشغيل
          </Text>
        </View>

        {/* Method Cards by Category */}
        {categories.map(cat => {
          const catMethods = methods.filter(m => m.category === cat);
          if (!catMethods.length) return null;
          const catInfo = CATEGORY_LABELS[cat];
          const enabledInCat = catMethods.filter(m => m.enabled).length;

          return (
            <View key={cat} style={styles.section}>
              {/* Category Header */}
              <View style={styles.catHeader}>
                <Text style={styles.catCount}>
                  {enabledInCat}/{catMethods.length}
                </Text>
                <View style={styles.catTitleRow}>
                  <Text style={styles.catTitle}>{catInfo.label}</Text>
                  <View style={[styles.catIcon, { backgroundColor: catInfo.color + "18" }]}>
                    <Ionicons name={catInfo.icon as any} size={16} color={catInfo.color} />
                  </View>
                </View>
              </View>

              {/* Payment Method Rows */}
              {catMethods.map(method => (
                <PaymentMethodRow
                  key={method.id}
                  method={method}
                  isSaving={saving === method.id}
                  onToggle={() => handleToggle(method)}
                />
              ))}
            </View>
          );
        })}

        {/* Warning */}
        {enabledCount === 0 && (
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={22} color={Colors.error} />
            <Text style={styles.warningText}>
              لم يتم تفعيل أي وسيلة دفع! لن يتمكن الزبون من إتمام الطلب.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function PaymentMethodRow({
  method,
  isSaving,
  onToggle,
}: {
  method: PaymentMethodConfig;
  isSaving: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={[styles.methodRow, method.enabled && { borderLeftColor: method.color }]}>
      {/* Icon */}
      <View style={[styles.methodIcon, { backgroundColor: method.enabled ? method.bg : Colors.surfaceAlt }]}>
        <Ionicons
          name={method.icon as any}
          size={20}
          color={method.enabled ? method.color : Colors.textMuted}
        />
      </View>

      {/* Info */}
      <View style={styles.methodInfo}>
        <View style={styles.methodTitleRow}>
          <StatusBadge enabled={method.enabled} />
          <Text style={[styles.methodLabel, { color: method.enabled ? Colors.textPrimary : Colors.textMuted }]}>
            {method.label}
          </Text>
        </View>
        <Text style={styles.methodDesc}>{method.description}</Text>
        {method.labelEn !== method.label && (
          <Text style={styles.methodLabelEn}>{method.labelEn}</Text>
        )}
      </View>

      {/* Toggle */}
      <Switch
        value={method.enabled}
        onValueChange={onToggle}
        disabled={isSaving}
        trackColor={{ false: Colors.border, true: method.color + "60" }}
        thumbColor={method.enabled ? method.color : "#ccc"}
        ios_backgroundColor={Colors.border}
      />
    </View>
  );
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <View style={[styles.badge, { backgroundColor: enabled ? "#D1FAE5" : "#F3F4F6" }]}>
      <View style={[styles.badgeDot, { backgroundColor: enabled ? "#059669" : "#9CA3AF" }]} />
      <Text style={[styles.badgeText, { color: enabled ? "#059669" : "#9CA3AF" }]}>
        {enabled ? "مفعّل" : "معطّل"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerRight: { flex: 1, alignItems: "flex-end" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  headerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  headerBadge: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  scroll: { padding: 16, gap: 14 },

  banner: {
    borderRadius: 18, padding: 18,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  bannerLeft: { flex: 1 },
  bannerNum: { fontSize: 36, fontWeight: "900", color: "#fff", lineHeight: 40 },
  bannerSub: { fontSize: 12, color: "#ffffff90" },
  bannerInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  bannerInfoText: { fontSize: 11, color: "#ffffff90" },
  bannerBtn: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  bannerBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  previewNote: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: ADMIN_COLOR + "0D", borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: ADMIN_COLOR + "20",
  },
  previewNoteText: { flex: 1, fontSize: 12, color: ADMIN_COLOR, textAlign: "right", fontWeight: "600" },

  section: {
    backgroundColor: Colors.surface, borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  catHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.surfaceAlt, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  catTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  catTitle: { fontSize: 14, fontWeight: "800", color: Colors.textPrimary },
  catIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  catCount: { fontSize: 12, fontWeight: "700", color: Colors.textMuted },

  methodRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    borderLeftWidth: 3, borderLeftColor: "transparent",
  },
  methodIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  methodInfo: { flex: 1 },
  methodTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3, justifyContent: "flex-end" },
  methodLabel: { fontSize: 14, fontWeight: "700", textAlign: "right" },
  methodDesc: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  methodLabelEn: { fontSize: 10, color: Colors.textMuted, textAlign: "right", marginTop: 1 },

  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: "700" },

  warningBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FEE2E2", borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: "#FECACA",
  },
  warningText: { flex: 1, fontSize: 13, color: Colors.error, textAlign: "right", fontWeight: "600", lineHeight: 18 },
});

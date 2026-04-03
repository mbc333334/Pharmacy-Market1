import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { DEMO_SUBSCRIBERS } from "@/data/subscriptionData";

const ADMIN_COLOR = "#7C3AED";

const PLAN_COLORS: Record<string, string> = {
  free: "#6B7280",
  standard: Colors.primary,
  premium: "#7C3AED",
};

const PLAN_LABELS: Record<string, string> = {
  free: "مجاني",
  standard: "أساسي",
  premium: "مميز",
};

type FilterType = "all" | "pharmacy" | "warehouse";

export default function AdminPharmacies() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const filtered = DEMO_SUBSCRIBERS.filter(s => {
    const matchSearch = !search || s.name.includes(search) || s.city.includes(search);
    const matchType = filterType === "all" || s.type === filterType;
    return matchSearch && matchType;
  });

  const pharmacyCount = DEMO_SUBSCRIBERS.filter(s => s.type === "pharmacy").length;
  const warehouseCount = DEMO_SUBSCRIBERS.filter(s => s.type === "warehouse").length;

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.header}>
        <View />
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.headerTitle}>الصيادلة والمذاخر</Text>
          <Text style={styles.headerSub}>{pharmacyCount} صيدلية | {warehouseCount} مذخر</Text>
        </View>
        <View style={[styles.adminIcon, { backgroundColor: ADMIN_COLOR }]}>
          <Ionicons name="storefront" size={18} color="#fff" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Search */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="بحث باسم الصيدلية أو المدينة..."
            value={search}
            onChangeText={setSearch}
            textAlign="right"
            placeholderTextColor={Colors.textMuted}
          />
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {(["all", "pharmacy", "warehouse"] as FilterType[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filterType === f && { backgroundColor: ADMIN_COLOR }]}
              onPress={() => setFilterType(f)}
            >
              <Ionicons
                name={f === "all" ? "list" : f === "pharmacy" ? "storefront" : "cube"}
                size={14}
                color={filterType === f ? "#fff" : Colors.textMuted}
              />
              <Text style={[styles.filterBtnText, filterType === f && { color: "#fff" }]}>
                {f === "all" ? "الكل" : f === "pharmacy" ? `الصيدليات (${pharmacyCount})` : `المذاخر (${warehouseCount})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{filtered.length} نتيجة</Text>
          <View style={{ gap: 10 }}>
            {filtered.map(sub => (
              <View key={sub.id} style={styles.card}>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={16} color={ADMIN_COLOR} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.errorLight }]}>
                    <Ionicons name="ban-outline" size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1, gap: 6, alignItems: "flex-end" }}>
                  {/* Name & type */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={[styles.planTag, { backgroundColor: PLAN_COLORS[sub.plan] + "20" }]}>
                      <Text style={[styles.planTagText, { color: PLAN_COLORS[sub.plan] }]}>{PLAN_LABELS[sub.plan]}</Text>
                    </View>
                    <View style={[styles.typeTag, { backgroundColor: sub.type === "pharmacy" ? Colors.primaryLight : "#0D7A5415" }]}>
                      <Text style={[styles.typeTagText, { color: sub.type === "pharmacy" ? Colors.primary : "#0D7A54" }]}>
                        {sub.type === "pharmacy" ? "صيدلية" : "مذخر"}
                      </Text>
                    </View>
                    <Text style={styles.cardName}>{sub.name}</Text>
                  </View>

                  {/* Details */}
                  <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaValue}>{sub.revenue > 0 ? `${sub.revenue.toLocaleString()} د.ع` : "مجاني"}</Text>
                      <Ionicons name="card-outline" size={13} color={Colors.textMuted} />
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaValue}>{sub.since}</Text>
                      <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaValue}>{sub.city}</Text>
                      <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                    </View>
                  </View>

                  {/* Status */}
                  <View style={{ flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
                    <Text style={[styles.statusText, {
                      color: sub.status === "active" ? "#10B981" : sub.status === "expired" ? Colors.error : "#F59E0B",
                    }]}>
                      {sub.status === "active" ? "نشط" : sub.status === "expired" ? "منتهي الاشتراك" : "معلّق"}
                    </Text>
                    <View style={[styles.statusDot, {
                      backgroundColor: sub.status === "active" ? "#10B981" : sub.status === "expired" ? Colors.error : "#F59E0B",
                    }]} />
                  </View>

                  {/* Contact */}
                  <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
                    <TouchableOpacity style={styles.contactBtn}>
                      <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                      <Text style={[styles.contactBtnText, { color: "#25D366" }]}>واتساب</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.contactBtn}>
                      <Ionicons name="call-outline" size={14} color={Colors.primary} />
                      <Text style={[styles.contactBtnText, { color: Colors.primary }]}>اتصال</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  adminIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  headerSub: { fontSize: 12, color: Colors.textSecondary },
  content: { padding: 16, gap: 14 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 2,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary },
  filterRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filterBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterBtnText: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary },
  section: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: Colors.textSecondary, textAlign: "right", marginBottom: 12 },
  card: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 14, padding: 14,
    flexDirection: "row", alignItems: "flex-start", gap: 10,
  },
  cardActions: { flexDirection: "column", gap: 8, flexShrink: 0 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: ADMIN_COLOR + "15",
    alignItems: "center", justifyContent: "center",
  },
  cardName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },
  planTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  planTagText: { fontSize: 10, fontWeight: "800" },
  typeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  typeTagText: { fontSize: 10, fontWeight: "700" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaValue: { fontSize: 12, color: Colors.textSecondary },
  statusText: { fontSize: 12, fontWeight: "700" },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  contactBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  contactBtnText: { fontSize: 11, fontWeight: "600" },
});

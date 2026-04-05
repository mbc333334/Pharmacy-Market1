import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

const C = {
  primary: "#D69E2E",
  dark: "#B7791F",
  light: "#FFFFF0",
  bg: "#F7FAFC",
  surface: "#FFFFFF",
  text: "#1A202C",
  muted: "#718096",
  border: "#E2E8F0",
  green: "#38A169",
  red: "#E53E3E",
  blue: "#3182CE",
};

const DEMO_TRIPS = [
  { id: "#TR-2041", from: "صيدلية الشفاء",   to: "حي الجامعة",   driver: "كرم سالم",    status: "delivered", amount: 8000  },
  { id: "#TR-2040", from: "صيدلية النور",    to: "شارع 100",      driver: "ريبوار أحمد", status: "ongoing",   amount: 6000  },
  { id: "#TR-2039", from: "صيدلية الأمل",    to: "كمبنى",         driver: "كرم سالم",    status: "pending",   amount: 10000 },
  { id: "#TR-2038", from: "صيدلية الخير",    to: "حي الثورة",     driver: "صباح علي",   status: "delivered", amount: 7500  },
  { id: "#TR-2037", from: "مذخر الشفاء",     to: "صيدلية الأمل",  driver: "ريبوار أحمد", status: "cancelled", amount: 15000 },
];

const DEMO_DRIVERS = [
  { id: "d1", name: "كرم سالم",    trips: 142, rating: 4.8, status: "active",   vehicle: "سيارة" },
  { id: "d2", name: "ريبوار أحمد", trips: 98,  rating: 4.6, status: "active",   vehicle: "دراجة" },
  { id: "d3", name: "فيان محمد",   trips: 210, rating: 4.9, status: "off",      vehicle: "سيارة" },
  { id: "d4", name: "صباح علي",    trips: 67,  rating: 4.5, status: "active",   vehicle: "دراجة" },
];

type Tab = "dash" | "trips" | "drivers";

export default function DeliveryHome() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("dash");
  const [showLogout, setShowLogout] = useState(false);

  const dc = user?.delivery;

  const stats = [
    { icon: "bicycle",   color: C.primary,  label: "الرحلات اليوم",      value: "7"   },
    { icon: "people",    color: C.blue,     label: "السائقون النشطون",   value: `${DEMO_DRIVERS.filter(d => d.status === "active").length}` },
    { icon: "cash",      color: C.green,    label: "الإيراد اليوم",       value: "47,500 د" },
    { icon: "star",      color: "#8B5CF6",  label: "متوسط التقييم",       value: "4.7 ⭐" },
  ];

  const planColor = dc?.subscription === "premium" ? "#7C3AED" : dc?.subscription === "standard" ? C.blue : C.muted;
  const planLabel = dc?.subscription === "premium" ? "بريميوم 👑" : dc?.subscription === "standard" ? "ستاندرد ⭐" : "مجاني";

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.logoutBtn} onPress={() => setShowLogout(true)}>
          <Ionicons name="log-out-outline" size={20} color={C.primary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{dc?.companyName ?? user?.name}</Text>
          <View style={[s.planBadge, { backgroundColor: planColor + "20" }]}>
            <Text style={[s.planText, { color: planColor }]}>{planLabel}</Text>
          </View>
        </View>
        <View style={s.headerIcon}>
          <Ionicons name="bicycle" size={22} color="#fff" />
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {([["dash", "grid", "الرئيسية"], ["trips", "list", "الرحلات"], ["drivers", "people", "السائقون"]] as [Tab, any, string][]).map(([id, icon, label]) => (
          <TouchableOpacity key={id} style={[s.tab, tab === id && s.tabActive]} onPress={() => setTab(id)}>
            <Ionicons name={icon} size={16} color={tab === id ? C.primary : C.muted} />
            <Text style={[s.tabLabel, tab === id && s.tabLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* ── DASHBOARD ── */}
        {tab === "dash" && (
          <>
            {/* Company card */}
            <View style={[s.companyCard, { borderColor: C.primary + "40" }]}>
              <View style={[s.companyIcon, { backgroundColor: C.primary }]}>
                <Ionicons name="business" size={26} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.companyName}>{dc?.companyName ?? user?.name}</Text>
                <Text style={s.companyCity}>📍 {dc?.city} — {dc?.licenseNumber}</Text>
                <Text style={s.companySub}>الاشتراك: <Text style={{ color: planColor, fontWeight: "700" }}>{planLabel}</Text></Text>
              </View>
            </View>

            {/* Stats */}
            <View style={s.statsGrid}>
              {stats.map((st, i) => (
                <View key={i} style={s.statCard}>
                  <View style={[s.statIcon, { backgroundColor: st.color + "18" }]}>
                    <Ionicons name={st.icon as any} size={20} color={st.color} />
                  </View>
                  <Text style={s.statValue}>{st.value}</Text>
                  <Text style={s.statLabel}>{st.label}</Text>
                </View>
              ))}
            </View>

            {/* Recent trips */}
            <Text style={s.sectionTitle}>آخر الرحلات</Text>
            {DEMO_TRIPS.slice(0, 3).map(trip => <TripRow key={trip.id} trip={trip} />)}
          </>
        )}

        {/* ── TRIPS ── */}
        {tab === "trips" && (
          <>
            <Text style={s.sectionTitle}>جميع الرحلات ({DEMO_TRIPS.length})</Text>
            {DEMO_TRIPS.map(trip => <TripRow key={trip.id} trip={trip} />)}
          </>
        )}

        {/* ── DRIVERS ── */}
        {tab === "drivers" && (
          <>
            <Text style={s.sectionTitle}>السائقون ({DEMO_DRIVERS.length})</Text>
            {DEMO_DRIVERS.map(driver => (
              <View key={driver.id} style={s.driverCard}>
                <View style={[s.driverAvatar, { backgroundColor: driver.status === "active" ? C.green + "20" : C.muted + "20" }]}>
                  <Ionicons name={driver.vehicle === "سيارة" ? "car" : "bicycle"} size={22} color={driver.status === "active" ? C.green : C.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.driverName}>{driver.name}</Text>
                  <Text style={s.driverMeta}>{driver.trips} رحلة — {driver.vehicle}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <View style={[s.statusBadge, { backgroundColor: driver.status === "active" ? C.green + "20" : C.muted + "15" }]}>
                    <Text style={[s.statusText, { color: driver.status === "active" ? C.green : C.muted }]}>
                      {driver.status === "active" ? "نشط" : "خارج"}
                    </Text>
                  </View>
                  <Text style={s.driverRating}>⭐ {driver.rating}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Logout Modal */}
      <Modal visible={showLogout} transparent animationType="fade" onRequestClose={() => setShowLogout(false)}>
        <View style={s.logoutOverlay}>
          <View style={s.logoutBox}>
            <View style={s.logoutIconWrap}>
              <Ionicons name="log-out-outline" size={28} color={C.primary} />
            </View>
            <Text style={s.logoutTitle}>تسجيل الخروج</Text>
            <Text style={s.logoutMsg}>هل تريد الخروج من حساب شركتك؟</Text>
            <View style={s.logoutBtns}>
              <TouchableOpacity style={[s.logoutBtn2, { backgroundColor: C.primary }]} onPress={() => { setShowLogout(false); logout(); }}>
                <Text style={s.logoutBtnText}>خروج</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.logoutBtn2, { backgroundColor: C.border }]} onPress={() => setShowLogout(false)}>
                <Text style={[s.logoutBtnText, { color: C.text }]}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TripRow({ trip }: { trip: typeof DEMO_TRIPS[0] }) {
  const statusColor = trip.status === "delivered" ? C.green : trip.status === "ongoing" ? C.primary : trip.status === "pending" ? C.blue : C.red;
  const statusLabel = trip.status === "delivered" ? "تم التسليم" : trip.status === "ongoing" ? "جارٍ" : trip.status === "pending" ? "معلق" : "ملغى";
  return (
    <View style={s.tripCard}>
      <View style={[s.tripDot, { backgroundColor: statusColor }]} />
      <View style={{ flex: 1 }}>
        <Text style={s.tripId}>{trip.id}</Text>
        <Text style={s.tripRoute}>{trip.from} ← {trip.to}</Text>
        <Text style={s.tripDriver}>🧑‍✈️ {trip.driver}</Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <View style={[s.tripStatus, { backgroundColor: statusColor + "20" }]}>
          <Text style={[s.tripStatusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
        <Text style={s.tripAmount}>{trip.amount.toLocaleString()} د</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: { backgroundColor: C.primary, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10, gap: 12 },
  headerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, gap: 4 },
  headerTitle: { fontSize: 16, fontWeight: "800", color: "#fff", textAlign: "right" },
  planBadge: { alignSelf: "flex-end", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  planText: { fontSize: 11, fontWeight: "700" },
  logoutBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },

  tabs: { flexDirection: "row", backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: C.primary },
  tabLabel: { fontSize: 12, fontWeight: "600", color: C.muted },
  tabLabelActive: { color: C.primary },

  companyCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 16, borderWidth: 1 },
  companyIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  companyName: { fontSize: 15, fontWeight: "800", color: C.text, textAlign: "right" },
  companyCity: { fontSize: 12, color: C.muted, textAlign: "right", marginTop: 2 },
  companySub: { fontSize: 12, color: C.muted, textAlign: "right", marginTop: 2 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, minWidth: "45%", backgroundColor: C.surface, borderRadius: 14, padding: 14, alignItems: "center", gap: 6 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: C.text },
  statLabel: { fontSize: 11, color: C.muted, textAlign: "center" },

  sectionTitle: { fontSize: 15, fontWeight: "800", color: C.text, textAlign: "right", marginBottom: 10 },

  tripCard: { backgroundColor: C.surface, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  tripDot: { width: 10, height: 10, borderRadius: 5 },
  tripId: { fontSize: 12, fontWeight: "700", color: C.muted, textAlign: "right" },
  tripRoute: { fontSize: 13, fontWeight: "600", color: C.text, textAlign: "right", marginTop: 2 },
  tripDriver: { fontSize: 11, color: C.muted, textAlign: "right", marginTop: 2 },
  tripStatus: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  tripStatusText: { fontSize: 11, fontWeight: "700" },
  tripAmount: { fontSize: 13, fontWeight: "700", color: C.text },

  driverCard: { backgroundColor: C.surface, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  driverAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  driverName: { fontSize: 14, fontWeight: "700", color: C.text, textAlign: "right" },
  driverMeta: { fontSize: 11, color: C.muted, textAlign: "right", marginTop: 2 },
  driverRating: { fontSize: 12, fontWeight: "600", color: C.muted },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: "700" },

  logoutOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 32 },
  logoutBox: { backgroundColor: C.surface, borderRadius: 20, padding: 24, width: "100%", alignItems: "center", gap: 12 },
  logoutIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: C.primary + "18", alignItems: "center", justifyContent: "center" },
  logoutTitle: { fontSize: 18, fontWeight: "800", color: C.text },
  logoutMsg: { fontSize: 14, color: C.muted, textAlign: "center" },
  logoutBtns: { flexDirection: "row", gap: 10, width: "100%", marginTop: 4 },
  logoutBtn2: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  logoutBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useRouter, useSegments } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { RAWAKID } from "@/data/rawakidData";
import { useLayout } from "@/hooks/useLayout";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";

const URGENT_COUNT = RAWAKID.filter(r => r.daysLeft <= 60).length;

const PHARMACY_TABS = [
  { name: "index", title: "لوحتي", icon: "grid", iconOff: "grid-outline" },
  { name: "medicines", title: "أدويتي", icon: "medkit", iconOff: "medkit-outline" },
  { name: "offers", title: "العروض", icon: "pricetag", iconOff: "pricetag-outline" },
  { name: "rawakid", title: "الرواكد", icon: "alert-circle", iconOff: "alert-circle-outline", badge: URGENT_COUNT },
  { name: "warehouses", title: "المذاخر", icon: "business", iconOff: "business-outline" },
  { name: "orders", title: "الطلبات", icon: "cube", iconOff: "cube-outline" },
  { name: "delivery", title: "التوصيل", icon: "car", iconOff: "car-outline" },
  { name: "import", title: "قاعدة البيانات", icon: "server", iconOff: "server-outline" },
  { name: "settings", title: "إعداداتي", icon: "settings", iconOff: "settings-outline" },
];

function SidebarNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const { isDesktop, sidebarWidth } = useLayout();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const currentRoute = (segments as string[])[segments.length - 1] || "index";

  return (
    <View style={[styles.sidebar, {
      width: sidebarWidth,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20),
    }]}>
      <View style={styles.sidebarLogoRow}>
        <Ionicons name="medkit" size={20} color={Colors.primary} />
        {isDesktop && <Text style={styles.sidebarLogo}>{t("appName")}</Text>}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarNav}>
        {PHARMACY_TABS.map(tab => {
          const active = currentRoute === tab.name || (currentRoute === "(pharmacy)" && tab.name === "index");
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.sidebarItem, active && styles.sidebarItemActive]}
              onPress={() => router.push(tab.name === "index" ? "/(pharmacy)" : `/(pharmacy)/${tab.name}` as any)}
            >
              <View style={{ position: "relative" }}>
                <Ionicons
                  name={(active ? tab.icon : tab.iconOff) as any}
                  size={22}
                  color={active ? Colors.primary : Colors.textMuted}
                />
                {tab.badge && tab.badge > 0 ? (
                  <View style={styles.sidebarBadge}>
                    <Text style={styles.sidebarBadgeText}>{tab.badge}</Text>
                  </View>
                ) : null}
              </View>
              {isDesktop && (
                <Text style={[styles.sidebarLabel, active && styles.sidebarLabelActive]}>
                  {tab.title}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.sidebarLogout} onPress={() => logout()}>
        <Ionicons name="log-out-outline" size={22} color={Colors.error} />
        {isDesktop && <Text style={styles.sidebarLogoutText}>{t("logout")}</Text>}
      </TouchableOpacity>
    </View>
  );
}

export default function PharmacyTabLayout() {
  const { useSidebar } = useLayout();

  if (useSidebar) {
    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: Colors.background }}>
        <SidebarNav />
        <View style={{ flex: 1 }}>
          <Tabs initialRouteName="index" screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
            <Tabs.Screen name="index" />
            <Tabs.Screen name="medicines" />
            <Tabs.Screen name="offers" />
            <Tabs.Screen name="rawakid" />
            <Tabs.Screen name="warehouses" />
            <Tabs.Screen name="orders" />
            <Tabs.Screen name="delivery" />
            <Tabs.Screen name="import" />
            <Tabs.Screen name="settings" />
            <Tabs.Screen name="integration" options={{ href: null }} />
          </Tabs>
        </View>
      </View>
    );
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : Colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "android" ? 64 : 68,
          paddingBottom: Platform.OS === "android" ? 8 : 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView intensity={95} tint="light" style={StyleSheet.absoluteFill} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "لوحتي",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medicines"
        options={{
          title: "أدويتي",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "medkit" : "medkit-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: "العروض",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "pricetag" : "pricetag-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rawakid"
        options={{
          title: "الرواكد",
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons name={focused ? "alert-circle" : "alert-circle-outline"} size={24} color={color} />
              {URGENT_COUNT > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{URGENT_COUNT}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="warehouses"
        options={{
          title: "المذاخر",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "business" : "business-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "الطلبات",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="delivery"
        options={{
          title: "التوصيل",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "car" : "car-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          title: "قاعدة البيانات",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "server" : "server-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "إعداداتي",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="integration"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute", top: -4, right: -8,
    backgroundColor: Colors.error, borderRadius: 8,
    minWidth: 16, height: 16, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  sidebar: {
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingHorizontal: 8,
    paddingBottom: 16,
    justifyContent: "space-between",
  },
  sidebarLogoRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 8, paddingBottom: 20,
  },
  sidebarLogo: { fontSize: 16, fontWeight: "800", color: Colors.primary },
  sidebarNav: { gap: 4 },
  sidebarItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 10, paddingVertical: 12, borderRadius: 12,
  },
  sidebarItemActive: { backgroundColor: Colors.primaryLight },
  sidebarLabel: { fontSize: 14, fontWeight: "600", color: Colors.textMuted },
  sidebarLabelActive: { color: Colors.primary, fontWeight: "700" },
  sidebarBadge: {
    position: "absolute", top: -4, right: -8,
    backgroundColor: Colors.error, borderRadius: 8,
    minWidth: 16, height: 16, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3,
  },
  sidebarBadgeText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  sidebarLogout: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 10, paddingVertical: 12, borderRadius: 12, marginTop: 8,
  },
  sidebarLogoutText: { fontSize: 14, fontWeight: "600", color: Colors.error },
});

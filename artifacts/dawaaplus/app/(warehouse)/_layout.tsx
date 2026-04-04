import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useRouter, useSegments } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useTranslation } from "@/i18n";
import { useLayout } from "@/hooks/useLayout";
import { useAuth } from "@/contexts/AuthContext";

const WH_COLOR = "#0D7A54";

const WAREHOUSE_TABS = [
  { name: "index", icon: "grid", iconOff: "grid-outline", tKey: "dashboard" },
  { name: "inventory", icon: "layers", iconOff: "layers-outline", tKey: "myInventory" },
  { name: "orders", icon: "cube", iconOff: "cube-outline", tKey: "orders" },
  { name: "pharmacies", icon: "storefront", iconOff: "storefront-outline", tKey: "linkedPharmacies" },
  { name: "delivery", icon: "car", iconOff: "car-outline", tKey: "settings" as const, label: "التوصيل" },
  { name: "import", icon: "cloud-download", iconOff: "cloud-download-outline", tKey: "import" as const },
  { name: "settings", icon: "settings", iconOff: "settings-outline", tKey: "settings" },
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
        <Ionicons name="cube" size={20} color={WH_COLOR} />
        {isDesktop && <Text style={[styles.sidebarLogo, { color: WH_COLOR }]}>{t("appName")}</Text>}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarNav}>
        {WAREHOUSE_TABS.map(tab => {
          const active = currentRoute === tab.name || (currentRoute === "(warehouse)" && tab.name === "index");
          const label = (tab as any).label ?? (tab.tKey === "import" ? "استيراد" : t(tab.tKey as any));
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.sidebarItem, active && styles.sidebarItemActive]}
              onPress={() => router.push(tab.name === "index" ? "/(warehouse)" : `/(warehouse)/${tab.name}` as any)}
            >
              <Ionicons
                name={(active ? tab.icon : tab.iconOff) as any}
                size={22}
                color={active ? WH_COLOR : Colors.textMuted}
              />
              {isDesktop && (
                <Text style={[styles.sidebarLabel, active && { color: WH_COLOR, fontWeight: "700" as const }]}>
                  {label}
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

export default function WarehouseTabLayout() {
  const { t } = useTranslation();
  const { useSidebar } = useLayout();

  if (useSidebar) {
    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: Colors.background }}>
        <SidebarNav />
        <View style={{ flex: 1 }}>
          <Tabs initialRouteName="index" screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
            <Tabs.Screen name="index" />
            <Tabs.Screen name="inventory" />
            <Tabs.Screen name="orders" />
            <Tabs.Screen name="pharmacies" />
            <Tabs.Screen name="delivery" />
            <Tabs.Screen name="import" />
            <Tabs.Screen name="settings" />
          </Tabs>
        </View>
      </View>
    );
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: WH_COLOR,
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
          title: t("dashboard"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: t("myInventory"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "layers" : "layers-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("orders"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pharmacies"
        options={{
          title: t("linkedPharmacies"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "storefront" : "storefront-outline"} size={24} color={color} />
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
          title: "استيراد",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cloud-download" : "cloud-download-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
  sidebarLogo: { fontSize: 16, fontWeight: "800" },
  sidebarNav: { gap: 4 },
  sidebarItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 10, paddingVertical: 12, borderRadius: 12,
  },
  sidebarItemActive: { backgroundColor: "#E8F5F0" },
  sidebarLabel: { fontSize: 14, fontWeight: "600", color: Colors.textMuted },
  sidebarLogout: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 10, paddingVertical: 12, borderRadius: 12, marginTop: 8,
  },
  sidebarLogoutText: { fontSize: 14, fontWeight: "600", color: Colors.error },
});

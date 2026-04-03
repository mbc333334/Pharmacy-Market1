import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter, useSegments } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useLayout } from "@/hooks/useLayout";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_COLOR = "#7C3AED";

const ADMIN_TABS = [
  { name: "index", title: "الرئيسية", icon: "grid", iconOff: "grid-outline" },
  { name: "subscriptions", title: "الاشتراكات", icon: "card", iconOff: "card-outline" },
  { name: "ads", title: "الإعلانات", icon: "megaphone", iconOff: "megaphone-outline" },
  { name: "pharmacies", title: "الصيادلة", icon: "storefront", iconOff: "storefront-outline" },
];

function SidebarNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const { isDesktop, sidebarWidth } = useLayout();
  const { logout } = useAuth();
  const currentRoute = (segments as string[])[segments.length - 1] || "index";

  return (
    <View style={[styles.sidebar, {
      width: sidebarWidth,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20),
      borderRightColor: ADMIN_COLOR + "20",
    }]}>
      <View style={styles.sidebarLogoRow}>
        <View style={[styles.adminBadge, { backgroundColor: ADMIN_COLOR }]}>
          <Ionicons name="shield" size={14} color="#fff" />
        </View>
        {isDesktop && <Text style={[styles.sidebarLogo, { color: ADMIN_COLOR }]}>لوحة الإدارة</Text>}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarNav}>
        {ADMIN_TABS.map(tab => {
          const active = currentRoute === tab.name || (currentRoute === "(admin)" && tab.name === "index");
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.sidebarItem, active && { backgroundColor: ADMIN_COLOR + "15" }]}
              onPress={() => router.push(tab.name === "index" ? "/(admin)" : `/(admin)/${tab.name}` as any)}
            >
              <Ionicons
                name={(active ? tab.icon : tab.iconOff) as any}
                size={22}
                color={active ? ADMIN_COLOR : Colors.textMuted}
              />
              {isDesktop && (
                <Text style={[styles.sidebarLabel, active && { color: ADMIN_COLOR, fontWeight: "700" }]}>
                  {tab.title}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.sidebarLogout} onPress={() => logout()}>
        <Ionicons name="log-out-outline" size={22} color={Colors.error} />
        {isDesktop && <Text style={styles.sidebarLogoutText}>تسجيل الخروج</Text>}
      </TouchableOpacity>
    </View>
  );
}

export default function AdminTabLayout() {
  const { useSidebar } = useLayout();

  if (useSidebar) {
    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: Colors.background }}>
        <SidebarNav />
        <View style={{ flex: 1 }}>
          <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
            <Tabs.Screen name="index" />
            <Tabs.Screen name="subscriptions" />
            <Tabs.Screen name="ads" />
            <Tabs.Screen name="pharmacies" />
          </Tabs>
        </View>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ADMIN_COLOR,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "android" ? 64 : 68,
          paddingBottom: Platform.OS === "android" ? 8 : 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "الرئيسية", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="subscriptions" options={{ title: "الاشتراكات", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "card" : "card-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="ads" options={{ title: "الإعلانات", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "megaphone" : "megaphone-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="pharmacies" options={{ title: "الصيادلة", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "storefront" : "storefront-outline"} size={24} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: "#fff",
    borderRightWidth: 1,
    paddingHorizontal: 8,
    paddingBottom: 16,
    justifyContent: "space-between",
  },
  adminBadge: {
    width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  sidebarLogoRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8, paddingBottom: 20 },
  sidebarLogo: { fontSize: 15, fontWeight: "800" },
  sidebarNav: { gap: 4 },
  sidebarItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 10, paddingVertical: 12, borderRadius: 12,
  },
  sidebarLabel: { fontSize: 14, fontWeight: "600", color: Colors.textMuted },
  sidebarLogout: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 10, paddingVertical: 12, borderRadius: 12, marginTop: 8,
  },
  sidebarLogoutText: { fontSize: 14, fontWeight: "600", color: Colors.error },
});

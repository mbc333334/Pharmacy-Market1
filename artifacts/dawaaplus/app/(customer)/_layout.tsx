import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useRouter, useSegments } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useCart } from "@/contexts/CartContext";
import { useLayout } from "@/hooks/useLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n";

const CUSTOMER_TABS = [
  { name: "index", title: "الرئيسية", icon: "home", iconOff: "home-outline" },
  { name: "browse", title: "تصفح", icon: "search", iconOff: "search-outline" },
  { name: "pharmacies", title: "الصيدليات", icon: "storefront", iconOff: "storefront-outline" },
  { name: "cart", title: "سلتي", icon: "cart", iconOff: "cart-outline" },
  { name: "profile", title: "حسابي", icon: "person", iconOff: "person-outline" },
];

function CartTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { totalItems } = useCart();
  return (
    <View>
      <Ionicons name={focused ? "cart" : "cart-outline"} size={24} color={color} />
      {totalItems > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalItems > 9 ? "9+" : totalItems}</Text>
        </View>
      )}
    </View>
  );
}

function SidebarNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const { isDesktop, sidebarWidth } = useLayout();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { totalItems } = useCart();
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
        {CUSTOMER_TABS.map(tab => {
          const active = currentRoute === tab.name || (currentRoute === "(customer)" && tab.name === "index");
          const isCart = tab.name === "cart";
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.sidebarItem, active && styles.sidebarItemActive]}
              onPress={() => router.push(tab.name === "index" ? "/(customer)" : `/(customer)/${tab.name}` as any)}
            >
              <View style={{ position: "relative" }}>
                {isCart
                  ? <CartTabIcon color={active ? Colors.primary : Colors.textMuted} focused={active} />
                  : <Ionicons
                      name={(active ? tab.icon : tab.iconOff) as any}
                      size={22}
                      color={active ? Colors.primary : Colors.textMuted}
                    />
                }
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

      {user ? (
        <TouchableOpacity style={styles.sidebarLogout} onPress={() => logout()}>
          <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          {isDesktop && <Text style={styles.sidebarLogoutText}>{t("logout")}</Text>}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.sidebarLogin} onPress={() => router.push("/(auth)/login")}>
          <Ionicons name="log-in-outline" size={22} color={Colors.primary} />
          {isDesktop && <Text style={styles.sidebarLoginText}>تسجيل الدخول</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function CustomerTabLayout() {
  const { useSidebar } = useLayout();
  const { t } = useTranslation();

  if (useSidebar) {
    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: Colors.background }}>
        <SidebarNav />
        <View style={{ flex: 1 }}>
          <Tabs initialRouteName="index" screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
            <Tabs.Screen name="index" />
            <Tabs.Screen name="browse" />
            <Tabs.Screen name="pharmacies" />
            <Tabs.Screen name="cart" />
            <Tabs.Screen name="profile" />
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
          title: t("home"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: t("browse"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pharmacies"
        options={{
          title: t("pharmacies"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "storefront" : "storefront-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t("cart"),
          tabBarIcon: ({ color, focused }) => <CartTabIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute", top: -4, right: -8,
    backgroundColor: Colors.error, borderRadius: 9,
    minWidth: 18, height: 18, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3, borderWidth: 1.5, borderColor: Colors.surface,
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
  sidebarLogout: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 10, paddingVertical: 12, borderRadius: 12, marginTop: 8,
  },
  sidebarLogoutText: { fontSize: 14, fontWeight: "600", color: Colors.error },
  sidebarLogin: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 10, paddingVertical: 12, borderRadius: 12, marginTop: 8,
    backgroundColor: Colors.primaryLight,
  },
  sidebarLoginText: { fontSize: 14, fontWeight: "600", color: Colors.primary },
});

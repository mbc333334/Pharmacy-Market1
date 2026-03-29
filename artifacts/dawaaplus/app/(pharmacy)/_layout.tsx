import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import Colors from "@/constants/colors";
import { RAWAKID } from "@/data/rawakidData";

const URGENT_COUNT = RAWAKID.filter(r => r.daysLeft <= 60).length;

export default function PharmacyTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : Colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "web" ? 84 : 68,
          paddingBottom: Platform.OS === "web" ? 34 : Platform.OS === "android" ? 8 : 0,
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
        name="rawakid"
        options={{
          title: "الرواكد",
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons name={focused ? "pricetag" : "pricetag-outline"} size={24} color={color} />
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
        name="orders"
        options={{
          title: "الطلبات",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={24} color={color} />
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
});

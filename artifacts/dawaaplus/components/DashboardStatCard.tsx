import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface Props {
  icon: any;
  value: string;
  label: string;
  color: string;
  badge?: number;
}

export default function DashboardStatCard({ icon, value, label, color, badge }: Props) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      {badge ? (
        <View style={[styles.statBadge, { backgroundColor: Colors.error }]}>
          <Text style={styles.statBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 16, width: 120, alignItems: "center", gap: 6,
    borderTopWidth: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    position: "relative",
  },
  statBadge: {
    position: "absolute", top: -6, right: -6,
    borderRadius: 10, minWidth: 20, height: 20,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
    borderWidth: 2, borderColor: Colors.surface,
  },
  statBadgeText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  statValue: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textMuted, textAlign: "center" },
});

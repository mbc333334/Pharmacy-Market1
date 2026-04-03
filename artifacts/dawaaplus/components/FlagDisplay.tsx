import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  langCode: string;
  size?: number;
}

export default function FlagDisplay({ langCode, size = 22 }: Props) {
  if (langCode === "ku") {
    const w = Math.round(size * 1.5);
    const h = size;
    const stripeH = Math.round(h / 3);
    const sunSize = Math.round(h * 0.52);
    return (
      <View style={{ width: w, height: h, borderRadius: 3, overflow: "hidden" }}>
        <View style={{ height: stripeH, backgroundColor: "#EF2B2D" }} />
        <View style={{ height: stripeH, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
          <View style={{
            width: sunSize, height: sunSize, borderRadius: sunSize / 2,
            backgroundColor: "#F7C847",
            position: "absolute",
          }} />
        </View>
        <View style={{ height: stripeH, backgroundColor: "#007A3D" }} />
      </View>
    );
  }

  const flags: Record<string, string> = {
    ar: "🇮🇶",
    en: "🇬🇧",
  };

  return <Text style={{ fontSize: size }}>{flags[langCode] ?? "🌐"}</Text>;
}

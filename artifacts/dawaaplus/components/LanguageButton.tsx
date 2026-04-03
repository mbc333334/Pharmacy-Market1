import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable,
} from "react-native";
import Colors from "@/constants/colors";
import { LANGUAGES } from "@/data/locales";
import { useTranslation } from "@/i18n";

interface Props {
  iconColor?: string;
  style?: object;
}

export default function LanguageButton({ iconColor = Colors.textPrimary, style }: Props) {
  const { lang, setLang } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  return (
    <>
      <TouchableOpacity style={[styles.btn, style]} onPress={() => setOpen(true)}>
        <Text style={styles.flag}>{current.flag}</Text>
        <Ionicons name="chevron-down" size={12} color={iconColor} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>اختر اللغة / زمانەکە دیاربکە</Text>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l.code}
                style={[styles.menuItem, lang === l.code && styles.menuItemActive]}
                onPress={() => { setLang(l.code as any); setOpen(false); }}
              >
                <Ionicons
                  name={lang === l.code ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={lang === l.code ? Colors.primary : Colors.textMuted}
                />
                <Text style={styles.menuFlag}>{l.flag}</Text>
                <Text style={[styles.menuName, lang === l.code && styles.menuNameActive]}>
                  {l.nativeName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
  },
  flag: { fontSize: 18 },
  backdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-start", alignItems: "flex-end",
    paddingTop: 80, paddingRight: 16,
  },
  menu: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 16, minWidth: 200,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 12,
  },
  menuTitle: {
    fontSize: 12, color: Colors.textMuted, textAlign: "center",
    marginBottom: 12, fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 12, paddingHorizontal: 10,
    borderRadius: 12,
  },
  menuItemActive: { backgroundColor: Colors.primaryLight },
  menuFlag: { fontSize: 22 },
  menuName: { fontSize: 15, color: Colors.textSecondary, flex: 1 },
  menuNameActive: { color: Colors.primary, fontWeight: "700" },
});

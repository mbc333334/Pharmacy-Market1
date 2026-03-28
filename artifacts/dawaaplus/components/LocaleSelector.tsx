import { Ionicons } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, FlatList, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Language, Country } from "@/data/locales";

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  data: Language[];
  selected: Language;
  onSelect: (lang: Language) => void;
}

export function LanguageSelector({ visible, onClose, data, selected, onSelect }: LanguageSelectorProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  }, [query, data]);

  const handleSelect = (lang: Language) => {
    onSelect(lang);
    setQuery("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modal, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16) }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => { setQuery(""); onClose(); }}>
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>اختيار اللغة</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن اللغة..."
            value={query}
            onChangeText={setQuery}
            textAlign="right"
            placeholderTextColor={Colors.textMuted}
            autoCorrect={false}
          />
          <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginHorizontal: 10 }} />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={l => l.code}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isSelected = selected.code === item.code;
            return (
              <TouchableOpacity
                style={[styles.item, isSelected && styles.itemSelected, index === 0 && styles.itemFirst]}
                onPress={() => handleSelect(item)}
              >
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                )}
                <View style={styles.itemContent}>
                  <Text style={[styles.itemNative, isSelected && { color: Colors.primary }]}>
                    {item.nativeName}
                  </Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
                <View style={styles.itemLeft}>
                  {item.rtl && (
                    <View style={styles.rtlBadge}>
                      <Text style={styles.rtlText}>RTL</Text>
                    </View>
                  )}
                  <Text style={styles.itemFlag}>{item.flag}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>لا توجد نتائج</Text>
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

interface CountrySelectorProps {
  visible: boolean;
  onClose: () => void;
  data: Country[];
  selected: Country;
  onSelect: (country: Country) => void;
}

export function CountrySelector({ visible, onClose, data, selected, onSelect }: CountrySelectorProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.nameAr.includes(query) ||
      c.code.toLowerCase().includes(q) ||
      c.dialCode.includes(query)
    );
  }, [query, data]);

  const handleSelect = (country: Country) => {
    onSelect(country);
    setQuery("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modal, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16) }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => { setQuery(""); onClose(); }}>
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>اختيار البلد</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن البلد..."
            value={query}
            onChangeText={setQuery}
            textAlign="right"
            placeholderTextColor={Colors.textMuted}
            autoCorrect={false}
          />
          <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginHorizontal: 10 }} />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={c => c.code + c.nameAr}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isSelected = selected.code === item.code && selected.nameAr === item.nameAr;
            return (
              <TouchableOpacity
                style={[styles.item, isSelected && styles.itemSelected, index === 0 && styles.itemFirst]}
                onPress={() => handleSelect(item)}
              >
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                )}
                <View style={styles.itemContent}>
                  <Text style={[styles.itemNative, isSelected && { color: Colors.primary }]}>
                    {item.nameAr}
                  </Text>
                  <Text style={styles.itemName}>{item.name} • {item.dialCode}</Text>
                </View>
                <Text style={styles.itemFlag}>{item.flag}</Text>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>لا توجد نتائج</Text>
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: Colors.surface },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.surfaceAlt, alignItems: "center", justifyContent: "center",
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary },
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    marginHorizontal: 16, marginVertical: 12, paddingHorizontal: 4,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary },
  item: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  itemFirst: { paddingTop: 14 },
  itemSelected: { backgroundColor: Colors.primaryLight },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  itemFlag: { fontSize: 28 },
  itemContent: { flex: 1, alignItems: "flex-end" },
  itemNative: { fontSize: 16, fontWeight: "600", color: Colors.textPrimary },
  itemName: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  rtlBadge: {
    backgroundColor: Colors.accentLight, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  rtlText: { fontSize: 9, fontWeight: "700", color: Colors.warning },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 60 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: Colors.textMuted },
});

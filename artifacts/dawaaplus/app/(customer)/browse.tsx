import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Platform, Linking, Modal, Image,
  ActivityIndicator, ScrollView, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useCart } from "@/contexts/CartContext";
import { CATEGORIES, SAMPLE_MEDICINES, Medicine } from "@/data/sampleData";

const PHARMACIES = [
  { id: "1", name: "صيدلية الشفاء", city: "هەولێر", phone: "+9647701234567", whatsapp: "9647701234567" },
  { id: "2", name: "صيدلية النور", city: "سلێمانی", phone: "+9647507654321", whatsapp: "9647507654321" },
  { id: "3", name: "صيدلية الأمل", city: "دهوك", phone: "+9647809876543", whatsapp: "9647809876543" },
];

const IMAGE_KEYWORD_MAP: Record<string, string[]> = {
  "باراسيتامول": ["Paracetamol 500mg", "باناكول 500mg"],
  "paracetamol": ["Paracetamol 500mg", "باناكول 500mg"],
  "panadol": ["Paracetamol 500mg"],
  "amoxicillin": ["أموكسيسيلين 500mg"],
  "ibuprofen": ["إيبوبروفين 400mg"],
  "omeprazole": ["أوميبرازول 20mg"],
  "metformin": ["ميتفورمين 850mg"],
  "vitamin": ["فيتامين C 1000mg", "فيتامين D3 1000IU"],
  "insulin": ["أنسولين لانتوس", "أنسولين نوفورابيد"],
};

function simulateImageSearch(uri: string): Promise<Medicine[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const shuffled = [...SAMPLE_MEDICINES].sort(() => Math.random() - 0.5);
      resolve(shuffled.slice(0, Math.floor(Math.random() * 3) + 2));
    }, 2200);
  });
}

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const { addItem, isInCart } = useCart();
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [showContact, setShowContact] = useState<Medicine | null>(null);
  const inputRef = useRef<TextInput>(null);

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return SAMPLE_MEDICINES.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.brand.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  const filtered = useMemo(() => {
    return SAMPLE_MEDICINES.filter(m => {
      const matchQuery = !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.brand.toLowerCase().includes(query.toLowerCase());
      const matchCat = selectedCat === "all" || m.categoryId === selectedCat;
      return matchQuery && matchCat;
    });
  }, [query, selectedCat]);

  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const handleSelectSuggestion = (med: Medicine) => {
    setQuery(med.name);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setShowSuggestions(text.length >= 2);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.title}>تصفح الأدوية</Text>
        <View style={styles.searchRow}>
          {/* Image Search Button */}
          <TouchableOpacity
            style={styles.imgSearchBtn}
            onPress={() => setShowImageSearch(true)}
          >
            <Ionicons name="camera" size={20} color={Colors.primary} />
          </TouchableOpacity>

          {/* Search Input */}
          <View style={styles.searchWrap}>
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(""); setShowSuggestions(false); }}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="ابحث بالاسم أو العلامة التجارية..."
              value={query}
              onChangeText={handleQueryChange}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              textAlign="right"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="search"
            />
            <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginHorizontal: 8 }} />
          </View>
        </View>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsBox}>
            {suggestions.map((med, i) => (
              <TouchableOpacity
                key={med.id}
                style={[styles.suggestionItem, i < suggestions.length - 1 && styles.suggestionBorder]}
                onPress={() => handleSelectSuggestion(med)}
              >
                <View style={styles.suggestionRight}>
                  <Text style={styles.suggestionName}>{med.name}</Text>
                  <Text style={styles.suggestionMeta}>{med.brand} • {med.category}</Text>
                </View>
                <View style={[styles.suggestionIcon, { backgroundColor: med.color + "18" }]}>
                  <Ionicons name="medkit" size={16} color={med.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Category Filter */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={c => c.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[styles.catChip, selectedCat === cat.id && styles.catChipActive]}
              onPress={() => setSelectedCat(cat.id)}
            >
              <Text style={[styles.catText, selectedCat === cat.id && styles.catTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.resultCount}>{filtered.length} منتج متاح</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MedicineRow
            medicine={item}
            inCart={isInCart(item.id)}
            onAdd={() => addItem({
              medicineId: item.id,
              name: item.name,
              brand: item.brand,
              price: item.price,
              pharmacyId: item.pharmacyId,
              pharmacyName: item.pharmacyName,
              requiresPrescription: item.requiresPrescription,
              color: item.color,
            })}
            onContact={() => setShowContact(item)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>لم يتم العثور على نتائج</Text>
            <Text style={styles.emptySubText}>جرّب البحث بالصورة أو كلمة أخرى</Text>
            <TouchableOpacity
              style={styles.imgSearchEmptyBtn}
              onPress={() => setShowImageSearch(true)}
            >
              <Ionicons name="camera-outline" size={18} color="#fff" />
              <Text style={styles.imgSearchEmptyText}>بحث بالصورة</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Image Search Modal */}
      <ImageSearchModal
        visible={showImageSearch}
        onClose={() => setShowImageSearch(false)}
        onResults={(results) => {
          setShowImageSearch(false);
          setQuery("نتائج البحث بالصورة");
          setShowSuggestions(false);
        }}
        onAddItem={(med) => addItem({
          medicineId: med.id,
          name: med.name,
          brand: med.brand,
          price: med.price,
          pharmacyId: med.pharmacyId,
          pharmacyName: med.pharmacyName,
          requiresPrescription: med.requiresPrescription,
          color: med.color,
        })}
        isInCart={isInCart}
      />

      {/* Contact Pharmacist Modal */}
      {showContact && (
        <ContactPharmacistModal
          medicine={showContact}
          onClose={() => setShowContact(null)}
        />
      )}
    </View>
  );
}

function MedicineRow({ medicine, inCart, onAdd, onContact }: {
  medicine: Medicine;
  inCart: boolean;
  onAdd: () => void;
  onContact: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <TouchableOpacity
          style={[styles.addBtn, inCart && styles.addBtnDone]}
          onPress={onAdd}
          disabled={inCart}
        >
          <Ionicons name={inCart ? "checkmark" : "add"} size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactBtn} onPress={onContact}>
          <Ionicons name="chatbubble-ellipses" size={16} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.priceCol}>
          <Text style={styles.rowPrice}>{medicine.price.toFixed(0)} د.ع</Text>
          {medicine.originalPrice && (
            <Text style={styles.originalPrice}>{medicine.originalPrice.toFixed(0)}</Text>
          )}
        </View>
      </View>

      <View style={styles.rowContent}>
        <View style={styles.rowNameRow}>
          {medicine.requiresPrescription && (
            <View style={styles.rxBadge}><Text style={styles.rxText}>Rx</Text></View>
          )}
          <Text style={styles.rowName} numberOfLines={1}>{medicine.name}</Text>
        </View>
        <Text style={styles.rowBrand}>{medicine.brand} • {medicine.pharmacyName}</Text>
        <Text style={styles.rowDesc} numberOfLines={2}>{medicine.description}</Text>
        <View style={styles.rowMeta}>
          <View style={[styles.stockBadge, { backgroundColor: medicine.stock > 20 ? Colors.successLight : Colors.warningLight }]}>
            <Text style={[styles.stockText, { color: medicine.stock > 20 ? Colors.success : Colors.warning }]}>
              {medicine.stock > 20 ? "متوفر" : `باقي ${medicine.stock}`}
            </Text>
          </View>
          <Text style={styles.rowRating}>⭐ {medicine.rating} ({medicine.reviews})</Text>
        </View>
      </View>

      <View style={[styles.rowIcon, { backgroundColor: medicine.color + "18" }]}>
        <Ionicons name="medkit" size={28} color={medicine.color} />
      </View>
    </View>
  );
}

function ImageSearchModal({ visible, onClose, onResults, onAddItem, isInCart }: {
  visible: boolean;
  onClose: () => void;
  onResults: (r: Medicine[]) => void;
  onAddItem: (m: Medicine) => void;
  isInCart: (id: string) => boolean;
}) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<"choose" | "analyzing" | "results">("choose");
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [results, setResults] = useState<Medicine[]>([]);

  const resetModal = () => {
    setPhase("choose");
    setPickedUri(null);
    setResults([]);
  };

  const handleClose = () => { resetModal(); onClose(); };

  const pickImage = async (source: "camera" | "gallery") => {
    let result;
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("صلاحية الكاميرا", "يرجى السماح بالوصول إلى الكاميرا من الإعدادات");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });
    }

    if (!result.canceled && result.assets[0]) {
      setPickedUri(result.assets[0].uri);
      setPhase("analyzing");
      const found = await simulateImageSearch(result.assets[0].uri);
      setResults(found);
      setPhase("results");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.imgModal, { paddingTop: insets.top + 16 }]}>
        <View style={styles.imgModalHeader}>
          <TouchableOpacity onPress={handleClose} style={styles.imgModalClose}>
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.imgModalTitle}>
            {phase === "choose" ? "بحث بالصورة" : phase === "analyzing" ? "جاري التحليل..." : "نتائج البحث"}
          </Text>
          {phase === "results" && (
            <TouchableOpacity onPress={resetModal}>
              <Text style={styles.imgModalRetry}>مجدداً</Text>
            </TouchableOpacity>
          )}
          {phase !== "results" && <View style={{ width: 60 }} />}
        </View>

        {phase === "choose" && (
          <View style={styles.imgChooseBody}>
            <View style={styles.imgChooseHero}>
              <View style={styles.imgChooseIconWrap}>
                <Ionicons name="scan-circle" size={96} color={Colors.primary} />
              </View>
              <Text style={styles.imgChooseTitle}>ابحث عن الدواء بالصورة</Text>
              <Text style={styles.imgChooseSub}>
                التقط صورة لعبوة الدواء أو صورة الوصفة الطبية وسيتعرف عليه التطبيق تلقائياً
              </Text>
            </View>

            <View style={styles.imgOptions}>
              <TouchableOpacity
                style={[styles.imgOption, { borderColor: Colors.primary }]}
                onPress={() => pickImage("camera")}
              >
                <View style={[styles.imgOptionIcon, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name="camera" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.imgOptionTitle}>التقاط صورة</Text>
                <Text style={styles.imgOptionSub}>افتح الكاميرا</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.imgOption, { borderColor: "#7C3AED" }]}
                onPress={() => pickImage("gallery")}
              >
                <View style={[styles.imgOptionIcon, { backgroundColor: "#F3E8FF" }]}>
                  <Ionicons name="images" size={32} color="#7C3AED" />
                </View>
                <Text style={styles.imgOptionTitle}>من المعرض</Text>
                <Text style={styles.imgOptionSub}>اختر صورة موجودة</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.imgTip}>
              <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
              <Text style={styles.imgTipText}>
                تأكد أن الضوء جيد وأن الباركود أو اسم الدواء واضح في الصورة
              </Text>
            </View>

            {Platform.OS === "web" && (
              <View style={styles.webNote}>
                <Ionicons name="phone-portrait-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.webNoteText}>
                  ميزة الكاميرا تعمل بشكل أفضل على تطبيق الهاتف
                </Text>
              </View>
            )}
          </View>
        )}

        {phase === "analyzing" && (
          <View style={styles.analyzingBody}>
            {pickedUri && (
              <Image source={{ uri: pickedUri }} style={styles.analyzingImg} />
            )}
            <View style={styles.analyzingOverlay}>
              <View style={styles.analyzingScanFrame}>
                <View style={[styles.scanCorner, styles.scanTL]} />
                <View style={[styles.scanCorner, styles.scanTR]} />
                <View style={[styles.scanCorner, styles.scanBL]} />
                <View style={[styles.scanCorner, styles.scanBR]} />
              </View>
            </View>
            <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 20 }} />
            <Text style={styles.analyzingText}>جاري تحليل الصورة والتعرف على الدواء...</Text>
            <Text style={styles.analyzingSub}>يتم البحث في قاعدة البيانات الدوائية</Text>
          </View>
        )}

        {phase === "results" && (
          <ScrollView contentContainerStyle={styles.resultsBody} showsVerticalScrollIndicator={false}>
            {pickedUri && (
              <View style={styles.resultThumbRow}>
                <Image source={{ uri: pickedUri }} style={styles.resultThumb} />
                <View style={styles.resultThumbInfo}>
                  <View style={styles.resultFoundBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <Text style={styles.resultFoundText}>تم التعرف على {results.length} نتيجة</Text>
                  </View>
                  <Text style={styles.resultThumbSub}>
                    نتائج بناءً على تحليل الصورة
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.resultsTitle}>الأدوية المقترحة</Text>
            {results.map(med => (
              <View key={med.id} style={styles.resultRow}>
                <TouchableOpacity
                  style={[styles.resultAddBtn, isInCart(med.id) && styles.resultAddBtnDone]}
                  onPress={() => onAddItem(med)}
                  disabled={isInCart(med.id)}
                >
                  <Ionicons name={isInCart(med.id) ? "checkmark" : "add"} size={16} color="#fff" />
                </TouchableOpacity>
                <View style={styles.resultRowContent}>
                  <Text style={styles.resultMedName}>{med.name}</Text>
                  <Text style={styles.resultMedBrand}>{med.brand} • {med.pharmacyName}</Text>
                  <Text style={styles.resultMedPrice}>{med.price.toFixed(0)} د.ع</Text>
                </View>
                <View style={[styles.resultMedIcon, { backgroundColor: med.color + "18" }]}>
                  <Ionicons name="medkit" size={26} color={med.color} />
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.retryBtn} onPress={resetModal}>
              <Ionicons name="camera-outline" size={18} color={Colors.primary} />
              <Text style={styles.retryBtnText}>بحث بصورة أخرى</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function ContactPharmacistModal({ medicine, onClose }: { medicine: Medicine; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const pharmacy = PHARMACIES.find(p => p.id === medicine.pharmacyId) ?? PHARMACIES[0];

  const openWhatsApp = (msg?: string) => {
    const text = msg
      ?? `مرحباً، أريد الاستفسار عن ${medicine.name} - ${medicine.brand} (${medicine.price.toFixed(0)} د.ع)`;
    Linking.openURL(`https://wa.me/${pharmacy.whatsapp}?text=${encodeURIComponent(text)}`);
  };

  const callPharmacy = () => {
    Linking.openURL(`tel:${pharmacy.phone}`);
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.contactModal, { paddingTop: insets.top + 16 }]}>
        <View style={styles.contactHeader}>
          <TouchableOpacity onPress={onClose} style={styles.imgModalClose}>
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.contactTitle}>تواصل مع الصيدلي</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Medicine Info */}
        <View style={styles.contactMedCard}>
          <View style={[styles.contactMedIcon, { backgroundColor: medicine.color + "18" }]}>
            <Ionicons name="medkit" size={32} color={medicine.color} />
          </View>
          <View style={styles.contactMedInfo}>
            <Text style={styles.contactMedName}>{medicine.name}</Text>
            <Text style={styles.contactMedBrand}>{medicine.brand}</Text>
            <Text style={styles.contactMedPrice}>{medicine.price.toFixed(0)} د.ع</Text>
          </View>
        </View>

        {/* Pharmacy Info */}
        <View style={styles.pharmacyCard}>
          <View style={styles.pharmacyIconWrap}>
            <Ionicons name="storefront" size={28} color={Colors.primary} />
          </View>
          <View style={styles.pharmacyInfo}>
            <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
            <Text style={styles.pharmacyCity}>
              <Ionicons name="location-outline" size={12} /> {pharmacy.city}
            </Text>
            <Text style={styles.pharmacyPhone}>{pharmacy.phone}</Text>
          </View>
        </View>

        {/* Contact Options */}
        <Text style={styles.contactOptionsTitle}>طرق التواصل</Text>

        <TouchableOpacity
          style={styles.contactOption}
          onPress={() => openWhatsApp()}
        >
          <View style={styles.contactOptionRight}>
            <Text style={styles.contactOptionTitle}>واتساب</Text>
            <Text style={styles.contactOptionSub}>تحدّث مع الصيدلي مباشرةً</Text>
          </View>
          <View style={[styles.contactOptionIcon, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactOption, { borderColor: Colors.primary + "40" }]}
          onPress={() => openWhatsApp(`مرحباً، أريد الاستفسار عن توفر ${medicine.name} والأسعار`)}
        >
          <View style={styles.contactOptionRight}>
            <Text style={styles.contactOptionTitle}>استفسار عن الدواء</Text>
            <Text style={styles.contactOptionSub}>سؤال جاهز عن {medicine.name}</Text>
          </View>
          <View style={[styles.contactOptionIcon, { backgroundColor: Colors.primaryLight }]}>
            <Ionicons name="chatbubble-ellipses" size={26} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactOption, { borderColor: "#2563EB40" }]}
          onPress={callPharmacy}
        >
          <View style={styles.contactOptionRight}>
            <Text style={styles.contactOptionTitle}>مكالمة هاتفية</Text>
            <Text style={styles.contactOptionSub}>{pharmacy.phone}</Text>
          </View>
          <View style={[styles.contactOptionIcon, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="call" size={26} color="#2563EB" />
          </View>
        </TouchableOpacity>

        <View style={styles.contactNote}>
          <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.contactNoteText}>
            أوقات العمل: 8 صباحاً — 11 مساءً • 7 أيام في الأسبوع
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    zIndex: 10,
  },
  title: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 12 },
  searchRow: { flexDirection: "row", gap: 8, marginBottom: 10, alignItems: "center" },
  imgSearchBtn: {
    width: 46, height: 46, borderRadius: 13,
    backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: Colors.primary + "30",
  },
  searchWrap: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surfaceAlt, borderRadius: 13,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 4,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary },

  suggestionsBox: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  suggestionRight: { flex: 1, alignItems: "flex-end" },
  suggestionName: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary },
  suggestionMeta: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  suggestionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  catList: { paddingBottom: 8, gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surfaceAlt, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  catTextActive: { color: "#fff" },
  resultCount: { fontSize: 12, color: Colors.textMuted, textAlign: "right", paddingBottom: 8, paddingTop: 4 },

  list: { padding: 16, gap: 12, paddingBottom: 100 },
  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 14, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  rowIcon: { width: 60, height: 60, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rowContent: { flex: 1 },
  rowNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 2 },
  rowName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right", flex: 1 },
  rowBrand: { fontSize: 12, color: Colors.textMuted, textAlign: "right", marginBottom: 4 },
  rowDesc: { fontSize: 12, color: Colors.textSecondary, textAlign: "right", lineHeight: 18, marginBottom: 6 },
  rowMeta: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  stockBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  stockText: { fontSize: 11, fontWeight: "600" },
  rowRating: { fontSize: 11, color: Colors.textSecondary },
  rxBadge: { backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  rxText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  rowLeft: { alignItems: "center", gap: 8 },
  priceCol: { alignItems: "center" },
  rowPrice: { fontSize: 14, fontWeight: "800", color: Colors.primary, textAlign: "center" },
  originalPrice: { fontSize: 10, color: Colors.textMuted, textDecorationLine: "line-through" },
  addBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
  },
  addBtnDone: { backgroundColor: Colors.success },
  contactBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center",
  },

  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: "700", color: Colors.textSecondary },
  emptySubText: { fontSize: 14, color: Colors.textMuted },
  imgSearchEmptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 12, marginTop: 8,
  },
  imgSearchEmptyText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  imgModal: { flex: 1, backgroundColor: Colors.surface },
  imgModalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  imgModalTitle: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary },
  imgModalClose: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceAlt, alignItems: "center", justifyContent: "center",
  },
  imgModalRetry: { fontSize: 14, color: Colors.primary, fontWeight: "600" },

  imgChooseBody: { flex: 1, padding: 24, gap: 24 },
  imgChooseHero: { alignItems: "center", gap: 12, paddingTop: 16 },
  imgChooseIconWrap: {
    backgroundColor: Colors.primaryLight, borderRadius: 30,
    padding: 16,
  },
  imgChooseTitle: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, textAlign: "center" },
  imgChooseSub: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 22 },
  imgOptions: { flexDirection: "row", gap: 12 },
  imgOption: {
    flex: 1, alignItems: "center", gap: 10,
    backgroundColor: Colors.background, borderRadius: 18,
    padding: 20, borderWidth: 2,
  },
  imgOptionIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  imgOptionTitle: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary },
  imgOptionSub: { fontSize: 12, color: Colors.textMuted },
  imgTip: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 12,
  },
  imgTipText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 20 },
  webNote: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 12,
  },
  webNoteText: { flex: 1, fontSize: 13, color: Colors.textMuted },

  analyzingBody: { flex: 1, alignItems: "center", padding: 24, gap: 20, paddingTop: 40 },
  analyzingImg: {
    width: "100%", height: 200, borderRadius: 16,
    backgroundColor: Colors.border,
  },
  analyzingOverlay: {
    position: "absolute", top: 40, left: 24, right: 24, height: 200,
    alignItems: "center", justifyContent: "center",
  },
  analyzingScanFrame: {
    width: 140, height: 100, position: "relative",
  },
  scanCorner: {
    position: "absolute", width: 20, height: 20,
    borderColor: Colors.primary,
  },
  scanTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  scanTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  scanBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  scanBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },
  analyzingText: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary, textAlign: "center" },
  analyzingSub: { fontSize: 13, color: Colors.textMuted, textAlign: "center" },

  resultsBody: { padding: 20, gap: 14, paddingBottom: 60 },
  resultThumbRow: {
    flexDirection: "row", gap: 14, alignItems: "center",
    backgroundColor: Colors.background, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  resultThumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: Colors.border },
  resultThumbInfo: { flex: 1, gap: 6 },
  resultFoundBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-end",
  },
  resultFoundText: { fontSize: 13, fontWeight: "700", color: Colors.success },
  resultThumbSub: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  resultsTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  resultRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.background, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  resultMedIcon: { width: 50, height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  resultRowContent: { flex: 1 },
  resultMedName: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  resultMedBrand: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  resultMedPrice: { fontSize: 15, fontWeight: "800", color: Colors.primary, textAlign: "right", marginTop: 4 },
  resultAddBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
  },
  resultAddBtnDone: { backgroundColor: Colors.success },
  retryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.primaryLight, borderRadius: 14, paddingVertical: 14, marginTop: 4,
  },
  retryBtnText: { fontSize: 15, fontWeight: "700", color: Colors.primary },

  contactModal: { flex: 1, backgroundColor: Colors.surface },
  contactHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  contactTitle: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary },
  contactMedCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    margin: 20, padding: 14, borderRadius: 16,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
  },
  contactMedIcon: { width: 60, height: 60, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  contactMedInfo: { flex: 1, alignItems: "flex-end" },
  contactMedName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },
  contactMedBrand: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  contactMedPrice: { fontSize: 16, fontWeight: "800", color: Colors.primary, marginTop: 6 },
  pharmacyCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginHorizontal: 20, marginBottom: 20, padding: 14, borderRadius: 16,
    backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary + "30",
  },
  pharmacyIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
  },
  pharmacyInfo: { flex: 1, alignItems: "flex-end" },
  pharmacyName: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary },
  pharmacyCity: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  pharmacyPhone: { fontSize: 13, fontWeight: "600", color: Colors.primary, marginTop: 4, letterSpacing: 0.5 },
  contactOptionsTitle: {
    fontSize: 14, fontWeight: "700", color: Colors.textMuted,
    marginHorizontal: 20, marginBottom: 10, textAlign: "right",
  },
  contactOption: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginHorizontal: 20, marginBottom: 10, padding: 16, borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background,
  },
  contactOptionIcon: { width: 54, height: 54, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  contactOptionRight: { flex: 1, alignItems: "flex-end" },
  contactOptionTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },
  contactOptionSub: { fontSize: 12, color: Colors.textMuted, marginTop: 3 },
  contactNote: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 20, marginTop: 8, padding: 12, borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
  },
  contactNoteText: { fontSize: 12, color: Colors.textMuted, flex: 1, textAlign: "right" },
});

import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform,
  Switch, Modal, ScrollView, TextInput, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { ALL_DELIVERY_COMPANIES, DeliveryCompany } from "@/data/deliveryCompanies";

const WH_COLOR = "#0D7A54";
const WH_LIGHT = "#E6F7F2";

export default function WarehouseDeliveryScreen() {
  const insets = useSafeAreaInsets();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [companies, setCompanies] = useState<DeliveryCompany[]>(ALL_DELIVERY_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState<DeliveryCompany | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newFee, setNewFee] = useState("");
  const [newTime, setNewTime] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = companies.filter(c =>
    activeFilter === "all" ? true : activeFilter === "active" ? c.isActive : !c.isActive
  );

  const toggleActive = (id: string) =>
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));

  const setDefault = (id: string) =>
    setCompanies(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));

  const callCompany = (phone: string) =>
    Linking.openURL(`tel:${phone.replace(/\s/g, "")}`);

  const whatsappCompany = (wa: string, name: string) => {
    const msg = encodeURIComponent(`مرحباً ${name}، أنا من المذخر، أريد الاستفسار عن خدمات توصيل الطلبات بالجملة.`);
    Linking.openURL(`https://wa.me/${wa}?text=${msg}`);
  };

  const addCustomCompany = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert("خطأ", "يرجى إدخال اسم الشركة ورقم الهاتف");
      return;
    }
    const newCo: DeliveryCompany = {
      id: `wh-custom-${Date.now()}`,
      name: newName,
      nameEn: newName,
      logo: "🚛",
      type: "national",
      baseFee: parseInt(newFee) || 10000,
      perKmFee: 300,
      estimatedTime: newTime || "يوم عمل",
      cities: [],
      phone: newPhone,
      whatsapp: newWhatsapp || newPhone.replace(/\D/g, ""),
      features: ["توصيل بالجملة", "التعامل مع الصيدليات"],
      isActive: true,
      isDefault: false,
      color: WH_COLOR,
    };
    setCompanies(prev => [...prev, newCo]);
    setNewName(""); setNewPhone(""); setNewWhatsapp(""); setNewFee(""); setNewTime("");
    setShowAddModal(false);
  };

  const activeCount = companies.filter(c => c.isActive).length;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>إضافة شركة</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>شركات التوصيل 🚛</Text>
          <Text style={styles.headerSub}>{activeCount} شركة مفعّلة</Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={18} color={WH_COLOR} />
        <Text style={styles.infoBannerText}>
          حدد شركات التوصيل المناسبة لشحن الأدوية بالجملة إلى الصيدليات المرتبطة بك
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {[
          { key: "all", label: "الكل" },
          { key: "active", label: "مفعّلة" },
          { key: "inactive", label: "معطّلة" },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, activeFilter === f.key && styles.filterBtnActive]}
            onPress={() => setActiveFilter(f.key as any)}
          >
            <Text style={[styles.filterBtnText, activeFilter === f.key && styles.filterBtnTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <DeliveryCard
            company={item}
            onToggle={() => toggleActive(item.id)}
            onSetDefault={() => setDefault(item.id)}
            onDetail={() => { setSelectedCompany(item); setShowModal(true); }}
            onCall={() => callCompany(item.phone)}
            onWhatsApp={() => whatsappCompany(item.whatsapp, item.name)}
          />
        )}
      />

      {/* Detail Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.detailModal}>
            <View style={styles.modalHandle} />
            {selectedCompany && (
              <CompanyDetail
                company={selectedCompany}
                onClose={() => setShowModal(false)}
                onCall={() => callCompany(selectedCompany.phone)}
                onWhatsApp={() => whatsappCompany(selectedCompany.whatsapp, selectedCompany.name)}
                onSetDefault={() => { setDefault(selectedCompany.id); setShowModal(false); }}
                onToggle={() => { toggleActive(selectedCompany.id); setShowModal(false); }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.addModal}>
            <View style={styles.modalHandle} />
            <View style={styles.addModalHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.addModalTitle}>إضافة شركة توصيل للمذخر</Text>
            </View>
            <ScrollView contentContainerStyle={styles.addForm}>
              <Text style={styles.fieldLabel}>اسم الشركة *</Text>
              <TextInput style={styles.textInput} value={newName} onChangeText={setNewName} placeholder="مثال: شركة النجم للشحن بالجملة" textAlign="right" />
              <Text style={styles.fieldLabel}>رقم الهاتف *</Text>
              <TextInput style={styles.textInput} value={newPhone} onChangeText={setNewPhone} placeholder="+964 750 000 0000" keyboardType="phone-pad" textAlign="right" />
              <Text style={styles.fieldLabel}>واتساب (اختياري)</Text>
              <TextInput style={styles.textInput} value={newWhatsapp} onChangeText={setNewWhatsapp} placeholder="9647XXXXXXXXX" keyboardType="phone-pad" textAlign="right" />
              <Text style={styles.fieldLabel}>رسوم الشحن الأساسية (د.ع)</Text>
              <TextInput style={styles.textInput} value={newFee} onChangeText={setNewFee} placeholder="10000" keyboardType="numeric" textAlign="right" />
              <Text style={styles.fieldLabel}>وقت التوصيل المتوقع</Text>
              <TextInput style={styles.textInput} value={newTime} onChangeText={setNewTime} placeholder="يوم عمل" textAlign="right" />
              <TouchableOpacity style={styles.saveBtn} onPress={addCustomCompany}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>حفظ الشركة</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DeliveryCard({ company, onToggle, onSetDefault, onDetail, onCall, onWhatsApp }: {
  company: DeliveryCompany; onToggle: () => void; onSetDefault: () => void;
  onDetail: () => void; onCall: () => void; onWhatsApp: () => void;
}) {
  const typeLabel: Record<string, string> = { express: "إكسبرس", national: "وطني", local: "محلي" };
  return (
    <View style={[styles.card, !company.isActive && styles.cardInactive]}>
      <TouchableOpacity style={styles.cardTop} onPress={onDetail} activeOpacity={0.8}>
        <View style={styles.cardTopRight}>
          <View style={[styles.logoBox, { backgroundColor: company.color + "20" }]}>
            <Text style={styles.logoEmoji}>{company.logo}</Text>
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.nameLine}>
              {company.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>افتراضي</Text></View>}
              <Text style={styles.companyName}>{company.name}</Text>
            </View>
            <View style={styles.tagRow}>
              <View style={[styles.typeTag, { backgroundColor: company.color + "20" }]}>
                <Text style={[styles.typeTagText, { color: company.color }]}>{typeLabel[company.type]}</Text>
              </View>
              <Text style={styles.timeText}>{company.estimatedTime}</Text>
            </View>
          </View>
        </View>
        <Switch value={company.isActive} onValueChange={onToggle}
          thumbColor={company.isActive ? WH_COLOR : "#ccc"}
          trackColor={{ false: Colors.border, true: WH_LIGHT }} />
      </TouchableOpacity>
      <View style={styles.feeRow}>
        <Text style={[styles.feeValue, { color: WH_COLOR }]}>{company.baseFee.toLocaleString()} د.ع</Text>
        <Text style={styles.feeLabel}>رسوم التوصيل الأساسية</Text>
      </View>
      {company.cities.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.citiesRow}>
          {company.cities.map(city => (
            <View key={city} style={styles.cityTag}><Text style={styles.cityTagText}>{city}</Text></View>
          ))}
        </ScrollView>
      )}
      {company.isActive && (
        <View style={styles.cardActions}>
          {!company.isDefault && (
            <TouchableOpacity style={styles.setDefaultBtn} onPress={onSetDefault}>
              <Ionicons name="star" size={14} color={Colors.warning} />
              <Text style={styles.setDefaultBtnText}>تعيين كافتراضي</Text>
            </TouchableOpacity>
          )}
          <View style={styles.contactBtns}>
            <TouchableOpacity style={styles.waBtnSmall} onPress={onWhatsApp}>
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.callBtnSmall, { backgroundColor: WH_LIGHT }]} onPress={onCall}>
              <Ionicons name="call" size={16} color={WH_COLOR} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function CompanyDetail({ company, onClose, onCall, onWhatsApp, onSetDefault, onToggle }: {
  company: DeliveryCompany; onClose: () => void; onCall: () => void; onWhatsApp: () => void;
  onSetDefault: () => void; onToggle: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.detailContent}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color={Colors.textSecondary} /></TouchableOpacity>
        <Text style={styles.detailTitle}>{company.name}</Text>
      </View>
      <View style={styles.detailHero}>
        <View style={[styles.detailLogo, { backgroundColor: company.color + "20" }]}>
          <Text style={{ fontSize: 48 }}>{company.logo}</Text>
        </View>
        <View style={styles.detailStatusRow}>
          {company.isDefault && (
            <View style={[styles.defaultBadgeLarge, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="star" size={14} color={Colors.warning} />
              <Text style={[styles.defaultBadgeLargeText, { color: Colors.warning }]}>الشركة الافتراضية</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: company.isActive ? Colors.successLight : Colors.errorLight }]}>
            <Text style={[styles.statusBadgeText, { color: company.isActive ? Colors.success : Colors.error }]}>
              {company.isActive ? "مفعّلة" : "معطّلة"}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.infoGrid}>
        <InfoCell icon="cash-outline" label="رسوم الشحن" value={`${company.baseFee.toLocaleString()} د.ع`} color={WH_COLOR} />
        <InfoCell icon="speedometer-outline" label="وقت التوصيل" value={company.estimatedTime} color={WH_COLOR} />
        <InfoCell icon="navigate-outline" label="التغطية" value={`${company.cities.length} مدينة`} color={WH_COLOR} />
        <InfoCell icon="call-outline" label="الهاتف" value={company.phone} color={WH_COLOR} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المدن المغطاة</Text>
        <View style={styles.cityList}>
          {company.cities.map(city => (
            <View key={city} style={[styles.cityChip, { backgroundColor: WH_LIGHT }]}>
              <Ionicons name="location" size={12} color={WH_COLOR} />
              <Text style={[styles.cityChipText, { color: WH_COLOR }]}>{city}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المميزات</Text>
        {company.features.map(f => (
          <View key={f} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      {company.trackingUrl && (
        <TouchableOpacity style={[styles.trackingBtn, { borderColor: WH_COLOR }]} onPress={() => Linking.openURL(company.trackingUrl!)}>
          <Ionicons name="open-outline" size={16} color={WH_COLOR} />
          <Text style={[styles.trackingBtnText, { color: WH_COLOR }]}>فتح لوحة تتبع الشركة</Text>
        </TouchableOpacity>
      )}
      <View style={styles.detailActions}>
        <TouchableOpacity style={styles.waBtn} onPress={onWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.waBtnText}>واتساب</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.callBtn, { backgroundColor: WH_COLOR }]} onPress={onCall}>
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.callBtnText}>اتصال</Text>
        </TouchableOpacity>
      </View>
      {!company.isDefault && company.isActive && (
        <TouchableOpacity style={styles.setDefaultBtnLarge} onPress={onSetDefault}>
          <Ionicons name="star" size={18} color={Colors.warning} />
          <Text style={styles.setDefaultBtnLargeText}>تعيين كشركة توصيل افتراضية</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.toggleBtn, { backgroundColor: company.isActive ? Colors.errorLight : Colors.successLight }]} onPress={onToggle}>
        <Ionicons name={company.isActive ? "close-circle" : "checkmark-circle"} size={18} color={company.isActive ? Colors.error : Colors.success} />
        <Text style={[styles.toggleBtnText, { color: company.isActive ? Colors.error : Colors.success }]}>
          {company.isActive ? "تعطيل الشركة" : "تفعيل الشركة"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoCell({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.infoCell}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={styles.infoCellValue}>{value}</Text>
      <Text style={styles.infoCellLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: WH_COLOR, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff", textAlign: "right" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", textAlign: "right", marginTop: 2 },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  infoBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: WH_LIGHT, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 12,
  },
  infoBannerText: { flex: 1, fontSize: 13, color: WH_COLOR, textAlign: "right", lineHeight: 20 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.border },
  filterBtnActive: { backgroundColor: WH_COLOR },
  filterBtnText: { fontSize: 13, fontWeight: "600", color: Colors.textMuted },
  filterBtnTextActive: { color: "#fff" },
  list: { padding: 16, gap: 14, paddingBottom: 120 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    overflow: "hidden",
  },
  cardInactive: { opacity: 0.65 },
  cardTop: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cardTopRight: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  logoBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  logoEmoji: { fontSize: 24 },
  cardInfo: { flex: 1 },
  nameLine: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  companyName: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  defaultBadge: { backgroundColor: "#FEF3C7", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  defaultBadgeText: { fontSize: 10, fontWeight: "700", color: Colors.warning },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  typeTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  typeTagText: { fontSize: 11, fontWeight: "700" },
  timeText: { fontSize: 12, color: Colors.textMuted },
  feeRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10,
  },
  feeLabel: { fontSize: 13, color: Colors.textSecondary },
  feeValue: { fontSize: 14, fontWeight: "700" },
  citiesRow: { paddingHorizontal: 14, paddingBottom: 10, gap: 6 },
  cityTag: { backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  cityTagText: { fontSize: 11, color: Colors.textSecondary },
  cardActions: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  setDefaultBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  setDefaultBtnText: { fontSize: 13, fontWeight: "600", color: Colors.warning },
  contactBtns: { flexDirection: "row", gap: 8 },
  waBtnSmall: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E8FFF2", alignItems: "center", justifyContent: "center" },
  callBtnSmall: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  detailModal: { backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "90%" },
  addModal: { backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "85%" },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: "center", marginTop: 12 },
  detailContent: { padding: 20, paddingBottom: 40 },
  detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  detailTitle: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary },
  detailHero: { alignItems: "center", marginBottom: 20, gap: 12 },
  detailLogo: { width: 80, height: 80, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  detailStatusRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  defaultBadgeLarge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  defaultBadgeLargeText: { fontSize: 12, fontWeight: "700" },
  statusBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  statusBadgeText: { fontSize: 12, fontWeight: "700" },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  infoCell: { flex: 1, minWidth: "45%", backgroundColor: Colors.background, borderRadius: 14, padding: 14, alignItems: "flex-end", gap: 4 },
  infoCellValue: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  infoCellLabel: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, marginBottom: 10, textAlign: "right" },
  cityList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cityChip: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  cityChipText: { fontSize: 12, fontWeight: "600" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, justifyContent: "flex-end" },
  featureText: { fontSize: 14, color: Colors.textSecondary },
  trackingBtn: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center", borderWidth: 1, borderRadius: 14, paddingVertical: 10, marginBottom: 16 },
  trackingBtnText: { fontSize: 14, fontWeight: "600" },
  detailActions: { flexDirection: "row", gap: 10, marginBottom: 12 },
  waBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#25D366", borderRadius: 14, paddingVertical: 12 },
  waBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  callBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 12 },
  callBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  setDefaultBtnLarge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FEF3C7", borderRadius: 14, paddingVertical: 12, marginBottom: 10 },
  setDefaultBtnLargeText: { fontSize: 14, fontWeight: "700", color: Colors.warning },
  toggleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 12 },
  toggleBtnText: { fontSize: 14, fontWeight: "700" },
  addModalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  addModalTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  addForm: { padding: 20, gap: 8, paddingBottom: 40 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary, textAlign: "right", marginTop: 8 },
  textInput: { backgroundColor: Colors.background, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: WH_COLOR, borderRadius: 14, paddingVertical: 14, marginTop: 16 },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});

import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform,
  Switch, Modal, ScrollView, TextInput, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { ALL_DELIVERY_COMPANIES, DeliveryCompany, DeliveryRating } from "@/data/deliveryCompanies";

export interface SharedDeliveryProps {
  accentColor: string;
  reviewerType: "pharmacy" | "warehouse";
  bannerText: string;
  bannerBgColor: string;
  addModalTitle: string;
  feeLabelText: string;
  defaultFee: number;
  defaultTime: string;
  defaultLogo: string;
  defaultCompanyType: "local" | "national" | "express";
  defaultFeatures: string[];
  whatsappMessage: (name: string) => string;
}

export default function SharedDeliveryScreen({
  accentColor, reviewerType, bannerText, bannerBgColor,
  addModalTitle, feeLabelText, defaultFee, defaultTime,
  defaultLogo, defaultCompanyType, defaultFeatures, whatsappMessage,
}: SharedDeliveryProps) {
  const insets = useSafeAreaInsets();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [companies, setCompanies] = useState<DeliveryCompany[]>(ALL_DELIVERY_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState<DeliveryCompany | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<DeliveryCompany | null>(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newFee, setNewFee] = useState("");
  const [newTime, setNewTime] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = useMemo(() => {
    return companies.filter(c =>
      activeFilter === "all" ? true : activeFilter === "active" ? c.isActive : !c.isActive
    );
  }, [companies, activeFilter]);

  const toggleActive = (id: string) =>
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));

  const setDefault = (id: string) =>
    setCompanies(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));

  const openRating = (company: DeliveryCompany) => {
    setRatingTarget(company);
    setRatingStars(0);
    setRatingComment("");
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (ratingStars === 0) { Alert.alert("تنبيه", "يرجى اختيار عدد النجوم"); return; }
    const newReview: DeliveryRating = {
      stars: ratingStars, comment: ratingComment.trim(),
      date: new Date().toISOString().split("T")[0], reviewerType,
    };
    setCompanies(prev => prev.map(c => {
      if (c.id !== ratingTarget?.id) return c;
      const allReviews = [newReview, ...c.reviews];
      const avg = allReviews.reduce((s, r) => s + r.stars, 0) / allReviews.length;
      return { ...c, reviews: allReviews, rating: Math.round(avg * 10) / 10, ratingCount: c.ratingCount + 1 };
    }));
    setShowRatingModal(false);
    Alert.alert("شكراً! ✅", "تم إرسال تقييمك بنجاح");
  };

  const callCompany = (phone: string) => Linking.openURL(`tel:${phone.replace(/\s/g, "")}`);

  const openWhatsApp = (wa: string, name: string) => {
    const msg = encodeURIComponent(whatsappMessage(name));
    Linking.openURL(`https://wa.me/${wa}?text=${msg}`);
  };

  const addCustomCompany = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert("خطأ", "يرجى إدخال اسم الشركة ورقم الهاتف"); return;
    }
    const newCo: DeliveryCompany = {
      id: `${reviewerType}-custom-${Date.now()}`,
      name: newName, nameEn: newName, logo: defaultLogo, type: defaultCompanyType,
      baseFee: parseInt(newFee) || defaultFee, perKmFee: 150,
      estimatedTime: newTime || defaultTime, cities: [],
      phone: newPhone, whatsapp: newWhatsapp || newPhone.replace(/\D/g, ""),
      features: defaultFeatures, isActive: true, isDefault: false, color: accentColor,
      rating: 0, ratingCount: 0, reviews: [],
    };
    setCompanies(prev => [...prev, newCo]);
    setNewName(""); setNewPhone(""); setNewWhatsapp(""); setNewFee(""); setNewTime("");
    setShowAddModal(false);
  };

  const activeCount = companies.filter(c => c.isActive).length;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: accentColor }]} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>إضافة شركة</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>شركات التوصيل 🚚</Text>
          <Text style={styles.headerSub}>{activeCount} شركة مفعّلة</Text>
        </View>
      </View>

      <View style={[styles.infoBanner, { backgroundColor: bannerBgColor }]}>
        <Ionicons name="information-circle" size={18} color={accentColor} />
        <Text style={[styles.infoBannerText, { color: accentColor }]}>{bannerText}</Text>
      </View>

      <View style={styles.filterRow}>
        {([{ key: "all", label: "الكل" }, { key: "active", label: "مفعّلة" }, { key: "inactive", label: "معطّلة" }] as const).map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, activeFilter === f.key && { backgroundColor: accentColor }]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text style={[styles.filterBtnText, activeFilter === f.key && styles.filterBtnTextActive]}>{f.label}</Text>
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
            accentColor={accentColor}
            onToggle={() => toggleActive(item.id)}
            onSetDefault={() => setDefault(item.id)}
            onDetail={() => { setSelectedCompany(item); setShowModal(true); }}
            onCall={() => callCompany(item.phone)}
            onWhatsApp={() => openWhatsApp(item.whatsapp, item.name)}
            onRate={() => openRating(item)}
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
                accentColor={accentColor}
                onClose={() => setShowModal(false)}
                onCall={() => callCompany(selectedCompany.phone)}
                onWhatsApp={() => openWhatsApp(selectedCompany.whatsapp, selectedCompany.name)}
                onSetDefault={() => { setDefault(selectedCompany.id); setShowModal(false); }}
                onToggle={() => { toggleActive(selectedCompany.id); setShowModal(false); }}
                onRate={() => { setShowModal(false); openRating(selectedCompany); }}
                isDefault={selectedCompany.isDefault}
                isActive={selectedCompany.isActive}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Add Company Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.addModal}>
            <View style={styles.modalHandle} />
            <View style={styles.addModalHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.addModalTitle}>{addModalTitle}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.addForm}>
              {[
                { label: "اسم الشركة *",          val: newName,     set: setNewName,     ph: "مثال: شركة النجم للتوصيل", kb: "default" },
                { label: "رقم الهاتف *",           val: newPhone,    set: setNewPhone,    ph: "+964 750 000 0000",         kb: "phone-pad" },
                { label: "واتساب (اختياري)",       val: newWhatsapp, set: setNewWhatsapp, ph: "9647XXXXXXXXX",             kb: "phone-pad" },
                { label: feeLabelText,             val: newFee,      set: setNewFee,      ph: String(defaultFee),          kb: "numeric" },
                { label: "وقت التوصيل المتوقع",   val: newTime,     set: setNewTime,     ph: defaultTime,                 kb: "default" },
              ].map(f => (
                <View key={f.label}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={f.val} onChangeText={f.set}
                    placeholder={f.ph} keyboardType={f.kb as any} textAlign="right"
                  />
                </View>
              ))}
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: accentColor }]} onPress={addCustomCompany}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>حفظ الشركة</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal visible={showRatingModal} animationType="slide" transparent onRequestClose={() => setShowRatingModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.ratingModal}>
            <View style={styles.modalHandle} />
            <View style={styles.ratingHeader}>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.ratingTitle}>تقييم {ratingTarget?.name}</Text>
            </View>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRatingStars(s)}>
                  <Ionicons
                    name={s <= ratingStars ? "star" : "star-outline"}
                    size={40}
                    color={s <= ratingStars ? "#F59E0B" : Colors.border}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>
              {ratingStars === 0 ? "اختر تقييمك" : ["", "ضعيف", "مقبول", "جيد", "جيد جداً", "ممتاز"][ratingStars]}
            </Text>
            <Text style={styles.fieldLabel}>تعليقك (اختياري)</Text>
            <TextInput
              style={[styles.textInput, { minHeight: 80, textAlignVertical: "top" }]}
              value={ratingComment} onChangeText={setRatingComment}
              placeholder="شارك تجربتك مع هذه الشركة..." textAlign="right" multiline
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: ratingStars > 0 ? accentColor : Colors.border }]}
              onPress={submitRating}
            >
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>إرسال التقييم</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── StarDisplay ──────────────────────────────────────────────────────────────
export function StarDisplay({ rating, count, size = 13 }: { rating: number; count: number; size?: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Ionicons key={s}
          name={s <= full ? "star" : (s === full + 1 && half ? "star-half" : "star-outline")}
          size={size} color="#F59E0B"
        />
      ))}
      <Text style={{ fontSize: size - 1, color: Colors.textMuted, marginRight: 2 }}>
        {rating.toFixed(1)} ({count})
      </Text>
    </View>
  );
}

// ─── DeliveryCard ─────────────────────────────────────────────────────────────
function DeliveryCard({ company, accentColor, onToggle, onSetDefault, onDetail, onCall, onWhatsApp, onRate }: {
  company: DeliveryCompany; accentColor: string;
  onToggle: () => void; onSetDefault: () => void; onDetail: () => void;
  onCall: () => void; onWhatsApp: () => void; onRate: () => void;
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
              {company.isDefault && (
                <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>افتراضي</Text></View>
              )}
              <Text style={styles.companyName}>{company.name}</Text>
            </View>
            <View style={styles.tagRow}>
              <View style={[styles.typeTag, { backgroundColor: company.color + "20" }]}>
                <Text style={[styles.typeTagText, { color: company.color }]}>{typeLabel[company.type]}</Text>
              </View>
              <Text style={styles.timeText}>{company.estimatedTime}</Text>
            </View>
            {company.ratingCount > 0 && <StarDisplay rating={company.rating} count={company.ratingCount} />}
          </View>
        </View>
        <Switch
          value={company.isActive} onValueChange={onToggle}
          thumbColor={company.isActive ? accentColor : "#ccc"}
          trackColor={{ false: Colors.border, true: accentColor + "50" }}
        />
      </TouchableOpacity>

      <View style={styles.feeRow}>
        <Text style={[styles.feeValue, { color: accentColor }]}>{company.baseFee.toLocaleString()} د.ع</Text>
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
          <TouchableOpacity style={styles.rateBtn} onPress={onRate}>
            <Ionicons name="star-outline" size={14} color="#F59E0B" />
            <Text style={styles.rateBtnText}>تقييم</Text>
          </TouchableOpacity>
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
            <TouchableOpacity style={[styles.callBtnSmall, { backgroundColor: accentColor + "15" }]} onPress={onCall}>
              <Ionicons name="call" size={16} color={accentColor} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── CompanyDetail ────────────────────────────────────────────────────────────
function CompanyDetail({ company, accentColor, onClose, onCall, onWhatsApp, onSetDefault, onToggle, onRate, isDefault, isActive }: {
  company: DeliveryCompany; accentColor: string;
  onClose: () => void; onCall: () => void; onWhatsApp: () => void;
  onSetDefault: () => void; onToggle: () => void; onRate: () => void;
  isDefault: boolean; isActive: boolean;
}) {
  return (
    <ScrollView contentContainerStyle={styles.detailContent}>
      <View style={styles.detailHeader}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>{company.name}</Text>
      </View>

      <View style={styles.detailHero}>
        <View style={[styles.detailLogo, { backgroundColor: company.color + "20" }]}>
          <Text style={{ fontSize: 48 }}>{company.logo}</Text>
        </View>
        <View style={styles.detailStatusRow}>
          {isDefault && (
            <View style={styles.defaultBadgeLarge}>
              <Ionicons name="star" size={14} color={Colors.warning} />
              <Text style={styles.defaultBadgeLargeText}>الشركة الافتراضية</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: isActive ? Colors.successLight : Colors.errorLight }]}>
            <Text style={[styles.statusBadgeText, { color: isActive ? Colors.success : Colors.error }]}>
              {isActive ? "مفعّلة" : "معطّلة"}
            </Text>
          </View>
        </View>
        {company.ratingCount > 0 && <StarDisplay rating={company.rating} count={company.ratingCount} size={16} />}
      </View>

      <View style={styles.infoGrid}>
        {[
          { icon: "cash-outline",      label: "رسوم التوصيل", value: `${company.baseFee.toLocaleString()} د.ع` },
          { icon: "speedometer-outline", label: "وقت التوصيل", value: company.estimatedTime },
          { icon: "navigate-outline",  label: "التغطية",       value: `${company.cities.length} مدينة` },
          { icon: "call-outline",      label: "الهاتف",         value: company.phone },
        ].map(c => (
          <View key={c.label} style={styles.infoCell}>
            <Ionicons name={c.icon as any} size={20} color={accentColor} />
            <Text style={styles.infoCellValue}>{c.value}</Text>
            <Text style={styles.infoCellLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المدن المغطاة</Text>
        <View style={styles.cityList}>
          {company.cities.map(city => (
            <View key={city} style={[styles.cityChip, { borderColor: company.color }]}>
              <Ionicons name="location" size={12} color={company.color} />
              <Text style={[styles.cityChipText, { color: company.color }]}>{city}</Text>
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

      {company.reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آراء المستخدمين ({company.reviews.length})</Text>
          {company.reviews.slice(0, 3).map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewDate}>{r.date}</Text>
                <View style={{ flexDirection: "row", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Ionicons key={s} name={s <= r.stars ? "star" : "star-outline"} size={12} color="#F59E0B" />
                  ))}
                </View>
                <View style={[styles.reviewerBadge, { backgroundColor: r.reviewerType === "pharmacy" ? Colors.primaryLight : "#E8F4F0" }]}>
                  <Text style={[styles.reviewerBadgeText, { color: r.reviewerType === "pharmacy" ? Colors.primary : "#0D7A54" }]}>
                    {r.reviewerType === "pharmacy" ? "صيدلية" : "مذخر"}
                  </Text>
                </View>
              </View>
              {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
            </View>
          ))}
        </View>
      )}

      {company.trackingUrl && (
        <TouchableOpacity
          style={[styles.trackingBtn, { borderColor: accentColor }]}
          onPress={() => Linking.openURL(company.trackingUrl!)}
        >
          <Ionicons name="open-outline" size={16} color={accentColor} />
          <Text style={[styles.trackingBtnText, { color: accentColor }]}>فتح لوحة تتبع الشركة</Text>
        </TouchableOpacity>
      )}

      <View style={styles.detailActions}>
        <TouchableOpacity style={styles.rateActionBtn} onPress={onRate}>
          <Ionicons name="star" size={18} color="#F59E0B" />
          <Text style={styles.rateActionBtnText}>تقييم الشركة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.waBtn} onPress={onWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.waBtnText}>واتساب</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.callBtn, { backgroundColor: accentColor }]} onPress={onCall}>
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.callBtnText}>اتصال</Text>
        </TouchableOpacity>
      </View>

      {!isDefault && isActive && (
        <TouchableOpacity style={styles.setDefaultBtnLarge} onPress={onSetDefault}>
          <Ionicons name="star" size={18} color={Colors.warning} />
          <Text style={styles.setDefaultBtnLargeText}>تعيين كشركة توصيل افتراضية</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.toggleBtn, { backgroundColor: isActive ? Colors.errorLight : Colors.successLight }]}
        onPress={onToggle}
      >
        <Ionicons name={isActive ? "close-circle" : "checkmark-circle"} size={18} color={isActive ? Colors.error : Colors.success} />
        <Text style={[styles.toggleBtnText, { color: isActive ? Colors.error : Colors.success }]}>
          {isActive ? "تعطيل الشركة" : "تفعيل الشركة"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surface, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerInfo: { alignItems: "flex-end" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary },
  headerSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  infoBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 12,
  },
  infoBannerText: { flex: 1, fontSize: 13, textAlign: "right", lineHeight: 20, fontWeight: "600" },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.border },
  filterBtnText: { fontSize: 13, fontWeight: "600", color: Colors.textMuted },
  filterBtnTextActive: { color: "#fff" },
  list: { padding: 16, gap: 14, paddingBottom: 120 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  cardInactive: { opacity: 0.65 },
  cardTop: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cardTopRight: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  logoBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  logoEmoji: { fontSize: 24 },
  cardInfo: { flex: 1, gap: 3 },
  nameLine: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  companyName: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  defaultBadge: { backgroundColor: "#FEF3C7", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  defaultBadgeText: { fontSize: 10, fontWeight: "700", color: Colors.warning },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 8 },
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
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: Colors.border, gap: 8,
  },
  rateBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEF3C7", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  rateBtnText: { fontSize: 12, fontWeight: "700", color: "#D97706" },
  setDefaultBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  setDefaultBtnText: { fontSize: 13, fontWeight: "600", color: Colors.warning },
  contactBtns: { flexDirection: "row", gap: 8, marginRight: "auto" },
  waBtnSmall: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E8FFF2", alignItems: "center", justifyContent: "center" },
  callBtnSmall: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  detailModal: { backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "92%" },
  addModal: { backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "85%" },
  ratingModal: { backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: "center", marginTop: 12 },
  ratingHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24, marginTop: 8 },
  ratingTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 12 },
  ratingLabel: { fontSize: 16, fontWeight: "700", color: Colors.textSecondary, textAlign: "center", marginBottom: 20 },
  detailContent: { padding: 20, paddingBottom: 40 },
  detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  detailTitle: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary },
  closeBtn: { padding: 4 },
  detailHero: { alignItems: "center", marginBottom: 20, gap: 10 },
  detailLogo: { width: 80, height: 80, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  detailStatusRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  defaultBadgeLarge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FEF3C7", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  defaultBadgeLargeText: { fontSize: 12, fontWeight: "700", color: Colors.warning },
  statusBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  statusBadgeText: { fontSize: 12, fontWeight: "700" },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  infoCell: { flex: 1, minWidth: "45%", backgroundColor: Colors.background, borderRadius: 14, padding: 14, alignItems: "flex-end", gap: 4 },
  infoCellValue: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  infoCellLabel: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, marginBottom: 10, textAlign: "right" },
  cityList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cityChip: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  cityChipText: { fontSize: 12, fontWeight: "600" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  featureText: { fontSize: 14, color: Colors.textSecondary },
  reviewCard: { backgroundColor: Colors.background, borderRadius: 12, padding: 12, marginBottom: 8, gap: 6 },
  reviewTop: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  reviewDate: { fontSize: 11, color: Colors.textMuted },
  reviewerBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  reviewerBadgeText: { fontSize: 10, fontWeight: "700" },
  reviewComment: { fontSize: 13, color: Colors.textSecondary, textAlign: "right", lineHeight: 20 },
  trackingBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderRadius: 14, paddingVertical: 12, marginBottom: 16 },
  trackingBtnText: { fontSize: 14, fontWeight: "700" },
  detailActions: { flexDirection: "row", gap: 10, marginBottom: 12 },
  rateActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#FEF3C7", borderRadius: 14, paddingVertical: 12 },
  rateActionBtnText: { fontSize: 14, fontWeight: "700", color: "#D97706" },
  waBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#25D366", borderRadius: 14, paddingVertical: 12 },
  waBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  callBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 14, paddingVertical: 12 },
  callBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  setDefaultBtnLarge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FEF3C7", borderRadius: 14, paddingVertical: 14, marginBottom: 10 },
  setDefaultBtnLargeText: { fontSize: 15, fontWeight: "700", color: Colors.warning },
  toggleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14, marginBottom: 10 },
  toggleBtnText: { fontSize: 15, fontWeight: "700" },
  addModalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20 },
  addModalTitle: { fontSize: 17, fontWeight: "800", color: Colors.textPrimary },
  addForm: { paddingHorizontal: 20, paddingBottom: 40, gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: Colors.textSecondary, textAlign: "right", marginTop: 8 },
  textInput: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary,
  },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14, marginTop: 16 },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});

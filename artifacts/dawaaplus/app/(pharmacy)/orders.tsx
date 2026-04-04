import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform,
  Modal, ScrollView, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useOrders, CustomerOrder, OrderStatus } from "@/contexts/OrdersContext";
import { ALL_DELIVERY_COMPANIES } from "@/data/deliveryCompanies";

const PHARMACY_ID = "p1";

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "new", label: "جديد" },
  { key: "processing", label: "قيد التجهيز" },
  { key: "shipped", label: "في الطريق" },
  { key: "completed", label: "مكتمل" },
];

const PAYMENT_LABELS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  cod: { label: "كاش عند الاستلام", icon: "cash-outline", color: "#92400E", bg: "#FEF3C7" },
  card: { label: "بطاقة (مدفوع)", icon: "card-outline", color: "#1D4ED8", bg: "#EFF6FF" },
  whatsapp: { label: "طلب واتساب", icon: "logo-whatsapp", color: "#15803D", bg: "#F0FDF4" },
};

export default function PharmacyOrdersScreen() {
  const insets = useSafeAreaInsets();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const { getPharmacyOrders, updateCustomerOrderStatus, assignDelivery } = useOrders();
  const orders = getPharmacyOrders(PHARMACY_ID);
  const [activeTab, setActiveTab] = useState("new");
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);

  const filtered = orders.filter(o => o.status === activeTab);

  const handleAccept = (orderId: string) => {
    updateCustomerOrderStatus(orderId, "processing");
    Alert.alert("✅ تم قبول الطلب", "الطلب الآن قيد التجهيز");
  };

  const handleComplete = (orderId: string) => {
    updateCustomerOrderStatus(orderId, "completed", { isPaid: true });
    Alert.alert("✅ تم التسليم", "تم تأكيد استلام العميل");
  };

  const handleCancel = (orderId: string) => {
    Alert.alert("إلغاء الطلب", "هل أنت متأكد؟", [
      { text: "تراجع", style: "cancel" },
      { text: "إلغاء", style: "destructive", onPress: () => updateCustomerOrderStatus(orderId, "cancelled") },
    ]);
  };

  const openDetail = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const openDeliveryPicker = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setShowDeliveryPicker(true);
  };

  const handleAssignDelivery = (companyId: string, companyName: string) => {
    if (!selectedOrder) return;
    assignDelivery(selectedOrder.id, companyId, companyName);
    setShowDeliveryPicker(false);
    Alert.alert("🚚 تم تعيين التوصيل", `تم تعيين ${companyName} لهذا الطلب`);
  };

  const callCustomer = (phone: string) => Linking.openURL(`tel:${phone.replace(/\s/g, "")}`);
  const whatsappCustomer = (phone: string, name: string, orderId: string) => {
    const msg = encodeURIComponent(`مرحباً ${name}،\nطلبك رقم ${orderId} جاهز وسيتم توصيله قريباً.\nشكراً لثقتك بنا.`);
    const num = phone.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${num}?text=${msg}`);
  };

  const totalNew = orders.filter(o => o.status === "new").length;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerStats}>
          <View style={styles.statChip}>
            <Text style={styles.statChipNum}>{orders.length}</Text>
            <Text style={styles.statChipLabel}>إجمالي</Text>
          </View>
          {totalNew > 0 && (
            <View style={[styles.statChip, { backgroundColor: Colors.accentLight }]}>
              <Text style={[styles.statChipNum, { color: Colors.warning }]}>{totalNew}</Text>
              <Text style={[styles.statChipLabel, { color: Colors.warning }]}>جديد</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerTitle}>الطلبات 📦</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {STATUS_TABS.map(tab => {
          const count = orders.filter(o => o.status === tab.key).length;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              {count > 0 && (
                <View style={[styles.tabBadge, activeTab === tab.key && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, activeTab === tab.key && { color: "#fff" }]}>{count}</Text>
                </View>
              )}
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onAccept={item.status === "new" ? () => handleAccept(item.id) : undefined}
            onComplete={item.status === "processing" || item.status === "shipped" ? () => handleComplete(item.id) : undefined}
            onCancel={item.status !== "completed" && item.status !== "cancelled" ? () => handleCancel(item.id) : undefined}
            onDetail={() => openDetail(item)}
            onCall={() => callCustomer(item.customerPhone)}
            onWhatsApp={() => whatsappCustomer(item.customerPhone, item.customerName, item.id)}
            onAssignDelivery={item.status === "processing" ? () => openDeliveryPicker(item) : undefined}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>لا توجد طلبات {STATUS_TABS.find(t => t.key === activeTab)?.label}</Text>
          </View>
        )}
      />

      {/* Order Detail Modal */}
      <Modal visible={showDetail} animationType="slide" transparent onRequestClose={() => setShowDetail(false)}>
        <View style={styles.overlay}>
          <View style={styles.detailModal}>
            <View style={styles.modalHandle} />
            {selectedOrder && (
              <OrderDetail
                order={selectedOrder}
                onClose={() => setShowDetail(false)}
                onCall={() => callCustomer(selectedOrder.customerPhone)}
                onWhatsApp={() => whatsappCustomer(selectedOrder.customerPhone, selectedOrder.customerName, selectedOrder.id)}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Delivery Picker Modal */}
      <Modal visible={showDeliveryPicker} animationType="slide" transparent onRequestClose={() => setShowDeliveryPicker(false)}>
        <View style={styles.overlay}>
          <View style={styles.deliveryModal}>
            <View style={styles.modalHandle} />
            <View style={styles.deliveryHeader}>
              <TouchableOpacity onPress={() => setShowDeliveryPicker(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.deliveryTitle}>اختر شركة التوصيل</Text>
            </View>
            <ScrollView contentContainerStyle={styles.deliveryList}>
              {ALL_DELIVERY_COMPANIES.filter(c => c.isActive).map(company => (
                <TouchableOpacity
                  key={company.id}
                  style={styles.deliveryOption}
                  onPress={() => handleAssignDelivery(company.id, company.name)}
                >
                  <View style={styles.deliveryOptionRight}>
                    <View style={[styles.deliveryOptionLogo, { backgroundColor: company.color + "20" }]}>
                      <Text style={{ fontSize: 22 }}>{company.logo}</Text>
                    </View>
                    <View>
                      <Text style={styles.deliveryOptionName}>{company.name}</Text>
                      <Text style={styles.deliveryOptionTime}>{company.estimatedTime}</Text>
                    </View>
                  </View>
                  <View style={styles.deliveryOptionLeft}>
                    {company.isDefault && (
                      <View style={styles.defaultTag}>
                        <Text style={styles.defaultTagText}>افتراضي</Text>
                      </View>
                    )}
                    <Text style={styles.deliveryOptionFee}>{company.baseFee.toLocaleString()} د.ع</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function OrderCard({
  order, onAccept, onComplete, onCancel, onDetail, onCall, onWhatsApp, onAssignDelivery,
}: {
  order: CustomerOrder;
  onAccept?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onDetail: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
  onAssignDelivery?: () => void;
}) {
  const statusConfig: Record<string, { bg: string; color: string; label: string; icon: string }> = {
    new: { bg: Colors.accentLight, color: Colors.warning, label: "طلب جديد 🔔", icon: "notifications" },
    processing: { bg: "#EBF8FF", color: "#3182CE", label: "قيد التجهيز ⚙️", icon: "settings" },
    shipped: { bg: "#F0FDF4", color: Colors.success, label: "في الطريق 🚚", icon: "car" },
    completed: { bg: Colors.successLight, color: Colors.success, label: "مكتمل ✅", icon: "checkmark-circle" },
    cancelled: { bg: Colors.errorLight, color: Colors.error, label: "ملغي ❌", icon: "close-circle" },
  };
  const sc = statusConfig[order.status] ?? statusConfig.new;
  const pm = PAYMENT_LABELS[order.paymentMethod];
  const total = order.total + order.deliveryFee;

  return (
    <TouchableOpacity style={styles.card} onPress={onDetail} activeOpacity={0.9}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderRight}>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
          </View>
          <Text style={styles.orderId}>{order.id}</Text>
        </View>
        <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
      </View>

      {/* Payment Method */}
      <View style={[styles.paymentRow, { backgroundColor: pm.bg }]}>
        <Text style={[styles.paymentLabel, { color: pm.color }]}>{pm.label}</Text>
        <Ionicons name={pm.icon as any} size={16} color={pm.color} />
      </View>

      {/* Customer */}
      <View style={styles.customerRow}>
        <View style={styles.customerActions}>
          <TouchableOpacity style={styles.waIconBtn} onPress={onWhatsApp}>
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.callIconBtn} onPress={onCall}>
            <Ionicons name="call" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <Text style={styles.customerPhone}>{order.customerPhone}</Text>
          <Text style={styles.customerAddress} numberOfLines={1}>📍 {order.address}، {order.city}</Text>
        </View>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>{order.customerName[0]}</Text>
        </View>
      </View>

      {/* Items */}
      <View style={styles.itemsSection}>
        {order.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} د.ع</Text>
            <Text style={styles.itemName}>{item.name} × {item.quantity}</Text>
          </View>
        ))}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalValue}>{order.deliveryFee.toLocaleString()} د.ع</Text>
            <Text style={styles.totalLabel}>التوصيل</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalValue, { color: Colors.primary, fontSize: 16 }]}>{total.toLocaleString()} د.ع</Text>
            <Text style={[styles.totalLabel, { fontWeight: "800" }]}>الإجمالي</Text>
          </View>
        </View>
      </View>

      {/* Delivery info if assigned */}
      {order.deliveryCompanyName && (
        <View style={styles.deliveryInfo}>
          <Text style={styles.trackingCode}>#{order.trackingCode}</Text>
          <View style={styles.deliveryInfoRight}>
            <Text style={styles.deliveryInfoLabel}>🚚 {order.deliveryCompanyName}</Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {onAssignDelivery && (
          <TouchableOpacity style={styles.deliveryBtn} onPress={onAssignDelivery}>
            <Ionicons name="car" size={16} color={Colors.primary} />
            <Text style={styles.deliveryBtnText}>تعيين توصيل</Text>
          </TouchableOpacity>
        )}
        {onAccept && (
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.acceptBtnText}>قبول الطلب</Text>
          </TouchableOpacity>
        )}
        {onComplete && (
          <TouchableOpacity style={styles.completeBtn} onPress={onComplete}>
            <Ionicons name="checkmark-done" size={18} color="#fff" />
            <Text style={styles.completeBtnText}>تم التسليم</Text>
          </TouchableOpacity>
        )}
        {onCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

function OrderDetail({ order, onClose, onCall, onWhatsApp }: {
  order: CustomerOrder;
  onClose: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
}) {
  const pm = PAYMENT_LABELS[order.paymentMethod];
  const statusConfig: Record<string, { color: string; label: string }> = {
    new: { color: Colors.warning, label: "طلب جديد" },
    processing: { color: "#3182CE", label: "قيد التجهيز" },
    shipped: { color: Colors.success, label: "في الطريق" },
    completed: { color: Colors.success, label: "مكتمل" },
    cancelled: { color: Colors.error, label: "ملغي" },
  };
  const sc = statusConfig[order.status] ?? statusConfig.new;
  return (
    <ScrollView contentContainerStyle={styles.detailContent}>
      <View style={styles.detailTopRow}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.detailOrderId}>{order.id}</Text>
      </View>
      <Text style={[styles.detailStatus, { color: sc.color }]}>● {sc.label}</Text>

      {/* Payment */}
      <View style={[styles.detailSection, { backgroundColor: pm.bg }]}>
        <View style={styles.detailSectionRow}>
          <Text style={[styles.detailSectionValue, { color: pm.color, fontWeight: "700" }]}>{pm.label}</Text>
          <Ionicons name={pm.icon as any} size={20} color={pm.color} />
        </View>
        <Text style={[styles.detailSectionLabel, { color: pm.color }]}>
          {order.isPaid ? "✅ مدفوع" : "⏳ غير مدفوع — يُسدَّد عند الاستلام"}
        </Text>
      </View>

      {/* Customer Info */}
      <View style={styles.detailBox}>
        <Text style={styles.detailBoxTitle}>معلومات العميل</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>{order.customerName}</Text>
          <Text style={styles.detailKey}>الاسم</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>{order.customerPhone}</Text>
          <Text style={styles.detailKey}>الهاتف</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailValue}>{order.address}، {order.city}</Text>
          <Text style={styles.detailKey}>العنوان</Text>
        </View>
        {order.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>ملاحظة العميل</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}
        <View style={styles.contactBtns}>
          <TouchableOpacity style={styles.waDetailBtn} onPress={onWhatsApp}>
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={styles.waDetailBtnText}>واتساب</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callDetailBtn} onPress={onCall}>
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={styles.callDetailBtnText}>اتصال</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Items */}
      <View style={styles.detailBox}>
        <Text style={styles.detailBoxTitle}>الأدوية المطلوبة</Text>
        {order.items.map((item, i) => (
          <View key={i} style={styles.detailItemRow}>
            <Text style={styles.detailItemPrice}>{(item.price * item.quantity).toLocaleString()} د.ع</Text>
            <Text style={styles.detailItemName}>{item.name} × {item.quantity}</Text>
          </View>
        ))}
        <View style={styles.detailDivider} />
        <View style={styles.detailItemRow}>
          <Text style={styles.detailItemPrice}>{order.deliveryFee.toLocaleString()} د.ع</Text>
          <Text style={styles.detailItemName}>رسوم التوصيل</Text>
        </View>
        <View style={styles.detailItemRow}>
          <Text style={[styles.detailItemPrice, { color: Colors.primary, fontSize: 16, fontWeight: "800" }]}>
            {(order.total + order.deliveryFee).toLocaleString()} د.ع
          </Text>
          <Text style={[styles.detailItemName, { fontWeight: "700", color: Colors.textPrimary }]}>الإجمالي الكلي</Text>
        </View>
      </View>

      {/* Delivery */}
      {order.deliveryCompanyName && (
        <View style={styles.detailBox}>
          <Text style={styles.detailBoxTitle}>معلومات التوصيل</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailValue}>{order.deliveryCompanyName}</Text>
            <Text style={styles.detailKey}>شركة التوصيل</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailValue, { color: Colors.primary }]}>#{order.trackingCode}</Text>
            <Text style={styles.detailKey}>رمز التتبع</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  return `منذ ${Math.floor(hrs / 24)} يوم`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surface, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary },
  headerStats: { flexDirection: "row", gap: 8 },
  statChip: {
    backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    alignItems: "center", minWidth: 48,
  },
  statChipNum: { fontSize: 16, fontWeight: "800", color: Colors.primary },
  statChipLabel: { fontSize: 10, color: Colors.textMuted },
  tabsRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 4, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 6,
  },
  tabActive: { backgroundColor: Colors.primaryLight },
  tabText: { fontSize: 13, fontWeight: "600", color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },
  tabBadge: { backgroundColor: Colors.border, borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  tabBadgeActive: { backgroundColor: Colors.primary },
  tabBadgeText: { fontSize: 10, fontWeight: "800", color: Colors.textMuted },
  list: { padding: 16, gap: 14, paddingBottom: 120 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 14, paddingBottom: 10,
  },
  cardHeaderRight: { gap: 4 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  statusText: { fontSize: 12, fontWeight: "700" },
  orderId: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary },
  orderTime: { fontSize: 11, color: Colors.textMuted },
  paymentRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  paymentLabel: { fontSize: 12, fontWeight: "700" },
  customerRow: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-end",
    padding: 14, gap: 10, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  customerInfo: { flex: 1, alignItems: "flex-end" },
  customerAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center",
  },
  customerAvatarText: { fontSize: 18, fontWeight: "800", color: Colors.primary },
  customerName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },
  customerPhone: { fontSize: 12, color: Colors.primary, marginTop: 2 },
  customerAddress: { fontSize: 12, color: Colors.textMuted, maxWidth: 220, textAlign: "right", marginTop: 2 },
  customerActions: { gap: 6, alignSelf: "center" },
  waIconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E8FFF2", alignItems: "center", justifyContent: "center" },
  callIconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center" },
  itemsSection: { padding: 14, borderTopWidth: 1, borderTopColor: Colors.border, gap: 6 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemName: { fontSize: 13, color: Colors.textSecondary, flex: 1, textAlign: "right" },
  itemPrice: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary },
  totalSection: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 8, paddingTop: 8, gap: 4 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 13, color: Colors.textSecondary },
  totalValue: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  deliveryInfo: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#F0FDF4",
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  deliveryInfoRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  deliveryInfoLabel: { fontSize: 13, fontWeight: "700", color: Colors.success },
  trackingCode: { fontSize: 12, color: Colors.textMuted, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  actions: { flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  deliveryBtn: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12,
    paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  deliveryBtnText: { fontSize: 13, fontWeight: "700", color: Colors.primary },
  acceptBtn: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  acceptBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  completeBtn: {
    flex: 1, backgroundColor: Colors.success, borderRadius: 12,
    paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  completeBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  cancelBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.errorLight, alignItems: "center", justifyContent: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  detailModal: { backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "90%" },
  deliveryModal: { backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "70%" },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: "center", marginTop: 12 },
  detailContent: { padding: 20, paddingBottom: 40 },
  detailTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  detailOrderId: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  detailStatus: { fontSize: 13, fontWeight: "700", marginBottom: 16 },
  detailSection: { borderRadius: 14, padding: 14, marginBottom: 14 },
  detailSectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailSectionValue: { fontSize: 15 },
  detailSectionLabel: { fontSize: 12, marginTop: 4 },
  detailBox: { backgroundColor: Colors.background, borderRadius: 14, padding: 14, marginBottom: 14 },
  detailBoxTitle: { fontSize: 14, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 6 },
  detailKey: { fontSize: 13, color: Colors.textMuted },
  detailValue: { fontSize: 13, color: Colors.textSecondary, fontWeight: "600", flex: 1, textAlign: "right", marginLeft: 8 },
  notesBox: { backgroundColor: Colors.surface, borderRadius: 10, padding: 10, marginTop: 8 },
  notesLabel: { fontSize: 11, color: Colors.textMuted, textAlign: "right", marginBottom: 4 },
  notesText: { fontSize: 13, color: Colors.textSecondary, textAlign: "right" },
  contactBtns: { flexDirection: "row", gap: 10, marginTop: 12 },
  waDetailBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#25D366", borderRadius: 12, paddingVertical: 10 },
  waDetailBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  callDetailBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 10 },
  callDetailBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  detailItemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  detailItemName: { fontSize: 13, color: Colors.textSecondary, flex: 1, textAlign: "right" },
  detailItemPrice: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  detailDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 6 },
  deliveryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  deliveryTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  deliveryList: { padding: 16, gap: 10, paddingBottom: 40 },
  deliveryOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: Colors.background, borderRadius: 14, padding: 14 },
  deliveryOptionRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  deliveryOptionLogo: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  deliveryOptionName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },
  deliveryOptionTime: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  deliveryOptionLeft: { alignItems: "flex-end", gap: 4 },
  defaultTag: { backgroundColor: "#FEF3C7", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  defaultTagText: { fontSize: 10, fontWeight: "700", color: Colors.warning },
  deliveryOptionFee: { fontSize: 13, fontWeight: "700", color: Colors.primary },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: Colors.textMuted },
});

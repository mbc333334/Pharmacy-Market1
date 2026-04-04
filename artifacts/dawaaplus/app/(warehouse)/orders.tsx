import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useTranslation } from "@/i18n";
import { useOrders, WarehouseOrder, WarehouseOrderStatus } from "@/contexts/OrdersContext";
import InvoiceModal, { InvoiceData } from "@/components/InvoiceModal";

const WAREHOUSE_ID = "w1";

const PAYMENT_LABELS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  cod: { label: "كاش عند الاستلام", icon: "cash-outline", color: "#92400E", bg: "#FEF3C7" },
  card: { label: "بطاقة (مدفوع)", icon: "card-outline", color: "#1D4ED8", bg: "#EFF6FF" },
  whatsapp: { label: "طلب واتساب", icon: "logo-whatsapp", color: "#15803D", bg: "#F0FDF4" },
};

type FilterType = "all" | "new" | "processing" | "completed";

export default function WarehouseOrders() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const { getWarehouseIncomingOrders, updateWarehouseOrderStatus } = useOrders();
  const orders = getWarehouseIncomingOrders(WAREHOUSE_ID);
  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const tabs: { key: FilterType; label: string }[] = [
    { key: "all", label: t("viewAll") },
    { key: "new", label: t("new") },
    { key: "processing", label: t("processing") },
    { key: "completed", label: t("completed") },
  ];

  const handleAccept = (orderId: string) => {
    updateWarehouseOrderStatus(orderId, "processing");
    Alert.alert("✅ تم قبول الطلب", "الطلب قيد المعالجة الآن");
  };

  const handleShip = (orderId: string, pharmacyName: string) => {
    updateWarehouseOrderStatus(orderId, "completed");
    Alert.alert("🚚 تم الشحن", `تم شحن الطلب إلى ${pharmacyName}`);
  };

  const handleCancel = (orderId: string) => {
    Alert.alert("إلغاء الطلب", "هل أنت متأكد من إلغاء هذا الطلب؟", [
      { text: "تراجع", style: "cancel" },
      { text: "إلغاء", style: "destructive", onPress: () => updateWarehouseOrderStatus(orderId, "cancelled") },
    ]);
  };

  const openInvoice = (order: WarehouseOrder) => {
    const inv: InvoiceData = {
      invoiceNumber: order.id,
      date: order.createdAt,
      type: "warehouse_to_pharmacy",
      sellerName: order.warehouseName,
      sellerCity: "هەولێر",
      sellerPhone: "+964 750 000 0010",
      buyerName: order.pharmacyName,
      buyerCity: order.pharmacyCity,
      buyerPhone: order.pharmacyPhone,
      items: order.items.map(i => ({ name: i.name, quantity: i.qty, price: i.price })),
      subtotal: order.total,
      deliveryFee: 0,
      total: order.total,
      paymentMethod: order.paymentMethod,
      isPaid: order.isPaid,
      notes: order.notes,
    };
    setInvoiceData(inv);
    setShowInvoice(true);
  };

  const callPharmacy = (phone: string) => Linking.openURL(`tel:${phone.replace(/\s/g, "")}`);
  const whatsappPharmacy = (phone: string, pharmacyName: string, orderId: string) => {
    const msg = encodeURIComponent(`مرحباً ${pharmacyName}،\nطلبكم رقم ${orderId} تم استلامه وسيتم الشحن قريباً.\nشكراً.`);
    const num = phone.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${num}?text=${msg}`);
  };

  const newCount = orders.filter(o => o.status === "new").length;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <Text style={styles.headerTitle}>{t("warehouseOrders")}</Text>
          <Text style={styles.headerSub}>طلبات الصيدليات الواردة</Text>
        </View>
        {newCount > 0 && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{newCount} جديد 🔔</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {tabs.map(tab => {
          const count = tab.key === "all" ? orders.length : orders.filter(o => o.status === tab.key).length;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, filter === tab.key && styles.tabActive]}
              onPress={() => setFilter(tab.key)}
            >
              {count > 0 && (
                <View style={[styles.tabBadge, filter === tab.key && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, filter === tab.key && { color: "#fff" }]}>{count}</Text>
                </View>
              )}
              <Text style={[styles.tabText, filter === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>لا توجد طلبات</Text>
          </View>
        ) : (
          filtered.map(order => (
            <WarehouseOrderCard
              key={order.id}
              order={order}
              onAccept={order.status === "new" ? () => handleAccept(order.id) : undefined}
              onShip={order.status === "processing" ? () => handleShip(order.id, order.pharmacyName) : undefined}
              onCancel={order.status !== "completed" && order.status !== "cancelled" ? () => handleCancel(order.id) : undefined}
              onCall={() => callPharmacy(order.pharmacyPhone)}
              onWhatsApp={() => whatsappPharmacy(order.pharmacyPhone, order.pharmacyName, order.id)}
              onInvoice={() => openInvoice(order)}
            />
          ))
        )}
      </ScrollView>
      <InvoiceModal
        visible={showInvoice}
        onClose={() => setShowInvoice(false)}
        invoice={invoiceData}
        accentColor="#0D7A54"
      />
    </View>
  );
}

function WarehouseOrderCard({
  order, onAccept, onShip, onCancel, onCall, onWhatsApp, onInvoice,
}: {
  order: WarehouseOrder;
  onAccept?: () => void;
  onShip?: () => void;
  onCancel?: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
  onInvoice: () => void;
}) {
  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    new: { bg: "#FFF3E0", color: "#DD6B20", label: "طلب جديد 🔔" },
    processing: { bg: "#EBF8FF", color: "#3182CE", label: "قيد المعالجة ⚙️" },
    shipped: { bg: "#F0FDF4", color: "#15803D", label: "تم الشحن 🚚" },
    completed: { bg: Colors.successLight, color: Colors.success, label: "مكتمل ✅" },
    cancelled: { bg: Colors.errorLight, color: Colors.error, label: "ملغي ❌" },
  };
  const sc = statusMap[order.status] ?? statusMap.new;
  const pm = PAYMENT_LABELS[order.paymentMethod];

  return (
    <View style={styles.orderCard}>
      {/* Header */}
      <View style={styles.orderTop}>
        <View style={styles.orderTopRight}>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.color }]}>{sc.label}</Text>
          </View>
          <Text style={styles.orderId}>{order.id}</Text>
        </View>
        <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
      </View>

      {/* Payment */}
      <View style={[styles.paymentRow, { backgroundColor: pm.bg }]}>
        <Text style={[styles.paymentLabel, { color: pm.color }]}>{pm.label}</Text>
        <Ionicons name={pm.icon as any} size={15} color={pm.color} />
      </View>

      {/* Pharmacy Info */}
      <View style={styles.pharmacyRow}>
        <View style={styles.pharmacyActions}>
          <TouchableOpacity style={styles.waBtn} onPress={onWhatsApp}>
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.callBtn} onPress={onCall}>
            <Ionicons name="call" size={18} color="#0D7A54" />
          </TouchableOpacity>
        </View>
        <View style={styles.pharmacyInfo}>
          <Text style={styles.pharmacyName}>{order.pharmacyName}</Text>
          <Text style={styles.pharmacyCity}>📍 {order.pharmacyCity}</Text>
          <Text style={styles.pharmacyPhone}>{order.pharmacyPhone}</Text>
        </View>
        <View style={styles.pharmacyIcon}>
          <Ionicons name="storefront" size={24} color="#0D7A54" />
        </View>
      </View>

      {/* Items */}
      <View style={styles.divider} />
      <View style={styles.orderItems}>
        {order.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemTotal}>{(item.qty * item.price).toLocaleString()} د.ع</Text>
            <Text style={styles.itemName}>{item.name} × {item.qty}</Text>
          </View>
        ))}
        <View style={[styles.itemRow, styles.totalRow]}>
          <Text style={styles.orderTotal}>{order.total.toLocaleString()} د.ع</Text>
          <Text style={styles.totalLabel}>الإجمالي</Text>
        </View>
      </View>

      {/* Notes */}
      {order.notes && (
        <View style={styles.notesBox}>
          <Ionicons name="document-text-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.notesText}>{order.notes}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.orderFooter}>
        {onAccept && (
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.acceptBtnText}>قبول الطلب</Text>
          </TouchableOpacity>
        )}
        {onShip && (
          <TouchableOpacity style={styles.shipBtn} onPress={onShip}>
            <Ionicons name="car" size={18} color="#fff" />
            <Text style={styles.shipBtnText}>تم الشحن</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.invoiceBtn} onPress={onInvoice}>
          <Ionicons name="receipt-outline" size={18} color="#7C3AED" />
        </TouchableOpacity>
        {onCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `منذ ${mins} دق`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} س`;
  return `منذ ${Math.floor(hrs / 24)} ي`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#0D7A54", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  headerRight: {},
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  newBadge: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  newBadgeText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  tabsRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 6, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  tabActive: { backgroundColor: "#0D7A54" },
  tabText: { fontSize: 13, fontWeight: "600", color: Colors.textMuted },
  tabTextActive: { color: "#fff" },
  tabBadge: { backgroundColor: Colors.border, borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  tabBadgeActive: { backgroundColor: "rgba(255,255,255,0.3)" },
  tabBadgeText: { fontSize: 10, fontWeight: "800", color: Colors.textMuted },
  orderCard: {
    backgroundColor: Colors.surface, marginHorizontal: 16, marginTop: 12, borderRadius: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    overflow: "hidden",
  },
  orderTop: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 14, paddingBottom: 10,
  },
  orderTopRight: { gap: 4 },
  orderId: { fontSize: 12, color: Colors.textMuted },
  orderTime: { fontSize: 11, color: Colors.textMuted },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  badgeText: { fontSize: 12, fontWeight: "700" },
  paymentRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  paymentLabel: { fontSize: 12, fontWeight: "700" },
  pharmacyRow: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-end",
    padding: 14, gap: 10, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  pharmacyInfo: { flex: 1, alignItems: "flex-end" },
  pharmacyIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#E6F7F2", alignItems: "center", justifyContent: "center" },
  pharmacyName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },
  pharmacyCity: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  pharmacyPhone: { fontSize: 12, color: "#0D7A54", marginTop: 2 },
  pharmacyActions: { gap: 6, alignSelf: "center" },
  waBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E8FFF2", alignItems: "center", justifyContent: "center" },
  callBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E6F7F2", alignItems: "center", justifyContent: "center" },
  divider: { height: 1, backgroundColor: Colors.border },
  orderItems: { padding: 14, gap: 6 },
  itemRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  itemName: { fontSize: 13, color: Colors.textSecondary, textAlign: "right", flex: 1 },
  itemTotal: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 6, paddingTop: 8 },
  totalLabel: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  orderTotal: { fontSize: 16, fontWeight: "800", color: "#0D7A54" },
  notesBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    marginHorizontal: 14, marginBottom: 10, backgroundColor: Colors.background,
    borderRadius: 10, padding: 10,
  },
  notesText: { fontSize: 12, color: Colors.textSecondary, flex: 1, textAlign: "right" },
  orderFooter: { flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  acceptBtn: {
    flex: 1, backgroundColor: "#0D7A54", borderRadius: 12,
    paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  acceptBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  shipBtn: {
    flex: 1, backgroundColor: "#2563EB", borderRadius: 12,
    paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  shipBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  cancelBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.errorLight, alignItems: "center", justifyContent: "center" },
  invoiceBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#F3E8FF", alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: Colors.textMuted },
});

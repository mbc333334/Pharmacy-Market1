import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Platform, Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useCart, CartItem } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrdersContext";

const DELIVERY_FEE = 3500;
const PROMO_CODES: Record<string, number> = {
  SUGAR20: 0.2,
  DAWAA10: 0.1,
  WELCOME: 0.15,
};

type PaymentMethod = "cod" | "card" | "whatsapp";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { placeCustomerOrder } = useOrders();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomInset = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const discountAmount = totalPrice * discount;
  const finalTotal = totalPrice + DELIVERY_FEE - discountAmount;

  const applyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    if (PROMO_CODES[code]) {
      setDiscount(PROMO_CODES[code]);
      setPromoApplied(true);
      setPromoError("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setPromoError("كود الخصم غير صالح");
      setPromoApplied(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleCheckout = () => {
    if (paymentMethod === "card") {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        Alert.alert("معلومات البطاقة", "يرجى إدخال جميع بيانات البطاقة المصرفية");
        return;
      }
    }
    const payLabels: Record<PaymentMethod, string> = {
      cod: "الدفع عند الاستلام (كاش)",
      card: "البطاقة المصرفية",
      whatsapp: "التواصل عبر واتساب",
    };
    Alert.alert(
      "تأكيد الطلب ✅",
      `إجمالي طلبك: ${finalTotal.toLocaleString()} د.ع\nطريقة الدفع: ${payLabels[paymentMethod]}\nسيتم التواصل معك لتأكيد التوصيل`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد الطلب",
          onPress: () => {
            const order = placeCustomerOrder({
              customerId: "c_me",
              customerName: "العميل",
              customerPhone: "+964 750 000 9999",
              pharmacyId: "p1",
              pharmacyName: "دەرمانخانەی شیفا",
              items: items.map(i => ({
                medicineId: i.id,
                name: i.name,
                quantity: i.quantity,
                price: i.price * 1000,
              })),
              total: Math.round(totalPrice * 1000 - discountAmount * 1000),
              deliveryFee: DELIVERY_FEE,
              status: "new",
              paymentMethod,
              isPaid: paymentMethod === "card",
              address: "حي المنصور، شارع 14",
              city: "هەولێر",
            });
            if (paymentMethod === "whatsapp") {
              const itemsList = items.map(i => `• ${i.name} × ${i.quantity}`).join("\n");
              const msg = encodeURIComponent(`مرحباً،\nأريد تأكيد طلبي رقم ${order.id}:\n${itemsList}\nالإجمالي: ${finalTotal.toLocaleString()} د.ع`);
              Linking.openURL(`https://wa.me/9647701234567?text=${msg}`);
            }
            clearCart();
            if (paymentMethod !== "whatsapp") {
              Alert.alert("تم الطلب! 🎉", `رقم طلبك: ${order.id}\nسيتصل بك الصيدلي قريباً.`);
            }
          },
        },
      ]
    );
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { paddingTop: topInset }]}>
        <View style={styles.emptyIcon}>
          <Ionicons name="cart-outline" size={64} color={Colors.border} />
        </View>
        <Text style={styles.emptyTitle}>سلتك فارغة</Text>
        <Text style={styles.emptyText}>أضف أدوية ومنتجات من قسم التصفح</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>{items.length} منتجات</Text>
        <Text style={styles.headerTitle}>سلة التسوق 🛒</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartRow
            item={item}
            onIncrease={() => updateQuantity(item.medicineId, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.medicineId, item.quantity - 1)}
            onRemove={() => removeItem(item.medicineId)}
          />
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            {/* Promo Code */}
            <View style={styles.promoSection}>
              <Text style={styles.promoLabel}>كود الخصم</Text>
              <View style={styles.promoRow}>
                <TouchableOpacity
                  style={[styles.promoBtn, promoApplied && styles.promoBtnDone]}
                  onPress={applyPromo}
                  disabled={promoApplied}
                >
                  <Text style={[styles.promoBtnText, promoApplied && { color: Colors.success }]}>
                    {promoApplied ? "مطبّق ✓" : "تطبيق"}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.promoInput, promoApplied && styles.promoInputApplied]}
                  placeholder="أدخل كود الخصم"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  textAlign="right"
                  autoCapitalize="characters"
                  placeholderTextColor={Colors.textMuted}
                  editable={!promoApplied}
                />
              </View>
              {promoError ? <Text style={styles.promoError}>{promoError}</Text> : null}
              {promoApplied ? (
                <Text style={styles.promoSuccess}>
                  🎉 تم تطبيق خصم {Math.round(discount * 100)}%
                </Text>
              ) : null}
              <Text style={styles.promoHint}>جرّب: SUGAR20 · DAWAA10 · WELCOME</Text>
            </View>

            {/* Payment Method */}
            <View style={styles.paymentSection}>
              <Text style={styles.paymentTitle}>طريقة الدفع</Text>
              <View style={styles.paymentOptions}>
                <PaymentOption
                  icon="cash-outline"
                  label="عند الاستلام"
                  sublabel="ادفع نقداً عند التوصيل"
                  value="cod"
                  selected={paymentMethod === "cod"}
                  color="#0D7A54"
                  onPress={() => setPaymentMethod("cod")}
                />
                <PaymentOption
                  icon="card-outline"
                  label="بطاقة مصرفية"
                  sublabel="Visa / Mastercard"
                  value="card"
                  selected={paymentMethod === "card"}
                  color={Colors.primary}
                  onPress={() => setPaymentMethod("card")}
                />
                <PaymentOption
                  icon="logo-whatsapp"
                  label="واتساب"
                  sublabel="تواصل مع الصيدلية"
                  value="whatsapp"
                  selected={paymentMethod === "whatsapp"}
                  color="#25D366"
                  onPress={() => setPaymentMethod("whatsapp")}
                />
              </View>

              {paymentMethod === "card" && (
                <View style={styles.cardForm}>
                  <Text style={styles.cardFormTitle}>بيانات البطاقة المصرفية</Text>
                  <TextInput
                    style={styles.cardInput}
                    placeholder="رقم البطاقة"
                    value={cardNumber}
                    onChangeText={t => setCardNumber(t.replace(/\D/g, "").slice(0, 16))}
                    keyboardType="numeric"
                    textAlign="right"
                    placeholderTextColor={Colors.textMuted}
                    maxLength={16}
                  />
                  <TextInput
                    style={styles.cardInput}
                    placeholder="اسم صاحب البطاقة"
                    value={cardName}
                    onChangeText={setCardName}
                    textAlign="right"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <View style={styles.cardRow}>
                    <TextInput
                      style={[styles.cardInput, { flex: 1 }]}
                      placeholder="CVV"
                      value={cardCvv}
                      onChangeText={t => setCardCvv(t.slice(0, 3))}
                      keyboardType="numeric"
                      textAlign="right"
                      placeholderTextColor={Colors.textMuted}
                      maxLength={3}
                      secureTextEntry
                    />
                    <TextInput
                      style={[styles.cardInput, { flex: 1 }]}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChangeText={t => setCardExpiry(t.slice(0, 5))}
                      textAlign="right"
                      placeholderTextColor={Colors.textMuted}
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.cardSecure}>
                    <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
                    <Text style={styles.cardSecureText}>مدفوعاتك محمية ومشفرة بالكامل</Text>
                  </View>
                </View>
              )}

              {paymentMethod === "whatsapp" && (
                <View style={styles.whatsappNote}>
                  <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                  <Text style={styles.whatsappNoteText}>
                    سيتم فتح واتساب للتواصل مع الصيدلية وتأكيد الطلب
                  </Text>
                </View>
              )}
            </View>

            {/* Order Summary */}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>ملخص الطلب</Text>
              <SummaryRow label="المجموع الفرعي" value={`${totalPrice.toFixed(2)} د.ع`} />
              <SummaryRow label="رسوم التوصيل" value={`${DELIVERY_FEE.toFixed(2)} د.ع`} />
              {promoApplied && (
                <SummaryRow
                  label={`خصم ${Math.round(discount * 100)}%`}
                  value={`-${discountAmount.toFixed(2)} د.ع`}
                  highlight
                />
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalValue}>{finalTotal.toFixed(2)} د.ع</Text>
                <Text style={styles.totalLabel}>الإجمالي</Text>
              </View>
            </View>

            <View style={{ height: 120 + bottomInset }} />
          </View>
        )}
      />

      {/* Checkout Bar */}
      <View style={[styles.checkoutBar, { paddingBottom: bottomInset + 12 }]}>
        <TouchableOpacity
          style={[styles.checkoutBtn, paymentMethod === "whatsapp" && styles.checkoutBtnWhatsapp]}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutPrice}>{finalTotal.toFixed(2)} د.ع</Text>
          <Text style={styles.checkoutText}>
            {paymentMethod === "whatsapp" ? "تواصل عبر واتساب" : "إتمام الطلب"}
          </Text>
          <Ionicons
            name={paymentMethod === "whatsapp" ? "logo-whatsapp" : "arrow-back"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PaymentOption({
  icon, label, sublabel, value, selected, color, onPress,
}: {
  icon: any; label: string; sublabel: string; value: PaymentMethod;
  selected: boolean; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.paymentOption, selected && { borderColor: color, backgroundColor: color + "12" }]}
      onPress={onPress}
    >
      <View style={styles.paymentOptionRight}>
        <Text style={[styles.paymentOptionLabel, selected && { color }]}>{label}</Text>
        <Text style={styles.paymentOptionSub}>{sublabel}</Text>
      </View>
      <Ionicons name={icon} size={26} color={selected ? color : Colors.textMuted} />
      <View style={[styles.radioOuter, selected && { borderColor: color }]}>
        {selected && <View style={[styles.radioInner, { backgroundColor: color }]} />}
      </View>
    </TouchableOpacity>
  );
}

function CartRow({
  item, onIncrease, onDecrease, onRemove,
}: {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.cartRow}>
      <TouchableOpacity onPress={onRemove} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color={Colors.error} />
      </TouchableOpacity>
      <View style={styles.cartRowContent}>
        <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cartItemBrand}>{item.brand} • {item.pharmacyName}</Text>
        <View style={styles.cartRowBottom}>
          <Text style={styles.cartItemPrice}>{(item.price * item.quantity).toFixed(2)} د.ع</Text>
          <View style={styles.qtyControl}>
            <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
              <Ionicons name="add" size={16} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
              <Ionicons name="remove" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={[styles.cartItemIcon, { backgroundColor: item.color + "18" }]}>
        <Ionicons name="medkit" size={28} color={item.color} />
      </View>
    </View>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryValue, highlight && { color: Colors.success }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emptyContainer: { alignItems: "center", justifyContent: "center", gap: 12 },
  emptyIcon: { marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: Colors.textSecondary },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  headerSub: { fontSize: 13, color: Colors.textMuted, textAlign: "right" },
  list: { padding: 16, gap: 12 },
  cartRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 14, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  cartItemIcon: { width: 60, height: 60, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cartRowContent: { flex: 1 },
  cartItemName: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  cartItemBrand: { fontSize: 12, color: Colors.textMuted, textAlign: "right", marginBottom: 8 },
  cartRowBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cartItemPrice: { fontSize: 15, fontWeight: "800", color: Colors.primary },
  qtyControl: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.primaryLight, borderRadius: 10, overflow: "hidden",
  },
  qtyBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  qtyText: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, paddingHorizontal: 8 },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.errorLight, alignItems: "center", justifyContent: "center",
  },
  footer: { paddingHorizontal: 16, gap: 16 },
  promoSection: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  promoLabel: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right", marginBottom: 8 },
  promoRow: { flexDirection: "row", gap: 8 },
  promoInput: {
    flex: 1, backgroundColor: Colors.surfaceAlt,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary,
  },
  promoInputApplied: { borderColor: Colors.success, backgroundColor: Colors.successLight },
  promoBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 16, justifyContent: "center",
  },
  promoBtnDone: { backgroundColor: Colors.successLight },
  promoBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  promoError: { color: Colors.error, fontSize: 12, textAlign: "right", marginTop: 6 },
  promoSuccess: { color: Colors.success, fontSize: 12, textAlign: "right", marginTop: 6, fontWeight: "600" },
  promoHint: { fontSize: 11, color: Colors.textMuted, textAlign: "right", marginTop: 6 },
  paymentSection: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    gap: 10,
  },
  paymentTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 4 },
  paymentOptions: { gap: 8 },
  paymentOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 2, borderColor: Colors.border, borderRadius: 14,
    padding: 14,
  },
  paymentOptionRight: { flex: 1 },
  paymentOptionLabel: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  paymentOptionSub: { fontSize: 11, color: Colors.textMuted, textAlign: "right", marginTop: 2 },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  cardForm: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 14,
    padding: 14, gap: 10, marginTop: 4,
  },
  cardFormTitle: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, textAlign: "right", marginBottom: 4 },
  cardInput: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: Colors.textPrimary,
  },
  cardRow: { flexDirection: "row", gap: 10 },
  cardSecure: {
    flexDirection: "row", alignItems: "center", gap: 6,
    justifyContent: "center", marginTop: 4,
  },
  cardSecureText: { fontSize: 12, color: Colors.success },
  whatsappNote: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#E8F5E9", borderRadius: 12, padding: 12,
  },
  whatsappNoteText: { flex: 1, fontSize: 13, color: "#1B5E20", textAlign: "right" },
  summary: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  summaryTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 12 },
  summaryRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary },
  totalRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingTop: 12, marginTop: 4,
  },
  totalLabel: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  totalValue: { fontSize: 20, fontWeight: "800", color: Colors.primary },
  checkoutBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary, borderRadius: 16,
    paddingVertical: 16, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 10,
  },
  checkoutBtnWhatsapp: { backgroundColor: "#25D366" },
  checkoutText: { fontSize: 16, fontWeight: "700", color: "#fff", flex: 1, textAlign: "center" },
  checkoutPrice: {
    fontSize: 14, fontWeight: "800", color: "rgba(255,255,255,0.85)",
    backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
});

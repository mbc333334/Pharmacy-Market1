import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Platform, Linking, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, CartItem } from "@/contexts/CartContext";
import { useOrders, PaymentMethod } from "@/contexts/OrdersContext";
import { usePaymentMethods } from "@/contexts/PaymentMethodsContext";

const DELIVERY_FEE = 3500;
const PROMO_CODES: Record<string, number> = {
  SUGAR20: 0.2,
  DAWAA10: 0.1,
  WELCOME: 0.15,
};

// ── Iraqi Payment labels ─────────────────────────────────────────────────
const PAY_LABELS: Record<PaymentMethod, string> = {
  cod:         "الدفع عند الاستلام (كاش)",
  card:        "البطاقة المصرفية (Visa / Mastercard)",
  zaincash:    "زين كاش",
  fastpay:     "فاست باي",
  asiahawala:  "آسيا حوالة",
  qicard:      "كارت كي (Qi Card)",
  nasswallet:  "ناس ولت",
  tabadul:     "تبادل",
  mahali:      "محلي",
  fib:         "فرست إيراقي بنك (FIB)",
  whatsapp:    "التواصل عبر واتساب",
};

// ── Iraqi wallet buttons ─────────────────────────────────────────────────
const IRAQ_WALLETS: { id: PaymentMethod; label: string; color: string; bg: string }[] = [
  { id: "zaincash",   label: "زين كاش",   color: "#E30613", bg: "#FFF0F0" },
  { id: "fastpay",    label: "فاست باي",  color: "#0057A8", bg: "#EEF4FF" },
  { id: "asiahawala", label: "آسيا حوالة",color: "#009E4F", bg: "#EFFFEC" },
  { id: "qicard",     label: "كارت كي",   color: "#FF6900", bg: "#FFF3E8" },
  { id: "nasswallet", label: "ناس ولت",   color: "#5B2D8E", bg: "#F4EDFF" },
  { id: "tabadul",    label: "تبادل",      color: "#007AB8", bg: "#EAF5FF" },
  { id: "mahali",     label: "محلي",       color: "#1A9E6E", bg: "#EDFBF4" },
  { id: "fib",        label: "FIB",        color: "#D4A017", bg: "#FFF9E6" },
];

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { placeCustomerOrder } = useOrders();
  const { enabledMethods, isEnabled, getMethod } = usePaymentMethods();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [walletPhone, setWalletPhone] = useState("");
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Reset payment method if admin disables it
  React.useEffect(() => {
    if (!isEnabled(paymentMethod)) {
      const first = enabledMethods[0];
      if (first) setPaymentMethod(first.id);
    }
  }, [enabledMethods, paymentMethod, isEnabled]);
  const [guestStep, setGuestStep] = useState<"choice" | "phone">("choice");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestPhoneError, setGuestPhoneError] = useState("");

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

  // Core checkout logic — works for both registered and guest customers
  const proceedCheckout = (customerPhone?: string) => {
    const phone = customerPhone ?? user?.phone ?? "+964 750 000 0000";
    const name = user?.name ?? "زبون ضيف";
    Alert.alert(
      "تأكيد الطلب ✅",
      `إجمالي طلبك: ${finalTotal.toLocaleString()} د.ع\nطريقة الدفع: ${PAY_LABELS[paymentMethod]}\nسيتم التواصل معك لتأكيد التوصيل`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد الطلب",
          onPress: () => {
            const order = placeCustomerOrder({
              customerId: user?.id ?? "guest",
              customerName: name,
              customerPhone: phone,
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
              isPaid: paymentMethod !== "cod" && paymentMethod !== "whatsapp",
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
              Alert.alert("تم الطلب! 🎉", `رقم طلبك: ${order.id}\nسيتصل بك الصيدلي قريباً لتأكيد التوصيل.`);
            }
          },
        },
      ]
    );
  };

  const isWallet = (m: PaymentMethod) => IRAQ_WALLETS.some(w => w.id === m);

  const handleCheckout = () => {
    if (paymentMethod === "card") {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        Alert.alert("معلومات البطاقة", "يرجى إدخال جميع بيانات البطاقة المصرفية");
        return;
      }
    }
    if (isWallet(paymentMethod) && walletPhone.length < 10) {
      Alert.alert("رقم المحفظة", "يرجى إدخال رقم هاتف محفظتك الإلكترونية");
      return;
    }
    // Registered user → checkout directly
    if (user) {
      proceedCheckout();
      return;
    }
    // Guest → show choice modal
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGuestStep("choice");
    setGuestPhone("");
    setGuestPhoneError("");
    setShowGuestModal(true);
  };

  const handleGuestCheckout = () => {
    if (!guestPhone || guestPhone.length < 10) {
      setGuestPhoneError("يرجى إدخال رقم هاتف صحيح للتواصل معك عند التوصيل");
      return;
    }
    setShowGuestModal(false);
    proceedCheckout(guestPhone);
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

            {/* ══ PAYMENT METHOD ══ */}
            <View style={styles.paymentSection}>
              <View style={styles.paymentHeaderRow}>
                <Text style={styles.paymentCount}>{enabledMethods.length} وسيلة متاحة</Text>
                <Text style={styles.paymentTitle}>طريقة الدفع</Text>
              </View>

              {enabledMethods.length === 0 ? (
                <View style={styles.noPaymentBox}>
                  <Ionicons name="warning-outline" size={28} color={Colors.textMuted} />
                  <Text style={styles.noPaymentText}>
                    لا توجد وسائل دفع متاحة حالياً.{"\n"}يرجى التواصل مع إدارة المتجر.
                  </Text>
                </View>
              ) : (
                <>
                  {/* ─ Non-wallet methods (cash, card, whatsapp) ─ */}
                  {enabledMethods.filter(m => m.category !== "wallet").length > 0 && (
                    <View style={styles.paymentOptions}>
                      {enabledMethods.filter(m => m.category !== "wallet").map(m => (
                        <PaymentOption
                          key={m.id}
                          icon={m.icon as any}
                          label={m.label}
                          sublabel={m.description}
                          value={m.id}
                          selected={paymentMethod === m.id}
                          color={m.color}
                          onPress={() => setPaymentMethod(m.id)}
                        />
                      ))}
                    </View>
                  )}

                  {/* ─ Iraqi E-Wallets (if any enabled) ─ */}
                  {enabledMethods.filter(m => m.category === "wallet").length > 0 && (
                    <>
                      <View style={styles.walletsHeader}>
                        <View style={styles.walletsDivider} />
                        <Text style={styles.walletsDividerText}>المحافظ الإلكترونية العراقية</Text>
                        <View style={styles.walletsDivider} />
                      </View>

                      <View style={styles.walletsGrid}>
                        {enabledMethods.filter(m => m.category === "wallet").map(w => (
                          <TouchableOpacity
                            key={w.id}
                            style={[
                              styles.walletBtn,
                              { borderColor: paymentMethod === w.id ? w.color : Colors.border },
                              paymentMethod === w.id && { backgroundColor: w.bg },
                            ]}
                            onPress={() => setPaymentMethod(w.id)}
                            activeOpacity={0.75}
                          >
                            <View style={[styles.walletDot, { backgroundColor: paymentMethod === w.id ? w.color : Colors.border }]} />
                            <Text style={[
                              styles.walletBtnText,
                              { color: paymentMethod === w.id ? w.color : Colors.textSecondary },
                            ]}>
                              {w.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                </>
              )}

              {/* ─ Card form ─ */}
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

              {/* ─ Admin account number (transfer destination) ─ */}
              {(() => {
                const m = getMethod(paymentMethod);
                if (!m || !m.showAccount || !m.accountNumber) return null;
                return (
                  <View style={[styles.adminAccountBox, { borderColor: m.color + "40", backgroundColor: m.bg }]}>
                    <View style={styles.adminAccountHeader}>
                      <View style={[styles.adminAccountIcon, { backgroundColor: m.color + "20" }]}>
                        <Ionicons name="arrow-up-circle-outline" size={18} color={m.color} />
                      </View>
                      <Text style={[styles.adminAccountTitle, { color: m.color }]}>
                        حوّل المبلغ إلى حساب المنصة
                      </Text>
                    </View>
                    <View style={[styles.adminAccountNumBox, { borderColor: m.color + "30" }]}>
                      <Ionicons name="copy-outline" size={14} color={m.color} />
                      <Text style={[styles.adminAccountNum, { color: Colors.textPrimary }]}>
                        {m.accountNumber}
                      </Text>
                      <Text style={[styles.adminAccountMethodName, { color: m.color }]}>
                        {m.label}
                      </Text>
                    </View>
                    <Text style={styles.adminAccountHint}>
                      احتفظ بإيصال التحويل — سيُطلب منك عند التأكيد
                    </Text>
                  </View>
                );
              })()}

              {/* ─ Wallet phone input ─ */}
              {isWallet(paymentMethod) && (
                <View style={styles.walletPhoneBox}>
                  <Text style={styles.walletPhoneLabel}>
                    رقم هاتف محفظتك ({PAY_LABELS[paymentMethod]})
                  </Text>
                  <View style={styles.walletPhoneRow}>
                    <TextInput
                      style={styles.walletPhoneInput}
                      placeholder="+964 7XX XXX XXXX"
                      value={walletPhone}
                      onChangeText={setWalletPhone}
                      keyboardType="phone-pad"
                      textAlign="right"
                      placeholderTextColor={Colors.textMuted}
                    />
                    <Ionicons name="wallet-outline" size={20} color={Colors.textMuted} />
                  </View>
                  <Text style={styles.walletPhoteHint}>
                    سيتم خصم المبلغ من محفظتك عند تأكيد الطلب
                  </Text>
                </View>
              )}

              {/* ─ WhatsApp note ─ */}
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

      {/* Guest Checkout Gate Modal */}
      <Modal visible={showGuestModal} transparent animationType="slide" onRequestClose={() => setShowGuestModal(false)}>
        <TouchableOpacity
          style={styles.guestOverlay}
          activeOpacity={1}
          onPress={() => setShowGuestModal(false)}
        >
          <View style={styles.guestSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.guestHandle} />

            {guestStep === "choice" ? (
              <>
                {/* ── Step 1: Choose path ── */}
                <View style={styles.guestIconWrap}>
                  <Ionicons name="cart" size={34} color={Colors.primary} />
                </View>
                <Text style={styles.guestTitle}>أكمل طلبك</Text>
                <Text style={styles.guestSub}>
                  سجّل دخولك لمتابعة طلباتك، أو اشترِ مباشرةً بدون حساب
                </Text>

                {/* Option 1: Login */}
                <TouchableOpacity
                  style={styles.guestLoginBtn}
                  onPress={() => { setShowGuestModal(false); router.push("/(auth)/login"); }}
                >
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                  <View style={styles.guestBtnInfo}>
                    <Text style={styles.guestLoginBtnText}>تسجيل الدخول</Text>
                    <Text style={styles.guestBtnInfoSub}>تتبع طلباتك وتاريخ مشترياتك</Text>
                  </View>
                </TouchableOpacity>

                {/* Option 2: Register */}
                <TouchableOpacity
                  style={styles.guestRegisterBtn}
                  onPress={() => { setShowGuestModal(false); router.push("/(auth)/register"); }}
                >
                  <Ionicons name="person-add-outline" size={20} color={Colors.primary} />
                  <View style={styles.guestBtnInfo}>
                    <Text style={styles.guestRegisterBtnText}>إنشاء حساب مجاني</Text>
                    <Text style={[styles.guestBtnInfoSub, { color: Colors.primary + "90" }]}>سريع وسهل، احفظ عناوينك</Text>
                  </View>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.guestOrRow}>
                  <View style={styles.guestOrLine} />
                  <Text style={styles.guestOrText}>أو</Text>
                  <View style={styles.guestOrLine} />
                </View>

                {/* Option 3: Buy without registration */}
                <TouchableOpacity
                  style={styles.guestDirectBtn}
                  onPress={() => {
                    setGuestStep("phone");
                    setGuestPhone("");
                    setGuestPhoneError("");
                  }}
                >
                  <Ionicons name="flash-outline" size={20} color="#D69E2E" />
                  <View style={styles.guestBtnInfo}>
                    <Text style={styles.guestDirectBtnText}>الشراء بدون تسجيل</Text>
                    <Text style={[styles.guestBtnInfoSub, { color: "#D69E2E90" }]}>أسرع طريقة، لا حاجة لحساب</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.guestCancelBtn} onPress={() => setShowGuestModal(false)}>
                  <Text style={styles.guestCancelText}>متابعة التصفح</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* ── Step 2: Guest phone number ── */}
                <TouchableOpacity
                  style={styles.guestBackBtn}
                  onPress={() => setGuestStep("choice")}
                >
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  <Text style={styles.guestBackText}>رجوع</Text>
                </TouchableOpacity>

                <View style={[styles.guestIconWrap, { backgroundColor: "#D69E2E18" }]}>
                  <Ionicons name="flash" size={34} color="#D69E2E" />
                </View>
                <Text style={styles.guestTitle}>رقمك للتوصيل</Text>
                <Text style={styles.guestSub}>
                  نحتاج رقم هاتفك فقط ليتواصل معك الصيدلي لتأكيد التوصيل
                </Text>

                <View style={styles.guestPhoneWrap}>
                  <TextInput
                    style={[styles.guestPhoneInput, guestPhoneError ? { borderColor: Colors.error } : {}]}
                    placeholder="+964 7XX XXX XXXX"
                    value={guestPhone}
                    onChangeText={t => { setGuestPhone(t); setGuestPhoneError(""); }}
                    keyboardType="phone-pad"
                    textAlign="right"
                    placeholderTextColor={Colors.textMuted}
                    autoFocus
                  />
                  <Ionicons name="call-outline" size={20} color={Colors.textMuted} style={styles.guestPhoneIcon} />
                </View>
                {guestPhoneError ? (
                  <Text style={styles.guestPhoneError}>{guestPhoneError}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.guestLoginBtn, { backgroundColor: "#D69E2E" }]}
                  onPress={handleGuestCheckout}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.guestLoginBtnText}>تأكيد الطلب</Text>
                </TouchableOpacity>

                <Text style={styles.guestPrivacyNote}>
                  رقمك يُستخدم فقط للتواصل بشأن طلبك ولن يُشارك مع أي طرف ثالث
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  paymentHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  paymentTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  paymentCount: { fontSize: 12, color: Colors.textMuted, fontWeight: "600", backgroundColor: Colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  noPaymentBox: { alignItems: "center", gap: 8, paddingVertical: 20 },
  noPaymentText: { fontSize: 13, color: Colors.textMuted, textAlign: "center", lineHeight: 20 },
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
  walletsHeader: {
    flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4,
  },
  walletsDivider: { flex: 1, height: 1, backgroundColor: Colors.border },
  walletsDividerText: { fontSize: 11, fontWeight: "700", color: Colors.textMuted, flexShrink: 0 },
  walletsGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
  },
  walletBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1.5, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8,
    width: "48%",
  },
  walletDot: { width: 8, height: 8, borderRadius: 4 },
  walletBtnText: { fontSize: 12, fontWeight: "700" },
  adminAccountBox: {
    borderWidth: 1.5, borderRadius: 14, padding: 14, gap: 10,
  },
  adminAccountHeader: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end" },
  adminAccountIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  adminAccountTitle: { fontSize: 13, fontWeight: "800", textAlign: "right" },
  adminAccountNumBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.7)", borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, justifyContent: "flex-end",
  },
  adminAccountNum: { flex: 1, fontSize: 15, fontWeight: "800", textAlign: "right", letterSpacing: 0.5 },
  adminAccountMethodName: { fontSize: 11, fontWeight: "700" },
  adminAccountHint: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },

  walletPhoneBox: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 12, gap: 8, marginTop: 4,
  },
  walletPhoneLabel: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  walletPhoneRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12,
  },
  walletPhoneInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary },
  walletPhoteHint: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
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
  guestOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end",
  },
  guestSheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, alignItems: "center", gap: 12,
  },
  guestHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 4,
  },
  guestIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center",
    marginBottom: 2,
  },
  guestTitle: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary, textAlign: "center" },
  guestSub: {
    fontSize: 13, color: Colors.textMuted, textAlign: "center", lineHeight: 20,
    paddingHorizontal: 8, marginBottom: 4,
  },
  guestLoginBtn: {
    width: "100%", backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 13,
    paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12,
  },
  guestLoginBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  guestRegisterBtn: {
    width: "100%", borderWidth: 2, borderColor: Colors.primary, borderRadius: 14,
    paddingVertical: 11, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  guestRegisterBtnText: { fontSize: 15, fontWeight: "700", color: Colors.primary },
  guestBtnInfo: { flex: 1, alignItems: "flex-end" },
  guestBtnInfoSub: { fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 },
  guestOrRow: { flexDirection: "row", alignItems: "center", gap: 8, width: "100%" },
  guestOrLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  guestOrText: { fontSize: 12, color: Colors.textMuted, fontWeight: "600" },
  guestDirectBtn: {
    width: "100%", borderWidth: 1.5, borderColor: "#D69E2E40",
    backgroundColor: "#D69E2E0C", borderRadius: 14, paddingVertical: 12,
    paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12,
  },
  guestDirectBtnText: { fontSize: 15, fontWeight: "700", color: "#D69E2E" },
  guestCancelBtn: { paddingVertical: 8, alignItems: "center" },
  guestCancelText: { fontSize: 13, color: Colors.textMuted, fontWeight: "500" },
  guestBackBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-end", marginBottom: 4,
  },
  guestBackText: { fontSize: 13, color: Colors.textMuted, fontWeight: "600" },
  guestPhoneWrap: {
    width: "100%", flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 14,
  },
  guestPhoneInput: {
    flex: 1, paddingVertical: 14, fontSize: 16, color: Colors.textPrimary,
  },
  guestPhoneIcon: { paddingHorizontal: 4 },
  guestPhoneError: {
    fontSize: 12, color: Colors.error, textAlign: "right", alignSelf: "flex-end",
  },
  guestPrivacyNote: {
    fontSize: 11, color: Colors.textMuted, textAlign: "center",
    lineHeight: 16, paddingHorizontal: 8,
  },
});

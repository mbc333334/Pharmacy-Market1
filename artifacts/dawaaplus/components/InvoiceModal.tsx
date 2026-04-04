import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Platform, Alert,
} from "react-native";
import Colors from "@/constants/colors";

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  type: "pharmacy_to_customer" | "warehouse_to_pharmacy";
  sellerName: string;
  sellerCity: string;
  sellerPhone: string;
  buyerName: string;
  buyerCity?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  isPaid: boolean;
  deliveryCompany?: string;
  trackingCode?: string;
  notes?: string;
}

interface InvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
  accentColor?: string;
}

const PAY_METHOD_LABELS: Record<string, string> = {
  cod: "كاش عند الاستلام",
  card: "بطاقة مصرفية (مدفوع)",
  whatsapp: "طلب واتساب",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-IQ", { year: "numeric", month: "long", day: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });
}

function printInvoiceWeb(inv: InvoiceData, accentColor: string) {
  const rows = inv.items.map(item => `
    <tr>
      <td style="text-align:right;padding:8px 4px;border-bottom:1px solid #eee;">${(item.price * item.quantity).toLocaleString()} د.ع</td>
      <td style="text-align:center;padding:8px 4px;border-bottom:1px solid #eee;">${item.quantity}</td>
      <td style="text-align:right;padding:8px 4px;border-bottom:1px solid #eee;">${item.price.toLocaleString()} د.ع</td>
      <td style="text-align:right;padding:8px 4px;border-bottom:1px solid #eee;font-weight:600;">${item.name}</td>
    </tr>
  `).join("");

  const typeLabel = inv.type === "pharmacy_to_customer" ? "فاتورة صيدلية" : "فاتورة مذخر";
  const sellerLabel = inv.type === "pharmacy_to_customer" ? "الصيدلية" : "المذخر";
  const buyerLabel = inv.type === "pharmacy_to_customer" ? "العميل" : "الصيدلية";

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <title>فاتورة - ${inv.invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; background: #fff; color: #1a1a2e; }
    .page { max-width: 794px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid ${accentColor}; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-logo { width: 56px; height: 56px; background: ${accentColor}; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .brand-logo span { font-size: 28px; color: white; }
    .brand-name { font-size: 28px; font-weight: 900; color: ${accentColor}; }
    .brand-sub { font-size: 13px; color: #666; margin-top: 2px; }
    .invoice-meta { text-align: left; }
    .invoice-type { font-size: 18px; font-weight: 800; color: ${accentColor}; margin-bottom: 6px; }
    .inv-num { font-size: 14px; color: #555; margin-bottom: 4px; }
    .inv-date { font-size: 13px; color: #888; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    .party { background: #f9fafb; border-radius: 12px; padding: 16px; border: 1px solid #eee; }
    .party-title { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
    .party-name { font-size: 18px; font-weight: 800; color: #1a1a2e; margin-bottom: 4px; }
    .party-detail { font-size: 13px; color: #555; margin-top: 3px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead { background: ${accentColor}; color: white; }
    thead th { padding: 10px 8px; text-align: right; font-size: 13px; font-weight: 700; }
    tbody tr:hover { background: #f9fafb; }
    .totals { margin-right: auto; margin-left: 0; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 14px; border-bottom: 1px solid #eee; }
    .total-row:last-child { border-bottom: none; font-size: 18px; font-weight: 900; color: ${accentColor}; padding-top: 12px; }
    .payment-section { margin-top: 24px; padding: 16px; background: ${accentColor}10; border-radius: 12px; border: 1px solid ${accentColor}30; }
    .payment-title { font-size: 13px; font-weight: 700; color: ${accentColor}; margin-bottom: 8px; }
    .payment-details { display: flex; gap: 20px; flex-wrap: wrap; }
    .payment-item { font-size: 13px; color: #555; }
    .payment-item span { font-weight: 700; color: #1a1a2e; }
    .paid-badge { display: inline-block; background: #dcfce7; color: #16a34a; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .unpaid-badge { display: inline-block; background: #fef3c7; color: #d97706; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #ddd; text-align: center; }
    .footer-main { font-size: 16px; font-weight: 700; color: ${accentColor}; margin-bottom: 6px; }
    .footer-sub { font-size: 12px; color: #aaa; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    .print-btn { display: block; margin: 0 auto 24px; padding: 12px 32px; background: ${accentColor}; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; }
  </style>
</head>
<body>
  <div class="page">
    <button class="print-btn no-print" onclick="window.print()">🖨️ طباعة الفاتورة</button>
    <div class="header">
      <div class="brand">
        <div class="brand-logo"><span>+</span></div>
        <div>
          <div class="brand-name">دواء +</div>
          <div class="brand-sub">منصة الصيدليات والأدوية في إقليم كردستان والعراق</div>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-type">${typeLabel}</div>
        <div class="inv-num">رقم الفاتورة: ${inv.invoiceNumber}</div>
        <div class="inv-date">التاريخ: ${formatDate(inv.date)} — ${formatTime(inv.date)}</div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <div class="party-title">${sellerLabel} (البائع)</div>
        <div class="party-name">${inv.sellerName}</div>
        <div class="party-detail">📍 ${inv.sellerCity}</div>
        <div class="party-detail">📞 ${inv.sellerPhone}</div>
      </div>
      <div class="party">
        <div class="party-title">${buyerLabel} (المشتري)</div>
        <div class="party-name">${inv.buyerName}</div>
        ${inv.buyerCity ? `<div class="party-detail">📍 ${inv.buyerCity}</div>` : ""}
        ${inv.buyerAddress ? `<div class="party-detail">🏠 ${inv.buyerAddress}</div>` : ""}
        ${inv.buyerPhone ? `<div class="party-detail">📞 ${inv.buyerPhone}</div>` : ""}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="text-align:right;">الإجمالي</th>
          <th style="text-align:center;width:80px;">الكمية</th>
          <th style="text-align:right;">سعر الوحدة</th>
          <th style="text-align:right;">اسم المنتج</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div style="display:flex;justify-content:flex-start;">
      <div class="totals">
        <div class="total-row"><span>${inv.subtotal.toLocaleString()} د.ع</span><span>المجموع الفرعي</span></div>
        <div class="total-row"><span>${inv.deliveryFee.toLocaleString()} د.ع</span><span>رسوم التوصيل</span></div>
        ${inv.discount ? `<div class="total-row" style="color:#16a34a;"><span>- ${inv.discount.toLocaleString()} د.ع</span><span>الخصم</span></div>` : ""}
        <div class="total-row"><span>${inv.total.toLocaleString()} د.ع</span><span>الإجمالي الكلي</span></div>
      </div>
    </div>

    <div class="payment-section">
      <div class="payment-title">تفاصيل الدفع والتوصيل</div>
      <div class="payment-details">
        <div class="payment-item">طريقة الدفع: <span>${PAY_METHOD_LABELS[inv.paymentMethod] ?? inv.paymentMethod}</span></div>
        <div class="payment-item">الحالة: <span class="${inv.isPaid ? "paid-badge" : "unpaid-badge"}">${inv.isPaid ? "✅ مدفوع" : "⏳ غير مدفوع"}</span></div>
        ${inv.deliveryCompany ? `<div class="payment-item">شركة التوصيل: <span>${inv.deliveryCompany}</span></div>` : ""}
        ${inv.trackingCode ? `<div class="payment-item">رمز التتبع: <span>#${inv.trackingCode}</span></div>` : ""}
      </div>
      ${inv.notes ? `<div style="margin-top:10px;font-size:13px;color:#555;">ملاحظة: ${inv.notes}</div>` : ""}
    </div>

    <div class="footer">
      <div class="footer-main">شكراً لتعاملكم مع دواء+</div>
      <div class="footer-sub">منصة الصيدليات والأدوية — إقليم كردستان والعراق</div>
      <div class="footer-sub" style="margin-top:4px;">هذه الفاتورة صادرة إلكترونياً ولا تحتاج إلى توقيع</div>
    </div>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  } else {
    Alert.alert("تحذير", "يرجى السماح بالنوافذ المنبثقة لطباعة الفاتورة");
  }
}

export default function InvoiceModal({ visible, onClose, invoice, accentColor = Colors.primary }: InvoiceModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    if (Platform.OS === "web") {
      printInvoiceWeb(invoice, accentColor);
    } else {
      Alert.alert(
        "طباعة الفاتورة",
        "يمكنك مشاركة الفاتورة أو أخذ لقطة شاشة لطباعتها",
        [{ text: "حسناً" }]
      );
    }
  };

  const sellerLabel = invoice.type === "pharmacy_to_customer" ? "الصيدلية" : "المذخر";
  const buyerLabel = invoice.type === "pharmacy_to_customer" ? "العميل" : "الصيدلية";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={[styles.invoiceHeader, { backgroundColor: accentColor }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.appName}>دواء +</Text>
              <Text style={styles.invoiceTitle}>
                {invoice.type === "pharmacy_to_customer" ? "فاتورة صيدلية" : "فاتورة مذخر"}
              </Text>
            </View>
            <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
              <Ionicons name="print-outline" size={20} color="#fff" />
              <Text style={styles.printBtnText}>طباعة</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Invoice Number & Date */}
            <View style={styles.metaRow}>
              <Text style={styles.metaDate}>{formatDate(invoice.date)} — {formatTime(invoice.date)}</Text>
              <Text style={styles.metaNumber}>#{invoice.invoiceNumber}</Text>
            </View>

            {/* Parties */}
            <View style={styles.parties}>
              <View style={[styles.partyCard, { borderColor: accentColor + "40" }]}>
                <View style={[styles.partyBadge, { backgroundColor: accentColor }]}>
                  <Text style={styles.partyBadgeText}>{sellerLabel}</Text>
                </View>
                <Text style={styles.partyName}>{invoice.sellerName}</Text>
                <Text style={styles.partyDetail}>📍 {invoice.sellerCity}</Text>
                <Text style={styles.partyDetail}>📞 {invoice.sellerPhone}</Text>
              </View>
              <View style={styles.arrowContainer}>
                <View style={[styles.arrowBubble, { backgroundColor: accentColor + "20" }]}>
                  <Ionicons name="arrow-back" size={20} color={accentColor} />
                </View>
              </View>
              <View style={[styles.partyCard, { borderColor: accentColor + "40" }]}>
                <View style={[styles.partyBadge, { backgroundColor: "#6B7280" }]}>
                  <Text style={styles.partyBadgeText}>{buyerLabel}</Text>
                </View>
                <Text style={styles.partyName}>{invoice.buyerName}</Text>
                {invoice.buyerCity && <Text style={styles.partyDetail}>📍 {invoice.buyerCity}</Text>}
                {invoice.buyerAddress && <Text style={styles.partyDetail}>🏠 {invoice.buyerAddress}</Text>}
                {invoice.buyerPhone && <Text style={styles.partyDetail}>📞 {invoice.buyerPhone}</Text>}
              </View>
            </View>

            {/* Items Table */}
            <View style={styles.table}>
              <View style={[styles.tableHeader, { backgroundColor: accentColor }]}>
                <Text style={[styles.colTotal, styles.thText]}>الإجمالي</Text>
                <Text style={[styles.colQty, styles.thText]}>الكمية</Text>
                <Text style={[styles.colPrice, styles.thText]}>السعر</Text>
                <Text style={[styles.colName, styles.thText]}>المنتج</Text>
              </View>
              {invoice.items.map((item, i) => (
                <View key={i} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : {}]}>
                  <Text style={[styles.colTotal, styles.tdText]}>{(item.price * item.quantity).toLocaleString()} د.ع</Text>
                  <Text style={[styles.colQty, styles.tdText, styles.tdCenter]}>{item.quantity}</Text>
                  <Text style={[styles.colPrice, styles.tdText]}>{item.price.toLocaleString()} د.ع</Text>
                  <Text style={[styles.colName, styles.tdText, styles.tdBold]}>{item.name}</Text>
                </View>
              ))}
            </View>

            {/* Totals */}
            <View style={styles.totalsBox}>
              <TotalRow label="المجموع الفرعي" value={invoice.subtotal} />
              <TotalRow label="رسوم التوصيل" value={invoice.deliveryFee} />
              {!!invoice.discount && invoice.discount > 0 && (
                <TotalRow label="الخصم" value={-invoice.discount} valueColor="#16A34A" />
              )}
              <View style={[styles.totalRowFinal, { borderTopColor: accentColor + "40" }]}>
                <Text style={[styles.totalFinalValue, { color: accentColor }]}>{invoice.total.toLocaleString()} د.ع</Text>
                <Text style={styles.totalFinalLabel}>الإجمالي الكلي</Text>
              </View>
            </View>

            {/* Payment Info */}
            <View style={[styles.paymentBox, { backgroundColor: accentColor + "0D", borderColor: accentColor + "30" }]}>
              <Text style={[styles.paymentTitle, { color: accentColor }]}>تفاصيل الدفع والتوصيل</Text>
              <View style={styles.paymentGrid}>
                <PaymentCell icon="card-outline" label="طريقة الدفع" value={PAY_METHOD_LABELS[invoice.paymentMethod] ?? invoice.paymentMethod} />
                <PaymentCell
                  icon={invoice.isPaid ? "checkmark-circle" : "time-outline"}
                  label="حالة الدفع"
                  value={invoice.isPaid ? "✅ مدفوع" : "⏳ غير مدفوع"}
                  valueColor={invoice.isPaid ? "#16A34A" : Colors.warning}
                />
                {invoice.deliveryCompany && (
                  <PaymentCell icon="car-outline" label="شركة التوصيل" value={invoice.deliveryCompany} />
                )}
                {invoice.trackingCode && (
                  <PaymentCell icon="barcode-outline" label="رمز التتبع" value={`#${invoice.trackingCode}`} />
                )}
              </View>
              {invoice.notes && (
                <View style={styles.notesRow}>
                  <Ionicons name="document-text-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.notesText}>{invoice.notes}</Text>
                </View>
              )}
            </View>

            {/* Footer */}
            <View style={styles.invoiceFooter}>
              <Text style={[styles.footerMain, { color: accentColor }]}>شكراً لتعاملكم مع دواء+</Text>
              <Text style={styles.footerSub}>منصة الصيدليات والأدوية — إقليم كردستان والعراق</Text>
              <Text style={styles.footerSub}>الفاتورة صادرة إلكترونياً</Text>
            </View>

            {/* Print Button at bottom */}
            <TouchableOpacity style={[styles.bottomPrintBtn, { backgroundColor: accentColor }]} onPress={handlePrint}>
              <Ionicons name="print-outline" size={20} color="#fff" />
              <Text style={styles.bottomPrintBtnText}>
                {Platform.OS === "web" ? "طباعة / تصدير PDF" : "مشاركة الفاتورة"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function TotalRow({ label, value, valueColor }: { label: string; value: number; valueColor?: string }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalValue, valueColor ? { color: valueColor } : {}]}>
        {value < 0 ? `- ${Math.abs(value).toLocaleString()}` : value.toLocaleString()} د.ع
      </Text>
      <Text style={styles.totalLabel}>{label}</Text>
    </View>
  );
}

function PaymentCell({ icon, label, value, valueColor }: { icon: string; label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.paymentCell}>
      <Ionicons name={icon as any} size={16} color={Colors.textMuted} />
      <View>
        <Text style={styles.paymentCellLabel}>{label}</Text>
        <Text style={[styles.paymentCellValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modal: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: "95%", minHeight: "80%",
  },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 0 },
  invoiceHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, borderTopLeftRadius: 22, borderTopRightRadius: 22, marginTop: 8,
  },
  closeBtn: { padding: 4 },
  headerCenter: { alignItems: "center" },
  appName: { fontSize: 20, fontWeight: "900", color: "#fff" },
  invoiceTitle: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  printBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  printBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  content: { padding: 16, paddingBottom: 40 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, marginBottom: 12 },
  metaNumber: { fontSize: 14, fontWeight: "800", color: Colors.textPrimary },
  metaDate: { fontSize: 12, color: Colors.textMuted },
  parties: { flexDirection: "row", alignItems: "stretch", gap: 8, marginBottom: 16 },
  partyCard: { flex: 1, backgroundColor: Colors.background, borderRadius: 14, padding: 12, borderWidth: 1 },
  partyBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 8 },
  partyBadgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  partyName: { fontSize: 13, fontWeight: "800", color: Colors.textPrimary, textAlign: "right", marginBottom: 4 },
  partyDetail: { fontSize: 11, color: Colors.textMuted, textAlign: "right", marginTop: 2 },
  arrowContainer: { justifyContent: "center", alignItems: "center", width: 36 },
  arrowBubble: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  table: { borderRadius: 14, overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  tableHeader: { flexDirection: "row", padding: 10 },
  thText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  tableRow: { flexDirection: "row", padding: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tableRowEven: { backgroundColor: Colors.background },
  tdText: { fontSize: 12, color: Colors.textSecondary },
  tdCenter: { textAlign: "center" },
  tdBold: { fontWeight: "700", color: Colors.textPrimary },
  colName: { flex: 3, textAlign: "right" },
  colPrice: { flex: 2, textAlign: "right" },
  colQty: { flex: 1, textAlign: "center" },
  colTotal: { flex: 2, textAlign: "right" },
  totalsBox: { backgroundColor: Colors.background, borderRadius: 14, padding: 14, marginBottom: 14 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  totalLabel: { fontSize: 13, color: Colors.textSecondary },
  totalValue: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary },
  totalRowFinal: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, marginTop: 4, borderTopWidth: 2 },
  totalFinalLabel: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  totalFinalValue: { fontSize: 20, fontWeight: "900" },
  paymentBox: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 20 },
  paymentTitle: { fontSize: 14, fontWeight: "800", marginBottom: 12, textAlign: "right" },
  paymentGrid: { gap: 10 },
  paymentCell: { flexDirection: "row", alignItems: "flex-start", gap: 10, justifyContent: "flex-end" },
  paymentCellLabel: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  paymentCellValue: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary, textAlign: "right" },
  notesRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 10, justifyContent: "flex-end" },
  notesText: { fontSize: 12, color: Colors.textSecondary, flex: 1, textAlign: "right" },
  invoiceFooter: { alignItems: "center", paddingVertical: 20, borderTopWidth: 1, borderTopColor: Colors.border, marginBottom: 16, borderStyle: "dashed" },
  footerMain: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
  footerSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  bottomPrintBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, paddingVertical: 14 },
  bottomPrintBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});

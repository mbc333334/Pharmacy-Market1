import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ActivityIndicator, Platform, Animated, TextInput, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

export interface ScannedMedicine {
  barcode: string;
  barcodeType: string;
  name?: string;
  brand?: string;
  category?: string;
  source?: string;
}

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (result: ScannedMedicine) => void;
}

const KNOWN_BARCODES: Record<string, Partial<ScannedMedicine>> = {
  "6914921018875": { name: "أموكسيسيلين 500mg", brand: "Augmentin", category: "مضادات حيوية" },
  "5000456025025": { name: "باراسيتامول 500mg", brand: "Panadol", category: "مسكنات" },
  "3400936151116": { name: "أتورفاستاتين 20mg", brand: "Lipitor", category: "قلب وأوعية" },
  "6291003502227": { name: "ميتفورمين 850mg", brand: "Glucophage", category: "سكري" },
  "6294003501133": { name: "أوميبرازول 20mg", brand: "Losec", category: "جهاز هضمي" },
  "5011036067849": { name: "إيبوبروفين 400mg", brand: "Brufen", category: "مسكنات" },
  "4005808306244": { name: "لوراتادين 10mg", brand: "Clarityn", category: "حساسية" },
  "7046264005406": { name: "أملوديبين 5mg", brand: "Norvasc", category: "ضغط دم" },
  "6921734800016": { name: "سالبوتامول بخاخ", brand: "Ventolin", category: "تنفس" },
  "6921734800023": { name: "سيتريزين 10mg", brand: "Zyrtec", category: "حساسية" },
  "5054563100003": { name: "لانسوبرازول 30mg", brand: "Prevacid", category: "جهاز هضمي" },
  "8712400000018": { name: "فيتامين C 1000mg", brand: "Redoxon", category: "فيتامينات" },
};

export async function lookupBarcode(barcode: string): Promise<Partial<ScannedMedicine>> {
  const local = KNOWN_BARCODES[barcode];
  if (local) return { ...local, source: "قاعدة بيانات دواء+" };

  try {
    const url = `https://api.fda.gov/drug/ndc.json?search=package_ndc:"${barcode}"&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      const result = data?.results?.[0];
      if (result) {
        return {
          name: result.generic_name ?? result.substance_name?.[0] ?? undefined,
          brand: result.brand_name ?? undefined,
          source: "FDA",
        };
      }
    }
  } catch {}

  try {
    const url3 = `https://world.openfoodfacts.org/product/${barcode}.json`;
    const res3 = await fetch(url3, { signal: AbortSignal.timeout(5000) });
    if (res3.ok) {
      const data3 = await res3.json();
      if (data3?.status === 1 && data3?.product?.product_name) {
        return {
          name: data3.product.product_name,
          brand: data3.product.brands ?? undefined,
          source: "Open Food Facts",
        };
      }
    }
  } catch {}

  return {};
}

export default function BarcodeScanner({ visible, onClose, onScanned }: BarcodeScannerProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [manualResult, setManualResult] = useState<Partial<ScannedMedicine> | null>(null);
  const lineAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setScanning(true);
      setLastBarcode(null);
      setManualCode("");
      setManualResult(null);
      startLineAnimation();
    }
  }, [visible]);

  const startLineAnimation = () => {
    lineAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(lineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(lineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  };

  const handleBarcodeScanned = async ({ data, type }: { data: string; type: string }) => {
    if (!scanning || loading || data === lastBarcode) return;
    setLastBarcode(data);
    setScanning(false);
    setLoading(true);
    try {
      const info = await lookupBarcode(data);
      onScanned({ barcode: data, barcodeType: type, ...info });
    } finally {
      setLoading(false);
    }
  };

  const handleManualLookup = async () => {
    if (!manualCode.trim()) return;
    setLoading(true);
    setManualResult(null);
    try {
      const info = await lookupBarcode(manualCode.trim());
      setManualResult(info);
    } finally {
      setLoading(false);
    }
  };

  const handleManualConfirm = () => {
    onScanned({
      barcode: manualCode.trim(),
      barcodeType: "manual",
      ...(manualResult ?? {}),
    });
    setManualCode("");
    setManualResult(null);
  };

  if (Platform.OS === "web") {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.webContainer, { paddingTop: insets.top + 20 }]}>
          <View style={styles.webHeader}>
            <TouchableOpacity onPress={onClose} style={styles.webCloseBtn}>
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.webTitle}>إدخال باركود الدواء</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.webBody}>
            <View style={styles.barcodeIconWrap}>
              <Ionicons name="barcode-outline" size={80} color={Colors.primary} />
            </View>
            <Text style={styles.webDesc}>
              أدخل رقم الباركود يدوياً أو امسحه عبر تطبيق الهاتف
            </Text>

            <View style={styles.webInputRow}>
              <TouchableOpacity
                style={[styles.lookupBtn, loading && { opacity: 0.7 }]}
                onPress={handleManualLookup}
                disabled={loading || !manualCode.trim()}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="search" size={20} color="#fff" />
                }
              </TouchableOpacity>
              <TextInput
                style={styles.webInput}
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="6914921018875"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                returnKeyType="search"
                onSubmitEditing={handleManualLookup}
                textAlign="right"
              />
            </View>

            {manualResult !== null && (
              <View style={styles.resultCard}>
                {manualResult.name ? (
                  <>
                    <View style={styles.resultFoundRow}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                      <Text style={styles.resultFoundText}>تم العثور على الدواء</Text>
                    </View>
                    {manualResult.source && (
                      <View style={styles.sourceBadge}>
                        <Text style={styles.sourceBadgeText}>✓ {manualResult.source}</Text>
                      </View>
                    )}
                    <Text style={styles.resultName}>{manualResult.name}</Text>
                    {manualResult.brand && (
                      <Text style={styles.resultBrand}>{manualResult.brand}</Text>
                    )}
                    {manualResult.category && (
                      <Text style={styles.resultCategory}>{manualResult.category}</Text>
                    )}
                    <TouchableOpacity style={styles.confirmBtn} onPress={handleManualConfirm}>
                      <Text style={styles.confirmBtnText}>استخدام هذا الدواء</Text>
                      <Ionicons name="arrow-back" size={16} color="#fff" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.resultNotFoundRow}>
                      <Ionicons name="information-circle" size={20} color={Colors.textMuted} />
                      <Text style={styles.resultNotFoundText}>لم يُعثر على دواء بهذا الباركود</Text>
                    </View>
                    <Text style={styles.resultHint}>
                      يمكنك المتابعة وإدخال بيانات الدواء يدوياً
                    </Text>
                    <TouchableOpacity style={styles.continueBtn} onPress={handleManualConfirm}>
                      <Text style={styles.continueBtnText}>المتابعة بالإدخال اليدوي</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            <View style={styles.webTipBox}>
              <Ionicons name="phone-portrait-outline" size={18} color={Colors.primary} />
              <Text style={styles.webTipText}>
                لاستخدام الكاميرا ومسح الباركود مباشرةً، افتح التطبيق على هاتفك
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {!permission ? (
          <View style={styles.permCenter}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : !permission.granted ? (
          <View style={styles.permCenter}>
            <Ionicons name="camera-outline" size={64} color={Colors.primary} />
            <Text style={styles.permTitle}>صلاحية الكاميرا</Text>
            <Text style={styles.permSub}>يحتاج التطبيق صلاحية الكاميرا لمسح الباركود</Text>
            {permission.canAskAgain ? (
              <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                <Text style={styles.permBtnText}>السماح بالوصول</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.permDenied}>يرجى تفعيل الصلاحية من إعدادات الجهاز</Text>
            )}
            <TouchableOpacity style={styles.permCancelBtn} onPress={onClose}>
              <Text style={styles.permCancelText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: [
                  "ean13", "ean8", "upc_a", "upc_e",
                  "code128", "code39", "code93",
                  "qr", "datamatrix", "pdf417",
                ],
              }}
              onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
            />

            <View style={[styles.overlay, { paddingTop: insets.top }]}>
              <TouchableOpacity
                style={[styles.closeBtn, { top: insets.top + 16 }]}
                onPress={onClose}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>

              <View style={styles.headerArea}>
                <Text style={styles.headerText}>مسح باركود الدواء</Text>
                <Text style={styles.headerSub}>وجّه الكاميرا نحو الباركود على العبوة</Text>
              </View>

              <View style={styles.frameArea}>
                <View style={styles.darkTop} />
                <View style={styles.frameRow}>
                  <View style={styles.darkSide} />
                  <View style={styles.frame}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                    {!loading && (
                      <Animated.View
                        style={[
                          styles.scanLine,
                          {
                            transform: [{
                              translateY: lineAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 200],
                              }),
                            }],
                          },
                        ]}
                      />
                    )}
                    {loading && (
                      <View style={styles.loadingOverlay}>
                        <ActivityIndicator color="#fff" size="large" />
                        <Text style={styles.loadingText}>جاري البحث عن الدواء...</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.darkSide} />
                </View>
                <View style={styles.darkBottom} />
              </View>

              <View style={styles.bottomArea}>
                {lastBarcode && !loading && (
                  <View style={styles.barcodeFoundTag}>
                    <Ionicons name="barcode-outline" size={16} color={Colors.primary} />
                    <Text style={styles.barcodeFoundText}>{lastBarcode}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.rescanBtn}
                  onPress={() => { setScanning(true); setLastBarcode(null); startLineAnimation(); }}
                >
                  <Ionicons name="refresh" size={18} color="#fff" />
                  <Text style={styles.rescanText}>مسح مجدداً</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const FRAME_SIZE = 240;
const CORNER_SIZE = 24;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permCenter: {
    flex: 1, backgroundColor: Colors.surface,
    alignItems: "center", justifyContent: "center",
    padding: 32, gap: 16,
  },
  permTitle: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary },
  permSub: { fontSize: 14, color: Colors.textMuted, textAlign: "center", lineHeight: 22 },
  permBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  permBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  permDenied: { fontSize: 13, color: Colors.error, textAlign: "center" },
  permCancelBtn: { marginTop: 4 },
  permCancelText: { fontSize: 14, color: Colors.textMuted },
  overlay: { ...StyleSheet.absoluteFillObject, flex: 1 },
  closeBtn: {
    position: "absolute", left: 20, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
  },
  headerArea: {
    paddingTop: 60, paddingBottom: 32, alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 6 },
  frameArea: { flex: 1 },
  darkTop: { backgroundColor: "rgba(0,0,0,0.5)", height: 0 },
  frameRow: { flexDirection: "row" },
  darkSide: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  darkBottom: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  frame: { width: FRAME_SIZE, height: FRAME_SIZE, overflow: "hidden" },
  corner: {
    position: "absolute", width: CORNER_SIZE, height: CORNER_SIZE,
    borderColor: Colors.primary, zIndex: 2,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderBottomRightRadius: 8 },
  scanLine: {
    position: "absolute", left: 8, right: 8, height: 2,
    backgroundColor: Colors.primary, borderRadius: 1,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  loadingText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  bottomArea: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 28, paddingHorizontal: 24,
    alignItems: "center", gap: 16,
  },
  barcodeFoundTag: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.primary,
  },
  barcodeFoundText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  rescanBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  rescanText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  webContainer: { flex: 1, backgroundColor: Colors.surface },
  webHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  webTitle: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary },
  webCloseBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center", justifyContent: "center",
  },
  webBody: { flex: 1, padding: 24, gap: 20 },
  barcodeIconWrap: {
    alignSelf: "center", backgroundColor: Colors.primaryLight,
    borderRadius: 24, padding: 24,
  },
  webDesc: {
    fontSize: 15, color: Colors.textSecondary, textAlign: "center", lineHeight: 24,
  },
  webInputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surfaceAlt, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  webInput: {
    flex: 1, fontSize: 16, color: Colors.textPrimary,
    paddingVertical: 12, letterSpacing: 2,
  },
  lookupBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
  },

  resultCard: {
    backgroundColor: Colors.background, borderRadius: 16,
    padding: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  resultFoundRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "flex-end" },
  resultFoundText: { fontSize: 14, fontWeight: "700", color: Colors.success },
  resultNotFoundRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "flex-end" },
  resultNotFoundText: { fontSize: 14, fontWeight: "700", color: Colors.textMuted },
  resultHint: { fontSize: 12, color: Colors.textMuted, textAlign: "right" },
  sourceBadge: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  sourceBadgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  resultName: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  resultBrand: { fontSize: 14, color: Colors.textSecondary, textAlign: "right" },
  resultCategory: { fontSize: 13, color: Colors.textMuted, textAlign: "right" },
  confirmBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 12, marginTop: 8,
  },
  confirmBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  continueBtn: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    paddingVertical: 10, alignItems: "center",
  },
  continueBtnText: { color: Colors.textSecondary, fontSize: 14, fontWeight: "600" },

  webTipBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: Colors.primaryLight, borderRadius: 12,
    padding: 14, marginTop: "auto",
  },
  webTipText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 20 },
});

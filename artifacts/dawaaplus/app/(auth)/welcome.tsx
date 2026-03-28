import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const { height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.heroSection, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 40) }]}>
        <View style={styles.logoCircle}>
          <Ionicons name="medkit" size={56} color="#fff" />
        </View>
        <Text style={styles.appName}>دواء+</Text>
        <Text style={styles.tagline}>متجر الأدوية الإلكتروني الأول{"\n"}في المملكة العربية السعودية</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>+2,400</Text>
            <Text style={styles.statLabel}>صيدلية</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>+50,000</Text>
            <Text style={styles.statLabel}>منتج</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>+100k</Text>
            <Text style={styles.statLabel}>عميل</Text>
          </View>
        </View>
      </View>

      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}>
        <View style={styles.features}>
          <FeatureRow icon="location-outline" text="توصيل سريع لباب منزلك" />
          <FeatureRow icon="shield-checkmark-outline" text="أدوية أصلية 100% مضمونة" />
          <FeatureRow icon="document-text-outline" text="دعم الوصفات الطبية الإلكترونية" />
        </View>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.registerBtnText}>إنشاء حساب عميل</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pharmacyLink}
          onPress={() => router.push("/(auth)/pharmacy-register")}
        >
          <Ionicons name="storefront-outline" size={16} color={Colors.primary} />
          <Text style={styles.pharmacyLinkText}>سجّل صيدليتك وابدأ البيع</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FeatureRow({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureText}>{text}</Text>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  bottomSection: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 28,
    paddingHorizontal: 24,
  },
  features: { gap: 12, marginBottom: 28 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  loginBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  registerBtn: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  registerBtnText: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  pharmacyLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  pharmacyLinkText: { fontSize: 14, color: Colors.primary, fontWeight: "600" },
});

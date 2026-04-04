import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  Modal, TextInput, ActivityIndicator, ScrollView, Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "@/i18n";
import { LANGUAGES } from "@/data/locales";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_PHONE = "+9647700000001";
const SECRET_TAPS = 7;

// ── Inline flag renderers ────────────────────────────────────────────────
function IraqFlag({ size = 22 }: { size?: number }) {
  const w = Math.round(size * 1.5);
  const s = Math.round(size / 3);
  return (
    <View style={{ width: w, height: size, borderRadius: 3, overflow: "hidden" }}>
      <View style={{ height: s, backgroundColor: "#CE1126" }} />
      <View style={{ height: s, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: s * 0.85, lineHeight: s }}>🌿</Text>
      </View>
      <View style={{ height: s, backgroundColor: "#000000" }} />
    </View>
  );
}

function KurdistanFlag({ size = 22 }: { size?: number }) {
  const w = Math.round(size * 1.5);
  const s = Math.round(size / 3);
  const sun = Math.round(size * 0.55);
  return (
    <View style={{ width: w, height: size, borderRadius: 3, overflow: "hidden" }}>
      <View style={{ height: s, backgroundColor: "#EF2B2D" }} />
      <View style={{ height: s, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: sun, height: sun, borderRadius: sun / 2, backgroundColor: "#F7C847", position: "absolute" }} />
      </View>
      <View style={{ height: s, backgroundColor: "#007A3D" }} />
    </View>
  );
}

function UKFlag({ size = 22 }: { size?: number }) {
  return <Text style={{ fontSize: size * 0.9, lineHeight: size + 2 }}>🇬🇧</Text>;
}

const MAIN_LANGS = [
  { code: "ar", label: "العربية", Flag: IraqFlag },
  { code: "ku", label: "کوردی",   Flag: KurdistanFlag },
  { code: "en", label: "English",  Flag: UKFlag },
] as const;

// ═══════════════════════════════════════════════════════════════════════
// WEB LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════
function WebLandingPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(0);

  const features = [
    { icon: "🏥", title: "أكثر من 2,400 صيدلية", desc: "شبكة واسعة من الصيدليات المرخّصة في كردستان والعراق" },
    { icon: "⚡", title: "توصيل سريع", desc: "استلم دواءك في أسرع وقت ممكن عبر شركاء التوصيل" },
    { icon: "🔒", title: "أدوية موثوقة 100%", desc: "جميع المنتجات مرخّصة ومعتمدة من وزارة الصحة" },
    { icon: "📋", title: "وصفة طبية رقمية", desc: "أرفق وصفتك الطبية وسنتعامل معها باحترافية تامة" },
    { icon: "💊", title: "+50,000 منتج", desc: "مخزون ضخم من الأدوية والمستلزمات الطبية" },
    { icon: "🌙", title: "خدمة 24/7", desc: "متاح على مدار الساعة طوال أيام الأسبوع" },
  ];

  const portals = [
    { icon: "💊", color: "#1A9E6E", bg: "linear-gradient(135deg,#1A9E6E,#0D7A54)", title: "بوابة الصيدليات", desc: "إدارة المنتجات والطلبات والاشتراكات", url: "/dawaaplus-pharmacies/" },
    { icon: "🏭", color: "#0D7A54", bg: "linear-gradient(135deg,#0D7A54,#065A3A)", title: "بوابة المذاخر", desc: "إدارة المخزون وتوريد المنتجات", url: "/dawaaplus-warehouses/" },
    { icon: "🚛", color: "#D69E2E", bg: "linear-gradient(135deg,#D69E2E,#B7791F)", title: "بوابة التوصيل", desc: "إدارة شركات التوصيل والرحلات", url: "/dawaaplus-delivery/" },
    { icon: "🛡️", color: "#7C3AED", bg: "linear-gradient(135deg,#7C3AED,#553C9A)", title: "بوابة الإدارة", desc: "المنظومة المتكاملة لإدارة المنصة", url: "/dawaaplus-web/" },
  ];

  const stores = [
    { name: "App Store", sub: "تنزيل على", icon: "", platform: "iOS", color: "#000000", url: "https://apps.apple.com" },
    { name: "Google Play", sub: "احصل عليه من", icon: "", platform: "Android", color: "#01875F", url: "https://play.google.com" },
    { name: "AppGallery", sub: "استكشفه على", icon: "🌐", platform: "Huawei", color: "#CF0A2C", url: "https://appgallery.huawei.com" },
    { name: "تنزيل APK", sub: "مباشرةً من", icon: "📦", platform: "Android APK", color: "#3182CE", url: "#" },
  ];

  const screenshots = [
    { title: "الرئيسية", bg: "#EBF8FF", icon: "🏠", desc: "تصفح الأدوية والعروض" },
    { title: "البحث", bg: "#F0FFF4", icon: "🔍", desc: "ابحث بالاسم أو التصنيف" },
    { title: "سلة الشراء", bg: "#FFFBEB", icon: "🛒", desc: "راجع طلباتك بسهولة" },
    { title: "التوصيل", bg: "#FAF5FF", icon: "📍", desc: "تتبّع طلبك لحظةً بلحظة" },
  ];

  if (Platform.OS !== "web") return null;

  return (
    <div dir="rtl" style={{
      fontFamily: "'Segoe UI', Tahoma, 'Arabic UI Display', Arial, sans-serif",
      minHeight: "100vh",
      backgroundColor: "#FAFAFA",
      overflowX: "hidden",
    }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(26,158,110,0.15)",
        padding: "0 40px", height: 70,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 30px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: "linear-gradient(135deg,#1A9E6E,#0D7A54)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 4px 12px rgba(26,158,110,0.35)",
          }}>💊</div>
          <span style={{ fontSize: 24, fontWeight: 900, color: "#1A9E6E" }}>دواء<span style={{ color: "#0D7A54" }}>+</span></span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/dawaaplus-pharmacies/" style={{
            padding: "8px 16px", borderRadius: 10, textDecoration: "none",
            fontSize: 13, fontWeight: 700, color: "#1A9E6E",
            border: "1.5px solid #1A9E6E", background: "transparent",
          }}>بوابة الصيدليات</a>
          <a href="/dawaaplus-web/" style={{
            padding: "8px 18px", borderRadius: 10, textDecoration: "none",
            fontSize: 13, fontWeight: 700, color: "#fff",
            background: "linear-gradient(135deg,#1A9E6E,#0D7A54)",
            boxShadow: "0 4px 12px rgba(26,158,110,0.3)",
          }}>لوحة الإدارة</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0D7A54 0%, #1A9E6E 40%, #22C55E 80%, #86EFAC 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "120px 24px 80px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background decorations */}
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 500, height: 500, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(255,255,255,0.04)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "30%", left: "10%",
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)", pointerEvents: "none",
        }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
          borderRadius: 30, padding: "8px 20px",
          border: "1px solid rgba(255,255,255,0.3)",
          marginBottom: 32, fontSize: 14, color: "#fff", fontWeight: 600,
        }}>
          <span>🌟</span>
          <span>منصة الأدوية الرائدة في كردستان والعراق</span>
        </div>

        {/* Logo circle */}
        <div style={{
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          border: "3px solid rgba(255,255,255,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 56, marginBottom: 28,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 8px rgba(255,255,255,0.1)",
        }}>💊</div>

        <h1 style={{
          fontSize: "clamp(56px, 8vw, 96px)",
          fontWeight: 900, color: "#fff",
          margin: "0 0 12px", letterSpacing: -2,
          textShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}>دواء<span style={{ color: "#FFF9C4" }}>+</span></h1>

        <p style={{
          fontSize: "clamp(16px, 2.5vw, 22px)",
          color: "rgba(255,255,255,0.9)", maxWidth: 560,
          margin: "0 auto 16px", lineHeight: 1.7, fontWeight: 400,
        }}>
          منصتك المتكاملة للأدوية والمستلزمات الطبية<br/>
          <strong style={{ color: "#FFF9C4" }}>اطلب · تتبّع · استلم</strong> بكل سهولة وأمان
        </p>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 0,
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
          borderRadius: 20, border: "1px solid rgba(255,255,255,0.25)",
          margin: "32px auto 40px", overflow: "hidden",
        }}>
          {[
            { num: "+2,400", label: "صيدلية" },
            { num: "+50,000", label: "منتج" },
            { num: "+100K", label: "مستخدم" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "20px 40px", textAlign: "center",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.2)" : "none",
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{s.num}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Download buttons */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="https://apps.apple.com" target="_blank" rel="noreferrer" style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "#000", color: "#fff",
            padding: "14px 28px", borderRadius: 16, textDecoration: "none",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <span style={{ fontSize: 32 }}></span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, opacity: 0.8 }}>تنزيل على</div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>App Store</div>
            </div>
          </a>
          <a href="https://play.google.com" target="_blank" rel="noreferrer" style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "#fff", color: "#1A1A1A",
            padding: "14px 28px", borderRadius: 16, textDecoration: "none",
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          }}>
            <span style={{ fontSize: 32 }}></span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, opacity: 0.6 }}>احصل عليه من</div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>Google Play</div>
            </div>
          </a>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 32,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          color: "rgba(255,255,255,0.6)", fontSize: 12,
        }}>
          <span>اكتشف المزيد</span>
          <div style={{ fontSize: 20, animation: "bounce 2s infinite" }}>↓</div>
        </div>
      </section>

      {/* ── PHONE MOCKUP + DOWNLOAD SECTION ── */}
      <section style={{
        padding: "100px 24px",
        background: "#fff",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{
            display: "inline-block",
            background: "linear-gradient(135deg,#EBF8FF,#D1FAE5)",
            color: "#0D7A54", padding: "6px 18px", borderRadius: 30,
            fontSize: 13, fontWeight: 700, marginBottom: 16,
          }}>📱 حمّل التطبيق الآن</span>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, margin: "0 0 12px", color: "#1A1A2E" }}>
            متاح على جميع المنصات
          </h2>
          <p style={{ fontSize: 16, color: "#718096", maxWidth: 500, margin: "0 auto" }}>
            حمّل تطبيق دواء+ على هاتفك وابدأ رحلتك الصحية اليوم
          </p>
        </div>

        {/* Phone mockups row */}
        <div style={{
          display: "flex", gap: 24, justifyContent: "center",
          flexWrap: "wrap", marginBottom: 72,
        }}>
          {screenshots.map((s, i) => (
            <div key={i} style={{
              width: 200, borderRadius: 36,
              background: s.bg,
              border: "3px solid #fff",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
              padding: "32px 16px",
              textAlign: "center",
              transform: i % 2 === 0 ? "translateY(-16px)" : "translateY(16px)",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: "#1A1A2E" }}>{s.title}</div>
              <div style={{ fontSize: 12, color: "#718096", lineHeight: 1.5 }}>{s.desc}</div>
              <div style={{
                marginTop: 16, height: 100, borderRadius: 12,
                background: "rgba(0,0,0,0.04)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(0,0,0,0.2)", fontSize: 11,
              }}>واجهة التطبيق</div>
            </div>
          ))}
        </div>

        {/* All download options */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20, maxWidth: 1000, width: "100%",
        }}>
          {[
            {
              name: "App Store",
              sub: "iPhone & iPad",
              emoji: "",
              bg: "linear-gradient(135deg,#1C1C1E,#3A3A3C)",
              badge: "iOS",
              badgeColor: "#007AFF",
              url: "https://apps.apple.com",
              desc: "يتطلب iOS 14 أو أحدث",
            },
            {
              name: "Google Play",
              sub: "Android",
              emoji: "",
              bg: "linear-gradient(135deg,#01875F,#34A853)",
              badge: "Android",
              badgeColor: "#34A853",
              url: "https://play.google.com",
              desc: "يتطلب Android 8.0 أو أحدث",
            },
            {
              name: "AppGallery",
              sub: "Huawei",
              emoji: "🌐",
              bg: "linear-gradient(135deg,#CF0A2C,#E8192C)",
              badge: "Huawei",
              badgeColor: "#CF0A2C",
              url: "https://appgallery.huawei.com",
              desc: "لأجهزة Huawei وHonor",
            },
            {
              name: "تنزيل APK",
              sub: "مباشر بدون متجر",
              emoji: "📦",
              bg: "linear-gradient(135deg,#2B6CB0,#3182CE)",
              badge: "APK",
              badgeColor: "#3182CE",
              url: "#",
              desc: "للأجهزة غير المدعومة",
            },
          ].map((store, i) => (
            <a key={i} href={store.url} target="_blank" rel="noreferrer" style={{
              textDecoration: "none",
              display: "block",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 50px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
              }}
            >
              <div style={{
                background: store.bg,
                padding: "28px 24px",
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <span style={{ fontSize: 40 }}>{store.emoji}</span>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginBottom: 2 }}>{store.sub}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{store.name}</div>
                </div>
                <div style={{ marginRight: "auto", fontSize: 24, color: "rgba(255,255,255,0.5)" }}>←</div>
              </div>
              <div style={{ background: "#fff", padding: "14px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    background: store.badgeColor + "15", color: store.badgeColor,
                    borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700,
                  }}>{store.badge}</span>
                  <span style={{ fontSize: 12, color: "#718096" }}>{store.desc}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section style={{
        padding: "100px 24px",
        background: "linear-gradient(180deg, #F8FAFF 0%, #EFF6FF 100%)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{
              display: "inline-block",
              background: "linear-gradient(135deg,#EDE9FE,#DDD6FE)",
              color: "#7C3AED", padding: "6px 18px", borderRadius: 30,
              fontSize: 13, fontWeight: 700, marginBottom: 16,
            }}>✨ مميزات المنصة</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, margin: "0 0 12px", color: "#1A1A2E" }}>
              لماذا دواء+؟
            </h2>
            <p style={{ fontSize: 16, color: "#718096", maxWidth: 480, margin: "0 auto" }}>
              نقدّم لك تجربة صحية متكاملة بأعلى معايير الجودة والأمان
            </p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: "#fff",
                borderRadius: 24,
                padding: 32,
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.04)",
                display: "flex", gap: 20, alignItems: "flex-start",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                  background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28,
                }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: "#1A1A2E" }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: "#718096", lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTALS SECTION ── */}
      <section style={{ padding: "100px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{
              display: "inline-block",
              background: "linear-gradient(135deg,#FEF9C3,#FDE68A)",
              color: "#B45309", padding: "6px 18px", borderRadius: 30,
              fontSize: 13, fontWeight: 700, marginBottom: 16,
            }}>🏢 البوابات المتخصصة</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, margin: "0 0 12px", color: "#1A1A2E" }}>
              منصة متكاملة للجميع
            </h2>
            <p style={{ fontSize: 16, color: "#718096", maxWidth: 500, margin: "0 auto" }}>
              حلول مخصصة لكل طرف في منظومة الرعاية الصحية
            </p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 20,
          }}>
            {portals.map((p, i) => (
              <a key={i} href={p.url} style={{ textDecoration: "none" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 24px 60px rgba(0,0,0,0.18)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.10)";
                }}
              >
                <div style={{
                  borderRadius: 24, overflow: "hidden",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
                  transition: "transform 0.25s, box-shadow 0.25s",
                }}>
                  <div style={{
                    background: p.bg,
                    padding: "36px 24px 32px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 52, marginBottom: 16 }}>{p.icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 8 }}>{p.title}</div>
                  </div>
                  <div style={{ background: "#fff", padding: "20px 24px" }}>
                    <div style={{ fontSize: 13, color: "#718096", lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      color: p.color, fontWeight: 700, fontSize: 13,
                    }}>
                      <span>الدخول إلى البوابة</span>
                      <span style={{ fontSize: 16 }}>←</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{
        padding: "100px 24px",
        background: "linear-gradient(135deg, #0D7A54 0%, #1A9E6E 50%, #22C55E 100%)",
        textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>📱</div>
          <h2 style={{
            fontSize: "clamp(28px,4vw,52px)", fontWeight: 900,
            color: "#fff", margin: "0 0 16px",
          }}>ابدأ رحلتك الصحية الآن</h2>
          <p style={{
            fontSize: 18, color: "rgba(255,255,255,0.85)",
            maxWidth: 500, margin: "0 auto 48px", lineHeight: 1.7,
          }}>
            انضم إلى أكثر من 100,000 مستخدم يثقون بدواء+ لحياة صحية أفضل
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://apps.apple.com" target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "#000", color: "#fff",
              padding: "16px 36px", borderRadius: 18, textDecoration: "none",
              fontSize: 16, fontWeight: 800,
              boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
              border: "1.5px solid rgba(255,255,255,0.2)",
            }}>
              <span style={{ fontSize: 36 }}></span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, opacity: 0.7 }}>تنزيل على</div>
                <div>App Store</div>
              </div>
            </a>
            <a href="https://play.google.com" target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "#fff", color: "#1A1A1A",
              padding: "16px 36px", borderRadius: 18, textDecoration: "none",
              fontSize: 16, fontWeight: 800,
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            }}>
              <span style={{ fontSize: 36 }}></span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, opacity: 0.6 }}>احصل عليه من</div>
                <div>Google Play</div>
              </div>
            </a>
            <a href="https://appgallery.huawei.com" target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "rgba(255,255,255,0.15)", color: "#fff",
              padding: "16px 36px", borderRadius: 18, textDecoration: "none",
              fontSize: 16, fontWeight: 800,
              border: "1.5px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(10px)",
            }}>
              <span style={{ fontSize: 36 }}>🌐</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, opacity: 0.7 }}>استكشفه على</div>
                <div>AppGallery</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "#0A0F1E",
        padding: "60px 24px 32px",
        color: "rgba(255,255,255,0.6)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 48, marginBottom: 48,
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>💊</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>دواء+</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>
                منصة الأدوية المتكاملة الرائدة في كردستان والعراق. نربط الزبائن بالصيدليات والمذاخر بكل سهولة.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>البوابات</div>
              {portals.map((p, i) => (
                <a key={i} href={p.url} style={{
                  display: "block", color: "rgba(255,255,255,0.5)",
                  textDecoration: "none", fontSize: 13, marginBottom: 10,
                  transition: "color 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"}
                >{p.title}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>التطبيق</div>
              {[
                { label: "App Store (iOS)", url: "https://apps.apple.com" },
                { label: "Google Play (Android)", url: "https://play.google.com" },
                { label: "AppGallery (Huawei)", url: "https://appgallery.huawei.com" },
                { label: "تنزيل APK مباشر", url: "#" },
              ].map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noreferrer" style={{
                  display: "block", color: "rgba(255,255,255,0.5)",
                  textDecoration: "none", fontSize: 13, marginBottom: 10,
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#22C55E"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"}
                >{l.label}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>تواصل معنا</div>
              <div style={{ fontSize: 13, marginBottom: 10 }}>📧 info@dawaplus.iq</div>
              <div style={{ fontSize: 13, marginBottom: 10 }}>📞 07501234567</div>
              <div style={{ fontSize: 13, marginBottom: 10 }}>🏢 أربيل، كردستان — العراق</div>
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                {["📘", "📸", "📺", "💬"].map((s, i) => (
                  <div key={i} style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, cursor: "pointer",
                  }}>{s}</div>
                ))}
              </div>
            </div>
          </div>
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 24, textAlign: "center", fontSize: 13,
            color: "rgba(255,255,255,0.3)",
          }}>
            © 2025 دواء+ · جميع الحقوق محفوظة · صُنع بـ ❤️ في كردستان
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        a { transition: all 0.2s; }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MOBILE WELCOME SCREEN
// ═══════════════════════════════════════════════════════════════════════
export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useSettings();
  const { t } = useTranslation();
  const { loginDemo } = useAuth();
  const [showLangModal, setShowLangModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 24);

  // On web: show the landing page instead
  if (Platform.OS === "web") {
    return <WebLandingPage />;
  }

  const handleLogoTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= SECRET_TAPS) {
      tapCount.current = 0;
      setAdminPassword(""); setAdminError("");
      setShowAdminModal(true);
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminPassword) { setAdminError("يرجى إدخال كلمة المرور"); return; }
    setAdminLoading(true);
    await new Promise(r => setTimeout(r, 600));
    loginDemo("admin");
    setAdminLoading(false);
    setShowAdminModal(false);
  };

  return (
    <View style={styles.root}>
      {/* ══ FIXED LANGUAGE BAR ══ */}
      <View style={[styles.langBar, { paddingTop: topPad + 10 }]}>
        {MAIN_LANGS.map(({ code, label, Flag }) => {
          const active = language.code === code;
          const lang = LANGUAGES.find(l => l.code === code)!;
          return (
            <TouchableOpacity
              key={code}
              style={[styles.langPill, active && styles.langPillActive]}
              onPress={() => setLanguage(lang)}
              activeOpacity={0.75}
            >
              <Flag size={18} />
              <Text style={[styles.langPillText, active && styles.langPillTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.langMoreBtn} onPress={() => setShowLangModal(true)}>
          <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      {/* ══ HERO (scrollable) ══ */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 64 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Logo */}
        <View style={styles.hero}>
          <TouchableOpacity style={styles.logoCircle} onPress={handleLogoTap} activeOpacity={0.9}>
            <Ionicons name="medkit" size={52} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.appName}>{t("appName")}</Text>
          <Text style={styles.tagline}>{t("appTagline")}</Text>

          <View style={styles.statsRow}>
            <StatItem number="+2,400" label={t("pharmacies")} />
            <View style={styles.statDiv} />
            <StatItem number="+50,000" label={t("products")} />
            <View style={styles.statDiv} />
            <StatItem number="+100k" label={t("customers")} />
          </View>
        </View>

        {/* ══ BOTTOM CARD ══ */}
        <View style={[styles.card, { paddingBottom: botPad }]}>
          {/* Features */}
          <View style={styles.features}>
            <FeatureRow icon="location-outline"       text={t("fastDelivery")} />
            <FeatureRow icon="shield-checkmark-outline" text={t("authenticMeds")} />
            <FeatureRow icon="document-text-outline"  text={t("prescriptionSupport")} />
          </View>

          {/* Main CTA — Login */}
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginBtnText}>{t("login")}</Text>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Register Customer */}
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.registerBtnText}>{t("register")}</Text>
          </TouchableOpacity>

          {/* Browse without registration */}
          <TouchableOpacity style={styles.guestBtn} onPress={() => router.replace("/(customer)")}>
            <Ionicons name="eye-outline" size={15} color={Colors.textMuted} />
            <Text style={styles.guestBtnText}>تصفح بدون تسجيل</Text>
          </TouchableOpacity>

          {/* Business / Partner links */}
          <View style={styles.dividerRow}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>للشركاء والمزودين</Text>
            <View style={styles.divLine} />
          </View>

          <View style={styles.linksGrid}>
            <LinkCard
              icon="storefront-outline"
              color={Colors.primary}
              label={t("registerPharmacy")}
              onPress={() => router.push("/(auth)/pharmacy-register")}
            />
            <LinkCard
              icon="cube-outline"
              color="#0D7A54"
              label={t("registerWarehouse")}
              onPress={() => router.push("/(auth)/warehouse-register")}
            />
            <LinkCard
              icon="bicycle-outline"
              color="#D69E2E"
              label="تسجيل شركة توصيل"
              onPress={() => router.push("/(auth)/delivery-register" as any)}
            />
          </View>
        </View>
      </ScrollView>

      {/* ══ MORE LANGUAGES MODAL ══ */}
      <Modal visible={showLangModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("chooseLanguage")}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langOption, language.code === lang.code && styles.langOptionActive]}
                  onPress={() => { setLanguage(lang); setShowLangModal(false); }}
                >
                  {language.code === lang.code && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                  <View style={styles.langOptionInfo}>
                    <Text style={styles.langOptionName}>{lang.nativeName}</Text>
                    <Text style={styles.langOptionSub}>{lang.name}</Text>
                  </View>
                  <Text style={{ fontSize: 26 }}>{lang.flag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowLangModal(false)}>
              <Text style={styles.modalCloseText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══ HIDDEN ADMIN MODAL ══ */}
      <Modal visible={showAdminModal} transparent animationType="fade" onRequestClose={() => setShowAdminModal(false)}>
        <View style={styles.adminOverlay}>
          <View style={styles.adminBox}>
            <View style={styles.adminHeader}>
              <TouchableOpacity onPress={() => setShowAdminModal(false)}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.adminLogo}>
                <Ionicons name="shield" size={20} color="#7C3AED" />
              </View>
              <Text style={styles.adminTitle}>دخول المدير</Text>
            </View>
            <View style={styles.adminInputRow}>
              <TextInput
                style={styles.adminInput}
                placeholder="كلمة المرور"
                value={adminPassword}
                onChangeText={v => { setAdminPassword(v); setAdminError(""); }}
                secureTextEntry
                textAlign="right"
                placeholderTextColor={Colors.textMuted}
              />
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
            </View>
            {adminError ? <Text style={styles.adminError}>{adminError}</Text> : null}
            <TouchableOpacity
              style={[styles.adminBtn, { backgroundColor: "#7C3AED" }]}
              onPress={handleAdminLogin}
              disabled={adminLoading}
            >
              {adminLoading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="shield-checkmark" size={18} color="#fff" />
                  <Text style={styles.adminBtnText}>دخول</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FeatureRow({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureText}>{text}</Text>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={17} color={Colors.primary} />
      </View>
    </View>
  );
}

function LinkCard({ icon, color, label, onPress }: { icon: any; color: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.linkCard} onPress={onPress}>
      <View style={[styles.linkCardIcon, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.linkCardText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primary },

  langBar: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingHorizontal: 20, paddingBottom: 10,
  },
  langPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 22,
    paddingHorizontal: 11, paddingVertical: 6,
    borderWidth: 1.5, borderColor: "transparent",
  },
  langPillActive: {
    backgroundColor: "#fff", borderColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  langPillText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.9)" },
  langPillTextActive: { color: Colors.primary, fontWeight: "800" },
  langMoreBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },

  scroll: { flexGrow: 1 },
  hero: {
    alignItems: "center", paddingHorizontal: 24,
    paddingBottom: 28, paddingTop: 16,
  },
  logoCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  appName: { fontSize: 42, fontWeight: "800", color: "#fff", letterSpacing: -1, marginBottom: 6 },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 20, marginBottom: 18 },
  statsRow: {
    flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, gap: 10, alignSelf: "stretch",
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 16, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2, textAlign: "center" },
  statDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },

  card: {
    backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingTop: 24, paddingHorizontal: 22,
  },
  features: { gap: 9, marginBottom: 18 },
  featureRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 },
  featureIcon: {
    width: 32, height: 32, borderRadius: 9, backgroundColor: Colors.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  featureText: { flex: 1, fontSize: 13, color: Colors.textSecondary, textAlign: "right" },

  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10,
  },
  loginBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  registerBtn: {
    borderWidth: 2, borderColor: Colors.primary, borderRadius: 14,
    paddingVertical: 12, alignItems: "center", marginBottom: 10,
  },
  registerBtnText: { fontSize: 15, fontWeight: "700", color: Colors.primary },

  guestBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 8, marginBottom: 16,
  },
  guestBtnText: { fontSize: 13, color: Colors.textMuted, fontWeight: "600" },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 11, color: Colors.textMuted, fontWeight: "600" },

  linksGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
  linkCard: {
    flex: 1, alignItems: "center", gap: 6,
    backgroundColor: Colors.surfaceAlt, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  linkCardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  linkCardText: { fontSize: 11, fontWeight: "700", textAlign: "center" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary, textAlign: "center", marginBottom: 8 },
  langOption: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 12,
    borderRadius: 12, backgroundColor: Colors.surfaceAlt, marginBottom: 6,
  },
  langOptionActive: { backgroundColor: Colors.primaryLight, borderWidth: 1.5, borderColor: Colors.primary },
  langOptionInfo: { flex: 1 },
  langOptionName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  langOptionSub: { fontSize: 11, color: Colors.textMuted, textAlign: "right" },
  modalClose: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12, paddingVertical: 13,
    alignItems: "center", marginTop: 6,
  },
  modalCloseText: { fontSize: 15, fontWeight: "700", color: Colors.textMuted },

  adminOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center", padding: 24 },
  adminBox: {
    backgroundColor: "#fff", borderRadius: 24, padding: 24,
    width: "100%", maxWidth: 360, gap: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 10,
  },
  adminHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  adminLogo: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#7C3AED15", alignItems: "center", justifyContent: "center" },
  adminTitle: { flex: 1, fontSize: 16, fontWeight: "800", color: Colors.textPrimary, textAlign: "right" },
  adminInputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14,
  },
  adminInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: Colors.textPrimary },
  adminError: { fontSize: 12, color: Colors.error, textAlign: "right" },
  adminBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  adminBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

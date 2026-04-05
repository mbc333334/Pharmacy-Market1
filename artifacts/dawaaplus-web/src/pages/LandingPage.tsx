import React, { useState, useEffect } from "react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const C = {
  primary: "#7C3AED",
  pharmacy: "#1A9E6E",
  warehouse: "#0D7A54",
  delivery: "#D69E2E",
  customer: "#3B82F6",
  text: "#1a202c",
  muted: "#64748b",
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
};

const DOMAIN = window.location.origin;

const PORTALS = [
  {
    icon: "🏪",
    title: "بوابة الصيدليات",
    desc: "إدارة المنتجات والطلبات والاشتراكات",
    color: C.pharmacy,
    bg: "#F0FDF4",
    href: `${DOMAIN}/dawaaplus-pharmacies/`,
  },
  {
    icon: "🏭",
    title: "بوابة المذاخر",
    desc: "إدارة المخزون والتوزيع للصيدليات",
    color: C.warehouse,
    bg: "#F0FDF4",
    href: `${DOMAIN}/dawaaplus-warehouses/`,
  },
  {
    icon: "🚚",
    title: "بوابة شركات التوصيل",
    desc: "إدارة السائقين والرحلات والتوصيل",
    color: C.delivery,
    bg: "#FFFBEB",
    href: `${DOMAIN}/dawaaplus-delivery/`,
  },
  {
    icon: "🛡️",
    title: "بوابة الإدارة",
    desc: "لوحة تحكم المنصة — للمشرفين فقط",
    color: C.primary,
    bg: "#F5F3FF",
    href: null,
    isAdmin: true,
  },
];

const FEATURES = [
  { icon: "💊", title: "أدوية في متناول يدك", desc: "اطلب أدويتك من أقرب صيدلية بضغطة واحدة" },
  { icon: "⚡", title: "توصيل سريع", desc: "شبكة من شركات التوصيل المعتمدة في كردستان والعراق" },
  { icon: "🔍", title: "بحث ذكي", desc: "ابحث عن أي دواء بالاسم التجاري أو الفعّال" },
  { icon: "🏥", title: "صيدليات معتمدة", desc: "جميع الصيدليات مرخّصة وخاضعة للرقابة الصيدلانية" },
  { icon: "🔔", title: "إشعارات فورية", desc: "تابع طلبك لحظة بلحظة حتى الاستلام" },
  { icon: "💳", title: "دفع آمن", desc: "زين كاش، فاست باي، FIB، وكاش" },
];

const STATS = [
  { value: "4+", label: "صيدليات مسجّلة" },
  { value: "4+", label: "مذاخر معتمدة" },
  { value: "4+", label: "شركات توصيل" },
  { value: "3", label: "مدن مخدومة" },
];

export default function LandingPage({ onAdminLogin }: { onAdminLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, right: 0, left: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        padding: "0 24px",
        transition: "all 0.3s",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: C.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#fff", fontWeight: 800,
          }}>د</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: scrolled ? C.primary : "#fff" }}>دواء+</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="#features" style={{ color: scrolled ? C.muted : "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 14, padding: "6px 12px" }}>المميزات</a>
          <a href="#portals" style={{ color: scrolled ? C.muted : "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 14, padding: "6px 12px" }}>البوابات</a>
          <button
            onClick={onAdminLogin}
            style={{
              background: C.primary, color: "#fff", border: "none", borderRadius: 10,
              padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >دخول الإدارة</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, #5B21B6 40%, #1E40AF 100%)`,
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", textAlign: "center", padding: "100px 24px 80px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background blobs */}
        <div style={{ position: "absolute", top: "15%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.15)", borderRadius: 100,
          padding: "6px 18px", marginBottom: 24,
          color: "#fff", fontSize: 13, fontWeight: 600, backdropFilter: "blur(8px)",
        }}>
          🇮🇶 منصة الصحة الرقمية في كردستان والعراق
        </div>

        <div style={{
          width: 96, height: 96, borderRadius: 26, background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 52, marginBottom: 24, backdropFilter: "blur(8px)",
          border: "2px solid rgba(255,255,255,0.3)",
        }}>💊</div>

        <h1 style={{ fontSize: "clamp(36px, 7vw, 64px)", fontWeight: 900, color: "#fff", margin: "0 0 16px", lineHeight: 1.15 }}>
          دواء+
        </h1>
        <p style={{ fontSize: "clamp(16px, 3vw, 22px)", color: "rgba(255,255,255,0.85)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          منصة ذكية تربط الصيدليات والمذاخر وشركات التوصيل بالمستخدمين في كردستان والعراق
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#download" style={{
            background: "#fff", color: C.primary, borderRadius: 14,
            padding: "14px 28px", textDecoration: "none", fontWeight: 800, fontSize: 15,
            display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}>
            📱 حمّل التطبيق
          </a>
          <a href="#portals" style={{
            background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 14,
            padding: "14px 28px", textDecoration: "none", fontWeight: 700, fontSize: 15,
            display: "flex", alignItems: "center", gap: 8, border: "1.5px solid rgba(255,255,255,0.35)",
            backdropFilter: "blur(8px)",
          }}>
            🔗 استعرض البوابات
          </a>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", gap: 0, marginTop: 64, background: "rgba(255,255,255,0.12)",
          borderRadius: 20, overflow: "hidden", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.2)", flexWrap: "wrap",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: "20px 32px", textAlign: "center",
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.15)" : "none",
              minWidth: 100,
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
            لماذا دواء+؟
          </div>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, margin: "0 0 16px" }}>
            كل ما تحتاجه في مكان واحد
          </h2>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 480, margin: "0 auto" }}>
            منصة متكاملة تجمع بين الصيدليات والمذاخر وشركات التوصيل
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20,
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: C.surface, borderRadius: 18, padding: "28px 24px",
              border: `1px solid ${C.border}`, display: "flex", gap: 16, alignItems: "flex-start",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: "#F5F3FF",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, flexShrink: 0,
              }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PORTALS ── */}
      <section id="portals" style={{ padding: "60px 24px 80px", background: "#F8F5FF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
              بوابات المنصة
            </div>
            <h2 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 900, margin: "0 0 14px" }}>
              منصة متعددة للجميع
            </h2>
            <p style={{ fontSize: 15, color: C.muted, maxWidth: 440, margin: "0 auto" }}>
              بوابة متخصصة لكل طرف في سلسلة الرعاية الصحية
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {PORTALS.map((p, i) => (
              <div
                key={i}
                onClick={() => p.isAdmin ? onAdminLogin() : p.href && window.open(p.href, "_blank")}
                style={{
                  background: p.bg, borderRadius: 22, padding: "32px 24px", textAlign: "center",
                  border: `2px solid ${p.color}22`, cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${p.color}25`;
                  (e.currentTarget as HTMLElement).style.border = `2px solid ${p.color}66`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.border = `2px solid ${p.color}22`;
                }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: p.color + "18", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 36, margin: "0 auto 20px",
                  border: `2px solid ${p.color}30`,
                }}>{p.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: p.color, marginBottom: 10 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>{p.desc}</div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: p.color, color: "#fff", borderRadius: 10,
                  padding: "8px 20px", fontSize: 13, fontWeight: 700,
                }}>
                  {p.isAdmin ? "دخول" : "الانتقال للبوابة"} →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD ── */}
      <section id="download" style={{
        padding: "80px 24px",
        background: `linear-gradient(135deg, #1E1B4B 0%, ${C.primary} 100%)`,
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>📱</div>
          <h2 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 900, color: "#fff", margin: "0 0 14px" }}>
            حمّل تطبيق دواء+
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 36, lineHeight: 1.7 }}>
            متوفر على آيفون وأندرويد — سهل الاستخدام ومتاح بالعربية والكردية والإنجليزية
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { store: "App Store", icon: "🍎", sub: "تحميل من" },
              { store: "Google Play", icon: "▶️", sub: "تحميل من" },
            ].map((btn, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.12)", borderRadius: 16,
                padding: "14px 28px", border: "1.5px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}>
                <span style={{ fontSize: 28 }}>{btn.icon}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>{btn.sub}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{btn.store}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 24 }}>
            قريباً على متاجر التطبيقات — يمكنك تجربة النسخة التجريبية الآن
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "#0F0A1E", padding: "48px 24px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: C.primary,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, color: "#fff", fontWeight: 800,
            }}>د</div>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>دواء+</span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24, lineHeight: 1.7 }}>
            منصة صحية رقمية متكاملة لكردستان والعراق<br />
            تربط الصيدليات والمذاخر وشركات التوصيل والمستخدمين
          </p>

          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
            {["بوابة الصيدليات", "بوابة المذاخر", "بوابة التوصيل"].map((link, i) => (
              <a key={i} href="#portals" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 13 }}>{link}</a>
            ))}
            <button onClick={onAdminLogin} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: 13 }}>
              بوابة الإدارة
            </button>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            © 2025 دواء+ — جميع الحقوق محفوظة
          </div>
        </div>
      </footer>
    </div>
  );
}

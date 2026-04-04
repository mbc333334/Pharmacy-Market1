import { useState } from "react";

// ─── Brand Colors ───────────────────────────────────────────────────────────
const C = {
  primary:   "#1A9E6E",
  pharmacy:  "#1A9E6E",
  warehouse: "#0D7A54",
  delivery:  "#D69E2E",
  admin:     "#7C3AED",
  text:      "#1a202c",
  muted:     "#718096",
  border:    "#e2e8f0",
  bg:        "#f7fafc",
  surface:   "#ffffff",
};

type Role = "pharmacy" | "warehouse" | "delivery" | "admin";

// ─── Role Config ─────────────────────────────────────────────────────────────
const ROLES: { id: Role; label: string; sub: string; color: string; icon: string }[] = [
  { id: "pharmacy",  label: "صيدلية",          sub: "إدارة الأدوية والطلبات والعروض",     color: C.pharmacy,  icon: "💊" },
  { id: "warehouse", label: "مذخر",             sub: "إدارة المخزون والطلبات والأسعار",   color: C.warehouse, icon: "🏭" },
  { id: "delivery",  label: "شركة التوصيل",    sub: "متابعة الرحلات والتقييمات",          color: C.delivery,  icon: "🚚" },
  { id: "admin",     label: "مدير المنصة",      sub: "الإشراف الكامل على منصة دواء+",     color: C.admin,     icon: "🛡️" },
];

export default function App() {
  const [role, setRole] = useState<Role | null>(null);

  if (!role) return <LandingPage onSelect={setRole} />;
  return <Dashboard role={role} onBack={() => setRole(null)} />;
}

// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════
function LandingPage({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, #0D7A54 100%)`,
        padding: "60px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>💊</div>
        <h1 style={{ color: "#fff", fontSize: 40, fontWeight: 900, margin: 0, letterSpacing: 1 }}>دواء +</h1>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, margin: "10px 0 0" }}>
          منصة الصيادلة والأدوية — إقليم كردستان والعراق
        </p>

        {/* Stats */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 32,
          marginTop: 40, flexWrap: "wrap",
        }}>
          {[
            { v: "+2,400", l: "صيدلية" },
            { v: "+50,000", l: "منتج" },
            { v: "+100k", l: "عميل" },
          ].map(s => (
            <div key={s.l} style={{ color: "#fff", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900 }}>{s.v}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Cards */}
      <div style={{ maxWidth: 800, margin: "-40px auto 0", padding: "0 20px 60px" }}>
        <div style={{
          background: C.surface, borderRadius: 20, padding: "28px 24px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
          marginBottom: 24,
        }}>
          <h2 style={{ textAlign: "center", color: C.text, fontSize: 18, fontWeight: 800, margin: "0 0 20px" }}>
            اختر نوع حسابك للمتابعة
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 14,
          }}>
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => onSelect(r.id)}
                style={{
                  background: `${r.color}0D`,
                  border: `2px solid ${r.color}30`,
                  borderRadius: 16, padding: "20px 12px",
                  cursor: "pointer", textAlign: "center",
                  transition: "all 0.18s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${r.color}18`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = r.color;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${r.color}0D`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${r.color}30`;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                <span style={{ fontSize: 32 }}>{r.icon}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: r.color }}>{r.label}</span>
                <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{r.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14,
        }}>
          {[
            { icon: "📦", t: "إدارة المخزون", s: "تتبع الأدوية والرواكد والمنتهية" },
            { icon: "🛒", t: "إدارة الطلبات", s: "تلقّ وأكّد الطلبات لحظةً بلحظة" },
            { icon: "💳", t: "وسائل دفع عراقية", s: "زين كاش · فاست باي · FIB وأكثر" },
            { icon: "🚚", t: "شركات التوصيل", s: "اختر شركة التوصيل المناسبة" },
            { icon: "📊", t: "تقارير وإحصاءات", s: "راقب أداءك ومبيعاتك بوضوح" },
            { icon: "🔔", t: "إشعارات فورية", s: "تنبيهات للطلبات والعروض الجديدة" },
          ].map(f => (
            <div key={f.t} style={{
              background: C.surface, borderRadius: 14, padding: "16px 18px",
              border: `1px solid ${C.border}`,
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 24 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{f.t}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{f.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "20px",
        borderTop: `1px solid ${C.border}`,
        color: C.muted, fontSize: 13,
      }}>
        دواء+ — منصة الصيادلة والأدوية في إقليم كردستان والعراق · جميع الحقوق محفوظة ©{new Date().getFullYear()}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
const DASHBOARDS: Record<Role, {
  name: string; color: string; icon: string;
  stats: { label: string; value: string; icon: string; change?: string }[];
  sections: { title: string; icon: string; items: string[] }[];
  actions: { label: string; icon: string }[];
}> = {
  pharmacy: {
    name: "صيدلية", color: C.pharmacy, icon: "💊",
    stats: [
      { label: "منتج نشط",      value: "247",          icon: "📦", change: "+12 هذا الشهر" },
      { label: "طلبات اليوم",   value: "18",           icon: "🛒", change: "5 جديدة" },
      { label: "مبيعات الشهر",  value: "4,200,000 د.ع", icon: "💵", change: "+8%" },
      { label: "رواكد تقترب",   value: "23",           icon: "⚠️", change: "انتبه" },
    ],
    sections: [
      { title: "أحدث الطلبات", icon: "🛒", items: [
        "طلب #1041 — باراسيتامول × 3 — قيد المعالجة",
        "طلب #1040 — أموكسيسيلين × 2 — مكتمل",
        "طلب #1039 — فيتامين C × 5 — جديد",
        "طلب #1038 — أنسولين — ملغي",
      ]},
      { title: "أدوية تنفد قريباً", icon: "⚠️", items: [
        "باراسيتامول 500mg — متبقي 12 علبة",
        "أموكسيسيلين 500mg — متبقي 8 علب",
        "ميتفورمين 850mg — متبقي 5 علب",
      ]},
    ],
    actions: [
      { label: "إضافة دواء",     icon: "➕" },
      { label: "عرض الطلبات",    icon: "📋" },
      { label: "إضافة عرض",      icon: "🏷️" },
      { label: "الرواكد",        icon: "⏳" },
      { label: "المذاخر",        icon: "🏭" },
      { label: "الإعدادات",      icon: "⚙️" },
    ],
  },
  warehouse: {
    name: "مذخر", color: C.warehouse, icon: "🏭",
    stats: [
      { label: "منتج في المخزن",  value: "1,845",       icon: "📦", change: "+40 هذا الأسبوع" },
      { label: "طلبات الصيادلة", value: "34",           icon: "💼", change: "9 جديدة" },
      { label: "إيرادات الشهر",  value: "18,700,000 د.ع", icon: "💵", change: "+15%" },
      { label: "صيدلية مرتبطة",  value: "89",           icon: "🤝", change: "نشطة" },
    ],
    sections: [
      { title: "أحدث طلبات الصيادلة", icon: "💼", items: [
        "صيدلية الحياة — 50 علبة أموكسيسيلين — قيد التجهيز",
        "صيدلية الشفاء — 30 علبة باراسيتامول — مكتمل",
        "صيدلية النور — 20 علبة أنسولين — جديد",
        "صيدلية الأمل — 15 علبة فيتامين D — مرسل",
      ]},
      { title: "أكثر المنتجات طلباً", icon: "🔥", items: [
        "باراسيتامول 500mg — 340 علبة هذا الشهر",
        "أموكسيسيلين 500mg — 280 علبة",
        "فيتامين C 1000mg — 195 علبة",
      ]},
    ],
    actions: [
      { label: "إضافة منتج",    icon: "➕" },
      { label: "الطلبات",       icon: "📋" },
      { label: "المخزون",       icon: "📦" },
      { label: "الصيادلة",      icon: "💊" },
      { label: "التقارير",      icon: "📊" },
      { label: "الإعدادات",     icon: "⚙️" },
    ],
  },
  delivery: {
    name: "شركة التوصيل", color: C.delivery, icon: "🚚",
    stats: [
      { label: "رحلة اليوم",    value: "47",     icon: "🚚", change: "12 مكتملة" },
      { label: "قيد التوصيل",   value: "11",     icon: "📍", change: "نشط الآن" },
      { label: "تقييم المنصة",  value: "4.7 ★",  icon: "⭐", change: "ممتاز" },
      { label: "سائق نشط",      value: "23",     icon: "👤", change: "من 30" },
    ],
    sections: [
      { title: "رحلات اليوم", icon: "🗺️", items: [
        "رحلة #D-881 — أربيل، شارع 100 — جارية",
        "رحلة #D-880 — السليمانية، زانكو — مكتملة",
        "رحلة #D-879 — دهوك، كونا ماسي — في الانتظار",
        "رحلة #D-878 — كركوك — مكتملة",
      ]},
      { title: "تقييمات العملاء الأخيرة", icon: "⭐", items: [
        "★★★★★ — «التوصيل كان سريعاً جداً، شكراً!»",
        "★★★★☆ — «الخدمة جيدة لكن تأخر قليلاً»",
        "★★★★★ — «ممتاز، الأدوية وصلت بحالة جيدة»",
      ]},
    ],
    actions: [
      { label: "إضافة سائق",   icon: "👤" },
      { label: "الرحلات",      icon: "🗺️" },
      { label: "التقييمات",    icon: "⭐" },
      { label: "التقارير",     icon: "📊" },
      { label: "المناطق",      icon: "📍" },
      { label: "الإعدادات",    icon: "⚙️" },
    ],
  },
  admin: {
    name: "مدير المنصة", color: C.admin, icon: "🛡️",
    stats: [
      { label: "إجمالي الطلبات",  value: "2,841",        icon: "🛒", change: "+234 هذا الشهر" },
      { label: "إيرادات المنصة",  value: "94,200,000 د.ع", icon: "💵", change: "+18%" },
      { label: "صيدلية مسجّلة",   value: "2,400",        icon: "💊", change: "+43 هذا الشهر" },
      { label: "مستخدم نشط",      value: "+100k",        icon: "👥", change: "كل الأوقات" },
    ],
    sections: [
      { title: "آخر الاشتراكات", icon: "💎", items: [
        "صيدلية الحياة — اشتراك بلاتيني — منتهي خلال 30 يوم",
        "مذخر الشمال — اشتراك ذهبي — نشط",
        "أرامكس كردستان — اشتراك توصيل — نشط",
        "صيدلية النور — اشتراك مجاني — ترقية مقترحة",
      ]},
      { title: "إجراءات سريعة", icon: "⚡", items: [
        "طلب مراجعة: صيدلية الخير — طلب رخصة",
        "بلاغ: مستخدم مشبوه — يحتاج فحص",
        "إعلان جديد — ينتظر الموافقة",
      ]},
    ],
    actions: [
      { label: "الصيادلة",     icon: "💊" },
      { label: "المذاخر",      icon: "🏭" },
      { label: "التوصيل",      icon: "🚚" },
      { label: "الاشتراكات",   icon: "💎" },
      { label: "الإعلانات",    icon: "📢" },
      { label: "وسائل الدفع",  icon: "💳" },
    ],
  },
};

function Dashboard({ role, onBack }: { role: Role; onBack: () => void }) {
  const d = DASHBOARDS[role];
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg }}>
      {/* Top bar */}
      <div style={{
        background: d.color,
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.15)", border: "none",
            borderRadius: 10, padding: "6px 14px",
            color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600,
          }}
        >
          ← الرئيسية
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{d.icon}</span>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>دواء+ · {d.name}</span>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 16,
        }}>
          {d.icon}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14, marginBottom: 24,
        }}>
          {d.stats.map(s => (
            <div key={s.label} style={{
              background: C.surface, borderRadius: 16,
              padding: "18px 16px",
              border: `1px solid ${C.border}`,
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: d.color,
                  background: `${d.color}15`, borderRadius: 8,
                  padding: "2px 8px",
                }}>
                  {s.change}
                </span>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.text, textAlign: "right" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: C.muted, textAlign: "right", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: C.surface, borderRadius: 16, padding: "18px 16px",
          border: `1px solid ${C.border}`, marginBottom: 24,
        }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: C.text, textAlign: "right" }}>
            ⚡ إجراءات سريعة
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 10,
          }}>
            {d.actions.map(a => (
              <button
                key={a.label}
                style={{
                  background: `${d.color}0D`, border: `1.5px solid ${d.color}25`,
                  borderRadius: 12, padding: "12px 10px",
                  cursor: "pointer", textAlign: "center",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all 0.15s",
                  color: d.color, fontWeight: 700, fontSize: 13,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${d.color}18`;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${d.color}0D`;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                <span style={{ fontSize: 22 }}>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {d.sections.map(sec => (
            <div key={sec.title} style={{
              background: C.surface, borderRadius: 16,
              border: `1px solid ${C.border}`,
              overflow: "hidden",
            }}>
              <div
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px",
                  background: `${d.color}08`,
                  borderBottom: `1px solid ${C.border}`,
                  cursor: "pointer",
                }}
                onClick={() => setActiveSection(activeSection === sec.title ? null : sec.title)}
              >
                <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>
                  {activeSection === sec.title ? "▲" : "▼"} عرض الكل
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>{sec.title}</span>
                  <span style={{ fontSize: 18 }}>{sec.icon}</span>
                </div>
              </div>
              <div>
                {sec.items.slice(0, activeSection === sec.title ? undefined : 3).map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "11px 16px",
                      borderBottom: i < sec.items.length - 1 ? `1px solid ${C.border}` : undefined,
                      fontSize: 13, color: C.text, textAlign: "right", lineHeight: 1.5,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: `${d.color}60`, flexShrink: 0,
                    }} />
                    <span style={{ flex: 1, marginRight: 8 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer notice */}
        <div style={{
          marginTop: 24, padding: "14px 16px",
          background: `${d.color}08`, borderRadius: 12,
          border: `1px dashed ${d.color}30`,
          textAlign: "center", fontSize: 13, color: C.muted,
        }}>
          📱 للحصول على التجربة الكاملة مع الإشعارات الفورية ومسح الباركود —
          حمّل تطبيق دواء+ على هاتفك المحمول
        </div>
      </div>
    </div>
  );
}

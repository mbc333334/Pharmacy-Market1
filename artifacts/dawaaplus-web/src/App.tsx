import { useState } from "react";

// ─── Brand ───────────────────────────────────────────────────────────────────
const C = {
  admin:    "#7C3AED",
  pharmacy: "#1A9E6E",
  warehouse:"#0D7A54",
  delivery: "#D69E2E",
  text:     "#1a202c",
  muted:    "#718096",
  border:   "#e2e8f0",
  bg:       "#f7fafc",
  surface:  "#ffffff",
  red:      "#E53E3E",
  green:    "#38A169",
  blue:     "#3182CE",
};

type Portal = "home" | "admin" | "pharmacy" | "warehouse" | "delivery";
type AdminSection = "dashboard" | "pharmacies" | "warehouses" | "delivery_cos" | "subscriptions" | "finance" | "announcements";
type PartnerSection = "dashboard" | "account" | "inventory" | "orders" | "subscription" | "finance" | "support";

// ─── Shared mock data (mirrors mobile app data) ───────────────────────────
const SHARED_DATA = {
  pharmacies: [
    { id:"ph1", name:"صيدلية الشفاء",  city:"أربيل",     phone:"07501234567", plan:"premium",  active:true,  revenue:4200000, orders:18, products:247, joined:"2024-01-15" },
    { id:"ph2", name:"صيدلية النور",    city:"السليمانية",phone:"07701234568", plan:"standard", active:true,  revenue:2800000, orders:11, products:189, joined:"2024-02-20" },
    { id:"ph3", name:"صيدلية الأمل",    city:"دهوك",      phone:"07601234569", plan:"free",     active:true,  revenue:900000,  orders:5,  products:94,  joined:"2024-03-10" },
    { id:"ph4", name:"صيدلية الحياة",   city:"كركوك",     phone:"07501234570", plan:"premium",  active:false, revenue:0,       orders:0,  products:0,   joined:"2024-04-01" },
  ],
  warehouses: [
    { id:"wh1", name:"مذخر الشمال",  city:"أربيل",     phone:"07501234571", plan:"premium",  active:true,  revenue:18700000, orders:34, products:1845, linked:89, joined:"2023-11-01" },
    { id:"wh2", name:"مذخر الوسط",   city:"السليمانية",phone:"07701234572", plan:"standard", active:true,  revenue:9200000,  orders:21, products:1120, linked:45, joined:"2024-01-10" },
    { id:"wh3", name:"مذخر الجنوب",  city:"بغداد",     phone:"07801234573", plan:"free",     active:true,  revenue:3400000,  orders:9,  products:560,  linked:22, joined:"2024-02-28" },
  ],
  deliveries: [
    { id:"dl1", name:"نجم إكسبرس",    city:"أربيل",     phone:"07501234574", plan:"premium",  active:true,  revenue:2100000, trips:47,  drivers:23, rating:4.7, joined:"2023-12-01" },
    { id:"dl2", name:"سريع للتوصيل",   city:"السليمانية",phone:"07701234575", plan:"standard", active:true,  revenue:1400000, trips:31,  drivers:14, rating:4.4, joined:"2024-01-20" },
    { id:"dl3", name:"ألفا ديليفري",   city:"دهوك",      phone:"07601234576", plan:"free",     active:false, revenue:0,       trips:0,   drivers:5,  rating:4.1, joined:"2024-03-05" },
  ],
  finance: {
    totalRevenue: 94200000,
    monthRevenue: 14800000,
    subscriptionIncome: 6200000,
    pendingPayments: 1800000,
    methods: [
      { name:"زين كاش",   account:"07701000001", collected:3200000 },
      { name:"فاست باي",  account:"07601000002", collected:1800000 },
      { name:"FIB",       account:"IQ12...",     collected:950000  },
    ],
  },
  announcements: [
    { id:1, title:"تحديث نظام الاشتراكات",  body:"سيتم تحديث نظام الاشتراكات في 15 أبريل 2025.", target:"all",      date:"2025-04-01", status:"published" },
    { id:2, title:"عروض الصيف",              body:"خصومات حصرية للصيدليات خلال شهر يونيو.",        target:"pharmacy", date:"2025-04-02", status:"draft"     },
    { id:3, title:"رسوم التوصيل الجديدة",    body:"تحديث جدول رسوم التوصيل بدءاً من مايو.",        target:"delivery", date:"2025-04-03", status:"published" },
  ],
  orders: [
    { id:"#1041", product:"باراسيتامول × 3",        status:"processing", amount:45000,   date:"2025-04-04" },
    { id:"#1040", product:"أموكسيسيلين × 2",         status:"completed",  amount:38000,   date:"2025-04-03" },
    { id:"#1039", product:"فيتامين C × 5",           status:"new",        amount:62000,   date:"2025-04-03" },
    { id:"#1038", product:"أنسولين",                  status:"cancelled",  amount:120000,  date:"2025-04-02" },
  ],
};

const planLabel: Record<string, { label:string; color:string; bg:string }> = {
  premium:  { label:"بريميوم ✨",  color:"#7C3AED", bg:"#F3F0FF" },
  standard: { label:"ستاندرد 🔵", color:"#3182CE", bg:"#EBF8FF" },
  free:     { label:"مجاني",       color:"#718096", bg:"#EDF2F7" },
};
const statusMap: Record<string, { label:string; color:string; bg:string }> = {
  new:        { label:"جديد",         color:"#D97706", bg:"#FFF3E0" },
  processing: { label:"قيد التجهيز", color:"#3182CE", bg:"#EBF8FF" },
  completed:  { label:"مكتمل",        color:"#38A169", bg:"#F0FFF4" },
  cancelled:  { label:"ملغي",         color:"#E53E3E", bg:"#FFF5F5" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [portal, setPortal] = useState<Portal>("home");
  if (portal === "home")     return <Home onSelect={setPortal} />;
  if (portal === "admin")    return <AdminPortal    onBack={() => setPortal("home")} />;
  if (portal === "pharmacy") return <PharmacyPortal onBack={() => setPortal("home")} />;
  if (portal === "warehouse")return <WarehousePortal onBack={() => setPortal("home")} />;
  if (portal === "delivery") return <DeliveryPortal  onBack={() => setPortal("home")} />;
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME — PORTAL SELECTOR
// ═══════════════════════════════════════════════════════════════════════════════
function Home({ onSelect }: { onSelect: (p: Portal) => void }) {
  const portals = [
    { id:"admin"    as Portal, icon:"🛡️", label:"مدير المنصة",      sub:"الإشراف الكامل، المالية، الاشتراكات",    color:C.admin    },
    { id:"pharmacy" as Portal, icon:"💊", label:"بوابة الصيدليات",  sub:"إدارة حساب الصيدلية وربطه بالتطبيق",    color:C.pharmacy },
    { id:"warehouse"as Portal, icon:"🏭", label:"بوابة المذاخر",    sub:"إدارة حساب المذخر وربطه بالتطبيق",      color:C.warehouse},
    { id:"delivery" as Portal, icon:"🚛", label:"بوابة شركات التوصيل", sub:"إدارة شركة التوصيل وربطها بالتطبيق", color:C.delivery },
  ];
  return (
    <div dir="rtl" style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif" }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${C.admin} 0%,#553C9A 100%)`, padding:"50px 24px 70px", textAlign:"center" }}>
        <div style={{ fontSize:54, marginBottom:8 }}>💊</div>
        <h1 style={{ color:"#fff", fontSize:36, fontWeight:900, margin:0 }}>دواء +</h1>
        <p style={{ color:"rgba(255,255,255,0.85)", fontSize:16, margin:"8px 0 0" }}>منظومة الإدارة المتكاملة — إقليم كردستان والعراق</p>
        <div style={{ display:"flex", justifyContent:"center", gap:32, marginTop:32, flexWrap:"wrap" }}>
          {[{v:"+2,400",l:"صيدلية"},{v:"+300",l:"مذخر"},{v:"+50",l:"شركة توصيل"}].map(s=>(
            <div key={s.l} style={{ color:"#fff", textAlign:"center" }}>
              <div style={{ fontSize:24, fontWeight:900 }}>{s.v}</div>
              <div style={{ fontSize:12, opacity:0.8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Portal Cards */}
      <div style={{ maxWidth:860, margin:"-36px auto 0", padding:"0 20px 60px" }}>
        <div style={{ background:C.surface, borderRadius:20, padding:"28px 24px", boxShadow:"0 8px 40px rgba(0,0,0,0.10)" }}>
          <h2 style={{ textAlign:"center", color:C.text, fontSize:17, fontWeight:800, margin:"0 0 20px" }}>اختر البوابة المناسبة</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
            {portals.map(p => (
              <PortalCard key={p.id} {...p} onClick={() => onSelect(p.id)} />
            ))}
          </div>
        </div>
        <SyncBanner />
      </div>
    </div>
  );
}

function PortalCard({ icon, label, sub, color, onClick }: any) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:hov?`${color}18`:`${color}0C`, border:`2px solid ${hov?color:color+"30"}`,
        borderRadius:16, padding:"22px 14px", cursor:"pointer", textAlign:"center",
        display:"flex", flexDirection:"column", alignItems:"center", gap:8,
        transform:hov?"translateY(-3px)":"none", transition:"all 0.18s" }}>
      <span style={{ fontSize:34 }}>{icon}</span>
      <span style={{ fontSize:15, fontWeight:800, color }}>{label}</span>
      <span style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>{sub}</span>
    </button>
  );
}

function SyncBanner() {
  return (
    <div style={{ background:"#EBF8FF", border:"1px solid #90CDF4", borderRadius:14, padding:"14px 18px",
      display:"flex", alignItems:"center", gap:12, marginTop:18 }}>
      <span style={{ fontSize:24 }}>🔄</span>
      <div>
        <div style={{ fontWeight:800, color:C.blue, fontSize:14 }}>تزامن حي مع تطبيق دواء+</div>
        <div style={{ fontSize:12, color:"#2C5282" }}>كل تغيير في البوابة ينعكس فوراً في التطبيق، والعكس صحيح — بيانات موحدة في الاتجاهين</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════
function PortalLayout({ color, icon, title, subtitle, onBack, menu, activeSection, onSection, children }: {
  color:string; icon:string; title:string; subtitle:string; onBack:()=>void;
  menu:{id:string; label:string; icon:string}[]; activeSection:string;
  onSection:(s:string)=>void; children:React.ReactNode;
}) {
  const [sideOpen, setSideOpen] = useState(true);
  return (
    <div dir="rtl" style={{ display:"flex", height:"100vh", fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width: sideOpen ? 220 : 60, background:"#1a202c", display:"flex", flexDirection:"column",
        transition:"width 0.25s", flexShrink:0, overflow:"hidden" }}>
        <div style={{ padding:"16px 12px", borderBottom:"1px solid #2d3748", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:24, flexShrink:0 }}>{icon}</span>
          {sideOpen && <div>
            <div style={{ color:"#fff", fontSize:13, fontWeight:800, whiteSpace:"nowrap" }}>{title}</div>
            <div style={{ color:"#A0AEC0", fontSize:10 }}>دواء+</div>
          </div>}
          <button onClick={()=>setSideOpen(v=>!v)} style={{ marginRight:"auto", background:"none", border:"none",
            color:"#A0AEC0", cursor:"pointer", fontSize:18, flexShrink:0 }}>☰</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
          {menu.map(m => (
            <button key={m.id} onClick={()=>onSection(m.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
                background: activeSection===m.id ? `${color}30` : "none",
                border:"none", cursor:"pointer", textAlign:"right",
                borderRight: activeSection===m.id ? `3px solid ${color}` : "3px solid transparent",
                transition:"all 0.15s" }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{m.icon}</span>
              {sideOpen && <span style={{ color: activeSection===m.id ? "#fff" : "#A0AEC0", fontSize:13, fontWeight:activeSection===m.id?700:400, whiteSpace:"nowrap" }}>{m.label}</span>}
            </button>
          ))}
        </div>
        <button onClick={onBack} style={{ padding:"14px", background:"none", border:"none", borderTop:"1px solid #2d3748",
          color:"#A0AEC0", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
          <span>🚪</span>{sideOpen && <span>العودة للرئيسية</span>}
        </button>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Top bar */}
        <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 24px",
          display:"flex", alignItems:"center", gap:16, height:60, flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:16, color:C.text }}>{menu.find(m=>m.id===activeSection)?.label}</div>
            <div style={{ fontSize:11, color:C.muted }}>{subtitle}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:`${color}12`, borderRadius:20,
            padding:"6px 14px", border:`1px solid ${color}30` }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#38A169", display:"block", animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:12, color, fontWeight:700 }}>متزامن مع التطبيق</span>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatBox({ icon, label, value, change, color }: any) {
  return (
    <div style={{ background:C.surface, borderRadius:14, padding:"18px 20px",
      borderTop:`3px solid ${color}`, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:24 }}>{icon}</span>
        {change && <span style={{ fontSize:11, color:C.green, fontWeight:700, background:"#F0FFF4",
          borderRadius:8, padding:"2px 8px" }}>{change}</span>}
      </div>
      <div style={{ fontSize:22, fontWeight:900, color:C.text }}>{value}</div>
      <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{label}</div>
    </div>
  );
}
function Badge({ label, color, bg }: any) {
  return <span style={{ background:bg, color, borderRadius:8, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{label}</span>;
}
function SectionTitle({ title, icon }: any) {
  return <h3 style={{ fontSize:16, fontWeight:800, color:C.text, margin:"0 0 16px", display:"flex", alignItems:"center", gap:8 }}><span>{icon}</span>{title}</h3>;
}
function Card({ children, style }: any) {
  return <div style={{ background:C.surface, borderRadius:16, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", ...style }}>{children}</div>;
}
function AppSyncNote({ entity }: { entity: string }) {
  return (
    <div style={{ background:"#EBF8FF", border:"1px solid #90CDF4", borderRadius:10, padding:"10px 14px",
      display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
      <span style={{ fontSize:16 }}>📱</span>
      <span style={{ fontSize:12, color:"#2C5282" }}>بيانات {entity} متزامنة مع تطبيق دواء+ — أي تعديل هنا يظهر فوراً في التطبيق</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
const ADMIN_MENU = [
  { id:"dashboard",    label:"لوحة التحكم",      icon:"📊" },
  { id:"pharmacies",   label:"الصيدليات",         icon:"💊" },
  { id:"warehouses",   label:"المذاخر",            icon:"🏭" },
  { id:"delivery_cos", label:"شركات التوصيل",     icon:"🚛" },
  { id:"subscriptions",label:"الاشتراكات",         icon:"💎" },
  { id:"finance",      label:"الإدارة المالية",   icon:"💰" },
  { id:"announcements",label:"الإعلانات",          icon:"📢" },
];

function AdminPortal({ onBack }: { onBack: ()=>void }) {
  const [sec, setSec] = useState<AdminSection>("dashboard");
  return (
    <PortalLayout color={C.admin} icon="🛡️" title="مدير المنصة" subtitle="لوحة الإدارة الكاملة لمنصة دواء+"
      onBack={onBack} menu={ADMIN_MENU} activeSection={sec} onSection={s => setSec(s as AdminSection)}>
      {sec === "dashboard"     && <AdminDashboard />}
      {sec === "pharmacies"    && <AdminPharmacies />}
      {sec === "warehouses"    && <AdminWarehouses />}
      {sec === "delivery_cos"  && <AdminDeliveries />}
      {sec === "subscriptions" && <AdminSubscriptions />}
      {sec === "finance"       && <AdminFinance />}
      {sec === "announcements" && <AdminAnnouncements />}
    </PortalLayout>
  );
}

function AdminDashboard() {
  const { pharmacies, warehouses, deliveries, finance } = SHARED_DATA;
  return (
    <div>
      <AppSyncNote entity="جميع المشتركين" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:24 }}>
        <StatBox icon="💊" label="صيدلية مسجّلة"       value={pharmacies.length.toLocaleString()} change="+43 هذا الشهر" color={C.pharmacy}  />
        <StatBox icon="🏭" label="مذخر مسجّل"           value={warehouses.length.toLocaleString()} change="+12 هذا الشهر" color={C.warehouse} />
        <StatBox icon="🚛" label="شركة توصيل"           value={deliveries.length.toLocaleString()} change="+5 هذا الشهر"  color={C.delivery}  />
        <StatBox icon="💰" label="إيرادات المنصة الكلية" value={`${(finance.totalRevenue/1000000).toFixed(1)}M د.ع`} change="+18% سنوياً" color={C.admin} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card>
          <SectionTitle title="آخر الصيدليات المنضمة" icon="💊" />
          {pharmacies.slice(0,3).map(p=>(
            <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>{p.name}</div>
                <div style={{ fontSize:11, color:C.muted }}>{p.city} · {p.joined}</div>
              </div>
              <Badge {...planLabel[p.plan]} />
            </div>
          ))}
        </Card>
        <Card>
          <SectionTitle title="آخر المذاخر المنضمة" icon="🏭" />
          {warehouses.slice(0,3).map(w=>(
            <div key={w.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>{w.name}</div>
                <div style={{ fontSize:11, color:C.muted }}>{w.city} · {w.joined}</div>
              </div>
              <Badge {...planLabel[w.plan]} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function SubscriberTable({ data, fields, color }: { data:any[]; fields:{key:string;label:string}[]; color:string }) {
  const [search, setSearch] = useState("");
  const filtered = data.filter(d => Object.values(d).join(" ").includes(search));
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <input placeholder="🔍 بحث..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 14px", fontSize:13 }} />
        <button style={{ background:color, color:"#fff", border:"none", borderRadius:10, padding:"8px 18px", fontWeight:700, cursor:"pointer", fontSize:13 }}>
          + إضافة حساب
        </button>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {fields.map(f=><th key={f.key} style={{ padding:"10px 12px", textAlign:"right", color:C.muted, fontWeight:600, borderBottom:`2px solid ${C.border}` }}>{f.label}</th>)}
              <th style={{ padding:"10px 12px", borderBottom:`2px solid ${C.border}` }}>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row,i)=>(
              <tr key={i} style={{ borderBottom:`1px solid ${C.border}`, background: i%2===0?C.surface:C.bg }}>
                {fields.map(f=>(
                  <td key={f.key} style={{ padding:"10px 12px" }}>
                    {f.key==="plan" ? <Badge {...planLabel[row[f.key]]} /> :
                     f.key==="active" ? <Badge label={row[f.key]?"نشط":"معطّل"} color={row[f.key]?C.green:C.red} bg={row[f.key]?"#F0FFF4":"#FFF5F5"} /> :
                     String(row[f.key]||"—")}
                  </td>
                ))}
                <td style={{ padding:"10px 12px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button style={{ background:`${color}15`, color, border:"none", borderRadius:8, padding:"4px 10px", cursor:"pointer", fontSize:12, fontWeight:700 }}>تعديل</button>
                    <button style={{ background:"#FFF5F5", color:C.red, border:"none", borderRadius:8, padding:"4px 10px", cursor:"pointer", fontSize:12 }}>إيقاف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPharmacies() {
  return <div><AppSyncNote entity="حسابات الصيدليات" /><SectionTitle title="إدارة حسابات الصيدليات" icon="💊" />
    <SubscriberTable color={C.pharmacy} data={SHARED_DATA.pharmacies}
      fields={[{key:"name",label:"الصيدلية"},{key:"city",label:"المدينة"},{key:"phone",label:"الهاتف"},{key:"plan",label:"الاشتراك"},{key:"active",label:"الحالة"},{key:"revenue",label:"الإيرادات"},{key:"joined",label:"تاريخ الانضمام"}]} /></div>;
}
function AdminWarehouses() {
  return <div><AppSyncNote entity="حسابات المذاخر" /><SectionTitle title="إدارة حسابات المذاخر" icon="🏭" />
    <SubscriberTable color={C.warehouse} data={SHARED_DATA.warehouses}
      fields={[{key:"name",label:"المذخر"},{key:"city",label:"المدينة"},{key:"phone",label:"الهاتف"},{key:"plan",label:"الاشتراك"},{key:"active",label:"الحالة"},{key:"revenue",label:"الإيرادات"},{key:"joined",label:"تاريخ الانضمام"}]} /></div>;
}
function AdminDeliveries() {
  return <div><AppSyncNote entity="حسابات شركات التوصيل" /><SectionTitle title="إدارة شركات التوصيل" icon="🚛" />
    <SubscriberTable color={C.delivery} data={SHARED_DATA.deliveries}
      fields={[{key:"name",label:"الشركة"},{key:"city",label:"المدينة"},{key:"phone",label:"الهاتف"},{key:"plan",label:"الاشتراك"},{key:"active",label:"الحالة"},{key:"trips",label:"الرحلات"},{key:"rating",label:"التقييم"}]} /></div>;
}

function AdminSubscriptions() {
  const all = [
    ...SHARED_DATA.pharmacies.map(p=>({...p, type:"صيدلية", typeIcon:"💊", typeColor:C.pharmacy})),
    ...SHARED_DATA.warehouses.map(w=>({...w, type:"مذخر", typeIcon:"🏭", typeColor:C.warehouse})),
    ...SHARED_DATA.deliveries.map(d=>({...d, type:"شركة توصيل", typeIcon:"🚛", typeColor:C.delivery})),
  ];
  return (
    <div>
      <AppSyncNote entity="الاشتراكات" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:24 }}>
        {[{l:"بريميوم",c:C.admin,v:all.filter(a=>a.plan==="premium").length},{l:"ستاندرد",c:C.blue,v:all.filter(a=>a.plan==="standard").length},{l:"مجاني",c:C.muted,v:all.filter(a=>a.plan==="free").length}].map(s=>(
          <Card key={s.l} style={{ textAlign:"center", borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:28, fontWeight:900, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:12, color:C.muted }}>{s.l}</div>
          </Card>
        ))}
      </div>
      <Card>
        <SectionTitle title="جميع الاشتراكات" icon="💎" />
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr style={{ background:C.bg }}>
            {["النوع","الاسم","المدينة","الاشتراك","الحالة","الإجراء"].map(h=><th key={h} style={{ padding:"10px 12px", textAlign:"right", color:C.muted, borderBottom:`2px solid ${C.border}` }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {all.map((a,i)=>(
              <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                <td style={{ padding:"10px 12px" }}><span style={{ background:`${a.typeColor}15`, color:a.typeColor, borderRadius:8, padding:"2px 10px", fontWeight:700, fontSize:11 }}>{a.typeIcon} {a.type}</span></td>
                <td style={{ padding:"10px 12px", fontWeight:700 }}>{a.name}</td>
                <td style={{ padding:"10px 12px", color:C.muted }}>{a.city}</td>
                <td style={{ padding:"10px 12px" }}><Badge {...planLabel[a.plan]} /></td>
                <td style={{ padding:"10px 12px" }}><Badge label={a.active?"نشط":"معطّل"} color={a.active?C.green:C.red} bg={a.active?"#F0FFF4":"#FFF5F5"} /></td>
                <td style={{ padding:"10px 12px" }}>
                  <button style={{ background:`${C.admin}15`, color:C.admin, border:"none", borderRadius:8, padding:"4px 10px", cursor:"pointer", fontWeight:700, fontSize:12 }}>ترقية</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AdminFinance() {
  const f = SHARED_DATA.finance;
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:24 }}>
        <StatBox icon="💰" label="الإيرادات الكلية"       value={`${(f.totalRevenue/1000000).toFixed(1)}M`}  change="+18%" color={C.admin} />
        <StatBox icon="📅" label="إيرادات هذا الشهر"     value={`${(f.monthRevenue/1000000).toFixed(1)}M`}  change="+12%" color={C.pharmacy} />
        <StatBox icon="💎" label="دخل الاشتراكات"         value={`${(f.subscriptionIncome/1000000).toFixed(1)}M`} color={C.warehouse} />
        <StatBox icon="⏳" label="مدفوعات معلّقة"         value={`${(f.pendingPayments/1000000).toFixed(1)}M`} color={C.delivery} />
      </div>
      <Card style={{ marginBottom:16 }}>
        <SectionTitle title="حسابات وسائل الدفع" icon="🏦" />
        {f.methods.map(m=>(
          <div key={m.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>{m.name}</div>
              <div style={{ fontSize:12, color:C.muted, fontFamily:"monospace" }}>رقم الحساب: {m.account}</div>
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontWeight:700, color:C.green, fontSize:15 }}>{m.collected.toLocaleString()} د.ع</div>
              <div style={{ fontSize:11, color:C.muted }}>محصّل</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AdminAnnouncements() {
  const [form, setForm] = useState({ title:"", body:"", target:"all" });
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      <Card>
        <SectionTitle title="إنشاء إعلان جديد" icon="✍️" />
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="عنوان الإعلان"
            style={{ border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:13 }} />
          <textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="نص الإعلان..." rows={4}
            style={{ border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:13, resize:"vertical" }} />
          <select value={form.target} onChange={e=>setForm({...form,target:e.target.value})}
            style={{ border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:13 }}>
            <option value="all">للجميع</option>
            <option value="pharmacy">الصيدليات فقط</option>
            <option value="warehouse">المذاخر فقط</option>
            <option value="delivery">شركات التوصيل فقط</option>
          </select>
          <button style={{ background:C.admin, color:"#fff", border:"none", borderRadius:10, padding:"12px", fontWeight:700, cursor:"pointer", fontSize:14 }}>
            📢 نشر الإعلان
          </button>
        </div>
      </Card>
      <Card>
        <SectionTitle title="الإعلانات السابقة" icon="📋" />
        {SHARED_DATA.announcements.map(a=>(
          <div key={a.id} style={{ padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontWeight:700, fontSize:13 }}>{a.title}</span>
              <Badge label={a.status==="published"?"منشور":"مسودة"} color={a.status==="published"?C.green:C.muted} bg={a.status==="published"?"#F0FFF4":"#EDF2F7"} />
            </div>
            <div style={{ fontSize:12, color:C.muted }}>{a.body}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{a.date} · {a.target==="all"?"للجميع":a.target}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHARMACY PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
const PARTNER_MENU = (type: string) => [
  { id:"dashboard",    label:"لوحة التحكم",    icon:"📊" },
  { id:"account",      label:"حسابي",          icon:"👤" },
  { id:"inventory",    label:type==="pharmacy"?"المخزون":"المنتجات", icon:"📦" },
  { id:"orders",       label:"الطلبات",         icon:"🛒" },
  { id:"subscription", label:"الاشتراك",        icon:"💎" },
  { id:"finance",      label:"المالية",         icon:"💰" },
  { id:"support",      label:"الدعم والتواصل", icon:"💬" },
];

function PharmacyPortal({ onBack }: { onBack:()=>void }) {
  const ph = SHARED_DATA.pharmacies[0];
  const [sec, setSec] = useState<PartnerSection>("dashboard");
  return (
    <PortalLayout color={C.pharmacy} icon="💊" title="بوابة الصيدلية" subtitle={ph.name}
      onBack={onBack} menu={PARTNER_MENU("pharmacy")} activeSection={sec} onSection={s=>setSec(s as PartnerSection)}>
      {sec==="dashboard"    && <PartnerDashboard color={C.pharmacy} entity={ph} type="pharmacy" />}
      {sec==="account"      && <AccountSection color={C.pharmacy} entity={ph} type="pharmacy" />}
      {sec==="inventory"    && <InventorySection color={C.pharmacy} />}
      {sec==="orders"       && <OrdersSection color={C.pharmacy} />}
      {sec==="subscription" && <SubscriptionSection color={C.pharmacy} plan={ph.plan} />}
      {sec==="finance"      && <FinanceSection color={C.pharmacy} revenue={ph.revenue} />}
      {sec==="support"      && <SupportSection color={C.pharmacy} name={ph.name} type="صيدلية" />}
    </PortalLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WAREHOUSE PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
function WarehousePortal({ onBack }: { onBack:()=>void }) {
  const wh = SHARED_DATA.warehouses[0];
  const [sec, setSec] = useState<PartnerSection>("dashboard");
  return (
    <PortalLayout color={C.warehouse} icon="🏭" title="بوابة المذخر" subtitle={wh.name}
      onBack={onBack} menu={PARTNER_MENU("warehouse")} activeSection={sec} onSection={s=>setSec(s as PartnerSection)}>
      {sec==="dashboard"    && <PartnerDashboard color={C.warehouse} entity={wh} type="warehouse" />}
      {sec==="account"      && <AccountSection color={C.warehouse} entity={wh} type="warehouse" />}
      {sec==="inventory"    && <InventorySection color={C.warehouse} />}
      {sec==="orders"       && <OrdersSection color={C.warehouse} />}
      {sec==="subscription" && <SubscriptionSection color={C.warehouse} plan={wh.plan} />}
      {sec==="finance"      && <FinanceSection color={C.warehouse} revenue={wh.revenue} />}
      {sec==="support"      && <SupportSection color={C.warehouse} name={wh.name} type="مذخر" />}
    </PortalLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELIVERY PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
function DeliveryPortal({ onBack }: { onBack:()=>void }) {
  const dl = SHARED_DATA.deliveries[0];
  const [sec, setSec] = useState<PartnerSection>("dashboard");
  return (
    <PortalLayout color={C.delivery} icon="🚛" title="بوابة شركة التوصيل" subtitle={dl.name}
      onBack={onBack} menu={PARTNER_MENU("delivery")} activeSection={sec} onSection={s=>setSec(s as PartnerSection)}>
      {sec==="dashboard"    && <PartnerDashboard color={C.delivery} entity={dl} type="delivery" />}
      {sec==="account"      && <AccountSection color={C.delivery} entity={dl} type="delivery" />}
      {sec==="inventory"    && <InventorySection color={C.delivery} />}
      {sec==="orders"       && <OrdersSection color={C.delivery} />}
      {sec==="subscription" && <SubscriptionSection color={C.delivery} plan={dl.plan} />}
      {sec==="finance"      && <FinanceSection color={C.delivery} revenue={dl.revenue} />}
      {sec==="support"      && <SupportSection color={C.delivery} name={dl.name} type="شركة توصيل" />}
    </PortalLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED PARTNER SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════
function PartnerDashboard({ color, entity, type }: { color:string; entity:any; type:string }) {
  const isDelivery = type === "delivery";
  return (
    <div>
      <AppSyncNote entity={`حساب ${entity.name}`} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
        {!isDelivery && <StatBox icon="📦" label="منتج في المخزون" value={entity.products?.toLocaleString?.()||entity.products} color={color} />}
        {!isDelivery && <StatBox icon="🛒" label="طلبات اليوم"    value={entity.orders}                              change="+5 جديدة" color={color} />}
        {isDelivery  && <StatBox icon="🚛" label="رحلة اليوم"     value={entity.trips}                               change="+8 مكتملة" color={color} />}
        {isDelivery  && <StatBox icon="⭐" label="التقييم"         value={entity.rating+" ★"}                        color={color} />}
        <StatBox icon="💰" label="إيرادات الشهر" value={entity.revenue?.toLocaleString?.()+" د.ع"||"—"} color={color} />
        <StatBox icon="📅" label="تاريخ الانضمام" value={entity.joined} color={C.muted} />
      </div>
      <Card>
        <SectionTitle title="آخر الطلبات من التطبيق" icon="📱" />
        {SHARED_DATA.orders.map(o=>(
          <div key={o.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
            <div>
              <span style={{ fontWeight:700, color, fontSize:13 }}>{o.id}</span>
              <span style={{ fontSize:13, color:C.text, marginRight:10 }}>{o.product}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:13, fontWeight:700 }}>{o.amount.toLocaleString()} د.ع</span>
              <Badge {...statusMap[o.status]} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AccountSection({ color, entity, type }: { color:string; entity:any; type:string }) {
  const [saved, setSaved] = useState(false);
  const fields = [
    { label:"الاسم التجاري", val:entity.name },
    { label:"المدينة",        val:entity.city },
    { label:"رقم الهاتف",    val:entity.phone },
    ...(type==="pharmacy"?[{ label:"رقم الرخصة", val:"PH-20240115" }]:[]),
    ...(type==="warehouse"?[{ label:"صيدليات مرتبطة", val:entity.linked+" صيدلية" }]:[]),
    ...(type==="delivery"?[{ label:"عدد السائقين", val:entity.drivers+" سائق" }]:[]),
  ];
  return (
    <div>
      <AppSyncNote entity="بيانات الحساب" />
      <Card style={{ maxWidth:600 }}>
        <SectionTitle title="معلومات الحساب" icon="👤" />
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
          {fields.map(f=>(
            <div key={f.label}>
              <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:4 }}>{f.label}</label>
              <input defaultValue={f.val} style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:14, boxSizing:"border-box" }} />
            </div>
          ))}
        </div>
        <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),3000)}}
          style={{ background:color, color:"#fff", border:"none", borderRadius:10, padding:"12px 24px",
            fontWeight:700, cursor:"pointer", fontSize:14, width:"100%" }}>
          {saved ? "✅ تم الحفظ والمزامنة مع التطبيق" : "💾 حفظ ومزامنة مع التطبيق"}
        </button>
        {saved && <div style={{ textAlign:"center", fontSize:12, color:C.green, marginTop:8 }}>
          ✅ تم تحديث بياناتك في التطبيق أيضاً
        </div>}
      </Card>
    </div>
  );
}

function InventorySection({ color }: { color:string }) {
  const items = [
    { name:"باراسيتامول 500mg",  qty:12,  unit:"علبة",  price:3500,  expiry:"2025-08-01" },
    { name:"أموكسيسيلين 500mg",  qty:8,   unit:"علبة",  price:4200,  expiry:"2025-06-15" },
    { name:"ميتفورمين 850mg",    qty:5,   unit:"علبة",  price:5800,  expiry:"2025-09-30" },
    { name:"فيتامين C 1000mg",   qty:34,  unit:"علبة",  price:2800,  expiry:"2026-01-01" },
    { name:"أنسولين نوفوميكس",   qty:20,  unit:"قارورة",price:15000, expiry:"2025-05-20" },
  ];
  return (
    <div>
      <AppSyncNote entity="المخزون" />
      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
        <input placeholder="🔍 بحث..." style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 14px", fontSize:13 }} />
        <button style={{ background:color, color:"#fff", border:"none", borderRadius:10, padding:"8px 18px", fontWeight:700, cursor:"pointer" }}>+ إضافة</button>
      </div>
      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr style={{ background:C.bg }}>
            {["المنتج","الكمية","الوحدة","السعر","انتهاء الصلاحية","الحالة"].map(h=>(
              <th key={h} style={{ padding:"10px 12px", textAlign:"right", color:C.muted, borderBottom:`2px solid ${C.border}`, fontWeight:600 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {items.map((it,i)=>(
              <tr key={i} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.surface:C.bg }}>
                <td style={{ padding:"10px 12px", fontWeight:700 }}>{it.name}</td>
                <td style={{ padding:"10px 12px", fontWeight:700, color:it.qty<10?C.red:C.text }}>{it.qty}</td>
                <td style={{ padding:"10px 12px", color:C.muted }}>{it.unit}</td>
                <td style={{ padding:"10px 12px" }}>{it.price.toLocaleString()} د.ع</td>
                <td style={{ padding:"10px 12px", color:C.muted }}>{it.expiry}</td>
                <td style={{ padding:"10px 12px" }}>
                  {it.qty < 10
                    ? <Badge label="ينفد" color={C.red} bg="#FFF5F5" />
                    : <Badge label="متوفر" color={C.green} bg="#F0FFF4" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function OrdersSection({ color }: { color:string }) {
  return (
    <div>
      <AppSyncNote entity="الطلبات" />
      <Card>
        <SectionTitle title="الطلبات المستقبَلة من التطبيق" icon="📱" />
        {SHARED_DATA.orders.map(o=>(
          <div key={o.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${C.border}` }}>
            <div>
              <div style={{ fontWeight:700, color, marginBottom:2 }}>{o.id}</div>
              <div style={{ fontSize:13 }}>{o.product}</div>
              <div style={{ fontSize:11, color:C.muted }}>{o.date}</div>
            </div>
            <div style={{ textAlign:"left", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
              <div style={{ fontWeight:800 }}>{o.amount.toLocaleString()} د.ع</div>
              <Badge {...statusMap[o.status]} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SubscriptionSection({ color, plan }: { color:string; plan:string }) {
  const plans = [
    { id:"free",     name:"مجاني",    price:0,        features:["5 منتجات","دعم أساسي","بدون إعلانات"] },
    { id:"standard", name:"ستاندرد",  price:25000,    features:["200 منتج","دعم أولوية","إعلان واحد","تقارير شهرية"] },
    { id:"premium",  name:"بريميوم",  price:65000,    features:["منتجات غير محدودة","دعم 24/7","إعلانات متعددة","تقارير تفصيلية","مدير حساب خاص"] },
  ];
  return (
    <div>
      <AppSyncNote entity="الاشتراك" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
        {plans.map(p=>(
          <Card key={p.id} style={{ border:`2px solid ${p.id===plan?color:C.border}`, position:"relative" }}>
            {p.id===plan && <div style={{ position:"absolute", top:-10, right:16, background:color, color:"#fff", borderRadius:10, padding:"2px 12px", fontSize:11, fontWeight:700 }}>اشتراكك الحالي</div>}
            <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>{p.name}</div>
            <div style={{ fontSize:22, fontWeight:900, color, marginBottom:16 }}>
              {p.price===0 ? "مجاني" : `${p.price.toLocaleString()} د.ع/شهر`}
            </div>
            {p.features.map(f=><div key={f} style={{ fontSize:13, color:C.text, marginBottom:6, display:"flex", gap:6 }}><span style={{ color:C.green }}>✓</span>{f}</div>)}
            {p.id !== plan && (
              <button style={{ marginTop:12, background:color, color:"#fff", border:"none", borderRadius:10,
                padding:"10px", width:"100%", fontWeight:700, cursor:"pointer", fontSize:14 }}>
                الترقية إلى {p.name}
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function FinanceSection({ color, revenue }: { color:string; revenue:number }) {
  const payments = [
    { method:"زين كاش",  ref:"ZC-20250401", amount:850000,  date:"2025-04-01", status:"completed" },
    { method:"فاست باي", ref:"FP-20250315", amount:650000,  date:"2025-03-15", status:"completed" },
    { method:"FIB",       ref:"FI-20250301", amount:1200000, date:"2025-03-01", status:"completed" },
    { method:"نقداً",    ref:"CA-20250215", amount:500000,  date:"2025-02-15", status:"completed" },
  ];
  return (
    <div>
      <AppSyncNote entity="المالية" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
        <StatBox icon="💰" label="إجمالي الإيرادات" value={`${(revenue/1000000).toFixed(1)}M د.ع`} color={color} />
        <StatBox icon="📅" label="هذا الشهر"        value={`${(revenue*0.3/1000000).toFixed(1)}M د.ع`} change="+8%" color={color} />
        <StatBox icon="⏳" label="قيد المعالجة"     value="١٢٠,٠٠٠ د.ع" color={C.delivery} />
      </div>
      <Card>
        <SectionTitle title="سجل المدفوعات" icon="📋" />
        {payments.map((p,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
            <div>
              <div style={{ fontWeight:700, fontSize:13 }}>{p.method}</div>
              <div style={{ fontSize:11, color:C.muted }}>Ref: {p.ref} · {p.date}</div>
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontWeight:800, color:C.green }}>{p.amount.toLocaleString()} د.ع</div>
              <Badge label="مكتمل" color={C.green} bg="#F0FFF4" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SupportSection({ color, name, type }: { color:string; name:string; type:string }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [tab, setTab] = useState<"tickets"|"chat"|"contact">("tickets");
  const tickets = [
    { id:"TK-001", title:"مشكلة في الطلبات", status:"open",     date:"2025-04-03", reply:"نحن ندرس مشكلتك..." },
    { id:"TK-002", title:"سؤال عن الاشتراك", status:"resolved", date:"2025-04-01", reply:"تم الحل، راجع الاشتراكات." },
  ];
  return (
    <div>
      <AppSyncNote entity="الدعم" />
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {([["tickets","🎫 التذاكر"],["chat","💬 رسالة للمدير"],["contact","📞 التواصل"]] as const).map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{ background:tab===id?color:"#EDF2F7", color:tab===id?"#fff":C.text,
              border:"none", borderRadius:10, padding:"8px 18px", fontWeight:700, cursor:"pointer", fontSize:13 }}>
            {label}
          </button>
        ))}
      </div>

      {tab==="tickets" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {tickets.map(t=>(
            <Card key={t.id}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <div>
                  <span style={{ fontWeight:700, color }}>{t.id}</span>
                  <span style={{ fontWeight:700, fontSize:14, marginRight:10 }}>{t.title}</span>
                </div>
                <Badge label={t.status==="open"?"مفتوحة":"محلولة"} color={t.status==="open"?C.delivery:C.green} bg={t.status==="open"?"#FFF3E0":"#F0FFF4"} />
              </div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>رد المدير: {t.reply}</div>
              <div style={{ fontSize:11, color:C.muted }}>{t.date}</div>
            </Card>
          ))}
          <Card>
            <SectionTitle title="فتح تذكرة جديدة" icon="✍️" />
            <input placeholder="موضوع المشكلة" style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", marginBottom:8, fontSize:13, boxSizing:"border-box" }} />
            <textarea placeholder="وصف المشكلة بالتفصيل..." rows={3} style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:13, resize:"vertical", boxSizing:"border-box" }} />
            <button style={{ background:color, color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:700, cursor:"pointer", marginTop:8, fontSize:14 }}>إرسال التذكرة</button>
          </Card>
        </div>
      )}

      {tab==="chat" && (
        <Card>
          <SectionTitle title="رسالة مباشرة لمدير المنصة" icon="💬" />
          <div style={{ background:C.bg, borderRadius:12, padding:16, minHeight:120, marginBottom:12, fontSize:13, color:C.muted }}>
            مرحباً {name}! كيف يمكننا مساعدتك؟ 👋
          </div>
          <textarea placeholder="اكتب رسالتك هنا..." value={msg} onChange={e=>setMsg(e.target.value)}
            rows={3} style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:13, resize:"vertical", boxSizing:"border-box", marginBottom:8 }} />
          <button onClick={()=>{setSent(true);setMsg("");setTimeout(()=>setSent(false),4000)}}
            style={{ background:color, color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:700, cursor:"pointer", fontSize:14 }}>
            {sent ? "✅ تم الإرسال!" : "📨 إرسال إلى المدير"}
          </button>
          {sent && <div style={{ color:C.green, fontSize:12, marginTop:8 }}>✅ تم إرسال رسالتك، سيرد عليك المدير قريباً</div>}
        </Card>
      )}

      {tab==="contact" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
          {[
            { icon:"📞", label:"هاتف",    value:"+964 770 000 0001", action:"tel:+9647700000001" },
            { icon:"💬", label:"واتساب",  value:"+964 770 000 0001", action:"https://wa.me/9647700000001" },
            { icon:"📧", label:"البريد",  value:"admin@dawaplus.iq", action:"mailto:admin@dawaplus.iq" },
            { icon:"🌐", label:"الموقع",  value:"dawaplus.iq",       action:"#" },
          ].map(c=>(
            <Card key={c.label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:36, marginBottom:8 }}>{c.icon}</div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{c.label}</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>{c.value}</div>
              <a href={c.action} target="_blank" rel="noreferrer"
                style={{ background:color, color:"#fff", borderRadius:10, padding:"8px 16px",
                  fontSize:13, fontWeight:700, textDecoration:"none", display:"inline-block" }}>تواصل الآن</a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

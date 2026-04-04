import { useState, useEffect, useCallback } from "react";

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  admin:"#7C3AED", pharmacy:"#1A9E6E", warehouse:"#0D7A54", delivery:"#D69E2E",
  text:"#1a202c", muted:"#718096", border:"#e2e8f0", bg:"#f7fafc", surface:"#fff",
  red:"#E53E3E", green:"#38A169", blue:"#3182CE", orange:"#DD6B20",
};

// ─── Shared localStorage keys (same domain = shared storage with subscriber portals) ──
const PHARMACY_IDS  = ["ph1","ph2","ph3","ph4"];
const WAREHOUSE_IDS = ["wh1","wh2","wh3","wh4"];
const DELIVERY_IDS  = ["dc1","dc2","dc3","dc4"];

// Default data (fallback if subscriber hasn't logged in yet)
const DEFAULT_PHARMACIES: any[] = [
  { id:"ph1", name:"صيدلية الشفاء",  city:"أربيل",       phone:"07501234567", license:"PH-2024-001", plan:"premium",  active:true, revenue:4200000, joined:"2024-01-15", address:"شارع 100، أربيل",    email:"shifa@email.com",  products:[], orders:[], social:{ facebook:"", instagram:"", whatsapp:"07501234567" } },
  { id:"ph2", name:"صيدلية النور",    city:"السليمانية",  phone:"07701234568", license:"PH-2024-002", plan:"standard", active:true, revenue:2800000, joined:"2024-02-20", address:"شارع زانكو",         email:"noor@email.com",   products:[], orders:[], social:{ facebook:"", instagram:"", whatsapp:"07701234568" } },
  { id:"ph3", name:"صيدلية الأمل",    city:"دهوك",        phone:"07601234569", license:"PH-2024-003", plan:"free",     active:true, revenue:900000,  joined:"2024-03-10", address:"شارع بيروت، دهوك",   email:"amal@email.com",   products:[], orders:[], social:{ facebook:"", instagram:"", whatsapp:"07601234569" } },
  { id:"ph4", name:"صيدلية الخير",    city:"كركوك",       phone:"07801234570", license:"PH-2024-004", plan:"premium",  active:true, revenue:3100000, joined:"2024-04-01", address:"شارع التجار، كركوك", email:"kheir@email.com",  products:[], orders:[], social:{ facebook:"", instagram:"", whatsapp:"07801234570" } },
];
const DEFAULT_WAREHOUSES: any[] = [
  { id:"wh1", name:"مذخر الخليج",    city:"أربيل",       phone:"07501111111", license:"WH-2024-001", plan:"premium",  active:true, revenue:18500000, joined:"2024-01-10", address:"المنطقة الصناعية", email:"gulf@email.com",     linkedPharmacies:0, products:[], orders:[], social:{ facebook:"", instagram:"", whatsapp:"07501111111" } },
  { id:"wh2", name:"مذخر الرافدين",  city:"السليمانية",  phone:"07701111112", license:"WH-2024-002", plan:"standard", active:true, revenue:12200000, joined:"2024-02-05", address:"شارع التجار",       email:"rafidain@email.com", linkedPharmacies:0, products:[], orders:[], social:{ facebook:"", instagram:"", whatsapp:"07701111112" } },
  { id:"wh3", name:"مذخر زاگروس",    city:"دهوك",        phone:"07601111113", license:"WH-2024-003", plan:"premium",  active:true, revenue:21000000, joined:"2024-01-20", address:"شارع الشهداء",      email:"zagros@email.com",   linkedPharmacies:0, products:[], orders:[], social:{ facebook:"", instagram:"", whatsapp:"07601111113" } },
  { id:"wh4", name:"مذخر الشمال",    city:"كركوك",       phone:"07801111114", license:"WH-2024-004", plan:"free",     active:true, revenue:5400000,  joined:"2024-03-15", address:"منطقة أطلس",        email:"north@email.com",    linkedPharmacies:0, products:[], orders:[], social:{ facebook:"", instagram:"", whatsapp:"07801111114" } },
];
const DEFAULT_DELIVERIES: any[] = [
  { id:"dc1", name:"شركة الإسراع للتوصيل", city:"أربيل",      phone:"07501222222", license:"DL-2024-001", plan:"premium",  active:true, revenue:9800000,  joined:"2024-01-08", address:"شارع 60",       email:"speed@email.com", drivers:[], trips:[], rating:4.8, social:{ facebook:"", instagram:"", whatsapp:"07501222222" } },
  { id:"dc2", name:"توصيل الخليج",          city:"السليمانية", phone:"07701222223", license:"DL-2024-002", plan:"standard", active:true, revenue:6200000,  joined:"2024-02-12", address:"شارع بختياري", email:"gulf2@email.com", drivers:[], trips:[], rating:4.5, social:{ facebook:"", instagram:"", whatsapp:"07701222223" } },
  { id:"dc3", name:"شركة السهم السريع",      city:"دهوك",       phone:"07601222224", license:"DL-2024-003", plan:"premium",  active:true, revenue:12100000, joined:"2024-01-25", address:"شارع التحرير", email:"arrow@email.com", drivers:[], trips:[], rating:4.9, social:{ facebook:"", instagram:"", whatsapp:"07601222224" } },
  { id:"dc4", name:"نجوم التوصيل",           city:"كركوك",      phone:"07801222225", license:"DL-2024-004", plan:"free",     active:true, revenue:3400000,  joined:"2024-03-18", address:"شارع الثورة", email:"stars@email.com", drivers:[], trips:[], rating:4.2, social:{ facebook:"", instagram:"", whatsapp:"07801222225" } },
];

// ─── Read live data from shared localStorage (written by subscriber portals) ──
function readLiveDB() {
  const read = (key:string, def:any) => { try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch{ return def; } };
  const pharmacies = DEFAULT_PHARMACIES.map(def => {
    const profile  = read(`ph_profile_${def.id}`, def);
    const products = read(`ph_products_${def.id}`, def.products);
    const orders   = read(`ph_orders_${def.id}`, def.orders);
    const social   = read(`ph_social_${def.id}`, def.social);
    return { ...def, ...profile, products, orders, social };
  });
  const warehouses = DEFAULT_WAREHOUSES.map(def => {
    const profile  = read(`wh_profile_${def.id}`, def);
    const products = read(`wh_products_${def.id}`, def.products);
    const orders   = read(`wh_orders_${def.id}`, def.orders);
    const social   = read(`wh_social_${def.id}`, def.social);
    const pharmacies_linked = read(`wh_pharmacies_${def.id}`, []);
    return { ...def, ...profile, products, orders, social, linkedPharmacies: pharmacies_linked.filter((p:any)=>p.status==="active").length };
  });
  const deliveries = DEFAULT_DELIVERIES.map(def => {
    const profile = read(`dc_profile_${def.id}`, def);
    const drivers = read(`dc_drivers_${def.id}`, def.drivers);
    const trips   = read(`dc_trips_${def.id}`, def.trips);
    const social  = read(`dc_social_${def.id}`, def.social);
    const avgRating = drivers.length ? (drivers.reduce((s:number,d:any)=>s+(d.rating||0),0)/drivers.length) : def.rating;
    return { ...def, ...profile, drivers, trips, social, driverCount: drivers.length, rating: Math.round(avgRating*10)/10 };
  });
  return { pharmacies, warehouses, deliveries };
}

// ─── Types ────────────────────────────────────────────────────────────────────
const ADMIN = { phone:"admin", password:"admin", name:"مدير المنصة" };

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [logged, setLogged] = useState(false);
  const [db, setDB] = useState(() => readLiveDB());
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString("ar-IQ"));

  const refreshDB = useCallback(() => {
    setDB(readLiveDB());
    setLastSync(new Date().toLocaleTimeString("ar-IQ"));
  }, []);

  useEffect(() => {
    // Listen for updates from subscriber portals via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("dawapl_sync");
      bc.onmessage = () => refreshDB();
    } catch {}
    // Also poll every 15 seconds
    const interval = setInterval(refreshDB, 15000);
    return () => { bc?.close(); clearInterval(interval); };
  }, [refreshDB]);

  if (!logged) return <LoginScreen onLogin={() => setLogged(true)} />;
  return (
    <div dir="rtl" style={{ fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", minHeight:"100vh", background:C.bg }}>
      <AdminPortal db={db} lastSync={lastSync} onRefresh={refreshDB} onLogout={() => setLogged(false)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN — ADMIN ONLY
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin:()=>void }) {
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const handle = () => {
    if (phone.trim() === ADMIN.phone && pass.trim() === ADMIN.password) { setError(""); onLogin(); }
    else setError("بيانات الدخول غير صحيحة");
  };
  return (
    <div dir="rtl" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:C.bg, fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif" }}>
      <div style={{ background:`linear-gradient(135deg,${C.admin} 0%,#553C9A 100%)`, padding:"48px 24px 72px", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:8 }}>🛡️</div>
        <h1 style={{ color:"#fff", fontSize:32, fontWeight:900, margin:"8px 0 4px" }}>بوابة المدير</h1>
        <p style={{ color:"rgba(255,255,255,0.8)", fontSize:14, margin:0 }}>دواء+ — منظومة إدارة المنصة المتكاملة</p>
      </div>
      <div style={{ maxWidth:400, margin:"-36px auto 0", padding:"0 20px 40px", width:"100%" }}>
        <div style={{ background:C.surface, borderRadius:20, padding:"28px 24px", boxShadow:"0 8px 40px rgba(0,0,0,0.12)" }}>
          <h2 style={{ textAlign:"center", fontSize:18, fontWeight:800, margin:"0 0 20px" }}>دخول المدير</h2>
          <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:4 }}>المعرّف</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="admin"
            style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 14px", fontSize:14, boxSizing:"border-box", marginBottom:12 }} />
          <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:4 }}>كلمة المرور</label>
          <div style={{ position:"relative", marginBottom:12 }}>
            <input type={showPass?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••"
              style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 14px", paddingLeft:40, fontSize:14, boxSizing:"border-box" }} />
            <button onClick={()=>setShowPass(v=>!v)} style={{ position:"absolute", left:12, top:12, background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:16 }}>{showPass?"🙈":"👁️"}</button>
          </div>
          {error && <div style={{ background:"#FFF5F5", border:"1px solid #FED7D7", borderRadius:8, padding:"8px 12px", fontSize:13, color:C.red, marginBottom:12 }}>{error}</div>}
          <button onClick={handle} style={{ background:`linear-gradient(135deg,${C.admin},#553C9A)`, color:"#fff", border:"none", borderRadius:12, padding:"13px", fontWeight:800, cursor:"pointer", fontSize:15, width:"100%" }}>
            دخول المنصة →
          </button>
          <div style={{ marginTop:16, background:"#F3F0FF", borderRadius:10, padding:"10px 14px", fontSize:12, color:C.admin }}>
            🔐 هذه البوابة مخصصة لمدير المنصة فقط<br/>المشتركون يدخلون من مواقعهم الخاصة
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
const ADMIN_MENU = [
  {id:"dash",   label:"لوحة التحكم",   icon:"📊"},
  {id:"pharms", label:"الصيدليات",      icon:"💊"},
  {id:"wares",  label:"المذاخر",        icon:"🏭"},
  {id:"deliv",  label:"شركات التوصيل", icon:"🚛"},
  {id:"subs",   label:"الاشتراكات",    icon:"💎"},
  {id:"finance",label:"الإدارة المالية",icon:"💰"},
  {id:"announce",label:"الإعلانات",    icon:"📢"},
  {id:"social", label:"وسائل التواصل", icon:"📱"},
];

function AdminPortal({ db, lastSync, onRefresh, onLogout }:{ db:any; lastSync:string; onRefresh:()=>void; onLogout:()=>void }) {
  const [sec, setSec] = useState("dash");
  const [open, setOpen] = useState(true);
  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:open?220:60, background:"#1a202c", display:"flex", flexDirection:"column", transition:"width 0.2s", flexShrink:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 12px", borderBottom:"1px solid #2d3748", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:22, flexShrink:0 }}>🛡️</span>
          {open && <div style={{ flex:1 }}><div style={{ color:"#fff", fontSize:12, fontWeight:800 }}>بوابة المدير</div><div style={{ color:"#A0AEC0", fontSize:10 }}>دواء+ الإدارة المتكاملة</div></div>}
          <button onClick={()=>setOpen(v=>!v)} style={{ background:"none", border:"none", color:"#A0AEC0", cursor:"pointer", fontSize:16, flexShrink:0, marginRight:open?"0":"auto" }}>☰</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"6px 0" }}>
          {ADMIN_MENU.map(m=>(
            <button key={m.id} onClick={()=>setSec(m.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:sec===m.id?`${C.admin}25`:"none", border:"none", cursor:"pointer", textAlign:"right", borderRight:sec===m.id?`3px solid ${C.admin}`:"3px solid transparent" }}>
              <span style={{ fontSize:17, flexShrink:0 }}>{m.icon}</span>
              {open && <span style={{ color:sec===m.id?"#fff":"#A0AEC0", fontSize:13, fontWeight:sec===m.id?700:400, whiteSpace:"nowrap" }}>{m.label}</span>}
            </button>
          ))}
        </div>
        <button onClick={onLogout} style={{ padding:14, background:"none", border:"none", borderTop:"1px solid #2d3748", color:"#A0AEC0", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
          <span>🚪</span>{open && <span>تسجيل الخروج</span>}
        </button>
      </div>
      {/* Content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 20px", height:56, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div style={{ flex:1 }}><span style={{ fontWeight:800, fontSize:15 }}>{ADMIN_MENU.find(m=>m.id===sec)?.label}</span></div>
          <div style={{ fontSize:11, color:C.muted }}>آخر مزامنة: {lastSync}</div>
          <button onClick={onRefresh} style={{ background:`${C.admin}15`, color:C.admin, border:`1px solid ${C.admin}30`, borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>🔄 تحديث</button>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:`${C.admin}12`, borderRadius:20, padding:"5px 12px", border:`1px solid ${C.admin}30` }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:C.green, display:"block" }} />
            <span style={{ fontSize:11, color:C.admin, fontWeight:700 }}>📡 متزامن مع المنصات</span>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:20 }}>
          {sec==="dash"     && <AdminDash    db={db} />}
          {sec==="pharms"   && <AdminPharms  db={db} />}
          {sec==="wares"    && <AdminWares   db={db} />}
          {sec==="deliv"    && <AdminDeliv   db={db} />}
          {sec==="subs"     && <AdminSubs    db={db} />}
          {sec==="finance"  && <AdminFin     db={db} />}
          {sec==="announce" && <AdminAnn />}
          {sec==="social"   && <AdminSocial  db={db} />}
        </div>
      </div>
    </div>
  );
}

function AdminDash({ db }:{ db:any }) {
  const totalRev = [...db.pharmacies,...db.warehouses,...db.deliveries].reduce((s:number,a:any)=>s+a.revenue,0);
  const totalProducts = db.pharmacies.reduce((s:number,p:any)=>s+p.products.length,0) + db.warehouses.reduce((s:number,w:any)=>s+w.products.length,0);
  const totalOrders = db.pharmacies.reduce((s:number,p:any)=>s+p.orders.length,0) + db.warehouses.reduce((s:number,w:any)=>s+w.orders.length,0);
  return (
    <div>
      <SyncNote text="البيانات تتحدث تلقائياً من بوابات المشتركين — ما يغيّره المشترك يظهر هنا فوراً" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:20 }}>
        <Stat icon="💊" label="صيدلية نشطة"     value={db.pharmacies.filter((p:any)=>p.active).length}  change="+4 جديدة" color={C.pharmacy}  />
        <Stat icon="🏭" label="مذخر نشط"         value={db.warehouses.filter((w:any)=>w.active).length}  change="+2 جديد"  color={C.warehouse} />
        <Stat icon="🚛" label="شركة توصيل"       value={db.deliveries.filter((d:any)=>d.active).length}  color={C.delivery} />
        <Stat icon="💰" label="إجمالي الإيرادات"  value={`${(totalRev/1000000).toFixed(1)}M د.ع`}        change="+18%" color={C.admin} />
        <Stat icon="📦" label="منتج في المنصة"    value={totalProducts}   color={C.warehouse} />
        <Stat icon="🛒" label="طلب مسجّل"         value={totalOrders}     color={C.pharmacy} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:14 }}>
        <Card>
          <H icon="💊" title="الصيدليات" />
          {db.pharmacies.map((p:any)=>(
            <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
              <div><div style={{ fontWeight:700, fontSize:12 }}>{p.name}</div><div style={{ fontSize:10, color:C.muted }}>{p.city} · {p.products.length} منتج · {p.orders.length} طلب</div></div>
              <Bdg {...planBadge(p.plan)} />
            </div>
          ))}
        </Card>
        <Card>
          <H icon="🏭" title="المذاخر" />
          {db.warehouses.map((w:any)=>(
            <div key={w.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
              <div><div style={{ fontWeight:700, fontSize:12 }}>{w.name}</div><div style={{ fontSize:10, color:C.muted }}>{w.city} · {w.products.length} صنف · {w.linkedPharmacies} صيدلية</div></div>
              <Bdg {...planBadge(w.plan)} />
            </div>
          ))}
        </Card>
        <Card>
          <H icon="🚛" title="شركات التوصيل" />
          {db.deliveries.map((d:any)=>(
            <div key={d.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
              <div><div style={{ fontWeight:700, fontSize:12 }}>{d.name}</div><div style={{ fontSize:10, color:C.muted }}>{d.rating}★ · {d.driverCount||d.drivers?.length||0} سائق</div></div>
              <Bdg {...planBadge(d.plan)} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function AdminPharms({ db }:{ db:any }) {
  const [sel, setSel] = useState<string|null>(null);
  const ph = sel ? db.pharmacies.find((p:any)=>p.id===sel) : null;
  return (
    <div>
      <SyncNote text="بيانات الصيدليات مُغذَّاة مباشرة من بواباتهم الخاصة — أي تعديل يظهر هنا تلقائياً" />
      <div style={{ display:"flex", gap:14 }}>
        <div style={{ flex:1 }}>
          <Card>
            <H icon="💊" title={`جميع الصيدليات (${db.pharmacies.length})`} />
            <AdminTable color={C.pharmacy} rows={db.pharmacies} onSelect={setSel} selected={sel}
              cols={[{k:"name",l:"الصيدلية"},{k:"city",l:"المدينة"},{k:"phone",l:"الهاتف"},{k:"plan",l:"الاشتراك"},{k:"active",l:"الحالة"},{k:"revenue",l:"الإيراد"},{k:"joined",l:"الانضمام"}]} />
          </Card>
        </div>
        {ph && <div style={{ width:300, flexShrink:0 }}>
          <Card>
            <H icon="🔍" title={ph.name} />
            <div style={{ fontSize:12, color:C.muted, lineHeight:1.8 }}>
              <div>📍 {ph.city} — {ph.address}</div>
              <div>📞 {ph.phone}</div>
              <div>📧 {ph.email}</div>
              <div>📋 {ph.license}</div>
              <div>💎 خطة: <strong>{ph.plan}</strong></div>
              <div>💰 إيراد: <strong>{ph.revenue?.toLocaleString()} د.ع</strong></div>
              <div>📦 منتجات: <strong>{ph.products?.length}</strong></div>
              <div>🛒 طلبات: <strong>{ph.orders?.length}</strong></div>
            </div>
            {ph.products?.length > 0 && <>
              <div style={{ fontWeight:700, fontSize:12, marginTop:12, marginBottom:6 }}>📦 المخزون:</div>
              {ph.products.map((p:any,i:number)=>(
                <div key={i} style={{ fontSize:11, padding:"4px 0", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
                  <span>{p.name}</span><span style={{ color:p.qty<10?C.red:C.green, fontWeight:700 }}>{p.qty} {p.unit}</span>
                </div>
              ))}
            </>}
          </Card>
        </div>}
      </div>
    </div>
  );
}

function AdminWares({ db }:{ db:any }) {
  const [sel, setSel] = useState<string|null>(null);
  const wh = sel ? db.warehouses.find((w:any)=>w.id===sel) : null;
  return (
    <div>
      <SyncNote text="بيانات المذاخر مُغذَّاة مباشرة من بواباتهم الخاصة" />
      <div style={{ display:"flex", gap:14 }}>
        <div style={{ flex:1 }}>
          <Card>
            <H icon="🏭" title={`جميع المذاخر (${db.warehouses.length})`} />
            <AdminTable color={C.warehouse} rows={db.warehouses} onSelect={setSel} selected={sel}
              cols={[{k:"name",l:"المذخر"},{k:"city",l:"المدينة"},{k:"phone",l:"الهاتف"},{k:"plan",l:"الاشتراك"},{k:"active",l:"الحالة"},{k:"linkedPharmacies",l:"صيدليات"},{k:"revenue",l:"الإيراد"}]} />
          </Card>
        </div>
        {wh && <div style={{ width:300, flexShrink:0 }}>
          <Card>
            <H icon="🔍" title={wh.name} />
            <div style={{ fontSize:12, color:C.muted, lineHeight:1.8 }}>
              <div>📍 {wh.city} — {wh.address}</div>
              <div>📞 {wh.phone}</div>
              <div>📧 {wh.email}</div>
              <div>💎 خطة: <strong>{wh.plan}</strong></div>
              <div>💰 إيراد: <strong>{wh.revenue?.toLocaleString()} د.ع</strong></div>
              <div>📦 أصناف: <strong>{wh.products?.length}</strong></div>
              <div>🤝 صيدليات مرتبطة: <strong>{wh.linkedPharmacies}</strong></div>
            </div>
            {wh.products?.length > 0 && <>
              <div style={{ fontWeight:700, fontSize:12, marginTop:12, marginBottom:6 }}>📦 المخزون:</div>
              {wh.products.slice(0,5).map((p:any,i:number)=>(
                <div key={i} style={{ fontSize:11, padding:"4px 0", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
                  <span>{p.name}</span><span style={{ color:p.qty<20?C.red:C.green, fontWeight:700 }}>{p.qty} {p.unit}</span>
                </div>
              ))}
              {wh.products.length > 5 && <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>+ {wh.products.length-5} أصناف أخرى</div>}
            </>}
          </Card>
        </div>}
      </div>
    </div>
  );
}

function AdminDeliv({ db }:{ db:any }) {
  const [sel, setSel] = useState<string|null>(null);
  const dl = sel ? db.deliveries.find((d:any)=>d.id===sel) : null;
  return (
    <div>
      <SyncNote text="بيانات شركات التوصيل مُغذَّاة من بواباتهم — الرحلات والسائقون يتحدثون تلقائياً" />
      <div style={{ display:"flex", gap:14 }}>
        <div style={{ flex:1 }}>
          <Card>
            <H icon="🚛" title={`شركات التوصيل (${db.deliveries.length})`} />
            <AdminTable color={C.delivery} rows={db.deliveries.map((d:any)=>({...d,drivers:d.driverCount||d.drivers?.length||0}))} onSelect={setSel} selected={sel}
              cols={[{k:"name",l:"الشركة"},{k:"city",l:"المدينة"},{k:"phone",l:"الهاتف"},{k:"plan",l:"الاشتراك"},{k:"active",l:"الحالة"},{k:"drivers",l:"السائقون"},{k:"rating",l:"التقييم"}]} />
          </Card>
        </div>
        {dl && <div style={{ width:300, flexShrink:0 }}>
          <Card>
            <H icon="🔍" title={dl.name} />
            <div style={{ fontSize:12, color:C.muted, lineHeight:1.8 }}>
              <div>📍 {dl.city} — {dl.address}</div>
              <div>📞 {dl.phone}</div>
              <div>📧 {dl.email}</div>
              <div>💎 خطة: <strong>{dl.plan}</strong></div>
              <div>💰 إيراد: <strong>{dl.revenue?.toLocaleString()} د.ع</strong></div>
              <div>👨‍✈️ سائقون: <strong>{dl.driverCount||dl.drivers?.length||0}</strong></div>
              <div>⭐ تقييم: <strong>{dl.rating}</strong></div>
              <div>🗺️ رحلات: <strong>{dl.trips?.length||0}</strong></div>
            </div>
            {dl.drivers?.length > 0 && <>
              <div style={{ fontWeight:700, fontSize:12, marginTop:12, marginBottom:6 }}>👨‍✈️ السائقون:</div>
              {dl.drivers.slice(0,4).map((d:any,i:number)=>(
                <div key={i} style={{ fontSize:11, padding:"4px 0", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
                  <span>{d.name}</span>
                  <span style={{ color:d.status==="active"?C.green:C.muted, fontWeight:700 }}>⭐{d.rating||"—"} · {d.status==="active"?"متاح":"غير متاح"}</span>
                </div>
              ))}
            </>}
          </Card>
        </div>}
      </div>
    </div>
  );
}

function AdminSubs({ db }:{ db:any }) {
  const all = [
    ...db.pharmacies.map((p:any)=>({...p,type:"صيدلية",tc:C.pharmacy,ti:"💊"})),
    ...db.warehouses.map((w:any)=>({...w,type:"مذخر",tc:C.warehouse,ti:"🏭"})),
    ...db.deliveries.map((d:any)=>({...d,type:"شركة توصيل",tc:C.delivery,ti:"🚛"})),
  ];
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
        {[{l:"بريميوم",v:all.filter(a=>a.plan==="premium").length,c:"#7C3AED"},
          {l:"ستاندرد",v:all.filter(a=>a.plan==="standard").length,c:C.blue},
          {l:"مجاني",v:all.filter(a=>a.plan==="free").length,c:C.muted},
          {l:"الكل",v:all.length,c:C.text}].map(s=>(
          <Card key={s.l} style={{ textAlign:"center", borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:26, fontWeight:900, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:12, color:C.muted }}>{s.l}</div>
          </Card>
        ))}
      </div>
      <Card>
        <H icon="💎" title="جميع الاشتراكات" />
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ background:C.bg }}>
            {["النوع","الاسم","المدينة","الاشتراك","الحالة","الإيراد","تاريخ الانضمام"].map(h=>(
              <th key={h} style={{ padding:"9px 12px", textAlign:"right", color:C.muted, borderBottom:`2px solid ${C.border}` }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{all.map((a,i)=>(
            <tr key={i} style={{ borderBottom:`1px solid ${C.border}`, background:i%2?C.bg:C.surface }}>
              <td style={{ padding:"9px 12px" }}><Bdg label={`${a.ti} ${a.type}`} color={a.tc} bg={`${a.tc}15`} /></td>
              <td style={{ padding:"9px 12px", fontWeight:700 }}>{a.name}</td>
              <td style={{ padding:"9px 12px", color:C.muted }}>{a.city}</td>
              <td style={{ padding:"9px 12px" }}><Bdg {...planBadge(a.plan)} /></td>
              <td style={{ padding:"9px 12px" }}><Bdg label={a.active?"نشط":"معطّل"} color={a.active?C.green:C.red} bg={a.active?"#F0FFF4":"#FFF5F5"} /></td>
              <td style={{ padding:"9px 12px", fontWeight:700, color:C.green }}>{a.revenue?.toLocaleString()} د.ع</td>
              <td style={{ padding:"9px 12px", color:C.muted }}>{a.joined}</td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>
  );
}

function AdminFin({ db }:{ db:any }) {
  const total = [...db.pharmacies,...db.warehouses,...db.deliveries].reduce((s:number,a:any)=>s+a.revenue,0);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:16 }}>
        <Stat icon="💰" label="إجمالي الإيرادات" value={`${(total/1000000).toFixed(1)}M`} change="+18%" color={C.admin} />
        <Stat icon="💊" label="إيرادات الصيدليات" value={`${(db.pharmacies.reduce((s:number,p:any)=>s+p.revenue,0)/1000000).toFixed(1)}M`} color={C.pharmacy} />
        <Stat icon="🏭" label="إيرادات المذاخر"   value={`${(db.warehouses.reduce((s:number,w:any)=>s+w.revenue,0)/1000000).toFixed(1)}M`} color={C.warehouse} />
        <Stat icon="🚛" label="إيرادات التوصيل"   value={`${(db.deliveries.reduce((s:number,d:any)=>s+d.revenue,0)/1000000).toFixed(1)}M`} color={C.delivery} />
      </div>
      <Card>
        <H icon="🏦" title="الإيرادات حسب الحساب" />
        {[...db.pharmacies,...db.warehouses,...db.deliveries].map((a:any,i:number)=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
            <span style={{ fontWeight:700, fontSize:13 }}>{a.name}</span>
            <span style={{ fontWeight:800, color:C.green, fontSize:14 }}>{a.revenue?.toLocaleString()} د.ع</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AdminAnn() {
  const [form, setForm] = useState({ title:"", body:"", target:"all" });
  const [anns, setAnns] = useState([
    { title:"تحديث نظام الاشتراكات", body:"سيتم التحديث في 15 أبريل 2025", target:"all",      date:"2025-04-01", pub:true },
    { title:"رسوم التوصيل الجديدة",  body:"تحديث جدول الرسوم بدءاً من مايو", target:"delivery", date:"2025-04-03", pub:true },
  ]);
  const publish = () => {
    if (!form.title || !form.body) return;
    setAnns(prev=>[{ title:form.title, body:form.body, target:form.target, date:new Date().toISOString().slice(0,10), pub:true }, ...prev]);
    setForm({ title:"", body:"", target:"all" });
  };
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      <Card>
        <H icon="✍️" title="إنشاء إعلان جديد" />
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="عنوان الإعلان"
            style={{ border:`1px solid ${C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13 }} />
          <textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="نص الإعلان..." rows={3}
            style={{ border:`1px solid ${C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13, resize:"vertical" }} />
          <select value={form.target} onChange={e=>setForm({...form,target:e.target.value})}
            style={{ border:`1px solid ${C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13 }}>
            <option value="all">للجميع</option>
            <option value="pharmacy">الصيدليات فقط</option>
            <option value="warehouse">المذاخر فقط</option>
            <option value="delivery">شركات التوصيل فقط</option>
          </select>
          <button onClick={publish} style={{ background:C.admin, color:"#fff", border:"none", borderRadius:9, padding:11, fontWeight:700, cursor:"pointer" }}>
            📢 نشر الإعلان
          </button>
        </div>
      </Card>
      <Card>
        <H icon="📋" title={`الإعلانات (${anns.length})`} />
        {anns.map((a,i)=>(
          <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontWeight:700, fontSize:13 }}>{a.title}</span>
              <Bdg label={a.pub?"منشور":"مسودة"} color={a.pub?C.green:C.muted} bg={a.pub?"#F0FFF4":"#EDF2F7"} />
            </div>
            <div style={{ fontSize:12, color:C.muted }}>{a.body}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>الاستهداف: {a.target==="all"?"الجميع":a.target} · {a.date}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AdminSocial({ db }:{ db:any }) {
  const ALL = [
    ...db.pharmacies.map((p:any)=>({...p,type:"صيدلية",tc:C.pharmacy,ti:"💊"})),
    ...db.warehouses.map((w:any)=>({...w,type:"مذخر",tc:C.warehouse,ti:"🏭"})),
    ...db.deliveries.map((d:any)=>({...d,type:"شركة توصيل",tc:C.delivery,ti:"🚛"})),
  ];
  const hasSocial = (s:any) => s?.facebook||s?.instagram||s?.tiktok||s?.website;
  return (
    <div>
      <SyncNote text="روابط التواصل الاجتماعي مُدارة من قِبل كل مشترك في بوابته — تظهر في تطبيق دواء+" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
        {ALL.map((a:any,i:number)=>(
          <Card key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:14 }}>{a.ti} {a.name}</div>
                <div style={{ fontSize:11, color:C.muted }}>{a.city} · {a.type}</div>
              </div>
              <Bdg {...planBadge(a.plan)} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {a.social?.facebook  && <a href={`https://facebook.com/${a.social.facebook}`} target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#1877F2", textDecoration:"none", display:"flex", gap:4, alignItems:"center" }}>📘 Facebook: {a.social.facebook}</a>}
              {a.social?.instagram && <a href={`https://instagram.com/${a.social.instagram}`} target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#E4405F", textDecoration:"none", display:"flex", gap:4, alignItems:"center" }}>📸 Instagram: @{a.social.instagram}</a>}
              {a.social?.tiktok    && <a href={`https://tiktok.com/@${a.social.tiktok}`} target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#010101", textDecoration:"none", display:"flex", gap:4, alignItems:"center" }}>🎵 TikTok: @{a.social.tiktok}</a>}
              {a.social?.website   && <a href={a.social.website.startsWith("http")?a.social.website:`https://${a.social.website}`} target="_blank" rel="noreferrer" style={{ fontSize:12, color:C.blue, textDecoration:"none", display:"flex", gap:4, alignItems:"center" }}>🌐 الموقع: {a.social.website}</a>}
              {a.social?.whatsapp  && <a href={`https://wa.me/${a.social.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#25D366", textDecoration:"none", display:"flex", gap:4, alignItems:"center" }}>💬 WhatsApp: {a.social.whatsapp}</a>}
              {!hasSocial(a.social) && <div style={{ fontSize:12, color:C.muted }}>لم يُضف بعد</div>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Admin Table ──────────────────────────────────────────────────────────────
function AdminTable({ rows, cols, color, onSelect, selected }:{ rows:any[]; cols:{k:string;l:string}[]; color:string; onSelect?:(id:string|null)=>void; selected?:string|null }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead>
          <tr style={{ background:C.bg }}>
            {cols.map(c=><th key={c.k} style={{ padding:"9px 12px", textAlign:"right", color:C.muted, borderBottom:`2px solid ${C.border}`, fontWeight:600 }}>{c.l}</th>)}
            <th style={{ padding:"9px 12px", borderBottom:`2px solid ${C.border}` }}>تفاصيل</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} style={{ borderBottom:`1px solid ${C.border}`, background:r.id===selected?`${color}10`:i%2?C.bg:C.surface }}>
              {cols.map(c=>(
                <td key={c.k} style={{ padding:"9px 12px" }}>
                  {c.k==="plan" ? <Bdg {...planBadge(r[c.k])} /> :
                   c.k==="active" ? <Bdg label={r[c.k]?"نشط":"معطّل"} color={r[c.k]?C.green:C.red} bg={r[c.k]?"#F0FFF4":"#FFF5F5"} /> :
                   c.k==="revenue" ? `${Number(r[c.k]||0).toLocaleString()} د.ع` : String(r[c.k]||"—")}
                </td>
              ))}
              <td style={{ padding:"9px 12px" }}>
                <button onClick={()=>onSelect?.(r.id===selected?null:r.id)}
                  style={{ background:`${color}15`, color, borderRadius:7, padding:"3px 9px", fontSize:11, fontWeight:700, cursor:"pointer", border:"none" }}>
                  {r.id===selected?"إخفاء":"عرض"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────
function Stat({ icon, label, value, change, color }:any) {
  return (
    <div style={{ background:C.surface, borderRadius:14, padding:"16px 18px", borderTop:`3px solid ${color}`, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:22 }}>{icon}</span>
        {change && <span style={{ fontSize:10, color:C.green, fontWeight:700, background:"#F0FFF4", borderRadius:6, padding:"2px 7px" }}>{change}</span>}
      </div>
      <div style={{ fontSize:20, fontWeight:900, color:C.text }}>{value}</div>
      <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{label}</div>
    </div>
  );
}
function Bdg({ label, l, color, c, bg, b }:any) {
  return <span style={{ background:bg||b, color:color||c, borderRadius:7, padding:"2px 9px", fontSize:11, fontWeight:700 }}>{label||l}</span>;
}
function Card({ children, style }:any) {
  return <div style={{ background:C.surface, borderRadius:14, padding:18, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", ...style }}>{children}</div>;
}
function SyncNote({ text }:{ text:string }) {
  return (
    <div style={{ background:"#F3F0FF", border:"1px solid #C4B5FD", borderRadius:10, padding:"9px 14px", display:"flex", gap:8, alignItems:"center", marginBottom:14 }}>
      <span>📡</span>
      <span style={{ fontSize:12, color:"#5B21B6" }}>{text}</span>
    </div>
  );
}
function H({ icon, title }:any) {
  return <h3 style={{ fontSize:15, fontWeight:800, color:C.text, margin:"0 0 14px", display:"flex", alignItems:"center", gap:7 }}><span>{icon}</span>{title}</h3>;
}
const planBadge = (p:string) => p==="premium"
  ? { label:"بريميوم ✨", l:"بريميوم ✨", color:"#7C3AED", c:"#7C3AED", bg:"#F3F0FF", b:"#F3F0FF" }
  : p==="standard"
  ? { label:"ستاندرد", l:"ستاندرد", color:C.blue, c:C.blue, bg:"#EBF8FF", b:"#EBF8FF" }
  : { label:"مجاني", l:"مجاني", color:C.muted, c:C.muted, bg:"#EDF2F7", b:"#EDF2F7" };

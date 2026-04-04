import { useState, createContext, useContext } from "react";

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  admin:"#7C3AED", pharmacy:"#1A9E6E", warehouse:"#0D7A54", delivery:"#D69E2E",
  text:"#1a202c", muted:"#718096", border:"#e2e8f0", bg:"#f7fafc", surface:"#fff",
  red:"#E53E3E", green:"#38A169", blue:"#3182CE", orange:"#DD6B20",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "admin"|"pharmacy"|"warehouse"|"delivery";
interface User { id:string; role:Role; name:string; phone:string; password:string; }
interface PharmacyData { id:string; userId:string; name:string; city:string; phone:string;
  license:string; plan:string; active:boolean; products:Product[]; orders:Order[];
  revenue:number; joined:string; address:string; email:string; }
interface WarehouseData { id:string; userId:string; name:string; city:string; phone:string;
  plan:string; active:boolean; products:Product[]; orders:Order[]; linkedPharmacies:number;
  revenue:number; joined:string; address:string; email:string; }
interface DeliveryData { id:string; userId:string; name:string; city:string; phone:string;
  plan:string; active:boolean; drivers:number; trips:Trip[]; rating:number;
  revenue:number; joined:string; address:string; email:string; }
interface Product { id:string; name:string; qty:number; price:number; expiry:string; unit:string; }
interface Order  { id:string; product:string; amount:number; status:string; date:string; customer:string; }
interface Trip   { id:string; from:string; to:string; status:string; amount:number; date:string; driver:string; }
interface DB { pharmacies:PharmacyData[]; warehouses:WarehouseData[]; deliveries:DeliveryData[]; }

// ─── Initial DB ───────────────────────────────────────────────────────────────
const INITIAL_DB: DB = {
  pharmacies:[
    { id:"ph1", userId:"u_ph1", name:"صيدلية الشفاء",  city:"أربيل",      phone:"07501234567", license:"PH-20240115",
      plan:"premium", active:true, revenue:4200000, joined:"2024-01-15", address:"شارع 100، أربيل", email:"shifa@email.com",
      products:[
        { id:"p1", name:"باراسيتامول 500mg",  qty:12,  price:3500,  expiry:"2025-08-01", unit:"علبة" },
        { id:"p2", name:"أموكسيسيلين 500mg",  qty:8,   price:4200,  expiry:"2025-06-15", unit:"علبة" },
        { id:"p3", name:"فيتامين C 1000mg",   qty:34,  price:2800,  expiry:"2026-01-01", unit:"علبة" },
        { id:"p4", name:"أنسولين نوفوميكس",   qty:20,  price:15000, expiry:"2025-05-20", unit:"قارورة" },
      ],
      orders:[
        { id:"#1041", product:"باراسيتامول × 3", amount:10500, status:"processing", date:"2025-04-04", customer:"أحمد علي" },
        { id:"#1040", product:"فيتامين C × 5",   amount:14000, status:"completed",  date:"2025-04-03", customer:"سارة محمد" },
        { id:"#1039", product:"أنسولين",          amount:15000, status:"new",        date:"2025-04-03", customer:"كريم حسن" },
        { id:"#1038", product:"أموكسيسيلين × 2",  amount:8400,  status:"cancelled",  date:"2025-04-02", customer:"نور خالد" },
      ]},
    { id:"ph2", userId:"u_ph2", name:"صيدلية النور",   city:"السليمانية", phone:"07701234568", license:"PH-20240220",
      plan:"standard", active:true, revenue:2800000, joined:"2024-02-20", address:"شارع زانكو، السليمانية", email:"noor@email.com",
      products:[
        { id:"p5", name:"ميتفورمين 850mg", qty:5,  price:5800, expiry:"2025-09-30", unit:"علبة" },
        { id:"p6", name:"أسبرين 100mg",   qty:28, price:1800, expiry:"2026-03-01", unit:"علبة" },
      ],
      orders:[
        { id:"#2041", product:"ميتفورمين × 2", amount:11600, status:"new",       date:"2025-04-04", customer:"ليلى أحمد" },
        { id:"#2040", product:"أسبرين × 10",   amount:18000, status:"completed", date:"2025-04-02", customer:"عمر يوسف" },
      ]},
    { id:"ph3", userId:"u_ph3", name:"صيدلية الأمل",   city:"دهوك",       phone:"07601234569", license:"PH-20240310",
      plan:"free", active:true, revenue:900000, joined:"2024-03-10", address:"شارع بيروت، دهوك", email:"amal@email.com",
      products:[
        { id:"p7", name:"سيتريزين 10mg", qty:45, price:2200, expiry:"2026-06-01", unit:"علبة" },
      ],
      orders:[
        { id:"#3041", product:"سيتريزين × 3", amount:6600, status:"completed", date:"2025-04-03", customer:"هديل فاروق" },
      ]},
  ],
  warehouses:[
    { id:"wh1", userId:"u_wh1", name:"مذخر الشمال", city:"أربيل",      phone:"07501234571",
      plan:"premium", active:true, revenue:18700000, joined:"2023-11-01", linkedPharmacies:89,
      address:"المنطقة الصناعية، أربيل", email:"north@email.com",
      products:[
        { id:"wp1", name:"باراسيتامول 500mg (كرتون)", qty:340, price:280000, expiry:"2025-12-01", unit:"كرتون" },
        { id:"wp2", name:"أموكسيسيلين 500mg (كرتون)", qty:180, price:320000, expiry:"2025-10-15", unit:"كرتون" },
        { id:"wp3", name:"أنسولين نوفوميكس",          qty:200, price:120000, expiry:"2025-08-01", unit:"صندوق" },
      ],
      orders:[
        { id:"#W1041", product:"باراسيتامول × 50 كرتون", amount:14000000, status:"processing", date:"2025-04-04", customer:"صيدلية الشفاء" },
        { id:"#W1040", product:"أموكسيسيلين × 30 كرتون", amount:9600000,  status:"completed",  date:"2025-04-03", customer:"صيدلية النور" },
      ]},
    { id:"wh2", userId:"u_wh2", name:"مذخر الوسط",  city:"السليمانية", phone:"07701234572",
      plan:"standard", active:true, revenue:9200000, joined:"2024-01-10", linkedPharmacies:45,
      address:"شارع التجار، السليمانية", email:"middle@email.com",
      products:[
        { id:"wp4", name:"ميتفورمين 850mg (كرتون)", qty:90, price:420000, expiry:"2026-01-01", unit:"كرتون" },
      ],
      orders:[
        { id:"#W2041", product:"ميتفورمين × 20 كرتون", amount:8400000, status:"new", date:"2025-04-04", customer:"صيدلية الأمل" },
      ]},
  ],
  deliveries:[
    { id:"dl1", userId:"u_dl1", name:"نجم إكسبرس",   city:"أربيل",      phone:"07501234574",
      plan:"premium", active:true, revenue:2100000, joined:"2023-12-01", drivers:23, rating:4.7,
      address:"مجمع ستار، أربيل", email:"najm@email.com",
      trips:[
        { id:"#D881", from:"أربيل مركز", to:"شارع 100، أربيل",    status:"active",    amount:5000,  date:"2025-04-04", driver:"محمد أمين" },
        { id:"#D880", from:"زانكو",      to:"عينكاوا، أربيل",      status:"completed", amount:7000,  date:"2025-04-04", driver:"كاروان علي" },
        { id:"#D879", from:"صلاح الدين", to:"دهوك المركز",         status:"pending",   amount:12000, date:"2025-04-03", driver:"سردار محمد" },
      ]},
    { id:"dl2", userId:"u_dl2", name:"سريع للتوصيل", city:"السليمانية", phone:"07701234575",
      plan:"standard", active:true, revenue:1400000, joined:"2024-01-20", drivers:14, rating:4.4,
      address:"شارع بيكار، السليمانية", email:"sari3@email.com",
      trips:[
        { id:"#D201", from:"السليمانية", to:"شارع زانكو",   status:"completed", amount:4500, date:"2025-04-04", driver:"هاوكار أحمد" },
        { id:"#D200", from:"كويسنجق",    to:"السليمانية",   status:"active",    amount:8000, date:"2025-04-03", driver:"شيرزاد علي" },
      ]},
  ],
};

const USERS: User[] = [
  { id:"u_admin", role:"admin",    name:"مدير المنصة",    phone:"admin",       password:"admin" },
  { id:"u_ph1",   role:"pharmacy", name:"صيدلية الشفاء",  phone:"07501234567", password:"ph1" },
  { id:"u_ph2",   role:"pharmacy", name:"صيدلية النور",   phone:"07701234568", password:"ph2" },
  { id:"u_ph3",   role:"pharmacy", name:"صيدلية الأمل",   phone:"07601234569", password:"ph3" },
  { id:"u_wh1",   role:"warehouse",name:"مذخر الشمال",    phone:"07501234571", password:"wh1" },
  { id:"u_wh2",   role:"warehouse",name:"مذخر الوسط",     phone:"07701234572", password:"wh2" },
  { id:"u_dl1",   role:"delivery", name:"نجم إكسبرس",    phone:"07501234574", password:"dl1" },
  { id:"u_dl2",   role:"delivery", name:"سريع للتوصيل",  phone:"07701234575", password:"dl2" },
];

// ─── Context ──────────────────────────────────────────────────────────────────
const DBCtx = createContext<{ db:DB; setDB:React.Dispatch<React.SetStateAction<DB>> }>({} as any);
const useDB = () => useContext(DBCtx);

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [db, setDB] = useState<DB>(INITIAL_DB);
  const [user, setUser]   = useState<User|null>(null);
  const logout = () => setUser(null);
  return (
    <DBCtx.Provider value={{ db, setDB }}>
      <div dir="rtl" style={{ fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", minHeight:"100vh", background:C.bg }}>
        {!user
          ? <LoginScreen onLogin={setUser} />
          : user.role==="admin"
          ? <AdminPortal    user={user} onLogout={logout} />
          : user.role==="pharmacy"
          ? <PharmacyPortal user={user} onLogout={logout} />
          : user.role==="warehouse"
          ? <WarehousePortal user={user} onLogout={logout} />
          : <DeliveryPortal  user={user} onLogout={logout} />
        }
      </div>
    </DBCtx.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin:(u:User)=>void }) {
  const [phone, setPhone]   = useState("");
  const [pass,  setPass]    = useState("");
  const [error, setError]   = useState("");
  const [showPass, setShowPass] = useState(false);

  const roleColor:Record<Role,string> = { admin:C.admin, pharmacy:C.pharmacy, warehouse:C.warehouse, delivery:C.delivery };
  const roleIcon:Record<Role,string>  = { admin:"🛡️", pharmacy:"💊", warehouse:"🏭", delivery:"🚛" };

  const handleLogin = () => {
    const u = USERS.find(u => u.phone===phone.trim() && u.password===pass.trim());
    if (u) { setError(""); onLogin(u); }
    else setError("رقم الهاتف أو كلمة المرور غير صحيحة");
  };

  const quickLogin = (u:User) => onLogin(u);

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:C.bg }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${C.admin} 0%,#553C9A 100%)`, padding:"40px 24px 60px", textAlign:"center" }}>
        <div style={{ fontSize:52 }}>💊</div>
        <h1 style={{ color:"#fff", fontSize:34, fontWeight:900, margin:"8px 0 4px" }}>دواء +</h1>
        <p style={{ color:"rgba(255,255,255,0.8)", fontSize:14, margin:0 }}>منظومة الإدارة المتكاملة — كردستان والعراق</p>
      </div>

      <div style={{ maxWidth:440, margin:"-30px auto 0", padding:"0 20px 40px", width:"100%" }}>
        {/* Login Card */}
        <div style={{ background:C.surface, borderRadius:20, padding:"28px 24px", boxShadow:"0 8px 40px rgba(0,0,0,0.12)", marginBottom:20 }}>
          <h2 style={{ textAlign:"center", fontSize:18, fontWeight:800, margin:"0 0 20px", color:C.text }}>تسجيل الدخول</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:4 }}>رقم الهاتف / معرّف الحساب</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="07xxxxxxxxx"
                style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 14px",
                  fontSize:14, boxSizing:"border-box", outline:"none" }} />
            </div>
            <div style={{ position:"relative" }}>
              <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:4 }}>كلمة المرور</label>
              <input type={showPass?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••••"
                style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 14px",
                  paddingLeft:40, fontSize:14, boxSizing:"border-box", outline:"none" }} />
              <button onClick={()=>setShowPass(v=>!v)} style={{ position:"absolute", left:12, top:32, background:"none",
                border:"none", cursor:"pointer", color:C.muted, fontSize:16 }}>{showPass?"🙈":"👁️"}</button>
            </div>
            {error && <div style={{ background:"#FFF5F5", border:"1px solid #FED7D7", borderRadius:8, padding:"8px 12px",
              fontSize:13, color:C.red }}>{error}</div>}
            <button onClick={handleLogin} style={{ background:`linear-gradient(135deg,${C.admin},#553C9A)`,
              color:"#fff", border:"none", borderRadius:12, padding:"13px", fontWeight:800, cursor:"pointer", fontSize:15 }}>
              دخول →
            </button>
          </div>
        </div>

        {/* Demo accounts */}
        <div style={{ background:C.surface, borderRadius:16, padding:"18px 20px", boxShadow:"0 4px 16px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:12, fontWeight:800, color:C.muted, marginBottom:12, textAlign:"center" }}>
            🔑 حسابات تجريبية — اضغط للدخول الفوري
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {USERS.map(u=>(
              <button key={u.id} onClick={()=>quickLogin(u)}
                style={{ background:`${roleColor[u.role]}10`, border:`1.5px solid ${roleColor[u.role]}30`,
                  borderRadius:10, padding:"8px 10px", cursor:"pointer", textAlign:"right", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:16 }}>{roleIcon[u.role]}</span>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:roleColor[u.role] }}>{u.name}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{u.phone}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════
function Layout({ color, icon, title, userName, menu, active, onNav, onLogout, children }:{
  color:string; icon:string; title:string; userName:string;
  menu:{id:string;label:string;icon:string}[]; active:string;
  onNav:(s:string)=>void; onLogout:()=>void; children:React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:open?220:60, background:"#1a202c", display:"flex", flexDirection:"column",
        transition:"width 0.2s", flexShrink:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 12px", borderBottom:"1px solid #2d3748", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:22, flexShrink:0 }}>{icon}</span>
          {open && <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontSize:12, fontWeight:800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{title}</div>
            <div style={{ color:"#A0AEC0", fontSize:10, whiteSpace:"nowrap" }}>{userName}</div>
          </div>}
          <button onClick={()=>setOpen(v=>!v)} style={{ background:"none", border:"none",
            color:"#A0AEC0", cursor:"pointer", fontSize:16, flexShrink:0, marginRight:open?"0":"auto" }}>☰</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"6px 0" }}>
          {menu.map(m=>(
            <button key={m.id} onClick={()=>onNav(m.id)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
              background:active===m.id?`${color}25`:"none", border:"none", cursor:"pointer", textAlign:"right",
              borderRight:active===m.id?`3px solid ${color}`:"3px solid transparent" }}>
              <span style={{ fontSize:17, flexShrink:0 }}>{m.icon}</span>
              {open && <span style={{ color:active===m.id?"#fff":"#A0AEC0", fontSize:13,
                fontWeight:active===m.id?700:400, whiteSpace:"nowrap" }}>{m.label}</span>}
            </button>
          ))}
        </div>
        <button onClick={onLogout} style={{ padding:14, background:"none", border:"none",
          borderTop:"1px solid #2d3748", color:"#A0AEC0", cursor:"pointer",
          display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
          <span>🚪</span>{open && <span>تسجيل الخروج</span>}
        </button>
      </div>
      {/* Content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 20px",
          height:56, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <span style={{ fontWeight:800, fontSize:15, color:C.text }}>
              {menu.find(m=>m.id===active)?.label}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:`${color}12`,
            borderRadius:20, padding:"5px 12px", border:`1px solid ${color}30` }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:C.green, display:"block" }} />
            <span style={{ fontSize:11, color, fontWeight:700 }}>🔄 متزامن مع التطبيق</span>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:20 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────
function Stat({ icon, label, value, change, color }:any) {
  return (
    <div style={{ background:C.surface, borderRadius:14, padding:"16px 18px",
      borderTop:`3px solid ${color}`, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:22 }}>{icon}</span>
        {change && <span style={{ fontSize:10, color:C.green, fontWeight:700, background:"#F0FFF4", borderRadius:6, padding:"2px 7px" }}>{change}</span>}
      </div>
      <div style={{ fontSize:20, fontWeight:900, color:C.text }}>{value}</div>
      <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{label}</div>
    </div>
  );
}
function Badge({ label, color, bg }:any) {
  return <span style={{ background:bg, color, borderRadius:7, padding:"2px 9px", fontSize:11, fontWeight:700 }}>{label}</span>;
}
function Card({ children, style }:any) {
  return <div style={{ background:C.surface, borderRadius:14, padding:18, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", ...style }}>{children}</div>;
}
function SyncNote({ text }:{ text:string }) {
  return (
    <div style={{ background:"#EBF8FF", border:"1px solid #90CDF4", borderRadius:10, padding:"9px 14px",
      display:"flex", gap:8, alignItems:"center", marginBottom:14 }}>
      <span>📱</span>
      <span style={{ fontSize:12, color:"#2C5282" }}>{text}</span>
    </div>
  );
}
function H({ icon, title }:any) {
  return <h3 style={{ fontSize:15, fontWeight:800, color:C.text, margin:"0 0 14px",
    display:"flex", alignItems:"center", gap:7 }}><span>{icon}</span>{title}</h3>;
}
const planBadge = (p:string) => p==="premium"
  ? { label:"بريميوم ✨", color:"#7C3AED", bg:"#F3F0FF" }
  : p==="standard"
  ? { label:"ستاندرد", color:C.blue, bg:"#EBF8FF" }
  : { label:"مجاني", color:C.muted, bg:"#EDF2F7" };
const orderBadge = (s:string) => s==="new"?{label:"جديد",color:"#D97706",bg:"#FFF3E0"}:
  s==="processing"?{label:"قيد التجهيز",color:C.blue,bg:"#EBF8FF"}:
  s==="completed"?{label:"مكتمل",color:C.green,bg:"#F0FFF4"}:{label:"ملغي",color:C.red,bg:"#FFF5F5"};

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
];

function AdminPortal({ user, onLogout }:{ user:User; onLogout:()=>void }) {
  const [sec, setSec] = useState("dash");
  const { db } = useDB();
  return (
    <Layout color={C.admin} icon="🛡️" title="مدير المنصة" userName={user.name}
      menu={ADMIN_MENU} active={sec} onNav={setSec} onLogout={onLogout}>
      {sec==="dash"    && <AdminDash    db={db} />}
      {sec==="pharms"  && <AdminPharms  db={db} />}
      {sec==="wares"   && <AdminWares   db={db} />}
      {sec==="deliv"   && <AdminDeliv   db={db} />}
      {sec==="subs"    && <AdminSubs    db={db} />}
      {sec==="finance" && <AdminFin     db={db} />}
      {sec==="announce"&& <AdminAnn />}
    </Layout>
  );
}

function AdminDash({ db }:{ db:DB }) {
  const totalRev = [...db.pharmacies,...db.warehouses,...db.deliveries].reduce((s,a)=>s+a.revenue,0);
  return (
    <div>
      <SyncNote text="البيانات تتحدث فور تعديل أي مشترك لحسابه في بوابته الخاصة أو في التطبيق" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:20 }}>
        <Stat icon="💊" label="صيدلية نشطة"    value={db.pharmacies.filter(p=>p.active).length}    change="+3 جديدة" color={C.pharmacy}  />
        <Stat icon="🏭" label="مذخر نشط"        value={db.warehouses.filter(w=>w.active).length}    change="+1 جديد"  color={C.warehouse} />
        <Stat icon="🚛" label="شركة توصيل"      value={db.deliveries.filter(d=>d.active).length}    color={C.delivery} />
        <Stat icon="💰" label="إجمالي الإيرادات" value={`${(totalRev/1000000).toFixed(1)}M د.ع`}   change="+18%" color={C.admin} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        <Card>
          <H icon="💊" title="آخر الصيدليات" />
          {db.pharmacies.map(p=>(
            <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:700, fontSize:12 }}>{p.name}</div>
                <div style={{ fontSize:10, color:C.muted }}>{p.city}</div>
              </div>
              <Badge {...planBadge(p.plan)} />
            </div>
          ))}
        </Card>
        <Card>
          <H icon="🏭" title="آخر المذاخر" />
          {db.warehouses.map(w=>(
            <div key={w.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:700, fontSize:12 }}>{w.name}</div>
                <div style={{ fontSize:10, color:C.muted }}>{w.city}</div>
              </div>
              <Badge {...planBadge(w.plan)} />
            </div>
          ))}
        </Card>
        <Card>
          <H icon="🚛" title="شركات التوصيل" />
          {db.deliveries.map(d=>(
            <div key={d.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:700, fontSize:12 }}>{d.name}</div>
                <div style={{ fontSize:10, color:C.muted }}>{d.rating} ★ · {d.drivers} سائق</div>
              </div>
              <Badge {...planBadge(d.plan)} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function AdminTable({ rows, cols, color }:{ rows:any[]; cols:{k:string;l:string}[]; color:string }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead>
          <tr style={{ background:C.bg }}>
            {cols.map(c=><th key={c.k} style={{ padding:"9px 12px", textAlign:"right", color:C.muted, borderBottom:`2px solid ${C.border}`, fontWeight:600 }}>{c.l}</th>)}
            <th style={{ padding:"9px 12px", borderBottom:`2px solid ${C.border}` }}>إجراء</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} style={{ borderBottom:`1px solid ${C.border}`, background:i%2?C.bg:C.surface }}>
              {cols.map(c=>(
                <td key={c.k} style={{ padding:"9px 12px" }}>
                  {c.k==="plan" ? <Badge {...planBadge(r[c.k])} /> :
                   c.k==="active" ? <Badge label={r[c.k]?"نشط":"معطّل"} color={r[c.k]?C.green:C.red} bg={r[c.k]?"#F0FFF4":"#FFF5F5"} /> :
                   c.k==="revenue" ? `${Number(r[c.k]).toLocaleString()} د.ع` : String(r[c.k]||"—")}
                </td>
              ))}
              <td style={{ padding:"9px 12px" }}>
                <span style={{ background:`${color}15`, color, borderRadius:7, padding:"3px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>تعديل</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminPharms({ db }:{ db:DB }) {
  return <Card><SyncNote text="البيانات مُغذَّاة مباشرة من بوابات الصيدليات والتطبيق" /><H icon="💊" title="جميع حسابات الصيدليات" />
    <AdminTable color={C.pharmacy} rows={db.pharmacies}
      cols={[{k:"name",l:"الصيدلية"},{k:"city",l:"المدينة"},{k:"phone",l:"الهاتف"},{k:"plan",l:"الاشتراك"},{k:"active",l:"الحالة"},{k:"revenue",l:"الإيراد"},{k:"joined",l:"الانضمام"}]} /></Card>;
}
function AdminWares({ db }:{ db:DB }) {
  return <Card><SyncNote text="البيانات مُغذَّاة مباشرة من بوابات المذاخر والتطبيق" /><H icon="🏭" title="جميع حسابات المذاخر" />
    <AdminTable color={C.warehouse} rows={db.warehouses}
      cols={[{k:"name",l:"المذخر"},{k:"city",l:"المدينة"},{k:"phone",l:"الهاتف"},{k:"plan",l:"الاشتراك"},{k:"active",l:"الحالة"},{k:"linkedPharmacies",l:"صيدليات مرتبطة"},{k:"revenue",l:"الإيراد"}]} /></Card>;
}
function AdminDeliv({ db }:{ db:DB }) {
  return <Card><SyncNote text="البيانات مُغذَّاة مباشرة من بوابات شركات التوصيل والتطبيق" /><H icon="🚛" title="شركات التوصيل" />
    <AdminTable color={C.delivery} rows={db.deliveries}
      cols={[{k:"name",l:"الشركة"},{k:"city",l:"المدينة"},{k:"phone",l:"الهاتف"},{k:"plan",l:"الاشتراك"},{k:"active",l:"الحالة"},{k:"drivers",l:"السائقون"},{k:"rating",l:"التقييم"}]} /></Card>;
}

function AdminSubs({ db }:{ db:DB }) {
  const all = [
    ...db.pharmacies.map(p=>({...p,type:"صيدلية",tc:C.pharmacy,ti:"💊"})),
    ...db.warehouses.map(w=>({...w,type:"مذخر",tc:C.warehouse,ti:"🏭"})),
    ...db.deliveries.map(d=>({...d,type:"شركة توصيل",tc:C.delivery,ti:"🚛"})),
  ];
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
        {[{l:"بريميوم",v:all.filter(a=>a.plan==="premium").length,c:C.admin},
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
            {["النوع","الاسم","المدينة","الاشتراك","الحالة","ترقية"].map(h=>(
              <th key={h} style={{ padding:"9px 12px", textAlign:"right", color:C.muted, borderBottom:`2px solid ${C.border}` }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{all.map((a,i)=>(
            <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
              <td style={{ padding:"9px 12px" }}><Badge label={`${a.ti} ${a.type}`} color={a.tc} bg={`${a.tc}15`} /></td>
              <td style={{ padding:"9px 12px", fontWeight:700 }}>{a.name}</td>
              <td style={{ padding:"9px 12px", color:C.muted }}>{a.city}</td>
              <td style={{ padding:"9px 12px" }}><Badge {...planBadge(a.plan)} /></td>
              <td style={{ padding:"9px 12px" }}><Badge label={a.active?"نشط":"معطّل"} color={a.active?C.green:C.red} bg={a.active?"#F0FFF4":"#FFF5F5"} /></td>
              <td style={{ padding:"9px 12px" }}><span style={{ background:`${C.admin}15`, color:C.admin, borderRadius:7, padding:"3px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>ترقية</span></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>
  );
}

function AdminFin({ db }:{ db:DB }) {
  const total = [...db.pharmacies,...db.warehouses,...db.deliveries].reduce((s,a)=>s+a.revenue,0);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:16 }}>
        <Stat icon="💰" label="إجمالي الإيرادات" value={`${(total/1000000).toFixed(1)}M`}  change="+18%" color={C.admin} />
        <Stat icon="💊" label="إيرادات الصيدليات" value={`${(db.pharmacies.reduce((s,p)=>s+p.revenue,0)/1000000).toFixed(1)}M`} color={C.pharmacy} />
        <Stat icon="🏭" label="إيرادات المذاخر"   value={`${(db.warehouses.reduce((s,w)=>s+w.revenue,0)/1000000).toFixed(1)}M`} color={C.warehouse} />
        <Stat icon="🚛" label="إيرادات التوصيل"   value={`${(db.deliveries.reduce((s,d)=>s+d.revenue,0)/1000000).toFixed(1)}M`} color={C.delivery} />
      </div>
      <Card>
        <H icon="🏦" title="ملخص الإيرادات لكل حساب" />
        {[...db.pharmacies,...db.warehouses,...db.deliveries].map((a:any,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
            <span style={{ fontWeight:700, fontSize:13 }}>{a.name}</span>
            <span style={{ fontWeight:800, color:C.green, fontSize:14 }}>{a.revenue.toLocaleString()} د.ع</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AdminAnn() {
  const [form, setForm] = useState({ title:"", body:"", target:"all" });
  const anns = [
    { title:"تحديث نظام الاشتراكات",body:"سيتم التحديث في 15 أبريل 2025",target:"all",date:"2025-04-01",pub:true },
    { title:"رسوم التوصيل الجديدة",body:"تحديث جدول الرسوم بدءاً من مايو",target:"delivery",date:"2025-04-03",pub:true },
  ];
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
          <button style={{ background:C.admin, color:"#fff", border:"none", borderRadius:9, padding:11, fontWeight:700, cursor:"pointer" }}>
            📢 نشر
          </button>
        </div>
      </Card>
      <Card>
        <H icon="📋" title="الإعلانات" />
        {anns.map((a,i)=>(
          <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontWeight:700, fontSize:13 }}>{a.title}</span>
              <Badge label={a.pub?"منشور":"مسودة"} color={a.pub?C.green:C.muted} bg={a.pub?"#F0FFF4":"#EDF2F7"} />
            </div>
            <div style={{ fontSize:12, color:C.muted }}>{a.body}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHARMACY PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
const PH_MENU = [
  {id:"dash",  label:"لوحة التحكم",   icon:"📊"},
  {id:"acc",   label:"حسابي",          icon:"👤"},
  {id:"inv",   label:"المخزون",        icon:"📦"},
  {id:"orders",label:"الطلبات",        icon:"🛒"},
  {id:"sub",   label:"الاشتراك",      icon:"💎"},
  {id:"fin",   label:"المالية",        icon:"💰"},
  {id:"sup",   label:"الدعم",         icon:"💬"},
];

function PharmacyPortal({ user, onLogout }:{ user:User; onLogout:()=>void }) {
  const { db, setDB } = useDB();
  const [sec, setSec] = useState("dash");
  const ph = db.pharmacies.find(p=>p.userId===user.id)!;
  const updatePh = (updated:PharmacyData) =>
    setDB(prev=>({ ...prev, pharmacies:prev.pharmacies.map(p=>p.id===ph.id?updated:p) }));
  return (
    <Layout color={C.pharmacy} icon="💊" title="بوابة الصيدلية" userName={ph.name}
      menu={PH_MENU} active={sec} onNav={setSec} onLogout={onLogout}>
      {sec==="dash"   && <PartnerDash color={C.pharmacy} name={ph.name} city={ph.city}
        stats={[{icon:"📦",l:"منتج",v:ph.products.length},{icon:"🛒",l:"طلب",v:ph.orders.length},
          {icon:"💰",l:"إيراد",v:`${(ph.revenue/1000000).toFixed(1)}M د.ع`},{icon:"💎",l:"الاشتراك",v:planBadge(ph.plan).label}]} orders={ph.orders} />}
      {sec==="acc"    && <AccountSec color={C.pharmacy} data={ph} onSave={updatePh}
        fields={[{k:"name",l:"الاسم التجاري"},{k:"city",l:"المدينة"},{k:"phone",l:"الهاتف"},{k:"address",l:"العنوان"},{k:"email",l:"البريد الإلكتروني"},{k:"license",l:"رقم الرخصة"}]} />}
      {sec==="inv"    && <InvSec color={C.pharmacy} products={ph.products} onUpdate={prods=>updatePh({...ph,products:prods})} />}
      {sec==="orders" && <OrdersSec color={C.pharmacy} orders={ph.orders} onUpdate={ords=>updatePh({...ph,orders:ords})} />}
      {sec==="sub"    && <SubSec color={C.pharmacy} plan={ph.plan} onUpgrade={p=>updatePh({...ph,plan:p})} />}
      {sec==="fin"    && <FinSec color={C.pharmacy} revenue={ph.revenue} />}
      {sec==="sup"    && <SupportSec color={C.pharmacy} name={ph.name} />}
    </Layout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WAREHOUSE PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
function WarehousePortal({ user, onLogout }:{ user:User; onLogout:()=>void }) {
  const { db, setDB } = useDB();
  const [sec, setSec] = useState("dash");
  const wh = db.warehouses.find(w=>w.userId===user.id)!;
  const updateWh = (updated:WarehouseData) =>
    setDB(prev=>({ ...prev, warehouses:prev.warehouses.map(w=>w.id===wh.id?updated:w) }));
  return (
    <Layout color={C.warehouse} icon="🏭" title="بوابة المذخر" userName={wh.name}
      menu={PH_MENU} active={sec} onNav={setSec} onLogout={onLogout}>
      {sec==="dash"   && <PartnerDash color={C.warehouse} name={wh.name} city={wh.city}
        stats={[{icon:"📦",l:"منتج",v:wh.products.length},{icon:"💼",l:"طلب",v:wh.orders.length},
          {icon:"💰",l:"إيراد",v:`${(wh.revenue/1000000).toFixed(1)}M`},{icon:"🤝",l:"صيدليات مرتبطة",v:wh.linkedPharmacies}]} orders={wh.orders} />}
      {sec==="acc"    && <AccountSec color={C.warehouse} data={wh} onSave={updateWh}
        fields={[{k:"name",l:"اسم المذخر"},{k:"city",l:"المدينة"},{k:"phone",l:"الهاتف"},{k:"address",l:"العنوان"},{k:"email",l:"البريد الإلكتروني"}]} />}
      {sec==="inv"    && <InvSec color={C.warehouse} products={wh.products} onUpdate={prods=>updateWh({...wh,products:prods})} />}
      {sec==="orders" && <OrdersSec color={C.warehouse} orders={wh.orders} onUpdate={ords=>updateWh({...wh,orders:ords})} />}
      {sec==="sub"    && <SubSec color={C.warehouse} plan={wh.plan} onUpgrade={p=>updateWh({...wh,plan:p})} />}
      {sec==="fin"    && <FinSec color={C.warehouse} revenue={wh.revenue} />}
      {sec==="sup"    && <SupportSec color={C.warehouse} name={wh.name} />}
    </Layout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELIVERY PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
const DL_MENU = [
  {id:"dash",  label:"لوحة التحكم",   icon:"📊"},
  {id:"acc",   label:"حسابي",          icon:"👤"},
  {id:"inv",   label:"الرحلات",        icon:"🗺️"},
  {id:"orders",label:"السائقون",       icon:"👥"},
  {id:"sub",   label:"الاشتراك",      icon:"💎"},
  {id:"fin",   label:"المالية",        icon:"💰"},
  {id:"sup",   label:"الدعم",         icon:"💬"},
];

function DeliveryPortal({ user, onLogout }:{ user:User; onLogout:()=>void }) {
  const { db, setDB } = useDB();
  const [sec, setSec] = useState("dash");
  const dl = db.deliveries.find(d=>d.userId===user.id)!;
  const updateDl = (updated:DeliveryData) =>
    setDB(prev=>({ ...prev, deliveries:prev.deliveries.map(d=>d.id===dl.id?updated:d) }));
  return (
    <Layout color={C.delivery} icon="🚛" title="بوابة شركة التوصيل" userName={dl.name}
      menu={DL_MENU} active={sec} onNav={setSec} onLogout={onLogout}>
      {sec==="dash"   && <PartnerDash color={C.delivery} name={dl.name} city={dl.city}
        stats={[{icon:"🚛",l:"رحلة",v:dl.trips.length},{icon:"👥",l:"سائق",v:dl.drivers},
          {icon:"⭐",l:"تقييم",v:`${dl.rating} ★`},{icon:"💰",l:"إيراد",v:`${(dl.revenue/1000000).toFixed(1)}M`}]} orders={dl.trips.map(t=>({id:t.id,product:`${t.from} → ${t.to}`,amount:t.amount,status:t.status,date:t.date,customer:t.driver}))} />}
      {sec==="acc"    && <AccountSec color={C.delivery} data={dl} onSave={updateDl}
        fields={[{k:"name",l:"اسم الشركة"},{k:"city",l:"المدينة"},{k:"phone",l:"الهاتف"},{k:"address",l:"العنوان"},{k:"email",l:"البريد الإلكتروني"}]} />}
      {sec==="inv"    && <TripsSec color={C.delivery} trips={dl.trips} />}
      {sec==="orders" && <DriversTab drivers={dl.drivers} />}
      {sec==="sub"    && <SubSec color={C.delivery} plan={dl.plan} onUpgrade={p=>updateDl({...dl,plan:p})} />}
      {sec==="fin"    && <FinSec color={C.delivery} revenue={dl.revenue} />}
      {sec==="sup"    && <SupportSec color={C.delivery} name={dl.name} />}
    </Layout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════
function PartnerDash({ color, name, city, stats, orders }:any) {
  return (
    <div>
      <SyncNote text={`بيانات ${name} متزامنة مع تطبيق دواء+ — أي تعديل يظهر فوراً للمدير وفي التطبيق`} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:18 }}>
        {stats.map((s:any)=><Stat key={s.l} icon={s.icon} label={s.l} value={s.v} color={color} />)}
      </div>
      <Card>
        <H icon="📱" title="آخر الطلبات من التطبيق" />
        {orders.map((o:any)=>(
          <div key={o.id} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
            <div>
              <span style={{ fontWeight:700, color, fontSize:13 }}>{o.id}</span>
              <span style={{ fontSize:13, marginRight:8 }}>{o.product}</span>
              <span style={{ fontSize:11, color:C.muted }}>· {o.date}</span>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontWeight:700, fontSize:13 }}>{o.amount?.toLocaleString()} د.ع</span>
              <Badge {...orderBadge(o.status)} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AccountSec({ color, data, onSave, fields }:{ color:string; data:any; onSave:(d:any)=>void; fields:{k:string;l:string}[] }) {
  const [form, setForm] = useState<any>({...data});
  const [saved, setSaved] = useState(false);
  const save = () => { onSave(form); setSaved(true); setTimeout(()=>setSaved(false), 3000); };
  return (
    <div>
      <SyncNote text="حفظ البيانات هنا يُحدّثها فوراً في بوابة المدير وفي التطبيق" />
      <Card style={{ maxWidth:560 }}>
        <H icon="👤" title="معلومات الحساب" />
        <div style={{ display:"flex", flexDirection:"column", gap:11, marginBottom:14 }}>
          {fields.map(f=>(
            <div key={f.k}>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:3 }}>{f.l}</label>
              <input value={form[f.k]||""} onChange={e=>setForm({...form,[f.k]:e.target.value})}
                style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }} />
            </div>
          ))}
        </div>
        <button onClick={save} style={{ background:color, color:"#fff", border:"none", borderRadius:9,
          padding:"12px", width:"100%", fontWeight:800, cursor:"pointer", fontSize:14 }}>
          {saved?"✅ تم الحفظ والمزامنة مع التطبيق وبوابة المدير!":"💾 حفظ ومزامنة"}
        </button>
        {saved && <div style={{ textAlign:"center", fontSize:12, color:C.green, marginTop:8 }}>
          ✅ يمكن للمدير رؤية التغييرات الآن
        </div>}
      </Card>
    </div>
  );
}

function InvSec({ color, products, onUpdate }:{ color:string; products:Product[]; onUpdate:(p:Product[])=>void }) {
  const [items, setItems] = useState<Product[]>(products);
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Product>>({ name:"", qty:0, price:0, expiry:"", unit:"علبة" });

  const updateQty = (id:string, qty:number) => setItems(prev=>prev.map(p=>p.id===id?{...p,qty}:p));
  const save = () => { onUpdate(items); setSaved(true); setTimeout(()=>setSaved(false),2500); };
  const addItem = () => {
    const updated = [...items, { id:`p${Date.now()}`, name:newItem.name||"", qty:newItem.qty||0,
      price:newItem.price||0, expiry:newItem.expiry||"", unit:newItem.unit||"علبة" }];
    setItems(updated); onUpdate(updated); setShowAdd(false);
    setNewItem({ name:"", qty:0, price:0, expiry:"", unit:"علبة" });
  };

  return (
    <div>
      <SyncNote text="تعديل المخزون هنا يُحدّثه في التطبيق وبوابة المدير فوراً" />
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <button onClick={()=>setShowAdd(v=>!v)} style={{ background:color, color:"#fff", border:"none", borderRadius:9, padding:"8px 16px", fontWeight:700, cursor:"pointer" }}>+ إضافة منتج</button>
        <button onClick={save} style={{ background:C.green, color:"#fff", border:"none", borderRadius:9, padding:"8px 16px", fontWeight:700, cursor:"pointer" }}>
          {saved?"✅ تم الحفظ":"💾 حفظ التغييرات"}
        </button>
      </div>
      {showAdd && (
        <Card style={{ marginBottom:12, border:`2px solid ${color}` }}>
          <H icon="➕" title="إضافة منتج جديد" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
            <input placeholder="اسم المنتج" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})}
              style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13 }} />
            <input type="number" placeholder="الكمية" value={newItem.qty||""} onChange={e=>setNewItem({...newItem,qty:Number(e.target.value)})}
              style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13 }} />
            <input type="number" placeholder="السعر" value={newItem.price||""} onChange={e=>setNewItem({...newItem,price:Number(e.target.value)})}
              style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13 }} />
            <input placeholder="تاريخ الانتهاء" value={newItem.expiry} onChange={e=>setNewItem({...newItem,expiry:e.target.value})}
              style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13 }} />
            <select value={newItem.unit} onChange={e=>setNewItem({...newItem,unit:e.target.value})}
              style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13 }}>
              {["علبة","قارورة","كيس","كرتون","صندوق"].map(u=><option key={u}>{u}</option>)}
            </select>
            <button onClick={addItem} style={{ background:color, color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" }}>إضافة</button>
          </div>
        </Card>
      )}
      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ background:C.bg }}>
            {["المنتج","الكمية","الوحدة","السعر","انتهاء الصلاحية","الحالة"].map(h=>(
              <th key={h} style={{ padding:"9px 12px", textAlign:"right", color:C.muted, borderBottom:`2px solid ${C.border}` }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {items.map((it,i)=>(
              <tr key={it.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2?C.bg:C.surface }}>
                <td style={{ padding:"9px 12px", fontWeight:700 }}>{it.name}</td>
                <td style={{ padding:"9px 12px" }}>
                  <input type="number" value={it.qty} onChange={e=>updateQty(it.id,Number(e.target.value))}
                    style={{ width:60, border:`1px solid ${it.qty<10?C.red:C.border}`, borderRadius:7, padding:"3px 6px",
                      fontSize:13, fontWeight:700, color:it.qty<10?C.red:C.text }} />
                </td>
                <td style={{ padding:"9px 12px", color:C.muted }}>{it.unit}</td>
                <td style={{ padding:"9px 12px" }}>{it.price.toLocaleString()} د.ع</td>
                <td style={{ padding:"9px 12px", color:C.muted }}>{it.expiry}</td>
                <td style={{ padding:"9px 12px" }}>
                  {it.qty<10 ? <Badge label="ينفد" color={C.red} bg="#FFF5F5" /> : <Badge label="متوفر" color={C.green} bg="#F0FFF4" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function OrdersSec({ color, orders, onUpdate }:{ color:string; orders:Order[]; onUpdate:(o:Order[])=>void }) {
  const updateStatus = (id:string, status:string) => {
    const updated = orders.map(o=>o.id===id?{...o,status}:o);
    onUpdate(updated);
  };
  return (
    <div>
      <SyncNote text="الطلبات تصل مباشرة من التطبيق — يمكنك تحديث حالتها هنا" />
      <Card>
        <H icon="🛒" title="الطلبات" />
        {orders.map(o=>(
          <div key={o.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
            <div>
              <div style={{ fontWeight:700, color, fontSize:13 }}>{o.id}</div>
              <div style={{ fontSize:13 }}>{o.product}</div>
              <div style={{ fontSize:11, color:C.muted }}>{o.customer} · {o.date}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontWeight:700, fontSize:13 }}>{o.amount.toLocaleString()} د.ع</span>
              <select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}
                style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"4px 8px", fontSize:12, cursor:"pointer" }}>
                <option value="new">جديد</option>
                <option value="processing">قيد التجهيز</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SubSec({ color, plan, onUpgrade }:{ color:string; plan:string; onUpgrade:(p:string)=>void }) {
  const plans = [
    { id:"free",    name:"مجاني",   price:0,      features:["5 منتجات","دعم أساسي"] },
    { id:"standard",name:"ستاندرد", price:25000,  features:["200 منتج","دعم أولوية","تقارير شهرية"] },
    { id:"premium", name:"بريميوم", price:65000,  features:["غير محدود","دعم 24/7","مدير حساب خاص","إعلانات"] },
  ];
  const [upgrading, setUpgrading] = useState<string|null>(null);
  const doUpgrade = (pid:string) => { setUpgrading(pid); setTimeout(()=>{ onUpgrade(pid); setUpgrading(null); },1200); };
  return (
    <div>
      <SyncNote text="الاشتراك يُحدَّث في بوابة المدير وفي التطبيق فوراً عند الترقية" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:14 }}>
        {plans.map(p=>(
          <Card key={p.id} style={{ border:`2px solid ${p.id===plan?color:C.border}`, position:"relative" }}>
            {p.id===plan && <div style={{ position:"absolute", top:-10, right:14, background:color, color:"#fff", borderRadius:9, padding:"2px 10px", fontSize:11, fontWeight:700 }}>اشتراكك الحالي</div>}
            <div style={{ fontWeight:800, fontSize:17, marginBottom:4 }}>{p.name}</div>
            <div style={{ fontSize:20, fontWeight:900, color, marginBottom:12 }}>
              {p.price===0?"مجاني":`${p.price.toLocaleString()} د.ع/شهر`}
            </div>
            {p.features.map(f=><div key={f} style={{ fontSize:12, marginBottom:5, display:"flex", gap:5 }}><span style={{ color:C.green }}>✓</span>{f}</div>)}
            {p.id!==plan && (
              <button onClick={()=>doUpgrade(p.id)} disabled={upgrading===p.id}
                style={{ marginTop:10, background:color, color:"#fff", border:"none", borderRadius:9,
                  padding:"9px", width:"100%", fontWeight:700, cursor:"pointer", fontSize:13 }}>
                {upgrading===p.id?"⏳ جاري الترقية...":"ترقية"}
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function FinSec({ color, revenue }:{ color:string; revenue:number }) {
  const payments = [
    { method:"زين كاش", ref:"ZC-20250401", amount:Math.round(revenue*0.25), date:"2025-04-01" },
    { method:"فاست باي",ref:"FP-20250315", amount:Math.round(revenue*0.15), date:"2025-03-15" },
    { method:"FIB",     ref:"FI-20250301", amount:Math.round(revenue*0.30), date:"2025-03-01" },
  ];
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
        <Stat icon="💰" label="الإجمالي"     value={`${(revenue/1000000).toFixed(1)}M د.ع`}  change="+8%"  color={color} />
        <Stat icon="📅" label="هذا الشهر"   value={`${(revenue*0.3/1000000).toFixed(2)}M`}  color={color} />
        <Stat icon="⏳" label="معلّق"        value={`${(revenue*0.05/1000).toFixed(0)}K`}    color={C.orange} />
      </div>
      <Card>
        <H icon="📋" title="سجل المدفوعات" />
        {payments.map((p,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
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

function TripsSec({ color, trips }:{ color:string; trips:Trip[] }) {
  const tripStatus = (s:string) => s==="active"?{label:"نشطة",color:C.blue,bg:"#EBF8FF"}:
    s==="completed"?{label:"مكتملة",color:C.green,bg:"#F0FFF4"}:{label:"انتظار",color:C.orange,bg:"#FFFAF0"};
  return (
    <div>
      <SyncNote text="الرحلات تتزامن مع التطبيق في الوقت الفعلي" />
      <Card>
        <H icon="🗺️" title="الرحلات" />
        {trips.map(t=>(
          <div key={t.id} style={{ padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontWeight:700, color, fontSize:13 }}>{t.id}</span>
              <Badge {...tripStatus(t.status)} />
            </div>
            <div style={{ fontSize:13 }}>{t.from} → {t.to}</div>
            <div style={{ fontSize:11, color:C.muted }}>السائق: {t.driver} · {t.date} · {t.amount.toLocaleString()} د.ع</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function DriversTab({ drivers }:{ drivers:number }) {
  const list = Array.from({ length:drivers },(_,i)=>({ name:`سائق ${i+1}`, status:i%3===0?"في الخدمة":i%3===1?"مشغول":"متوقف" }));
  return (
    <Card>
      <H icon="👥" title={`السائقون (${drivers})`} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:8 }}>
        {list.map((d,i)=>(
          <div key={i} style={{ background:C.bg, borderRadius:10, padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:600 }}>{d.name}</span>
            <Badge label={d.status}
              color={d.status==="في الخدمة"?C.green:d.status==="مشغول"?C.blue:C.muted}
              bg={d.status==="في الخدمة"?"#F0FFF4":d.status==="مشغول"?"#EBF8FF":"#EDF2F7"} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function SupportSec({ color, name }:{ color:string; name:string }) {
  const [tab, setTab] = useState<"tickets"|"chat"|"contact">("tickets");
  const [msg, setMsg] = useState(""); const [sent, setSent] = useState(false);
  const tickets = [
    { id:"TK-001", title:"مشكلة في الطلبات",  status:"open",     date:"2025-04-03", reply:"نحن ندرس مشكلتك..." },
    { id:"TK-002", title:"سؤال عن الاشتراك", status:"resolved", date:"2025-04-01", reply:"تم الحل، راجع قسم الاشتراك." },
  ];
  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {([["tickets","🎫 التذاكر"],["chat","💬 رسالة للمدير"],["contact","📞 التواصل"]] as const).map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ background:tab===id?color:"#EDF2F7", color:tab===id?"#fff":C.text,
            border:"none", borderRadius:9, padding:"8px 16px", fontWeight:700, cursor:"pointer", fontSize:13 }}>
            {label}
          </button>
        ))}
      </div>
      {tab==="tickets" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {tickets.map(t=>(
            <Card key={t.id}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontWeight:700, color }}>{t.id} — {t.title}</span>
                <Badge label={t.status==="open"?"مفتوحة":"محلولة"} color={t.status==="open"?C.orange:C.green} bg={t.status==="open"?"#FFF3E0":"#F0FFF4"} />
              </div>
              <div style={{ fontSize:12, color:C.muted }}>رد المدير: {t.reply}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{t.date}</div>
            </Card>
          ))}
          <Card>
            <H icon="✍️" title="فتح تذكرة جديدة" />
            <input placeholder="موضوع المشكلة" style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:9, padding:"9px 12px", marginBottom:8, fontSize:13, boxSizing:"border-box" }} />
            <textarea placeholder="وصف تفصيلي..." rows={3} style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13, resize:"vertical", boxSizing:"border-box" }} />
            <button style={{ background:color, color:"#fff", border:"none", borderRadius:9, padding:"9px 18px", fontWeight:700, cursor:"pointer", marginTop:8 }}>إرسال</button>
          </Card>
        </div>
      )}
      {tab==="chat" && (
        <Card>
          <H icon="💬" title="رسالة مباشرة لمدير المنصة" />
          <div style={{ background:C.bg, borderRadius:10, padding:14, minHeight:100, marginBottom:10, fontSize:13, color:C.muted }}>
            مرحباً {name}! كيف يمكننا مساعدتك؟ 👋
          </div>
          <textarea placeholder="اكتب رسالتك..." value={msg} onChange={e=>setMsg(e.target.value)} rows={3}
            style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13, resize:"vertical", boxSizing:"border-box", marginBottom:8 }} />
          <button onClick={()=>{ setSent(true); setMsg(""); setTimeout(()=>setSent(false),3500); }}
            style={{ background:color, color:"#fff", border:"none", borderRadius:9, padding:"9px 18px", fontWeight:700, cursor:"pointer" }}>
            {sent?"✅ تم الإرسال!":"📨 إرسال"}
          </button>
          {sent && <div style={{ color:C.green, fontSize:12, marginTop:8 }}>✅ وصلت رسالتك — سيرد المدير قريباً</div>}
        </Card>
      )}
      {tab==="contact" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
          {[{icon:"📞",l:"هاتف",v:"+964 770 000 0001",a:"tel:+9647700000001"},
            {icon:"💬",l:"واتساب",v:"+964 770 000 0001",a:"https://wa.me/9647700000001"},
            {icon:"📧",l:"البريد",v:"admin@dawaplus.iq",a:"mailto:admin@dawaplus.iq"},
          ].map(c=>(
            <Card key={c.l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{c.icon}</div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:3 }}>{c.l}</div>
              <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>{c.v}</div>
              <a href={c.a} target="_blank" rel="noreferrer"
                style={{ background:color, color:"#fff", borderRadius:9, padding:"7px 14px", fontSize:12, fontWeight:700, textDecoration:"none" }}>تواصل</a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

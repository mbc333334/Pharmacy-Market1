import { useState, useEffect } from "react";

function broadcastSync() {
  try { new BroadcastChannel("dawapl_sync").postMessage("update"); } catch {}
}

const C = {
  primary:"#1A9E6E", dark:"#0D7A54", light:"#E6F7F2", text:"#1a202c",
  muted:"#718096", border:"#e2e8f0", bg:"#f7fafc", surface:"#fff",
  red:"#E53E3E", green:"#38A169", blue:"#3182CE", orange:"#DD6B20",
};

const PHARMACIES = [
  { id:"ph1", name:"صيدلية الشفاء",  phone:"07501234567", pass:"123456", city:"أربيل",      address:"شارع 100", license:"PH-2024-001", email:"shifa@email.com",   plan:"premium",  revenue:4200000, joined:"2024-01-15" },
  { id:"ph2", name:"صيدلية النور",    phone:"07701234568", pass:"123456", city:"السليمانية",address:"شارع زانكو",license:"PH-2024-002", email:"noor@email.com",    plan:"standard", revenue:2800000, joined:"2024-02-20" },
  { id:"ph3", name:"صيدلية الأمل",    phone:"07601234569", pass:"123456", city:"دهوك",       address:"شارع بيروت",license:"PH-2024-003", email:"amal@email.com",    plan:"free",     revenue:900000,  joined:"2024-03-10" },
  { id:"ph4", name:"صيدلية الخير",    phone:"07801234570", pass:"123456", city:"كركوك",      address:"شارع التجار",license:"PH-2024-004", email:"kheir@email.com",  plan:"premium",  revenue:3100000, joined:"2024-04-01" },
];

const INIT_PRODUCTS = [
  { id:"p1", name:"باراسيتامول 500mg",  qty:12,  price:3500,  expiry:"2025-08-01", unit:"علبة",   category:"مسكنات"   },
  { id:"p2", name:"أموكسيسيلين 500mg",  qty:8,   price:4200,  expiry:"2025-06-15", unit:"علبة",   category:"مضادات حيوية" },
  { id:"p3", name:"فيتامين C 1000mg",   qty:34,  price:2800,  expiry:"2026-01-01", unit:"علبة",   category:"فيتامينات"  },
  { id:"p4", name:"أنسولين نوفوميكس",   qty:20,  price:15000, expiry:"2025-05-20", unit:"قارورة", category:"سكري"       },
  { id:"p5", name:"ميتفورمين 850mg",    qty:5,   price:5800,  expiry:"2025-09-30", unit:"علبة",   category:"سكري"       },
];

const INIT_ORDERS = [
  { id:"#1041", product:"باراسيتامول × 3", customer:"أحمد علي",   amount:10500, status:"processing", date:"2025-04-04" },
  { id:"#1040", product:"فيتامين C × 5",   customer:"سارة محمد",  amount:14000, status:"completed",  date:"2025-04-03" },
  { id:"#1039", product:"أنسولين",          customer:"كريم حسن",   amount:15000, status:"new",        date:"2025-04-03" },
  { id:"#1038", product:"أموكسيسيلين × 2", customer:"نور خالد",   amount:8400,  status:"cancelled",  date:"2025-04-02" },
  { id:"#1037", product:"ميتفورمين × 1",   customer:"ليلى فاروق", amount:5800,  status:"completed",  date:"2025-04-01" },
];

const LS = (key:string,def:any)=>{ try{ const v=localStorage.getItem(key); return v?JSON.parse(v):def; }catch{ return def; } };
const planBadge = (p:string)=>p==="premium"?{l:"بريميوم ✨",c:"#7C3AED",b:"#F3F0FF"}:p==="standard"?{l:"ستاندرد",c:C.blue,b:"#EBF8FF"}:{l:"مجاني",c:C.muted,b:"#EDF2F7"};
const orderBadge=(s:string)=>s==="new"?{l:"جديد",c:"#D97706",b:"#FFF3E0"}:s==="processing"?{l:"قيد التجهيز",c:C.blue,b:"#EBF8FF"}:s==="completed"?{l:"مكتمل",c:C.green,b:"#F0FFF4"}:{l:"ملغي",c:C.red,b:"#FFF5F5"};

export default function App() {
  const [ph, setPh] = useState<typeof PHARMACIES[0]|null>(null);
  const [sec, setSec] = useState("dash");
  const [products, setProductsState] = useState<any[]>([]);
  const [orders, setOrdersState] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [social, setSocialState] = useState<any>({ facebook:"", instagram:"", tiktok:"", website:"", whatsapp:"" });

  useEffect(()=>{
    if (!ph) return;
    setProductsState(LS(`ph_products_${ph.id}`, INIT_PRODUCTS));
    setOrdersState(LS(`ph_orders_${ph.id}`, INIT_ORDERS));
    setProfile(LS(`ph_profile_${ph.id}`, ph));
    setSocialState(LS(`ph_social_${ph.id}`, { facebook:"", instagram:"", tiktok:"", website:"", whatsapp: ph.phone }));
  }, [ph?.id]);

  const setProducts = (v:any)=>{ setProductsState(v); if(ph){ localStorage.setItem(`ph_products_${ph.id}`,JSON.stringify(v)); broadcastSync(); } };
  const setOrders = (v:any)=>{ setOrdersState(v); if(ph){ localStorage.setItem(`ph_orders_${ph.id}`,JSON.stringify(v)); broadcastSync(); } };
  const saveSocial = (v:any)=>{ setSocialState(v); if(ph){ localStorage.setItem(`ph_social_${ph.id}`,JSON.stringify(v)); broadcastSync(); } };
  const saveProfile = (d:any)=>{ setProfile(d); if(ph){ localStorage.setItem(`ph_profile_${ph.id}`,JSON.stringify(d)); broadcastSync(); } };

  const MENU = [{id:"dash",l:"لوحة التحكم",i:"📊"},{id:"acc",l:"حسابي",i:"👤"},{id:"inv",l:"المخزون",i:"📦"},
    {id:"orders",l:"الطلبات",i:"🛒"},{id:"sub",l:"الاشتراك",i:"💎"},{id:"fin",l:"المالية",i:"💰"},
    {id:"social",l:"وسائل التواصل",i:"📱"},{id:"sup",l:"الدعم",i:"💬"}];

  if (!ph) return <Login onLogin={p=>{ setPh(p); setSec("dash"); }} />;
  return (
    <div dir="rtl" style={{ display:"flex", height:"100vh", fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", overflow:"hidden" }}>
      <Sidebar color={C.primary} icon="💊" title="بوابة الصيدلية" name={ph.name}
        menu={MENU} active={sec} onNav={setSec} onLogout={()=>setPh(null)} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <TopBar color={C.primary} label={MENU.find(m=>m.id===sec)?.l||""} name={ph.name} />
        <div style={{ flex:1, overflowY:"auto", padding:20, background:C.bg }}>
          {sec==="dash"   && <PhDash ph={ph} products={products} orders={orders} />}
          {sec==="acc"    && <PhAccount ph={profile||ph} onSave={saveProfile} />}
          {sec==="inv"    && <Inventory products={products} onUpdate={setProducts} color={C.primary} />}
          {sec==="orders" && <Orders orders={orders} onUpdate={setOrders} color={C.primary} />}
          {sec==="sub"    && <SubPage plan={ph.plan} color={C.primary} />}
          {sec==="fin"    && <FinPage revenue={ph.revenue} color={C.primary} />}
          {sec==="social" && <SocialMedia social={social} onSave={saveSocial} color={C.primary} name={ph.name} />}
          {sec==="sup"    && <Support name={ph.name} color={C.primary} />}
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin }:{ onLogin:(p:any)=>void }) {
  const [phone,setPhone]=useState(""); const [pass,setPass]=useState(""); const [err,setErr]=useState("");
  const login=()=>{ const p=PHARMACIES.find(p=>p.phone===phone.trim()&&p.pass===pass.trim()); p?onLogin(p):setErr("رقم الهاتف أو كلمة المرور غير صحيحة"); };
  return (
    <div dir="rtl" style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif" }}>
      <div style={{ background:`linear-gradient(135deg,${C.primary},${C.dark})`, padding:"48px 24px 70px", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:8 }}>💊</div>
        <h1 style={{ color:"#fff", fontSize:32, fontWeight:900, margin:0 }}>بوابة الصيدليات</h1>
        <p style={{ color:"rgba(255,255,255,0.8)", fontSize:14, margin:"8px 0 0" }}>دواء+ — منصة إدارة الصيدلية</p>
      </div>
      <div style={{ maxWidth:420, margin:"-32px auto 0", padding:"0 20px 40px" }}>
        <div style={{ background:C.surface, borderRadius:20, padding:"28px 24px", boxShadow:"0 8px 40px rgba(0,0,0,0.12)", marginBottom:18 }}>
          <h2 style={{ textAlign:"center", fontSize:18, fontWeight:800, margin:"0 0 20px" }}>تسجيل الدخول</h2>
          <Inp label="رقم الهاتف" val={phone} set={setPhone} ph="07xxxxxxxxx" />
          <Inp label="كلمة المرور" val={pass} set={setPass} ph="••••••" type="password" />
          {err && <div style={{ background:"#FFF5F5", border:"1px solid #FED7D7", borderRadius:8, padding:"8px 12px", fontSize:12, color:C.red, marginBottom:10 }}>{err}</div>}
          <Btn label="دخول →" color={C.primary} onClick={login} full />
        </div>
        <div style={{ background:C.surface, borderRadius:16, padding:"16px 18px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:12, color:C.muted, textAlign:"center", marginBottom:10 }}>🔑 صيدليات مسجّلة — اضغط للدخول</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {PHARMACIES.map(p=>(
              <button key={p.id} onClick={()=>onLogin(p)} style={{ background:C.light, border:`1px solid ${C.primary}30`, borderRadius:10, padding:"10px 14px", cursor:"pointer", textAlign:"right", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontWeight:700, color:C.primary, fontSize:13 }}>💊 {p.name}</span>
                <span style={{ fontSize:11, color:C.muted }}>{p.city} · {p.phone}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhDash({ ph, products, orders }:any) {
  const lowStock = products.filter((p:any)=>p.qty<10).length;
  return (
    <div>
      <AppSync text={`مرحباً ${ph.name}! بياناتك متزامنة مع تطبيق دواء+`} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:18 }}>
        <Stat icon="📦" label="منتج في المخزون" value={products.length} color={C.primary} />
        <Stat icon="🛒" label="طلبات اليوم" value={orders.filter((o:any)=>o.date==="2025-04-04").length} change="+جديد" color={C.primary} />
        <Stat icon="⚠️" label="مخزون ينفد" value={lowStock} color={lowStock>0?C.red:C.green} />
        <Stat icon="💰" label="إيراد الشهر" value={`${(ph.revenue/1000000).toFixed(1)}M`} color={C.primary} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Card><SH icon="🛒" title="آخر الطلبات" />
          {orders.slice(0,4).map((o:any)=>(
            <div key={o.id} style={{ padding:"8px 0", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div><div style={{ fontWeight:700, fontSize:12, color:C.primary }}>{o.id}</div><div style={{ fontSize:12 }}>{o.product}</div></div>
              <Bdg {...orderBadge(o.status)} />
            </div>
          ))}
        </Card>
        <Card><SH icon="⚠️" title="مخزون ينفد" />
          {products.filter((p:any)=>p.qty<10).map((p:any)=>(
            <div key={p.id} style={{ padding:"8px 0", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12 }}>{p.name}</span>
              <span style={{ fontWeight:700, color:C.red, fontSize:12 }}>{p.qty} {p.unit}</span>
            </div>
          ))}
          {products.filter((p:any)=>p.qty<10).length===0 && <div style={{ fontSize:13, color:C.muted, textAlign:"center", padding:12 }}>✅ المخزون بحالة جيدة</div>}
        </Card>
      </div>
    </div>
  );
}

function PhAccount({ ph, onSave }:any) {
  const [f,setF]=useState({...ph}); const [saved,setSaved]=useState(false);
  const save=()=>{ onSave(f); setSaved(true); setTimeout(()=>setSaved(false),3000); };
  return (
    <div><AppSync text="تعديل بياناتك هنا يُحدّثها في التطبيق ولدى مدير المنصة" />
      <Card style={{ maxWidth:560 }}>
        <SH icon="👤" title="معلومات الصيدلية" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          {([["name","الاسم التجاري"],["city","المدينة"],["phone","رقم الهاتف"],["address","العنوان"],["license","رقم الرخصة"],["email","البريد الإلكتروني"]] as const).map(([k,l])=>(
            <div key={k} style={{ gridColumn:k==="address"||k==="email"?"span 2":"auto" }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:3 }}>{l}</label>
              <input value={f[k]||""} onChange={e=>setF({...f,[k]:e.target.value})}
                style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }} />
            </div>
          ))}
        </div>
        <Btn label={saved?"✅ تم الحفظ والمزامنة!":"💾 حفظ ومزامنة"} color={saved?C.green:C.primary} onClick={save} full />
      </Card>
    </div>
  );
}

function Inventory({ products, onUpdate, color }:any) {
  const [showAdd,setShowAdd]=useState(false);
  const [newP,setNewP]=useState({ name:"", qty:"", price:"", expiry:"", unit:"علبة", category:"" });
  const [saved,setSaved]=useState(false);
  const save=()=>{ setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const addItem=()=>{
    onUpdate([...products,{ id:`p${Date.now()}`, name:newP.name, qty:Number(newP.qty), price:Number(newP.price), expiry:newP.expiry, unit:newP.unit, category:newP.category }]);
    setNewP({ name:"",qty:"",price:"",expiry:"",unit:"علبة",category:"" }); setShowAdd(false);
  };
  const updateQty=(id:string,qty:number)=>onUpdate(products.map((p:any)=>p.id===id?{...p,qty}:p));
  const del=(id:string)=>onUpdate(products.filter((p:any)=>p.id!==id));
  return (
    <div>
      <AppSync text="المخزون متزامن مع تطبيق دواء+ — ما تعدّله هنا يظهر للعملاء فوراً" />
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <button onClick={()=>setShowAdd(v=>!v)} style={{ background:color, color:"#fff", border:"none", borderRadius:9, padding:"8px 16px", fontWeight:700, cursor:"pointer" }}>+ إضافة منتج</button>
        <button onClick={save} style={{ background:saved?C.green:C.muted, color:"#fff", border:"none", borderRadius:9, padding:"8px 16px", fontWeight:700, cursor:"pointer" }}>
          {saved?"✅ محفوظ":"💾 حفظ"}
        </button>
      </div>
      {showAdd && <Card style={{ marginBottom:12, border:`2px solid ${color}` }}>
        <SH icon="➕" title="منتج جديد" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
          {([["name","اسم المنتج"],["qty","الكمية"],["price","السعر (د.ع)"],["expiry","تاريخ الانتهاء"],["unit","الوحدة"],["category","الفئة"]] as const).map(([k,l])=>(
            <div key={k}><label style={{ fontSize:11,color:C.muted,display:"block",marginBottom:2 }}>{l}</label>
              <input value={(newP as any)[k]} onChange={e=>setNewP({...newP,[k]:e.target.value})}
                style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:7, padding:"7px 9px", fontSize:12, boxSizing:"border-box" }} /></div>
          ))}
        </div>
        <Btn label="إضافة" color={color} onClick={addItem} />
      </Card>}
      <Card><table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead><tr style={{ background:C.bg }}>
          {["المنتج","الفئة","الكمية","السعر","الانتهاء","الحالة",""].map(h=><th key={h} style={{ padding:"8px 10px", textAlign:"right", color:C.muted, borderBottom:`2px solid ${C.border}` }}>{h}</th>)}
        </tr></thead>
        <tbody>{products.map((p:any,i:number)=>(
          <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2?C.bg:C.surface }}>
            <td style={{ padding:"8px 10px", fontWeight:700 }}>{p.name}</td>
            <td style={{ padding:"8px 10px", color:C.muted }}>{p.category}</td>
            <td style={{ padding:"8px 10px" }}>
              <input type="number" value={p.qty} onChange={e=>updateQty(p.id,Number(e.target.value))}
                style={{ width:60, border:`1px solid ${p.qty<10?C.red:C.border}`, borderRadius:6, padding:"3px 6px", fontSize:12, fontWeight:700, color:p.qty<10?C.red:C.text }} />
            </td>
            <td style={{ padding:"8px 10px" }}>{p.price.toLocaleString()} د.ع</td>
            <td style={{ padding:"8px 10px", color:C.muted }}>{p.expiry}</td>
            <td style={{ padding:"8px 10px" }}>{p.qty<10?<Bdg l="ينفد" c={C.red} b="#FFF5F5" />:<Bdg l="متوفر" c={C.green} b="#F0FFF4" />}</td>
            <td style={{ padding:"8px 10px" }}><button onClick={()=>del(p.id)} style={{ background:"#FFF5F5",color:C.red,border:"none",borderRadius:6,padding:"2px 8px",cursor:"pointer",fontSize:11 }}>حذف</button></td>
          </tr>
        ))}</tbody>
      </table></Card>
    </div>
  );
}

function Orders({ orders, onUpdate, color }:any) {
  const update=(id:string,status:string)=>onUpdate(orders.map((o:any)=>o.id===id?{...o,status}:o));
  return (
    <div>
      <AppSync text="الطلبات تصل من تطبيق دواء+ مباشرة — حدّث حالتها هنا" />
      <Card><SH icon="🛒" title={`الطلبات (${orders.length})`} />
        {orders.map((o:any)=>(
          <div key={o.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
            <div>
              <div style={{ fontWeight:700, color, fontSize:13 }}>{o.id}</div>
              <div style={{ fontSize:13 }}>{o.product}</div>
              <div style={{ fontSize:11, color:C.muted }}>{o.customer} · {o.date}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontWeight:700 }}>{o.amount.toLocaleString()} د.ع</span>
              <select value={o.status} onChange={e=>update(o.id,e.target.value)}
                style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 9px", fontSize:12, cursor:"pointer" }}>
                <option value="new">جديد</option><option value="processing">قيد التجهيز</option>
                <option value="completed">مكتمل</option><option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SubPage({ plan, color }:any) {
  const plans=[
    { id:"free",name:"مجاني",price:0,features:["5 منتجات","طلبات محدودة","دعم أساسي"] },
    { id:"standard",name:"ستاندرد",price:25000,features:["200 منتج","طلبات غير محدودة","دعم أولوية","تقارير شهرية"] },
    { id:"premium",name:"بريميوم ✨",price:65000,features:["منتجات غير محدودة","دعم 24/7","مدير حساب خاص","إعلانات في التطبيق","تقارير تفصيلية"] },
  ];
  const [up,setUp]=useState<string|null>(null);
  return (
    <div><AppSync text="ترقية اشتراكك تُفعَّل فوراً في التطبيق وتظهر لمدير المنصة" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
        {plans.map(p=>(
          <Card key={p.id} style={{ border:`2px solid ${p.id===plan?color:C.border}`, position:"relative" }}>
            {p.id===plan&&<div style={{ position:"absolute",top:-10,right:14,background:color,color:"#fff",borderRadius:9,padding:"2px 10px",fontSize:11,fontWeight:700 }}>اشتراكك الحالي</div>}
            <div style={{ fontWeight:800,fontSize:17,marginBottom:4 }}>{p.name}</div>
            <div style={{ fontSize:20,fontWeight:900,color,marginBottom:12 }}>{p.price===0?"مجاني":`${p.price.toLocaleString()} د.ع/شهر`}</div>
            {p.features.map(f=><div key={f} style={{ fontSize:12,marginBottom:5,display:"flex",gap:5 }}><span style={{ color:C.green }}>✓</span>{f}</div>)}
            {p.id!==plan&&<Btn label={up===p.id?"⏳ جاري الترقية...":"ترقية الآن"} color={color} onClick={()=>{ setUp(p.id); setTimeout(()=>setUp(null),1500); }} />}
          </Card>
        ))}
      </div>
    </div>
  );
}

function FinPage({ revenue, color }:any) {
  const rows=[
    { m:"زين كاش",ref:"ZC-0401",amount:Math.round(revenue*0.25),date:"2025-04-01" },
    { m:"فاست باي",ref:"FP-0315",amount:Math.round(revenue*0.15),date:"2025-03-15" },
    { m:"FIB",ref:"FI-0301",amount:Math.round(revenue*0.35),date:"2025-03-01" },
  ];
  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16 }}>
        <Stat icon="💰" label="الإجمالي" value={`${(revenue/1000000).toFixed(1)}M د.ع`} color={color} />
        <Stat icon="📅" label="هذا الشهر" value={`${(revenue*0.28/1000000).toFixed(2)}M`} change="+8%" color={color} />
        <Stat icon="⏳" label="معلّق" value={`${Math.round(revenue*0.05/1000)}K`} color={C.orange} />
      </div>
      <Card><SH icon="📋" title="سجل المدفوعات" />
        {rows.map((r,i)=>(
          <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.border}`,alignItems:"center" }}>
            <div><div style={{ fontWeight:700,fontSize:13 }}>{r.m}</div><div style={{ fontSize:11,color:C.muted }}>Ref: {r.ref} · {r.date}</div></div>
            <div style={{ textAlign:"left" }}><div style={{ fontWeight:800,color:C.green }}>{r.amount.toLocaleString()} د.ع</div><Bdg l="مكتمل" c={C.green} b="#F0FFF4" /></div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SocialMedia({ social, onSave, color, name }:any) {
  const [f, setF] = useState({...social});
  const [saved, setSaved] = useState(false);
  useEffect(()=>setF({...social}),[social]);
  const save=()=>{ onSave(f); setSaved(true); setTimeout(()=>setSaved(false),3000); };
  const FIELDS = [
    { k:"facebook",  l:"Facebook",  icon:"📘", ph:"pharmacy.name", prefix:"facebook.com/", color:"#1877F2" },
    { k:"instagram", l:"Instagram", icon:"📸", ph:"pharmacy_name", prefix:"instagram.com/@", color:"#E4405F" },
    { k:"tiktok",    l:"TikTok",    icon:"🎵", ph:"pharmacyname",  prefix:"tiktok.com/@",  color:"#010101" },
    { k:"website",   l:"الموقع الإلكتروني", icon:"🌐", ph:"https://dawaplus.iq/pharmacy", prefix:"", color:"#3182CE" },
    { k:"whatsapp",  l:"WhatsApp",  icon:"💬", ph:"07xxxxxxxxx",   prefix:"wa.me/",        color:"#25D366" },
  ];
  return (
    <div>
      <AppSync text="روابط التواصل الاجتماعي تظهر في تطبيق دواء+ أمام عملائك" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <Card style={{ border:`2px solid ${color}` }}>
          <SH icon="📱" title={`روابط التواصل — ${name}`} />
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {FIELDS.map(field=>(
              <div key={field.k}>
                <label style={{ fontSize:12, fontWeight:700, color:field.color, display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                  {field.icon} {field.l}
                </label>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input value={f[field.k]||""} onChange={e=>setF({...f,[field.k]:e.target.value})}
                    placeholder={field.ph}
                    style={{ flex:1, border:`1.5px solid ${C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }} />
                  {f[field.k] && <a href={field.k==="website"?(f[field.k].startsWith("http")?f[field.k]:`https://${f[field.k]}`):field.k==="whatsapp"?`https://wa.me/${f[field.k].replace(/\D/g,"")}`:`https://${field.prefix}${f[field.k]}`} target="_blank" rel="noreferrer"
                    style={{ background:field.color, color:"#fff", borderRadius:9, padding:"8px 12px", fontSize:12, fontWeight:700, textDecoration:"none", whiteSpace:"nowrap" }}>معاينة</a>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14 }}>
            <Btn label={saved?"✅ تم الحفظ والمزامنة مع التطبيق!":"💾 حفظ ومزامنة مع التطبيق"} color={saved?C.green:color} onClick={save} full />
          </div>
        </Card>
        <Card>
          <SH icon="👁️" title="معاينة كما يراها العملاء" />
          <div style={{ background:C.bg, borderRadius:12, padding:16 }}>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:4 }}>💊 {name}</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>تواصل معنا على:</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {FIELDS.map(field=>f[field.k]&&(
                <div key={field.k} style={{ background:"#fff", border:`1.5px solid ${field.color}`, borderRadius:10, padding:"7px 12px", display:"flex", gap:6, alignItems:"center", fontSize:13, fontWeight:600, color:field.color }}>
                  {field.icon} {field.l}
                </div>
              ))}
              {!FIELDS.some(field=>f[field.k]) && <div style={{ fontSize:12, color:C.muted }}>أضف روابط لتظهر هنا</div>}
            </div>
          </div>
          <div style={{ marginTop:14, background:"#F0FFF4", borderRadius:10, padding:"10px 14px", fontSize:12, color:C.green }}>
            ✅ سيرى العملاء هذه الأزرار في صفحة صيدليتك بالتطبيق
          </div>
        </Card>
      </div>
    </div>
  );
}

function Support({ name, color }:any) {
  const [tab,setTab]=useState<"t"|"m"|"c">("t");
  const [msg,setMsg]=useState(""); const [sent,setSent]=useState(false);
  const send=()=>{ setSent(true); setMsg(""); setTimeout(()=>setSent(false),4000); };
  const tickets=[
    { id:"TK-001",title:"مشكلة في الطلبات",status:"open",date:"2025-04-03",reply:"نحن ندرس مشكلتك..." },
    { id:"TK-002",title:"سؤال عن الاشتراك",status:"resolved",date:"2025-04-01",reply:"تم الحل، راجع قسم الاشتراك." },
  ];
  return (
    <div>
      <div style={{ display:"flex",gap:8,marginBottom:14 }}>
        {([["t","🎫 التذاكر"],["m","💬 تواصل مع المدير"],["c","📞 التواصل"]] as const).map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ background:tab===id?color:"#EDF2F7",color:tab===id?"#fff":C.text,border:"none",borderRadius:9,padding:"8px 16px",fontWeight:700,cursor:"pointer",fontSize:13 }}>{l}</button>
        ))}
      </div>
      {tab==="t" && <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
        {tickets.map(t=>(
          <Card key={t.id}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
              <span style={{ fontWeight:700,color }}>{t.id} — {t.title}</span>
              <Bdg l={t.status==="open"?"مفتوحة":"محلولة"} c={t.status==="open"?C.orange:C.green} b={t.status==="open"?"#FFF3E0":"#F0FFF4"} />
            </div>
            <div style={{ fontSize:12,color:C.muted }}>{t.reply}</div>
            <div style={{ fontSize:11,color:C.muted,marginTop:4 }}>{t.date}</div>
          </Card>
        ))}
        <Card><SH icon="✍️" title="تذكرة جديدة" />
          <input placeholder="الموضوع" style={{ width:"100%",border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",marginBottom:8,fontSize:13,boxSizing:"border-box" }} />
          <textarea placeholder="وصف المشكلة..." rows={3} style={{ width:"100%",border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,resize:"vertical",boxSizing:"border-box",marginBottom:8 }} />
          <Btn label="إرسال" color={color} onClick={()=>{}} />
        </Card>
      </div>}
      {tab==="m" && <Card>
        <SH icon="💬" title={`رسالة لمدير المنصة — ${name}`} />
        <div style={{ background:C.bg,borderRadius:10,padding:14,minHeight:80,marginBottom:10,fontSize:13,color:C.muted }}>مرحباً! كيف يمكننا مساعدتك؟ 👋</div>
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3} placeholder="اكتب رسالتك..."
          style={{ width:"100%",border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,resize:"vertical",boxSizing:"border-box",marginBottom:8 }} />
        <Btn label={sent?"✅ تم الإرسال!":"📨 إرسال للمدير"} color={sent?C.green:color} onClick={send} />
        {sent&&<div style={{ color:C.green,fontSize:12,marginTop:8 }}>✅ وصلت رسالتك، سيرد المدير قريباً</div>}
      </Card>}
      {tab==="c" && <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12 }}>
        {[{i:"📞",l:"هاتف",v:"+964 770 000 0001",a:"tel:+9647700000001"},{i:"💬",l:"واتساب",v:"+964 770 000 0001",a:"https://wa.me/9647700000001"},{i:"📧",l:"بريد",v:"admin@dawaplus.iq",a:"mailto:admin@dawaplus.iq"}].map(c=>(
          <Card key={c.l} style={{ textAlign:"center" }}>
            <div style={{ fontSize:32,marginBottom:8 }}>{c.i}</div>
            <div style={{ fontWeight:700,fontSize:13,marginBottom:3 }}>{c.l}</div>
            <div style={{ fontSize:11,color:C.muted,marginBottom:10 }}>{c.v}</div>
            <a href={c.a} target="_blank" rel="noreferrer" style={{ background:color,color:"#fff",borderRadius:9,padding:"7px 14px",fontSize:12,fontWeight:700,textDecoration:"none" }}>تواصل</a>
          </Card>
        ))}
      </div>}
    </div>
  );
}

function Sidebar({ color,icon,title,name,menu,active,onNav,onLogout }:any) {
  const [open,setOpen]=useState(true);
  return (
    <div style={{ width:open?220:60,background:"#1a202c",display:"flex",flexDirection:"column",transition:"width 0.2s",flexShrink:0,overflow:"hidden" }}>
      <div style={{ padding:"14px 12px",borderBottom:"1px solid #2d3748",display:"flex",alignItems:"center",gap:8 }}>
        <span style={{ fontSize:22,flexShrink:0 }}>{icon}</span>
        {open&&<div style={{ flex:1 }}><div style={{ color:"#fff",fontSize:12,fontWeight:800,whiteSpace:"nowrap" }}>{title}</div><div style={{ color:"#A0AEC0",fontSize:10,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{name}</div></div>}
        <button onClick={()=>setOpen(v=>!v)} style={{ background:"none",border:"none",color:"#A0AEC0",cursor:"pointer",fontSize:16,flexShrink:0,marginRight:open?"0":"auto" }}>☰</button>
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:"6px 0" }}>
        {menu.map((m:any)=>(
          <button key={m.id} onClick={()=>onNav(m.id)} style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:active===m.id?`${color}25`:"none",border:"none",cursor:"pointer",textAlign:"right",borderRight:active===m.id?`3px solid ${color}`:"3px solid transparent" }}>
            <span style={{ fontSize:17,flexShrink:0 }}>{m.i}</span>
            {open&&<span style={{ color:active===m.id?"#fff":"#A0AEC0",fontSize:13,fontWeight:active===m.id?700:400,whiteSpace:"nowrap" }}>{m.l}</span>}
          </button>
        ))}
      </div>
      <button onClick={onLogout} style={{ padding:14,background:"none",border:"none",borderTop:"1px solid #2d3748",color:"#A0AEC0",cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:13 }}>
        <span>🚪</span>{open&&<span>تسجيل الخروج</span>}
      </button>
    </div>
  );
}
function TopBar({ color,label,name }:any) {
  return (
    <div style={{ background:"#fff",borderBottom:`1px solid ${C.border}`,padding:"0 20px",height:56,display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
      <div style={{ flex:1 }}><span style={{ fontWeight:800,fontSize:15 }}>{label}</span></div>
      <div style={{ display:"flex",alignItems:"center",gap:6,background:`${color}12`,borderRadius:20,padding:"5px 12px",border:`1px solid ${color}30` }}>
        <span style={{ width:7,height:7,borderRadius:"50%",background:C.green,display:"block" }} />
        <span style={{ fontSize:11,color,fontWeight:700 }}>📱 متزامن مع التطبيق</span>
      </div>
    </div>
  );
}
function AppSync({ text }:any) {
  return <div style={{ background:"#EBF8FF",border:"1px solid #90CDF4",borderRadius:10,padding:"9px 14px",display:"flex",gap:8,alignItems:"center",marginBottom:14 }}><span>📱</span><span style={{ fontSize:12,color:"#2C5282" }}>{text}</span></div>;
}
function Card({ children,style }:any) {
  return <div style={{ background:C.surface,borderRadius:14,padding:18,boxShadow:"0 2px 8px rgba(0,0,0,0.05)",...style }}>{children}</div>;
}
function SH({ icon,title }:any) {
  return <h3 style={{ fontSize:15,fontWeight:800,color:C.text,margin:"0 0 14px",display:"flex",alignItems:"center",gap:7 }}><span>{icon}</span>{title}</h3>;
}
function Stat({ icon,label,value,change,color }:any) {
  return <div style={{ background:C.surface,borderRadius:14,padding:"16px 18px",borderTop:`3px solid ${color}`,boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}><span style={{ fontSize:22 }}>{icon}</span>{change&&<span style={{ fontSize:10,color:C.green,fontWeight:700,background:"#F0FFF4",borderRadius:6,padding:"2px 7px" }}>{change}</span>}</div>
    <div style={{ fontSize:20,fontWeight:900,color:C.text }}>{value}</div>
    <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{label}</div>
  </div>;
}
function Bdg({ l,c,b }:any) { return <span style={{ background:b,color:c,borderRadius:7,padding:"2px 9px",fontSize:11,fontWeight:700 }}>{l}</span>; }
function Btn({ label,color,onClick,full }:any) {
  return <button onClick={onClick} style={{ background:color,color:"#fff",border:"none",borderRadius:9,padding:"10px 20px",fontWeight:700,cursor:"pointer",fontSize:13,width:full?"100%":"auto" }}>{label}</button>;
}
function Inp({ label,val,set,ph,type }:any) {
  return <div style={{ marginBottom:10 }}>
    <label style={{ fontSize:12,fontWeight:700,color:C.muted,display:"block",marginBottom:3 }}>{label}</label>
    <input type={type||"text"} value={val} onChange={(e:any)=>set(e.target.value)} placeholder={ph}
      style={{ width:"100%",border:`1.5px solid ${C.border}`,borderRadius:9,padding:"10px 12px",fontSize:13,boxSizing:"border-box" }} />
  </div>;
}

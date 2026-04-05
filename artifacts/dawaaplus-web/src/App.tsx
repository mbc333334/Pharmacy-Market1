import React, { useState, useEffect, useCallback, useRef } from "react";
import LandingPage from "./pages/LandingPage";
import { api } from "./api";

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

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const SUPER_ADMIN = { phone:"admin", password:"admin", name:"مدير المنصة", role:"superadmin" };
const rdLS = (k:string,d:any)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch{ return d; } };
const wrLS = (k:string,v:any)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} };
function getAdminAccounts(){ return rdLS("admin_accounts",[]) as any[]; }
function getPlatformPaymentAccounts(){
  const saved = rdLS("platform_payment_accounts", null);
  if (saved && Array.isArray(saved) && saved.length>0) return saved;
  return [
    { id:"zainCash",   label:"زين كاش",     icon:"📱", color:"#8B1538", num:"07501000001", hint:"أرسل المبلغ ثم ضع رقم العملية" },
    { id:"fastPay",    label:"فاست باي",    icon:"⚡", color:"#0066CC", num:"07509000001", hint:"احتفظ بصورة الإيصال" },
    { id:"fib",        label:"FIB",         icon:"🏦", color:"#004E87", num:"IQ98FIBK0000001", hint:"تحويل مصرفي عبر تطبيق FIB" },
    { id:"asiaHawala", label:"آسيا حوالة", icon:"💳", color:"#B45309", num:"AH-DAWAPLUS-001", hint:"أذكر اسم المستفيد: دواء+" },
    { id:"cashAdmin",  label:"كاش / واتساب",icon:"💵", color:"#38A169", num:"07501234567",   hint:"تواصل مع المدير مباشرة" },
  ];
}
function getSuperAdminPassword(){ return rdLS("admin_super_password", SUPER_ADMIN.password) as string; }
function loginCheck(phone:string, pass:string): { name:string; role:string; phone?:string } | null {
  // Super admin: accept both hardcoded password AND any overridden password stored in localStorage
  if (phone.trim()===SUPER_ADMIN.phone) {
    const customPass = getSuperAdminPassword();
    if (pass.trim()===SUPER_ADMIN.password || pass.trim()===customPass)
      return { name:SUPER_ADMIN.name, role:"superadmin", phone:SUPER_ADMIN.phone };
  }
  const accounts = getAdminAccounts();
  const found = accounts.find((a:any)=>a.phone===phone.trim() && a.password===pass.trim());
  return found ? { name:found.name, role:found.role, phone:found.phone } : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState<{name:string;role:string;phone?:string}|null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [db, setDB] = useState(() => readLiveDB());
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString("ar-IQ"));

  const refreshDB = useCallback(async () => {
    const local = readLiveDB();
    setDB(local);
    setLastSync(new Date().toLocaleTimeString("ar-IQ"));
    // Also sync from API
    try {
      const [phs, whs, dcs] = await Promise.all([
        api.getPharmacies(),
        api.getWarehouses(),
        api.getDeliveryCompanies(),
      ]);
      if (phs?.length || whs?.length || dcs?.length) {
        setDB(prev => ({
          ...prev,
          ...(phs?.length ? { pharmacies: phs } : {}),
          ...(whs?.length ? { warehouses: whs } : {}),
          ...(dcs?.length ? { deliveries: dcs } : {}),
        }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshDB();
    let bc: BroadcastChannel | null = null;
    try { bc = new BroadcastChannel("dawapl_sync"); bc.onmessage = () => refreshDB(); } catch {}
    const interval = setInterval(refreshDB, 15000);
    return () => { bc?.close(); clearInterval(interval); };
  }, [refreshDB, user]);

  if (user) return (
    <div dir="rtl" style={{ fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", minHeight:"100vh", background:C.bg }}>
      <AdminPortal db={db} lastSync={lastSync} onRefresh={refreshDB} onLogout={()=>setUser(null)} user={user} />
    </div>
  );

  if (showLogin) return (
    <div dir="rtl" style={{ fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", minHeight:"100vh", background:C.bg }}>
      <LoginScreen onLogin={(u) => { setUser(u); setShowLogin(false); }} onBack={() => setShowLogin(false)} />
    </div>
  );

  return <LandingPage onAdminLogin={() => setShowLogin(true)} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN — ADMIN ONLY
// ═══════════════════════════════════════════════════════════════════════════════
function AdminRecoveryModal({ onClose }:{ onClose:()=>void }) {
  const [tab, setTab] = useState<"super"|"supervisor">("super");
  const [spStep, setSpStep] = useState<"info"|"otp"|"pass"|"done">("info");
  const [supNew, setSupNew] = useState(""); const [supConfirm, setSupConfirm] = useState(""); const [supErr, setSupErr] = useState("");
  const [spOtp, setSpOtp] = useState(""); const [spOtpIn, setSpOtpIn] = useState(""); const [spTimer, setSpTimer] = useState(0);
  const spRef = useRef<any>(null);
  useEffect(()=>{ if(spTimer<=0){ if(spRef.current){clearInterval(spRef.current);spRef.current=null;}return; }
    spRef.current=setInterval(()=>setSpTimer(v=>v-1),1000); return()=>{ if(spRef.current){clearInterval(spRef.current);spRef.current=null;} }; },[spTimer]);
  const genOtp=()=>String(Math.floor(100000+Math.random()*900000));
  const startSpOtp=()=>{ const c=genOtp(); setSpOtp(c); setSpOtpIn(""); setSupErr(""); setSpTimer(60); setSpStep("otp"); };
  const verifySpOtp=()=>{ if(spOtpIn!==spOtp){setSupErr("رمز التحقق غير صحيح");return;} setSupErr(""); setSpStep("pass"); };
  const saveSpPass=()=>{ if(!supNew||supNew!==supConfirm){setSupErr("كلمتا المرور غير متطابقتين");return;}
    wrLS("admin_super_password",supNew); setSupErr(""); setSpStep("done"); };
  const resetSpToDefault=()=>{ localStorage.removeItem("admin_super_password"); setSpStep("done"); setSupErr(""); };

  // Supervisor recovery
  const [svPhone, setSvPhone] = useState(""); const [svErr, setSvErr] = useState(""); const [svFound, setSvFound] = useState<any>(null);
  const [svNew, setSvNew] = useState(""); const [svConfirm, setSvConfirm] = useState(""); const [svSaved, setSvSaved] = useState(false);
  const findSv=()=>{ const accs:any[]=rdLS("admin_accounts",[]); const a=accs.find((x:any)=>x.phone===svPhone.trim());
    if(!a){setSvErr("لا يوجد مشرف بهذا الرقم في النظام");setSvFound(null);}else{setSvErr("");setSvFound(a);} };
  const saveSvPass=()=>{ if(!svNew||svNew!==svConfirm){setSvErr("كلمتا المرور غير متطابقتين");return;}
    const accs:any[]=rdLS("admin_accounts",[]); const updated=accs.map((x:any)=>x.phone===svFound.phone?{...x,password:svNew}:x);
    wrLS("admin_accounts",updated); setSvSaved(true); setSvErr(""); };

  const ov:React.CSSProperties={position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif"};
  const card:React.CSSProperties={background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:440,direction:"rtl",position:"relative",boxShadow:"0 20px 60px rgba(0,0,0,0.25)",maxHeight:"90vh",overflowY:"auto"};
  const inp:React.CSSProperties={width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,textAlign:"right",outline:"none",boxSizing:"border-box",marginBottom:10};
  const btn=(bg:string,op=1):React.CSSProperties=>({background:bg,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",width:"100%",fontWeight:800,fontSize:14,cursor:"pointer",marginTop:6,opacity:op});
  return (
    <div style={ov} onClick={onClose}>
      <div style={card} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{position:"absolute",top:14,left:14,background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#718096"}}>✕</button>
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{fontSize:44,marginBottom:6}}>🛡️</div>
          <h3 style={{margin:0,fontSize:18,fontWeight:900}}>استرداد بيانات الدخول</h3>
          <p style={{margin:"4px 0 0",fontSize:12,color:"#718096"}}>اختر نوع الحساب</p>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {([["super","مدير المنصة"],["supervisor","مشرف"]] as const).map(([k,l])=>(
            <button key={k} onClick={()=>{setTab(k);setSpStep("info");setSvFound(null);setSvSaved(false);setSvPhone("");setSvErr("");setSupErr("");}}
              style={{flex:1,padding:"10px 0",borderRadius:10,border:`2px solid ${tab===k?"#7C3AED":"#e2e8f0"}`,
                background:tab===k?"#F3F0FF":"#fff",color:tab===k?"#7C3AED":"#718096",fontWeight:700,cursor:"pointer",fontSize:13}}>{l}</button>
          ))}
        </div>

        {tab==="super" && <>
          {spStep==="info" && <>
            <div style={{background:"#F3F0FF",border:"1.5px solid #7C3AED40",borderRadius:14,padding:16,marginBottom:14}}>
              <div style={{fontWeight:800,color:"#7C3AED",marginBottom:8,fontSize:14}}>🔐 بيانات مدير المنصة الافتراضية</div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
                <span style={{background:"#e2e8f0",borderRadius:6,padding:"2px 10px",fontFamily:"monospace",fontWeight:700}}>admin</span>
                <span style={{color:"#718096"}}>المعرّف:</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                <span style={{background:"#e2e8f0",borderRadius:6,padding:"2px 10px",fontFamily:"monospace",fontWeight:700}}>admin</span>
                <span style={{color:"#718096"}}>كلمة المرور الافتراضية:</span>
              </div>
            </div>
            <div style={{fontSize:12,color:"#718096",textAlign:"center",marginBottom:14}}>
              إذا كنت قد غيّرت كلمة المرور وتريد إعادتها للافتراضية، اضغط هنا:
            </div>
            <button style={btn("#E53E3E")} onClick={resetSpToDefault}>↩ إعادة تعيين كلمة المرور للافتراضية (admin)</button>
            <div style={{margin:"12px 0",textAlign:"center",fontSize:12,color:"#718096"}}>— أو أنشئ كلمة مرور جديدة —</div>
            <button style={btn("#7C3AED")} onClick={startSpOtp}>📲 إرسال رمز التحقق لتعيين كلمة مرور جديدة</button>
          </>}
          {spStep==="otp" && <>
            <div style={{background:"#FFFBEB",border:"1.5px solid #F6AD55",borderRadius:14,padding:14,textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#744210",marginBottom:4}}>📱 رمز التحقق التجريبي</div>
              <div style={{fontSize:28,fontWeight:900,letterSpacing:8,color:"#744210"}}>{spOtp}</div>
              <div style={{fontSize:10,color:"#92400E",marginTop:4}}>سيُرسَل عبر SMS في التطبيق الفعلي</div>
            </div>
            <input style={{...inp,textAlign:"center",fontSize:20,letterSpacing:8,fontWeight:800}} placeholder="• • • • • •" maxLength={6}
              value={spOtpIn} onChange={e=>{setSupErr("");setSpOtpIn(e.target.value.replace(/\D/g,"").slice(0,6));}} />
            {supErr&&<div style={{color:"#E53E3E",fontSize:12,marginBottom:8}}>⚠️ {supErr}</div>}
            <div style={{textAlign:"left",marginBottom:10,fontSize:12}}>
              {spTimer>0?<span style={{color:"#718096"}}>⏱ إعادة الإرسال بعد {spTimer}ث</span>
                :<button onClick={()=>{const c=genOtp();setSpOtp(c);setSpOtpIn("");setSpTimer(60);}} style={{background:"none",border:"none",color:"#7C3AED",cursor:"pointer",textDecoration:"underline",padding:0,fontSize:12}}>إعادة الإرسال</button>}
            </div>
            <button style={btn("#7C3AED",spOtpIn.length<6?0.5:1)} onClick={verifySpOtp} disabled={spOtpIn.length<6}>✅ تحقق</button>
            <button onClick={()=>{setSpStep("info");setSupErr("");}} style={{background:"none",border:"none",width:"100%",marginTop:10,color:"#718096",cursor:"pointer",fontSize:13,textDecoration:"underline"}}>← العودة</button>
          </>}
          {spStep==="pass" && <>
            <input style={inp} type="password" placeholder="كلمة المرور الجديدة" value={supNew} onChange={e=>{setSupErr("");setSupNew(e.target.value);}} />
            <input style={{...inp,borderColor:supConfirm&&supConfirm!==supNew?"#E53E3E":"#e2e8f0"}} type="password" placeholder="تأكيد كلمة المرور" value={supConfirm} onChange={e=>{setSupErr("");setSupConfirm(e.target.value);}} />
            {supErr&&<div style={{color:"#E53E3E",fontSize:12,marginBottom:8}}>⚠️ {supErr}</div>}
            <button style={btn("#7C3AED",(!supNew||supNew!==supConfirm)?0.5:1)} onClick={saveSpPass} disabled={!supNew||supNew!==supConfirm}>🔒 حفظ كلمة المرور الجديدة</button>
          </>}
          {spStep==="done" && <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:56,marginBottom:8}}>✅</div>
            <div style={{fontWeight:900,color:"#38A169",fontSize:16,marginBottom:6}}>تم بنجاح!</div>
            <div style={{fontSize:12,color:"#718096",marginBottom:16}}>يمكنك الآن تسجيل الدخول بالبيانات الجديدة · المعرّف: admin</div>
            <button style={btn("#7C3AED")} onClick={onClose}>العودة لتسجيل الدخول</button>
          </div>}
        </>}

        {tab==="supervisor" && <>
          {!svFound && !svSaved && <>
            <p style={{fontSize:13,fontWeight:700,margin:"0 0 6px"}}>رقم هاتف المشرف</p>
            <input style={inp} placeholder="07xxxxxxxxx" value={svPhone} onChange={e=>{setSvErr("");setSvPhone(e.target.value);}} />
            {svErr&&<div style={{background:"#FFF5F5",border:"1px solid #FED7D7",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#E53E3E",marginBottom:8}}>⚠️ {svErr}</div>}
            <button style={btn("#7C3AED")} onClick={findSv}>🔍 البحث عن الحساب</button>
            <div style={{marginTop:14,background:"#FFFBEB",border:"1.5px solid #F6AD55",borderRadius:10,padding:12,fontSize:12,color:"#92400E"}}>
              ملاحظة: إعادة تعيين كلمة مرور المشرف تتطلب صلاحيات مدير المنصة فقط. إذا لم يكن لديك وصول، تواصل مع مدير المنصة مباشرةً.
            </div>
          </>}
          {svFound && !svSaved && <>
            <div style={{background:"#F3F0FF",border:"1.5px solid #7C3AED40",borderRadius:14,padding:14,marginBottom:14}}>
              <div style={{fontWeight:800,color:"#7C3AED",marginBottom:6}}>✅ تم العثور على الحساب</div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                <span style={{fontWeight:700}}>{svFound.name}</span><span style={{color:"#718096"}}>الاسم:</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                <span style={{fontFamily:"monospace",fontWeight:700}}>{svFound.phone}</span><span style={{color:"#718096"}}>رقم الهاتف:</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                <span style={{background:svFound.role==="superadmin"?"#7C3AED":"#3182CE",color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:11}}>{svFound.role==="superadmin"?"مدير":"مشرف"}</span>
                <span style={{color:"#718096"}}>الصلاحية:</span>
              </div>
            </div>
            <p style={{fontSize:13,fontWeight:700,margin:"0 0 6px"}}>كلمة المرور الجديدة</p>
            <input style={inp} type="password" placeholder="••••••••" value={svNew} onChange={e=>{setSvErr("");setSvNew(e.target.value);}} />
            <p style={{fontSize:13,fontWeight:700,margin:"0 0 6px"}}>تأكيد كلمة المرور</p>
            <input style={{...inp,borderColor:svConfirm&&svConfirm!==svNew?"#E53E3E":"#e2e8f0"}} type="password" placeholder="••••••••" value={svConfirm} onChange={e=>{setSvErr("");setSvConfirm(e.target.value);}} />
            {svErr&&<div style={{color:"#E53E3E",fontSize:12,marginBottom:8}}>⚠️ {svErr}</div>}
            <button style={btn("#7C3AED",(!svNew||svNew!==svConfirm)?0.5:1)} onClick={saveSvPass} disabled={!svNew||svNew!==svConfirm}>🔒 تعيين كلمة مرور جديدة</button>
            <button onClick={()=>{setSvFound(null);setSvPhone("");setSvErr("");}} style={{background:"none",border:"none",width:"100%",marginTop:10,color:"#718096",cursor:"pointer",fontSize:13,textDecoration:"underline"}}>← البحث مجدداً</button>
          </>}
          {svSaved && <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:56,marginBottom:8}}>✅</div>
            <div style={{fontWeight:900,color:"#38A169",fontSize:16,marginBottom:6}}>تم تغيير كلمة المرور!</div>
            <div style={{fontSize:12,color:"#718096",marginBottom:16}}>يمكن للمشرف الآن تسجيل الدخول بكلمة المرور الجديدة</div>
            <button style={btn("#7C3AED")} onClick={onClose}>العودة لتسجيل الدخول</button>
          </div>}
        </>}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onBack }: { onLogin:(u:{name:string;role:string})=>void; onBack?:()=>void }) {
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [loading, setLoading] = React.useState(false);
  const handle = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.login(phone.trim(), pass.trim());
      if(res?.user) { setLoading(false); onLogin(res.user); return; }
    } catch {}
    const result = loginCheck(phone, pass);
    if (result) { setError(""); onLogin(result); }
    else setError("رقم الهاتف أو كلمة المرور غير صحيحة");
    setLoading(false);
  };
  return (
    <div dir="rtl" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:C.bg, fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif" }}>
      {showRecovery && <AdminRecoveryModal onClose={()=>setShowRecovery(false)} />}
      <div style={{ background:`linear-gradient(135deg,${C.admin} 0%,#553C9A 100%)`, padding:"48px 24px 72px", textAlign:"center", position:"relative" }}>
        {onBack && (
          <button onClick={onBack} style={{
            position:"absolute", top:20, right:20, background:"rgba(255,255,255,0.15)",
            border:"1.5px solid rgba(255,255,255,0.3)", borderRadius:10,
            color:"#fff", padding:"7px 16px", fontSize:13, fontWeight:700, cursor:"pointer",
            display:"flex", alignItems:"center", gap:6,
          }}>← الصفحة الرئيسية</button>
        )}
        <div style={{ fontSize:56, marginBottom:8 }}>🛡️</div>
        <h1 style={{ color:"#fff", fontSize:32, fontWeight:900, margin:"8px 0 4px" }}>بوابة المدير</h1>
        <p style={{ color:"rgba(255,255,255,0.8)", fontSize:14, margin:0 }}>دواء+ — منظومة إدارة المنصة المتكاملة</p>
      </div>
      <div style={{ maxWidth:400, margin:"-36px auto 0", padding:"0 20px 40px", width:"100%" }}>
        <div style={{ background:C.surface, borderRadius:20, padding:"28px 24px", boxShadow:"0 8px 40px rgba(0,0,0,0.12)" }}>
          <h2 style={{ textAlign:"center", fontSize:18, fontWeight:800, margin:"0 0 20px" }}>دخول الإدارة</h2>
          <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:4 }}>رقم الهاتف / المعرّف</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="07XXXXXXXXX أو admin"
            style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:10, padding:"11px 14px", fontSize:14, boxSizing:"border-box", marginBottom:12, direction:"ltr", textAlign:"left" }} />
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
          <button onClick={()=>setShowRecovery(true)} style={{ background:"none", border:"none", width:"100%", marginTop:12, color:C.admin, cursor:"pointer", fontSize:13, fontWeight:700, textDecoration:"underline", textAlign:"center" }}>
            🔑 نسيت بيانات الدخول؟
          </button>
          <div style={{ marginTop:12, background:"#F3F0FF", borderRadius:10, padding:"10px 14px", fontSize:12, color:C.admin }}>
            🔐 بوابة المدير والمشرفين · المشتركون يدخلون من بواباتهم الخاصة
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
const BASE_MENU = [
  {id:"dash",    label:"لوحة التحكم",    icon:"📊", roles:["superadmin","supervisor"]},
  {id:"pharms",  label:"الصيدليات",       icon:"💊", roles:["superadmin","supervisor"]},
  {id:"wares",   label:"المذاخر",         icon:"🏭", roles:["superadmin","supervisor"]},
  {id:"deliv",   label:"شركات التوصيل",  icon:"🚛", roles:["superadmin","supervisor"]},
  {id:"subs",    label:"الاشتراكات",     icon:"💎", roles:["superadmin","supervisor"]},
  {id:"finance", label:"الإدارة المالية", icon:"💰", roles:["superadmin","supervisor"]},
  {id:"announce",label:"الإعلانات",       icon:"📢", roles:["superadmin","supervisor"]},
  {id:"social",  label:"وسائل التواصل",  icon:"📱", roles:["superadmin","supervisor"]},
  {id:"settings",label:"الإعدادات",       icon:"⚙️", roles:["superadmin"]},
];

function AdminPortal({ db, lastSync, onRefresh, onLogout, user }:{ db:any; lastSync:string; onRefresh:()=>void; onLogout:()=>void; user:{name:string;role:string;phone?:string} }) {
  const [sec, setSec] = useState("dash");
  const [open, setOpen] = useState(true);
  const menu = BASE_MENU.filter(m=>m.roles.includes(user.role));
  const isSuperAdmin = user.role==="superadmin";

  // ── Quick password-change modal ──────────────────────────────────────────────
  const [showPassModal, setShowPassModal] = useState(false);
  const [pForm, setPForm] = useState({ newPass:"", confirmPass:"" });
  const [showPNew, setShowPNew] = useState(false);
  const [pErr, setPErr] = useState("");
  const [pSaved, setPSaved] = useState(false);
  const [pStep, setPStep] = useState<"form"|"otp"|"done">("form");
  const [pOtpCode, setPOtpCode] = useState(""); const [pOtpInput, setPOtpInput] = useState(""); const [pOtpErr, setPOtpErr] = useState("");
  const [pTimer, setPTimer] = useState(0);
  React.useEffect(()=>{ if(pTimer<=0)return; const t=setTimeout(()=>setPTimer(v=>v-1),1000); return()=>clearTimeout(t); },[pTimer]);

  const openPModal = () => { setPForm({ newPass:"", confirmPass:"" }); setPErr(""); setPSaved(false); setPStep("form"); setPOtpInput(""); setPOtpErr(""); setShowPassModal(true); };
  const closePModal = () => setShowPassModal(false);
  const genAdminOTP = () => String(Math.floor(100000+Math.random()*900000));
  const sendAdminOtp = () => {
    setPErr("");
    if (!pForm.newPass.trim()) { setPErr("أدخل كلمة المرور الجديدة"); return; }
    if (pForm.newPass.length < 4) { setPErr("يجب أن تكون 4 أحرف على الأقل"); return; }
    if (pForm.newPass !== pForm.confirmPass) { setPErr("كلمتا المرور غير متطابقتين"); return; }
    const code = genAdminOTP(); setPOtpCode(code); setPOtpInput(""); setPOtpErr(""); setPStep("otp"); setPTimer(60);
  };
  const verifyAdminOtp = () => {
    if (pOtpInput !== pOtpCode) { setPOtpErr("رمز التحقق غير صحيح، حاول مجدداً"); return; }
    if (isSuperAdmin) {
      wrLS("admin_super_password", pForm.newPass.trim());
    } else {
      const accs = rdLS("admin_accounts", []) as any[];
      const updated = accs.map((a:any) => (a.phone===(user as any).phone ? { ...a, password: pForm.newPass.trim() } : a));
      wrLS("admin_accounts", updated);
    }
    setPStep("done");
    setTimeout(() => { setPSaved(false); closePModal(); setPStep("form"); }, 1800);
  };
  const resendAdminOtp = () => { const code=genAdminOTP(); setPOtpCode(code); setPOtpInput(""); setPOtpErr(""); setPTimer(60); };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      {/* ── Quick password modal ── */}
      {showPassModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div dir="rtl" style={{ background:"#fff", borderRadius:18, padding:28, width:"100%", maxWidth:420, boxShadow:"0 20px 60px rgba(0,0,0,0.35)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${C.admin},#553C9A)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🔑</div>
              <div>
                <div style={{ fontWeight:900, fontSize:16, color:C.text }}>تغيير كلمة المرور</div>
                <div style={{ fontSize:12, color:C.muted }}>{user.name} · {isSuperAdmin?"مدير المنصة":"مشرف"}</div>
              </div>
              <button onClick={closePModal} style={{ marginRight:"auto", background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.muted }}>×</button>
            </div>
            {pStep==="done" ? (
              <div style={{ textAlign:"center", padding:"20px 0", color:C.green, fontWeight:800, fontSize:15 }}>✅ تم تغيير كلمة المرور بنجاح!</div>
            ) : pStep==="otp" ? (
              <>
                <div style={{ background:"#FFFBEB", border:"1px solid #F6AD55", borderRadius:10, padding:"12px 14px", marginBottom:14, textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#744210", marginBottom:6 }}>📱 رمز التحقق التجريبي — سيُرسَل عبر SMS في التطبيق الفعلي</div>
                  <div style={{ fontSize:28, fontWeight:900, letterSpacing:8, color:"#744210" }}>{pOtpCode}</div>
                </div>
                <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>أدخل رمز التحقق المكوّن من 6 أرقام</label>
                <input type="text" maxLength={6} value={pOtpInput}
                  onChange={e=>{ setPOtpErr(""); setPOtpInput(e.target.value.replace(/\D/g,"").slice(0,6)); }}
                  onKeyDown={(e:any)=>e.key==="Enter"&&pOtpInput.length===6&&verifyAdminOtp()}
                  placeholder="• • • • • •"
                  style={{ width:"100%", border:`2px solid ${pOtpErr?C.red:C.admin}`, borderRadius:10, padding:"12px", fontSize:22, textAlign:"center", letterSpacing:8, boxSizing:"border-box", fontWeight:800, marginBottom:6 }} />
                {pOtpErr&&<div style={{ fontSize:11, color:C.red, marginBottom:6 }}>⚠️ {pOtpErr}</div>}
                <div style={{ fontSize:11, color:C.muted, textAlign:"right", marginBottom:14 }}>
                  {pTimer>0 ? `⏱ إعادة الإرسال بعد ${pTimer}ث` : <button onClick={resendAdminOtp} style={{ background:"none", border:"none", color:C.admin, cursor:"pointer", fontWeight:700, fontSize:12, textDecoration:"underline" }}>إعادة إرسال الرمز</button>}
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>{ setPStep("form"); setPOtpInput(""); setPOtpErr(""); }} style={{ flex:1, background:"#F7FAFC", color:C.muted, border:`1px solid ${C.border}`, borderRadius:10, padding:11, fontWeight:700, cursor:"pointer", fontSize:13 }}>← رجوع</button>
                  <button onClick={verifyAdminOtp} disabled={pOtpInput.length<6}
                    style={{ flex:2, background:pOtpInput.length===6?`linear-gradient(135deg,${C.admin},#553C9A)`:"#ccc", color:"#fff", border:"none", borderRadius:10, padding:11, fontWeight:800, cursor:pOtpInput.length===6?"pointer":"not-allowed", fontSize:14 }}>
                    ✓ تحقق وتغيير كلمة المرور
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>كلمة المرور الجديدة</label>
                  <div style={{ position:"relative" }}>
                    <input type={showPNew?"text":"password"} value={pForm.newPass} onChange={e=>setPForm(p=>({...p,newPass:e.target.value}))}
                      placeholder="••••••••" style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:10, padding:"10px 14px", paddingLeft:36, fontSize:14, boxSizing:"border-box" }} />
                    <button onClick={()=>setShowPNew(v=>!v)} style={{ position:"absolute", left:10, top:11, background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:14 }}>{showPNew?"🙈":"👁️"}</button>
                  </div>
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>تأكيد كلمة المرور</label>
                  <input type="password" value={pForm.confirmPass} onChange={e=>setPForm(p=>({...p,confirmPass:e.target.value}))}
                    onKeyDown={(e:any)=>e.key==="Enter"&&sendAdminOtp()} placeholder="••••••••"
                    style={{ width:"100%", border:`1.5px solid ${pForm.confirmPass&&pForm.confirmPass!==pForm.newPass?C.red:C.border}`, borderRadius:10, padding:"10px 14px", fontSize:14, boxSizing:"border-box" }} />
                  {pForm.confirmPass && pForm.confirmPass!==pForm.newPass && <div style={{ fontSize:11, color:C.red, marginTop:4 }}>⚠️ كلمتا المرور غير متطابقتين</div>}
                </div>
                {pErr && <div style={{ background:"#FFF5F5", border:"1px solid #FED7D7", borderRadius:8, padding:"8px 12px", fontSize:12, color:C.red, marginBottom:12 }}>{pErr}</div>}
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={closePModal} style={{ flex:1, background:"#F7FAFC", color:C.muted, border:`1px solid ${C.border}`, borderRadius:10, padding:11, fontWeight:700, cursor:"pointer", fontSize:13 }}>إلغاء</button>
                  <button onClick={sendAdminOtp} disabled={!pForm.newPass||pForm.newPass!==pForm.confirmPass}
                    style={{ flex:2, background:pForm.newPass&&pForm.newPass===pForm.confirmPass?`linear-gradient(135deg,${C.admin},#553C9A)`:"#ccc", color:"#fff", border:"none", borderRadius:10, padding:11, fontWeight:800, cursor:pForm.newPass&&pForm.newPass===pForm.confirmPass?"pointer":"not-allowed", fontSize:14 }}>
                    📲 إرسال رمز التحقق (OTP)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Sidebar */}
      <div style={{ width:open?220:60, background:"#1a202c", display:"flex", flexDirection:"column", transition:"width 0.2s", flexShrink:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 12px", borderBottom:"1px solid #2d3748", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:22, flexShrink:0 }}>🛡️</span>
          {open && <div style={{ flex:1 }}><div style={{ color:"#fff", fontSize:12, fontWeight:800 }}>{user.name}</div><div style={{ color:"#A0AEC0", fontSize:10 }}>{user.role==="superadmin"?"مدير المنصة":"مشرف"}</div></div>}
          {open && <button onClick={openPModal} title="تغيير كلمة المرور" style={{ background:"none", border:"1px solid #4A5568", borderRadius:7, color:"#A0AEC0", cursor:"pointer", fontSize:13, padding:"3px 7px", flexShrink:0 }}>🔑</button>}
          <button onClick={()=>setOpen(v=>!v)} style={{ background:"none", border:"none", color:"#A0AEC0", cursor:"pointer", fontSize:16, flexShrink:0, marginRight:open?"0":"auto" }}>☰</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"6px 0" }}>
          {menu.map(m=>(
            <button key={m.id} onClick={()=>setSec(m.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:sec===m.id?`${C.admin}25`:"none", border:"none", cursor:"pointer", textAlign:"right", borderRight:sec===m.id?`3px solid ${C.admin}`:"3px solid transparent" }}>
              <span style={{ fontSize:17, flexShrink:0 }}>{m.icon}</span>
              {open && <span style={{ color:sec===m.id?"#fff":"#A0AEC0", fontSize:13, fontWeight:sec===m.id?700:400, whiteSpace:"nowrap" }}>{m.label}</span>}
            </button>
          ))}
        </div>
        {/* ── Portal Quick-Access ── */}
        <div style={{ borderTop:"1px solid #2d3748", padding:"8px 0" }}>
          {open && <div style={{ fontSize:10, color:"#4A5568", fontWeight:700, padding:"4px 14px 6px", textTransform:"uppercase", letterSpacing:1 }}>بوابات المشتركين</div>}
          {[
            { label:"الصيدليات",  icon:"💊", color:"#1A9E6E", path:"/dawaaplus-pharmacies/" },
            { label:"المذاخر",    icon:"🏭", color:"#0D7A54", path:"/dawaaplus-warehouses/" },
            { label:"التوصيل",    icon:"🚛", color:"#D69E2E", path:"/dawaaplus-delivery/"   },
          ].map(p=>(
            <a key={p.path} href={`${window.location.origin}${p.path}`} target="_blank" rel="noreferrer"
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"8px 14px", background:"none", border:"none", cursor:"pointer", textAlign:"right", textDecoration:"none", borderRight:"3px solid transparent" }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{p.icon}</span>
              {open && <span style={{ color:"#718096", fontSize:12, whiteSpace:"nowrap" }}>{p.label}</span>}
              {open && <span style={{ marginRight:"auto", fontSize:10, color:p.color, background:`${p.color}20`, borderRadius:4, padding:"1px 5px" }}>↗</span>}
            </a>
          ))}
        </div>
        <button onClick={onLogout} style={{ padding:14, background:"none", border:"none", borderTop:"1px solid #2d3748", color:"#A0AEC0", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
          <span>🚪</span>{open && <span>تسجيل الخروج</span>}
        </button>
      </div>
      {/* Content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 20px", height:56, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div style={{ flex:1 }}><span style={{ fontWeight:800, fontSize:15 }}>{menu.find(m=>m.id===sec)?.label}</span></div>
          {!isSuperAdmin&&<span style={{ fontSize:11, background:"#FFF3E0", color:C.orange, borderRadius:8, padding:"3px 10px", fontWeight:700 }}>مشرف — صلاحيات محدودة</span>}
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
          {sec==="settings" && isSuperAdmin && <AdminSettings currentUser={user} />}
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
  const [reqs, setReqs] = useState<any[]>(()=>rdLS("sub_requests",[]));
  const [tab, setTab] = useState<"pending"|"all">("pending");
  const [changePlanModal, setChangePlanModal] = useState<any>(null);
  const [newPlan, setNewPlan] = useState("standard");

  const pending = reqs.filter(r=>r.status==="pending");
  const all = [
    ...db.pharmacies.map((p:any)=>({...p,_type:"pharmacy",_label:"صيدلية",_icon:"💊",_color:C.pharmacy,_lsKey:`ph_profile_${p.id}`})),
    ...db.warehouses.map((w:any)=>({...w,_type:"warehouse",_label:"مذخر",_icon:"🏭",_color:C.warehouse,_lsKey:`wh_profile_${w.id}`})),
    ...db.deliveries.map((d:any)=>({...d,_type:"delivery",_label:"شركة توصيل",_icon:"🚛",_color:C.delivery,_lsKey:`dc_profile_${d.id}`})),
  ];

  const updateReqs = (newReqs:any[]) => {
    localStorage.setItem("sub_requests", JSON.stringify(newReqs));
    setReqs(newReqs);
    try{ new BroadcastChannel("dawapl_sync").postMessage("update"); }catch{}
  };
  const updateSubscriberPlan = (lsKey:string, defData:any, plan:string, active?:boolean) => {
    const cur = rdLS(lsKey, defData);
    const updated = { ...cur, plan, ...(active!==undefined?{active}:{}) };
    localStorage.setItem(lsKey, JSON.stringify(updated));
    try{ new BroadcastChannel("dawapl_sync").postMessage("update"); }catch{}
  };
  const findSubByReq = (req:any) => all.find(a=>a.id===req.subscriberId);

  const approveReq = (req:any) => {
    const sub = findSubByReq(req);
    if (sub) updateSubscriberPlan(sub._lsKey, sub, req.requestedPlan);
    const updated = reqs.map(r=>r.id===req.id ? {...r, status:"approved", approvedAt:new Date().toISOString().slice(0,10)} : r);
    updateReqs(updated);
    window.location.reload();
  };
  const rejectReq = (req:any) => {
    const updated = reqs.map(r=>r.id===req.id ? {...r, status:"rejected", rejectedAt:new Date().toISOString().slice(0,10)} : r);
    updateReqs(updated);
  };
  const applyPlanChange = () => {
    if (!changePlanModal) return;
    updateSubscriberPlan(changePlanModal._lsKey, changePlanModal, newPlan);
    setChangePlanModal(null);
    window.location.reload();
  };
  const toggleBlock = (sub:any) => {
    updateSubscriberPlan(sub._lsKey, sub, sub.plan, !sub.active);
    window.location.reload();
  };

  const planPills = [
    {id:"free",label:"مجاني",color:C.muted},
    {id:"standard",label:"ستاندرد",color:C.blue},
    {id:"premium",label:"بريميوم",color:"#7C3AED"},
  ];

  const subTypeColor=(t:string)=>t==="pharmacy"?C.pharmacy:t==="warehouse"?C.warehouse:C.delivery;
  const getPayIcon=(m:string)=>m==="zainCash"?"📱":m==="fastPay"?"⚡":m==="fib"?"🏦":m==="asiaHawala"?"💳":"💵";
  const getTypeLabel=(t:string)=>t==="pharmacy"?"صيدلية":t==="warehouse"?"مذخر":"شركة توصيل";

  return (
    <div>
      {/* ── Stats Bar ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        {[
          {l:"طلبات معلّقة",v:pending.length,c:C.orange,icon:"⏳"},
          {l:"بريميوم 👑",v:all.filter(a=>a.plan==="premium").length,c:"#7C3AED",icon:""},
          {l:"ستاندرد ⭐",v:all.filter(a=>a.plan==="standard").length,c:C.blue,icon:""},
          {l:"مجاني 🆓",v:all.filter(a=>a.plan==="free").length,c:C.muted,icon:""},
          {l:"محظورون 🚫",v:all.filter(a=>!a.active).length,c:C.red,icon:""},
        ].map(s=>(
          <div key={s.l} onClick={()=>{ if(s.l.includes("معلّق")) setTab("pending"); }} style={{ background:"#fff",borderRadius:14,padding:"12px 10px",textAlign:"center",borderTop:`3px solid ${s.c}`,cursor:s.l.includes("معلّق")?"pointer":"default",boxShadow:"0 1px 4px #0001" }}>
            <div style={{ fontSize:24,fontWeight:900,color:s.c }}>{s.v}</div>
            <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[{id:"pending",l:`⏳ طلبات الترقية (${pending.length})`},{id:"all",l:"📋 جميع المشتركين"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)} style={{ padding:"9px 20px",borderRadius:10,border:`2px solid ${tab===t.id?C.admin:C.border}`,background:tab===t.id?C.admin:"#fff",color:tab===t.id?"#fff":C.text,fontWeight:700,cursor:"pointer",fontSize:13 }}>{t.l}</button>
        ))}
      </div>

      {/* ── Pending Requests ── */}
      {tab==="pending"&&<div>
        {pending.length===0?<div style={{ textAlign:"center",padding:"40px 20px",color:C.muted,fontSize:15 }}>✅ لا توجد طلبات معلّقة</div>:(
          pending.map((req,i)=>(
            <div key={req.id} style={{ background:"#fff",borderRadius:16,padding:"16px 18px",marginBottom:12,border:`2px solid ${C.orange}33`,boxShadow:"0 2px 8px #0001" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10 }}>
                <div style={{ flex:1,minWidth:260 }}>
                  <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:8 }}>
                    <span style={{ fontSize:18 }}>{getPayIcon(req.paymentMethod)}</span>
                    <span style={{ fontWeight:800,fontSize:15 }}>{req.subscriberName}</span>
                    <Bdg label={getTypeLabel(req.subscriberType)} color={subTypeColor(req.subscriberType)} bg={`${subTypeColor(req.subscriberType)}15`} />
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 20px",fontSize:12,color:C.muted }}>
                    <span>📱 {req.subscriberPhone}</span>
                    <span>📍 {req.subscriberCity}</span>
                    <span>💳 {req.paymentLabel}</span>
                    <span>📅 {req.date}</span>
                  </div>
                  <div style={{ marginTop:10,background:"#F7FAFC",borderRadius:10,padding:"10px 12px",display:"flex",gap:16,flexWrap:"wrap",alignItems:"center" }}>
                    <div><div style={{ fontSize:10,color:C.muted,marginBottom:2 }}>من</div><Bdg {...planBadge(req.currentPlan)} /></div>
                    <div style={{ color:C.muted,fontSize:16 }}>→</div>
                    <div><div style={{ fontSize:10,color:C.muted,marginBottom:2 }}>إلى</div><Bdg {...planBadge(req.requestedPlan)} /></div>
                    <div style={{ borderRight:`1px solid ${C.border}`,paddingRight:16,marginRight:4 }}><div style={{ fontSize:10,color:C.muted,marginBottom:2 }}>المبلغ</div><span style={{ fontWeight:800,color:C.green,fontSize:14 }}>{req.amount.toLocaleString()} د.ع</span></div>
                    <div><div style={{ fontSize:10,color:C.muted,marginBottom:2 }}>مرجع الدفع</div><span style={{ fontWeight:700,fontSize:13,fontFamily:"monospace",color:"#2D3748" }}>{req.transactionRef}</span></div>
                  </div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  <button onClick={()=>approveReq(req)} style={{ background:`linear-gradient(135deg,${C.green},#276749)`,color:"#fff",border:"none",borderRadius:10,padding:"11px 20px",fontWeight:800,cursor:"pointer",fontSize:13 }}>✅ قبول وتفعيل</button>
                  <button onClick={()=>rejectReq(req)} style={{ background:"#fff",color:C.red,border:`2px solid ${C.red}`,borderRadius:10,padding:"9px 20px",fontWeight:700,cursor:"pointer",fontSize:13 }}>❌ رفض</button>
                </div>
              </div>
            </div>
          ))
        )}
        {reqs.filter(r=>r.status!=="pending").length>0&&<div>
          <div style={{ fontSize:12,color:C.muted,fontWeight:700,marginBottom:8,marginTop:4 }}>الطلبات المعالجة:</div>
          {reqs.filter(r=>r.status!=="pending").slice(0,6).map((req,i)=>(
            <div key={req.id} style={{ background:C.bg,borderRadius:10,padding:"10px 14px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12 }}>
              <span style={{ fontWeight:700 }}>{req.subscriberName}</span>
              <span style={{ color:C.muted }}>{req.paymentLabel} · {req.transactionRef}</span>
              <Bdg label={req.status==="approved"?"✅ مقبول":"❌ مرفوض"} color={req.status==="approved"?C.green:C.red} bg={req.status==="approved"?"#F0FFF4":"#FFF5F5"} />
            </div>
          ))}
        </div>}
      </div>}

      {/* ── All Subscribers ── */}
      {tab==="all"&&<div>
        {all.map((a,i)=>(
          <div key={i} style={{ background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px #0001",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
            <div style={{ display:"flex",gap:12,alignItems:"center",flex:1,minWidth:260 }}>
              <div style={{ width:42,height:42,borderRadius:12,background:`${a._color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{a._icon}</div>
              <div>
                <div style={{ fontWeight:800,fontSize:14,color:a.active?C.text:C.muted }}>{a.name} {!a.active&&<span style={{ fontSize:11,color:C.red }}>(محظور)</span>}</div>
                <div style={{ fontSize:11,color:C.muted }}>{a._label} · {a.city} · {a.phone}</div>
                <div style={{ display:"flex",gap:6,marginTop:4 }}><Bdg {...planBadge(a.plan)} />{!a.active&&<Bdg label="محظور 🚫" color={C.red} bg="#FFF5F5" />}</div>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
              <div style={{ textAlign:"center",background:C.bg,borderRadius:8,padding:"6px 12px" }}>
                <div style={{ fontWeight:800,fontSize:14,color:C.green }}>{(a.revenue/1000000).toFixed(1)}M</div>
                <div style={{ fontSize:10,color:C.muted }}>إيرادات</div>
              </div>
              <button onClick={()=>{ setChangePlanModal(a); setNewPlan(a.plan); }} style={{ background:`${C.admin}15`,color:C.admin,border:`1px solid ${C.admin}40`,borderRadius:9,padding:"8px 14px",fontWeight:700,cursor:"pointer",fontSize:12 }}>✏️ تغيير الخطة</button>
              <button onClick={()=>toggleBlock(a)} style={{ background:a.active?"#FFF5F5":"#F0FFF4",color:a.active?C.red:C.green,border:`1px solid ${a.active?C.red+"40":C.green+"40"}`,borderRadius:9,padding:"8px 14px",fontWeight:700,cursor:"pointer",fontSize:12 }}>{a.active?"🚫 حظر":"✅ رفع الحظر"}</button>
            </div>
          </div>
        ))}
      </div>}

      {/* ── Change Plan Modal ── */}
      {changePlanModal&&<div style={{ position:"fixed",inset:0,background:"#00000055",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={()=>setChangePlanModal(null)}>
        <div style={{ background:"#fff",borderRadius:20,padding:"28px 24px",minWidth:340,boxShadow:"0 20px 60px #0004" }} onClick={e=>e.stopPropagation()}>
          <div style={{ fontWeight:900,fontSize:17,marginBottom:4 }}>✏️ تغيير خطة الاشتراك</div>
          <div style={{ fontSize:12,color:C.muted,marginBottom:16 }}>{changePlanModal.name}</div>
          <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20 }}>
            {planPills.map(p=>(
              <div key={p.id} onClick={()=>setNewPlan(p.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:10,border:`2px solid ${newPlan===p.id?p.color:C.border}`,cursor:"pointer",background:newPlan===p.id?`${p.color}08`:"#fff" }}>
                <div style={{ width:18,height:18,borderRadius:"50%",border:`2px solid ${newPlan===p.id?p.color:C.border}`,background:newPlan===p.id?p.color:"#fff",flexShrink:0 }} />
                <span style={{ fontWeight:700,color:newPlan===p.id?p.color:C.text }}>{p.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <button onClick={()=>setChangePlanModal(null)} style={{ flex:1,padding:"10px",borderRadius:10,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",fontWeight:700 }}>إلغاء</button>
            <button onClick={applyPlanChange} style={{ flex:2,padding:"10px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.admin},#5B21B6)`,color:"#fff",cursor:"pointer",fontWeight:800 }}>✅ تطبيق التغيير</button>
          </div>
        </div>
      </div>}
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

// ─── Password Change Form (reusable) ──────────────────────────────────────────
function PassChangeForm({ passForm, setPassForm, showNewPass, setShowNewPass, passErr, passSaved, onSubmit, onCancel }:any) {
  return (
    <div style={{ background:"#F7FAFC", borderRadius:10, padding:"14px 14px" }}>
      {passSaved ? (
        <div style={{ textAlign:"center", color:C.green, fontWeight:800, fontSize:14, padding:"8px 0" }}>✅ تم تغيير كلمة المرور بنجاح!</div>
      ) : (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:4 }}>كلمة المرور الجديدة</label>
              <div style={{ position:"relative" }}>
                <input type={showNewPass?"text":"password"} value={passForm.newPass} onChange={e=>setPassForm((p:any)=>({...p,newPass:e.target.value}))}
                  placeholder="••••••••" style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:9, padding:"9px 12px", paddingLeft:34, fontSize:13, boxSizing:"border-box" }} />
                <button onClick={()=>setShowNewPass((v:boolean)=>!v)} style={{ position:"absolute", left:8, top:9, background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:13 }}>{showNewPass?"🙈":"👁️"}</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:4 }}>تأكيد كلمة المرور</label>
              <input type="password" value={passForm.confirmPass} onChange={e=>setPassForm((p:any)=>({...p,confirmPass:e.target.value}))}
                onKeyDown={(e:any)=>e.key==="Enter"&&onSubmit()} placeholder="••••••••"
                style={{ width:"100%", border:`1.5px solid ${passForm.confirmPass&&passForm.confirmPass!==passForm.newPass?C.red:C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }} />
            </div>
          </div>
          {passForm.confirmPass && passForm.confirmPass!==passForm.newPass && <div style={{ fontSize:11, color:C.red, marginBottom:6 }}>⚠️ كلمتا المرور غير متطابقتين</div>}
          {passErr&&<div style={{ background:"#FFF5F5",border:"1px solid #FED7D7",borderRadius:7,padding:"7px 12px",fontSize:12,color:C.red,marginBottom:8 }}>{passErr}</div>}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onCancel} style={{ flex:1, background:"#fff", color:C.muted, border:`1px solid ${C.border}`, borderRadius:9, padding:"9px", fontWeight:700, cursor:"pointer", fontSize:12 }}>إلغاء</button>
            <button onClick={onSubmit} disabled={!passForm.newPass||passForm.newPass!==passForm.confirmPass}
              style={{ flex:2, background:passForm.newPass&&passForm.newPass===passForm.confirmPass?`linear-gradient(135deg,${C.admin},#553C9A)`:"#ccc", color:"#fff", border:"none", borderRadius:9, padding:"9px", fontWeight:800, cursor:passForm.newPass&&passForm.newPass===passForm.confirmPass?"pointer":"not-allowed", fontSize:13 }}>
              💾 حفظ كلمة المرور الجديدة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN SETTINGS — accounts & payment
// ═══════════════════════════════════════════════════════════════════════════════
function AdminSettings({ currentUser }:{ currentUser:{name:string;role:string;phone?:string} }) {
  const [tab, setTab] = useState<"accounts"|"payments">("payments");

  // ─── Payment Accounts ───────────────────────────────────────────────────────
  const [payAccounts, setPayAccounts] = useState<any[]>(()=>getPlatformPaymentAccounts());
  const [editingPay, setEditingPay] = useState<any>(null);
  const [payForm, setPayForm] = useState({ label:"", icon:"💳", color:"#7C3AED", num:"", hint:"" });
  const [paySaved, setPaySaved] = useState(false);

  const savePayAccounts = (accs:any[]) => {
    wrLS("platform_payment_accounts", accs);
    setPayAccounts(accs);
    try{ new BroadcastChannel("dawapl_sync").postMessage("update"); }catch{}
    setPaySaved(true); setTimeout(()=>setPaySaved(false), 2000);
  };
  const startEditPay = (acc:any) => { setEditingPay(acc.id); setPayForm({ label:acc.label, icon:acc.icon, color:acc.color, num:acc.num, hint:acc.hint }); };
  const savePay = () => {
    if (!payForm.num.trim()||!payForm.label.trim()) return;
    if (editingPay) {
      savePayAccounts(payAccounts.map(a=>a.id===editingPay?{...a,...payForm}:a));
    } else {
      savePayAccounts([...payAccounts,{id:`pay_${Date.now()}`,...payForm}]);
    }
    setEditingPay(null); setPayForm({ label:"", icon:"💳", color:"#7C3AED", num:"", hint:"" });
  };
  const deletePay = (id:string) => savePayAccounts(payAccounts.filter(a=>a.id!==id));

  // ─── Admin Accounts (from DB) ────────────────────────────────────────────────
  const [accounts, setAccounts] = useState<any[]>(()=>getAdminAccounts());
  const [accLoading, setAccLoading] = useState(false);
  const [accForm, setAccForm] = useState({ name:"", phone:"", password:"", role:"supervisor" });
  const [accErr, setAccErr] = useState("");
  const [accSaved, setAccSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Load accounts from DB on mount
  useEffect(()=>{
    if(tab!=="accounts") return;
    setAccLoading(true);
    api.getAdmins().then(rows=>{
      if(rows?.length){ setAccounts(rows); wrLS("admin_accounts", rows); }
      else { setAccounts(getAdminAccounts()); }
    }).catch(()=>{ setAccounts(getAdminAccounts()); })
    .finally(()=>setAccLoading(false));
  },[tab]);

  // ─── Password Change ─────────────────────────────────────────────────────────
  const [changingPassId, setChangingPassId] = useState<string|null>(null);
  const [passForm, setPassForm] = useState({ newPass:"", confirmPass:"" });
  const [showNewPass, setShowNewPass] = useState(false);
  const [passErr, setPassErr] = useState("");
  const [passSaved, setPassSaved] = useState(false);

  const openPassChange = (id:string) => { setChangingPassId(id); setPassForm({ newPass:"", confirmPass:"" }); setPassErr(""); };
  const closePassChange = () => { setChangingPassId(null); setPassForm({ newPass:"", confirmPass:"" }); setPassErr(""); };
  const submitPassChange = async () => {
    setPassErr("");
    if (!passForm.newPass.trim()) { setPassErr("أدخل كلمة المرور الجديدة"); return; }
    if (passForm.newPass.length < 4) { setPassErr("كلمة المرور يجب أن تكون 4 أحرف على الأقل"); return; }
    if (passForm.newPass !== passForm.confirmPass) { setPassErr("كلمتا المرور غير متطابقتين"); return; }
    if (changingPassId === "superadmin") {
      wrLS("admin_super_password", passForm.newPass.trim());
      await api.changePassword("admin", passForm.newPass.trim(), "admin").catch(()=>{});
    } else {
      const acc = accounts.find(a=>String(a.id)===String(changingPassId));
      if(acc) {
        await api.updateAdmin(Number(acc.id), { password: passForm.newPass.trim() }).catch(()=>{});
        const updated = accounts.map(a=>String(a.id)===String(changingPassId)?{...a,password:passForm.newPass.trim()}:a);
        wrLS("admin_accounts", updated); setAccounts(updated);
      }
    }
    setPassSaved(true); setTimeout(()=>{ setPassSaved(false); closePassChange(); }, 1500);
  };

  const addAccount = async () => {
    setAccErr("");
    if (!accForm.name.trim()||!accForm.phone.trim()||!accForm.password.trim()) { setAccErr("جميع الحقول مطلوبة"); return; }
    if (accForm.phone.trim()===SUPER_ADMIN.phone) { setAccErr("هذا المعرّف محجوز للمدير الرئيسي"); return; }
    try {
      const created = await api.createAdmin({ ...accForm, phone:accForm.phone.trim() });
      const updated = [...accounts, created];
      wrLS("admin_accounts", updated); setAccounts(updated);
      setAccForm({ name:"", phone:"", password:"", role:"supervisor" });
      setAccSaved(true); setTimeout(()=>setAccSaved(false),2000);
    } catch(e:any) {
      setAccErr(e.message || "حدث خطأ أثناء إضافة الحساب");
    }
  };
  const deleteAccount = async (id:string) => {
    await api.deleteAdmin(Number(id)).catch(()=>{});
    const updated = accounts.filter(a=>String(a.id)!==String(id));
    wrLS("admin_accounts", updated); setAccounts(updated);
  };

  const ICONS = ["💳","📱","⚡","🏦","💵","🔷","🟢","💰"];
  const COLORS = ["#8B1538","#0066CC","#004E87","#B45309","#38A169","#7C3AED","#D69E2E","#E53E3E"];

  return (
    <div>
      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[{id:"payments",l:"💳 حسابات الدفع / الاستحصال"},{id:"accounts",l:"👥 حسابات الإدارة والمشرفين"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)} style={{ padding:"10px 22px", borderRadius:10, border:`2px solid ${tab===t.id?C.admin:C.border}`, background:tab===t.id?C.admin:"#fff", color:tab===t.id?"#fff":C.text, fontWeight:700, cursor:"pointer", fontSize:13 }}>{t.l}</button>
        ))}
      </div>

      {/* ── PAYMENT ACCOUNTS ── */}
      {tab==="payments"&&<div>
        <div style={{ background:"#F3F0FF", border:"1px solid #C4B5FD", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12, color:C.admin }}>
          💡 هذه الحسابات تظهر للمشتركين عند طلب ترقية اشتراكهم — تأكد من دقة الأرقام قبل الحفظ
        </div>
        {paySaved&&<div style={{ background:"#F0FFF4",border:"1px solid #38A169",borderRadius:8,padding:"8px 14px",fontSize:13,color:C.green,marginBottom:12 }}>✅ تم حفظ حسابات الدفع بنجاح</div>}

        {/* Existing accounts */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12, marginBottom:20 }}>
          {payAccounts.map(acc=>(
            <div key={acc.id} style={{ background:"#fff", borderRadius:14, padding:"14px 16px", border:`2px solid ${editingPay===acc.id?acc.color:C.border}` }}>
              {editingPay===acc.id ? (
                <div>
                  <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                    {ICONS.map(ic=><button key={ic} onClick={()=>setPayForm(p=>({...p,icon:ic}))} style={{ fontSize:18, padding:"4px 6px", borderRadius:6, border:`2px solid ${payForm.icon===ic?"#7C3AED":C.border}`, background:"#fff", cursor:"pointer" }}>{ic}</button>)}
                  </div>
                  <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                    {COLORS.map(col=><button key={col} onClick={()=>setPayForm(p=>({...p,color:col}))} style={{ width:22, height:22, borderRadius:"50%", background:col, border:`3px solid ${payForm.color===col?"#1a202c":C.border}`, cursor:"pointer" }} />)}
                  </div>
                  <input value={payForm.label} onChange={e=>setPayForm(p=>({...p,label:e.target.value}))} placeholder="اسم وسيلة الدفع" style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:12, boxSizing:"border-box", marginBottom:6 }} />
                  <input value={payForm.num} onChange={e=>setPayForm(p=>({...p,num:e.target.value}))} placeholder="الرقم / الحساب" style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:12, fontFamily:"monospace", boxSizing:"border-box", marginBottom:6, direction:"ltr", textAlign:"left" }} />
                  <input value={payForm.hint} onChange={e=>setPayForm(p=>({...p,hint:e.target.value}))} placeholder="تعليمات للمشترك (اختياري)" style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:12, boxSizing:"border-box", marginBottom:8 }} />
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={savePay} style={{ flex:2, background:C.admin, color:"#fff", border:"none", borderRadius:8, padding:"8px", fontWeight:700, cursor:"pointer", fontSize:12 }}>💾 حفظ</button>
                    <button onClick={()=>setEditingPay(null)} style={{ flex:1, background:C.bg, color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px", cursor:"pointer", fontSize:12 }}>إلغاء</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:`${acc.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{acc.icon}</div>
                      <div><div style={{ fontWeight:700, fontSize:13 }}>{acc.label}</div><div style={{ fontSize:11, color:C.muted }}>{acc.hint||"—"}</div></div>
                    </div>
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={()=>startEditPay(acc)} style={{ background:`${C.admin}10`, color:C.admin, border:"none", borderRadius:6, padding:"5px 8px", cursor:"pointer", fontSize:11 }}>✏️</button>
                      <button onClick={()=>deletePay(acc.id)} style={{ background:"#FFF5F5", color:C.red, border:"none", borderRadius:6, padding:"5px 8px", cursor:"pointer", fontSize:11 }}>🗑️</button>
                    </div>
                  </div>
                  <div style={{ marginTop:10, background:C.bg, borderRadius:8, padding:"8px 10px", fontFamily:"monospace", fontSize:14, fontWeight:900, color:acc.color, direction:"ltr", textAlign:"left" }}>{acc.num}</div>
                </div>
              )}
            </div>
          ))}

          {/* Add new payment account */}
          {editingPay===null&&<div style={{ background:`${C.admin}06`, borderRadius:14, padding:"14px 16px", border:`2px dashed ${C.admin}40` }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:10, color:C.admin }}>➕ إضافة حساب دفع جديد</div>
            <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
              {ICONS.map(ic=><button key={ic} onClick={()=>setPayForm(p=>({...p,icon:ic}))} style={{ fontSize:18, padding:"4px 6px", borderRadius:6, border:`2px solid ${payForm.icon===ic?"#7C3AED":C.border}`, background:"#fff", cursor:"pointer" }}>{ic}</button>)}
            </div>
            <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
              {COLORS.map(col=><button key={col} onClick={()=>setPayForm(p=>({...p,color:col}))} style={{ width:22, height:22, borderRadius:"50%", background:col, border:`3px solid ${payForm.color===col?"#1a202c":C.border}`, cursor:"pointer" }} />)}
            </div>
            <input value={payForm.label} onChange={e=>setPayForm(p=>({...p,label:e.target.value}))} placeholder="اسم وسيلة الدفع (مثال: زين كاش)" style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 10px", fontSize:12, boxSizing:"border-box", marginBottom:6 }} />
            <input value={payForm.num} onChange={e=>setPayForm(p=>({...p,num:e.target.value}))} placeholder="رقم الهاتف / رقم الحساب" style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 10px", fontSize:13, fontFamily:"monospace", boxSizing:"border-box", marginBottom:6, direction:"ltr", textAlign:"left" }} />
            <input value={payForm.hint} onChange={e=>setPayForm(p=>({...p,hint:e.target.value}))} placeholder="تعليمات للمشترك (اختياري)" style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 10px", fontSize:12, boxSizing:"border-box", marginBottom:10 }} />
            <button onClick={savePay} disabled={!payForm.num.trim()||!payForm.label.trim()} style={{ width:"100%", background:payForm.num.trim()&&payForm.label.trim()?`linear-gradient(135deg,${C.admin},#553C9A)`:"#ccc", color:"#fff", border:"none", borderRadius:8, padding:"10px", fontWeight:800, cursor:payForm.num.trim()&&payForm.label.trim()?"pointer":"not-allowed", fontSize:13 }}>حفظ الحساب</button>
          </div>}
        </div>
      </div>}

      {/* ── ADMIN ACCOUNTS ── */}
      {tab==="accounts"&&<div>
        {accSaved&&<div style={{ background:"#F0FFF4",border:"1px solid #38A169",borderRadius:8,padding:"8px 14px",fontSize:13,color:C.green,marginBottom:12 }}>✅ تمت إضافة الحساب بنجاح</div>}
        <div style={{ background:"#F3F0FF", border:"1px solid #C4B5FD", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12, color:C.admin, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span>👥 حسابات الإدارة والمشرفين — محفوظة في قاعدة البيانات</span>
          {accLoading && <span style={{ fontSize:11, color:C.muted }}>⏳ جاري التحميل من قاعدة البيانات...</span>}
        </div>

        {/* Existing accounts */}
        <div style={{ marginBottom:20 }}>
          {/* Super Admin card */}
          <div style={{ background:`linear-gradient(135deg,${C.admin}12,${C.admin}06)`, border:`2px solid ${C.admin}30`, borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
            {changingPassId==="superadmin" ? (
              <PassChangeForm passForm={passForm} setPassForm={setPassForm} showNewPass={showNewPass} setShowNewPass={setShowNewPass} passErr={passErr} passSaved={passSaved} onSubmit={submitPassChange} onCancel={closePassChange} />
            ) : (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:C.admin, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#fff" }}>🛡️</div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:14 }}>مدير المنصة (الرئيسي)</div>
                    <div style={{ fontSize:11, color:C.muted }}>معرّف: admin · كلمة مرور محفوظة بأمان</div>
                    <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>💡 الكلمة الافتراضية (admin) تعمل دائماً كاحتياط</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ background:`${C.admin}15`, color:C.admin, borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700 }}>مدير كامل الصلاحيات</span>
                  <button onClick={()=>openPassChange("superadmin")} style={{ background:"#fff", color:C.admin, border:`1.5px solid ${C.admin}50`, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:12, fontWeight:700 }}>🔑 تغيير كلمة المرور</button>
                </div>
              </div>
            )}
          </div>
          {accounts.length===0 && <div style={{ textAlign:"center", color:C.muted, fontSize:13, padding:"20px 0" }}>لا توجد حسابات مضافة بعد</div>}
          {accounts.map(acc=>(
            <div key={acc.id} style={{ background:"#fff", border:`1px solid ${changingPassId===acc.id?C.admin:C.border}`, borderRadius:14, padding:"12px 16px", marginBottom:8 }}>
              {changingPassId===acc.id ? (
                <div>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:10, color:C.text }}>🔑 تغيير كلمة مرور: <span style={{ color:C.admin }}>{acc.name}</span></div>
                  <PassChangeForm passForm={passForm} setPassForm={setPassForm} showNewPass={showNewPass} setShowNewPass={setShowNewPass} passErr={passErr} passSaved={passSaved} onSubmit={submitPassChange} onCancel={closePassChange} />
                </div>
              ) : (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ width:38, height:38, borderRadius:12, background:acc.role==="supervisor"?"#FFF3E0":"#F3F0FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{acc.role==="supervisor"?"👤":"⚙️"}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{acc.name}</div>
                      <div style={{ fontSize:11, color:C.muted }}>📱 {acc.phone} · {acc.role==="supervisor"?"مشرف":"مدير"}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <button onClick={()=>openPassChange(acc.id)} style={{ background:`${C.admin}10`, color:C.admin, border:`1px solid ${C.admin}40`, borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:12, fontWeight:700 }}>🔑 كلمة المرور</button>
                    <button onClick={()=>deleteAccount(acc.id)} style={{ background:"#FFF5F5", color:C.red, border:"none", borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:12 }}>🗑️ حذف</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new account */}
        <div style={{ background:`${C.admin}06`, border:`2px dashed ${C.admin}40`, borderRadius:14, padding:"18px 16px" }}>
          <div style={{ fontWeight:800, fontSize:14, color:C.admin, marginBottom:12 }}>➕ تسجيل حساب جديد</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:4 }}>الاسم الكامل</label>
              <input value={accForm.name} onChange={e=>setAccForm(p=>({...p,name:e.target.value}))} placeholder="مثال: أحمد علي" style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }} />
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:4 }}>رقم الهاتف (لتسجيل الدخول)</label>
              <input value={accForm.phone} onChange={e=>setAccForm(p=>({...p,phone:e.target.value}))} placeholder="07XXXXXXXXX" style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13, boxSizing:"border-box", direction:"ltr", textAlign:"left" }} />
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:4 }}>كلمة المرور</label>
              <div style={{ position:"relative" }}>
                <input type={showPass?"text":"password"} value={accForm.password} onChange={e=>setAccForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:9, padding:"9px 12px", paddingLeft:36, fontSize:13, boxSizing:"border-box" }} />
                <button onClick={()=>setShowPass(v=>!v)} style={{ position:"absolute", left:10, top:10, background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:14 }}>{showPass?"🙈":"👁️"}</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:4 }}>الصلاحية</label>
              <div style={{ display:"flex", gap:8 }}>
                <div onClick={()=>setAccForm(p=>({...p,role:"supervisor"}))} style={{ flex:1, border:`2px solid ${accForm.role==="supervisor"?C.orange:C.border}`, borderRadius:9, padding:"9px 6px", textAlign:"center", cursor:"pointer", background:accForm.role==="supervisor"?"#FFF3E0":"#fff" }}>
                  <div style={{ fontSize:16 }}>👤</div>
                  <div style={{ fontSize:10, fontWeight:700, color:accForm.role==="supervisor"?C.orange:C.muted }}>مشرف</div>
                </div>
                <div onClick={()=>setAccForm(p=>({...p,role:"superadmin"}))} style={{ flex:1, border:`2px solid ${accForm.role==="superadmin"?C.admin:C.border}`, borderRadius:9, padding:"9px 6px", textAlign:"center", cursor:"pointer", background:accForm.role==="superadmin"?`${C.admin}10`:"#fff" }}>
                  <div style={{ fontSize:16 }}>⚙️</div>
                  <div style={{ fontSize:10, fontWeight:700, color:accForm.role==="superadmin"?C.admin:C.muted }}>مدير كامل</div>
                </div>
              </div>
            </div>
          </div>
          {accForm.role==="supervisor"&&<div style={{ background:"#FFFDE7", border:"1px dashed #D69E2E", borderRadius:8, padding:"8px 12px", fontSize:11, color:"#92400E", marginBottom:10 }}>⚠️ المشرف يملك صلاحية قراءة جميع البيانات وإدارة الاشتراكات، لكن بدون الوصول إلى إعدادات الدفع وحسابات الإدارة</div>}
          {accErr&&<div style={{ background:"#FFF5F5",border:"1px solid #FED7D7",borderRadius:8,padding:"8px 12px",fontSize:12,color:C.red,marginBottom:10 }}>{accErr}</div>}
          <button onClick={addAccount} style={{ width:"100%", background:`linear-gradient(135deg,${C.admin},#553C9A)`, color:"#fff", border:"none", borderRadius:10, padding:"12px", fontWeight:800, cursor:"pointer", fontSize:13 }}>✅ إضافة الحساب</button>
        </div>
      </div>}
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

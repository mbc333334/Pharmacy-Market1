import React, { useState, useEffect, useRef } from "react";
import { api } from "./api";

function broadcastSync() {
  try { new BroadcastChannel("dawapl_sync").postMessage("update"); } catch {}
}

const C = {
  primary:"#1A9E6E", dark:"#0D7A54", light:"#E6F7F2", text:"#1a202c",
  muted:"#718096", border:"#e2e8f0", bg:"#f7fafc", surface:"#fff",
  red:"#E53E3E", green:"#38A169", blue:"#3182CE", orange:"#DD6B20",
};

const DC_COMPANIES_LIST = [
  { id:"dc1", name:"شركة الإسراع للتوصيل", phone:"9647501222222" },
  { id:"dc2", name:"توصيل الخليج",          phone:"9647701222223" },
  { id:"dc3", name:"شركة السهم السريع",      phone:"9647601222224" },
  { id:"dc4", name:"نجوم التوصيل",           phone:"9647801222225" },
];
function getDeliveryCompanies() {
  return DC_COMPANIES_LIST.map(dc => {
    try { const s=localStorage.getItem(`dc_profile_${dc.id}`); if(s){ const p=JSON.parse(s); return {...dc,name:p.name||dc.name,phone:(p.phone||dc.phone).replace(/^0/,"964")}; } } catch {}
    return dc;
  });
}

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

// ─── Subscription Plans (Pharmacy) ────────────────────────────────────────────
const PH_PLANS = [
  { id:"free",     icon:"🆓", name:"مجاني",      price:0,      color:"#718096", features:["حتى 50 منتج في المخزون","ظهور أساسي في التطبيق","دعم واتساب","بدون عروض أو إعلانات"] },
  { id:"standard", icon:"⭐", name:"ستاندرد",    price:35000,  color:"#3182CE", recommended:true, features:["حتى 500 منتج في المخزون","ظهور محسّن في نتائج البحث","إنشاء عروض وتخفيضات","إعلان واحد شهرياً في التطبيق","تقارير مبيعات أساسية","دعم أولوية"] },
  { id:"premium",  icon:"👑", name:"بريميوم ✨",  price:75000,  color:"#7C3AED", features:["منتجات غير محدودة","أولوية قصوى في البحث","عروض وتخفيضات غير محدودة","3 إعلانات شهرياً في التطبيق","تحليلات مبيعات متقدمة","مدير حساب خاص","دعم 24/7 عبر واتساب"] },
];
// ─── Platform Payment Accounts ────────────────────────────────────────────────
const PLATFORM_ACCOUNTS = [
  { id:"zainCash",   label:"زين كاش",     icon:"📱", color:"#8B1538", num:"07501000001", hint:"أرسل المبلغ ثم ضع رقم العملية هنا" },
  { id:"fastPay",    label:"فاست باي",    icon:"⚡", color:"#0066CC", num:"07509000001", hint:"احتفظ بصورة الإيصال" },
  { id:"fib",        label:"FIB",         icon:"🏦", color:"#004E87", num:"IQ98FIBK0000001", hint:"تحويل مصرفي عبر تطبيق FIB" },
  { id:"asiaHawala", label:"آسيا حوالة", icon:"💳", color:"#B45309", num:"AH-DAWAPLUS-001", hint:"أذكر اسم المستفيد: دواء+" },
  { id:"cashAdmin",  label:"كاش / واتساب",icon:"💵", color:"#38A169", num:"07501234567",   hint:"تواصل مع المدير مباشرة" },
];
const orderBadge=(s:string)=>s==="new"?{l:"جديد",c:"#D97706",b:"#FFF3E0"}:s==="processing"?{l:"قيد التجهيز",c:C.blue,b:"#EBF8FF"}:s==="completed"?{l:"مكتمل",c:C.green,b:"#F0FFF4"}:{l:"ملغي",c:C.red,b:"#FFF5F5"};

export default function App() {
  const [ph, setPh] = useState<typeof PHARMACIES[0]|null>(null);
  const [sec, setSec] = useState("dash");
  const [products, setProductsState] = useState<any[]>([]);
  const [orders, setOrdersState] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [social, setSocialState] = useState<any>({ facebook:"", instagram:"", tiktok:"", website:"", whatsapp:"" });
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(()=>{
    if (!ph) return;
    setProductsState(LS(`ph_products_${ph.id}`, INIT_PRODUCTS));
    setOrdersState(LS(`ph_orders_${ph.id}`, INIT_ORDERS));
    setProfile(LS(`ph_profile_${ph.id}`, ph));
    setSocialState(LS(`ph_social_${ph.id}`, { facebook:"", instagram:"", tiktok:"", website:"", whatsapp: ph.phone }));
    // Sync from API
    api.getPharmacy(ph.id).then(d=>{ if(d){ setProfile(d); localStorage.setItem(`ph_profile_${ph.id}`,JSON.stringify(d)); }}).catch(()=>{});
    api.getProducts(ph.id).then(rows=>{ if(rows?.length){ setProductsState(rows); localStorage.setItem(`ph_products_${ph.id}`,JSON.stringify(rows)); }}).catch(()=>{});
    api.getOrders(ph.id).then(rows=>{ if(rows?.length){ setOrdersState(rows); localStorage.setItem(`ph_orders_${ph.id}`,JSON.stringify(rows)); }}).catch(()=>{});
  }, [ph?.id]);

  const setProducts = (v:any)=>{ setProductsState(v); if(ph){ localStorage.setItem(`ph_products_${ph.id}`,JSON.stringify(v)); broadcastSync(); } };
  const setOrders = (v:any)=>{ setOrdersState(v); if(ph){ localStorage.setItem(`ph_orders_${ph.id}`,JSON.stringify(v)); broadcastSync(); } };
  const saveSocial = (v:any)=>{ setSocialState(v); if(ph){ localStorage.setItem(`ph_social_${ph.id}`,JSON.stringify(v)); broadcastSync(); } };
  const saveProfile = (d:any)=>{
    setProfile(d);
    if(ph){
      localStorage.setItem(`ph_profile_${ph.id}`,JSON.stringify(d));
      api.updatePharmacy(ph.id, d).catch(()=>{});
      broadcastSync();
    }
  };

  const MENU = [{id:"dash",l:"لوحة التحكم",i:"📊"},{id:"acc",l:"حسابي",i:"👤"},{id:"inv",l:"المخزون",i:"📦"},
    {id:"orders",l:"الطلبات",i:"🛒"},{id:"sub",l:"الاشتراك",i:"💎"},{id:"fin",l:"المالية",i:"💰"},
    {id:"social",l:"وسائل التواصل",i:"📱"},{id:"sup",l:"الدعم",i:"💬"}];

  if (!ph) return <Login onLogin={p=>{ setPh(p); setSec("dash"); setShowWelcome(true); }} />;
  const portalUrl = `${window.location.origin}/dawaaplus-pharmacies/`;
  return (
    <div dir="rtl" style={{ display:"flex", height:"100vh", fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", overflow:"hidden" }}>
      {showWelcome && <WelcomeShareModal user={ph} onClose={()=>setShowWelcome(false)} portalUrl={portalUrl} portalName="بوابة الصيدليات" color={C.primary} icon="💊" />}
      <Sidebar color={C.primary} icon="💊" title="بوابة الصيدلية" name={ph.name}
        menu={MENU} active={sec} onNav={setSec} onLogout={()=>setPh(null)} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <TopBar color={C.primary} label={MENU.find(m=>m.id===sec)?.l||""} name={ph.name} portalUrl={portalUrl} />
        <div style={{ flex:1, overflowY:"auto", padding:20, background:C.bg }}>
          {sec==="dash"   && <PhDash ph={ph} products={products} orders={orders} />}
          {sec==="acc"    && <PhAccount ph={profile||ph} onSave={saveProfile} />}
          {sec==="inv"    && <Inventory products={products} onUpdate={setProducts} color={C.primary} />}
          {sec==="orders" && <Orders orders={orders} onUpdate={setOrders} color={C.primary} />}
          {sec==="sub"    && <SubPage ph={ph} plan={ph.plan} color={C.primary} />}
          {sec==="fin"    && <FinPage revenue={ph.revenue} color={C.primary} />}
          {sec==="social" && <SocialMedia social={social} onSave={saveSocial} color={C.primary} name={ph.name} />}
          {sec==="sup"    && <Support name={ph.name} color={C.primary} />}
        </div>
      </div>
    </div>
  );
}

function ForgotModal({ onClose, color, data, passKey }:{ onClose:()=>void; color:string; data:any[]; passKey:(id:string)=>string }) {
  const [step,setStep]=useState<"phone"|"otp"|"pass"|"done">("phone");
  const [fpPhone,setFpPhone]=useState(""); const [fpErr,setFpErr]=useState(""); const [fpId,setFpId]=useState("");
  const [otp,setOtp]=useState(""); const [otpIn,setOtpIn]=useState(""); const [timer,setTimer]=useState(0);
  const [npw,setNpw]=useState(""); const [cpw,setCpw]=useState("");
  const timerRef=useRef<any>(null);
  useEffect(()=>{ if(timer<=0){ if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null; } return; }
    timerRef.current=setInterval(()=>setTimer(v=>v-1),1000); return()=>{ if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null; } }; },[timer]);
  const genOtp=()=>String(Math.floor(100000+Math.random()*900000));
  const sendOtp=()=>{ const acc=data.find(a=>a.phone===fpPhone.trim()); if(!acc){ setFpErr("لا يوجد حساب مسجّل بهذا الرقم"); return; }
    setFpId(acc.id); const code=genOtp(); setOtp(code); setOtpIn(""); setFpErr(""); setTimer(60); setStep("otp"); };
  const verifyOtp=()=>{ if(otpIn!==otp){ setFpErr("رمز التحقق غير صحيح"); return; } setFpErr(""); setNpw(""); setCpw(""); setStep("pass"); };
  const resetPass=()=>{ if(!npw||npw!==cpw){ setFpErr("كلمتا المرور غير متطابقتين"); return; }
    localStorage.setItem(passKey(fpId),npw); setFpErr(""); setStep("done"); };
  const overlay:React.CSSProperties = { position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif" };
  const card:React.CSSProperties = { background:"#fff",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:400,direction:"rtl",position:"relative",boxShadow:"0 20px 60px rgba(0,0,0,0.25)" };
  const inp:React.CSSProperties = { width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid #e2e8f0`,fontSize:14,textAlign:"right",outline:"none",boxSizing:"border-box",marginBottom:10 };
  const btn=(bg:string):React.CSSProperties=>({ background:bg,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",width:"100%",fontWeight:800,fontSize:15,cursor:"pointer",marginTop:4 });
  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{ position:"absolute",top:14,left:14,background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#718096" }}>✕</button>
        <div style={{ textAlign:"center",marginBottom:20 }}>
          <div style={{ fontSize:40,marginBottom:6 }}>🔐</div>
          <h3 style={{ margin:0,fontSize:18,fontWeight:900 }}>نسيت كلمة المرور؟</h3>
          <p style={{ margin:"4px 0 0",fontSize:12,color:"#718096" }}>سنساعدك في استعادة حسابك</p>
        </div>
        {step==="phone" && <>
          <p style={{ fontSize:13,fontWeight:700,margin:"0 0 6px" }}>رقم الهاتف المسجّل</p>
          <input style={inp} placeholder="07xxxxxxxxx" value={fpPhone} onChange={e=>{ setFpErr(""); setFpPhone(e.target.value); }} />
          {fpErr && <div style={{ background:"#FFF5F5",border:"1px solid #FED7D7",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#E53E3E",marginBottom:8 }}>⚠️ {fpErr}</div>}
          <button style={btn(color)} onClick={sendOtp}>📲 إرسال رمز التحقق</button>
        </>}
        {step==="otp" && <>
          <div style={{ background:"#FFFBEB",border:"1.5px solid #F6AD55",borderRadius:14,padding:"14px",textAlign:"center",marginBottom:14 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#744210",marginBottom:4 }}>📱 رمز التحقق التجريبي</div>
            <div style={{ fontSize:28,fontWeight:900,letterSpacing:8,color:"#744210" }}>{otp}</div>
            <div style={{ fontSize:10,color:"#92400E",marginTop:4 }}>سيُرسَل عبر SMS في التطبيق الفعلي</div>
          </div>
          <p style={{ fontSize:13,fontWeight:700,margin:"0 0 6px" }}>أدخل رمز التحقق المكوّن من 6 أرقام</p>
          <input style={{ ...inp,textAlign:"center",fontSize:22,letterSpacing:10,fontWeight:800 }} placeholder="• • • • • •" maxLength={6}
            value={otpIn} onChange={e=>{ setFpErr(""); setOtpIn(e.target.value.replace(/\D/g,"").slice(0,6)); }} />
          {fpErr && <div style={{ background:"#FFF5F5",border:"1px solid #FED7D7",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#E53E3E",marginBottom:8 }}>⚠️ {fpErr}</div>}
          <div style={{ textAlign:"left",marginBottom:10,fontSize:12 }}>
            {timer>0 ? <span style={{ color:"#718096" }}>⏱ إعادة الإرسال بعد {timer}ث</span>
              : <button onClick={()=>{ const c=genOtp(); setOtp(c); setOtpIn(""); setFpErr(""); setTimer(60); }} style={{ background:"none",border:"none",color,fontWeight:700,cursor:"pointer",fontSize:13,textDecoration:"underline",padding:0 }}>إعادة إرسال الرمز</button>}
          </div>
          <button style={{ ...btn(color), opacity:otpIn.length<6?0.5:1 }} onClick={verifyOtp} disabled={otpIn.length<6}>✅ تحقق من الرمز</button>
          <button onClick={()=>{ setStep("phone"); setFpErr(""); }} style={{ background:"none",border:"none",width:"100%",marginTop:10,color:"#718096",cursor:"pointer",fontSize:13,textDecoration:"underline" }}>← العودة</button>
        </>}
        {step==="pass" && <>
          <p style={{ fontSize:13,fontWeight:700,margin:"0 0 6px" }}>كلمة المرور الجديدة</p>
          <input style={inp} type="password" placeholder="••••••••" value={npw} onChange={e=>{ setFpErr(""); setNpw(e.target.value); }} />
          <p style={{ fontSize:13,fontWeight:700,margin:"0 0 6px" }}>تأكيد كلمة المرور</p>
          <input style={{ ...inp, borderColor: cpw&&cpw!==npw?"#E53E3E":"#e2e8f0" }} type="password" placeholder="••••••••" value={cpw} onChange={e=>{ setFpErr(""); setCpw(e.target.value); }} />
          {fpErr && <div style={{ background:"#FFF5F5",border:"1px solid #FED7D7",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#E53E3E",marginBottom:8 }}>⚠️ {fpErr}</div>}
          <button style={{ ...btn(color), opacity:(!npw||npw!==cpw)?0.5:1 }} onClick={resetPass} disabled={!npw||npw!==cpw}>🔒 حفظ كلمة المرور الجديدة</button>
        </>}
        {step==="done" && <div style={{ textAlign:"center",padding:"20px 0" }}>
          <div style={{ fontSize:60,marginBottom:12 }}>✅</div>
          <h3 style={{ color:"#38A169",margin:"0 0 8px",fontWeight:900 }}>تم تغيير كلمة المرور!</h3>
          <p style={{ color:"#718096",fontSize:13,margin:"0 0 20px" }}>يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
          <button style={btn(color)} onClick={onClose}>العودة لتسجيل الدخول</button>
        </div>}
      </div>
    </div>
  );
}

function RegisterForm({ color, onBack }:{ color:string; onBack:()=>void }) {
  const [f,setF]=useState({ name:"", city:"", phone:"", password:"", confirm:"", email:"", address:"", license:"" });
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false); const [done,setDone]=useState(false);
  const upd=(k:string)=>(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>setF(v=>({...v,[k]:e.target.value}));
  const CITIES=["أربيل","السليمانية","دهوك","كركوك","الموصل","بغداد","البصرة","أخرى"];
  const inp:React.CSSProperties={width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid #e2e8f0`,fontSize:14,textAlign:"right",outline:"none",boxSizing:"border-box",marginBottom:10};
  const submit=async()=>{
    setErr("");
    if(!f.name.trim()||!f.phone.trim()||!f.password.trim()) return setErr("الاسم ورقم الهاتف وكلمة المرور مطلوبة");
    if(f.password!==f.confirm) return setErr("كلمتا المرور غير متطابقتين");
    if(f.password.length<6) return setErr("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    setLoading(true);
    try {
      await api.register({ name:f.name.trim(), city:f.city, phone:f.phone.trim(), password:f.password.trim(), email:f.email.trim()||undefined, address:f.address.trim()||undefined, license:f.license.trim()||undefined });
      setDone(true);
    } catch(e:any){ setErr(e.message||"حدث خطأ. حاول مرة أخرى"); }
    setLoading(false);
  };
  if(done) return (
    <div style={{ textAlign:"center", padding:"32px 20px" }}>
      <div style={{ fontSize:64, marginBottom:12 }}>✅</div>
      <h3 style={{ fontWeight:900, fontSize:20, color:color, margin:"0 0 10px" }}>تم إرسال طلبك!</h3>
      <p style={{ fontSize:14, color:"#4A5568", lineHeight:1.7 }}>سيتم مراجعة بياناتك من قبل فريق دواء+.<br/>ستُبلَّغ بالموافقة عبر رقم هاتفك.</p>
      <div style={{ background:"#F0FFF4", border:"1px solid #9AE6B4", borderRadius:12, padding:"12px 16px", marginTop:16, fontSize:13, color:"#276749" }}>
        ⏱ المراجعة تستغرق عادةً 24-48 ساعة
      </div>
      <button onClick={onBack} style={{ background:color, color:"#fff", border:"none", borderRadius:10, padding:"12px 32px", fontWeight:800, fontSize:15, cursor:"pointer", marginTop:20 }}>العودة لتسجيل الدخول</button>
    </div>
  );
  return (
    <>
      <h2 style={{ textAlign:"center", fontSize:17, fontWeight:800, margin:"0 0 18px" }}>📋 طلب تسجيل صيدلية جديدة</h2>
      <label style={{ fontSize:12,fontWeight:700,display:"block",marginBottom:4 }}>اسم الصيدلية *</label>
      <input style={inp} placeholder="مثال: صيدلية الرازي" value={f.name} onChange={upd("name")} />
      <label style={{ fontSize:12,fontWeight:700,display:"block",marginBottom:4 }}>المدينة</label>
      <select style={{ ...inp, background:"#fff" }} value={f.city} onChange={upd("city")}>
        <option value="">اختر المدينة</option>
        {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
      </select>
      <label style={{ fontSize:12,fontWeight:700,display:"block",marginBottom:4 }}>رقم الهاتف *</label>
      <input style={inp} placeholder="07xxxxxxxxx" value={f.phone} onChange={upd("phone")} />
      <label style={{ fontSize:12,fontWeight:700,display:"block",marginBottom:4 }}>كلمة المرور *</label>
      <input style={inp} type="password" placeholder="6 أحرف على الأقل" value={f.password} onChange={upd("password")} />
      <label style={{ fontSize:12,fontWeight:700,display:"block",marginBottom:4 }}>تأكيد كلمة المرور *</label>
      <input style={inp} type="password" placeholder="أعد كتابة كلمة المرور" value={f.confirm} onChange={upd("confirm")} />
      <label style={{ fontSize:12,fontWeight:700,display:"block",marginBottom:4 }}>رقم رخصة الصيدلية</label>
      <input style={inp} placeholder="مثال: PH-2024-001 (اختياري)" value={f.license} onChange={upd("license")} />
      <label style={{ fontSize:12,fontWeight:700,display:"block",marginBottom:4 }}>البريد الإلكتروني</label>
      <input style={inp} placeholder="example@email.com (اختياري)" value={f.email} onChange={upd("email")} />
      <label style={{ fontSize:12,fontWeight:700,display:"block",marginBottom:4 }}>العنوان التفصيلي</label>
      <input style={inp} placeholder="الشارع والحي (اختياري)" value={f.address} onChange={upd("address")} />
      {err && <div style={{ background:"#FFF5F5",border:"1px solid #FED7D7",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#E53E3E",marginBottom:10 }}>⚠️ {err}</div>}
      <button onClick={submit} disabled={loading} style={{ background:color,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",width:"100%",fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1 }}>
        {loading ? "⏳ جاري الإرسال..." : "📨 إرسال طلب التسجيل"}
      </button>
    </>
  );
}

function Login({ onLogin }:{ onLogin:(p:any)=>void }) {
  const [tab,setTab]=useState<"login"|"register">("login");
  const [phone,setPhone]=useState(""); const [pass,setPass]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const [showFp,setShowFp]=useState(false);
  const login=async()=>{
    setLoading(true); setErr("");
    try {
      const res = await api.login(phone.trim(), pass.trim());
      if(res?.user) { onLogin(res.user); return; }
    } catch(e:any) {
      // Check for specific error codes from API
      if(e.message) { setErr(e.message); setLoading(false); return; }
    }
    // fallback: local check
    const p=PHARMACIES.find(p=>p.phone===phone.trim()&&pass.trim()===(localStorage.getItem(`ph_pass_${p.id}`)||p.pass));
    p ? onLogin(p) : setErr("رقم الهاتف أو كلمة المرور غير صحيحة");
    setLoading(false);
  };
  const tabStyle=(active:boolean):React.CSSProperties=>({ flex:1, padding:"10px 0", border:"none", borderRadius:10, fontWeight:800, fontSize:14, cursor:"pointer", transition:"all .2s", background:active?C.primary:"transparent", color:active?"#fff":C.muted });
  return (
    <div dir="rtl" style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif" }}>
      {showFp && <ForgotModal onClose={()=>setShowFp(false)} color={C.primary} data={PHARMACIES} passKey={id=>`ph_pass_${id}`} />}
      <div style={{ background:`linear-gradient(135deg,${C.primary},${C.dark})`, padding:"48px 24px 70px", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:8 }}>💊</div>
        <h1 style={{ color:"#fff", fontSize:32, fontWeight:900, margin:0 }}>بوابة الصيدليات</h1>
        <p style={{ color:"rgba(255,255,255,0.8)", fontSize:14, margin:"8px 0 0" }}>دواء+ — منصة إدارة الصيدلية</p>
      </div>
      <div style={{ maxWidth:440, margin:"-32px auto 0", padding:"0 20px 40px" }}>
        <div style={{ background:C.surface, borderRadius:20, padding:"20px 24px 28px", boxShadow:"0 8px 40px rgba(0,0,0,0.12)", marginBottom:18 }}>
          {/* Tab switcher */}
          <div style={{ display:"flex", background:"#f0f4f8", borderRadius:12, padding:4, marginBottom:20, gap:4 }}>
            <button style={tabStyle(tab==="login")} onClick={()=>{setTab("login");setErr("");}}>🔑 تسجيل الدخول</button>
            <button style={tabStyle(tab==="register")} onClick={()=>{setTab("register");setErr("");}}>📋 تسجيل جديد</button>
          </div>
          {tab==="login" ? <>
            <Inp label="رقم الهاتف" val={phone} set={setPhone} ph="07xxxxxxxxx" />
            <Inp label="كلمة المرور" val={pass} set={setPass} ph="••••••" type="password" />
            {err && <div style={{ background:"#FFF5F5",border:"1px solid #FED7D7",borderRadius:8,padding:"8px 12px",fontSize:12,color:C.red,marginBottom:10 }}>{err}</div>}
            <Btn label={loading?"جاري الدخول...":"دخول →"} color={C.primary} onClick={login} full />
            <button onClick={()=>setShowFp(true)} style={{ background:"none",border:"none",width:"100%",marginTop:10,color:C.primary,cursor:"pointer",fontSize:13,fontWeight:700,textDecoration:"underline",textAlign:"center" }}>🔑 نسيت كلمة المرور؟</button>
          </> : <RegisterForm color={C.primary} onBack={()=>setTab("login")} />}
        </div>
        {tab==="login" && <div style={{ background:C.surface, borderRadius:16, padding:"16px 18px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:12, color:C.muted, textAlign:"center", marginBottom:10 }}>🔑 صيدليات مسجّلة — اضغط للدخول</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {PHARMACIES.map(p=>(
              <button key={p.id} onClick={()=>onLogin(p)} style={{ background:C.light, border:`1px solid ${C.primary}30`, borderRadius:10, padding:"10px 14px", cursor:"pointer", textAlign:"right", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontWeight:700, color:C.primary, fontSize:13 }}>💊 {p.name}</span>
                <span style={{ fontSize:11, color:C.muted }}>{p.city} · {p.phone}</span>
              </button>
            ))}
          </div>
        </div>}
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

function genOTP(){ return String(Math.floor(100000+Math.random()*900000)); }
function PassCard({ storageKey, color }:{ storageKey:string; color:string }) {
  const [pf,setPf]=useState({ newPass:"", confirmPass:"" });
  const [showNew,setShowNew]=useState(false);
  const [pErr,setPErr]=useState("");
  const [pStep,setPStep]=useState<"form"|"otp"|"done">("form");
  const [otpCode,setOtpCode]=useState(""); const [otpInput,setOtpInput]=useState(""); const [otpErr,setOtpErr]=useState("");
  const [timer,setTimer]=useState(0);
  React.useEffect(()=>{ if(timer<=0)return; const t=setTimeout(()=>setTimer(v=>v-1),1000); return ()=>clearTimeout(t); },[timer]);
  const sendOtp=()=>{
    setPErr("");
    if (!pf.newPass.trim()) { setPErr("أدخل كلمة المرور الجديدة"); return; }
    if (pf.newPass.length<4) { setPErr("يجب أن تكون 4 أحرف على الأقل"); return; }
    if (pf.newPass!==pf.confirmPass) { setPErr("كلمتا المرور غير متطابقتين"); return; }
    const code=genOTP(); setOtpCode(code); setOtpInput(""); setOtpErr(""); setPStep("otp"); setTimer(60);
  };
  const verifyOtp=()=>{
    if (otpInput!==otpCode) { setOtpErr("رمز التحقق غير صحيح، حاول مجدداً"); return; }
    localStorage.setItem(storageKey, pf.newPass.trim());
    setPStep("done"); setTimeout(()=>{ setPStep("form"); setPf({ newPass:"", confirmPass:"" }); setOtpInput(""); },2500);
  };
  const resendOtp=()=>{ const code=genOTP(); setOtpCode(code); setOtpInput(""); setOtpErr(""); setTimer(60); };
  return (
    <Card style={{ maxWidth:560, marginTop:14, border:`1.5px solid ${color}30` }}>
      <SH icon="🔑" title="تغيير كلمة المرور" />
      {pStep==="done" ? (
        <div style={{ textAlign:"center", color:C.green, fontWeight:800, padding:"10px 0", fontSize:14 }}>✅ تم تغيير كلمة المرور بنجاح!</div>
      ) : pStep==="otp" ? (
        <div>
          <div style={{ background:"#FFFBEB", border:"1px solid #F6AD55", borderRadius:10, padding:"12px 14px", marginBottom:14, textAlign:"center" }}>
            <div style={{ fontSize:11, color:"#744210", marginBottom:6 }}>📱 رمز التحقق التجريبي — سيُرسَل عبر SMS في التطبيق الفعلي</div>
            <div style={{ fontSize:26, fontWeight:900, letterSpacing:8, color:"#744210" }}>{otpCode}</div>
          </div>
          <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:6, textAlign:"right" }}>أدخل رمز التحقق المكوّن من 6 أرقام</label>
          <input type="text" maxLength={6} value={otpInput}
            onChange={e=>{ setOtpErr(""); setOtpInput(e.target.value.replace(/\D/g,"").slice(0,6)); }}
            onKeyDown={(e:any)=>e.key==="Enter"&&otpInput.length===6&&verifyOtp()}
            placeholder="• • • • • •"
            style={{ width:"100%", border:`2px solid ${otpErr?C.red:color}`, borderRadius:10, padding:"12px", fontSize:22, textAlign:"center", letterSpacing:8, boxSizing:"border-box", fontWeight:800 }} />
          {otpErr&&<div style={{ fontSize:11, color:C.red, marginTop:4, marginBottom:4, textAlign:"right" }}>⚠️ {otpErr}</div>}
          <div style={{ fontSize:11, color:C.muted, textAlign:"right", margin:"8px 0 12px" }}>
            {timer>0 ? `⏱ إعادة الإرسال بعد ${timer}ث` : <button onClick={resendOtp} style={{ background:"none", border:"none", color, cursor:"pointer", fontWeight:700, fontSize:12, textDecoration:"underline" }}>إعادة إرسال الرمز</button>}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{ setPStep("form"); setOtpInput(""); setOtpErr(""); }} style={{ flex:1, background:C.bg, color:C.muted, border:`1px solid ${C.border}`, borderRadius:9, padding:10, fontWeight:700, cursor:"pointer", fontSize:13 }}>← رجوع</button>
            <button onClick={verifyOtp} disabled={otpInput.length<6}
              style={{ flex:2, background:otpInput.length===6?`linear-gradient(135deg,${color},${C.green})`:"#ccc", color:"#fff", border:"none", borderRadius:9, padding:10, fontWeight:800, cursor:otpInput.length===6?"pointer":"not-allowed", fontSize:13 }}>
              ✓ تحقق وتغيير كلمة المرور
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:3 }}>كلمة المرور الجديدة</label>
              <div style={{ position:"relative" }}>
                <input type={showNew?"text":"password"} value={pf.newPass} onChange={e=>setPf(p=>({...p,newPass:e.target.value}))}
                  placeholder="••••••" style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:9, padding:"9px 12px", paddingLeft:34, fontSize:13, boxSizing:"border-box" }} />
                <button onClick={()=>setShowNew(v=>!v)} style={{ position:"absolute", left:8, top:9, background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:13 }}>{showNew?"🙈":"👁️"}</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:3 }}>تأكيد كلمة المرور</label>
              <input type="password" value={pf.confirmPass} onChange={e=>setPf(p=>({...p,confirmPass:e.target.value}))}
                onKeyDown={(e:any)=>e.key==="Enter"&&sendOtp()} placeholder="••••••"
                style={{ width:"100%", border:`1.5px solid ${pf.confirmPass&&pf.confirmPass!==pf.newPass?C.red:C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }} />
            </div>
          </div>
          {pf.confirmPass&&pf.confirmPass!==pf.newPass&&<div style={{ fontSize:11, color:C.red, marginBottom:6 }}>⚠️ كلمتا المرور غير متطابقتين</div>}
          {pErr&&<div style={{ background:"#FFF5F5", border:"1px solid #FED7D7", borderRadius:7, padding:"7px 12px", fontSize:12, color:C.red, marginBottom:8 }}>{pErr}</div>}
          <button onClick={sendOtp} disabled={!pf.newPass||pf.newPass!==pf.confirmPass}
            style={{ width:"100%", background:pf.newPass&&pf.newPass===pf.confirmPass?`linear-gradient(135deg,${color},${C.green})`:"#ccc", color:"#fff", border:"none", borderRadius:9, padding:10, fontWeight:800, cursor:pf.newPass&&pf.newPass===pf.confirmPass?"pointer":"not-allowed", fontSize:13 }}>
            📲 إرسال رمز التحقق (OTP)
          </button>
        </div>
      )}
    </Card>
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
      <PassCard storageKey={`ph_pass_${ph.id}`} color={C.primary} />
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
  const [companies] = useState(()=>getDeliveryCompanies());
  const updateStatus=(id:string,status:string)=>onUpdate(orders.map((o:any)=>o.id===id?{...o,status}:o));
  const updateDc=(id:string,dcId:string)=>onUpdate(orders.map((o:any)=>o.id===id?{...o,dcId}:o));
  return (
    <div>
      <AppSync text="الطلبات تصل من تطبيق دواء+ مباشرة — حدّث حالتها وعيّن شركة توصيل" />
      <Card><SH icon="🛒" title={`الطلبات (${orders.length})`} />
        {orders.map((o:any)=>(
          <div key={o.id} style={{ borderBottom:`1px solid ${C.border}`, padding:"12px 0" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <div>
                <div style={{ fontWeight:700, color, fontSize:13 }}>{o.id}</div>
                <div style={{ fontSize:13 }}>{o.product}</div>
                <div style={{ fontSize:11, color:C.muted }}>{o.customer} · {o.date}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontWeight:700 }}>{o.amount.toLocaleString()} د.ع</span>
                <select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}
                  style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 9px", fontSize:12, cursor:"pointer" }}>
                  <option value="new">جديد</option><option value="processing">قيد التجهيز</option>
                  <option value="completed">مكتمل</option><option value="cancelled">ملغي</option>
                </select>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, background:C.bg, borderRadius:8, padding:"7px 10px" }}>
              <span style={{ fontSize:11, color:C.muted, flexShrink:0 }}>🚚 التوصيل:</span>
              <select value={o.dcId||""} onChange={e=>updateDc(o.id,e.target.value)}
                style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"4px 8px", fontSize:11, cursor:"pointer", flex:1 }}>
                <option value="">— بدون تعيين (اختياري) —</option>
                {companies.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {o.dcId && <a href={`https://wa.me/${companies.find((c:any)=>c.id===o.dcId)?.phone}?text=${encodeURIComponent(`طلب ${o.id} — ${o.product} — العميل: ${o.customer}`)}`} target="_blank" rel="noreferrer" style={{ background:"#25D366",color:"#fff",borderRadius:7,padding:"4px 10px",fontSize:11,textDecoration:"none",fontWeight:700,flexShrink:0 }}>📲 واتساب</a>}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SubPage({ ph, plan, color }:any) {
  const [step, setStep] = useState<"plans"|"pay"|"done">("plans");
  const [selPlanId, setSelPlanId] = useState<string|null>(null);
  const [payMethod, setPayMethod] = useState("zainCash");
  const [txRef, setTxRef] = useState("");
  const [myReqs, setMyReqs] = useState<any[]>(()=>{ try{ return (JSON.parse(localStorage.getItem("sub_requests")||"[]")).filter((r:any)=>r.subscriberId===ph.id); }catch{ return []; } });
  const pendingReq = myReqs.find((r:any)=>r.status==="pending");
  const selPlan = PH_PLANS.find(p=>p.id===selPlanId);
  const acct = PLATFORM_ACCOUNTS.find(a=>a.id===payMethod)||PLATFORM_ACCOUNTS[0];
  const curPlan = PH_PLANS.find(p=>p.id===plan)||PH_PLANS[0];

  const submitReq = () => {
    if (!selPlanId||!txRef.trim()) return;
    const req = { id:`REQ-${Date.now()}`, subscriberId:ph.id, subscriberType:"pharmacy", subscriberName:ph.name, subscriberPhone:ph.phone, subscriberCity:ph.city, currentPlan:plan, requestedPlan:selPlanId, paymentMethod:payMethod, paymentLabel:acct.label, transactionRef:txRef.trim(), amount:selPlan?.price||0, date:new Date().toISOString().slice(0,10), status:"pending" };
    try{ const all=JSON.parse(localStorage.getItem("sub_requests")||"[]"); all.unshift(req); localStorage.setItem("sub_requests",JSON.stringify(all)); broadcastSync(); }catch{}
    setMyReqs(p=>[req,...p]); setStep("done"); setTxRef("");
  };
  return (
    <div>
      <Card style={{ background:`linear-gradient(135deg,${color}12,${color}06)`, border:`2px solid ${color}35`, marginBottom:16 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ fontSize:11,color:C.muted,marginBottom:3 }}>اشتراكك الحالي</div>
            <div style={{ fontWeight:900,fontSize:20 }}>{curPlan.icon} {curPlan.name}</div>
            <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{plan==="free"?"50 منتج · بدون إعلانات":plan==="standard"?"500 منتج · إعلان/شهر · عروض":"غير محدود · 3 إعلانات · مدير حساب"}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            {pendingReq?<Bdg l="طلب معلّق ⏳" c={C.orange} b="#FFF3E0" />:<Bdg l={plan==="free"?"مجاني":"نشط ✓"} c={plan==="free"?C.muted:C.green} b={plan==="free"?"#EDF2F7":"#F0FFF4"} />}
          </div>
        </div>
      </Card>
      {pendingReq&&<div style={{ background:"#FFFDE7",border:"2px dashed #D69E2E",borderRadius:14,padding:"14px 16px",marginBottom:16,display:"flex",gap:12,alignItems:"center" }}>
        <div style={{ fontSize:28 }}>⏳</div>
        <div><div style={{ fontWeight:800,fontSize:14 }}>طلب ترقية قيد المراجعة</div>
        <div style={{ fontSize:12,color:C.muted }}>ترقية إلى {PH_PLANS.find(p=>p.id===pendingReq.requestedPlan)?.name} · المرجع: <b>{pendingReq.transactionRef}</b></div>
        <div style={{ fontSize:11,color:C.muted }}>بتاريخ {pendingReq.date} — سيراجعه المدير خلال 24 ساعة</div></div>
      </div>}
      {step==="plans"&&<div>
        <div style={{ fontSize:14,fontWeight:700,marginBottom:12,color:C.text }}>📋 مقارنة خطط الاشتراك:</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:14,marginBottom:16 }}>
          {PH_PLANS.map(p=>(
            <div key={p.id} onClick={()=>{ if(p.id!==plan&&!pendingReq) setSelPlanId(selPlanId===p.id?null:p.id); }}
              style={{ border:`2px solid ${selPlanId===p.id?p.color:p.id===plan?color:C.border}`,borderRadius:16,padding:"16px 14px",cursor:p.id===plan||pendingReq?"default":"pointer",position:"relative",background:selPlanId===p.id?`${p.color}08`:C.surface,transition:"all 0.15s" }}>
              {p.id===plan&&<div style={{ position:"absolute",top:-10,right:14,background:color,color:"#fff",borderRadius:9,padding:"2px 10px",fontSize:11,fontWeight:700 }}>اشتراكك الحالي</div>}
              {(p as any).recommended&&p.id!==plan&&<div style={{ position:"absolute",top:-10,left:14,background:"#F59E0B",color:"#fff",borderRadius:9,padding:"2px 10px",fontSize:11,fontWeight:700 }}>⭐ الأكثر طلباً</div>}
              <div style={{ fontWeight:800,fontSize:17,marginBottom:4,color:p.color }}>{p.icon} {p.name}</div>
              <div style={{ fontSize:22,fontWeight:900,color:p.id==="free"?C.muted:p.color,marginBottom:10 }}>{p.price===0?"مجاني":`${p.price.toLocaleString()} د.ع/شهر`}</div>
              {p.features.map(f=><div key={f} style={{ fontSize:12,marginBottom:4,display:"flex",gap:5 }}><span style={{ color:C.green,flexShrink:0 }}>✓</span>{f}</div>)}
              {selPlanId===p.id&&<div style={{ marginTop:10,background:`${p.color}20`,borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,color:p.color,textAlign:"center" }}>✓ تم الاختيار</div>}
            </div>
          ))}
        </div>
        {selPlanId&&selPlanId!==plan&&!pendingReq&&<button onClick={()=>setStep("pay")} style={{ background:`linear-gradient(135deg,${color},${C.dark})`,color:"#fff",border:"none",borderRadius:12,padding:"13px 28px",fontWeight:800,cursor:"pointer",fontSize:14 }}>متابعة للدفع →</button>}
      </div>}
      {step==="pay"&&selPlan&&<Card style={{ border:`2px solid ${color}40` }}>
        <SH icon="💳" title={`الدفع — الترقية إلى ${selPlan.name}`} />
        <div style={{ background:C.bg,borderRadius:10,padding:"12px 14px",marginBottom:14 }}>
          <div style={{ fontWeight:700,fontSize:13 }}>المبلغ: <span style={{ color,fontSize:16 }}>{selPlan.price.toLocaleString()} د.ع / شهرياً</span></div>
        </div>
        <div style={{ fontSize:13,fontWeight:700,marginBottom:8 }}>اختر وسيلة الدفع:</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14 }}>
          {PLATFORM_ACCOUNTS.map(a=>(
            <div key={a.id} onClick={()=>setPayMethod(a.id)} style={{ border:`2px solid ${payMethod===a.id?a.color:C.border}`,borderRadius:10,padding:"10px 6px",cursor:"pointer",textAlign:"center",background:payMethod===a.id?`${a.color}10`:C.surface }}>
              <div style={{ fontSize:20,marginBottom:3 }}>{a.icon}</div>
              <div style={{ fontSize:11,fontWeight:700,color:payMethod===a.id?a.color:C.text }}>{a.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background:`${acct.color}08`,border:`1px solid ${acct.color}40`,borderRadius:12,padding:"14px 16px",marginBottom:14 }}>
          <div style={{ fontSize:11,color:C.muted,marginBottom:4 }}>📤 حوّل المبلغ إلى حساب منصة دواء+ ({acct.label})</div>
          <div style={{ fontSize:20,fontWeight:900,color:acct.color,letterSpacing:2,marginBottom:4 }}>{acct.num}</div>
          <div style={{ fontSize:11,color:C.muted }}>باسم: دواء+ · {acct.hint}</div>
        </div>
        <label style={{ fontSize:12,fontWeight:700,color:C.muted,display:"block",marginBottom:6 }}>رقم العملية / مرجع الدفع *</label>
        <input value={txRef} onChange={e=>setTxRef(e.target.value)} placeholder="مثال: ZC-20250404-123456"
          style={{ width:"100%",border:`1.5px solid ${C.border}`,borderRadius:10,padding:"11px 14px",fontSize:13,boxSizing:"border-box",marginBottom:14 }} />
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>setStep("plans")} style={{ background:C.bg,color:C.text,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 18px",fontWeight:700,cursor:"pointer",fontSize:13 }}>← رجوع</button>
          <button onClick={submitReq} disabled={!txRef.trim()} style={{ flex:1,background:txRef.trim()?`linear-gradient(135deg,${color},${C.dark})`:"#ccc",color:"#fff",border:"none",borderRadius:10,padding:11,fontWeight:800,cursor:txRef.trim()?"pointer":"not-allowed",fontSize:14 }}>📨 إرسال طلب الترقية</button>
        </div>
      </Card>}
      {step==="done"&&<div style={{ textAlign:"center",background:"#F0FFF4",border:"2px solid #38A169",borderRadius:16,padding:"32px 24px" }}>
        <div style={{ fontSize:52,marginBottom:8 }}>✅</div>
        <h3 style={{ color:C.green,margin:"0 0 8px" }}>تم إرسال طلب الترقية!</h3>
        <p style={{ color:C.muted,fontSize:13,margin:"0 0 16px" }}>سيراجع مدير المنصة طلبك خلال 24 ساعة ويُفعَّل الاشتراك فور تأكيد الدفع.</p>
        <button onClick={()=>setStep("plans")} style={{ background:color,color:"#fff",border:"none",borderRadius:10,padding:"10px 24px",fontWeight:700,cursor:"pointer" }}>العودة</button>
      </div>}
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
function PlatformHub({ color, portalUrl, currentIcon, currentLabel }:any) {
  const [open,setOpen]=useState(false);
  const [copied,setCopied]=useState(false);
  const base=window.location.origin;
  const portals=[
    { label:"بوابة الصيدليات",  icon:"💊", color:"#1A9E6E", path:"/dawaaplus-pharmacies/", current:currentLabel==="pharmacy" },
    { label:"بوابة المذاخر",    icon:"🏭", color:"#0D7A54", path:"/dawaaplus-warehouses/", current:currentLabel==="warehouse" },
    { label:"بوابة التوصيل",    icon:"🚛", color:"#D69E2E", path:"/dawaaplus-delivery/",   current:currentLabel==="delivery" },
  ];
  const copy=()=>{ navigator.clipboard.writeText(portalUrl||window.location.href).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); }); };
  return (
    <div style={{ position:"relative" }}>
      <button onClick={()=>setOpen(v=>!v)} style={{ display:"flex",alignItems:"center",gap:6,background:open?`${color}15`:"#F7FAFC",border:`1.5px solid ${open?color:C.border}`,borderRadius:10,padding:"5px 12px",cursor:"pointer",fontWeight:800,fontSize:12,color:open?color:C.text }}>
        <span style={{ fontSize:15 }}>🌐</span> دواء+ <span style={{ fontSize:10,color:C.muted }}>▾</span>
      </button>
      {open&&<div style={{ position:"fixed",inset:0,zIndex:998 }} onClick={()=>setOpen(false)} />}
      {open&&<div style={{ position:"absolute",top:38,left:0,background:"#fff",borderRadius:14,boxShadow:"0 8px 32px rgba(0,0,0,0.18)",border:`1px solid ${C.border}`,padding:"14px",width:260,zIndex:999 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12,paddingBottom:10,borderBottom:`1px solid ${C.border}` }}>
          <div style={{ width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${color},#0A6144)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>{currentIcon}</div>
          <div><div style={{ fontWeight:900,fontSize:13,color:C.text }}>منصة دواء+</div><div style={{ fontSize:10,color:C.muted }}>بوابات المشتركين</div></div>
        </div>
        {portals.map(p=>(
          <a key={p.path} href={`${base}${p.path}`} target={p.current?"_self":"_blank"} rel="noreferrer" onClick={()=>setOpen(false)}
            style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:9,marginBottom:4,background:p.current?`${p.color}10`:"transparent",textDecoration:"none",border:p.current?`1px solid ${p.color}30`:"1px solid transparent" }}>
            <span style={{ fontSize:18 }}>{p.icon}</span>
            <span style={{ fontSize:13,fontWeight:p.current?800:500,color:p.current?p.color:C.text }}>{p.label}</span>
            {p.current&&<span style={{ marginRight:"auto",fontSize:10,background:`${p.color}20`,color:p.color,borderRadius:6,padding:"2px 6px",fontWeight:700 }}>هذه البوابة</span>}
            {!p.current&&<span style={{ marginRight:"auto",fontSize:11,color:C.muted }}>↗</span>}
          </a>
        ))}
        <div style={{ marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}` }}>
          <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>📋 رابط بوابتك الخاصة</div>
          <div style={{ display:"flex",gap:6 }}>
            <div style={{ flex:1,background:C.bg,borderRadius:7,padding:"6px 8px",fontSize:10,color:C.muted,wordBreak:"break-all",lineHeight:1.4 }}>{(portalUrl||window.location.href).replace(/https?:\/\//,"")}</div>
            <button onClick={copy} style={{ background:copied?"#F0FFF4":"#EDF2F7",border:`1px solid ${copied?C.green:C.border}`,borderRadius:7,padding:"6px 10px",fontSize:11,cursor:"pointer",fontWeight:700,color:copied?C.green:C.text,flexShrink:0 }}>{copied?"✅":"📋"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
function TopBar({ color,label,name,portalUrl }:any) {
  const msg=encodeURIComponent(`💊 منصة دواء+ | بوابة الصيدليات\n${portalUrl||window.location.origin}`);
  return (
    <div style={{ background:"#fff",borderBottom:`1px solid ${C.border}`,padding:"0 20px",height:56,display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
      <div style={{ flex:1 }}><span style={{ fontWeight:800,fontSize:15 }}>{label}</span></div>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        <PlatformHub color={color} portalUrl={portalUrl} currentIcon="💊" currentLabel="pharmacy" />
        <a href={`https://wa.me/?text=${msg}`} target="_blank" rel="noreferrer" title="مشاركة عبر واتساب" style={{ background:"#25D366",color:"#fff",borderRadius:8,padding:"5px 10px",fontSize:11,textDecoration:"none",fontWeight:700 }}>💬 واتساب</a>
        <div style={{ display:"flex",alignItems:"center",gap:6,background:`${color}12`,borderRadius:20,padding:"5px 12px",border:`1px solid ${color}30` }}>
          <span style={{ width:7,height:7,borderRadius:"50%",background:C.green,display:"block" }} />
          <span style={{ fontSize:11,color,fontWeight:700 }}>📡 متزامن مع التطبيق</span>
        </div>
      </div>
    </div>
  );
}

function WelcomeShareModal({ user,onClose,portalUrl,portalName,color,icon }:any) {
  const [copied,setCopied]=useState(false);
  const phone=(user.phone||"").replace(/^0/,"964");
  const msg=encodeURIComponent(`${icon} مرحباً في دواء+!\n${portalName}\n\nيمكنك الوصول عبر:\n${portalUrl}\n\nرقم الدخول: ${user.phone}`);
  const copy=()=>{ navigator.clipboard.writeText(portalUrl).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); }); };
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div dir="rtl" style={{ background:"#fff",borderRadius:22,padding:30,maxWidth:420,width:"100%",boxShadow:"0 24px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign:"center",marginBottom:20 }}>
          <div style={{ fontSize:52,marginBottom:8 }}>{icon}</div>
          <h2 style={{ fontSize:22,fontWeight:900,margin:"0 0 6px",color:C.text }}>مرحباً بك في دواء+ 🎉</h2>
          <p style={{ fontSize:13,color:C.muted,margin:0 }}>احتفظ برابط منصتك وشاركه مع فريقك</p>
        </div>
        <div style={{ background:C.bg,borderRadius:12,padding:"12px 16px",marginBottom:18,border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:11,color:C.muted,marginBottom:4 }}>🔗 رابط {portalName}</div>
          <div style={{ fontSize:12,fontWeight:700,color:C.text,wordBreak:"break-all" }}>{portalUrl}</div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12 }}>
          <a href={`https://wa.me/${phone}?text=${msg}`} target="_blank" rel="noreferrer"
            style={{ background:"#25D366",color:"#fff",borderRadius:10,padding:"12px 10px",textDecoration:"none",textAlign:"center",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>💬 واتساب</a>
          <a href={`https://t.me/share/url?url=${encodeURIComponent(portalUrl)}&text=${encodeURIComponent(`${icon} دواء+ | ${portalName}`)}`} target="_blank" rel="noreferrer"
            style={{ background:"#2AABEE",color:"#fff",borderRadius:10,padding:"12px 10px",textDecoration:"none",textAlign:"center",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>✈️ تيليغرام</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portalUrl)}`} target="_blank" rel="noreferrer"
            style={{ background:"#1877F2",color:"#fff",borderRadius:10,padding:"12px 10px",textDecoration:"none",textAlign:"center",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>📘 فيسبوك</a>
          <button onClick={copy}
            style={{ background:copied?C.green:color,color:"#fff",border:"none",borderRadius:10,padding:"12px 10px",textAlign:"center",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
            {copied?"✅ تم النسخ!":"📋 نسخ الرابط"}
          </button>
        </div>
        <button onClick={onClose} style={{ width:"100%",background:"#EDF2F7",color:C.text,border:"none",borderRadius:10,padding:11,fontWeight:700,cursor:"pointer",fontSize:13 }}>
          متابعة إلى لوحة التحكم ←
        </button>
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

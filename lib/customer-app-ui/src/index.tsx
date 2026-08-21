import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Heart,
  Home,
  Loader2,
  LogIn,
  MapPin,
  Minus,
  Package,
  Pill,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Truck,
  UserRound,
  X,
} from "lucide-react";

export type PortalKey = "pharmacy" | "warehouse" | "delivery";

export interface CustomerAppWorkspaceProps {
  portalKey: PortalKey;
  portalName: string;
  accent: string;
  viewerName?: string;
  contextId?: string;
  onExit?: () => void;
}

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
  stock: number;
  category?: string | null;
  ownerId?: string | null;
  imageUrl?: string | null;
};

type Pharmacy = {
  id: string;
  name: string;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  active?: boolean;
};

type Customer = {
  id: number;
  name?: string | null;
  phone: string;
  city?: string | null;
  address?: string | null;
};

type Order = {
  id: number;
  customerId?: number | null;
  pharmacyId?: string | null;
  deliveryId?: string | null;
  status: string;
  total: number | string;
  address?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  items?: Array<{ productId?: number | null; qty?: number; price?: number | string }>;
};

type CartLine = { product: Product; quantity: number };
type View = "home" | "browse" | "pharmacies" | "prescriptions" | "orders" | "cart" | "profile";

const PROMOS: Record<string, number> = { SUGAR20: 0.2, DAWAA10: 0.1, WELCOME: 0.15 };
const PAYMENT_METHODS = [
  ["cod", "الدفع عند الاستلام"],
  ["zaincash", "زين كاش"],
  ["fastpay", "فاست باي"],
  ["asiahawala", "آسيا حوالة"],
  ["qicard", "كارت كي"],
  ["nasswallet", "ناس ولت"],
  ["tabadul", "تبادل"],
  ["mahali", "محلي"],
  ["fib", "FIB"],
  ["card", "بطاقة مصرفية"],
  ["whatsapp", "التواصل عبر واتساب"],
] as const;
const ORDER_STEPS = [
  ["pending", "تم استلام الطلب"],
  ["confirmed", "تم تأكيد الطلب"],
  ["processing", "قيد تجهيز الأدوية"],
  ["picked_up", "استلمت شركة التوصيل الطلب"],
  ["out_for_delivery", "الطلب في الطريق"],
  ["delivered", "تم التسليم"],
] as const;

const numberValue = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const formatIQD = (value: unknown) =>
  `${new Intl.NumberFormat("ar-IQ", { maximumFractionDigits: 0 }).format(numberValue(value))} د.ع`;
const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeStorage = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local persistence is an enhancement; the API remains the source of truth.
  }
};
const normalizeProduct = (row: Product): Product => ({
  ...row,
  id: Number(row.id),
  price: numberValue(row.price),
  stock: Math.max(0, numberValue(row.stock)),
});
const request = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || `HTTP ${response.status}`);
  return payload as T;
};

const viewLabels: Record<View, string> = {
  home: "الرئيسية",
  browse: "تصفح الأدوية",
  pharmacies: "الصيدليات",
  prescriptions: "الوصفات",
  orders: "طلباتي",
  cart: "السلة",
  profile: "حسابي",
};
const viewIcons: Record<View, React.ReactNode> = {
  home: <Home size={17} />,
  browse: <Search size={17} />,
  pharmacies: <Store size={17} />,
  prescriptions: <FileText size={17} />,
  orders: <ClipboardList size={17} />,
  cart: <ShoppingCart size={17} />,
  profile: <UserRound size={17} />,
};
const statusLabel = (status: string) =>
  ({
    pending: "بانتظار التأكيد",
    new: "طلب جديد",
    confirmed: "مؤكد",
    processing: "قيد التجهيز",
    preparing: "قيد التجهيز",
    picked_up: "مع شركة التوصيل",
    ongoing: "قيد التوصيل",
    out_for_delivery: "في الطريق",
    delivered: "تم التسليم",
    completed: "مكتمل",
    cancelled: "ملغي",
  })[status] || status;
const statusColor = (status: string) =>
  status === "cancelled" ? "#b42318" : status === "delivered" || status === "completed" ? "#087443" : "#1668c7";

export function CustomerAppWorkspace({
  portalKey,
  portalName,
  accent,
  viewerName,
  contextId,
  onExit,
}: CustomerAppWorkspaceProps) {
  const [view, setView] = useState<View>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartLine[]>(() => readStorage("dawaplus:customer-cart", []));
  const [prescriptions, setPrescriptions] = useState<string[]>(() => readStorage("dawaplus:prescriptions", []));
  const [customer, setCustomer] = useState<Customer | null>(() => readStorage<Customer | null>("dawaplus:customer", null));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [selectedPharmacy, setSelectedPharmacy] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [address, setAddress] = useState("");
  const [orderPhone, setOrderPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  const cartTotal = cart.reduce((sum, line) => sum + numberValue(line.product.price) * line.quantity, 0);
  const deliveryFee = cart.length ? 3500 : 0;
  const finalTotal = Math.max(0, cartTotal + deliveryFee - cartTotal * discount);
  const categories = useMemo(
    () => ["الكل", ...Array.from(new Set(products.map((product) => product.category).filter(Boolean) as string[]))],
    [products],
  );
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !query || `${product.name} ${product.description || ""}`.toLowerCase().includes(query);
      const matchesCategory = category === "الكل" || product.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [products, search, category]);
  const filteredPharmacies = useMemo(() => {
    const query = pharmacySearch.trim().toLowerCase();
    return pharmacies.filter((pharmacy) => `${pharmacy.name} ${pharmacy.city || ""}`.toLowerCase().includes(query));
  }, [pharmacies, pharmacySearch]);

  const loadOrders = async (activeCustomer = customer) => {
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCustomer?.id) params.set("customerId", String(activeCustomer.id));
      else if (portalKey === "pharmacy" && contextId) params.set("pharmacyId", contextId);
      else if (portalKey === "delivery" && contextId) params.set("deliveryId", contextId);
      else {
        setOrders([]);
        return;
      }
      const rows = await request<Order[]>(`/orders?${params.toString()}`);
      setOrders(Array.isArray(rows) ? rows : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر تحميل الطلبات");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([request<Product[]>("/products"), request<Pharmacy[]>("/pharmacies")])
      .then(([productResult, pharmacyResult]) => {
        if (cancelled) return;
        if (productResult.status === "fulfilled") setProducts(productResult.value.map(normalizeProduct));
        if (pharmacyResult.status === "fulfilled") {
          const active = pharmacyResult.value.filter((pharmacy) => pharmacy.active !== false);
          setPharmacies(active);
          if (!selectedPharmacy && active.length) setSelectedPharmacy(active[0].id);
        }
        const failed = [productResult, pharmacyResult].filter((result) => result.status === "rejected");
        if (failed.length) setError("تعذر تحميل بعض بيانات المنصة. حاول التحديث.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    writeStorage("dawaplus:customer-cart", cart);
  }, [cart]);
  useEffect(() => {
    writeStorage("dawaplus:prescriptions", prescriptions);
  }, [prescriptions]);
  useEffect(() => {
    if (customer) {
      writeStorage("dawaplus:customer", customer);
      setAddress(customer.address || "");
      setOrderPhone(customer.phone || "");
      void loadOrders(customer);
    } else {
      window.localStorage.removeItem("dawaplus:customer");
      void loadOrders(null);
    }
  }, [customer?.id, contextId, portalKey]);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      setNotice("هذا المنتج غير متوفر حالياً");
      return;
    }
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: Math.min(line.quantity + 1, product.stock) }
            : line,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
    setNotice(`تمت إضافة ${product.name} إلى السلة`);
  };
  const changeQuantity = (productId: number, delta: number) => {
    setCart((current) =>
      current
        .map((line) =>
          line.product.id === productId
            ? { ...line, quantity: Math.max(0, Math.min(line.quantity + delta, line.product.stock)) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  };
  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    const value = PROMOS[code];
    if (!value) {
      setDiscount(0);
      setNotice("كود الخصم غير صالح");
      return;
    }
    setDiscount(value);
    setNotice(`تم تطبيق خصم ${Math.round(value * 100)}%`);
  };
  const savePrescription = () => {
    const text = prescriptionText.trim();
    if (!text) return setNotice("اكتب محتوى الوصفة أولاً");
    setPrescriptions((current) => [text, ...current].slice(0, 10));
    setPrescriptionText("");
    setNotice("تم حفظ الوصفة على هذا الحساب");
  };
  const checkout = async () => {
    if (!selectedPharmacy) return setNotice("اختر الصيدلية التي ستجهز الطلب");
    if (!orderPhone.trim()) return setNotice("أدخل رقم الهاتف للتواصل معك");
    if (!address.trim()) return setNotice("أدخل عنوان التوصيل");
    if (!cart.length) return setNotice("السلة فارغة");
    setCheckoutBusy(true);
    try {
      const created = await request<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({
          customerId: customer?.id ?? null,
          pharmacyId: selectedPharmacy,
          total: finalTotal.toFixed(2),
          address: address.trim(),
          notes: JSON.stringify({
            source: "customer-app-workspace",
            customerName: customer?.name || viewerName || "زبون",
            customerPhone: orderPhone.trim(),
            paymentMethod,
            promoCode: promo.trim().toUpperCase() || null,
            discount: Math.round(cartTotal * discount),
            deliveryFee,
            note: orderNotes.trim() || null,
          }),
          items: cart.map((line) => ({
            productId: line.product.id,
            qty: line.quantity,
            price: numberValue(line.product.price).toFixed(2),
          })),
        }),
      });
      setCart([]);
      setPromo("");
      setDiscount(0);
      setOrderNotes("");
      await loadOrders(customer);
      setView("orders");
      setNotice(`تم إنشاء الطلب رقم #${created.id} ومزامنته مع البوابة`);
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "تعذر إنشاء الطلب");
    } finally {
      setCheckoutBusy(false);
    }
  };

  const switchView = (next: View) => {
    setView(next);
    if (next === "orders") void loadOrders();
  };
  const roleText = portalKey === "pharmacy" ? "سياق الصيدلية" : portalKey === "warehouse" ? "سياق المذخر" : "سياق التوصيل";

  return (
    <div dir="rtl" style={styles.shell}>
      <aside style={{ ...styles.sidebar, borderLeftColor: accent }}>
        <div style={styles.brand}>
          <div style={{ ...styles.brandMark, background: accent }}><Pill size={22} color="#fff" /></div>
          <div>
            <strong style={styles.brandName}>دواء+</strong>
            <span style={styles.brandSub}>تطبيق العملاء</span>
          </div>
        </div>
        <div style={{ ...styles.contextCard, background: `${accent}12`, borderColor: `${accent}35` }}>
          <span style={{ ...styles.contextDot, background: accent }} />
          <div><strong>{portalName}</strong><small>{roleText} · نفس بيانات المنصة</small></div>
        </div>
        <nav style={styles.nav}>
          {(Object.keys(viewLabels) as View[]).map((item) => (
            <button key={item} onClick={() => switchView(item)} style={{ ...styles.navItem, ...(view === item ? { color: accent, background: `${accent}12`, fontWeight: 800 } : {}) }}>
              {viewIcons[item]}<span>{viewLabels[item]}</span>
              {item === "cart" && cart.length > 0 && <b style={{ ...styles.countPill, background: accent }}>{cart.reduce((sum, line) => sum + line.quantity, 0)}</b>}
            </button>
          ))}
        </nav>
        <div style={styles.sidebarBottom}>
          <div style={styles.syncState}><span style={{ ...styles.syncDot, background: "#12b76a" }} />متصل بقاعدة بيانات دواء+</div>
          <button onClick={onExit} style={styles.exitButton}><ArrowLeft size={16} /> العودة لأدوات البوابة</button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <div style={styles.breadcrumb}><span>دواء+</span><ChevronDown size={14} />{viewLabels[view]}</div>
            <h1 style={styles.pageTitle}>{viewLabels[view]}</h1>
          </div>
          <div style={styles.headerActions}>
            <button onClick={() => setNotice("لا توجد إشعارات جديدة")} style={styles.iconButton} aria-label="الإشعارات"><Bell size={18} /></button>
            <button onClick={() => switchView("cart")} style={{ ...styles.cartButton, borderColor: `${accent}55`, color: accent }}>
              <ShoppingCart size={18} /><span>السلة</span>{cart.length > 0 && <b>{cart.reduce((sum, line) => sum + line.quantity, 0)}</b>}
            </button>
            <button onClick={() => switchView("profile")} style={styles.accountButton}>
              <span style={{ ...styles.avatar, background: accent }}>{customer?.name?.slice(0, 1) || "ض"}</span>
              <span>{customer?.name || viewerName || "زبون"}</span>
            </button>
          </div>
        </header>

        {error && <div style={styles.errorBanner}><span>{error}</span><button onClick={() => setError("")}><X size={16} /></button></div>}
        {notice && <div style={{ ...styles.noticeBanner, borderColor: `${accent}45`, color: accent }}><Check size={16} /><span>{notice}</span></div>}
        {loading ? <LoadingState /> : (
          <>
            {view === "home" && <HomeView accent={accent} products={products} customer={customer} onBrowse={() => switchView("browse")} onAdd={addToCart} />}
            {view === "browse" && <BrowseView accent={accent} products={filteredProducts} categories={categories} category={category} search={search} onSearch={setSearch} onCategory={setCategory} onAdd={addToCart} />}
            {view === "pharmacies" && <PharmaciesView pharmacies={filteredPharmacies} search={pharmacySearch} onSearch={setPharmacySearch} onChoose={(id) => { setSelectedPharmacy(id); switchView("browse"); }} />}
            {view === "prescriptions" && <PrescriptionsView prescriptions={prescriptions} text={prescriptionText} onText={setPrescriptionText} onSave={savePrescription} />}
            {view === "orders" && <OrdersView orders={orders} loading={ordersLoading} customer={customer} accent={accent} onLogin={() => setLoginOpen(true)} onRefresh={() => loadOrders()} portalKey={portalKey} />}
            {view === "cart" && <CartView cart={cart} total={cartTotal} deliveryFee={deliveryFee} discount={discount} finalTotal={finalTotal} promo={promo} paymentMethod={paymentMethod} pharmacies={pharmacies} selectedPharmacy={selectedPharmacy} address={address} phone={orderPhone} notes={orderNotes} busy={checkoutBusy} accent={accent} onPromo={setPromo} onApplyPromo={applyPromo} onPayment={setPaymentMethod} onPharmacy={setSelectedPharmacy} onAddress={setAddress} onPhone={setOrderPhone} onNotes={setOrderNotes} onQuantity={changeQuantity} onCheckout={checkout} onBrowse={() => switchView("browse")} />}
            {view === "profile" && <ProfileView customer={customer} accent={accent} onLogin={() => setLoginOpen(true)} onLogout={() => setCustomer(null)} onSave={async (data) => { if (!customer) return; try { const updated = await request<Customer>(`/customers/${customer.id}`, { method: "PUT", body: JSON.stringify(data) }); setCustomer(updated); setNotice("تم تحديث بيانات الحساب"); } catch (cause) { setNotice(cause instanceof Error ? cause.message : "تعذر تحديث الحساب"); } }} />}
          </>
        )}
      </main>
      {loginOpen && <AuthModal accent={accent} onClose={() => setLoginOpen(false)} onSuccess={(user) => { setCustomer(user); setLoginOpen(false); setNotice(`مرحباً ${user.name || "بك"}، تم تسجيل الدخول`); }} />}
    </div>
  );
}

function LoadingState() {
  return <div style={styles.centerState}><Loader2 size={28} className="dawaplus-spin" /><strong>جاري مزامنة بيانات دواء+…</strong><span>نقرأ المنتجات والصيدليات من قاعدة البيانات المشتركة</span></div>;
}

function HomeView({ accent, products, customer, onBrowse, onAdd }: { accent: string; products: Product[]; customer: Customer | null; onBrowse: () => void; onAdd: (product: Product) => void }) {
  return (
    <section>
      <div style={{ ...styles.hero, background: `linear-gradient(135deg, ${accent}, #0b3447)` }}>
        <div style={styles.heroContent}><span style={styles.eyebrow}><Sparkles size={15} />تجربة التطبيق نفسها على الحاسوب</span><h2>{customer?.name ? `أهلاً ${customer.name}` : "كل احتياجاتك الصحية في مكان واحد"}</h2><p>تصفح الأدوية، اختر الصيدلية، أرسل الوصفة، وراقب التوصيل من نفس منصة دواء+.</p><button onClick={onBrowse} style={styles.heroButton}>ابدأ التصفح <ArrowLeft size={16} /></button></div>
        <div style={styles.heroArt}><Pill size={90} strokeWidth={1.2} /><ShoppingBag size={38} /><Truck size={38} /></div>
      </div>
      <div style={styles.sectionHeader}><div><span style={styles.sectionKicker}>من قاعدة البيانات المشتركة</span><h2 style={styles.sectionTitle}>منتجات متاحة الآن</h2></div><button onClick={onBrowse} style={{ ...styles.linkButton, color: accent }}>عرض الكل <ArrowLeft size={15} /></button></div>
      {products.length === 0 ? <EmptyState title="لا توجد منتجات منشورة حالياً" body="ستظهر المنتجات هنا فور تفعيلها من الصيدلية أو المذخر." icon={<Package size={30} />} /> : <div style={styles.productGrid}>{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} accent={accent} onAdd={onAdd} />)}</div>}
      <div style={styles.quickGrid}><QuickAction icon={<FileText />} title="الوصفات الطبية" body="احفظ وصفة أو تعليمات الطبيب" onClick={() => window.dispatchEvent(new CustomEvent("dawaplus-open-prescriptions"))} /><QuickAction icon={<Store />} title="صيدليات قريبة" body="اعثر على الصيدلية المناسبة" onClick={onBrowse} /><QuickAction icon={<ClipboardList />} title="تتبع الطلب" body="حالات مباشرة من المنصة" onClick={onBrowse} /></div>
    </section>
  );
}

function QuickAction({ icon, title, body, onClick }: { icon: React.ReactNode; title: string; body: string; onClick: () => void }) {
  return <button onClick={onClick} style={styles.quickAction}><span style={styles.quickIcon}>{icon}</span><span><strong>{title}</strong><small>{body}</small></span><ArrowLeft size={16} /></button>;
}

function BrowseView({ accent, products, categories, category, search, onSearch, onCategory, onAdd }: { accent: string; products: Product[]; categories: string[]; category: string; search: string; onSearch: (value: string) => void; onCategory: (value: string) => void; onAdd: (product: Product) => void }) {
  return <section><div style={styles.toolbar}><div><span style={styles.sectionKicker}>كتالوج موحّد</span><h2 style={styles.sectionTitle}>تصفح الأدوية والمنتجات</h2></div><div style={styles.searchBox}><Search size={18} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="ابحث باسم الدواء أو المادة الفعالة" /></div></div><div style={styles.filterRow}><SlidersHorizontal size={16} /><span>التصنيف:</span>{categories.map((item) => <button key={item} onClick={() => onCategory(item)} style={{ ...styles.filterButton, ...(category === item ? { background: accent, color: "#fff", borderColor: accent } : {}) }}>{item}</button>)}</div>{products.length === 0 ? <EmptyState title="لم نجد منتجات مطابقة" body="جرّب تغيير البحث أو اختيار تصنيف آخر." icon={<Search size={30} />} /> : <div style={styles.productGrid}>{products.map((product) => <ProductCard key={product.id} product={product} accent={accent} onAdd={onAdd} />)}</div>}</section>;
}

function ProductCard({ product, accent, onAdd }: { product: Product; accent: string; onAdd: (product: Product) => void }) {
  return <article style={styles.productCard}><div style={{ ...styles.productImage, background: `${accent}10`, color: accent }}>{product.imageUrl ? <img src={product.imageUrl} alt="" style={styles.productImg} /> : <Pill size={36} strokeWidth={1.5} />}{product.stock <= 0 && <span style={styles.soldOut}>غير متوفر</span>}</div><div style={styles.productBody}><div style={styles.productMeta}><span>{product.category || "أدوية"}</span><span>{product.stock > 0 ? `متوفر ${product.stock}` : "نفد المخزون"}</span></div><h3 style={styles.productName}>{product.name}</h3><p style={styles.productDescription}>{product.description || "منتج دوائي موثّق من مورّد داخل منصة دواء+."}</p><div style={styles.productFooter}><strong>{formatIQD(product.price)}</strong><button disabled={product.stock <= 0} onClick={() => onAdd(product)} style={{ ...styles.addButton, background: product.stock > 0 ? accent : "#d0d5dd" }}><Plus size={17} />إضافة</button></div></div></article>;
}

function PharmaciesView({ pharmacies, search, onSearch, onChoose }: { pharmacies: Pharmacy[]; search: string; onSearch: (value: string) => void; onChoose: (id: string) => void }) {
  return <section><div style={styles.toolbar}><div><span style={styles.sectionKicker}>شبكة دواء+</span><h2 style={styles.sectionTitle}>الصيدليات</h2></div><div style={styles.searchBox}><Search size={18} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="ابحث باسم الصيدلية أو المدينة" /></div></div>{pharmacies.length === 0 ? <EmptyState title="لا توجد صيدليات مطابقة" body="تأكد من كلمة البحث أو جرّب مدينة أخرى." icon={<Store size={30} />} /> : <div style={styles.pharmacyGrid}>{pharmacies.map((pharmacy) => <article key={pharmacy.id} style={styles.pharmacyCard}><div style={styles.pharmacyMark}><Building2 size={25} /></div><div style={{ flex: 1 }}><div style={styles.pharmacyTitle}><h3>{pharmacy.name}</h3><BadgeCheck size={17} color="#087443" /></div><p><MapPin size={14} />{pharmacy.city || "العراق"}{pharmacy.address ? ` · ${pharmacy.address}` : ""}</p><small>{pharmacy.phone || "رقم التواصل متاح عند الطلب"}</small></div><button onClick={() => onChoose(pharmacy.id)} style={styles.outlineButton}>تصفح الأدوية</button></article>)}</div>}</section>;
}

function PrescriptionsView({ prescriptions, text, onText, onSave }: { prescriptions: string[]; text: string; onText: (value: string) => void; onSave: () => void }) {
  return <section><div style={styles.toolbar}><div><span style={styles.sectionKicker}>رعاية أكثر أماناً</span><h2 style={styles.sectionTitle}>الوصفات الطبية</h2></div><div style={styles.infoChip}><BookOpen size={16} />المحتوى محفوظ بحسابك على هذا الجهاز</div></div><div style={styles.prescriptionLayout}><div style={styles.formCard}><div style={styles.cardHeading}><span style={styles.headingIcon}><FileText size={20} /></span><div><h3>إضافة وصفة أو تعليمات</h3><p>اكتب محتوى الوصفة ليظهر للصيدلي عند تجهيز الطلب.</p></div></div><textarea value={text} onChange={(event) => onText(event.target.value)} placeholder="مثال: Amoxicillin 500mg — ثلاث مرات يومياً لمدة 5 أيام" style={styles.textarea} /><button onClick={onSave} style={styles.primaryButton}>حفظ الوصفة <Check size={16} /></button></div><div style={styles.formCard}><div style={styles.cardHeading}><span style={styles.headingIcon}><ClipboardList size={20} /></span><div><h3>الوصفات المحفوظة</h3><p>{prescriptions.length} وصفة على هذا الحساب</p></div></div>{prescriptions.length === 0 ? <EmptyState title="لا توجد وصفات محفوظة" body="ابدأ بإضافة وصفة من الخانة المجاورة." icon={<FileText size={25} />} /> : <div style={styles.savedList}>{prescriptions.map((item, index) => <div key={`${item}-${index}`} style={styles.savedPrescription}><span>{item}</span><button onClick={() => navigator.clipboard?.writeText(item)} aria-label="نسخ الوصفة"><ClipboardList size={16} /></button></div>)}</div>}</div></div></section>;
}

function OrdersView({ orders, loading, customer, accent, onLogin, onRefresh, portalKey }: { orders: Order[]; loading: boolean; customer: Customer | null; accent: string; onLogin: () => void; onRefresh: () => void; portalKey: PortalKey }) {
  if (!customer && portalKey === "warehouse") return <section><EmptyState title="سجّل دخولك لمتابعة طلباتك" body="بيانات الطلبات الشخصية لا تُعرض إلا بعد ربطها بحساب العميل." icon={<LogIn size={30} />} action={<button onClick={onLogin} style={styles.primaryButton}>تسجيل دخول العميل</button>} /></section>;
  return <section><div style={styles.toolbar}><div><span style={styles.sectionKicker}>مزامنة فورية</span><h2 style={styles.sectionTitle}>{portalKey === "delivery" ? "طلبات قيد التوصيل" : "طلباتي"}</h2></div><button onClick={onRefresh} style={styles.outlineButton}><Loader2 size={15} className={loading ? "dawaplus-spin" : ""} />تحديث</button></div>{!customer && <div style={styles.infoBanner}><LogIn size={17} /><span>أنت تتصفح كزائر. سجّل الدخول لتظهر طلباتك على كل بوابات دواء+.</span><button onClick={onLogin} style={{ color: accent }}>تسجيل الدخول</button></div>}{loading ? <LoadingState /> : orders.length === 0 ? <EmptyState title="لا توجد طلبات بعد" body="بعد إتمام طلب من السلة سيظهر هنا ويتابعه فريق الصيدلية والتوصيل." icon={<ClipboardList size={30} />} /> : <div style={styles.orderList}>{orders.map((order) => <OrderCard key={order.id} order={order} accent={accent} />)}</div>}</section>;
}

function OrderCard({ order, accent }: { order: Order; accent: string }) {
  const cancelled = order.status === "cancelled";
  const activeIndex = ORDER_STEPS.findIndex(([key]) => key === order.status);
  return <article style={styles.orderCard}><div style={styles.orderTop}><div><span style={styles.orderNumber}>طلب #{order.id}</span><h3>{formatIQD(order.total)}</h3></div><span style={{ ...styles.statusPill, color: statusColor(order.status), background: `${statusColor(order.status)}14` }}>{statusLabel(order.status)}</span></div><div style={styles.orderDetails}><span><MapPin size={15} />{order.address || "العنوان محفوظ عند العميل"}</span><span><Package size={15} />{order.items?.length || 0} منتجات</span><span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-IQ") : "طلب حديث"}</span></div>{!cancelled && <div style={styles.timeline}>{ORDER_STEPS.map(([key, label], index) => <div key={key} style={styles.timelineStep}><span style={{ ...styles.timelineDot, background: index <= activeIndex ? accent : "#e4e7ec", boxShadow: index === activeIndex ? `0 0 0 4px ${accent}20` : "none" }} />{index < ORDER_STEPS.length - 1 && <i style={{ background: index < activeIndex ? accent : "#e4e7ec" }} />}{index === activeIndex && <b>{label}</b>}</div>)}</div>}</article>;
}

function CartView({ cart, total, deliveryFee, discount, finalTotal, promo, paymentMethod, pharmacies, selectedPharmacy, address, phone, notes, busy, accent, onPromo, onApplyPromo, onPayment, onPharmacy, onAddress, onPhone, onNotes, onQuantity, onCheckout, onBrowse }: { cart: CartLine[]; total: number; deliveryFee: number; discount: number; finalTotal: number; promo: string; paymentMethod: string; pharmacies: Pharmacy[]; selectedPharmacy: string; address: string; phone: string; notes: string; busy: boolean; accent: string; onPromo: (value: string) => void; onApplyPromo: () => void; onPayment: (value: string) => void; onPharmacy: (value: string) => void; onAddress: (value: string) => void; onPhone: (value: string) => void; onNotes: (value: string) => void; onQuantity: (id: number, delta: number) => void; onCheckout: () => void; onBrowse: () => void }) {
  return <section><div style={styles.toolbar}><div><span style={styles.sectionKicker}>نفس سلة التطبيق</span><h2 style={styles.sectionTitle}>السلة والدفع</h2></div><span style={styles.infoChip}><ShoppingBag size={16} />الدفع بالدينار العراقي</span></div>{cart.length === 0 ? <EmptyState title="السلة فارغة" body="أضف أدوية من كتالوج المنصة لتبدأ الطلب." icon={<ShoppingCart size={30} />} action={<button onClick={onBrowse} style={styles.primaryButton}>تصفح الأدوية</button>} /> : <div style={styles.cartLayout}><div style={styles.cartLines}>{cart.map((line) => <div key={line.product.id} style={styles.cartLine}><div style={{ ...styles.miniProduct, color: accent, background: `${accent}12` }}><Pill size={22} /></div><div style={{ flex: 1 }}><strong>{line.product.name}</strong><small>{formatIQD(line.product.price)} للقطعة</small></div><div style={styles.quantity}><button onClick={() => onQuantity(line.product.id, -1)}><Minus size={14} /></button><b>{line.quantity}</b><button onClick={() => onQuantity(line.product.id, 1)}><Plus size={14} /></button></div><strong>{formatIQD(numberValue(line.product.price) * line.quantity)}</strong></div>)}<div style={styles.promoBox}><input value={promo} onChange={(event) => onPromo(event.target.value)} placeholder="كود الخصم" /><button onClick={onApplyPromo}>تطبيق</button>{discount > 0 && <span>خصم {Math.round(discount * 100)}%</span>}</div></div><div style={styles.checkoutCard}><h3>إتمام الطلب</h3><label>الصيدلية المجهزة<select value={selectedPharmacy} onChange={(event) => onPharmacy(event.target.value)}><option value="">اختر الصيدلية</option>{pharmacies.map((pharmacy) => <option key={pharmacy.id} value={pharmacy.id}>{pharmacy.name} — {pharmacy.city || "العراق"}</option>)}</select></label><label>رقم الهاتف<input value={phone} onChange={(event) => onPhone(event.target.value)} placeholder="07xxxxxxxxx" /></label><label>عنوان التوصيل<textarea value={address} onChange={(event) => onAddress(event.target.value)} placeholder="المدينة، المنطقة، الشارع" /></label><label>طريقة الدفع<select value={paymentMethod} onChange={(event) => onPayment(event.target.value)}>{PAYMENT_METHODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>ملاحظات الطلب<textarea value={notes} onChange={(event) => onNotes(event.target.value)} placeholder="أي ملاحظات للصيدلي أو السائق (اختياري)" /></label><div style={styles.summary}><span>المجموع الفرعي <b>{formatIQD(total)}</b></span><span>التوصيل <b>{formatIQD(deliveryFee)}</b></span>{discount > 0 && <span>الخصم <b style={{ color: "#087443" }}>-{formatIQD(total * discount)}</b></span>}<strong>الإجمالي <b>{formatIQD(finalTotal)}</b></strong></div><button disabled={busy} onClick={onCheckout} style={styles.primaryButton}>{busy ? <Loader2 size={17} className="dawaplus-spin" /> : <Check size={17} />} {busy ? "جارٍ إنشاء الطلب…" : "تأكيد الطلب"}</button></div></div>}</section>;
}

function ProfileView({ customer, accent, onLogin, onLogout, onSave }: { customer: Customer | null; accent: string; onLogin: () => void; onLogout: () => void; onSave: (data: Partial<Customer>) => void }) {
  const [name, setName] = useState(customer?.name || "");
  const [city, setCity] = useState(customer?.city || "");
  const [address, setAddress] = useState(customer?.address || "");
  useEffect(() => { setName(customer?.name || ""); setCity(customer?.city || ""); setAddress(customer?.address || ""); }, [customer?.id]);
  if (!customer) return <section><div style={styles.profileLogin}><div style={{ ...styles.profileIcon, background: `${accent}12`, color: accent }}><UserRound size={34} /></div><h2>حساب دواء+</h2><p>سجّل الدخول لتوحيد طلباتك، عناوينك، ووصفاتك بين التطبيق والبوابات.</p><button onClick={onLogin} style={styles.primaryButton}><LogIn size={17} />تسجيل الدخول أو إنشاء حساب</button></div></section>;
  return <section><div style={styles.toolbar}><div><span style={styles.sectionKicker}>بيانات موحّدة</span><h2 style={styles.sectionTitle}>حسابي وإعداداتي</h2></div><button onClick={onLogout} style={styles.outlineButton}>تسجيل الخروج</button></div><div style={styles.profileLayout}><div style={styles.profileCard}><span style={{ ...styles.largeAvatar, background: accent }}>{customer.name?.slice(0, 1) || "ض"}</span><h3>{customer.name || "عميل دواء+"}</h3><p>{customer.phone}</p><span style={styles.verified}><BadgeCheck size={15} />حساب موثّق عبر المنصة</span></div><div style={styles.formCard}><div style={styles.cardHeading}><span style={styles.headingIcon}><Settings size={20} /></span><div><h3>معلومات الحساب</h3><p>تُحفظ على حساب العميل وتظهر في كل واجهات دواء+.</p></div></div><label>الاسم<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>المدينة<input value={city} onChange={(event) => setCity(event.target.value)} /></label><label>العنوان الافتراضي<textarea value={address} onChange={(event) => setAddress(event.target.value)} /></label><button onClick={() => onSave({ name, city, address })} style={styles.primaryButton}>حفظ التغييرات <Check size={16} /></button></div></div></section>;
}

function AuthModal({ accent, onClose, onSuccess }: { accent: string; onClose: () => void; onSuccess: (customer: Customer) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await request<{ user: Customer }>(mode === "login" ? "/auth/login" : "/auth/register/customer", { method: "POST", body: JSON.stringify(mode === "login" ? { phone, password, type: "customer" } : { name, phone, password, city, address }) });
      if (!result.user) throw new Error("لم تُرجع المنصة بيانات الحساب");
      onSuccess(result.user);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر إتمام العملية");
    } finally {
      setBusy(false);
    }
  };
  return <div style={styles.modalBackdrop} onClick={onClose}><div style={styles.authCard} onClick={(event) => event.stopPropagation()}><button onClick={onClose} style={styles.closeButton}><X size={18} /></button><div style={{ ...styles.profileIcon, background: `${accent}12`, color: accent }}><Pill size={28} /></div><h2>{mode === "login" ? "تسجيل الدخول إلى دواء+" : "إنشاء حساب عميل"}</h2><p>نفس الحساب يعمل في التطبيق والبوابات.</p>{mode === "register" && <label>الاسم<input value={name} onChange={(event) => setName(event.target.value)} placeholder="الاسم الكامل" /></label>}<label>رقم الهاتف<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="07xxxxxxxxx" /></label><label>كلمة المرور<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••" /></label>{mode === "register" && <><label>المدينة<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="أربيل" /></label><label>العنوان<input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="العنوان الافتراضي" /></label></>}{error && <div style={styles.formError}>{error}</div>}<button disabled={busy} onClick={submit} style={styles.primaryButton}>{busy ? <Loader2 size={17} className="dawaplus-spin" /> : <LogIn size={17} />}{mode === "login" ? "دخول" : "إنشاء الحساب"}</button><button onClick={() => setMode(mode === "login" ? "register" : "login")} style={styles.textButton}>{mode === "login" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ سجّل الدخول"}</button></div></div>;
}

function EmptyState({ title, body, icon, action }: { title: string; body: string; icon: React.ReactNode; action?: React.ReactNode }) {
  return <div style={styles.emptyState}><span style={styles.emptyIcon}>{icon}</span><h3>{title}</h3><p>{body}</p>{action}</div>;
}

const styles: Record<string, React.CSSProperties> = {
  shell: { display: "flex", minHeight: "100%", height: "100%", background: "#f8fafc", color: "#172b4d", fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" },
  sidebar: { width: 248, flex: "0 0 248px", background: "#fff", borderLeft: "4px solid", display: "flex", flexDirection: "column", padding: "22px 14px", boxSizing: "border-box" },
  brand: { display: "flex", alignItems: "center", gap: 11, padding: "0 8px 20px" },
  brandMark: { width: 42, height: 42, borderRadius: 13, display: "grid", placeItems: "center" },
  brandName: { display: "block", fontSize: 20, letterSpacing: "-.5px" },
  brandSub: { display: "block", color: "#667085", fontSize: 11, marginTop: 2 },
  contextCard: { display: "flex", alignItems: "flex-start", gap: 9, border: "1px solid", borderRadius: 12, padding: 11, margin: "0 2px 19px", fontSize: 12 },
  contextDot: { display: "block", width: 8, height: 8, borderRadius: 99, marginTop: 4, flex: "0 0 auto" },
  nav: { display: "grid", gap: 4 },
  navItem: { display: "flex", alignItems: "center", gap: 11, border: 0, borderRadius: 10, background: "transparent", color: "#667085", padding: "11px 12px", cursor: "pointer", textAlign: "right", fontSize: 13 },
  countPill: { marginRight: "auto", color: "#fff", borderRadius: 99, minWidth: 22, height: 22, display: "grid", placeItems: "center", fontSize: 11 },
  sidebarBottom: { marginTop: "auto", display: "grid", gap: 12, padding: "15px 4px 0" },
  syncState: { display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#667085" },
  syncDot: { width: 7, height: 7, borderRadius: 99 },
  exitButton: { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "1px solid #e4e7ec", borderRadius: 9, background: "#fff", color: "#475467", padding: 9, cursor: "pointer", fontSize: 11 },
  main: { flex: 1, minWidth: 0, overflowY: "auto", padding: "0 32px 40px" },
  header: { minHeight: 88, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, borderBottom: "1px solid #eef1f5" },
  breadcrumb: { display: "flex", alignItems: "center", gap: 6, color: "#98a2b3", fontSize: 11 },
  pageTitle: { margin: "5px 0 0", fontSize: 24, letterSpacing: "-.5px" },
  headerActions: { display: "flex", alignItems: "center", gap: 8 },
  iconButton: { width: 37, height: 37, display: "grid", placeItems: "center", border: "1px solid #e4e7ec", borderRadius: 10, background: "#fff", color: "#667085", cursor: "pointer" },
  cartButton: { display: "flex", alignItems: "center", gap: 7, border: "1px solid", borderRadius: 10, background: "#fff", padding: "9px 12px", cursor: "pointer", fontSize: 12 },
  accountButton: { display: "flex", alignItems: "center", gap: 8, border: 0, background: "transparent", color: "#344054", fontWeight: 700, cursor: "pointer", fontSize: 12 },
  avatar: { width: 31, height: 31, borderRadius: 99, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800 },
  errorBanner: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 18, padding: "10px 13px", border: "1px solid #fecdca", borderRadius: 10, background: "#fff6f5", color: "#b42318", fontSize: 12 },
  noticeBanner: { display: "flex", alignItems: "center", gap: 8, marginTop: 18, padding: "10px 13px", border: "1px solid", borderRadius: 10, background: "#fff", fontSize: 12 },
  hero: { minHeight: 235, borderRadius: 20, marginTop: 28, padding: "28px 34px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff", overflow: "hidden" },
  heroContent: { maxWidth: 600 },
  eyebrow: { display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, opacity: .85 },
  heroButton: { display: "inline-flex", alignItems: "center", gap: 7, border: 0, borderRadius: 10, background: "#fff", color: "#172b4d", padding: "11px 15px", cursor: "pointer", fontWeight: 800, marginTop: 12 },
  heroArt: { width: 190, height: 190, borderRadius: 99, border: "1px solid rgba(255,255,255,.2)", display: "grid", placeItems: "center", alignContent: "center", gap: 10, transform: "rotate(-9deg)", opacity: .75 },
  sectionHeader: { display: "flex", alignItems: "end", justifyContent: "space-between", margin: "31px 0 15px" },
  sectionKicker: { display: "block", color: "#98a2b3", fontSize: 11, marginBottom: 5 },
  sectionTitle: { margin: 0, fontSize: 19 },
  linkButton: { display: "inline-flex", alignItems: "center", gap: 5, border: 0, background: "transparent", cursor: "pointer", fontWeight: 800, fontSize: 12 },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 },
  productCard: { background: "#fff", border: "1px solid #eaecf0", borderRadius: 15, overflow: "hidden", boxShadow: "0 2px 6px rgba(16,24,40,.03)" },
  productImage: { height: 122, display: "grid", placeItems: "center", position: "relative" },
  productImg: { width: "100%", height: "100%", objectFit: "cover" },
  soldOut: { position: "absolute", top: 10, right: 10, background: "#fff", color: "#b42318", borderRadius: 6, padding: "4px 7px", fontSize: 10, fontWeight: 800 },
  productBody: { padding: 13 },
  productMeta: { display: "flex", justifyContent: "space-between", color: "#98a2b3", fontSize: 10 },
  productName: { margin: "9px 0 5px", fontSize: 14 },
  productDescription: { margin: 0, color: "#667085", fontSize: 11, lineHeight: 1.7, minHeight: 38 },
  productFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 13 },
  addButton: { display: "inline-flex", alignItems: "center", gap: 4, border: 0, borderRadius: 8, padding: "7px 10px", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 800 },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 26 },
  quickAction: { display: "flex", alignItems: "center", gap: 10, textAlign: "right", border: "1px solid #eaecf0", borderRadius: 13, background: "#fff", padding: 13, cursor: "pointer", color: "#344054" },
  quickIcon: { width: 35, height: 35, display: "grid", placeItems: "center", color: "#1668c7", background: "#eff8ff", borderRadius: 10 },
  toolbar: { display: "flex", alignItems: "end", justifyContent: "space-between", gap: 20, marginTop: 28, marginBottom: 18 },
  searchBox: { minWidth: 280, display: "flex", alignItems: "center", gap: 8, border: "1px solid #d0d5dd", borderRadius: 10, background: "#fff", color: "#98a2b3", padding: "10px 12px" },
  searchBox: { minWidth: 280, display: "flex", alignItems: "center", gap: 8, border: "1px solid #d0d5dd", borderRadius: 10, background: "#fff", color: "#98a2b3", padding: "10px 12px" },
  filterRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7, marginBottom: 19, color: "#667085", fontSize: 12 },
  filterButton: { border: "1px solid #e4e7ec", borderRadius: 99, background: "#fff", color: "#667085", padding: "7px 12px", cursor: "pointer", fontSize: 11 },
  pharmacyGrid: { display: "grid", gap: 11 },
  pharmacyCard: { display: "flex", alignItems: "center", gap: 13, background: "#fff", border: "1px solid #eaecf0", borderRadius: 14, padding: 15 },
  pharmacyMark: { width: 47, height: 47, display: "grid", placeItems: "center", color: "#1668c7", background: "#eff8ff", borderRadius: 12 },
  pharmacyTitle: { display: "flex", alignItems: "center", gap: 6 },
  pharmacyTitle h3: { margin: 0, fontSize: 14 },
  pharmacyCard p: { display: "flex", alignItems: "center", gap: 4, color: "#667085", margin: "5px 0", fontSize: 11 },
  pharmacyCard small: { color: "#98a2b3", fontSize: 10 },
  outlineButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, border: "1px solid #d0d5dd", borderRadius: 8, background: "#fff", color: "#475467", padding: "8px 11px", cursor: "pointer", fontSize: 11, fontWeight: 700 },
  primaryButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", border: 0, borderRadius: 9, background: "#146c94", color: "#fff", padding: "11px 13px", cursor: "pointer", fontWeight: 800, fontSize: 12 },
  infoChip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 8, background: "#f2f4f7", color: "#667085", fontSize: 11 },
  prescriptionLayout: { display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 15 },
  formCard: { background: "#fff", border: "1px solid #eaecf0", borderRadius: 15, padding: 18 },
  cardHeading: { display: "flex", gap: 10, marginBottom: 15 },
  cardHeading h3: { margin: 0, fontSize: 14 },
  cardHeading p: { margin: "4px 0 0", color: "#667085", fontSize: 11 },
  headingIcon: { width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 10, background: "#eff8ff", color: "#1668c7" },
  textarea: { width: "100%", minHeight: 120, resize: "vertical", boxSizing: "border-box", border: "1px solid #d0d5dd", borderRadius: 9, padding: 10, font: "inherit", fontSize: 12, outline: "none" },
  savedList: { display: "grid", gap: 8 },
  savedPrescription: { display: "flex", alignItems: "start", gap: 8, background: "#f8fafc", borderRadius: 9, padding: 10, color: "#475467", fontSize: 12, lineHeight: 1.7 },
  savedPrescription button: { marginRight: "auto", border: 0, background: "transparent", color: "#667085", cursor: "pointer" },
  orderList: { display: "grid", gap: 12 },
  orderCard: { background: "#fff", border: "1px solid #eaecf0", borderRadius: 15, padding: 17 },
  orderTop: { display: "flex", alignItems: "start", justifyContent: "space-between", gap: 10 },
  orderNumber: { color: "#667085", fontSize: 11 },
  orderTop h3: { margin: "6px 0 0", fontSize: 18 },
  statusPill: { borderRadius: 99, padding: "6px 10px", fontSize: 11, fontWeight: 800 },
  orderDetails: { display: "flex", flexWrap: "wrap", gap: 16, color: "#667085", fontSize: 11, padding: "13px 0", borderBottom: "1px solid #f2f4f7" },
  orderDetails span: { display: "flex", alignItems: "center", gap: 5 },
  timeline: { display: "flex", alignItems: "center", paddingTop: 18 },
  timelineStep: { flex: 1, position: "relative", height: 18 },
  timelineDot: { position: "absolute", right: 0, top: 0, width: 10, height: 10, borderRadius: 99, zIndex: 2 },
  timelineStep i: { position: "absolute", right: 8, top: 4, width: "100%", height: 2 },
  timelineStep b: { position: "absolute", right: 0, top: 16, whiteSpace: "nowrap", color: "#475467", fontSize: 10 },
  infoBanner: { display: "flex", alignItems: "center", gap: 8, background: "#fffaeb", border: "1px solid #fedf89", borderRadius: 10, color: "#7a2e0e", padding: 11, fontSize: 12, marginBottom: 13 },
  infoBanner button: { marginRight: "auto", border: 0, background: "transparent", cursor: "pointer", fontWeight: 800 },
  cartLayout: { display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(300px,.85fr)", gap: 16 },
  cartLines: { display: "grid", gap: 9, alignContent: "start" },
  cartLine: { display: "flex", alignItems: "center", gap: 11, background: "#fff", border: "1px solid #eaecf0", borderRadius: 12, padding: 11 },
  miniProduct: { width: 43, height: 43, display: "grid", placeItems: "center", borderRadius: 10 },
  cartLine small: { display: "block", color: "#98a2b3", fontSize: 10, marginTop: 4 },
  quantity: { display: "flex", alignItems: "center", gap: 9 },
  quantity button: { width: 25, height: 25, display: "grid", placeItems: "center", border: "1px solid #d0d5dd", borderRadius: 6, background: "#fff", cursor: "pointer" },
  promoBox: { display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1px dashed #d0d5dd", borderRadius: 11, padding: 10, marginTop: 5 },
  promoBox input: { flex: 1, border: 0, outline: "none", font: "inherit", fontSize: 12 },
  promoBox button: { border: 0, borderRadius: 7, background: "#172b4d", color: "#fff", padding: "7px 12px", cursor: "pointer", fontSize: 11 },
  promoBox span: { color: "#087443", fontSize: 11, fontWeight: 800 },
  checkoutCard: { background: "#fff", border: "1px solid #eaecf0", borderRadius: 15, padding: 17, height: "fit-content" },
  checkoutCard h3: { margin: "0 0 14px", fontSize: 15 },
  checkoutCard label: { display: "grid", gap: 5, color: "#475467", fontSize: 11, fontWeight: 700, marginBottom: 11 },
  checkoutCard input: { width: "100%", boxSizing: "border-box", border: "1px solid #d0d5dd", borderRadius: 8, padding: "9px 10px", font: "inherit", fontSize: 12 },
  checkoutCard select: { width: "100%", boxSizing: "border-box", border: "1px solid #d0d5dd", borderRadius: 8, padding: "9px 10px", background: "#fff", font: "inherit", fontSize: 12 },
  checkoutCard textarea: { width: "100%", minHeight: 58, boxSizing: "border-box", border: "1px solid #d0d5dd", borderRadius: 8, padding: "9px 10px", font: "inherit", fontSize: 12, resize: "vertical" },
  summary: { display: "grid", gap: 8, borderTop: "1px solid #eaecf0", margin: "14px 0", paddingTop: 13, color: "#667085", fontSize: 12 },
  summary span: { display: "flex", justifyContent: "space-between" },
  summary strong: { display: "flex", justifyContent: "space-between", color: "#172b4d", fontSize: 15, paddingTop: 5 },
  profileLayout: { display: "grid", gridTemplateColumns: "250px minmax(0, 1fr)", gap: 15 },
  profileCard: { display: "flex", alignItems: "center", flexDirection: "column", background: "#fff", border: "1px solid #eaecf0", borderRadius: 15, padding: 24, textAlign: "center", height: "fit-content" },
  largeAvatar: { width: 72, height: 72, display: "grid", placeItems: "center", borderRadius: 99, color: "#fff", fontSize: 28, fontWeight: 900 },
  profileCard h3: { margin: "13px 0 3px", fontSize: 16 },
  profileCard p: { color: "#667085", margin: 0, fontSize: 12 },
  verified: { display: "inline-flex", alignItems: "center", gap: 5, color: "#087443", background: "#ecfdf3", padding: "6px 8px", borderRadius: 99, fontSize: 10, marginTop: 12 },
  profileLogin: { maxWidth: 480, margin: "90px auto", background: "#fff", border: "1px solid #eaecf0", borderRadius: 18, padding: 34, textAlign: "center" },
  profileIcon: { width: 64, height: 64, display: "grid", placeItems: "center", borderRadius: 18, margin: "0 auto 14px" },
  profileLogin h2: { margin: 0, fontSize: 20 },
  profileLogin p: { color: "#667085", fontSize: 13, lineHeight: 1.8, margin: "10px 0 18px" },
  profileLogin button: { maxWidth: 280, margin: "0 auto" },
  centerState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 360, gap: 10, color: "#667085", fontSize: 13 },
  centerState strong: { color: "#344054" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 250, textAlign: "center", background: "#fff", border: "1px dashed #d0d5dd", borderRadius: 15, padding: 20, color: "#667085" },
  emptyIcon: { width: 58, height: 58, display: "grid", placeItems: "center", borderRadius: 18, background: "#f2f4f7", color: "#98a2b3" },
  emptyState h3: { color: "#344054", margin: "13px 0 5px", fontSize: 15 },
  emptyState p: { maxWidth: 350, margin: 0, fontSize: 12, lineHeight: 1.7 },
  emptyState button: { width: "auto", marginTop: 15 },
  modalBackdrop: { position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", padding: 20, background: "rgba(16,24,40,.5)" },
  authCard: { position: "relative", width: "min(100%, 410px)", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 18, padding: 26, textAlign: "right", boxSizing: "border-box" },
  closeButton: { position: "absolute", top: 13, left: 13, display: "grid", placeItems: "center", border: 0, background: "transparent", color: "#667085", cursor: "pointer" },
  authCard h2: { textAlign: "center", margin: 0, fontSize: 19 },
  authCard p: { textAlign: "center", color: "#667085", fontSize: 12, margin: "6px 0 18px" },
  authCard label: { display: "grid", gap: 5, color: "#475467", fontSize: 11, fontWeight: 700, marginBottom: 10 },
  authCard input: { border: "1px solid #d0d5dd", borderRadius: 8, padding: "10px", font: "inherit", fontSize: 12, outline: "none" },
  formError: { background: "#fff6f5", border: "1px solid #fecdca", color: "#b42318", borderRadius: 8, padding: 9, fontSize: 11, marginBottom: 10 },
  textButton: { display: "block", margin: "13px auto 0", border: 0, background: "transparent", color: "#1668c7", cursor: "pointer", fontSize: 11, fontWeight: 700 },
};
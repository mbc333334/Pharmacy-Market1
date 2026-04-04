export type LangCode = "ar" | "ku" | "en" | "fa" | "tr" | "fr" | string;

export interface Translations {
  // App
  appName: string;
  appTagline: string;
  // Tabs / Nav
  home: string;
  browse: string;
  pharmacies: string;
  cart: string;
  profile: string;
  search: string;
  orders: string;
  inventory: string;
  settings: string;
  logout: string;
  // Auth
  welcome: string;
  welcomeBack: string;
  hello: string;
  login: string;
  loginSubtitle: string;
  register: string;
  registerNow: string;
  createAccount: string;
  noAccount: string;
  forgotPassword: string;
  password: string;
  confirmPassword: string;
  passwordMismatch: string;
  enterAllFields: string;
  wrongCredentials: string;
  // Medicines / Store
  medicines: string;
  addToCart: string;
  removeFromCart: string;
  checkout: string;
  total: string;
  cancel: string;
  confirm: string;
  save: string;
  edit: string;
  delete: string;
  back: string;
  more: string;
  open: string;
  closed: string;
  available: string;
  unavailable: string;
  loading: string;
  error: string;
  success: string;
  delivery: string;
  rating: string;
  reviews: string;
  price: string;
  quantity: string;
  category: string;
  contact: string;
  phone: string;
  whatsapp: string;
  location: string;
  workingHours: string;
  deliveryTime: string;
  minOrder: string;
  products: string;
  notifications: string;
  language: string;
  country: string;
  darkMode: string;
  version: string;
  support: string;
  aboutApp: string;
  noItems: string;
  seeAll: string;
  viewAll: string;
  nearby: string;
  featured: string;
  topRated: string;
  new: string;
  filter: string;
  sort: string;
  offers: string;
  social: string;
  shareApp: string;
  copyLink: string;
  copied: string;
  sendMessage: string;
  call: string;
  map: string;
  prescription: string;
  inStock: string;
  outOfStock: string;
  warehouse: string;
  driver: string;
  trip: string;
  status: string;
  processing: string;
  completed: string;
  cancelled: string;
  pending: string;
  city: string;
  address: string;
  currency: string;
  payNow: string;
  cashOnDelivery: string;
  orderPlaced: string;
  trackOrder: string;
  pharmacy: string;
  specialties: string;
  // Dashboard
  dashboard: string;
  quickActions: string;
  recentOrders: string;
  pendingOrders: string;
  // Pharmacy portal
  registerPharmacy: string;
  newPharmacy: string;
  myInventory: string;
  criticalStock: string;
  lowStock: string;
  totalStock: string;
  addMedicine: string;
  prescriptionSupport: string;
  licenseNumber: string;
  license: string;
  ownerName: string;
  manageInventory: string;
  // Warehouse portal
  registerWarehouse: string;
  warehouseName: string;
  warehouseOrders: string;
  warehouseSettings: string;
  linkedPharmacies: string;
  // Common features
  fastDelivery: string;
  authenticMeds: string;
  customer: string;
  customers: string;
  // Integration / sync
  integrationTitle: string;
  integrationSubtitle: string;
  connected: string;
  disconnect: string;
  autoSync: string;
  lastSync: string;
  syncFields: string;
  syncNow: string;
  testConnection: string;
  // Settings
  chooseLanguage: string;
}

const translations: Record<string, Translations> = {
  ar: {
    appName: "دواء+", appTagline: "صيدليتك بين يديك",
    home: "الرئيسية", browse: "تصفح", pharmacies: "الصيدليات", cart: "سلتي", profile: "حسابي",
    search: "بحث", orders: "الطلبات", inventory: "المخزون", settings: "الإعدادات", logout: "تسجيل الخروج",
    welcome: "مرحباً", welcomeBack: "مرحباً بعودتك", hello: "أهلاً",
    login: "تسجيل الدخول", loginSubtitle: "سجّل دخولك للمتابعة",
    register: "إنشاء حساب", registerNow: "سجّل الآن", createAccount: "إنشاء حساب جديد",
    noAccount: "ليس لديك حساب؟", forgotPassword: "نسيت كلمة المرور؟",
    password: "كلمة المرور", confirmPassword: "تأكيد كلمة المرور",
    passwordMismatch: "كلمتا المرور غير متطابقتين", enterAllFields: "يرجى تعبئة جميع الحقول",
    wrongCredentials: "بيانات الدخول غير صحيحة",
    medicines: "الأدوية", addToCart: "أضف للسلة", removeFromCart: "إزالة من السلة",
    checkout: "إتمام الشراء", total: "الإجمالي", cancel: "إلغاء", confirm: "تأكيد", save: "حفظ",
    edit: "تعديل", delete: "حذف", back: "رجوع", more: "المزيد", open: "مفتوح", closed: "مغلق",
    available: "متاح", unavailable: "غير متاح", loading: "جاري التحميل...", error: "حدث خطأ",
    success: "تم بنجاح", delivery: "التوصيل", rating: "التقييم", reviews: "تقييم", price: "السعر",
    quantity: "الكمية", category: "الفئة", contact: "التواصل", phone: "الهاتف", whatsapp: "واتساب",
    location: "الموقع", workingHours: "ساعات العمل", deliveryTime: "وقت التوصيل", minOrder: "أقل طلب",
    products: "منتجات", notifications: "الإشعارات", language: "اللغة", country: "البلد", darkMode: "الوضع الداكن",
    version: "الإصدار", support: "الدعم", aboutApp: "عن التطبيق", noItems: "لا توجد عناصر",
    seeAll: "عرض الكل", viewAll: "عرض الكل", nearby: "قريب منك", featured: "مميّز",
    topRated: "الأعلى تقييماً", new: "جديد", filter: "تصفية", sort: "ترتيب", offers: "العروض",
    social: "التواصل الاجتماعي", shareApp: "مشاركة التطبيق", copyLink: "نسخ الرابط", copied: "تم النسخ!",
    sendMessage: "إرسال رسالة", call: "اتصال", map: "الخريطة",
    prescription: "وصفة طبية", inStock: "متوفر", outOfStock: "نفذ",
    warehouse: "مذخر", driver: "سائق", trip: "رحلة", status: "الحالة",
    processing: "قيد التجهيز", completed: "مكتمل", cancelled: "ملغي", pending: "معلّق",
    city: "المدينة", address: "العنوان", currency: "د.ع",
    payNow: "ادفع الآن", cashOnDelivery: "الدفع عند الاستلام",
    orderPlaced: "تم تسجيل طلبك", trackOrder: "تتبع الطلب",
    pharmacy: "صيدلية", specialties: "التخصصات",
    dashboard: "لوحتي", quickActions: "الإجراءات السريعة",
    recentOrders: "آخر الطلبات", pendingOrders: "الطلبات المعلّقة",
    registerPharmacy: "تسجيل صيدلية", newPharmacy: "صيدلية جديدة",
    myInventory: "مخزوني", criticalStock: "مخزون حرج", lowStock: "مخزون منخفض",
    totalStock: "إجمالي المخزون", addMedicine: "إضافة دواء",
    prescriptionSupport: "دعم الوصفات الطبية", licenseNumber: "رقم الترخيص",
    license: "الترخيص", ownerName: "اسم المالك", manageInventory: "إدارة المخزون",
    registerWarehouse: "تسجيل مذخر", warehouseName: "اسم المذخر",
    warehouseOrders: "طلبات المذخر", warehouseSettings: "إعدادات المذخر",
    linkedPharmacies: "الصيدليات المرتبطة",
    fastDelivery: "توصيل سريع", authenticMeds: "أدوية أصلية",
    customer: "زبون", customers: "الزبائن",
    integrationTitle: "ربط المنصات", integrationSubtitle: "اربط صيدليتك بالمذاخر",
    connected: "متصل", disconnect: "قطع الاتصال", autoSync: "مزامنة تلقائية",
    lastSync: "آخر مزامنة", syncFields: "حقول المزامنة", syncNow: "مزامنة الآن",
    testConnection: "اختبار الاتصال", chooseLanguage: "اختر اللغة",
  },
  ku: {
    appName: "دەرمان+", appTagline: "دەرمانخانەکەت لە دەستەکەتدا",
    home: "سەرەکی", browse: "گەڕان", pharmacies: "دەرمانخانەکان", cart: "سەبەتەم", profile: "ئەکاونتم",
    search: "گەڕان", orders: "داواکاریەکان", inventory: "کۆگا", settings: "ڕێکخستنەکان", logout: "دەرچوون",
    welcome: "بەخێربێیت", welcomeBack: "بەخێربێیتەوە", hello: "سڵاو",
    login: "چوونەژوورەوە", loginSubtitle: "بچۆ ژوورەوە بۆ بەردەوام بوون",
    register: "ئەکاونت دروستکە", registerNow: "ئێستا تۆمار بکە", createAccount: "ئەکاونتی نوێ دروستکە",
    noAccount: "ئەکاونتت نییە؟", forgotPassword: "وشەی نهێنیت لەبیرچووە؟",
    password: "وشەی نهێنی", confirmPassword: "وشەی نهێنی دووپات بکەرەوە",
    passwordMismatch: "وشەی نهێنیەکان یەکسان نین", enterAllFields: "تکایە هەموو خانەکان پڕبکەرەوە",
    wrongCredentials: "زانیاریەکانی چوونەژوورەوە هەڵەن",
    medicines: "دەرمانەکان", addToCart: "زیادکردن بۆ سەبەتە", removeFromCart: "لابردن لە سەبەتە",
    checkout: "پیرانی کڕین", total: "کۆی گشتی", cancel: "هەڵوەشاندنەوە", confirm: "پشتڕاستکردنەوە",
    save: "پاشەکەوتکردن", edit: "دەستکاریکردن", delete: "سڕینەوە", back: "گەڕانەوە", more: "زیاتر",
    open: "کراوەیە", closed: "داخراوە", available: "بەردەستە", unavailable: "بەردەست نییە",
    loading: "بارکردن...", error: "هەڵەیەک ڕوویدا", success: "سەرکەوتوو",
    delivery: "گەیاندن", rating: "هەڵسەنگاندن", reviews: "هەڵسەنگاندن", price: "نرخ",
    quantity: "بڕ", category: "جۆر", contact: "پەیوەندی", phone: "تەلەفۆن", whatsapp: "واتساپ",
    location: "شوێن", workingHours: "کاتی کار", deliveryTime: "کاتی گەیاندن", minOrder: "کەمترین داواکاری",
    products: "بەرهەم", notifications: "ئاگادارکردنەوەکان", language: "زمان", country: "وڵات",
    darkMode: "دۆخی تاریک", version: "وەشان", support: "پشتگیری", aboutApp: "دەربارەی ئەپ",
    noItems: "هیچ شتێک نییە", seeAll: "هەموو ببینە", viewAll: "هەموو ببینە",
    nearby: "نزیکت", featured: "تایبەت", topRated: "باشترین هەڵسەنگاندن",
    new: "نوێ", filter: "فلتەر", sort: "ڕیزبەندی", offers: "پێشکەشکردنەکان",
    social: "تۆڕی کۆمەڵایەتی", shareApp: "هاوبەشکردنی ئەپ", copyLink: "لینکەکە کۆپی بکە",
    copied: "کۆپی کرا!", sendMessage: "نامەیەک بنێرە", call: "پەیوەندی", map: "نەخشە",
    prescription: "ڕێنوێنی پزیشک", inStock: "بەردەستە", outOfStock: "نەماوە",
    warehouse: "کۆگا", driver: "شووفێر", trip: "گەشت", status: "دۆخ",
    processing: "لە پرۆسەدایە", completed: "تەواوبووە", cancelled: "هەڵوەشاوە", pending: "چاوەڕوانە",
    city: "شار", address: "ناونیشان", currency: "د.ع",
    payNow: "ئێستا بدە", cashOnDelivery: "پارەدان لە کاتی وەرگرتن",
    orderPlaced: "داواکاریەکەت تۆمارکرا", trackOrder: "شوێنکەوتنی داواکاری",
    pharmacy: "دەرمانخانە", specialties: "پسپۆڕی",
    dashboard: "دەشبۆردم", quickActions: "کارە خێراکان",
    recentOrders: "دوایین داواکاریەکان", pendingOrders: "داواکاریە چاوەڕوانەکان",
    registerPharmacy: "تۆمارکردنی دەرمانخانە", newPharmacy: "دەرمانخانەی نوێ",
    myInventory: "کۆگاکەم", criticalStock: "کۆگای مەترسیدار", lowStock: "کۆگای کەم",
    totalStock: "کۆگای گشتی", addMedicine: "زیادکردنی دەرمان",
    prescriptionSupport: "پشتگیری ڕێنوێنی پزیشک", licenseNumber: "ژمارەی مۆڵەت",
    license: "مۆڵەت", ownerName: "ناوی خاوەن", manageInventory: "بەڕێوەبردنی کۆگا",
    registerWarehouse: "تۆمارکردنی کۆگا", warehouseName: "ناوی کۆگا",
    warehouseOrders: "داواکاریەکانی کۆگا", warehouseSettings: "ڕێکخستنەکانی کۆگا",
    linkedPharmacies: "دەرمانخانە پەیوەستکراوەکان",
    fastDelivery: "گەیاندنی خێرا", authenticMeds: "دەرمانی ئەسڵی",
    customer: "کڕیار", customers: "کڕیارەکان",
    integrationTitle: "پەیوەندیکردنی پلاتفۆرمەکان", integrationSubtitle: "دەرمانخانەکەت بە کۆگاکان بپەیوەندێ",
    connected: "پەیوەستە", disconnect: "قەتکردنی پەیوەندی", autoSync: "هاوکێشانی ئۆتۆماتیکی",
    lastSync: "دوایین هاوکێشان", syncFields: "خانەکانی هاوکێشان", syncNow: "ئێستا هاوکێشان بکە",
    testConnection: "تاقیکردنەوەی پەیوەندی", chooseLanguage: "زمان هەڵبژێرە",
  },
  en: {
    appName: "Dawa+", appTagline: "Your pharmacy at your fingertips",
    home: "Home", browse: "Browse", pharmacies: "Pharmacies", cart: "My Cart", profile: "Profile",
    search: "Search", orders: "Orders", inventory: "Inventory", settings: "Settings", logout: "Logout",
    welcome: "Welcome", welcomeBack: "Welcome back", hello: "Hello",
    login: "Sign In", loginSubtitle: "Sign in to continue",
    register: "Create Account", registerNow: "Register Now", createAccount: "Create New Account",
    noAccount: "Don't have an account?", forgotPassword: "Forgot password?",
    password: "Password", confirmPassword: "Confirm Password",
    passwordMismatch: "Passwords do not match", enterAllFields: "Please fill in all fields",
    wrongCredentials: "Incorrect login credentials",
    medicines: "Medicines", addToCart: "Add to Cart", removeFromCart: "Remove from Cart",
    checkout: "Checkout", total: "Total", cancel: "Cancel", confirm: "Confirm", save: "Save",
    edit: "Edit", delete: "Delete", back: "Back", more: "More", open: "Open", closed: "Closed",
    available: "Available", unavailable: "Unavailable", loading: "Loading...", error: "An error occurred",
    success: "Success", delivery: "Delivery", rating: "Rating", reviews: "reviews", price: "Price",
    quantity: "Quantity", category: "Category", contact: "Contact", phone: "Phone", whatsapp: "WhatsApp",
    location: "Location", workingHours: "Working Hours", deliveryTime: "Delivery Time", minOrder: "Min Order",
    products: "products", notifications: "Notifications", language: "Language", country: "Country",
    darkMode: "Dark Mode", version: "Version", support: "Support", aboutApp: "About App",
    noItems: "No items found", seeAll: "See All", viewAll: "View All",
    nearby: "Nearby", featured: "Featured", topRated: "Top Rated",
    new: "New", filter: "Filter", sort: "Sort", offers: "Offers",
    social: "Social Media", shareApp: "Share App", copyLink: "Copy Link", copied: "Copied!",
    sendMessage: "Send Message", call: "Call", map: "Map",
    prescription: "Prescription Required", inStock: "In Stock", outOfStock: "Out of Stock",
    warehouse: "Warehouse", driver: "Driver", trip: "Trip", status: "Status",
    processing: "Processing", completed: "Completed", cancelled: "Cancelled", pending: "Pending",
    city: "City", address: "Address", currency: "IQD",
    payNow: "Pay Now", cashOnDelivery: "Cash on Delivery",
    orderPlaced: "Order Placed", trackOrder: "Track Order",
    pharmacy: "Pharmacy", specialties: "Specialties",
    dashboard: "Dashboard", quickActions: "Quick Actions",
    recentOrders: "Recent Orders", pendingOrders: "Pending Orders",
    registerPharmacy: "Register Pharmacy", newPharmacy: "New Pharmacy",
    myInventory: "My Inventory", criticalStock: "Critical Stock", lowStock: "Low Stock",
    totalStock: "Total Stock", addMedicine: "Add Medicine",
    prescriptionSupport: "Prescription Support", licenseNumber: "License Number",
    license: "License", ownerName: "Owner Name", manageInventory: "Manage Inventory",
    registerWarehouse: "Register Warehouse", warehouseName: "Warehouse Name",
    warehouseOrders: "Warehouse Orders", warehouseSettings: "Warehouse Settings",
    linkedPharmacies: "Linked Pharmacies",
    fastDelivery: "Fast Delivery", authenticMeds: "Authentic Medicines",
    customer: "Customer", customers: "Customers",
    integrationTitle: "Platform Integration", integrationSubtitle: "Connect your pharmacy to warehouses",
    connected: "Connected", disconnect: "Disconnect", autoSync: "Auto Sync",
    lastSync: "Last Sync", syncFields: "Sync Fields", syncNow: "Sync Now",
    testConnection: "Test Connection", chooseLanguage: "Choose Language",
  },
  fa: {
    appName: "دارو+", appTagline: "داروخانه‌ات در دستت",
    home: "صفحه اصلی", browse: "مرور", pharmacies: "داروخانه‌ها", cart: "سبد من", profile: "پروفایل",
    search: "جستجو", orders: "سفارشات", inventory: "موجودی", settings: "تنظیمات", logout: "خروج",
    welcome: "خوش آمدید", welcomeBack: "خوش برگشتید", hello: "سلام",
    login: "ورود", loginSubtitle: "برای ادامه وارد شوید",
    register: "ایجاد حساب", registerNow: "همین حالا ثبت کن", createAccount: "ایجاد حساب جدید",
    noAccount: "حساب ندارید؟", forgotPassword: "رمز عبور را فراموش کردید؟",
    password: "رمز عبور", confirmPassword: "تأیید رمز عبور",
    passwordMismatch: "رمزهای عبور یکسان نیستند", enterAllFields: "لطفاً همه فیلدها را پر کنید",
    wrongCredentials: "اطلاعات ورود نادرست است",
    medicines: "داروها", addToCart: "افزودن به سبد", removeFromCart: "حذف از سبد",
    checkout: "تسویه‌حساب", total: "مجموع", cancel: "لغو", confirm: "تأیید", save: "ذخیره",
    edit: "ویرایش", delete: "حذف", back: "برگشت", more: "بیشتر", open: "باز", closed: "بسته",
    available: "موجود", unavailable: "ناموجود", loading: "در حال بارگذاری...", error: "خطایی رخ داد",
    success: "موفقیت‌آمیز", delivery: "تحویل", rating: "امتیاز", reviews: "نظر", price: "قیمت",
    quantity: "مقدار", category: "دسته‌بندی", contact: "تماس", phone: "تلفن", whatsapp: "واتساپ",
    location: "موقعیت", workingHours: "ساعات کاری", deliveryTime: "زمان تحویل", minOrder: "حداقل سفارش",
    products: "محصول", notifications: "اعلان‌ها", language: "زبان", country: "کشور", darkMode: "حالت تاریک",
    version: "نسخه", support: "پشتیبانی", aboutApp: "درباره اپ", noItems: "موردی یافت نشد",
    seeAll: "مشاهده همه", viewAll: "مشاهده همه", nearby: "نزدیک شما", featured: "ویژه",
    topRated: "بهترین امتیاز", new: "جدید", filter: "فیلتر", sort: "مرتب‌سازی", offers: "پیشنهادات",
    social: "شبکه‌های اجتماعی", shareApp: "اشتراک‌گذاری اپ", copyLink: "کپی لینک", copied: "کپی شد!",
    sendMessage: "ارسال پیام", call: "تماس", map: "نقشه",
    prescription: "نسخه پزشک", inStock: "موجود", outOfStock: "ناموجود",
    warehouse: "انبار", driver: "راننده", trip: "سفر", status: "وضعیت",
    processing: "در حال پردازش", completed: "تکمیل شده", cancelled: "لغو شده", pending: "در انتظار",
    city: "شهر", address: "آدرس", currency: "د.ع",
    payNow: "پرداخت کنید", cashOnDelivery: "پرداخت در محل",
    orderPlaced: "سفارش ثبت شد", trackOrder: "پیگیری سفارش",
    pharmacy: "داروخانه", specialties: "تخصص‌ها",
    dashboard: "داشبوردم", quickActions: "اقدامات سریع",
    recentOrders: "سفارشات اخیر", pendingOrders: "سفارشات معلق",
    registerPharmacy: "ثبت داروخانه", newPharmacy: "داروخانه جدید",
    myInventory: "موجودی من", criticalStock: "موجودی بحرانی", lowStock: "موجودی کم",
    totalStock: "کل موجودی", addMedicine: "افزودن دارو",
    prescriptionSupport: "پشتیبانی نسخه پزشک", licenseNumber: "شماره مجوز",
    license: "مجوز", ownerName: "نام مالک", manageInventory: "مدیریت موجودی",
    registerWarehouse: "ثبت انبار", warehouseName: "نام انبار",
    warehouseOrders: "سفارشات انبار", warehouseSettings: "تنظیمات انبار",
    linkedPharmacies: "داروخانه‌های متصل",
    fastDelivery: "تحویل سریع", authenticMeds: "داروهای اصلی",
    customer: "مشتری", customers: "مشتریان",
    integrationTitle: "یکپارچه‌سازی پلتفرم", integrationSubtitle: "داروخانه‌ات را به انبارها وصل کن",
    connected: "متصل", disconnect: "قطع اتصال", autoSync: "همگام‌سازی خودکار",
    lastSync: "آخرین همگام‌سازی", syncFields: "فیلدهای همگام‌سازی", syncNow: "همگام‌سازی کن",
    testConnection: "تست اتصال", chooseLanguage: "زبان را انتخاب کنید",
  },
  tr: {
    appName: "İlaç+", appTagline: "Eczaneniz parmak uçlarınızda",
    home: "Ana Sayfa", browse: "Ara", pharmacies: "Eczaneler", cart: "Sepetim", profile: "Profilim",
    search: "Arama", orders: "Siparişler", inventory: "Envanter", settings: "Ayarlar", logout: "Çıkış",
    welcome: "Hoş geldiniz", welcomeBack: "Tekrar hoş geldiniz", hello: "Merhaba",
    login: "Giriş Yap", loginSubtitle: "Devam etmek için giriş yapın",
    register: "Hesap Oluştur", registerNow: "Şimdi Kayıt Ol", createAccount: "Yeni Hesap Oluştur",
    noAccount: "Hesabınız yok mu?", forgotPassword: "Şifremi unuttum?",
    password: "Şifre", confirmPassword: "Şifreyi Onayla",
    passwordMismatch: "Şifreler eşleşmiyor", enterAllFields: "Lütfen tüm alanları doldurun",
    wrongCredentials: "Hatalı giriş bilgileri",
    medicines: "İlaçlar", addToCart: "Sepete Ekle", removeFromCart: "Sepetten Çıkar",
    checkout: "Ödeme", total: "Toplam", cancel: "İptal", confirm: "Onayla", save: "Kaydet",
    edit: "Düzenle", delete: "Sil", back: "Geri", more: "Daha Fazla", open: "Açık", closed: "Kapalı",
    available: "Mevcut", unavailable: "Mevcut Değil", loading: "Yükleniyor...", error: "Bir hata oluştu",
    success: "Başarılı", delivery: "Teslimat", rating: "Puan", reviews: "yorum", price: "Fiyat",
    quantity: "Miktar", category: "Kategori", contact: "İletişim", phone: "Telefon", whatsapp: "WhatsApp",
    location: "Konum", workingHours: "Çalışma Saatleri", deliveryTime: "Teslimat Süresi", minOrder: "Min. Sipariş",
    products: "ürün", notifications: "Bildirimler", language: "Dil", country: "Ülke", darkMode: "Karanlık Mod",
    version: "Sürüm", support: "Destek", aboutApp: "Uygulama Hakkında", noItems: "Öğe bulunamadı",
    seeAll: "Tümünü Gör", viewAll: "Tümünü Görüntüle", nearby: "Yakınındaki", featured: "Öne Çıkan",
    topRated: "En Yüksek Puanlı", new: "Yeni", filter: "Filtrele", sort: "Sırala", offers: "Teklifler",
    social: "Sosyal Medya", shareApp: "Uygulamayı Paylaş", copyLink: "Bağlantıyı Kopyala", copied: "Kopyalandı!",
    sendMessage: "Mesaj Gönder", call: "Ara", map: "Harita",
    prescription: "Reçete Gerekli", inStock: "Stokta Var", outOfStock: "Stokta Yok",
    warehouse: "Depo", driver: "Sürücü", trip: "Seyahat", status: "Durum",
    processing: "İşleniyor", completed: "Tamamlandı", cancelled: "İptal Edildi", pending: "Beklemede",
    city: "Şehir", address: "Adres", currency: "IQD",
    payNow: "Şimdi Öde", cashOnDelivery: "Kapıda Ödeme",
    orderPlaced: "Sipariş Verildi", trackOrder: "Siparişi Takip Et",
    pharmacy: "Eczane", specialties: "Uzmanlıklar",
    dashboard: "Panom", quickActions: "Hızlı İşlemler",
    recentOrders: "Son Siparişler", pendingOrders: "Bekleyen Siparişler",
    registerPharmacy: "Eczane Kaydet", newPharmacy: "Yeni Eczane",
    myInventory: "Envanterim", criticalStock: "Kritik Stok", lowStock: "Düşük Stok",
    totalStock: "Toplam Stok", addMedicine: "İlaç Ekle",
    prescriptionSupport: "Reçete Desteği", licenseNumber: "Lisans Numarası",
    license: "Lisans", ownerName: "Sahip Adı", manageInventory: "Envanteri Yönet",
    registerWarehouse: "Depo Kaydet", warehouseName: "Depo Adı",
    warehouseOrders: "Depo Siparişleri", warehouseSettings: "Depo Ayarları",
    linkedPharmacies: "Bağlı Eczaneler",
    fastDelivery: "Hızlı Teslimat", authenticMeds: "Orijinal İlaçlar",
    customer: "Müşteri", customers: "Müşteriler",
    integrationTitle: "Platform Entegrasyonu", integrationSubtitle: "Eczanenizi depolara bağlayın",
    connected: "Bağlandı", disconnect: "Bağlantıyı Kes", autoSync: "Otomatik Senkronizasyon",
    lastSync: "Son Senkronizasyon", syncFields: "Senkronizasyon Alanları", syncNow: "Şimdi Senkronize Et",
    testConnection: "Bağlantıyı Test Et", chooseLanguage: "Dil Seçin",
  },
  fr: {
    appName: "Médi+", appTagline: "Votre pharmacie à portée de main",
    home: "Accueil", browse: "Parcourir", pharmacies: "Pharmacies", cart: "Mon panier", profile: "Profil",
    search: "Rechercher", orders: "Commandes", inventory: "Inventaire", settings: "Paramètres", logout: "Déconnexion",
    welcome: "Bienvenue", welcomeBack: "Bon retour", hello: "Bonjour",
    login: "Se connecter", loginSubtitle: "Connectez-vous pour continuer",
    register: "Créer un compte", registerNow: "S'inscrire maintenant", createAccount: "Créer un nouveau compte",
    noAccount: "Pas de compte?", forgotPassword: "Mot de passe oublié?",
    password: "Mot de passe", confirmPassword: "Confirmer le mot de passe",
    passwordMismatch: "Les mots de passe ne correspondent pas", enterAllFields: "Veuillez remplir tous les champs",
    wrongCredentials: "Identifiants incorrects",
    medicines: "Médicaments", addToCart: "Ajouter au panier", removeFromCart: "Retirer du panier",
    checkout: "Paiement", total: "Total", cancel: "Annuler", confirm: "Confirmer", save: "Sauvegarder",
    edit: "Modifier", delete: "Supprimer", back: "Retour", more: "Plus", open: "Ouvert", closed: "Fermé",
    available: "Disponible", unavailable: "Indisponible", loading: "Chargement...", error: "Une erreur s'est produite",
    success: "Succès", delivery: "Livraison", rating: "Note", reviews: "avis", price: "Prix",
    quantity: "Quantité", category: "Catégorie", contact: "Contact", phone: "Téléphone", whatsapp: "WhatsApp",
    location: "Emplacement", workingHours: "Heures d'ouverture", deliveryTime: "Délai de livraison",
    minOrder: "Commande min.", products: "produits", notifications: "Notifications", language: "Langue",
    country: "Pays", darkMode: "Mode sombre", version: "Version", support: "Assistance", aboutApp: "À propos",
    noItems: "Aucun élément trouvé", seeAll: "Voir tout", viewAll: "Tout afficher",
    nearby: "À proximité", featured: "En vedette", topRated: "Mieux noté",
    new: "Nouveau", filter: "Filtrer", sort: "Trier", offers: "Offres",
    social: "Réseaux sociaux", shareApp: "Partager l'app", copyLink: "Copier le lien", copied: "Copié!",
    sendMessage: "Envoyer un message", call: "Appeler", map: "Carte",
    prescription: "Ordonnance requise", inStock: "En stock", outOfStock: "Épuisé",
    warehouse: "Entrepôt", driver: "Chauffeur", trip: "Trajet", status: "Statut",
    processing: "En cours", completed: "Complété", cancelled: "Annulé", pending: "En attente",
    city: "Ville", address: "Adresse", currency: "IQD",
    payNow: "Payer maintenant", cashOnDelivery: "Paiement à la livraison",
    orderPlaced: "Commande passée", trackOrder: "Suivre la commande",
    pharmacy: "Pharmacie", specialties: "Spécialités",
    dashboard: "Mon tableau de bord", quickActions: "Actions rapides",
    recentOrders: "Commandes récentes", pendingOrders: "Commandes en attente",
    registerPharmacy: "Enregistrer une pharmacie", newPharmacy: "Nouvelle pharmacie",
    myInventory: "Mon inventaire", criticalStock: "Stock critique", lowStock: "Stock faible",
    totalStock: "Stock total", addMedicine: "Ajouter un médicament",
    prescriptionSupport: "Support ordonnances", licenseNumber: "Numéro de licence",
    license: "Licence", ownerName: "Nom du propriétaire", manageInventory: "Gérer l'inventaire",
    registerWarehouse: "Enregistrer un entrepôt", warehouseName: "Nom de l'entrepôt",
    warehouseOrders: "Commandes entrepôt", warehouseSettings: "Paramètres entrepôt",
    linkedPharmacies: "Pharmacies liées",
    fastDelivery: "Livraison rapide", authenticMeds: "Médicaments authentiques",
    customer: "Client", customers: "Clients",
    integrationTitle: "Intégration des plateformes", integrationSubtitle: "Connectez votre pharmacie aux entrepôts",
    connected: "Connecté", disconnect: "Déconnecter", autoSync: "Synchronisation auto",
    lastSync: "Dernière synchronisation", syncFields: "Champs de synchronisation", syncNow: "Synchroniser maintenant",
    testConnection: "Tester la connexion", chooseLanguage: "Choisir la langue",
  },
};

const DEFAULT_TRANSLATIONS = translations.ar;

export function getTranslations(langCode: string): Translations {
  return translations[langCode] || DEFAULT_TRANSLATIONS;
}

export default translations;

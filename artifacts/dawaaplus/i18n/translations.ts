export type LangCode = "ar" | "ku" | "en";

export type TranslationKey =
  | "appName"
  | "appTagline"
  | "pharmacies"
  | "products"
  | "customers"
  | "login"
  | "register"
  | "registerPharmacy"
  | "registerWarehouse"
  | "welcome"
  | "welcomeBack"
  | "loginSubtitle"
  | "customer"
  | "pharmacy"
  | "warehouse"
  | "phone"
  | "password"
  | "forgotPassword"
  | "enterAllFields"
  | "wrongCredentials"
  | "noAccount"
  | "createAccount"
  | "newPharmacy"
  | "registerNow"
  | "tryDemo"
  | "tryDemoPharmacy"
  | "tryDemoWarehouse"
  | "fastDelivery"
  | "authenticMeds"
  | "prescriptionSupport"
  | "dashboard"
  | "myMedicines"
  | "surplus"
  | "orders"
  | "settings"
  | "integration"
  | "activeProducts"
  | "todayOrders"
  | "monthSales"
  | "rating"
  | "quickActions"
  | "addMedicine"
  | "manageInventory"
  | "pendingOrders"
  | "salesReport"
  | "recentOrders"
  | "viewAll"
  | "stockAlerts"
  | "new"
  | "processing"
  | "completed"
  | "cancelled"
  | "lowStock"
  | "criticalStock"
  | "remaining"
  | "integrationTitle"
  | "integrationSubtitle"
  | "connectDatabase"
  | "importCSV"
  | "apiConnect"
  | "autoSync"
  | "syncNow"
  | "connected"
  | "failed"
  | "testing"
  | "idle"
  | "lastSync"
  | "syncFields"
  | "medicines"
  | "prices"
  | "inventory"
  | "disconnect"
  | "testConnection"
  | "warehouseDashboard"
  | "linkedPharmacies"
  | "totalStock"
  | "warehouseOrders"
  | "myInventory"
  | "suppliedPharmacies"
  | "warehouseSettings"
  | "warehouseName"
  | "warehouseAddress"
  | "licenseNumber"
  | "city"
  | "ownerName"
  | "confirmPassword"
  | "passwordMismatch"
  | "back"
  | "save"
  | "cancel"
  | "search"
  | "filter"
  | "noResults"
  | "loading"
  | "language"
  | "chooseLanguage"
  | "profile"
  | "logout"
  | "hello"
  | "license"
  | "browseMarket"
  | "urgent"
  | "availableOffers"
  | "discountsUpTo"
  | "address";

type Translations = Record<LangCode, Record<TranslationKey, string>>;

const t: Translations = {
  ar: {
    appName: "دواء +",
    appTagline: "منصة الصيدليات والأدوية\nفي إقليم كردستان والعراق",
    pharmacies: "صيدلية",
    products: "منتج",
    customers: "عميل",
    login: "تسجيل الدخول",
    register: "إنشاء حساب عميل",
    registerPharmacy: "سجّل صيدليتك وابدأ البيع",
    registerWarehouse: "سجّل مخزنك",
    welcome: "أهلاً وسهلاً",
    welcomeBack: "مرحباً بعودتك 👋",
    loginSubtitle: "سجّل الدخول للوصول إلى حسابك",
    customer: "عميل",
    pharmacy: "صيدلية",
    warehouse: "مخزن",
    phone: "رقم الهاتف",
    password: "كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    enterAllFields: "يرجى إدخال جميع الحقول",
    wrongCredentials: "بيانات الدخول غير صحيحة",
    noAccount: "ليس لديك حساب؟",
    createAccount: "إنشاء حساب جديد",
    newPharmacy: "صيدلية جديدة؟",
    registerNow: "سجّل الآن",
    tryDemo: "أدخل أي رقم وكلمة مرور للتجربة",
    tryDemoPharmacy: "أدخل أي بيانات للتجربة كصيدلية",
    tryDemoWarehouse: "أدخل أي بيانات للتجربة كمخزن",
    fastDelivery: "توصيل سريع لباب منزلك",
    authenticMeds: "أدوية أصلية 100% مضمونة",
    prescriptionSupport: "دعم الوصفات الطبية الإلكترونية",
    dashboard: "لوحتي",
    myMedicines: "أدويتي",
    surplus: "الرواكد",
    orders: "الطلبات",
    settings: "إعداداتي",
    integration: "الربط",
    activeProducts: "منتج نشط",
    todayOrders: "طلبات اليوم",
    monthSales: "مبيعات الشهر",
    rating: "التقييم",
    quickActions: "الإجراءات السريعة",
    addMedicine: "إضافة دواء",
    manageInventory: "إدارة المخزون",
    pendingOrders: "الطلبات المعلقة",
    salesReport: "تقرير المبيعات",
    recentOrders: "آخر الطلبات",
    viewAll: "عرض الكل",
    stockAlerts: "⚠️ تنبيهات المخزون",
    new: "جديد",
    processing: "قيد التجهيز",
    completed: "مكتمل",
    cancelled: "ملغي",
    lowStock: "مخزون منخفض",
    criticalStock: "مخزون منخفض جداً ⚠️",
    remaining: "متبقي",
    integrationTitle: "ربط قاعدة البيانات",
    integrationSubtitle: "اربط قاعدة بيانات صيدليتك أوتوماتيكياً",
    connectDatabase: "ربط قاعدة بيانات",
    importCSV: "استيراد ملف Excel/CSV",
    apiConnect: "ربط API",
    autoSync: "مزامنة تلقائية",
    syncNow: "مزامنة الآن",
    connected: "متصل",
    failed: "فشل الاتصال",
    testing: "جاري الاختبار...",
    idle: "غير متصل",
    lastSync: "آخر مزامنة",
    syncFields: "الحقول المزامنة",
    medicines: "الأدوية",
    prices: "الأسعار",
    inventory: "المخزون",
    disconnect: "قطع الاتصال",
    testConnection: "اختبار الاتصال",
    warehouseDashboard: "لوحة المخزن",
    linkedPharmacies: "الصيدليات المرتبطة",
    totalStock: "إجمالي المخزون",
    warehouseOrders: "طلبات المخزن",
    myInventory: "مخزوني",
    suppliedPharmacies: "الصيدليات المزوّدة",
    warehouseSettings: "إعدادات المخزن",
    warehouseName: "اسم المخزن",
    warehouseAddress: "عنوان المخزن",
    licenseNumber: "رقم الرخصة",
    city: "المدينة",
    ownerName: "اسم المالك",
    confirmPassword: "تأكيد كلمة المرور",
    passwordMismatch: "كلمتا المرور غير متطابقتان",
    back: "رجوع",
    save: "حفظ",
    cancel: "إلغاء",
    search: "بحث",
    filter: "تصفية",
    noResults: "لا توجد نتائج",
    loading: "جاري التحميل...",
    language: "اللغة",
    chooseLanguage: "اختر اللغة",
    profile: "الملف الشخصي",
    logout: "تسجيل الخروج",
    hello: "مرحباً",
    license: "رخصة",
    browseMarket: "تصفح السوق",
    urgent: "عاجل",
    availableOffers: "عرض متاح بخصومات تصل إلى",
    discountsUpTo: "72%",
    address: "العنوان",
  },
  ku: {
    appName: "دواء +",
    appTagline: "پلاتفۆرمی دەرمانخانە و دەرمان\nلە هەرێمی کوردستان و عێراق",
    pharmacies: "دەرمانخانە",
    products: "بەرهەم",
    customers: "کڕیار",
    login: "چوونەژوورەوە",
    register: "دروستکردنی هەژمار",
    registerPharmacy: "دەرمانخانەکەت تۆمار بکە",
    registerWarehouse: "کۆگاکەت تۆمار بکە",
    welcome: "بەخێربێیت",
    welcomeBack: "بەخێربێیتەوە 👋",
    loginSubtitle: "بچووە ژوورەوە بۆ دەستگەیشتن بە هەژمارەکەت",
    customer: "کڕیار",
    pharmacy: "دەرمانخانە",
    warehouse: "کۆگا",
    phone: "ژمارەی مۆبایل",
    password: "وشەی نهێنی",
    forgotPassword: "وشەی نهێنیت بیرچووتەوە؟",
    enterAllFields: "تکایە هەموو خانەکان پڕ بکەرەوە",
    wrongCredentials: "زانیاریەکان هەڵەن",
    noAccount: "هەژمارت نییە؟",
    createAccount: "هەژماری نوێ دروست بکە",
    newPharmacy: "دەرمانخانەی نوێ؟",
    registerNow: "ئێستا تۆمار بکە",
    tryDemo: "هر ژمارەیەک و وشەی نهێنییەک بنووسە بۆ تاقیکردنەوە",
    tryDemoPharmacy: "هر زانیارییەک بنووسە بۆ تاقیکردنەوە وەک دەرمانخانە",
    tryDemoWarehouse: "هر زانیارییەک بنووسە بۆ تاقیکردنەوە وەک کۆگا",
    fastDelivery: "گەیاندنی خێرا بۆ دەرگاکەت",
    authenticMeds: "دەرمانی ڕەسەن ١٠٠٪ دڵنیا",
    prescriptionSupport: "پشتگیری نووسراوی پزیشکی ئەلیکترۆنی",
    dashboard: "داشبۆردەکەم",
    myMedicines: "دەرمانەکانم",
    surplus: "کاڵای زیادە",
    orders: "داواکاریەکان",
    settings: "ڕێکخستنەکان",
    integration: "پەیوەندیکردن",
    activeProducts: "بەرهەمی چالاک",
    todayOrders: "داواکاری ئەمڕۆ",
    monthSales: "فرۆشتنی مانگ",
    rating: "هەڵسەنگاندن",
    quickActions: "کارە خێراکان",
    addMedicine: "دەرمان زیاد بکە",
    manageInventory: "بەڕێوەبردنی کۆگا",
    pendingOrders: "داواکاری چاوەڕوان",
    salesReport: "ڕاپۆرتی فرۆشتن",
    recentOrders: "داواکاری دوایین",
    viewAll: "هەموو ببینە",
    stockAlerts: "⚠️ ئاگادارییەکانی کۆگا",
    new: "نوێ",
    processing: "لە ئامادەکردندا",
    completed: "تەواو بوو",
    cancelled: "هەڵوەشاندەوە",
    lowStock: "کۆگا کەمە",
    criticalStock: "کۆگا زۆر کەمە ⚠️",
    remaining: "ماوە",
    integrationTitle: "پەیوەندیکردنی بنکەی داتا",
    integrationSubtitle: "بنکەی داتای دەرمانخانەکەت بەخۆماتیکی پەیوەند بکە",
    connectDatabase: "پەیوەندیکردنی بنکەی داتا",
    importCSV: "هاوردەکردنی فایلی Excel/CSV",
    apiConnect: "پەیوەندیکردنی API",
    autoSync: "هاوکاریکردنی خۆکار",
    syncNow: "ئێستا هاوکاری بکە",
    connected: "پەیوەندی هەیە",
    failed: "پەیوەندی سەرنەکەوت",
    testing: "تاقیکردنەوە...",
    idle: "پەیوەندی نییە",
    lastSync: "دوایین هاوکاری",
    syncFields: "خانەی هاوکاریکراو",
    medicines: "دەرمانەکان",
    prices: "نرخەکان",
    inventory: "کۆگا",
    disconnect: "قتاندنەوەی پەیوەندی",
    testConnection: "تاقیکردنەوەی پەیوەندی",
    warehouseDashboard: "داشبۆردی کۆگا",
    linkedPharmacies: "دەرمانخانە پەیوەندکراوەکان",
    totalStock: "کۆی کۆگا",
    warehouseOrders: "داواکاریەکانی کۆگا",
    myInventory: "کۆگاکەم",
    suppliedPharmacies: "دەرمانخانە دابینکراوەکان",
    warehouseSettings: "ڕێکخستنەکانی کۆگا",
    warehouseName: "ناوی کۆگا",
    warehouseAddress: "ناونیشانی کۆگا",
    licenseNumber: "ژمارەی مۆڵەت",
    city: "شار",
    ownerName: "ناوی خاوەن",
    confirmPassword: "دووپاتکردنەوەی وشەی نهێنی",
    passwordMismatch: "وشەی نهێنییەکان یەک ناگرن",
    back: "گەڕانەوە",
    save: "پاشەکەوت بکە",
    cancel: "هەڵوەشاندنەوە",
    search: "گەڕان",
    filter: "پاڵاوتن",
    noResults: "ئەنجامی نییە",
    loading: "چاوەڕوان بە...",
    language: "زمان",
    chooseLanguage: "زمان هەڵبژێرە",
    profile: "پرۆفایل",
    logout: "چوونەدەرەوە",
    hello: "مەرحەبا",
    license: "مۆڵەت",
    browseMarket: "سەیری بازاڕ بکە",
    urgent: "فریاکەوتن",
    availableOffers: "ئۆفەری بەردەست بە داشکاندنی",
    discountsUpTo: "72%",
    address: "ناونیشان",
  },
  en: {
    appName: "Dawa +",
    appTagline: "Pharmacy & Medicine Platform\nin Kurdistan Region & Iraq",
    pharmacies: "Pharmacy",
    products: "Product",
    customers: "Customer",
    login: "Login",
    register: "Create Customer Account",
    registerPharmacy: "Register Your Pharmacy",
    registerWarehouse: "Register Your Warehouse",
    welcome: "Welcome",
    welcomeBack: "Welcome Back 👋",
    loginSubtitle: "Login to access your account",
    customer: "Customer",
    pharmacy: "Pharmacy",
    warehouse: "Warehouse",
    phone: "Phone Number",
    password: "Password",
    forgotPassword: "Forgot Password?",
    enterAllFields: "Please fill in all fields",
    wrongCredentials: "Incorrect login credentials",
    noAccount: "Don't have an account?",
    createAccount: "Create New Account",
    newPharmacy: "New pharmacy?",
    registerNow: "Register Now",
    tryDemo: "Enter any number and password to try",
    tryDemoPharmacy: "Enter any data to try as pharmacy",
    tryDemoWarehouse: "Enter any data to try as warehouse",
    fastDelivery: "Fast delivery to your door",
    authenticMeds: "100% authentic medicines guaranteed",
    prescriptionSupport: "E-prescription support",
    dashboard: "Dashboard",
    myMedicines: "My Medicines",
    surplus: "Surplus",
    orders: "Orders",
    settings: "Settings",
    integration: "Integration",
    activeProducts: "Active Products",
    todayOrders: "Today's Orders",
    monthSales: "Monthly Sales",
    rating: "Rating",
    quickActions: "Quick Actions",
    addMedicine: "Add Medicine",
    manageInventory: "Manage Inventory",
    pendingOrders: "Pending Orders",
    salesReport: "Sales Report",
    recentOrders: "Recent Orders",
    viewAll: "View All",
    stockAlerts: "⚠️ Stock Alerts",
    new: "New",
    processing: "Processing",
    completed: "Completed",
    cancelled: "Cancelled",
    lowStock: "Low Stock",
    criticalStock: "Very Low Stock ⚠️",
    remaining: "remaining",
    integrationTitle: "Database Integration",
    integrationSubtitle: "Automatically connect your pharmacy database",
    connectDatabase: "Connect Database",
    importCSV: "Import Excel/CSV File",
    apiConnect: "Connect API",
    autoSync: "Auto Sync",
    syncNow: "Sync Now",
    connected: "Connected",
    failed: "Connection Failed",
    testing: "Testing...",
    idle: "Not Connected",
    lastSync: "Last Sync",
    syncFields: "Synced Fields",
    medicines: "Medicines",
    prices: "Prices",
    inventory: "Inventory",
    disconnect: "Disconnect",
    testConnection: "Test Connection",
    warehouseDashboard: "Warehouse Dashboard",
    linkedPharmacies: "Linked Pharmacies",
    totalStock: "Total Stock",
    warehouseOrders: "Warehouse Orders",
    myInventory: "My Inventory",
    suppliedPharmacies: "Supplied Pharmacies",
    warehouseSettings: "Warehouse Settings",
    warehouseName: "Warehouse Name",
    warehouseAddress: "Warehouse Address",
    licenseNumber: "License Number",
    city: "City",
    ownerName: "Owner Name",
    confirmPassword: "Confirm Password",
    passwordMismatch: "Passwords do not match",
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    filter: "Filter",
    noResults: "No results",
    loading: "Loading...",
    language: "Language",
    chooseLanguage: "Choose Language",
    profile: "Profile",
    logout: "Logout",
    hello: "Hello",
    license: "License",
    browseMarket: "Browse Market",
    urgent: "Urgent",
    availableOffers: "offers available with discounts up to",
    discountsUpTo: "72%",
    address: "Address",
  },
};

export default t;

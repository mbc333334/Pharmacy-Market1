export type PlanId = 'free' | 'standard' | 'premium';
export type TargetType = 'pharmacy' | 'warehouse';

export interface Plan {
  id: PlanId;
  nameAr: string;
  nameKu: string;
  nameEn: string;
  price: number;
  priceLabel: string;
  color: string;
  features: string[];
  maxMedicines: number;
  maxAds: number;
  hasOffers: boolean;
  hasAnalytics: boolean;
  priority: boolean;
}

export const PHARMACY_PLANS: Plan[] = [
  {
    id: 'free',
    nameAr: 'مجاني',
    nameKu: 'خۆڕایی',
    nameEn: 'Free',
    price: 0,
    priceLabel: '0 د.ع',
    color: '#6B7280',
    features: [
      'حتى 50 دواء',
      'ظهور في نتائج البحث',
      'بدون عروض ترويجية',
      'بدون إعلانات',
    ],
    maxMedicines: 50,
    maxAds: 0,
    hasOffers: false,
    hasAnalytics: false,
    priority: false,
  },
  {
    id: 'standard',
    nameAr: 'أساسي',
    nameKu: 'بنچینەیی',
    nameEn: 'Standard',
    price: 25000,
    priceLabel: '25,000 د.ع / شهر',
    color: '#1A9E6E',
    features: [
      'حتى 500 دواء',
      'ظهور مميز في نتائج البحث',
      'إنشاء عروض ترويجية',
      'إعلان واحد شهرياً',
      'تقارير مبيعات أساسية',
    ],
    maxMedicines: 500,
    maxAds: 1,
    hasOffers: true,
    hasAnalytics: false,
    priority: false,
  },
  {
    id: 'premium',
    nameAr: 'مميز',
    nameKu: 'تایبەتمەند',
    nameEn: 'Premium',
    price: 75000,
    priceLabel: '75,000 د.ع / شهر',
    color: '#7C3AED',
    features: [
      'أدوية غير محدودة',
      'أولوية في نتائج البحث',
      'عروض ترويجية غير محدودة',
      '3 إعلانات شهرياً',
      'تحليلات مفصلة وتقارير متقدمة',
      'دعم فني مخصص',
    ],
    maxMedicines: 9999,
    maxAds: 3,
    hasOffers: true,
    hasAnalytics: true,
    priority: true,
  },
];

export const WAREHOUSE_PLANS: Plan[] = [
  {
    id: 'free',
    nameAr: 'مجاني',
    nameKu: 'خۆڕایی',
    nameEn: 'Free',
    price: 0,
    priceLabel: '0 د.ع',
    color: '#6B7280',
    features: [
      'حتى 200 منتج',
      'ربط حتى 3 صيدليات',
      'بدون إعلانات',
    ],
    maxMedicines: 200,
    maxAds: 0,
    hasOffers: false,
    hasAnalytics: false,
    priority: false,
  },
  {
    id: 'standard',
    nameAr: 'أساسي',
    nameKu: 'بنچینەیی',
    nameEn: 'Standard',
    price: 50000,
    priceLabel: '50,000 د.ع / شهر',
    color: '#0D7A54',
    features: [
      'حتى 2000 منتج',
      'ربط حتى 20 صيدلية',
      'إعلان واحد شهرياً',
      'تقارير أساسية',
    ],
    maxMedicines: 2000,
    maxAds: 1,
    hasOffers: false,
    hasAnalytics: false,
    priority: false,
  },
  {
    id: 'premium',
    nameAr: 'مميز',
    nameKu: 'تایبەتمەند',
    nameEn: 'Premium',
    price: 150000,
    priceLabel: '150,000 د.ع / شهر',
    color: '#7C3AED',
    features: [
      'منتجات غير محدودة',
      'صيدليات غير محدودة',
      '3 إعلانات شهرياً',
      'تحليلات متقدمة',
      'دعم فني على مدار الساعة',
    ],
    maxMedicines: 9999,
    maxAds: 3,
    hasOffers: false,
    hasAnalytics: true,
    priority: true,
  },
];

export interface SubscriberRecord {
  id: string;
  name: string;
  type: 'pharmacy' | 'warehouse';
  city: string;
  plan: PlanId;
  since: string;
  expiry: string;
  revenue: number;
  status: 'active' | 'expired' | 'pending';
}

export const DEMO_SUBSCRIBERS: SubscriberRecord[] = [
  { id: '1', name: 'دەرمانخانەی شیفا', type: 'pharmacy', city: 'هەولێر', plan: 'premium', since: '2025-01-01', expiry: '2026-12-31', revenue: 75000, status: 'active' },
  { id: '2', name: 'دەرمانخانەی ئارام', type: 'pharmacy', city: 'سلێمانی', plan: 'standard', since: '2025-03-01', expiry: '2026-09-30', revenue: 25000, status: 'active' },
  { id: '3', name: 'دەرمانخانەی ژیان', type: 'pharmacy', city: 'دهۆک', plan: 'standard', since: '2025-06-01', expiry: '2026-06-30', revenue: 25000, status: 'active' },
  { id: '4', name: 'دەرمانخانەی نوێ', type: 'pharmacy', city: 'کەرکووک', plan: 'free', since: '2025-09-01', expiry: '', revenue: 0, status: 'active' },
  { id: '5', name: 'دەرمانخانەی ئومێد', type: 'pharmacy', city: 'زاخۆ', plan: 'premium', since: '2024-12-01', expiry: '2025-12-01', revenue: 75000, status: 'expired' },
  { id: '6', name: 'كۆگای داوا', type: 'warehouse', city: 'هەولێر', plan: 'standard', since: '2025-02-01', expiry: '2026-09-30', revenue: 50000, status: 'active' },
  { id: '7', name: 'كۆگای باشووری', type: 'warehouse', city: 'سلێمانی', plan: 'premium', since: '2025-01-15', expiry: '2026-12-31', revenue: 150000, status: 'active' },
  { id: '8', name: 'كۆگای ئازادی', type: 'warehouse', city: 'دهۆک', plan: 'free', since: '2026-01-01', expiry: '', revenue: 0, status: 'pending' },
];

export interface Advertisement {
  id: string;
  title: string;
  subtitle: string;
  target: 'all' | 'customers' | 'pharmacies';
  placement: 'home' | 'search' | 'product';
  status: 'active' | 'paused';
  views: number;
  clicks: number;
  since: string;
  until: string;
  createdBy: string;
  bgColor: string;
}

export const DEMO_ADS: Advertisement[] = [
  {
    id: 'ad1',
    title: 'خصم 30% على مضادات الحيوية',
    subtitle: 'دەرمانخانەی شیفا — هەولێر',
    target: 'customers',
    placement: 'home',
    status: 'active',
    views: 12450,
    clicks: 834,
    since: '2026-03-01',
    until: '2026-04-30',
    createdBy: 'دەرمانخانەی شیفا',
    bgColor: '#1A9E6E',
  },
  {
    id: 'ad2',
    title: 'مخزون ضخم — توصيل خلال 24 ساعة',
    subtitle: 'كۆگای داوا — هەولێر',
    target: 'pharmacies',
    placement: 'search',
    status: 'active',
    views: 5230,
    clicks: 412,
    since: '2026-02-15',
    until: '2026-05-15',
    createdBy: 'كۆگای داوا',
    bgColor: '#0D7A54',
  },
  {
    id: 'ad3',
    title: 'فيتامينات وبروتينات بأفضل الأسعار',
    subtitle: 'دەرمانخانەی ئارام — سلێمانی',
    target: 'all',
    placement: 'product',
    status: 'paused',
    views: 3100,
    clicks: 201,
    since: '2026-01-01',
    until: '2026-03-31',
    createdBy: 'دەرمانخانەی ئارام',
    bgColor: '#7C3AED',
  },
];

export interface PharmacyOffer {
  id: string;
  medicineName: string;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  validUntil: string;
  status: 'active' | 'expired';
  views: number;
}

export const DEMO_OFFERS: PharmacyOffer[] = [
  {
    id: 'o1',
    medicineName: 'أموكسيسيلين 500mg',
    originalPrice: 12000,
    discountPercent: 25,
    discountedPrice: 9000,
    validUntil: '2026-05-31',
    status: 'active',
    views: 342,
  },
  {
    id: 'o2',
    medicineName: 'باراسيتامول 500mg',
    originalPrice: 5000,
    discountPercent: 30,
    discountedPrice: 3500,
    validUntil: '2026-04-15',
    status: 'active',
    views: 891,
  },
  {
    id: 'o3',
    medicineName: 'فيتامين سي 1000mg',
    originalPrice: 18000,
    discountPercent: 20,
    discountedPrice: 14400,
    validUntil: '2026-01-31',
    status: 'expired',
    views: 1205,
  },
];

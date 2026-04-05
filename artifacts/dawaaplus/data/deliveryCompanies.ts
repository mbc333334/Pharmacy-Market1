export interface DeliveryRating {
  stars: number;
  comment: string;
  date: string;
  reviewerType: "pharmacy" | "warehouse";
}

export interface DeliveryCompany {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  type: "national" | "local" | "express";
  baseFee: number;
  perKmFee: number;
  estimatedTime: string;
  cities: string[];
  phone: string;
  whatsapp: string;
  trackingUrl?: string;
  features: string[];
  isActive: boolean;
  isDefault: boolean;
  color: string;
  rating: number;
  ratingCount: number;
  reviews: DeliveryRating[];
}

export const ALL_DELIVERY_COMPANIES: DeliveryCompany[] = [
  {
    id: "dc1",
    name: "شركة الإسراع للتوصيل",
    nameEn: "Al-Isra Express",
    logo: "⚡",
    type: "express",
    baseFee: 3500,
    perKmFee: 200,
    estimatedTime: "نفس اليوم",
    cities: ["هەولێر", "سلێمانی", "دهوك", "كركوك"],
    phone: "07501222222",
    whatsapp: "9647501222222",
    features: ["تتبع لحظي", "إشعارات SMS", "التقاط من الصيدلية", "صورة تسليم"],
    isActive: true,
    isDefault: true,
    color: "#D69E2E",
    rating: 4.7,
    ratingCount: 128,
    reviews: [
      { stars: 5, comment: "خدمة ممتازة وسريعة جداً", date: "2026-03-20", reviewerType: "pharmacy" },
      { stars: 4, comment: "التوصيل في الوقت المحدد دائماً", date: "2026-03-15", reviewerType: "warehouse" },
    ],
  },
  {
    id: "dc2",
    name: "توصيل الخليج",
    nameEn: "Gulf Delivery",
    logo: "🚀",
    type: "express",
    baseFee: 2500,
    perKmFee: 150,
    estimatedTime: "30-60 دقيقة",
    cities: ["سلێمانی", "كركوك"],
    phone: "07701222223",
    whatsapp: "9647701222223",
    features: ["توصيل سريع", "تتبع GPS", "دفع عند الاستلام"],
    isActive: true,
    isDefault: false,
    color: "#3182CE",
    rating: 4.4,
    ratingCount: 76,
    reviews: [
      { stars: 5, comment: "أسرع شركة توصيل في السليمانية", date: "2026-03-18", reviewerType: "pharmacy" },
      { stars: 4, comment: "جيدة لكن أحياناً تتأخر", date: "2026-03-10", reviewerType: "pharmacy" },
    ],
  },
  {
    id: "dc3",
    name: "شركة السهم السريع",
    nameEn: "Al-Sahm Express",
    logo: "🏹",
    type: "national",
    baseFee: 5000,
    perKmFee: 300,
    estimatedTime: "1-2 يوم عمل",
    cities: ["هەولێر", "سلێمانی", "دهوك", "كركوك", "موصل", "بغداد", "بصرة"],
    phone: "07601222224",
    whatsapp: "9647601222224",
    trackingUrl: "https://example.com",
    features: ["تغطية واسعة", "تأمين على البضاعة", "إثبات التسليم", "دفع COD"],
    isActive: true,
    isDefault: false,
    color: "#E53E3E",
    rating: 4.8,
    ratingCount: 210,
    reviews: [
      { stars: 5, comment: "موثوقة للشحنات الكبيرة جداً", date: "2026-02-28", reviewerType: "warehouse" },
      { stars: 5, comment: "أفضل شركة في المنطقة", date: "2026-03-01", reviewerType: "pharmacy" },
    ],
  },
  {
    id: "dc4",
    name: "نجوم التوصيل",
    nameEn: "Nujoom Delivery",
    logo: "⭐",
    type: "local",
    baseFee: 2000,
    perKmFee: 100,
    estimatedTime: "1-3 ساعات",
    cities: ["كركوك"],
    phone: "07801222225",
    whatsapp: "9647801222225",
    features: ["أسعار مناسبة", "سائقون محليون", "دفع COD", "تسليم مرن"],
    isActive: true,
    isDefault: false,
    color: "#8B5CF6",
    rating: 4.0,
    ratingCount: 31,
    reviews: [
      { stars: 4, comment: "سعر مناسب وخدمة جيدة", date: "2026-03-05", reviewerType: "pharmacy" },
    ],
  },
];

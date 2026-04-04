export interface WarehouseMed {
  id: string;
  name: string;
  brand: string;
  category: string;
  form: string;
  unitPrice: number;
  minOrder: number;
  stock: number;
  requiresPrescription: boolean;
}

export interface WarehouseSocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
}

export interface WarehouseMarket {
  id: string;
  name: string;
  city: string;
  district: string;
  phone: string;
  whatsapp: string;
  ownerName: string;
  licenseNumber: string;
  rating: number;
  reviewCount: number;
  plan: "free" | "standard" | "premium";
  specialties: string[];
  deliveryDays: number;
  minOrderTotal: number;
  productsCount: number;
  medicines: WarehouseMed[];
  social?: WarehouseSocialLinks;
}

export const WAREHOUSE_CITIES = [
  "الكل", "هەولێر", "سلێمانی", "دهۆک", "کەرکووک", "موصل", "بغداد", "زاخۆ",
];

export const WAREHOUSE_MARKET: WarehouseMarket[] = [
  {
    id: "wh1",
    name: "كۆگای داوا — هەولێر",
    city: "هەولێر",
    district: "شارستانی نوێ",
    phone: "+9647501100001",
    whatsapp: "9647501100001",
    ownerName: "كارزان عبدالله",
    licenseNumber: "WH-2021-001",
    rating: 4.8,
    reviewCount: 124,
    plan: "premium",
    specialties: ["مضادات حيوية", "قلب وأوعية", "سكري"],
    deliveryDays: 1,
    minOrderTotal: 200000,
    productsCount: 1840,
    medicines: [
      { id: "m1", name: "أموكسيسيلين 500mg", brand: "Augmentin", category: "مضادات حيوية", form: "كبسولات", unitPrice: 7500, minOrder: 10, stock: 480, requiresPrescription: true },
      { id: "m2", name: "أتورفاستاتين 20mg", brand: "Lipitor", category: "قلب وأوعية", form: "أقراص", unitPrice: 12000, minOrder: 5, stock: 310, requiresPrescription: true },
      { id: "m3", name: "ميتفورمين 850mg", brand: "Glucophage", category: "سكري", form: "أقراص", unitPrice: 6500, minOrder: 10, stock: 520, requiresPrescription: true },
      { id: "m4", name: "أوميبرازول 20mg", brand: "Losec", category: "جهاز هضمي", form: "كبسولات", unitPrice: 8000, minOrder: 5, stock: 400, requiresPrescription: false },
      { id: "m5", name: "سيتريزين 10mg", brand: "Zyrtec", category: "حساسية", form: "أقراص", unitPrice: 4500, minOrder: 10, stock: 650, requiresPrescription: false },
      { id: "m6", name: "بنادول 500mg", brand: "Panadol", category: "مسكنات", form: "أقراص", unitPrice: 3200, minOrder: 20, stock: 900, requiresPrescription: false },
    ],
    social: { facebook: "kogaydawa", instagram: "kogaydawa", tiktok: "kogaydawa", website: "kogaydawa.iq" },
  },
  {
    id: "wh2",
    name: "كۆگای باشووری — سلێمانی",
    city: "سلێمانی",
    district: "ئازادی",
    phone: "+9647701200002",
    whatsapp: "9647701200002",
    ownerName: "هاوار طاهر",
    licenseNumber: "WH-2020-015",
    rating: 4.6,
    reviewCount: 89,
    plan: "premium",
    specialties: ["أطفال", "نساء وولادة", "فيتامينات"],
    deliveryDays: 2,
    minOrderTotal: 150000,
    productsCount: 1420,
    medicines: [
      { id: "m7", name: "أموكسيل شراب 250mg/5ml", brand: "Amoxil", category: "أطفال", form: "شراب", unitPrice: 9000, minOrder: 6, stock: 280, requiresPrescription: true },
      { id: "m8", name: "نوروفين للأطفال 100mg/5ml", brand: "Nurofen", category: "أطفال", form: "شراب", unitPrice: 7000, minOrder: 6, stock: 350, requiresPrescription: false },
      { id: "m9", name: "فيتامين D3 1000IU", brand: "D-Pearls", category: "فيتامينات", form: "كبسولات هلامية", unitPrice: 14000, minOrder: 4, stock: 200, requiresPrescription: false },
      { id: "m10", name: "حمض الفوليك 5mg", brand: "Folic Acid", category: "نساء وولادة", form: "أقراص", unitPrice: 3500, minOrder: 10, stock: 450, requiresPrescription: false },
      { id: "m11", name: "كالسيوم + فيتامين D", brand: "Sandocal", category: "فيتامينات", form: "أقراص فوارة", unitPrice: 11000, minOrder: 5, stock: 180, requiresPrescription: false },
    ],
  },
  {
    id: "wh3",
    name: "كۆگای ئازادی — دهۆک",
    city: "دهۆک",
    district: "ناوچەی سینا",
    phone: "+9647501300003",
    whatsapp: "9647501300003",
    ownerName: "ديلنيا براني",
    licenseNumber: "WH-2022-008",
    rating: 4.5,
    reviewCount: 67,
    plan: "standard",
    specialties: ["جهاز هضمي", "تنفس", "جلدية"],
    deliveryDays: 2,
    minOrderTotal: 100000,
    productsCount: 890,
    medicines: [
      { id: "m12", name: "لانسوبرازول 30mg", brand: "Lansoprazole", category: "جهاز هضمي", form: "كبسولات", unitPrice: 9500, minOrder: 5, stock: 320, requiresPrescription: true },
      { id: "m13", name: "سالبوتامول بخاخ", brand: "Ventolin", category: "تنفس", form: "بخاخ", unitPrice: 15000, minOrder: 3, stock: 140, requiresPrescription: true },
      { id: "m14", name: "لوراتادين 10mg", brand: "Clarityn", category: "حساسية", form: "أقراص", unitPrice: 5000, minOrder: 10, stock: 380, requiresPrescription: false },
      { id: "m15", name: "بيتاميثازون كريم 0.1%", brand: "Betnovate", category: "جلدية", form: "كريم", unitPrice: 8500, minOrder: 5, stock: 220, requiresPrescription: true },
    ],
  },
  {
    id: "wh4",
    name: "كۆگای ژیان — کەرکووک",
    city: "کەرکووک",
    district: "ناوچەی شۆرش",
    phone: "+9647801400004",
    whatsapp: "9647801400004",
    ownerName: "سرحان إبراهيم",
    licenseNumber: "WH-2023-031",
    rating: 4.3,
    reviewCount: 41,
    plan: "standard",
    specialties: ["مسكنات", "ضغط دم", "أعصاب"],
    deliveryDays: 3,
    minOrderTotal: 120000,
    productsCount: 680,
    medicines: [
      { id: "m16", name: "إيبوبروفين 400mg", brand: "Brufen", category: "مسكنات", form: "أقراص", unitPrice: 4000, minOrder: 10, stock: 600, requiresPrescription: false },
      { id: "m17", name: "أملوديبين 5mg", brand: "Norvasc", category: "ضغط دم", form: "أقراص", unitPrice: 10500, minOrder: 5, stock: 280, requiresPrescription: true },
      { id: "m18", name: "أمتريبتيلين 25mg", brand: "Tryptanol", category: "أعصاب", form: "أقراص", unitPrice: 7000, minOrder: 5, stock: 150, requiresPrescription: true },
      { id: "m19", name: "ليفوثيروكسين 100mcg", brand: "Eltroxin", category: "غدد", form: "أقراص", unitPrice: 8000, minOrder: 5, stock: 200, requiresPrescription: true },
    ],
  },
  {
    id: "wh5",
    name: "كۆگای ئارام — زاخۆ",
    city: "زاخۆ",
    district: "مركز المدينة",
    phone: "+9647501500005",
    whatsapp: "9647501500005",
    ownerName: "جاسم أحمد",
    licenseNumber: "WH-2023-044",
    rating: 4.2,
    reviewCount: 28,
    plan: "free",
    specialties: ["مضادات حيوية", "مسكنات", "فيتامينات"],
    deliveryDays: 3,
    minOrderTotal: 80000,
    productsCount: 340,
    medicines: [
      { id: "m20", name: "كلاريثروميسين 500mg", brand: "Klacid", category: "مضادات حيوية", form: "أقراص", unitPrice: 13000, minOrder: 5, stock: 180, requiresPrescription: true },
      { id: "m21", name: "باراسيتامول 1g", brand: "Panadol Extra", category: "مسكنات", form: "أقراص", unitPrice: 4500, minOrder: 10, stock: 400, requiresPrescription: false },
      { id: "m22", name: "فيتامين C 1000mg", brand: "Redoxon", category: "فيتامينات", form: "أقراص فوارة", unitPrice: 9000, minOrder: 5, stock: 220, requiresPrescription: false },
    ],
  },
];

export function getPlanColor(plan: string): string {
  if (plan === "premium") return "#7C3AED";
  if (plan === "standard") return "#0D7A54";
  return "#6B7280";
}

export function getPlanLabel(plan: string): string {
  if (plan === "premium") return "مميز ⭐";
  if (plan === "standard") return "أساسي";
  return "مجاني";
}

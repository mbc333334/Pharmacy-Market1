export interface RawkadMedicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  expiryDate: string;
  daysLeft: number;
  barcode?: string;
  requiresPrescription: boolean;
  pharmacyId: string;
  pharmacyName: string;
  ownerName: string;
  city: string;
  district: string;
  whatsapp: string;
  color: string;
  notes?: string;
}

const today = new Date();
function daysFromNow(days: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("ar-IQ", { year: "numeric", month: "long", day: "numeric" });
}

export const RAWAKID_CITIES = [
  "الكل", "هەولێر", "سلێمانی", "دهۆک", "کەرکووک",
  "موصل", "بغداد", "بصرة", "نجف", "کربلاء", "زاخۆ",
];

export const RAWAKID: RawkadMedicine[] = [
  {
    id: "r1",
    name: "أموكسيسيللين 500mg",
    brand: "Augmentin",
    category: "مضادات حيوية",
    quantity: 240,
    originalPrice: 8500,
    discountedPrice: 3400,
    discountPercent: 60,
    expiryDate: daysFromNow(38),
    daysLeft: 38,
    barcode: "6914921018875",
    requiresPrescription: true,
    pharmacyId: "ph1",
    pharmacyName: "صيدلية النخيل",
    ownerName: "أحمد محمود",
    city: "أربيل",
    district: "عنكاوا",
    whatsapp: "9647501234567",
    color: "#805AD5",
    notes: "علب كاملة، مخزّنة بشكل صحيح",
  },
  {
    id: "r2",
    name: "أتورفاستاتين 20mg",
    brand: "Lipitor",
    category: "أدوية قلب",
    quantity: 180,
    originalPrice: 22000,
    discountedPrice: 9000,
    discountPercent: 59,
    expiryDate: daysFromNow(55),
    daysLeft: 55,
    requiresPrescription: true,
    pharmacyId: "ph2",
    pharmacyName: "صيدلية الشفاء",
    ownerName: "سامر علي",
    city: "كركوك",
    district: "الساعة",
    whatsapp: "9647701234568",
    color: "#E53E3E",
    notes: "دفعة واحدة، لا تفريق",
  },
  {
    id: "r3",
    name: "باراسيتامول 500mg",
    brand: "Panadol",
    category: "مسكنات",
    quantity: 600,
    originalPrice: 1200,
    discountedPrice: 350,
    discountPercent: 71,
    expiryDate: daysFromNow(70),
    daysLeft: 70,
    barcode: "6281012345678",
    requiresPrescription: false,
    pharmacyId: "ph3",
    pharmacyName: "صيدلية الأمل",
    ownerName: "لانا كريم",
    city: "أربيل",
    district: "عينكاوا الجديدة",
    whatsapp: "9647601234569",
    color: "#E53E3E",
    notes: "قابل للتفريق من 100 علبة",
  },
  {
    id: "r4",
    name: "ميتفورمين 1000mg",
    brand: "Glucophage",
    category: "منظم سكر",
    quantity: 300,
    originalPrice: 5500,
    discountedPrice: 2000,
    discountPercent: 64,
    expiryDate: daysFromNow(85),
    daysLeft: 85,
    requiresPrescription: true,
    pharmacyId: "ph4",
    pharmacyName: "صيدلية ابن سينا",
    ownerName: "كاوه رشيد",
    city: "السليمانية",
    district: "بازار",
    whatsapp: "9647801234570",
    color: "#3182CE",
  },
  {
    id: "r5",
    name: "سيتريزين 10mg",
    brand: "Zyrtec",
    category: "مضادات حساسية",
    quantity: 480,
    originalPrice: 3200,
    discountedPrice: 900,
    discountPercent: 72,
    expiryDate: daysFromNow(95),
    daysLeft: 95,
    barcode: "5900000123456",
    requiresPrescription: false,
    pharmacyId: "ph5",
    pharmacyName: "صيدلية الحياة",
    ownerName: "هيمن صالح",
    city: "أربيل",
    district: "كاوربان",
    whatsapp: "9647501234571",
    color: "#38A169",
    notes: "مناسب جداً لموسم الربيع",
  },
  {
    id: "r6",
    name: "أومبيرازول 20mg",
    brand: "Losec",
    category: "أدوية هضم",
    quantity: 360,
    originalPrice: 4800,
    discountedPrice: 1600,
    discountPercent: 67,
    expiryDate: daysFromNow(105),
    daysLeft: 105,
    requiresPrescription: false,
    pharmacyId: "ph6",
    pharmacyName: "صيدلية الرافدين",
    ownerName: "محمد جاسم",
    city: "الموصل",
    district: "المنصور",
    whatsapp: "9647401234572",
    color: "#ED8936",
  },
  {
    id: "r7",
    name: "فيتامين D3 5000IU",
    brand: "Nature's Best",
    category: "فيتامينات",
    quantity: 200,
    originalPrice: 9500,
    discountedPrice: 3800,
    discountPercent: 60,
    expiryDate: daysFromNow(110),
    daysLeft: 110,
    barcode: "4002197119427",
    requiresPrescription: false,
    pharmacyId: "ph7",
    pharmacyName: "صيدلية الصحة",
    ownerName: "دلشاد عمر",
    city: "كركوك",
    district: "الحميدية",
    whatsapp: "9647701234573",
    color: "#D69E2E",
    notes: "مستورد من المانيا، مخزّن بالبرّاد",
  },
  {
    id: "r8",
    name: "سلبوتامول 100mcg بخاخ",
    brand: "Ventolin",
    category: "أدوية تنفسية",
    quantity: 150,
    originalPrice: 7200,
    discountedPrice: 2800,
    discountPercent: 61,
    expiryDate: daysFromNow(115),
    daysLeft: 115,
    requiresPrescription: true,
    pharmacyId: "ph8",
    pharmacyName: "صيدلية البدر",
    ownerName: "أيمن طارق",
    city: "بغداد",
    district: "الكاظمية",
    whatsapp: "9647901234574",
    color: "#38A169",
  },
];

export function getDaysColor(days: number): string {
  if (days <= 45) return "#E53E3E";
  if (days <= 75) return "#DD6B20";
  return "#D69E2E";
}

export function getDaysLabel(days: number): string {
  if (days <= 30) return "حرج";
  if (days <= 60) return "عاجل";
  if (days <= 90) return "قريب";
  return "مقبول";
}

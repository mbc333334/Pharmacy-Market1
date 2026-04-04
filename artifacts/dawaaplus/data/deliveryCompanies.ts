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
}

export const ALL_DELIVERY_COMPANIES: DeliveryCompany[] = [
  {
    id: "dc1",
    name: "بوستا",
    nameEn: "Bosta",
    logo: "🚀",
    type: "express",
    baseFee: 3500,
    perKmFee: 200,
    estimatedTime: "نفس اليوم",
    cities: ["هەولێر", "سلێمانی", "دهوك", "كركوك", "بغداد"],
    phone: "+964 750 100 1001",
    whatsapp: "9647501001001",
    trackingUrl: "https://bosta.co",
    features: ["تتبع لحظي", "إشعارات SMS", "التقاط من الصيدلية", "صورة تسليم"],
    isActive: true,
    isDefault: true,
    color: "#7C3AED",
  },
  {
    id: "dc2",
    name: "فرسة",
    nameEn: "Farasa",
    logo: "⚡",
    type: "express",
    baseFee: 2500,
    perKmFee: 150,
    estimatedTime: "30-60 دقيقة",
    cities: ["هەولێر", "سلێمانی"],
    phone: "+964 770 200 2002",
    whatsapp: "9647702002002",
    features: ["توصيل سريع", "تتبع GPS", "دفع COD"],
    isActive: true,
    isDefault: false,
    color: "#F59E0B",
  },
  {
    id: "dc3",
    name: "أرامكس",
    nameEn: "Aramex",
    logo: "📦",
    type: "national",
    baseFee: 5000,
    perKmFee: 300,
    estimatedTime: "1-2 يوم عمل",
    cities: ["هەولێر", "سلێمانی", "دهوك", "كركوك", "موصل", "بغداد", "بصرة"],
    phone: "+964 750 300 3003",
    whatsapp: "9647503003003",
    trackingUrl: "https://aramex.com",
    features: ["تغطية واسعة", "تأمين على البضاعة", "إثبات التسليم", "دفع COD"],
    isActive: false,
    isDefault: false,
    color: "#E53E3E",
  },
  {
    id: "dc4",
    name: "ديليفري كورد",
    nameEn: "Delivery Kurd",
    logo: "🏍️",
    type: "local",
    baseFee: 2000,
    perKmFee: 100,
    estimatedTime: "1-3 ساعات",
    cities: ["هەولێر", "دهوك"],
    phone: "+964 750 400 4004",
    whatsapp: "9647504004004",
    features: ["أسعار مناسبة", "سائقون محليون", "دفع COD", "تسليم مرن"],
    isActive: true,
    isDefault: false,
    color: "#0D7A54",
  },
  {
    id: "dc5",
    name: "سوليمانية إكسبرس",
    nameEn: "Sulaymaniyah Express",
    logo: "🏢",
    type: "local",
    baseFee: 2200,
    perKmFee: 120,
    estimatedTime: "2-4 ساعات",
    cities: ["سلێمانی", "كركوك"],
    phone: "+964 770 500 5005",
    whatsapp: "9647705005005",
    features: ["خدمة محلية", "سائقون معتمدون", "إشعار تسليم"],
    isActive: false,
    isDefault: false,
    color: "#2563EB",
  },
];

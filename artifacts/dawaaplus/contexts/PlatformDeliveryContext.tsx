import React, { createContext, useContext, useState, useCallback } from "react";

export type DeliveryStatus = "pending" | "approved" | "suspended";
export type PaymentStatus = "pending" | "paid" | "overdue";

export interface PlatformDeliveryCompany {
  id: string;
  name: string;
  nameEn: string;
  phone: string;
  email: string;
  ownerName: string;
  cities: string[];
  vehicleTypes: string[];
  registrationDate: string;
  status: DeliveryStatus;
  rating: number;
  ratingCount: number;
  totalDeliveries: number;
  activePharmacies: number;
  activeWarehouses: number;
  monthlyFee: number;
  paymentStatus: PaymentStatus;
  lastPayment?: string;
  notes?: string;
  logo?: string;
}

export interface FinancialTransaction {
  id: string;
  type: "subscription" | "delivery_fee" | "ad_fee" | "refund";
  entityId: string;
  entityName: string;
  entityType: "pharmacy" | "warehouse" | "delivery_company";
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  description: string;
}

interface PlatformDeliveryContextValue {
  deliveryCompanies: PlatformDeliveryCompany[];
  transactions: FinancialTransaction[];
  approveCompany: (id: string) => void;
  suspendCompany: (id: string, reason?: string) => void;
  updateCompanyNotes: (id: string, notes: string) => void;
  addTransaction: (tx: Omit<FinancialTransaction, "id">) => void;
  getPendingCount: () => number;
  getTotalRevenue: () => number;
  getMonthlyRevenue: () => number;
}

const PlatformDeliveryContext = createContext<PlatformDeliveryContextValue | null>(null);

const INITIAL_COMPANIES: PlatformDeliveryCompany[] = [
  {
    id: "dc1", name: "شركة البريد السريع الكردستاني", nameEn: "Kurdistan Express", phone: "+9647501234567",
    email: "info@kurdexpress.iq", ownerName: "سامان كاوه", cities: ["أربيل", "السليمانية", "دهوك"],
    vehicleTypes: ["دراجة نارية", "سيارة"], registrationDate: "2025-10-15", status: "approved",
    rating: 4.7, ratingCount: 142, totalDeliveries: 1280, activePharmacies: 18, activeWarehouses: 5,
    monthlyFee: 75000, paymentStatus: "paid", lastPayment: "2026-04-01",
  },
  {
    id: "dc2", name: "توصيل نينوى السريع", nameEn: "Nineveh Fast Delivery", phone: "+9647701112233",
    email: "contact@ninfast.iq", ownerName: "يوسف بطرس", cities: ["الموصل", "تلعفر"],
    vehicleTypes: ["دراجة نارية"], registrationDate: "2025-11-22", status: "approved",
    rating: 4.2, ratingCount: 87, totalDeliveries: 610, activePharmacies: 9, activeWarehouses: 2,
    monthlyFee: 50000, paymentStatus: "paid", lastPayment: "2026-04-01",
  },
  {
    id: "dc3", name: "شركة الرافدين للتوصيل", nameEn: "Rafidain Delivery", phone: "+9647809876543",
    email: "rafidain@delivery.iq", ownerName: "محمد علي", cities: ["بغداد", "كربلاء", "النجف"],
    vehicleTypes: ["سيارة", "دراجة نارية"], registrationDate: "2026-01-08", status: "pending",
    rating: 0, ratingCount: 0, totalDeliveries: 0, activePharmacies: 0, activeWarehouses: 0,
    monthlyFee: 50000, paymentStatus: "pending",
  },
  {
    id: "dc4", name: "خدمة كركوك للتوصيل", nameEn: "Kirkuk Delivery Service", phone: "+9647601122334",
    email: "kds@mail.iq", ownerName: "بختيار حسين", cities: ["كركوك"],
    vehicleTypes: ["دراجة نارية"], registrationDate: "2026-02-15", status: "pending",
    rating: 0, ratingCount: 0, totalDeliveries: 0, activePharmacies: 0, activeWarehouses: 0,
    monthlyFee: 35000, paymentStatus: "pending",
  },
  {
    id: "dc5", name: "شركة الوفاء للشحن", nameEn: "Al-Wafaa Shipping", phone: "+9647400887766",
    email: "wafaa@ship.iq", ownerName: "عقيل جاسم", cities: ["البصرة", "الناصرية"],
    vehicleTypes: ["شاحنة صغيرة", "سيارة"], registrationDate: "2025-09-03", status: "suspended",
    rating: 3.1, ratingCount: 45, totalDeliveries: 230, activePharmacies: 0, activeWarehouses: 0,
    monthlyFee: 50000, paymentStatus: "overdue", notes: "تأخير متكرر في التسليم وشكاوى من الصيادلة",
  },
];

const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  { id: "tx1", type: "subscription", entityId: "ph1", entityName: "دەرمانخانەی شیفا", entityType: "pharmacy", amount: 75000, date: "2026-04-01", status: "completed", description: "اشتراك شهري — الباقة المميزة" },
  { id: "tx2", type: "subscription", entityId: "wh1", entityName: "كۆگای باشووری", entityType: "warehouse", amount: 120000, date: "2026-04-01", status: "completed", description: "اشتراك شهري — باقة المذخر المميزة" },
  { id: "tx3", type: "delivery_fee", entityId: "dc1", entityName: "شركة البريد السريع الكردستاني", entityType: "delivery_company", amount: 75000, date: "2026-04-01", status: "completed", description: "رسوم اشتراك شركة توصيل — أبريل 2026" },
  { id: "tx4", type: "ad_fee", entityId: "ph2", entityName: "صيدلية الأمين", entityType: "pharmacy", amount: 30000, date: "2026-03-28", status: "completed", description: "رسوم إعلان شهر أبريل" },
  { id: "tx5", type: "subscription", entityId: "ph3", entityName: "دەرمانخانەی نوێ", entityType: "pharmacy", amount: 25000, date: "2026-03-25", status: "completed", description: "اشتراك شهري — الباقة الأساسية" },
  { id: "tx6", type: "delivery_fee", entityId: "dc2", entityName: "توصيل نينوى السريع", entityType: "delivery_company", amount: 50000, date: "2026-04-01", status: "completed", description: "رسوم اشتراك شركة توصيل — أبريل 2026" },
  { id: "tx7", type: "subscription", entityId: "wh2", entityName: "مذخر الشمال", entityType: "warehouse", amount: 50000, date: "2026-03-20", status: "pending", description: "اشتراك شهري — باقة المذخر الأساسية" },
  { id: "tx8", type: "delivery_fee", entityId: "dc5", entityName: "شركة الوفاء للشحن", entityType: "delivery_company", amount: 50000, date: "2026-03-01", status: "failed", description: "رسوم اشتراك — مارس 2026 (متأخر)" },
];

export function PlatformDeliveryProvider({ children }: { children: React.ReactNode }) {
  const [deliveryCompanies, setDeliveryCompanies] = useState<PlatformDeliveryCompany[]>(INITIAL_COMPANIES);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);

  const approveCompany = useCallback((id: string) => {
    setDeliveryCompanies(prev => prev.map(c =>
      c.id === id ? { ...c, status: "approved" as DeliveryStatus } : c
    ));
  }, []);

  const suspendCompany = useCallback((id: string, reason?: string) => {
    setDeliveryCompanies(prev => prev.map(c =>
      c.id === id ? { ...c, status: "suspended" as DeliveryStatus, notes: reason ?? c.notes } : c
    ));
  }, []);

  const updateCompanyNotes = useCallback((id: string, notes: string) => {
    setDeliveryCompanies(prev => prev.map(c =>
      c.id === id ? { ...c, notes } : c
    ));
  }, []);

  const addTransaction = useCallback((tx: Omit<FinancialTransaction, "id">) => {
    setTransactions(prev => [{ ...tx, id: `tx-${Date.now()}` }, ...prev]);
  }, []);

  const getPendingCount = useCallback(() =>
    deliveryCompanies.filter(c => c.status === "pending").length,
    [deliveryCompanies]
  );

  const getTotalRevenue = useCallback(() =>
    transactions.filter(t => t.status === "completed").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const getMonthlyRevenue = useCallback(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    return transactions.filter(t => t.status === "completed" && t.date.startsWith(thisMonth))
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  return (
    <PlatformDeliveryContext.Provider value={{
      deliveryCompanies, transactions,
      approveCompany, suspendCompany, updateCompanyNotes, addTransaction,
      getPendingCount, getTotalRevenue, getMonthlyRevenue,
    }}>
      {children}
    </PlatformDeliveryContext.Provider>
  );
}

export function usePlatformDelivery() {
  const ctx = useContext(PlatformDeliveryContext);
  if (!ctx) throw new Error("usePlatformDelivery must be used within PlatformDeliveryProvider");
  return ctx;
}

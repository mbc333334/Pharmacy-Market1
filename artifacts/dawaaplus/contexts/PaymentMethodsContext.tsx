import React, { createContext, useContext, useState, useCallback } from "react";
import { PaymentMethod } from "@/contexts/OrdersContext";

export interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  labelEn: string;
  icon: string;
  color: string;
  bg: string;
  category: "cash" | "card" | "wallet" | "social";
  enabled: boolean;
  description: string;
  accountNumber: string;
  accountPlaceholder: string;
  showAccount: boolean;
}

const DEFAULT_METHODS: PaymentMethodConfig[] = [
  {
    id: "cod",
    label: "الدفع عند الاستلام",
    labelEn: "Cash on Delivery",
    icon: "cash-outline",
    color: "#0D7A54",
    bg: "#EDFBF4",
    category: "cash",
    enabled: true,
    description: "ادفع نقداً عند استلام طلبك",
    accountNumber: "",
    accountPlaceholder: "لا يوجد حساب — الدفع عند الاستلام",
    showAccount: false,
  },
  {
    id: "card",
    label: "بطاقة مصرفية",
    labelEn: "Bank Card",
    icon: "card-outline",
    color: "#1A9E6E",
    bg: "#EDFBF4",
    category: "card",
    enabled: true,
    description: "Visa · Mastercard · FIB Card",
    accountNumber: "",
    accountPlaceholder: "IBAN أو رقم الحساب المصرفي",
    showAccount: true,
  },
  {
    id: "zaincash",
    label: "زين كاش",
    labelEn: "ZainCash",
    icon: "wallet-outline",
    color: "#E30613",
    bg: "#FFF0F0",
    category: "wallet",
    enabled: true,
    description: "محفظة زين كاش الإلكترونية",
    accountNumber: "",
    accountPlaceholder: "07XX XXX XXXX (زين كاش)",
    showAccount: true,
  },
  {
    id: "fastpay",
    label: "فاست باي",
    labelEn: "FastPay",
    icon: "flash-outline",
    color: "#0057A8",
    bg: "#EEF4FF",
    category: "wallet",
    enabled: true,
    description: "محفظة فاست باي",
    accountNumber: "",
    accountPlaceholder: "07XX XXX XXXX (فاست باي)",
    showAccount: true,
  },
  {
    id: "asiahawala",
    label: "آسيا حوالة",
    labelEn: "Asia Hawala",
    icon: "phone-portrait-outline",
    color: "#009E4F",
    bg: "#EFFFEC",
    category: "wallet",
    enabled: true,
    description: "حوالة آسيا سيل",
    accountNumber: "",
    accountPlaceholder: "07XX XXX XXXX (آسيا سيل)",
    showAccount: true,
  },
  {
    id: "qicard",
    label: "كارت كي",
    labelEn: "Qi Card",
    icon: "id-card-outline",
    color: "#FF6900",
    bg: "#FFF3E8",
    category: "wallet",
    enabled: true,
    description: "بطاقة كي العراقية",
    accountNumber: "",
    accountPlaceholder: "رقم بطاقة كي (16 رقم)",
    showAccount: true,
  },
  {
    id: "nasswallet",
    label: "ناس ولت",
    labelEn: "NassWallet",
    icon: "people-outline",
    color: "#5B2D8E",
    bg: "#F4EDFF",
    category: "wallet",
    enabled: false,
    description: "محفظة ناس الإلكترونية",
    accountNumber: "",
    accountPlaceholder: "07XX XXX XXXX (ناس ولت)",
    showAccount: true,
  },
  {
    id: "tabadul",
    label: "تبادل",
    labelEn: "Tabadul",
    icon: "swap-horizontal-outline",
    color: "#007AB8",
    bg: "#EAF5FF",
    category: "wallet",
    enabled: false,
    description: "منصة تبادل المالية",
    accountNumber: "",
    accountPlaceholder: "رقم حساب تبادل",
    showAccount: true,
  },
  {
    id: "mahali",
    label: "محلي",
    labelEn: "Mahali",
    icon: "location-outline",
    color: "#1A9E6E",
    bg: "#EDFBF4",
    category: "wallet",
    enabled: false,
    description: "محفظة محلي — إقليم كردستان",
    accountNumber: "",
    accountPlaceholder: "07XX XXX XXXX (محلي)",
    showAccount: true,
  },
  {
    id: "fib",
    label: "FIB",
    labelEn: "First Iraqi Bank",
    icon: "business-outline",
    color: "#D4A017",
    bg: "#FFF9E6",
    category: "wallet",
    enabled: true,
    description: "فرست إيراقي بنك",
    accountNumber: "",
    accountPlaceholder: "رقم حساب FIB أو IBAN",
    showAccount: true,
  },
  {
    id: "whatsapp",
    label: "واتساب",
    labelEn: "WhatsApp",
    icon: "logo-whatsapp",
    color: "#25D366",
    bg: "#E8F5E9",
    category: "social",
    enabled: true,
    description: "تواصل مع الصيدلية عبر واتساب",
    accountNumber: "",
    accountPlaceholder: "رقم واتساب (+964 7XX XXX XXXX)",
    showAccount: true,
  },
];

interface PaymentMethodsContextType {
  methods: PaymentMethodConfig[];
  enabledMethods: PaymentMethodConfig[];
  toggleMethod: (id: PaymentMethod) => void;
  setEnabled: (id: PaymentMethod, enabled: boolean) => void;
  isEnabled: (id: PaymentMethod) => boolean;
  getMethod: (id: PaymentMethod) => PaymentMethodConfig | undefined;
  setAccountNumber: (id: PaymentMethod, account: string) => void;
  enabledCount: number;
}

const PaymentMethodsContext = createContext<PaymentMethodsContextType | null>(null);

export function PaymentMethodsProvider({ children }: { children: React.ReactNode }) {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>(DEFAULT_METHODS);

  const toggleMethod = useCallback((id: PaymentMethod) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  }, []);

  const setEnabled = useCallback((id: PaymentMethod, enabled: boolean) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled } : m));
  }, []);

  const isEnabled = useCallback((id: PaymentMethod) => {
    return methods.find(m => m.id === id)?.enabled ?? false;
  }, [methods]);

  const getMethod = useCallback((id: PaymentMethod) => {
    return methods.find(m => m.id === id);
  }, [methods]);

  const setAccountNumber = useCallback((id: PaymentMethod, account: string) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, accountNumber: account } : m));
  }, []);

  const enabledMethods = methods.filter(m => m.enabled);
  const enabledCount = enabledMethods.length;

  return (
    <PaymentMethodsContext.Provider value={{
      methods,
      enabledMethods,
      toggleMethod,
      setEnabled,
      isEnabled,
      getMethod,
      setAccountNumber,
      enabledCount,
    }}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods() {
  const ctx = useContext(PaymentMethodsContext);
  if (!ctx) throw new Error("usePaymentMethods must be used within PaymentMethodsProvider");
  return ctx;
}

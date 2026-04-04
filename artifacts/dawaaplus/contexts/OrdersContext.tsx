import React, { createContext, useContext, useState, useCallback } from "react";

export type PaymentMethod = "cod" | "card" | "whatsapp";
export type OrderStatus = "new" | "processing" | "shipped" | "completed" | "cancelled";

export interface OrderItem {
  medicineId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CustomerOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  pharmacyId: string;
  pharmacyName: string;
  items: OrderItem[];
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  address: string;
  city: string;
  notes?: string;
  deliveryCompanyId?: string;
  deliveryCompanyName?: string;
  trackingCode?: string;
  createdAt: string;
  updatedAt: string;
}

export type WarehouseOrderStatus = "new" | "processing" | "shipped" | "completed" | "cancelled";

export interface WarehouseOrderItem {
  medicineId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface WarehouseOrder {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyCity: string;
  pharmacyPhone: string;
  warehouseId: string;
  warehouseName: string;
  items: WarehouseOrderItem[];
  total: number;
  status: WarehouseOrderStatus;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const INITIAL_CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: "ORD-2024-089",
    customerId: "c1",
    customerName: "أحمد محمد",
    customerPhone: "+964 750 111 2233",
    pharmacyId: "p1",
    pharmacyName: "دەرمانخانەی شیفا",
    items: [
      { medicineId: "1", name: "باراسيتامول 500mg", quantity: 2, price: 12500 },
      { medicineId: "6", name: "فيتامين ج 1000mg", quantity: 1, price: 38000 },
    ],
    total: 63000,
    deliveryFee: 3500,
    status: "new",
    paymentMethod: "cod",
    isPaid: false,
    address: "شەقامی ١٠٠ مەتری، ناوچەی عەزیزی",
    city: "هەولێر",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "ORD-2024-088",
    customerId: "c2",
    customerName: "سارة علي",
    customerPhone: "+964 770 222 3344",
    pharmacyId: "p1",
    pharmacyName: "دەرمانخانەی شیفا",
    items: [
      { medicineId: "2", name: "فيتامين د3", quantity: 1, price: 45000 },
    ],
    total: 45000,
    deliveryFee: 3500,
    status: "processing",
    paymentMethod: "card",
    isPaid: true,
    address: "ناوەندی شار، كۆشكی نوێ",
    city: "سلێمانی",
    deliveryCompanyId: "dc1",
    deliveryCompanyName: "بوستا",
    trackingCode: "BST-98712",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: "ORD-2024-087",
    customerId: "c3",
    customerName: "خالد العمري",
    customerPhone: "+964 750 333 4455",
    pharmacyId: "p1",
    pharmacyName: "دەرمانخانەی شیفا",
    items: [
      { medicineId: "8", name: "كريم نيفيا", quantity: 2, price: 28500 },
    ],
    total: 57000,
    deliveryFee: 2500,
    status: "completed",
    paymentMethod: "whatsapp",
    isPaid: true,
    address: "شەقامی مەین، نزیك بانكی رشید",
    city: "دهۆک",
    deliveryCompanyId: "dc2",
    deliveryCompanyName: "فرسة",
    trackingCode: "FRS-55291",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

const INITIAL_WAREHOUSE_ORDERS: WarehouseOrder[] = [
  {
    id: "WO-001",
    pharmacyId: "p1",
    pharmacyName: "دەرمانخانەی شیفا",
    pharmacyCity: "هەولێر",
    pharmacyPhone: "+964 750 111 0001",
    warehouseId: "w1",
    warehouseName: "مذخر الشفاء المركزي",
    items: [
      { medicineId: "m1", name: "أسبرين 100mg", quantity: 100, price: 2500 },
      { medicineId: "m2", name: "باراسيتامول 500mg", quantity: 200, price: 1500 },
    ],
    total: 550000,
    status: "new",
    paymentMethod: "cod",
    isPaid: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "WO-002",
    pharmacyId: "p2",
    pharmacyName: "دەرمانخانەی ئارام",
    pharmacyCity: "سلێمانی",
    pharmacyPhone: "+964 770 222 0002",
    warehouseId: "w1",
    warehouseName: "مذخر الشفاء المركزي",
    items: [
      { medicineId: "m3", name: "أموكسيسيلين 500mg", quantity: 50, price: 8000 },
    ],
    total: 400000,
    status: "processing",
    paymentMethod: "card",
    isPaid: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 5000000).toISOString(),
  },
  {
    id: "WO-003",
    pharmacyId: "p3",
    pharmacyName: "دەرمانخانەی نوێ",
    pharmacyCity: "دهۆک",
    pharmacyPhone: "+964 750 333 0003",
    warehouseId: "w1",
    warehouseName: "مذخر الشفاء المركزي",
    items: [
      { medicineId: "m4", name: "أوميبرازول 20mg", quantity: 80, price: 5000 },
      { medicineId: "m5", name: "إيبوبروفين 400mg", quantity: 120, price: 3000 },
    ],
    total: 760000,
    status: "completed",
    paymentMethod: "cod",
    isPaid: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "WO-004",
    pharmacyId: "p1",
    pharmacyName: "دەرمانخانەی شیفا",
    pharmacyCity: "هەولێر",
    pharmacyPhone: "+964 750 111 0001",
    warehouseId: "w1",
    warehouseName: "مذخر الشفاء المركزي",
    items: [
      { medicineId: "m6", name: "ميتفورمين 500mg", quantity: 60, price: 4500 },
    ],
    total: 270000,
    status: "new",
    paymentMethod: "whatsapp",
    isPaid: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

interface OrdersContextType {
  customerOrders: CustomerOrder[];
  warehouseOrders: WarehouseOrder[];
  placeCustomerOrder: (order: Omit<CustomerOrder, "id" | "createdAt" | "updatedAt">) => CustomerOrder;
  placeWarehouseOrder: (order: Omit<WarehouseOrder, "id" | "createdAt" | "updatedAt">) => WarehouseOrder;
  updateCustomerOrderStatus: (orderId: string, status: OrderStatus, extra?: Partial<CustomerOrder>) => void;
  updateWarehouseOrderStatus: (orderId: string, status: WarehouseOrderStatus) => void;
  assignDelivery: (orderId: string, companyId: string, companyName: string, trackingCode?: string) => void;
  getPharmacyOrders: (pharmacyId: string) => CustomerOrder[];
  getWarehouseIncomingOrders: (warehouseId: string) => WarehouseOrder[];
  getCustomerOrders: (customerId: string) => CustomerOrder[];
}

const OrdersContext = createContext<OrdersContextType | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>(INITIAL_CUSTOMER_ORDERS);
  const [warehouseOrders, setWarehouseOrders] = useState<WarehouseOrder[]>(INITIAL_WAREHOUSE_ORDERS);

  const placeCustomerOrder = useCallback((order: Omit<CustomerOrder, "id" | "createdAt" | "updatedAt">): CustomerOrder => {
    const now = new Date().toISOString();
    const newOrder: CustomerOrder = { ...order, id: generateId("ORD"), createdAt: now, updatedAt: now };
    setCustomerOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const placeWarehouseOrder = useCallback((order: Omit<WarehouseOrder, "id" | "createdAt" | "updatedAt">): WarehouseOrder => {
    const now = new Date().toISOString();
    const newOrder: WarehouseOrder = { ...order, id: generateId("WO"), createdAt: now, updatedAt: now };
    setWarehouseOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const updateCustomerOrderStatus = useCallback((orderId: string, status: OrderStatus, extra?: Partial<CustomerOrder>) => {
    setCustomerOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status, ...extra, updatedAt: new Date().toISOString() } : o
    ));
  }, []);

  const updateWarehouseOrderStatus = useCallback((orderId: string, status: WarehouseOrderStatus) => {
    setWarehouseOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
    ));
  }, []);

  const assignDelivery = useCallback((orderId: string, companyId: string, companyName: string, trackingCode?: string) => {
    setCustomerOrders(prev => prev.map(o =>
      o.id === orderId ? {
        ...o,
        deliveryCompanyId: companyId,
        deliveryCompanyName: companyName,
        trackingCode: trackingCode ?? `TRK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        status: "shipped",
        updatedAt: new Date().toISOString(),
      } : o
    ));
  }, []);

  const getPharmacyOrders = useCallback((pharmacyId: string) =>
    customerOrders.filter(o => o.pharmacyId === pharmacyId), [customerOrders]);

  const getWarehouseIncomingOrders = useCallback((warehouseId: string) =>
    warehouseOrders.filter(o => o.warehouseId === warehouseId), [warehouseOrders]);

  const getCustomerOrders = useCallback((customerId: string) =>
    customerOrders.filter(o => o.customerId === customerId), [customerOrders]);

  return (
    <OrdersContext.Provider value={{
      customerOrders,
      warehouseOrders,
      placeCustomerOrder,
      placeWarehouseOrder,
      updateCustomerOrderStatus,
      updateWarehouseOrderStatus,
      assignDelivery,
      getPharmacyOrders,
      getWarehouseIncomingOrders,
      getCustomerOrders,
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}

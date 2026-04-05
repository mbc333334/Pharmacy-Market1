import React, { createContext, useContext, useState, useCallback } from 'react';

export type SubscriptionPlan = 'free' | 'standard' | 'premium';

export interface PharmacyProfile {
  pharmacyName: string;
  licenseNumber: string;
  city: string;
  address: string;
  phone: string;
  totalMedicines: number;
  subscription: SubscriptionPlan;
  subscriptionExpiry: string;
}

export interface WarehouseProfile {
  warehouseName: string;
  licenseNumber: string;
  city: string;
  address: string;
  phone: string;
  totalProducts: number;
  linkedPharmacies: string[];
  subscription: SubscriptionPlan;
  subscriptionExpiry: string;
}

export interface DeliveryProfile {
  companyName: string;
  licenseNumber: string;
  city: string;
  address: string;
  phone: string;
  totalDrivers: number;
  totalTrips: number;
  subscription: SubscriptionPlan;
  subscriptionExpiry: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'customer' | 'pharmacy' | 'warehouse' | 'admin' | 'delivery';
  pharmacy?: PharmacyProfile;
  warehouse?: WarehouseProfile;
  delivery?: DeliveryProfile;
}

const DELIVERY_ACCOUNTS = [
  { id: 'dc1', name: 'شركة الإسراع للتوصيل', phone: '07501222222', pass: '123456', city: 'أربيل',       license: 'DL-2024-001', drivers: 14, trips: 142, plan: 'premium'  as SubscriptionPlan },
  { id: 'dc2', name: 'توصيل الخليج',          phone: '07701222223', pass: '123456', city: 'السليمانية', license: 'DL-2024-002', drivers: 9,  trips: 98,  plan: 'standard' as SubscriptionPlan },
  { id: 'dc3', name: 'شركة السهم السريع',      phone: '07601222224', pass: '123456', city: 'دهوك',       license: 'DL-2024-003', drivers: 21, trips: 210, plan: 'premium'  as SubscriptionPlan },
  { id: 'dc4', name: 'نجوم التوصيل',           phone: '07801222225', pass: '123456', city: 'كركوك',      license: 'DL-2024-004', drivers: 4,  trips: 31,  plan: 'free'     as SubscriptionPlan },
];

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, password: string, type: 'customer' | 'pharmacy' | 'warehouse' | 'admin' | 'delivery') => Promise<boolean>;
  loginDemo: (type: 'customer' | 'pharmacy' | 'warehouse' | 'admin' | 'delivery') => void;
  registerCustomer: (name: string, phone: string, password: string) => Promise<boolean>;
  registerPharmacy: (data: {
    ownerName: string; phone: string; password: string;
    pharmacyName: string; licenseNumber: string; city: string; address: string;
  }) => Promise<boolean>;
  registerWarehouse: (data: {
    ownerName: string; phone: string; password: string;
    warehouseName: string; licenseNumber: string; city: string; address: string;
  }) => Promise<boolean>;
  loginDelivery: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_CUSTOMER: User = {
  id: 'demo-customer',
  name: 'احمد كريم',
  phone: '+9647701234567',
  email: 'ahmed@example.com',
  type: 'customer',
};

const DEMO_PHARMACY: User = {
  id: 'demo-pharmacy',
  name: 'محمد صالح',
  phone: '+9647509876543',
  type: 'pharmacy',
  pharmacy: {
    pharmacyName: 'دەرمانخانەی شیفا',
    licenseNumber: '4521-9876',
    city: 'هەولێر',
    address: 'ناوەندی شار، شەقامی ١٠٠ مەتری',
    phone: '+9647501234567',
    totalMedicines: 247,
    subscription: 'premium',
    subscriptionExpiry: '2026-12-31',
  },
};

const DEMO_WAREHOUSE: User = {
  id: 'demo-warehouse',
  name: 'كريم عبدالله',
  phone: '+9647701112233',
  type: 'warehouse',
  warehouse: {
    warehouseName: 'كۆگای داوا',
    licenseNumber: 'WH-2024-001',
    city: 'هەولێر',
    address: 'زۆنی پیشەسازی، بنکەی یەکەم',
    phone: '+9647701112233',
    totalProducts: 1250,
    linkedPharmacies: ['دەرمانخانەی شیفا', 'دەرمانخانەی ئارام', 'دەرمانخانەی نوێ'],
    subscription: 'standard',
    subscriptionExpiry: '2026-09-30',
  },
};

const DEMO_ADMIN: User = {
  id: 'demo-admin',
  name: 'مدير النظام',
  phone: '+9647700000001',
  email: 'admin@dawaplus.iq',
  type: 'admin',
};

const DEMO_DELIVERY: User = {
  id: 'dc1',
  name: 'شركة الإسراع للتوصيل',
  phone: '07501222222',
  type: 'delivery',
  delivery: {
    companyName: 'شركة الإسراع للتوصيل',
    licenseNumber: 'DL-2024-001',
    city: 'أربيل',
    address: 'شارع 60',
    phone: '07501222222',
    totalDrivers: 14,
    totalTrips: 142,
    subscription: 'premium',
    subscriptionExpiry: '2026-12-31',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false);

  const loginDemo = useCallback((type: 'customer' | 'pharmacy' | 'warehouse' | 'admin' | 'delivery') => {
    if (type === 'customer') setUser(DEMO_CUSTOMER);
    else if (type === 'pharmacy') setUser(DEMO_PHARMACY);
    else if (type === 'warehouse') setUser(DEMO_WAREHOUSE);
    else if (type === 'delivery') setUser(DEMO_DELIVERY);
    else setUser(DEMO_ADMIN);
  }, []);

  const login = useCallback(async (
    phone: string, password: string,
    type: 'customer' | 'pharmacy' | 'warehouse' | 'admin' | 'delivery'
  ): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    if (type === 'delivery') {
      const acc = DELIVERY_ACCOUNTS.find(a => a.phone === phone.trim() && a.pass === password.trim());
      if (!acc) return false;
      setUser({
        id: acc.id, name: acc.name, phone: acc.phone, type: 'delivery',
        delivery: {
          companyName: acc.name, licenseNumber: acc.license,
          city: acc.city, address: '', phone: acc.phone,
          totalDrivers: acc.drivers, totalTrips: acc.trips,
          subscription: acc.plan, subscriptionExpiry: '2026-12-31',
        },
      });
      return true;
    }
    if (type === 'customer') setUser(DEMO_CUSTOMER);
    else if (type === 'pharmacy') setUser(DEMO_PHARMACY);
    else if (type === 'warehouse') setUser(DEMO_WAREHOUSE);
    else setUser(DEMO_ADMIN);
    return true;
  }, []);

  const loginDelivery = useCallback(async (phone: string, password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const acc = DELIVERY_ACCOUNTS.find(a => a.phone === phone.trim() && a.pass === password.trim());
    if (!acc) return false;
    setUser({
      id: acc.id, name: acc.name, phone: acc.phone, type: 'delivery',
      delivery: {
        companyName: acc.name, licenseNumber: acc.license,
        city: acc.city, address: '', phone: acc.phone,
        totalDrivers: acc.drivers, totalTrips: acc.trips,
        subscription: acc.plan, subscriptionExpiry: '2026-12-31',
      },
    });
    return true;
  }, []);

  const registerCustomer = useCallback(async (name: string, phone: string, _password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1000));
    setUser({ id: Date.now().toString(), name, phone, type: 'customer' });
    return true;
  }, []);

  const registerPharmacy = useCallback(async (data: {
    ownerName: string; phone: string; password: string;
    pharmacyName: string; licenseNumber: string; city: string; address: string;
  }): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1200));
    setUser({
      id: Date.now().toString(), name: data.ownerName, phone: data.phone, type: 'pharmacy',
      pharmacy: {
        pharmacyName: data.pharmacyName, licenseNumber: data.licenseNumber,
        city: data.city, address: data.address, phone: data.phone,
        totalMedicines: 0, subscription: 'free', subscriptionExpiry: '',
      },
    });
    return true;
  }, []);

  const registerWarehouse = useCallback(async (data: {
    ownerName: string; phone: string; password: string;
    warehouseName: string; licenseNumber: string; city: string; address: string;
  }): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1200));
    setUser({
      id: Date.now().toString(), name: data.ownerName, phone: data.phone, type: 'warehouse',
      warehouse: {
        warehouseName: data.warehouseName, licenseNumber: data.licenseNumber,
        city: data.city, address: data.address, phone: data.phone,
        totalProducts: 0, linkedPharmacies: [], subscription: 'free', subscriptionExpiry: '',
      },
    });
    return true;
  }, []);

  const logout = useCallback(() => { setUser(null); }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginDemo, registerCustomer, registerPharmacy, registerWarehouse, loginDelivery, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

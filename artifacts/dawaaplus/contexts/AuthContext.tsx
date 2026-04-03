import React, { createContext, useContext, useState, useCallback } from 'react';

export interface PharmacyProfile {
  pharmacyName: string;
  licenseNumber: string;
  city: string;
  address: string;
  phone: string;
  totalMedicines: number;
}

export interface WarehouseProfile {
  warehouseName: string;
  licenseNumber: string;
  city: string;
  address: string;
  phone: string;
  totalProducts: number;
  linkedPharmacies: string[];
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'customer' | 'pharmacy' | 'warehouse';
  pharmacy?: PharmacyProfile;
  warehouse?: WarehouseProfile;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, password: string, type: 'customer' | 'pharmacy' | 'warehouse') => Promise<boolean>;
  registerCustomer: (name: string, phone: string, password: string) => Promise<boolean>;
  registerPharmacy: (data: {
    ownerName: string;
    phone: string;
    password: string;
    pharmacyName: string;
    licenseNumber: string;
    city: string;
    address: string;
  }) => Promise<boolean>;
  registerWarehouse: (data: {
    ownerName: string;
    phone: string;
    password: string;
    warehouseName: string;
    licenseNumber: string;
    city: string;
    address: string;
  }) => Promise<boolean>;
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
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false);

  const login = useCallback(async (phone: string, _password: string, type: 'customer' | 'pharmacy' | 'warehouse'): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    if (type === 'customer') {
      setUser(DEMO_CUSTOMER);
    } else if (type === 'pharmacy') {
      setUser(DEMO_PHARMACY);
    } else {
      setUser(DEMO_WAREHOUSE);
    }
    return true;
  }, []);

  const registerCustomer = useCallback(async (name: string, phone: string, _password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1000));
    const newUser: User = {
      id: Date.now().toString(),
      name,
      phone,
      type: 'customer',
    };
    setUser(newUser);
    return true;
  }, []);

  const registerPharmacy = useCallback(async (data: {
    ownerName: string;
    phone: string;
    password: string;
    pharmacyName: string;
    licenseNumber: string;
    city: string;
    address: string;
  }): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1200));
    const newUser: User = {
      id: Date.now().toString(),
      name: data.ownerName,
      phone: data.phone,
      type: 'pharmacy',
      pharmacy: {
        pharmacyName: data.pharmacyName,
        licenseNumber: data.licenseNumber,
        city: data.city,
        address: data.address,
        phone: data.phone,
        totalMedicines: 0,
      },
    };
    setUser(newUser);
    return true;
  }, []);

  const registerWarehouse = useCallback(async (data: {
    ownerName: string;
    phone: string;
    password: string;
    warehouseName: string;
    licenseNumber: string;
    city: string;
    address: string;
  }): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1200));
    const newUser: User = {
      id: Date.now().toString(),
      name: data.ownerName,
      phone: data.phone,
      type: 'warehouse',
      warehouse: {
        warehouseName: data.warehouseName,
        licenseNumber: data.licenseNumber,
        city: data.city,
        address: data.address,
        phone: data.phone,
        totalProducts: 0,
        linkedPharmacies: [],
      },
    };
    setUser(newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, registerCustomer, registerPharmacy, registerWarehouse, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface PharmacyProfile {
  pharmacyName: string;
  licenseNumber: string;
  city: string;
  address: string;
  phone: string;
  totalMedicines: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'customer' | 'pharmacy';
  pharmacy?: PharmacyProfile;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, password: string, type: 'customer' | 'pharmacy') => Promise<boolean>;
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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo accounts for testing
const DEMO_CUSTOMER: User = {
  id: 'demo-customer',
  name: 'أحمد محمد العمري',
  phone: '+966551234567',
  email: 'ahmed@example.com',
  type: 'customer',
};

const DEMO_PHARMACY: User = {
  id: 'demo-pharmacy',
  name: 'محمد الأحمدي',
  phone: '+966509876543',
  type: 'pharmacy',
  pharmacy: {
    pharmacyName: 'صيدلية الشفاء',
    licenseNumber: '4521-9876',
    city: 'الرياض',
    address: 'حي العليا، طريق الملك فهد',
    phone: '+966114567890',
    totalMedicines: 247,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false);

  const login = useCallback(async (phone: string, _password: string, type: 'customer' | 'pharmacy'): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    if (type === 'customer') {
      setUser(DEMO_CUSTOMER);
    } else {
      setUser(DEMO_PHARMACY);
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

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, registerCustomer, registerPharmacy, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

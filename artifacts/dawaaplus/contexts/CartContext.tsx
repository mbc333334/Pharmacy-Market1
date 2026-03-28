import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export interface CartItem {
  id: string;
  medicineId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  pharmacyName: string;
  pharmacyId: string;
  requiresPrescription: boolean;
  color: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeItem: (medicineId: string) => void;
  updateQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (medicineId: string) => boolean;
  getQuantity: (medicineId: string) => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = useCallback((item: Omit<CartItem, 'id' | 'quantity'>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems(prev => {
      const existing = prev.find(i => i.medicineId === item.medicineId);
      if (existing) {
        return prev.map(i =>
          i.medicineId === item.medicineId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, id: Date.now().toString(), quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((medicineId: string) => {
    setItems(prev => prev.filter(i => i.medicineId !== medicineId));
  }, []);

  const updateQuantity = useCallback((medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.medicineId !== medicineId));
    } else {
      setItems(prev =>
        prev.map(i => i.medicineId === medicineId ? { ...i, quantity } : i)
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((medicineId: string) => {
    return items.some(i => i.medicineId === medicineId);
  }, [items]);

  const getQuantity = useCallback((medicineId: string) => {
    return items.find(i => i.medicineId === medicineId)?.quantity ?? 0;
  }, [items]);

  return (
    <CartContext.Provider value={{
      items, totalItems, totalPrice,
      addItem, removeItem, updateQuantity, clearCart,
      isInCart, getQuantity,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

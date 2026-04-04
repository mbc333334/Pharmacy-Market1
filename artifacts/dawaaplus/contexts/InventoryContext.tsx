import React, { createContext, useContext, useState, useCallback } from "react";

export interface InventoryItem {
  id: string;
  barcode?: string;
  name: string;
  brand: string;
  categoryId: string;
  price: number;
  stock: number;
  requiresPrescription: boolean;
  lastSynced?: string;
  source: "manual" | "barcode" | "csv" | "api" | "database";
}

export interface SyncEvent {
  id: string;
  type: "sale" | "restock" | "import" | "adjustment";
  itemId: string;
  itemName: string;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  timestamp: string;
}

export interface SyncSettings {
  autoSyncEnabled: boolean;
  syncOnSale: boolean;
  syncOnRestock: boolean;
  lowStockThreshold: number;
  lastFullSync?: string;
  connectedDbType?: "csv" | "api" | "mysql" | "postgres" | null;
  connectedDbUrl?: string;
  isConnected: boolean;
}

interface InventoryContextValue {
  pharmacyInventory: InventoryItem[];
  warehouseInventory: InventoryItem[];
  syncEvents: SyncEvent[];
  syncSettings: SyncSettings;

  addPharmacyItem: (item: Omit<InventoryItem, "id">) => void;
  updatePharmacyStock: (itemId: string, delta: number, reason: string) => void;
  decrementOnSale: (items: { name: string; qty: number }[]) => void;
  restockFromWarehouse: (items: { name: string; qty: number; price?: number }[]) => void;
  importItems: (items: Omit<InventoryItem, "id">[], owner: "pharmacy" | "warehouse") => void;
  updateSyncSettings: (settings: Partial<SyncSettings>) => void;
  clearSyncLog: () => void;
  getLowStockItems: () => InventoryItem[];
  getOutOfStockItems: () => InventoryItem[];
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

const INITIAL_PHARMACY_INVENTORY: InventoryItem[] = [
  { id: "inv1", barcode: "5900000000001", name: "باراسیتامول 500mg", brand: "Panadol", categoryId: "1", price: 1500, stock: 120, requiresPrescription: false, source: "manual" },
  { id: "inv2", barcode: "5900000000002", name: "أموكسيسيلين 500mg", brand: "Amoxil", categoryId: "3", price: 8000, stock: 45, requiresPrescription: true, source: "manual" },
  { id: "inv3", barcode: "5900000000003", name: "أسبرين 100mg", brand: "Aspirin Bayer", categoryId: "1", price: 2500, stock: 8, requiresPrescription: false, source: "manual" },
  { id: "inv4", barcode: "5900000000004", name: "أوميبرازول 20mg", brand: "Omeprazole", categoryId: "2", price: 5000, stock: 60, requiresPrescription: false, source: "manual" },
  { id: "inv5", barcode: "5900000000005", name: "إيبوبروفين 400mg", brand: "Advil", categoryId: "1", price: 3000, stock: 0, requiresPrescription: false, source: "manual" },
  { id: "inv6", barcode: "5900000000006", name: "ميتفورمين 500mg", brand: "Glucophage", categoryId: "4", price: 4500, stock: 5, requiresPrescription: true, source: "manual" },
];

const INITIAL_WAREHOUSE_INVENTORY: InventoryItem[] = [
  { id: "winv1", barcode: "5900000000001", name: "باراسیتامول 500mg", brand: "Panadol", categoryId: "1", price: 1000, stock: 5000, requiresPrescription: false, source: "database" },
  { id: "winv2", barcode: "5900000000002", name: "أموكسيسيلين 500mg", brand: "Amoxil", categoryId: "3", price: 6000, stock: 2000, requiresPrescription: true, source: "database" },
  { id: "winv3", barcode: "5900000000003", name: "أسبرين 100mg", brand: "Aspirin Bayer", categoryId: "1", price: 1800, stock: 3500, requiresPrescription: false, source: "database" },
  { id: "winv4", barcode: "5900000000004", name: "أوميبرازول 20mg", brand: "Omeprazole", categoryId: "2", price: 3500, stock: 1200, requiresPrescription: false, source: "database" },
  { id: "winv5", barcode: "5900000000005", name: "إيبوبروفين 400mg", brand: "Advil", categoryId: "1", price: 2000, stock: 800, requiresPrescription: false, source: "database" },
];

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [pharmacyInventory, setPharmacyInventory] = useState<InventoryItem[]>(INITIAL_PHARMACY_INVENTORY);
  const [warehouseInventory, setWarehouseInventory] = useState<InventoryItem[]>(INITIAL_WAREHOUSE_INVENTORY);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    autoSyncEnabled: true,
    syncOnSale: true,
    syncOnRestock: true,
    lowStockThreshold: 10,
    isConnected: false,
    connectedDbType: null,
  });

  const logEvent = useCallback((event: Omit<SyncEvent, "id" | "timestamp">) => {
    setSyncEvents(prev => [{
      ...event,
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }, ...prev.slice(0, 99)]);
  }, []);

  const addPharmacyItem = useCallback((item: Omit<InventoryItem, "id">) => {
    const newItem: InventoryItem = { ...item, id: `inv-${Date.now()}` };
    setPharmacyInventory(prev => {
      const existing = prev.find(i => i.barcode && i.barcode === item.barcode);
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, stock: i.stock + item.stock } : i);
      }
      return [newItem, ...prev];
    });
  }, []);

  const updatePharmacyStock = useCallback((itemId: string, delta: number, reason: string) => {
    setPharmacyInventory(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newStock = Math.max(0, item.stock + delta);
      logEvent({
        type: delta < 0 ? "sale" : "restock",
        itemId: item.id,
        itemName: item.name,
        quantityChange: delta,
        stockBefore: item.stock,
        stockAfter: newStock,
        reason,
      });
      return { ...item, stock: newStock };
    }));
  }, [logEvent]);

  const decrementOnSale = useCallback((items: { name: string; qty: number }[]) => {
    if (!syncSettings.autoSyncEnabled || !syncSettings.syncOnSale) return;
    setPharmacyInventory(prev => {
      const updated = [...prev];
      items.forEach(soldItem => {
        const idx = updated.findIndex(i =>
          i.name.toLowerCase().includes(soldItem.name.toLowerCase()) ||
          soldItem.name.toLowerCase().includes(i.name.toLowerCase())
        );
        if (idx !== -1) {
          const before = updated[idx].stock;
          const after = Math.max(0, before - soldItem.qty);
          updated[idx] = { ...updated[idx], stock: after };
          logEvent({
            type: "sale",
            itemId: updated[idx].id,
            itemName: updated[idx].name,
            quantityChange: -(before - after),
            stockBefore: before,
            stockAfter: after,
            reason: `بيع تلقائي: ${soldItem.qty} وحدة`,
          });
        }
      });
      return updated;
    });
  }, [syncSettings.autoSyncEnabled, syncSettings.syncOnSale, logEvent]);

  const restockFromWarehouse = useCallback((items: { name: string; qty: number; price?: number }[]) => {
    if (!syncSettings.autoSyncEnabled || !syncSettings.syncOnRestock) return;
    setPharmacyInventory(prev => {
      const updated = [...prev];
      items.forEach(restockItem => {
        const idx = updated.findIndex(i =>
          i.name.toLowerCase().includes(restockItem.name.toLowerCase()) ||
          restockItem.name.toLowerCase().includes(i.name.toLowerCase())
        );
        if (idx !== -1) {
          const before = updated[idx].stock;
          const after = before + restockItem.qty;
          updated[idx] = { ...updated[idx], stock: after };
          logEvent({
            type: "restock",
            itemId: updated[idx].id,
            itemName: updated[idx].name,
            quantityChange: restockItem.qty,
            stockBefore: before,
            stockAfter: after,
            reason: `توريد من مذخر: +${restockItem.qty} وحدة`,
          });
        } else {
          const newItem: InventoryItem = {
            id: `inv-${Date.now()}-${Math.random()}`,
            name: restockItem.name,
            brand: "",
            categoryId: "1",
            price: restockItem.price ?? 0,
            stock: restockItem.qty,
            requiresPrescription: false,
            source: "database",
          };
          updated.push(newItem);
          logEvent({
            type: "restock",
            itemId: newItem.id,
            itemName: newItem.name,
            quantityChange: restockItem.qty,
            stockBefore: 0,
            stockAfter: restockItem.qty,
            reason: `منتج جديد من مذخر: +${restockItem.qty} وحدة`,
          });
        }
      });
      return updated;
    });
  }, [syncSettings.autoSyncEnabled, syncSettings.syncOnRestock, logEvent]);

  const importItems = useCallback((items: Omit<InventoryItem, "id">[], owner: "pharmacy" | "warehouse") => {
    const mapped = items.map((item, i) => ({ ...item, id: `imp-${Date.now()}-${i}` }));
    if (owner === "pharmacy") {
      setPharmacyInventory(prev => {
        const updated = [...prev];
        mapped.forEach(imp => {
          const idx = updated.findIndex(i => i.barcode && i.barcode === imp.barcode);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], stock: imp.stock, price: imp.price, lastSynced: new Date().toISOString() };
          } else {
            updated.push(imp);
          }
        });
        return updated;
      });
    } else {
      setWarehouseInventory(prev => {
        const updated = [...prev];
        mapped.forEach(imp => {
          const idx = updated.findIndex(i => i.barcode && i.barcode === imp.barcode);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], stock: imp.stock, price: imp.price, lastSynced: new Date().toISOString() };
          } else {
            updated.push(imp);
          }
        });
        return updated;
      });
    }
    logEvent({
      type: "import",
      itemId: "bulk",
      itemName: `استيراد جماعي (${items.length} منتج)`,
      quantityChange: items.reduce((s, i) => s + i.stock, 0),
      stockBefore: 0,
      stockAfter: items.reduce((s, i) => s + i.stock, 0),
      reason: `استيراد من ${owner === "pharmacy" ? "الصيدلية" : "المذخر"}`,
    });
  }, [logEvent]);

  const updateSyncSettings = useCallback((settings: Partial<SyncSettings>) => {
    setSyncSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const clearSyncLog = useCallback(() => setSyncEvents([]), []);

  const getLowStockItems = useCallback(() =>
    pharmacyInventory.filter(i => i.stock > 0 && i.stock <= syncSettings.lowStockThreshold),
    [pharmacyInventory, syncSettings.lowStockThreshold]
  );

  const getOutOfStockItems = useCallback(() =>
    pharmacyInventory.filter(i => i.stock === 0),
    [pharmacyInventory]
  );

  return (
    <InventoryContext.Provider value={{
      pharmacyInventory, warehouseInventory, syncEvents, syncSettings,
      addPharmacyItem, updatePharmacyStock, decrementOnSale, restockFromWarehouse,
      importItems, updateSyncSettings, clearSyncLog, getLowStockItems, getOutOfStockItems,
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}

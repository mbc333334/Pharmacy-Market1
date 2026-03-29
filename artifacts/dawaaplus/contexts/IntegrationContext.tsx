import React, { createContext, useContext, useState, useCallback } from "react";

export type IntegrationType =
  | "rest_api"
  | "mysql"
  | "postgresql"
  | "woocommerce"
  | "odoo"
  | "shopify"
  | "csv"
  | null;

export type SyncField = "medicines" | "orders" | "customers" | "inventory" | "prices";

export type ConnectionStatus = "idle" | "testing" | "connected" | "failed";

export interface IntegrationConfig {
  type: IntegrationType;
  apiUrl: string;
  apiKey: string;
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  syncFields: SyncField[];
  autoSync: boolean;
  syncInterval: "15min" | "1hour" | "6hours" | "daily";
  lastSync: string | null;
  status: ConnectionStatus;
  errorMessage: string | null;
}

interface IntegrationContextType {
  config: IntegrationConfig;
  updateConfig: (updates: Partial<IntegrationConfig>) => void;
  testConnection: () => Promise<void>;
  disconnect: () => void;
  syncNow: () => Promise<void>;
  syncing: boolean;
}

const DEFAULT_CONFIG: IntegrationConfig = {
  type: null,
  apiUrl: "",
  apiKey: "",
  dbHost: "",
  dbPort: "3306",
  dbName: "",
  dbUser: "",
  dbPassword: "",
  storeUrl: "",
  consumerKey: "",
  consumerSecret: "",
  syncFields: ["medicines", "inventory", "prices"],
  autoSync: false,
  syncInterval: "1hour",
  lastSync: null,
  status: "idle",
  errorMessage: null,
};

const IntegrationContext = createContext<IntegrationContextType | null>(null);

export function IntegrationProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<IntegrationConfig>(DEFAULT_CONFIG);
  const [syncing, setSyncing] = useState(false);

  const updateConfig = useCallback((updates: Partial<IntegrationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const testConnection = useCallback(async () => {
    setConfig(prev => ({ ...prev, status: "testing", errorMessage: null }));
    await new Promise(r => setTimeout(r, 2000));
    const ok = !!(config.apiUrl || config.dbHost || config.storeUrl);
    setConfig(prev => ({
      ...prev,
      status: ok ? "connected" : "failed",
      errorMessage: ok ? null : "تعذّر الاتصال — تأكد من صحة بيانات الاتصال",
      lastSync: ok ? new Date().toISOString() : prev.lastSync,
    }));
  }, [config.apiUrl, config.dbHost, config.storeUrl]);

  const syncNow = useCallback(async () => {
    if (config.status !== "connected") return;
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2500));
    setSyncing(false);
    setConfig(prev => ({ ...prev, lastSync: new Date().toISOString() }));
  }, [config.status]);

  const disconnect = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  return (
    <IntegrationContext.Provider value={{ config, updateConfig, testConnection, disconnect, syncNow, syncing }}>
      {children}
    </IntegrationContext.Provider>
  );
}

export function useIntegration() {
  const ctx = useContext(IntegrationContext);
  if (!ctx) throw new Error("useIntegration must be used within IntegrationProvider");
  return ctx;
}

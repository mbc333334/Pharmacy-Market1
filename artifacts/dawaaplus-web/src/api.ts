const BASE = "/api";

async function req<T = any>(method: string, path: string, body?: any): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "network error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login:              (phone: string, password: string) => req("POST", "/auth/login", { phone, password, type: "admin" }),
  // Stats
  getStats:           () => req("GET", "/admin/stats"),
  // Pharmacies
  getPharmacies:      () => req("GET", "/pharmacies"),
  getPharmacy:        (id: string) => req("GET", `/pharmacies/${id}`),
  createPharmacy:     (data: any) => req("POST", "/pharmacies", data),
  updatePharmacy:     (id: string, data: any) => req("PUT", `/pharmacies/${id}`, data),
  deletePharmacy:     (id: string) => req("DELETE", `/pharmacies/${id}`),
  // Warehouses
  getWarehouses:      () => req("GET", "/warehouses"),
  getWarehouse:       (id: string) => req("GET", `/warehouses/${id}`),
  createWarehouse:    (data: any) => req("POST", "/warehouses", data),
  updateWarehouse:    (id: string, data: any) => req("PUT", `/warehouses/${id}`, data),
  // Delivery
  getDeliveryCompanies: () => req("GET", "/delivery-companies"),
  getDeliveryCompany: (id: string) => req("GET", `/delivery-companies/${id}`),
  createDeliveryCompany: (data: any) => req("POST", "/delivery-companies", data),
  updateDeliveryCompany: (id: string, data: any) => req("PUT", `/delivery-companies/${id}`, data),
  // Admin accounts
  getAdmins:          () => req("GET", "/admins"),
  createAdmin:        (data: any) => req("POST", "/admins", data),
  updateAdmin:        (id: number, data: any) => req("PUT", `/admins/${id}`, data),
  deleteAdmin:        (id: number) => req("DELETE", `/admins/${id}`),
  // Announcements
  getAnnouncements:   () => req("GET", "/announcements"),
  createAnnouncement: (data: any) => req("POST", "/announcements", data),
  deleteAnnouncement: (id: number) => req("DELETE", `/announcements/${id}`),
  // Payments
  getPayments:        () => req("GET", "/payments"),
  updatePaymentStatus:(id: number, status: string) => req("PATCH", `/payments/${id}/status`, { status }),
  // OTP
  sendOtp:            (phone: string) => req("POST", "/otp/send", { phone }),
  verifyOtp:          (phone: string, code: string) => req("POST", "/otp/verify", { phone, code }),
  changePassword:     (phone: string, newPassword: string, type: string) => req("POST", "/auth/change-password", { phone, newPassword, type }),
};

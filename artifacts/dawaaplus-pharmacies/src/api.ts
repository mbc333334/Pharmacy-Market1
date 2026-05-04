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
  login:           (phone: string, password: string) => req("POST", "/auth/login", { phone, password, type: "pharmacy" }),
  register:        (data: any) => req("POST", "/auth/register/pharmacy", data),
  getPharmacy:     (id: string) => req("GET", `/pharmacies/${id}`),
  updatePharmacy:  (id: string, data: any) => req("PUT", `/pharmacies/${id}`, data),
  getProducts:     (ownerId: string) => req("GET", `/products?ownerId=${ownerId}`),
  createProduct:   (data: any) => req("POST", "/products", data),
  updateProduct:   (id: number, data: any) => req("PUT", `/products/${id}`, data),
  deleteProduct:   (id: number) => req("DELETE", `/products/${id}`),
  getOrders:       (pharmacyId: string) => req("GET", `/orders?pharmacyId=${pharmacyId}`),
  updateOrderStatus: (id: number, status: string) => req("PATCH", `/orders/${id}/status`, { status }),
  sendOtp:         (phone: string) => req("POST", "/otp/send", { phone }),
  verifyOtp:       (phone: string, code: string) => req("POST", "/otp/verify", { phone, code }),
  changePassword:  (phone: string, newPassword: string) => req("POST", "/auth/change-password", { phone, newPassword, type: "pharmacy" }),
  getAnnouncements: () => req("GET", "/announcements?target=pharmacy"),
  submitPayment:   (data: any) => req("POST", "/payments", data),
  getPlans:        () => req("GET", "/subscription-plans?type=pharmacy"),
};

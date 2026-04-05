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
  login:             (phone: string, password: string) => req("POST", "/auth/login", { phone, password, type: "delivery" }),
  getCompany:        (id: string) => req("GET", `/delivery-companies/${id}`),
  updateCompany:     (id: string, data: any) => req("PUT", `/delivery-companies/${id}`, data),
  getDrivers:        (companyId: string) => req("GET", `/delivery-companies/${companyId}/drivers`),
  addDriver:         (companyId: string, data: any) => req("POST", `/delivery-companies/${companyId}/drivers`, data),
  updateDriver:      (driverId: number, data: any) => req("PUT", `/drivers/${driverId}`, data),
  deleteDriver:      (driverId: number) => req("DELETE", `/drivers/${driverId}`),
  getTrips:          (companyId: string) => req("GET", `/delivery-companies/${companyId}/trips`),
  addTrip:           (companyId: string, data: any) => req("POST", `/delivery-companies/${companyId}/trips`, data),
  updateTripStatus:  (tripId: number, status: string) => req("PATCH", `/trips/${tripId}/status`, { status }),
  sendOtp:           (phone: string) => req("POST", "/otp/send", { phone }),
  verifyOtp:         (phone: string, code: string) => req("POST", "/otp/verify", { phone, code }),
  changePassword:    (phone: string, newPassword: string) => req("POST", "/auth/change-password", { phone, newPassword, type: "delivery" }),
  getAnnouncements:  () => req("GET", "/announcements?target=delivery"),
  submitPayment:     (data: any) => req("POST", "/payments", data),
};

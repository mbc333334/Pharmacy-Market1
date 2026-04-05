import { Router } from "express";
import { db, admins, pharmacies, warehouses, deliveryCompanies, customers } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { phone, password, type } = req.body as { phone: string; password: string; type?: string };
  if (!phone || !password) {
    return res.status(400).json({ error: "phone and password required" });
  }

  try {
    // Admin login
    if (!type || type === "admin") {
      const [admin] = await db.select().from(admins).where(eq(admins.phone, phone.trim()));
      if (admin && admin.password === password.trim() && admin.active) {
        const { password: _p, ...safe } = admin;
        return res.json({ success: true, user: safe, type: "admin" });
      }
      if (type === "admin") return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    // Pharmacy login
    if (!type || type === "pharmacy") {
      const [ph] = await db.select().from(pharmacies).where(eq(pharmacies.phone, phone.trim()));
      if (ph && ph.password === password.trim()) {
        if (ph.approvalStatus === "pending") return res.status(403).json({ error: "طلبك قيد المراجعة. سيتم إشعارك عند الموافقة", code: "PENDING" });
        if (ph.approvalStatus === "rejected") return res.status(403).json({ error: `تم رفض طلبك${ph.rejectionReason ? ": " + ph.rejectionReason : ""}`, code: "REJECTED" });
        if (!ph.active) return res.status(403).json({ error: "الحساب موقوف. تواصل مع الإدارة", code: "SUSPENDED" });
        const { password: _p, ...safe } = ph;
        return res.json({ success: true, user: safe, type: "pharmacy" });
      }
      if (type === "pharmacy") return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    // Warehouse login
    if (!type || type === "warehouse") {
      const [wh] = await db.select().from(warehouses).where(eq(warehouses.phone, phone.trim()));
      if (wh && wh.password === password.trim()) {
        if (wh.approvalStatus === "pending") return res.status(403).json({ error: "طلبك قيد المراجعة. سيتم إشعارك عند الموافقة", code: "PENDING" });
        if (wh.approvalStatus === "rejected") return res.status(403).json({ error: `تم رفض طلبك${wh.rejectionReason ? ": " + wh.rejectionReason : ""}`, code: "REJECTED" });
        if (!wh.active) return res.status(403).json({ error: "الحساب موقوف. تواصل مع الإدارة", code: "SUSPENDED" });
        const { password: _p, ...safe } = wh;
        return res.json({ success: true, user: safe, type: "warehouse" });
      }
      if (type === "warehouse") return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    // Delivery login
    if (!type || type === "delivery") {
      const [dc] = await db.select().from(deliveryCompanies).where(eq(deliveryCompanies.phone, phone.trim()));
      if (dc && dc.password === password.trim()) {
        if (dc.approvalStatus === "pending") return res.status(403).json({ error: "طلبك قيد المراجعة. سيتم إشعارك عند الموافقة", code: "PENDING" });
        if (dc.approvalStatus === "rejected") return res.status(403).json({ error: `تم رفض طلبك${dc.rejectionReason ? ": " + dc.rejectionReason : ""}`, code: "REJECTED" });
        if (!dc.active) return res.status(403).json({ error: "الحساب موقوف. تواصل مع الإدارة", code: "SUSPENDED" });
        const { password: _p, ...safe } = dc;
        return res.json({ success: true, user: safe, type: "delivery" });
      }
      if (type === "delivery") return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    // Customer login
    if (!type || type === "customer") {
      const [cu] = await db.select().from(customers).where(eq(customers.phone, phone.trim()));
      if (cu && cu.password === password.trim() && cu.active) {
        const { password: _p, ...safe } = cu;
        return res.json({ success: true, user: safe, type: "customer" });
      }
    }

    return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/auth/register/customer
router.post("/auth/register/customer", async (req, res) => {
  const { name, phone, password, city, address } = req.body;
  if (!phone || !password) return res.status(400).json({ error: "phone and password required" });
  try {
    const existing = await db.select().from(customers).where(eq(customers.phone, phone.trim()));
    if (existing.length > 0) return res.status(409).json({ error: "رقم الهاتف مسجّل مسبقاً" });
    const [newUser] = await db.insert(customers).values({ name, phone: phone.trim(), password: password.trim(), city, address }).returning();
    const { password: _p, ...safe } = newUser;
    return res.json({ success: true, user: safe, type: "customer" });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/auth/register/pharmacy — public self-registration, creates pending record
router.post("/auth/register/pharmacy", async (req, res) => {
  const { name, city, phone, password, email, address, license } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ error: "الاسم ورقم الهاتف وكلمة المرور مطلوبة" });
  try {
    const existing = await db.select().from(pharmacies).where(eq(pharmacies.phone, phone.trim()));
    if (existing.length > 0) return res.status(409).json({ error: "رقم الهاتف مسجّل مسبقاً" });
    const id = "PH" + Date.now().toString().slice(-6);
    const [created] = await db.insert(pharmacies).values({
      id, name, city, phone: phone.trim(), password: password.trim(),
      email, address, license,
      approvalStatus: "pending",
      active: false,
      joined: new Date().toISOString().split("T")[0],
    }).returning();
    const { password: _p, ...safe } = created;
    return res.status(201).json({ success: true, message: "تم استلام طلبك وسيتم مراجعته من قبل الإدارة", data: safe });
  } catch (err: any) {
    if (err.code === "23505") return res.status(409).json({ error: "رقم الهاتف مسجّل مسبقاً" });
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/auth/register/warehouse
router.post("/auth/register/warehouse", async (req, res) => {
  const { name, city, phone, password, email, address, license } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ error: "الاسم ورقم الهاتف وكلمة المرور مطلوبة" });
  try {
    const existing = await db.select().from(warehouses).where(eq(warehouses.phone, phone.trim()));
    if (existing.length > 0) return res.status(409).json({ error: "رقم الهاتف مسجّل مسبقاً" });
    const id = "WH" + Date.now().toString().slice(-6);
    const [created] = await db.insert(warehouses).values({
      id, name, city, phone: phone.trim(), password: password.trim(),
      email, address, license,
      approvalStatus: "pending",
      active: false,
      joined: new Date().toISOString().split("T")[0],
    }).returning();
    const { password: _p, ...safe } = created;
    return res.status(201).json({ success: true, message: "تم استلام طلبك وسيتم مراجعته من قبل الإدارة", data: safe });
  } catch (err: any) {
    if (err.code === "23505") return res.status(409).json({ error: "رقم الهاتف مسجّل مسبقاً" });
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/auth/register/delivery
router.post("/auth/register/delivery", async (req, res) => {
  const { name, city, phone, password, email, address, license } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ error: "الاسم ورقم الهاتف وكلمة المرور مطلوبة" });
  try {
    const existing = await db.select().from(deliveryCompanies).where(eq(deliveryCompanies.phone, phone.trim()));
    if (existing.length > 0) return res.status(409).json({ error: "رقم الهاتف مسجّل مسبقاً" });
    const id = "DL" + Date.now().toString().slice(-6);
    const [created] = await db.insert(deliveryCompanies).values({
      id, name, city, phone: phone.trim(), password: password.trim(),
      email, address, license,
      approvalStatus: "pending",
      active: false,
      joined: new Date().toISOString().split("T")[0],
    }).returning();
    const { password: _p, ...safe } = created;
    return res.status(201).json({ success: true, message: "تم استلام طلبك وسيتم مراجعته من قبل الإدارة", data: safe });
  } catch (err: any) {
    if (err.code === "23505") return res.status(409).json({ error: "رقم الهاتف مسجّل مسبقاً" });
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/auth/change-password
router.post("/auth/change-password", async (req, res) => {
  const { phone, newPassword, type } = req.body;
  if (!phone || !newPassword || !type) return res.status(400).json({ error: "missing fields" });
  try {
    const tableMap: Record<string, any> = { pharmacy: pharmacies, warehouse: warehouses, delivery: deliveryCompanies, customer: customers };
    const table = tableMap[type];
    if (!table) return res.status(400).json({ error: "invalid type" });
    await db.update(table).set({ password: newPassword }).where(eq((table as any).phone, phone));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

export default router;

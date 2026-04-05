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
      if (ph && ph.password === password.trim() && ph.active) {
        const { password: _p, ...safe } = ph;
        return res.json({ success: true, user: safe, type: "pharmacy" });
      }
      if (type === "pharmacy") return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    // Warehouse login
    if (!type || type === "warehouse") {
      const [wh] = await db.select().from(warehouses).where(eq(warehouses.phone, phone.trim()));
      if (wh && wh.password === password.trim() && wh.active) {
        const { password: _p, ...safe } = wh;
        return res.json({ success: true, user: safe, type: "warehouse" });
      }
      if (type === "warehouse") return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    // Delivery login
    if (!type || type === "delivery") {
      const [dc] = await db.select().from(deliveryCompanies).where(eq(deliveryCompanies.phone, phone.trim()));
      if (dc && dc.password === password.trim() && dc.active) {
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

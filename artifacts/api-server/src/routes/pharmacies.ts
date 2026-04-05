import { Router } from "express";
import { db, pharmacies, products, orders } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/pharmacies
router.get("/pharmacies", async (_req, res) => {
  try {
    const rows = await db.select().from(pharmacies);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// GET /api/pharmacies/:id
router.get("/pharmacies/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(pharmacies).where(eq(pharmacies.id, req.params.id));
    if (!row) return res.status(404).json({ error: "not found" });
    const prods = await db.select().from(products).where(eq(products.ownerId, req.params.id));
    const ords = await db.select().from(orders).where(eq(orders.pharmacyId, req.params.id));
    return res.json({ ...row, products: prods, orders: ords });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// PUT /api/pharmacies/:id
router.put("/pharmacies/:id", async (req, res) => {
  try {
    const { password, id, createdAt, ...data } = req.body;
    const [updated] = await db.update(pharmacies).set(data).where(eq(pharmacies.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/pharmacies (admin creates)
router.post("/pharmacies", async (req, res) => {
  try {
    const { id, name, city, phone, password, email, address, license, plan } = req.body;
    if (!id || !name || !phone) return res.status(400).json({ error: "id, name, phone required" });
    const [created] = await db.insert(pharmacies).values({ id, name, city, phone, password: password || "123456", email, address, license, plan: plan || "free" }).returning();
    return res.status(201).json(created);
  } catch (err: any) {
    if (err.code === "23505") return res.status(409).json({ error: "رقم الهاتف أو المعرّف مسجّل مسبقاً" });
    return res.status(500).json({ error: "server error" });
  }
});

// DELETE /api/pharmacies/:id
router.delete("/pharmacies/:id", async (req, res) => {
  try {
    await db.update(pharmacies).set({ active: false }).where(eq(pharmacies.id, req.params.id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

export default router;

import { Router } from "express";
import { db, warehouses, products, warehousePharmacyLinks, pharmacies } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/warehouses
router.get("/warehouses", async (_req, res) => {
  try {
    const rows = await db.select().from(warehouses);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// GET /api/warehouses/:id
router.get("/warehouses/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(warehouses).where(eq(warehouses.id, req.params.id));
    if (!row) return res.status(404).json({ error: "not found" });
    const prods = await db.select().from(products).where(eq(products.ownerId, req.params.id));
    const links = await db.select({
      id: warehousePharmacyLinks.id,
      pharmacyId: warehousePharmacyLinks.pharmacyId,
      status: warehousePharmacyLinks.status,
      pharmacyName: pharmacies.name,
      pharmacyPhone: pharmacies.phone,
      pharmacyCity: pharmacies.city,
    }).from(warehousePharmacyLinks)
      .leftJoin(pharmacies, eq(warehousePharmacyLinks.pharmacyId, pharmacies.id))
      .where(eq(warehousePharmacyLinks.warehouseId, req.params.id));
    return res.json({ ...row, products: prods, linkedPharmacies: links });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// PUT /api/warehouses/:id
router.put("/warehouses/:id", async (req, res) => {
  try {
    const { password, id, createdAt, ...data } = req.body;
    const [updated] = await db.update(warehouses).set(data).where(eq(warehouses.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/warehouses (admin creates)
router.post("/warehouses", async (req, res) => {
  try {
    const { id, name, city, phone, password, email, address, license, plan } = req.body;
    if (!id || !name || !phone) return res.status(400).json({ error: "id, name, phone required" });
    const [created] = await db.insert(warehouses).values({ id, name, city, phone, password: password || "123456", email, address, license, plan: plan || "free" }).returning();
    return res.status(201).json(created);
  } catch (err: any) {
    if (err.code === "23505") return res.status(409).json({ error: "رقم الهاتف أو المعرّف مسجّل مسبقاً" });
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/warehouses/:id/link-pharmacy
router.post("/warehouses/:id/link-pharmacy", async (req, res) => {
  try {
    const { pharmacyId } = req.body;
    if (!pharmacyId) return res.status(400).json({ error: "pharmacyId required" });
    const existing = await db.select().from(warehousePharmacyLinks)
      .where(eq(warehousePharmacyLinks.warehouseId, req.params.id));
    const link = existing.find(l => l.pharmacyId === pharmacyId);
    if (link) {
      await db.update(warehousePharmacyLinks).set({ status: "active" })
        .where(eq(warehousePharmacyLinks.id, link.id));
    } else {
      await db.insert(warehousePharmacyLinks).values({ warehouseId: req.params.id, pharmacyId, status: "active" });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// DELETE /api/warehouses/:id/link-pharmacy/:pharmacyId
router.delete("/warehouses/:id/link-pharmacy/:pharmacyId", async (req, res) => {
  try {
    await db.update(warehousePharmacyLinks).set({ status: "inactive" })
      .where(eq(warehousePharmacyLinks.warehouseId, req.params.id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

export default router;

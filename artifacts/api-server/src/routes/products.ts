import { Router } from "express";
import { db, products } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/products?ownerType=pharmacy&ownerId=ph1
router.get("/products", async (req, res) => {
  try {
    const { ownerType, ownerId } = req.query as { ownerType?: string; ownerId?: string };
    let rows;
    if (ownerType && ownerId) {
      rows = await db.select().from(products).where(and(eq(products.ownerType, ownerType), eq(products.ownerId, ownerId), eq(products.active, true)));
    } else if (ownerId) {
      rows = await db.select().from(products).where(and(eq(products.ownerId, ownerId), eq(products.active, true)));
    } else {
      rows = await db.select().from(products).where(eq(products.active, true));
    }
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// GET /api/products/:id
router.get("/products/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(products).where(eq(products.id, Number(req.params.id)));
    if (!row) return res.status(404).json({ error: "not found" });
    return res.json(row);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/products
router.post("/products", async (req, res) => {
  try {
    const { name, description, price, stock, category, ownerType, ownerId, imageUrl } = req.body;
    if (!name || !ownerType || !ownerId) return res.status(400).json({ error: "name, ownerType, ownerId required" });
    const [created] = await db.insert(products).values({ name, description, price: price || "0", stock: stock || 0, category, ownerType, ownerId, imageUrl }).returning();
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// PUT /api/products/:id
router.put("/products/:id", async (req, res) => {
  try {
    const { id, createdAt, ...data } = req.body;
    const [updated] = await db.update(products).set(data).where(eq(products.id, Number(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// DELETE /api/products/:id
router.delete("/products/:id", async (req, res) => {
  try {
    await db.update(products).set({ active: false }).where(eq(products.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

export default router;

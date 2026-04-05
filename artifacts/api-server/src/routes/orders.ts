import { Router } from "express";
import { db, orders, orderItems } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/orders?pharmacyId=ph1&customerId=1&deliveryId=dc1
router.get("/orders", async (req, res) => {
  try {
    const { pharmacyId, customerId, deliveryId } = req.query as any;
    let query = db.select().from(orders);
    const rows = await query;
    const filtered = rows.filter(o => {
      if (pharmacyId && o.pharmacyId !== pharmacyId) return false;
      if (customerId && String(o.customerId) !== String(customerId)) return false;
      if (deliveryId && o.deliveryId !== deliveryId) return false;
      return true;
    });
    return res.json(filtered);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// GET /api/orders/:id
router.get("/orders/:id", async (req, res) => {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, Number(req.params.id)));
    if (!order) return res.status(404).json({ error: "not found" });
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    return res.json({ ...order, items });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/orders
router.post("/orders", async (req, res) => {
  try {
    const { customerId, pharmacyId, deliveryId, total, address, notes, items } = req.body;
    if (!pharmacyId) return res.status(400).json({ error: "pharmacyId required" });
    const [newOrder] = await db.insert(orders).values({
      customerId, pharmacyId, deliveryId, total: total || "0", address, notes, status: "pending"
    }).returning();
    if (items && Array.isArray(items) && items.length > 0) {
      await db.insert(orderItems).values(items.map((it: any) => ({
        orderId: newOrder.id,
        productId: it.productId,
        qty: it.qty || 1,
        price: it.price || "0",
      })));
    }
    return res.status(201).json(newOrder);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

// PATCH /api/orders/:id/status
router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, Number(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
